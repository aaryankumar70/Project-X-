import torch
from PIL import Image
from transformers import AutoProcessor, AutoModel


MODEL_NAME = "google/siglip2-base-patch16-512"

print("Loading model...")

processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

model.eval()

print("Model loaded successfully!")

# --------------------------------------------------
# TEST IMAGE
# --------------------------------------------------

image_path = "datasets/images/test_img14.jpeg"

image = Image.open(image_path).convert("RGB")

# --------------------------------------------------
# IMAGE EMBEDDING
# --------------------------------------------------

inputs = processor(
    images=image,
    return_tensors="pt"
)

with torch.no_grad():
    image_output = model.get_image_features(**inputs)

print("\nImage output type:")
print(type(image_output))

print("\nImage output:")
print(image_output)

# --------------------------------------------------
# TEXT EMBEDDING
# --------------------------------------------------

text = ["a pair of black glasses"]

text_inputs = processor(
    text=text,
    padding="max_length",
    return_tensors="pt"
)

with torch.no_grad():
    text_output = model.get_text_features(**text_inputs)

print("\nText output type:")
print(type(text_output))

print("\nText output:")
print(text_output)

print("\nTEST COMPLETE")