
import torch
from PIL import Image
from transformers import AutoModelForMultimodalLM, AutoProcessor


MODEL_ID = "Salesforce/blip-image-captioning-base"


class CaptionService:
    def __init__(self):
        print(f"Loading image captioning model: {MODEL_ID}")

        self.processor = AutoProcessor.from_pretrained(MODEL_ID)
        self.model = AutoModelForMultimodalLM.from_pretrained(MODEL_ID)
        self.model.to("cpu")
        self.model.eval()

        print("Image captioning model loaded successfully.")

    @torch.inference_mode()
    def describe_image(self, image: Image.Image) -> str:
        image = image.convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")

        output = self.model.generate(
            **inputs,
            max_new_tokens=40,
            num_beams=3,
        )

        caption = self.processor.batch_decode(
            output,
            skip_special_tokens=True,
        )[0].strip()

        return caption
