from pathlib import Path

import pandas as pd
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModel


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_NAME = "google/siglip2-base-patch16-512"

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATASET_DIR = BASE_DIR / "datasets"
IMAGE_DIR = DATASET_DIR / "images"
CSV_PATH = DATASET_DIR / "items.csv"


# ============================================================
# STRESS TEST QUERIES
# ============================================================

TEST_QUERIES = [

    # =========================
    # CATEGORY RETRIEVAL
    # =========================

    {
        "query": "I lost my bag",
        "type": "CATEGORY_ONLY",
        "expected_category": "backpackbag",
        "expected_image": None
    },

    {
        "query": "I can't find my backpack",
        "type": "CATEGORY_ONLY",
        "expected_category": "backpackbag",
        "expected_image": None
    },

    {
        "query": "my school bag disappeared",
        "type": "CATEGORY_ONLY",
        "expected_category": "backpackbag",
        "expected_image": None
    },

    {
        "query": "I lost my diary",
        "type": "CATEGORY_ONLY",
        "expected_category": "journal",
        "expected_image": None
    },

    {
        "query": "I lost my notebook",
        "type": "CATEGORY_ONLY",
        "expected_category": "journal",
        "expected_image": None
    },


    # =========================
    # TYPO ROBUSTNESS
    # =========================

    {
        "query": "laptpo",
        "type": "TYPO",
        "expected_category": "laptop",
        "expected_image": None
    },

    {
        "query": "earpods",
        "type": "TYPO",
        "expected_category": "earpods",
        "expected_image": None
    },

    {
        "query": "chargerr",
        "type": "TYPO",
        "expected_category": "charger",
        "expected_image": None
    },

    {
        "query": "walet",
        "type": "TYPO",
        "expected_category": "wallet",
        "expected_image": None
    },

    {
        "query": "backpak",
        "type": "TYPO",
        "expected_category": "backpackbag",
        "expected_image": None
    },


    # =========================
    # SHORT QUERIES
    # =========================

    {
        "query": "bag",
        "type": "AMBIGUOUS",
        "expected_category": "backpackbag",
        "expected_image": None
    },

    {
        "query": "watch",
        "type": "CATEGORY_ONLY",
        "expected_category": "smart-watch",
        "expected_image": None
    },

    {
        "query": "charger",
        "type": "CATEGORY_ONLY",
        "expected_category": "charger",
        "expected_image": None
    },

    {
        "query": "wallet",
        "type": "CATEGORY_ONLY",
        "expected_category": "wallet",
        "expected_image": None
    },

    {
        "query": "keys",
        "type": "CATEGORY_ONLY",
        "expected_category": "keys",
        "expected_image": None
    },


    # =========================
    # AMBIGUOUS / LOW INFORMATION
    # =========================

    {
        "query": "something black",
        "type": "AMBIGUOUS",
        "expected_category": None,
        "expected_image": None
    },

    {
        "query": "something I carry books in",
        "type": "AMBIGUOUS",
        "expected_category": "backpackbag",
        "expected_image": None
    },

    {
        "query": "a small thing",
        "type": "NO_INFORMATION",
        "expected_category": None,
        "expected_image": None
    },

    {
        "query": "I lost something",
        "type": "NO_INFORMATION",
        "expected_category": None,
        "expected_image": None
    },

    {
        "query": "I lost it yesterday",
        "type": "NO_INFORMATION",
        "expected_category": None,
        "expected_image": None
    },


    # =========================
    # EXACT ITEM + ATTRIBUTES
    # =========================

    {
        "query": "brown school backpack",
        "type": "EXACT",
        "expected_category": "backpackbag",
        "expected_image": "test_img1.jpg"
    },

    {
        "query": "chocolate colored backpack",
        "type": "EXACT",
        "expected_category": "backpackbag",
        "expected_image": "test_img3.jpeg"
    },

    {
        "query": "grey and black backpack",
        "type": "EXACT",
        "expected_category": "backpackbag",
        "expected_image": "test_img13.jpeg"
    },

    {
        "query": "red journal",
        "type": "EXACT",
        "expected_category": "journal",
        "expected_image": "test_img7.jpeg"
    },

    {
        "query": "dark blue journal",
        "type": "EXACT",
        "expected_category": "journal",
        "expected_image": "test_img11.jpeg"
    },

    {
        "query": "black laptop",
        "type": "EXACT",
        "expected_category": "laptop",
        "expected_image": "test_img12.jpeg"
    },

    {
        "query": "black earbuds",
        "type": "EXACT",
        "expected_category": "earpods",
        "expected_image": "test_img2.jpeg"
    },

    {
        "query": "white charger",
        "type": "EXACT",
        "expected_category": "charger",
        "expected_image": "test_img9.jpeg"
    },

    {
        "query": "blue case",
        "type": "EXACT",
        "expected_category": "case",
        "expected_image": "test_img10.jpeg"
    },

    {
        "query": "tan brown wallet",
        "type": "EXACT",
        "expected_category": "wallet",
        "expected_image": "test_img5.jpeg"
    },
]


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 70)
print("SIGLIP 2 STRESS TEST")
print("=" * 70)

