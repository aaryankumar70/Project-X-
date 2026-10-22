
from dataclasses import dataclass
from threading import Lock

import numpy as np


@dataclass
class StoredItem:
    item_id: str
    description: str
    category: str
    color: str
    location: str
    embedding: np.ndarray


class ItemStore:
    def __init__(self):
        self._items: dict[str, StoredItem] = {}
        self._lock = Lock()

    def add(self, item: StoredItem) -> None:
        with self._lock:
            if item.item_id in self._items:
                raise ValueError(
                    f"Item already exists: {item.item_id}"
                )
            self._items[item.item_id] = item

    def get_all(self) -> list[StoredItem]:
        with self._lock:
            return list(self._items.values())

    def get(self, item_id: str) -> StoredItem | None:
        with self._lock:
            return self._items.get(item_id)

    def count(self) -> int:
        with self._lock:
            return len(self._items)
