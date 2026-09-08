from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch



model_name = "openai/clip-vit-base-patch32"

processor = CLIPProcessor.from_pretrained(model_name)
model = CLIPModel.from_pretrained(model_name)



image = Image.open("datasets/images/test_img1.jpg")



inputs = processor(
    images=image,
    return_tensors="pt"
)

with torch.no_grad():
    image_output = model.get_image_features(**inputs)

image_embedding = image_output.pooler_output

print("Embedding shape:", image_embedding.shape)
print("First 10 values:")
print(image_embedding[0][:10])