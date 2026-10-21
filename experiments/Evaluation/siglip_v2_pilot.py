from pathlib import Path
import pandas as pd
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModel

MODEL_NAME = "google/siglip2-base-patch16-512"
SCRIPT_DIR = Path(__file__).resolve().parent
# Works both from project root and from src/Evaluation/.
BASE_DIR = SCRIPT_DIR
if (SCRIPT_DIR / "src" / "Evaluation").exists():
    BASE_DIR = SCRIPT_DIR
elif SCRIPT_DIR.name == "Evaluation" and SCRIPT_DIR.parent.name == "src":
    BASE_DIR = SCRIPT_DIR.parent.parent

DATASET_DIR = BASE_DIR / "datasets"
IMAGE_DIR = DATASET_DIR / "images"
ITEMS_CSV = BASE_DIR / "datasets/items_v2.csv"
QUERIES_CSV = BASE_DIR / "v2_pilot_queries.csv"
OUTPUT_CSV = BASE_DIR / "v2_pilot_results.csv"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device: {DEVICE}")
print(f"Model: {MODEL_NAME}")

processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME).to(DEVICE)
model.eval()

items = pd.read_csv(ITEMS_CSV).fillna("")
queries = pd.read_csv(QUERIES_CSV).fillna("")

# ---------- image embeddings ----------
image_embeddings = []
valid_items = []

with torch.no_grad():
    for _, row in items.iterrows():
        path = IMAGE_DIR / row["image_id"]
        if not path.exists():
            print(f"WARNING: missing image: {path}")
            continue

        image = Image.open(path).convert("RGB")
        inputs = processor(images=image, return_tensors="pt").to(DEVICE)
        output = model.get_image_features(**inputs)
        emb = output.pooler_output if hasattr(output, "pooler_output") else output
        emb = emb / emb.norm(dim=-1, keepdim=True)
        image_embeddings.append(emb[0].cpu())
        valid_items.append(row.to_dict())

image_embeddings = torch.stack(image_embeddings)
valid_items = pd.DataFrame(valid_items)

# ---------- retrieval ----------
def retrieve(query, top_k=5):
    inputs = processor(
        text=[query],
        padding="max_length",
        truncation=True,
        return_tensors="pt",
    ).to(DEVICE)

    with torch.no_grad():
        output = model.get_text_features(**inputs)
        emb = output.pooler_output if hasattr(output, "pooler_output") else output
        emb = emb / emb.norm(dim=-1, keepdim=True)
        scores = image_embeddings.to(DEVICE) @ emb[0]

    values, indices = torch.topk(scores, k=min(top_k, len(valid_items)))
    results = []
    for score, idx in zip(values.cpu().tolist(), indices.cpu().tolist()):
        row = valid_items.iloc[idx]
        results.append({
            "image_id": row["image_id"],
            "item_id": row["item_id"],
            "category": row["category"],
            "score": score,
        })
    return results

# ---------- evaluation ----------
rows = []

for _, test in queries.iterrows():
    result = retrieve(test["query"], top_k=5)
    top1 = result[0]
    top2 = result[1] if len(result) > 1 else None
    top3 = result[2] if len(result) > 2 else None

    expected_category = test["expected_category"]
    expected_image = test["expected_image"]

    category_top1 = bool(expected_category) and top1["category"] == expected_category
    category_top3 = bool(expected_category) and any(r["category"] == expected_category for r in result[:3])
    category_top5 = bool(expected_category) and any(r["category"] == expected_category for r in result[:5])
    exact_top1 = bool(expected_image) and top1["image_id"] == expected_image

    rows.append({
        "test_number": int(test["test_number"]),
        "type": test["type"],
        "query": test["query"],
        "expected_category": expected_category,
        "expected_image": expected_image,
        "top1_image": top1["image_id"],
        "top1_item": top1["item_id"],
        "top1_category": top1["category"],
        "top1_score": top1["score"],
        "second_image": top2["image_id"] if top2 else "",
        "second_item": top2["item_id"] if top2 else "",
        "second_category": top2["category"] if top2 else "",
        "second_score": top2["score"] if top2 else "",
        "third_image": top3["image_id"] if top3 else "",
        "third_item": top3["item_id"] if top3 else "",
        "third_category": top3["category"] if top3 else "",
        "third_score": top3["score"] if top3 else "",
        "margin": top1["score"] - top2["score"] if top2 else "",
        "category_top1": category_top1,
        "category_top3": category_top3,
        "category_top5": category_top5,
        "exact_top1": exact_top1,
    })

results = pd.DataFrame(rows)
results.to_csv(OUTPUT_CSV, index=False)

# ---------- summary ----------
print("\n========== V2 PILOT SUMMARY ==========")

for metric, col in [
    ("Category Top-1", "category_top1"),
    ("Category Top-3", "category_top3"),
    ("Category Top-5", "category_top5"),
    ("Exact Item Top-1", "exact_top1"),
]:
    subset = results[results["expected_category"] != ""] if "Category" in metric else results[results["expected_image"] != ""]
    if len(subset):
        correct = int(subset[col].sum())
        print(f"{metric}: {correct}/{len(subset)} = {correct / len(subset) * 100:.2f}%")

print("\n========== EXACT ITEM FAILURES ==========")
failures = results[(results["expected_image"] != "") & (~results["exact_top1"])]
if failures.empty:
    print("None")
else:
    for _, r in failures.iterrows():
        print(f"#{int(r.test_number)} {r.query}")
        print(f"  expected: {r.expected_image}")
        print(f"  got:      {r.top1_image} ({r.top1_score:.4f})")
        print(f"  second:   {r.second_image} ({r.second_score:.4f})")
        print(f"  margin:   {r.margin:.4f}")

print("\n========== BACKPACK DISCRIMINATION ==========")
backpack_queries = results[results["expected_category"] == "backpack"]
for _, r in backpack_queries.iterrows():
    print(f"{r.query}")
    print(f"  -> {r.top1_image} ({r.top1_score:.4f}) | {r.second_image} ({r.second_score:.4f}) | margin {r.margin:.4f}")

print(f"\nSaved results to: {OUTPUT_CSV}")