print("\nModel:")
print(MODEL_NAME)

print("\nLoading model...")

processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

model.eval()

device = torch.device("cpu")
model.to(device)

print("Device:", device)


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading dataset...")

if not CSV_PATH.exists():
    raise FileNotFoundError(
        f"Dataset CSV not found:\n{CSV_PATH}"
    )

df = pd.read_csv(CSV_PATH)

print(f"Dataset entries: {len(df)}")

print("\nDataset:")
print(df.to_string(index=False))


# ============================================================
# GENERATE IMAGE EMBEDDINGS
# ============================================================

print("\n" + "=" * 70)
print("GENERATING IMAGE EMBEDDINGS")
print("=" * 70)

image_embeddings = []
valid_rows = []

with torch.no_grad():

    for _, row in df.iterrows():

        image_name = str(row["image_id"])

        image_path = IMAGE_DIR / image_name

        if not image_path.exists():

            print(
                f"WARNING: Image not found: {image_path}"
            )

            continue

        image = Image.open(
            image_path
        ).convert("RGB")

        inputs = processor(
            images=image,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(device)
            for key, value in inputs.items()
        }

        output = model.get_image_features(
            **inputs
        )

        # SigLIP 2 returns BaseModelOutputWithPooling
        embedding = output.pooler_output

        # Normalize embeddings
        embedding = embedding / embedding.norm(
            dim=-1,
            keepdim=True
        )

        image_embeddings.append(
            embedding.squeeze(0)
        )

        valid_rows.append(row)

        print(
            f"Embedded: {image_name}"
        )


if not image_embeddings:
    raise RuntimeError(
        "No images were successfully embedded."
    )


image_embeddings = torch.stack(
    image_embeddings
)

print("\nImage embedding matrix:")
print(image_embeddings.shape)


# ============================================================
# BASIC CHECK
# ============================================================

print("\n" + "=" * 70)
print("SETUP COMPLETE")
print("=" * 70)

print(
    f"\nQueries loaded: {len(TEST_QUERIES)}"
)

print(
    f"Images embedded: {len(valid_rows)}"
)

print(
    "\nNext step: retrieval + stress-test metrics."
)


# ============================================================
# RETRIEVAL FUNCTION
# ============================================================

def retrieve(query, top_k=5):

    # --------------------------------------------------------
    # Convert text query into SigLIP input
    # --------------------------------------------------------

    text_inputs = processor(
        text=[query],
        padding="max_length",
        return_tensors="pt"
    )

    text_inputs = {
        key: value.to(device)
        for key, value in text_inputs.items()
    }

    # --------------------------------------------------------
    # Generate text embedding
    # --------------------------------------------------------

    with torch.no_grad():

        output = model.get_text_features(
            **text_inputs
        )

        text_embedding = output.pooler_output

        # Normalize text embedding
        text_embedding = (
            text_embedding
            / text_embedding.norm(
                dim=-1,
                keepdim=True
            )
        )

        # ----------------------------------------------------
        # Cosine similarity
        # ----------------------------------------------------
        #
        # Because both image and text embeddings are
        # normalized, dot product = cosine similarity.
        #
        # ----------------------------------------------------

        scores = image_embeddings @ text_embedding.T

        scores = scores.squeeze(1)

    # --------------------------------------------------------
    # Sort candidates from highest similarity to lowest
    # --------------------------------------------------------

    sorted_indices = torch.argsort(
        scores,
        descending=True
    )

    results = []

    for rank, index in enumerate(
        sorted_indices[:top_k],
        start=1
    ):

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
# RUN ALL STRESS TEST QUERIES
# ============================================================

print("\n" + "=" * 70)
print("RUNNING ALL STRESS TEST QUERIES")
print("=" * 70)

evaluation_results = []


