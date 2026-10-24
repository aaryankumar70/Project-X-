
import torch
from PIL import Image


CATEGORY_OPTIONS = [
    ("earbuds_case", "a wireless earbuds charging case"),
    ("wireless_earbuds", "a pair of wireless earbuds"),
    ("wired_earphones", "a pair of wired earphones"),
    ("headphones", "a pair of over-ear headphones"),
    ("phone", "a smartphone"),
    ("wallet", "a wallet"),
    ("keys", "a set of keys"),
    ("water_bottle", "a water bottle"),
    ("backpack", "a backpack"),
    ("stone", "a stone or rock"),
    ("power_bank", "a portable power bank"),
    ("watch", "a wristwatch"),
    ("glasses", "a pair of eyeglasses"),
    ("book", "a book or notebook"),
    ("pen", "a pen or pencil"),
    ("other", "a small miscellaneous object"),
]

COLOR_OPTIONS = [
    "black", "white", "grey", "silver", "blue", "red",
    "green", "brown", "beige", "pink", "purple", "yellow",
    "orange", "multicolored",
]


def _rank_labels(image, embedding_service, options, prompt_builder):
    """Rank candidate labels using SigLIP2 image-text similarity."""
    processor = embedding_service.processor
    model = embedding_service.model

    image_inputs = processor(images=image, return_tensors="pt")
    text_prompts = [prompt_builder(option) for option in options]
    text_inputs = processor(
        text=text_prompts,
        padding="max_length",
        return_tensors="pt",
    )

    with torch.inference_mode():
        image_output = model.get_image_features(**image_inputs)
        text_output = model.get_text_features(**text_inputs)

        image_vector = embedding_service._normalize(
            image_output.pooler_output
        )
        text_vectors = embedding_service._normalize(
            text_output.pooler_output
        )

        similarities = (text_vectors @ image_vector.T).squeeze(-1)

    ranked_indices = torch.argsort(similarities, descending=True).tolist()

    return [
        {
            "label": options[index],
            "similarity": round(float(similarities[index]), 4),
        }
        for index in ranked_indices[:3]
    ]


def analyze_image(image, embedding_service, caption_service):
    image = image.convert("RGB")

    caption = caption_service.describe_image(image)

    category_ranking = _rank_labels(
        image,
        embedding_service,
        CATEGORY_OPTIONS,
        lambda option: f"a photo of {option[1]}",
    )

    color_ranking = _rank_labels(
        image,
        embedding_service,
        COLOR_OPTIONS,
        lambda color: f"a photo of an item that is {color}",
    )

    return {
        "caption": caption,
        "suggested_category": category_ranking[0]["label"][0],
        "category_candidates": [
            {
                "category": item["label"][0],
                "similarity": item["similarity"],
            }
            for item in category_ranking
        ],
        "suggested_color": color_ranking[0]["label"],
        "color_candidates": [
            {
                "color": item["label"],
                "similarity": item["similarity"],
            }
            for item in color_ranking
        ],
        "requires_user_confirmation": True,
    }
