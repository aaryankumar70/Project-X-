from pathlib import Path

import pandas as pd
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch



DATASET_PATH = "datasets/items.csv"
IMAGE_FOLDER = Path("datasets/images")

df = pd.read_csv(DATASET_PATH)

print(f"Loaded {len(df)} dataset records.")



MODEL_NAME = "openai/clip-vit-base-patch32"

print("Loading CLIP...")

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME)

print("CLIP loaded.")


image_embeddings = []
valid_rows = []

for _, row in df.iterrows():

    image_path = IMAGE_FOLDER / row["image_id"]

    if not image_path.exists():
        print(f"WARNING: Missing {image_path}")
        continue

    image = Image.open(image_path).convert("RGB")

    inputs = processor(
        images=image,
        return_tensors="pt"
    )

    with torch.no_grad():
        output = model.get_image_features(
            pixel_values=inputs["pixel_values"]
        )

    embedding = output.pooler_output

    # Normalize
    embedding = embedding / embedding.norm(
        dim=-1,
        keepdim=True
    )

    image_embeddings.append(embedding)
    valid_rows.append(row)


image_embeddings = torch.cat(image_embeddings, dim=0)

results_df = pd.DataFrame(valid_rows)

print(f"Created embeddings for {len(results_df)} images.")
print("Embedding matrix:", image_embeddings.shape)



queries = [

    {
        "query": "I lost my backpack",
        "category": "backpackbag"
    },

    {
        "query": "I lost my earpods",
        "category": "earpods"
    },

    {
        "query": "I lost my charger",
        "category": "charger"
    },

    {
        "query": "I lost my glasses",
        "category": "glasses"
    },

    {
        "query": "I lost my smart watch",
        "category": "smart-watch"
    },

    {
        "query": "I lost my journal",
        "category": "journal"
    },

    {
        "query": "I lost my wallet",
        "category": "wallet"
    },

    {
        "query": "I lost my keys",
        "category": "keys"
    },

    {
        "query": "I lost my scissors",
        "category": "scissors"
    },

    {
        "query": "I lost my laptop",
        "category": "laptop"
    },

    {
        "query": "I lost my blue case",
        "category": "case"
    }
]



top1_correct = 0
top3_correct = 0
top5_correct = 0


for test in queries:

    query = test["query"]
    correct_category = test["category"]

    print("\n" + "=" * 60)
    print("QUERY:", query)
    print("CORRECT CATEGORY:", correct_category)
    print("=" * 60)



    text_inputs = processor(
        text=[query],
        return_tensors="pt",
        padding=True
    )

    with torch.no_grad():
        text_output = model.get_text_features(
            input_ids=text_inputs["input_ids"],
            attention_mask=text_inputs["attention_mask"]
        )

    text_embedding = text_output.pooler_output

    text_embedding = text_embedding / text_embedding.norm(
        dim=-1,
        keepdim=True
    )



    similarities = (
        image_embeddings @ text_embedding.T
    ).squeeze()



    ranked_indices = torch.argsort(
        similarities,
        descending=True
    )


    for rank, index in enumerate(
    ranked_indices[:5],
    start=1 
    ):

        index = index.item()

    row = results_df.iloc[index]

    image_name = row["image_id"]
    category = row["category"]
    score = similarities[index].item()

    marker = "✓" if category == correct_category else "✗"

    print(
        f"{rank}. {image_name:20} "
        f"{category:15} "
        f"{score:.4f} {marker}"
    )
    top1_categories = [
        results_df.iloc[index.item()]["category"]
        for index in ranked_indices[:1]
    ]

    top3_categories = [
        results_df.iloc[index.item()]["category"]
        for index in ranked_indices[:3]
    ]

    top5_categories = [
        results_df.iloc[index.item()]["category"]
        for index in ranked_indices[:5]
    ]
    


    if correct_category in top1_categories:
        top1_correct += 1

    if correct_category in top3_categories:
        top3_correct += 1

    if correct_category in top5_categories:
        top5_correct += 1



total = len(queries)

print("\n")
print("=" * 60)
print("FINAL EVALUATION")
print("=" * 60)

print(
    f"Top-1 Accuracy: "
    f"{top1_correct}/{total} "
    f"({top1_correct / total * 100:.2f}%)"
)

print(
    f"Top-3 Accuracy: "
    f"{top3_correct}/{total} "
    f"({top3_correct / total * 100:.2f}%)"
)

print(
    f"Top-5 Accuracy: "
    f"{top5_correct}/{total} "
    f"({top5_correct / total * 100:.2f}%)"
)