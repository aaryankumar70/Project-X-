from pathlib import Path

from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch



MODEL_NAME = "openai/clip-vit-base-patch32"

print("Loading CLIP...")

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME)

print("CLIP loaded.")



image_folder = Path("datasets/images")

image_paths = [
    path
    for path in image_folder.iterdir()
    if path.suffix.lower() in [".jpg", ".jpeg", ".png"]
]

print(f"\nFound {len(image_paths)} images.")



image_embeddings = []

for image_path in image_paths:

    print(f"Processing: {image_path.name}")

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

    embedding = embedding / embedding.norm(
        dim=-1,
        keepdim=True
    )

    image_embeddings.append(embedding)


image_embeddings = torch.cat(image_embeddings, dim=0)

print("\nImage embedding matrix:")
print(image_embeddings.shape)



description = input(
    "\nDescribe the item you lost: "
)




text_inputs = processor(
    text=[description],
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




similarities = image_embeddings @ text_embedding.T

similarities = similarities.squeeze()



ranked_indices = torch.argsort(
    similarities,
    descending=True
)



print("\n======================================")
print("SEARCH RESULTS")
print("======================================")

for rank, index in enumerate(ranked_indices, start=1):

    image_name = image_paths[index].name
    score = similarities[index].item()

    print(
        f"{rank}. {image_name:25} "
        f"Similarity: {score:.4f}"
    )