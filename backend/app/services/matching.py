
from dataclasses import dataclass
from typing import Sequence

import numpy as np

from app.services.metadata import normalize_category, normalize_color


@dataclass(frozen=True)
class FoundItem:
    item_id: str
    embedding: np.ndarray
    category: str = ""
    color: str = ""
    location: str = ""


def cosine_similarity(
    query_embedding: np.ndarray,
    item_embedding: np.ndarray,
) -> float:
    query = np.asarray(query_embedding, dtype=np.float32).reshape(-1)
    item = np.asarray(item_embedding, dtype=np.float32).reshape(-1)

    if query.shape != item.shape:
        raise ValueError("Query and item embeddings must have equal dimensions.")

    q_norm = np.linalg.norm(query)
    i_norm = np.linalg.norm(item)

    if q_norm == 0 or i_norm == 0:
        raise ValueError("Embeddings must not be zero vectors.")

    return float(np.dot(query, item) / (q_norm * i_norm))


def rank_candidates(
    query_embedding: np.ndarray,
    items: Sequence[FoundItem],
    *,
    category: str = "",
    color: str = "",
    location: str = "",
    top_k: int = 4,
) -> dict:
    """Rank candidates by cosine similarity, with optional metadata filters."""
    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    query = np.asarray(query_embedding, dtype=np.float32).reshape(-1)
    if not items:
        return {
            "candidates": [],
            "top_score": None,
            "score_margin": None,
            "ambiguous": False,
        }

    category_filter = normalize_category(category)
    color_filter = normalize_color(color)
    location_filter = location.strip().casefold()

    scored = []

    for item in items:
        if category_filter and normalize_category(item.category) != category_filter:
            continue

        if color_filter and normalize_color(item.color) != color_filter:
            continue

        if location_filter and item.location.strip().casefold() != location_filter:
            continue

        score = cosine_similarity(query, item.embedding)
        scored.append({
            "item_id": item.item_id,
            "similarity": score,
            "category": item.category,
            "color": item.color,
            "location": item.location,
        })

    scored.sort(key=lambda row: row["similarity"], reverse=True)
    candidates = scored[:top_k]

    if not candidates:
        return {
            "candidates": [],
            "top_score": None,
            "score_margin": None,
            "ambiguous": False,
        }

    top_score = candidates[0]["similarity"]
    margin = (
        top_score - candidates[1]["similarity"]
        if len(candidates) > 1
        else None
    )

    # No threshold is set yet: calibration on a larger validation set
    # is needed before this becomes a production decision.
    return {
        "candidates": candidates,
        "top_score": top_score,
        "score_margin": margin,
        "ambiguous": None,
    }
 