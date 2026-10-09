import os
import sys
import glob
from PIL import Image, ImageFilter, ImageDraw
import rembg

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BRAIN_DIR = r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\6c1167e1-7345-4ba5-9416-e8b21fbd060f"
BASE_DIR = r"d:\web-agency-projects\G1mart"
OUT_DIR = os.path.join(BASE_DIR, "public", "categories", "collages")
os.makedirs(OUT_DIR, exist_ok=True)

# Mapping of file prefix to category ID
TILE_MAP = {
    "vegetables_fruits_tile": "vegetables-fruits",
    "dry_fruits_cereal_tile": "dry-fruits-cereals",
    "surface_cleaners_tile": "floor-surface-cleaners",
    "pooja_needs_tile": "pooja-needs",
    "kitchenware_tile": "kitchenware",
    "skin_care_tile": "skin-care",
    "oil_masala_tile": "oil-ghee-masala",
    "chips_namkeen_tile": "chips-namkeen",
    "instant_food_tile": "instant-food",
    "tea_coffee_tile": "tea-coffee-milk-drinks",
    "oral_care_tile": "oral-care",
    "hair_care_tile": "hair-care",
    "baby_care_tile": "baby-care",
    "hygiene_tile": "hygiene",
}

def create_ground_shadow(width, height=14, opacity=60):
    shadow = Image.new('RGBA', (int(width * 1.25), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.45), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=6))

def center_canvas_vertically(canvas):
    bbox = canvas.getbbox()
    if not bbox:
        return canvas
    content_h = bbox[3] - bbox[1]
    target_y = (400 - content_h) // 2
    shift_y = target_y - bbox[1]
    centered = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    centered.paste(canvas, (0, shift_y), canvas)
    return centered

def process_tile(session, img_path, cid):
    print(f"Processing {cid} from {os.path.basename(img_path)}...")
    raw = Image.open(img_path).convert('RGB')
    
    # 1. Background removal
    cutout = rembg.remove(raw, session=session)
    bbox = cutout.getbbox()
    if not bbox:
        print(f"  ERROR: No content after rembg for {cid}")
        return False
    cropped = cutout.crop(bbox)
    
    # 2. Scale within max_w=330, max_h=280
    max_w, max_h = 330, 280
    scale = min(max_w / cropped.width, max_h / cropped.height)
    new_w = max(10, int(cropped.width * scale))
    new_h = max(10, int(cropped.height * scale))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 3. Canvas composition (400x400)
    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 350
    start_x = (400 - new_w) // 2
    start_y = y_base - new_h
    
    # Add soft grounded contact shadow
    shadow = create_ground_shadow(new_w, height=14, opacity=55)
    sh_x = start_x + (new_w - shadow.width) // 2
    sh_y = y_base - shadow.height // 2
    canvas.paste(shadow, (sh_x, sh_y), shadow)
    
    # Paste product cutout
    canvas.paste(resized, (start_x, start_y), resized)
    
    # 4. Center vertically
    canvas = center_canvas_vertically(canvas)
    
    # 5. Save as WebP
    out_path = os.path.join(OUT_DIR, f"{cid}.webp")
    canvas.save(out_path, "WEBP", quality=92)
    print(f"  [OK] Saved {cid}.webp (size: {canvas.size}, bbox: {canvas.getbbox()})")
    return True

def main():
    print("Initializing rembg session...")
    session = rembg.new_session("u2net")
    print("Session ready. Scanning images...")
    
    for prefix, cid in TILE_MAP.items():
        pattern = os.path.join(BRAIN_DIR, f"{prefix}_*.jpg")
        matches = glob.glob(pattern)
        if not matches:
            print(f"WARNING: No file found for {prefix}")
            continue
        # Use latest if multiple
        matches.sort(key=os.path.getmtime, reverse=True)
        img_path = matches[0]
        process_tile(session, img_path, cid)

    print("\nAll category studio tiles successfully processed!")

if __name__ == "__main__":
    main()
