import os
from pathlib import Path

import pandas as pd
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModel


# ============================================================
# CONFIG
# ============================================================

MODEL_NAME = "google/siglip2-base-patch16-512"

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"
IMAGE_DIR = DATASET_DIR / "images"
CSV_PATH = DATASET_DIR / "items.csv"

# ============================================================
# ADVERSARIAL TEST QUERIES
# ============================================================
#
# category = expected category
#
# expected_image:
#   Use this when we know the exact physical image that should
#   win.
#
# None means we are only testing category retrieval.
#
# ============================================================

TEST_QUERIES = [

    # --------------------------------------------------------
    # MESSY / NATURAL LANGUAGE
    # --------------------------------------------------------

    {
        "query": "my laptop is missing",
        "category": "laptop",
        "expected_image": "test_img12.jpeg",
    },

    {
        "query": "I lost my bag near the library",
        "category": "backpackbag",
        "expected_image": None,
    },

    {
        "query": "black earbud case",
        "category": "earpods",
        "expected_image": "test_img2.jpeg",
    },

    {
        "query": "my watch",
        "category": "smart-watch",
        "expected_image": "test_img8.jpeg",
    },

    {
        "query": "charger",
        "category": "charger",
        "expected_image": "test_img9.jpeg",
    },

    {
        "query": "brown school bag",
        "category": "backpackbag",
        "expected_image": "test_img1.jpg",
    },

    {
        "query": "my red book",
        "category": "journal",
        "expected_image": "test_img7.jpeg",
    },

    {
        "query": "I lost something yesterday",
        "category": None,
        "expected_image": None,
    },

    # --------------------------------------------------------
    # ATTRIBUTE DISCRIMINATION
    # --------------------------------------------------------

    {
        "query": "I lost my brown backpack",
        "category": "backpackbag",
        "expected_image": "test_img1.jpg",
    },

    {
        "query": "I lost my chocolate backpack",
        "category": "backpackbag",
        "expected_image": "test_img3.jpeg",
    },

    {
        "query": "I lost my grey black backpack",
        "category": "backpackbag",
        "expected_image": "test_img13.jpeg",
    },

    {
        "query": "I lost my red journal",
        "category": "journal",
        "expected_image": "test_img7.jpeg",
    },

    {
        "query": "I lost my dark blue journal",
        "category": "journal",
        "expected_image": "test_img11.jpeg",
    },

    # --------------------------------------------------------
    # MORE REALISTIC CAMPUS LANGUAGE
    # --------------------------------------------------------

    {
        "query": "my black laptop from class",
        "category": "laptop",
        "expected_image": "test_img12.jpeg",
    },

    {
        "query": "I think I lost my brown bag",
        "category": "backpackbag",
        "expected_image": "test_img1.jpg",
    },

    {
        "query": "small black thing for listening to music",
        "category": "earpods",
        "expected_image": "test_img2.jpeg",
    },

    {
        "query": "the blue case I lost",
        "category": "case",
        "expected_image": "test_img10.jpeg",
    },

    {
        "query": "my white charging thing",
        "category": "charger",
        "expected_image": "test_img9.jpeg",
    },

    {
        "query": "tan brown wallet",
        "category": "wallet",
        "expected_image": "test_img5.jpeg",
    },

    {
        "query": "beige colored keys",
        "category": "keys",
        "expected_image": "test_img6.jpeg",
    },
]


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 70)
print("SIGLIP 2 ADVERSARIAL EVALUATION")
print("=" * 70)

print("\nLoading model:")
print(MODEL_NAME)

processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

model.eval()

device = torch.device("cpu")
model.to(device)

print("Device:", device)


# ============================================================
# LOAD DATASET
# ============================================================

if not CSV_PATH.exists():
    raise FileNotFoundError(
        f"\nCould not find dataset CSV:\n{CSV_PATH}\n"
    )

df = pd.read_csv(CSV_PATH)

print("\nDataset entries:", len(df))

print("\nDataset:")
print(df.to_string(index=False))


# ============================================================
# IMAGE EMBEDDINGS
# ============================================================

image_embeddings = []
valid_rows = []

