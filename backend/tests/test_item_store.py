
import numpy as np
import pytest

from app.services.item_store import ItemStore, StoredItem


def make_item(item_id="item-1"):
    return StoredItem(
        item_id=item_id,
        description="Black backpack with a red patch",
        category="backpack",
        color="black",
        location="Library",
        embedding=np.array([1.0, 0.0, 0.0], dtype=np.float32),
    )


def test_add_and_get_item():
    store = ItemStore()
    item = make_item()

    store.add(item)

    assert store.get(item.item_id) is item
    assert store.count() == 1


def test_get_all_items():
    store = ItemStore()
    store.add(make_item("item-1"))
    store.add(make_item("item-2"))

    assert len(store.get_all()) == 2


def test_duplicate_item_id_is_rejected():
    store = ItemStore()
    store.add(make_item())

    with pytest.raises(ValueError):
        store.add(make_item())


def test_missing_item_returns_none():
    store = ItemStore()

    assert store.get("missing") is None
