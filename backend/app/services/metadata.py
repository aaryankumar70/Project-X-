
import re


CATEGORY_ALIASES = {
    "earbuds": "earbud case",
    "earbud_case": "earbud case",
    "smart-watch": "smartwatch",
    "water_bottle": "water bottle",
    "pencil_case": "pencil case",
}

COLOR_ALIASES = {
    "gray": "grey",
    "grey": "grey",
    "metallic": "silver",
}


def normalize_label(value: str) -> str:
    if not isinstance(value, str):
        return ""

    value = value.strip().lower().replace("_", " ")
    return re.sub(r"\s+", " ", value)


def normalize_category(value: str) -> str:
    label = normalize_label(value)
    return CATEGORY_ALIASES.get(label, label)


def normalize_color(value: str) -> str:
    label = normalize_label(value)
    return COLOR_ALIASES.get(label, label)