for test_number, test in enumerate(
    TEST_QUERIES,
    start=1
):

    query = test["query"]
    test_type = test["type"]

    expected_category = test["expected_category"]
    expected_image = test["expected_image"]

    # --------------------------------------------------------
    # Retrieve candidates
    # --------------------------------------------------------

    results = retrieve(
        query,
        top_k=5
    )

    # Safety check
    if len(results) < 3:
        raise RuntimeError(
            f"At least 3 retrieval results are required "
            f"for query: {query}"
        )

    top1 = results[0]
    top2 = results[1]
    top3 = results[2]

    # --------------------------------------------------------
    # Score information
    # --------------------------------------------------------

    top1_score = top1["score"]
    second_score = top2["score"]
    third_score = top3["score"]

    # IMPORTANT:
    #
    # Margin is NOT the third score.
    #
    # Margin = Top-1 score - Top-2 score
    #
    margin = top1_score - second_score

    # --------------------------------------------------------
    # Category evaluation
    # --------------------------------------------------------

    category_top1 = None
    category_top3 = None
    category_top5 = None

    if expected_category is not None:

        category_top1 = (
            top1["category"]
            == expected_category
        )

        category_top3 = any(
            result["category"]
            == expected_category
            for result in results[:3]
        )

        category_top5 = any(
            result["category"]
            == expected_category
            for result in results[:5]
        )

    # --------------------------------------------------------
    # Exact-item evaluation
    # --------------------------------------------------------

    exact_top1 = None

    if expected_image is not None:

        exact_top1 = (
            top1["image_id"]
            == expected_image
        )

    # --------------------------------------------------------
    # Store result
    # --------------------------------------------------------

    evaluation_results.append({

        "test_number":
            test_number,

        "type":
            test_type,

        "query":
            query,

        "expected_category":
            expected_category,

        "expected_image":
            expected_image,

        # -------------------------
        # TOP 1
        # -------------------------

        "top1_image":
            top1["image_id"],

        "top1_category":
            top1["category"],

        "top1_score":
            top1_score,

        # -------------------------
        # TOP 2
        # -------------------------

        "second_image":
            top2["image_id"],

        "second_category":
            top2["category"],

        "second_score":
            second_score,

        # -------------------------
        # TOP 3
        # -------------------------

        "third_image":
            top3["image_id"],

        "third_category":
            top3["category"],

        "third_score":
            third_score,

        # -------------------------
        # MARGIN
        # -------------------------

        "margin":
            margin,

        # -------------------------
        # METRICS
        # -------------------------

        "category_top1":
            category_top1,

        "category_top3":
            category_top3,

        "category_top5":
            category_top5,

        "exact_top1":
            exact_top1,
    })

    # --------------------------------------------------------
    # Print result
    # --------------------------------------------------------

    print("\n" + "-" * 70)

    print(
        f"TEST {test_number}/{len(TEST_QUERIES)}"
    )

    print(
        f"Type: {test_type}"
    )

    print(
        f"Query: {query}"
    )

    print(
        f"\n1. {top1['image_id']:<18}"
        f"{top1['category']:<15}"
        f"{top1['score']:.4f}"
    )

    print(
        f"2. {top2['image_id']:<18}"
        f"{top2['category']:<15}"
        f"{top2['score']:.4f}"
    )

    print(
        f"3. {top3['image_id']:<18}"
        f"{top3['category']:<15}"
        f"{top3['score']:.4f}"
    )

    print(
        f"\nTop-1 score: {top1_score:.4f}"
    )

    print(
        f"Top-2 score: {second_score:.4f}"
    )

    print(
        f"Top-3 score: {third_score:.4f}"
    )

    print(
        f"Margin (Top-1 - Top-2): {margin:.4f}"
    )

    if category_top1 is not None:

        print(
            "Category Top-1:",
            "✓" if category_top1 else "✗"
        )

        print(
            "Category Top-3:",
            "✓" if category_top3 else "✗"
        )

        print(
            "Category Top-5:",
            "✓" if category_top5 else "✗"
        )

    if exact_top1 is not None:

        print(
            "Exact Item Top-1:",
            "✓" if exact_top1 else "✗"
        )


# ============================================================
# OVERALL RESULTS
# ============================================================

print("\n\n" + "=" * 70)
print("STRESS TEST SUMMARY")
print("=" * 70)

results_df = pd.DataFrame(
    evaluation_results
)


# ============================================================
# CATEGORY METRICS
# ============================================================

category_results = results_df[
    results_df["expected_category"].notna()
]

