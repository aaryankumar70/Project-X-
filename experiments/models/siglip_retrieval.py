import torch
import pandas as pd
from PIL import Image
from pathlib import Path
from transformers import AutoProcessor, AutoModel


# ============================================================
# CONFIG
# ============================================================

MODEL_NAME = "google/siglip2-base-patch16-512"

IMAGE_DIR = Path("datasets/images")
CSV_PATH = Path("datasets/items.csv")


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading SigLIP 2...")

processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

model.eval()

print("Model loaded!\n")


# ============================================================
# LOAD DATASET
# ============================================================

df = pd.read_csv(CSV_PATH)

print(f"Found {len(df)} dataset entries.")


# ============================================================
# IMAGE EMBEDDINGS
# ============================================================

image_embeddings = []

print("\nGenerating image embeddings...\n")

for _, row in df.iterrows():

    image_path = IMAGE_DIR / row["image_id"]

    image = Image.open(image_path).convert("RGB")

    inputs = processor(
        images=image,
        return_tensors="pt"
    )

    with torch.no_grad():
        output = model.get_image_features(**inputs)

    embedding = output.pooler_output

    # Normalize for cosine similarity
    embedding = embedding / embedding.norm(
        dim=-1,
        keepdim=True
    )

    image_embeddings.append(embedding)

    print(f"Embedded: {row['image_id']}")


# Convert list → tensor
image_embeddings = torch.cat(image_embeddings, dim=0)

print("\nImage embedding matrix:")
print(image_embeddings.shape)


# ============================================================
# TEST QUERIES
# ============================================================

queries = [
    ("I lost my backpack", "backpackbag"),
    ("I lost my black earpods", "earpods"),
    ("I lost my orange scissors", "scissors"),
    ("I lost my tan brown wallet", "wallet"),
    ("I lost my beige keys", "keys"),
    ("I lost my red journal", "journal"),
    ("I lost my black smart watch", "smart-watch"),
    ("I lost my white charger", "charger"),
    ("I lost my blue case", "case"),
    ("I lost my dark blue journal", "journal"),
    ("I lost my black laptop", "laptop"),
]


# ============================================================
# RETRIEVAL
# ============================================================

top1_correct = 0
top3_correct = 0
top5_correct = 0


for query, expected_category in queries:

    print("\n" + "=" * 70)
    print(f"QUERY: {query}")
    print(f"EXPECTED CATEGORY: {expected_category}")
    print("=" * 70)

    # --------------------------------------------------------
    # Text embedding
    # --------------------------------------------------------

    text_inputs = processor(
        text=[query],
        padding="max_length",
        return_tensors="pt"
    )

    with torch.no_grad():
        text_output = model.get_text_features(**text_inputs)

    text_embedding = text_output.pooler_output

    # Normalize
    text_embedding = text_embedding / text_embedding.norm(
        dim=-1,
        keepdim=True
    )

    # --------------------------------------------------------
    # Similarity
    # --------------------------------------------------------

    similarities = image_embeddings @ text_embedding.T

    similarities = similarities.squeeze(1)

    # Sort highest → lowest
    sorted_indices = torch.argsort(
        similarities,
        descending=True
    )

    # --------------------------------------------------------
    # Top 5
    # --------------------------------------------------------

    for rank, index in enumerate(sorted_indices[:5], start=1):

        index = index.item()

        image_id = df.iloc[index]["image_id"]
        category = df.iloc[index]["category"]
        color = df.iloc[index]["color"]
        score = similarities[index].item()

        correct = "✓" if category == expected_category else "✗"

        print(
            f"{rank}. "
            f"{image_id:<15} "
            f"{category:<15} "
            f"{color:<12} "
            f"{score:.4f} "
            f"{correct}"
        )

    # --------------------------------------------------------
    # Accuracy
    # --------------------------------------------------------

    top5_indices = sorted_indices[:5].tolist()

    categories = [
        df.iloc[i]["category"]
        for i in top5_indices
    ]

    if categories[0] == expected_category:
        top1_correct += 1

    if expected_category in categories[:3]:
        top3_correct += 1

    if expected_category in categories[:5]:
        top5_correct += 1


# ============================================================
# FINAL RESULTS
# ============================================================

total = len(queries)

print("\n\n")
print("=" * 70)
print("SIGLIP 2 RETRIEVAL RESULTS")
print("=" * 70)

print(
    f"Top-1 Accuracy: "
    f"{top1_correct}/{total} "
    f"= {top1_correct / total * 100:.2f}%"
)

print(
    f"Top-3 Accuracy: "
    f"{top3_correct}/{total} "
    f"= {top3_correct / total * 100:.2f}%"
)

print(
    f"Top-5 Accuracy: "
    f"{top5_correct}/{total} "
    f"= {top5_correct / total * 100:.2f}%"
)

print("=" * 70)