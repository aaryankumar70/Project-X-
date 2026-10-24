
from pathlib import Path
from PIL import Image

from app.services.caption_service import CaptionService


image_path = (
    Path(__file__).resolve().parents[2]
    / "datasets"
    / "images"
    / "test_img1.jpg"
)
if not image_path.exists():
    raise FileNotFoundError(f"Test image not found: {image_path}")

image = Image.open(image_path).convert("RGB")

service = CaptionService()

for filename in ["test_img1.jpg", "test_img2.jpeg", "test_img3.jpg"]:
    image_path = (
        Path(__file__).resolve().parents[2]
        / "datasets"
        / "images"
        / filename
    )

    if not image_path.exists():
        print(f"\nSkipping missing image: {filename}")
        continue

    image = Image.open(image_path).convert("RGB")
    caption = service.describe_image(image)

    print(f"\nImage: {filename}")
    print(f"Caption: {caption}")