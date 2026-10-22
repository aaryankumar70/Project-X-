
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.services.embedding_service import EmbeddingService
from app.services.item_store import ItemStore


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.embedding_service = EmbeddingService()
    app.state.item_store = ItemStore()

    try:
        yield
    finally:
        app.state.embedding_service = None
        app.state.item_store = None


app = FastAPI(
    title="LostAndFoundAI API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router, prefix="/api/v1")
