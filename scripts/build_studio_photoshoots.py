import os
import requests
import json
import re
from io import BytesIO
from PIL import Image
from rembg import remove

os.makedirs("public/products/packshots", exist_ok=True)

HEADERS = {
    'User-Agent': 'G1Mart-StoreStudio/2.0 (supermarket@g1mart.com)'
}

def clean_and_save_studio_shot(image_url, base_filename):
    """
    Downloads image, removes background using AI (rembg), 
    centers it on a 600x600 pure white (#FFFFFF) studio canvas with 10% padding,
    and saves both transparent PNG and pure white JPEG.
    """
    try:
        resp = requests.get(image_url, headers=HEADERS, timeout=12)
        if resp.status_code != 200 or len(resp.content) < 2000:
            print(f"Failed to download {image_url}: status {resp.status_code}")
            return False

        img = Image.open(BytesIO(resp.content)).convert("RGBA")
        
        # Remove background with AI
        cutout = remove(img)

        # Get bounding box of non-transparent content to crop out dead space
        bbox = cutout.getbbox()
        if bbox:
            cutout = cutout.crop(bbox)

        # Create 600x600 canvas
        target_size = (600, 600)
        max_dim = 500  # allow 50px padding on each side

        # Resize preserving aspect ratio
        w, h = cutout.size
        scale = min(max_dim / w, max_dim / h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        resized_cutout = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Transparent PNG version
        trans_canvas = Image.new("RGBA", target_size, (255, 255, 255, 0))
        offset = ((target_size[0] - new_w) // 2, (target_size[1] - new_h) // 2)
        trans_canvas.paste(resized_cutout, offset, resized_cutout)
        png_path = f"public/products/packshots/{base_filename}.png"
        trans_canvas.save(png_path, "PNG", optimize=True)

        # Pure white JPEG version
        white_canvas = Image.new("RGBA", target_size, (255, 255, 255, 255))
        white_canvas.paste(resized_cutout, offset, resized_cutout)
        jpg_path = f"public/products/packshots/{base_filename}.jpg"
        white_canvas.convert("RGB").save(jpg_path, "JPEG", quality=92, optimize=True)

        print(f"✓ Saved studio packshot: {base_filename} (PNG & JPG)")
        return True
    except Exception as e:
        print(f"Error processing {base_filename} from {image_url}: {e}")
        return False

# Target product searches on Open Food Facts & Open Beauty Facts
TARGET_PRODUCTS = [
    # Grains, Atta, Salt
    ("aashirvaad-atta", "https://images.openfoodfacts.org/images/products/890/172/501/6838/front_en.7.400.jpg"),
    ("aashirvaad-salt", "https://images.openfoodfacts.org/images/products/890/172/512/3123/front_en.13.400.jpg"),
    ("tata-salt", "https://images.openfoodfacts.org/images/products/890/105/885/1241/front_en.16.400.jpg"),
    ("maggi-noodles", "https://images.openfoodfacts.org/images/products/890/105/886/2261/front_en.36.400.jpg"),
    ("parle-g", "https://images.openfoodfacts.org/images/products/890/171/913/4845/front_en.11.400.jpg"),
    ("good-day", "https://images.openfoodfacts.org/images/products/890/106/309/3522/front_en.28.400.jpg"),
    ("britannia-bourbon", "https://images.openfoodfacts.org/images/products/890/106/313/9329/front_en.14.400.jpg"),
    ("lays-magic-masala", "https://images.openfoodfacts.org/images/products/890/149/110/1844/front_en.32.400.jpg"),
    ("lays-classic-salted", "https://images.openfoodfacts.org/images/products/890/149/110/1837/front_en.26.400.jpg"),
    ("cadbury-dairy-milk", "https://images.openfoodfacts.org/images/products/762/220/174/7169/front_en.18.400.jpg"),
    ("cadbury-5-star", "https://images.openfoodfacts.org/images/products/890/123/302/4042/front_en.40.400.jpg"),
    ("surf-excel", "https://images.openfoodfacts.org/images/products/890/103/086/5169/front_en.9.400.jpg"),
    
    # Personal Care (Open Beauty Facts)
    ("mysore-sandal-soap", "https://images.openbeautyfacts.org/images/products/890/128/710/0013/front_en.11.400.jpg"),
    ("santoor-soap", "https://images.openbeautyfacts.org/images/products/890/139/904/9101/front_en.3.400.jpg"),
    ("cinthol-soap", "https://images.openbeautyfacts.org/images/products/890/102/300/0034/front_en.8.400.jpg"),
    ("pears-soap", "https://images.openbeautyfacts.org/images/products/890/103/076/6947/front_en.12.400.jpg"),
    ("dove-soap", "https://images.openbeautyfacts.org/images/products/890/103/083/3960/front_en.3.400.jpg"),
    ("dettol-soap", "https://images.openbeautyfacts.org/images/products/890/139/632/4584/front_en.9.400.jpg"),
    ("lifebuoy-soap", "https://images.openbeautyfacts.org/images/products/890/103/081/3252/front_en.3.400.jpg"),
    ("colgate-strong-teeth", "https://images.openbeautyfacts.org/images/products/890/131/401/0520/front_en.3.400.jpg"),
    ("parachute-coconut-oil", "https://images.openbeautyfacts.org/images/products/890/108/800/8723/front_en.10.400.jpg"),
]

print(f"Starting batch studio photoshoot processing for {len(TARGET_PRODUCTS)} core items...")
for name, url in TARGET_PRODUCTS:
    clean_and_save_studio_shot(url, name)
