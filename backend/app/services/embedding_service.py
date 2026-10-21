
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, UnidentifiedImageError
from transformers import AutoModel, AutoProcessor


MODEL_ID = "google/siglip2-base-patch16-512"


class EmbeddingService:
    """Load SigLIP2 once and reuse it for image and text embeddings."""

    def __init__(self, model_id: str = MODEL_ID):
        self.device = torch.device("cpu")

        self.processor = AutoProcessor.from_pretrained(model_id)
        self.model = AutoModel.from_pretrained(model_id)
        self.model.to(self.device)
        self.model.eval()

        self.embedding_dimension = (
            self.model.config.vision_config.hidden_size
        )

    @staticmethod
    def _normalize(features: torch.Tensor) -> torch.Tensor:
        return F.normalize(features.float(), p=2, dim=-1)

    @torch.inference_mode()
    def embed_image(self, image_path: str | Path) -> np.ndarray:
        """Return a unit-normalized image embedding."""
        path = Path(image_path)

        if not path.is_file():
            raise FileNotFoundError(f"Image not found: {path}")

        try:
            with Image.open(path) as image:
                image = image.convert("RGB")
                inputs = self.processor(
                    images=image,
                    return_tensors="pt",
                )
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError(f"Cannot read image: {path}") from exc

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        features = self.model.get_image_features(**inputs)
        embedding = self._normalize(features.pooler_output)

        return embedding[0].cpu().numpy().astype(np.float32)

    @torch.inference_mode()
    def embed_text(self, text: str) -> np.ndarray:
        """Return a unit-normalized text embedding."""
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Text description cannot be empty.")

        inputs = self.processor(
            text=[text.strip()],
            padding="max_length",
            return_tensors="pt",
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        features = self.model.get_text_features(**inputs)
        embedding = self._normalize(features.pooler_output)

        return embedding[0].cpu().numpy().astype(np.float32)
