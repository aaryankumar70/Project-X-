
import numpy as np
import pytest

from app.services.metadata import normalize_category, normalize_color
from app.services.matching import FoundItem, cosine_similarity, rank_candidates


def test_metadata_normalization():
    assert normalize_category("water_bottle") == "water bottle"
    assert normalize_category("smart-watch") == "smartwatch"
    assert normalize_color("gray") == "grey"


def test_cosine_similarity_for_unit_vectors():
    a = np.array([1.0, 0.0], dtype=np.float32)
    b = np.array([1.0, 0.0], dtype=np.float32)
    assert cosine_similarity(a, b) == pytest.approx(1.0)


def test_cosine_similarity_rejects_dimension_mismatch():
    with pytest.raises(ValueError):
        cosine_similarity(
            np.array([1.0, 0.0]),
            np.array([1.0, 0.0, 0.0]),
        )


def test_candidates_are_ranked_highest_first():
    items = [
        FoundItem("item-a", np.array([0.0, 1.0]), "wallet", "brown"),
        FoundItem("item-b", np.array([1.0, 0.0]), "wallet", "black"),
        FoundItem("item-c", np.array([0.7, 0.7]), "wallet", "brown"),
    ]

    result = rank_candidates(np.array([1.0, 0.0]), items, top_k=2)

    assert [x["item_id"] for x in result["candidates"]] == [
        "item-b", "item-c"
    ]
    assert result["top_score"] == pytest.approx(1.0)
    assert result["score_margin"] > 0


def test_metadata_filter_can_return_no_matches():
    items = [
        FoundItem("item-a", np.array([1.0, 0.0]), "wallet", "brown")
    ]

    result = rank_candidates(
        np.array([1.0, 0.0]),
        items,
        category="backpack",
    )

    assert result["candidates"] == []