print("\n" + "=" * 70)
print("GENERATING IMAGE EMBEDDINGS")
print("=" * 70)

with torch.no_grad():

    for _, row in df.iterrows():

        image_name = str(row["image_id"])
        image_path = IMAGE_DIR / image_name

        if not image_path.exists():
            print(f"WARNING: Image not found: {image_path}")
            continue

        try:
            image = Image.open(image_path).convert("RGB")

            inputs = processor(
                images=image,
                return_tensors="pt"
            )

            inputs = {
                key: value.to(device)
                for key, value in inputs.items()
            }

            output = model.get_image_features(**inputs)

            # SigLIP 2 returns BaseModelOutputWithPooling
            embedding = output.pooler_output

            # Normalize for cosine similarity
            embedding = embedding / embedding.norm(
                dim=-1,
                keepdim=True
            )

            image_embeddings.append(
                embedding.squeeze(0)
            )

            valid_rows.append(row)

            print(f"Embedded: {image_name}")

        except Exception as e:
            print(f"ERROR processing {image_name}: {e}")


if not image_embeddings:
    raise RuntimeError("No images were successfully embedded.")


image_embeddings = torch.stack(image_embeddings)

print("\nImage embedding matrix:")
print(image_embeddings.shape)


# ============================================================
# RETRIEVAL FUNCTION
# ============================================================

def retrieve(query, top_k=5):

    text_inputs = processor(
        text=[query],
        padding="max_length",
        return_tensors="pt"
    )

    text_inputs = {
        key: value.to(device)
        for key, value in text_inputs.items()
    }

    with torch.no_grad():

        output = model.get_text_features(**text_inputs)

        text_embedding = output.pooler_output

        text_embedding = text_embedding / text_embedding.norm(
            dim=-1,
            keepdim=True
        )

        # Cosine similarity because embeddings are normalized
        scores = image_embeddings @ text_embedding.T

        scores = scores.squeeze(1)

    sorted_indices = torch.argsort(
        scores,
        descending=True
    )

    results = []

    for rank, index in enumerate(sorted_indices, start=1):

        row = valid_rows[index]

        results.append({
            "rank": rank,
            "image_id": str(row["image_id"]),
            "category": str(row["category"]),
            "color": str(row["color"]),
            "score": float(scores[index]),
        })

    return results


# ============================================================
# EVALUATION
# ============================================================

category_tests = []
exact_tests = []

all_margins = []

print("\n" + "=" * 70)
print("RUNNING ADVERSARIAL QUERIES")
print("=" * 70)


for test_number, test in enumerate(TEST_QUERIES, start=1):

    query = test["query"]
    expected_category = test["category"]
    expected_image = test["expected_image"]

    results = retrieve(query, top_k=5)

    top1 = results[0]
    top2 = results[1]

    margin = top1["score"] - top2["score"]

    all_margins.append(margin)

    print("\n" + "-" * 70)
    print(f"TEST {test_number}")
    print("-" * 70)

    print("QUERY:")
    print(query)

    print("\nEXPECTED CATEGORY:")
    print(expected_category)

    print("\nEXPECTED IMAGE:")
    print(expected_image)

    print("\nTOP CANDIDATES:")

    for result in results:

        if expected_category is not None:
            category_match = (
                result["category"] == expected_category
            )
        else:
            category_match = False

        if expected_image is not None:
            exact_match = (
                result["image_id"] == expected_image
            )
        else:
            exact_match = False

        category_mark = "CATEGORY ✓" if category_match else ""

        exact_mark = "EXACT ✓" if exact_match else ""

        print(
            f"{result['rank']}. "
            f"{result['image_id']:<18} "
            f"{result['category']:<14} "
            f"{result['color']:<12} "
            f"{result['score']:.4f} "
            f"{category_mark} "
            f"{exact_mark}"
        )

    print("\nSCORE ANALYSIS")

    print(f"Top score:       {top1['score']:.4f}")
    print(f"Second score:    {top2['score']:.4f}")
    print(f"Margin (S1-S2):  {margin:.4f}")

    # --------------------------------------------------------
    # Category metrics
    # --------------------------------------------------------

    if expected_category is not None:

        top3_categories = [
            r["category"]
            for r in results[:3]
        ]

        top5_categories = [
            r["category"]
            for r in results[:5]
        ]

        category_top1 = (
            top1["category"] == expected_category
        )

        category_top3 = (
            expected_category in top3_categories
        )

        category_top5 = (
            expected_category in top5_categories
        )

        category_tests.append({
            "query": query,
            "top1": category_top1,
            "top3": category_top3,
            "top5": category_top5,
        })

    # --------------------------------------------------------
    # Exact item metric
    # --------------------------------------------------------

    if expected_image is not None:

        exact_top1 = (
            top1["image_id"] == expected_image
        )

        exact_tests.append({
            "query": query,
            "expected": expected_image,
            "predicted": top1["image_id"],
            "correct": exact_top1,
        })


