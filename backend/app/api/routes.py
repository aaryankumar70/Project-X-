
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from app.services.item_store import StoredItem

router = APIRouter()


class TextEmbeddingRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


@router.get("/health")
def health(request: Request):
    return {
        "status": "ok",
        "model_loaded": getattr(
            request.app.state, "embedding_service", None
        ) is not None,
    }


@router.post("/embeddings/text")
def create_text_embedding(
    payload: TextEmbeddingRequest,
    request: Request,
):
    service = getattr(request.app.state, "embedding_service", None)

    if service is None:
        raise HTTPException(
            status_code=503,
            detail="Embedding model is not available.",
        )

    try:
        embedding = service.embed_text(payload.text)
        return {
            "dimension": int(embedding.shape[0]),
            "embedding": embedding.tolist(),
        }
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/items/found", status_code=201)
async def register_found_item(
    request: Request,
    description: str = Form(..., min_length=1, max_length=2000),
    category: str = Form(..., min_length=1, max_length=100),
    color: str = Form(..., min_length=1, max_length=100),
    location: str = Form(..., min_length=1, max_length=200),
    photo: UploadFile = File(...),
):
    embedding_service = getattr(
        request.app.state, "embedding_service", None
    )
    item_store = getattr(request.app.state, "item_store", None)

    if embedding_service is None or item_store is None:
        raise HTTPException(
            status_code=503,
            detail="The item registration service is unavailable.",
        )

    # Validate the uploaded image without trusting its filename.
    if photo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPEG, PNG, or WebP image.",
        )

    # Limit uploads to 8 MB.
    max_bytes = 8 * 1024 * 1024
    image_bytes = await photo.read(max_bytes + 1)

    if not image_bytes:
        raise HTTPException(status_code=400, detail="The photo is empty.")

    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail="Photo exceeds the 8 MB limit.",
        )

    # Use PIL to validate and decode the actual image contents.
    import io
    from PIL import Image, UnidentifiedImageError

    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            image.verify()

        with Image.open(io.BytesIO(image_bytes)) as image:
            image = image.convert("RGB")
            image.load()
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail="The uploaded file is not a valid supported image.",
        ) from exc

    # Embed the validated image and keep the normalized RGB image in memory.
    try:
        import numpy as np
        import torch

        inputs = embedding_service.processor(
            images=image, return_tensors="pt"
        )

        with torch.inference_mode():
            features = embedding_service.model.get_image_features(**inputs)
            vector = embedding_service._normalize(
                features.pooler_output
            )[0].cpu().numpy().astype(np.float32)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not generate an embedding for this photo.",
        ) from exc

    item_id = str(uuid4())

    item = StoredItem(
        item_id=item_id,
        description=description.strip(),
        category=category.strip(),
        color=color.strip(),
        location=location.strip(),
        embedding=vector,
    )

    try:
        item_store.add(item)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return {
        "item_id": item.item_id,
        "status": "registered",
        "category": item.category,
        "color": item.color,
        "location": item.location,
        "embedding_dimension": int(vector.shape[0]),
    }
 
from app.services.matching import FoundItem, rank_candidates


class LostItemSearchRequest(BaseModel):
    description: str = Field(min_length=1, max_length=2000)
    category: str = Field(default="", max_length=100)
    color: str = Field(default="", max_length=100)
    location: str = Field(default="", max_length=200)
    top_k: int = Field(default=4, ge=1, le=10)


@router.post("/items/search")
def search_lost_item(
    payload: LostItemSearchRequest,
    request: Request,
):
    embedding_service = getattr(
        request.app.state, "embedding_service", None
    )
    item_store = getattr(request.app.state, "item_store", None)

    if embedding_service is None or item_store is None:
        raise HTTPException(
            status_code=503,
            detail="The search service is unavailable.",
        )

    # Convert the lost-item description into a text embedding.
    try:
        query_embedding = embedding_service.embed_text(payload.description)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Adapt stored records to the interface expected by the matcher.
    stored_items = item_store.get_all()
    candidates = [
        FoundItem(
            item_id=item.item_id,
            embedding=item.embedding,
            category=item.category,
            color=item.color,
            location=item.location,
        )
        for item in stored_items
    ]

    try:
        results = rank_candidates(
            query_embedding,
            candidates,
            category=payload.category,
            color=payload.color,
            location=payload.location,
            top_k=payload.top_k,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return {
        "query": payload.description,
        "total_items_searched": len(stored_items),
        "results": results["candidates"],
        "top_score": results["top_score"],
        "score_margin": results["score_margin"],
        "ambiguous": results["ambiguous"],
    }
