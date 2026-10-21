
import sys
from pathlib import Path

import numpy as np

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.services.embedding_service import EmbeddingService
from app.services.matching import cosine_similarity


PROJECT_ROOT = Path(__file__).resolve().parents[2]
IMAGE_DIR = PROJECT_ROOT / "datasets" / "images"


def main():
    images = sorted(
        path
        for path in IMAGE_DIR.iterdir()
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )

    if not images:
        raise FileNotFoundError(
            f"No supported images found in {IMAGE_DIR}"
        )

    print("Loading SigLIP2 on CPU...")
    service = EmbeddingService()

    print(f"Model loaded. Expected dimension: {service.embedding_dimension}")

    image_embedding = service.embed_image(images[0])
    text_embedding = service.embed_text(
        "A personal item that someone may have lost on campus."
    )

    for name, embedding in (
        ("Image", image_embedding),
        ("Text", text_embedding),
    ):
        assert embedding.shape == (768,), (
            f"{name} embedding has unexpected shape: {embedding.shape}"
        )
        assert embedding.dtype == np.float32
        assert np.isfinite(embedding).all()
        assert np.isclose(np.linalg.norm(embedding), 1.0, atol=1e-5)

        print(
            f"{name} embedding: shape={embedding.shape}, "
            f"norm={np.linalg.norm(embedding):.6f}"
        )

    similarity = cosine_similarity(image_embedding, text_embedding)

    assert np.isfinite(similarity)
    assert -1.0001 <= similarity <= 1.0001

    print(f"Image/text cosine similarity: {similarity:.4f}")
    print("PASS: real image and text embeddings work.")


def pytest_approx_one():
    # A small numerical tolerance for float32 normalization.
    return 1.0


if __name__ == "__main__":
    main()
