from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch



model_name = "openai/clip-vit-base-patch32"

processor = CLIPProcessor.from_pretrained(model_name)
model = CLIPModel.from_pretrained(model_name)



image = Image.open("datasets/images/test_img1.jpg")


descriptions = [
    "a backpack",
    "a black backpack",
    "a school backpack",
    "a black backpack with a laptop compartment",
    "a red wallet",
    "a pair of headphones",
    "a water bottle"
]



inputs = processor(
    text=descriptions,
    images=image,
    return_tensors="pt",
    padding=True
)

with torch.no_grad():
    image_output = model.get_image_features(
        pixel_values=inputs["pixel_values"]
    )

    text_output = model.get_text_features(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"]
    )


image_embedding = image_output.pooler_output
text_embedding = text_output.pooler_output



image_embedding = image_embedding / image_embedding.norm(
    dim=-1, keepdim=True
)

text_embedding = text_embedding / text_embedding.norm(
    dim=-1, keepdim=True
)



similarities = image_embedding @ text_embedding.T


for description, score in zip(descriptions, similarities[0]):
    print(f"{score.item():.4f}  |  {description}")