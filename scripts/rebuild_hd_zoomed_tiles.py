import os
import glob
from PIL import Image, ImageFilter, ImageDraw
import rembg

BRAIN_DIR = r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\06070a30-82cd-4652-b0f2-a009322f4cba"
COLLAGES_DIR = r"d:\web-agency-projects\G1mart\public\categories\collages"
BACKUP_DIR = r"d:\web-agency-projects\G1mart\public\categories\collages_backup"

os.makedirs(COLLAGES_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

# 11 newly generated HD studio packshots
HD_GENERATED_MAP = {
    'atta-rice-dal': 'hd_rice_atta_flours_*.jpg',
    'soaps-bath': 'hd_soaps_handwash_*.jpg',
    'sweets-chocolates': 'hd_chocolates_sweets_*.jpg',
    'dishwash': 'hd_dishwash_scrubbers_*.jpg',
    'oral-care': 'hd_oral_care_packshot_*.jpg',
    'tea-coffee-milk-drinks': 'hd_tea_coffee_*.jpg',
    'oil-ghee-masala': 'cooking_oil_ghee_*.jpg',
    'spices-masalas': 'spices_masalas_pickle_*.jpg',
    'local-dals': 'dals_and_pulses_*.jpg',
    'dry-fruits-cereals': 'dry_fruits_and_nuts_*.jpg',
    'hygiene': 'feminine_hygiene_*.jpg',
}

# The other categories to zoom in and optimize
EXISTING_CATEGORIES_TO_ZOOM = [
    'chips-namkeen',
    'drinks-juices',
    'laundry-detergents',
    'floor-surface-cleaners',
    'pooja-needs',
    'kitchenware',
    'hair-care',
    'skin-care',
    'baby-care',
    'sugar-salt-staples',
    'vegetables-fruits',
]

def create_ground_shadow(width, height=14, opacity=50):
    shadow = Image.new('RGBA', (int(width * 1.25), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.44), height // 2
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

def process_hd_tiles(session):
    print("=== Processing 11 HD Generated Tiles (Zoomed & Centered) ===")
    max_w, max_h = 360, 330
    y_base = 365

    for cid, pattern in HD_GENERATED_MAP.items():
        matches = glob.glob(os.path.join(BRAIN_DIR, pattern))
        if not matches:
            print(f"  [MISSING] Pattern {pattern} for {cid}")
            continue
        
        matches.sort(key=os.path.getmtime, reverse=True)
        img_path = matches[0]
        print(f"  Processing {cid} from {os.path.basename(img_path)}...")
        
        raw = Image.open(img_path).convert('RGB')
        cutout = rembg.remove(raw, session=session)
        bbox = cutout.getbbox()
        if not bbox:
            print(f"    ERROR: empty bbox for {cid}")
            continue
        
        cropped = cutout.crop(bbox)
        
        # Zoom scale: fill up to 360w or 330h
        scale = min(max_w / cropped.width, max_h / cropped.height)
        new_w = max(10, int(cropped.width * scale))
        new_h = max(10, int(cropped.height * scale))
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
        start_x = (400 - new_w) // 2
        start_y = y_base - new_h
        
        shadow = create_ground_shadow(new_w, height=14, opacity=50)
        sh_x = start_x + (new_w - shadow.width) // 2
        sh_y = y_base - shadow.height // 2
        canvas.paste(shadow, (sh_x, sh_y), shadow)
        canvas.paste(resized, (start_x, start_y), resized)
        
        centered = center_canvas_vertically(canvas)
        out_path = os.path.join(COLLAGES_DIR, f"{cid}.webp")
        centered.save(out_path, "WEBP", quality=95)
        print(f"    [OK] Saved {cid}.webp (bbox: {centered.getbbox()})")

def zoom_existing_tiles():
    print("\n=== Zooming In Remaining 11 Category Tiles ===")
    max_w, max_h = 350, 325
    y_base = 365

    for cid in EXISTING_CATEGORIES_TO_ZOOM:
        src_path = os.path.join(COLLAGES_DIR, f"{cid}.webp")
        if not os.path.exists(src_path):
            print(f"  [MISSING] {cid}.webp")
            continue
        
        img = Image.open(src_path).convert('RGBA')
        bbox = img.getbbox()
        if not bbox:
            print(f"    ERROR: empty bbox for {cid}")
            continue
        
        # Crop out empty transparent margins
        cropped = img.crop(bbox)
        
        # Scale up
        scale = min(max_w / cropped.width, max_h / cropped.height)
        new_w = max(10, int(cropped.width * scale))
        new_h = max(10, int(cropped.height * scale))
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
        start_x = (400 - new_w) // 2
        start_y = y_base - new_h
        
        shadow = create_ground_shadow(new_w, height=12, opacity=45)
        sh_x = start_x + (new_w - shadow.width) // 2
        sh_y = y_base - shadow.height // 2
        canvas.paste(shadow, (sh_x, sh_y), shadow)
        canvas.paste(resized, (start_x, start_y), resized)
        
        centered = center_canvas_vertically(canvas)
        centered.save(src_path, "WEBP", quality=95)
        print(f"    [ZOOMED] {cid}.webp (new bbox: {centered.getbbox()})")

def main():
    session = rembg.new_session("u2net")
    process_hd_tiles(session)
    zoom_existing_tiles()
    print("\nAll 22 categories successfully processed, HD-upgraded, and zoomed!")

if __name__ == "__main__":
    main()