if len(category_results) > 0:

    top1_accuracy = (
        category_results["category_top1"]
        .mean()
        * 100
    )

    top3_accuracy = (
        category_results["category_top3"]
        .mean()
        * 100
    )

    top5_accuracy = (
        category_results["category_top5"]
        .mean()
        * 100
    )

    print("\nCATEGORY RETRIEVAL")

    print(
        f"Top-1: "
        f"{category_results['category_top1'].sum()}"
        f"/{len(category_results)} "
        f"= {top1_accuracy:.2f}%"
    )

    print(
        f"Top-3: "
        f"{category_results['category_top3'].sum()}"
        f"/{len(category_results)} "
        f"= {top3_accuracy:.2f}%"
    )

    print(
        f"Top-5: "
        f"{category_results['category_top5'].sum()}"
        f"/{len(category_results)} "
        f"= {top5_accuracy:.2f}%"
    )


# ============================================================
# EXACT ITEM METRICS
# ============================================================

exact_results = results_df[
    results_df["expected_image"].notna()
]

if len(exact_results) > 0:

    exact_accuracy = (
        exact_results["exact_top1"]
        .mean()
        * 100
    )

    print("\nEXACT ITEM RETRIEVAL")

    print(
        f"Top-1: "
        f"{exact_results['exact_top1'].sum()}"
        f"/{len(exact_results)} "
        f"= {exact_accuracy:.2f}%"
    )


# ============================================================
# MARGIN ANALYSIS
# ============================================================

print("\nMARGIN ANALYSIS")

print(
    f"Average margin: "
    f"{results_df['margin'].mean():.4f}"
)

print(
    f"Median margin: "
    f"{results_df['margin'].median():.4f}"
)

print(
    f"Minimum margin: "
    f"{results_df['margin'].min():.4f}"
)

print(
    f"Maximum margin: "
    f"{results_df['margin'].max():.4f}"
)


# ============================================================
# CLOSEST CANDIDATE CASES
# ============================================================

print("\n" + "=" * 70)
print("CLOSEST / MOST AMBIGUOUS QUERIES")
print("=" * 70)

closest = results_df.sort_values(
    "margin"
).head(10)

for _, row in closest.iterrows():

    print("\nQuery:")
    print(row["query"])

    print(
        f"1. {row['top1_image']} "
        f"({row['top1_score']:.4f})"
    )

    print(
        f"2. {row['second_image']} "
        f"({row['second_score']:.4f})"
    )

    print(
        f"3. {row['third_image']} "
        f"({row['third_score']:.4f})"
    )

    print(
        f"Margin: {row['margin']:.4f}"
    )


# ============================================================
# WRONG CATEGORY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("CATEGORY TOP-1 FAILURES")
print("=" * 70)

failures = results_df[
    results_df["category_top1"] == False
]

if len(failures) == 0:

    print("\nNo category Top-1 failures.")

else:

    for _, row in failures.iterrows():

        print("\nQuery:")
        print(row["query"])

        print(
            f"Expected: "
            f"{row['expected_category']}"
        )

        print(
            f"Predicted: "
            f"{row['top1_category']}"
        )

        print(
            f"Score: "
            f"{row['top1_score']:.4f}"
        )

        print(
            f"Margin: "
            f"{row['margin']:.4f}"
        )


# ============================================================
# EXACT ITEM FAILURES
# ============================================================

print("\n" + "=" * 70)
print("EXACT ITEM TOP-1 FAILURES")
print("=" * 70)

exact_failures = results_df[
    results_df["exact_top1"] == False
]

if len(exact_failures) == 0:

    print("\nNo exact-item failures.")

else:

    for _, row in exact_failures.iterrows():

        print("\nQuery:")
        print(row["query"])

        print(
            f"Expected: "
            f"{row['expected_image']}"
        )

        print(
            f"Predicted: "
            f"{row['top1_image']}"
        )

        print(
            f"Expected category: "
            f"{row['expected_category']}"
        )

        print(
            f"Predicted category: "
            f"{row['top1_category']}"
        )

        print(
            f"Score: "
            f"{row['top1_score']:.4f}"
        )

        print(
            f"Margin: "
            f"{row['margin']:.4f}"
        )


# ============================================================
# SAVE RESULTS
# ============================================================

OUTPUT_PATH = (
    BASE_DIR
    / "datasets"
    / "stress_test_results.csv"
)

results_df.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)

print(
    f"\nResults saved to:\n{OUTPUT_PATH}"
)