# ============================================================
# FINAL METRICS
# ============================================================

print("\n\n" + "=" * 70)
print("FINAL ADVERSARIAL RESULTS")
print("=" * 70)


# ------------------------------------------------------------
# Category accuracy
# ------------------------------------------------------------

if category_tests:

    category_top1 = sum(
        x["top1"]
        for x in category_tests
    )

    category_top3 = sum(
        x["top3"]
        for x in category_tests
    )

    category_top5 = sum(
        x["top5"]
        for x in category_tests
    )

    total_category = len(category_tests)

    print("\nCATEGORY RETRIEVAL")

    print(
        f"Top-1: "
        f"{category_top1}/{total_category} "
        f"= {category_top1 / total_category * 100:.2f}%"
    )

    print(
        f"Top-3: "
        f"{category_top3}/{total_category} "
        f"= {category_top3 / total_category * 100:.2f}%"
    )

    print(
        f"Top-5: "
        f"{category_top5}/{total_category} "
        f"= {category_top5 / total_category * 100:.2f}%"
    )


# ------------------------------------------------------------
# Exact item accuracy
# ------------------------------------------------------------

if exact_tests:

    exact_correct = sum(
        x["correct"]
        for x in exact_tests
    )

    total_exact = len(exact_tests)

    print("\nEXACT ITEM RETRIEVAL")

    print(
        f"Top-1: "
        f"{exact_correct}/{total_exact} "
        f"= {exact_correct / total_exact * 100:.2f}%"
    )


# ------------------------------------------------------------
# Margin statistics
# ------------------------------------------------------------

if all_margins:

    margin_tensor = torch.tensor(all_margins)

    print("\nSCORE MARGIN ANALYSIS")

    print(
        f"Minimum margin:  {margin_tensor.min():.4f}"
    )

    print(
        f"Maximum margin:  {margin_tensor.max():.4f}"
    )

    print(
        f"Average margin:  {margin_tensor.mean():.4f}"
    )

    print(
        f"Median margin:   {margin_tensor.median():.4f}"
    )


# ============================================================
# FIND CLOSE / AMBIGUOUS CASES
# ============================================================

print("\n" + "=" * 70)
print("CLOSE-CANDIDATE ANALYSIS")
print("=" * 70)

print(
    "\nThese are NOT failures automatically."
    "\nThey are queries where the top two candidates"
    "\nwere relatively close."
)

sorted_margins = sorted(
    enumerate(all_margins),
    key=lambda x: x[1]
)

for index, margin in sorted_margins[:5]:

    query = TEST_QUERIES[index]["query"]

    results = retrieve(query, top_k=2)

    print("\nQuery:", query)

    print(
        f"1. {results[0]['image_id']} "
        f"({results[0]['score']:.4f})"
    )

    print(
        f"2. {results[1]['image_id']} "
        f"({results[1]['score']:.4f})"
    )

    print(
        f"Margin: {margin:.4f}"
    )


# ============================================================
# IMPORTANT NOTE
# ============================================================

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)

print("""
IMPORTANT:

These scores are NOT percentages.

Cosine similarity tells us how close the
image and text embeddings are.

The margin:

    Top Score - Second Score

is useful for studying whether the model
has a clear winner or is uncertain.

We are deliberately NOT defining a fixed
confidence threshold yet.

We need more evaluation data first.
""")