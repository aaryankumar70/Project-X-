from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch



model_name = "openai/clip-vit-base-patch32"

processor = CLIPProcessor.from_pretrained(model_name)
model = CLIPModel.from_pretrained(model_name)



image = Image.open("datasets/images/test_img1.jpg")



labels = [
    "a wallet",
    "a backpack",
    "a water bottle",
    "a calculator",
    "a pair of headphones",
    "a mobile phone",
    "a pair of glasses",
    "a set of keys"
]


inputs = processor(
    text=labels,
    images=image,
    return_tensors="pt",
    padding=True
)



with torch.no_grad():
    outputs = model(**inputs)



scores = outputs.logits_per_image[0]

probabilities = scores.softmax(dim=0)


for label, probability in zip(labels, probabilities):
    print(f"{label:25} {probability.item() * 100:.2f}%")