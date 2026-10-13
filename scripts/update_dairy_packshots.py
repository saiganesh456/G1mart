import os
from PIL import Image, ImageFilter, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKSHOTS_DIR = os.path.join(BASE_DIR, "public", "products", "packshots_fmcg")
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")

def create_product_card(src_path, dest_name, target_dim=720):
    img = Image.open(src_path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        print(f"Empty bbox for {src_path}")
        return
    cropped = img.crop(bbox)
    
    # Scale keeping aspect ratio
    cw, ch = cropped.size
    scale = min(target_dim / cw, target_dim / ch)
    nw = int(cw * scale)
    nh = int(ch * scale)
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    
    # Create 800x800 white canvas
    canvas = Image.new('RGBA', (800, 800), (255, 255, 255, 255))
    
    # Create soft ground contact shadow
    sw = int(nw * 0.85)
    sh = 24
    shadow = Image.new('RGBA', (sw + 40, sh + 40), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    cx, cy = (sw + 40) // 2, (sh + 40) // 2
    rx, ry = sw // 2, sh // 2
    sdraw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(20, 25, 30, 40))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
    
    px = (800 - nw) // 2
    py = (800 - nh) // 2 - 10 # slightly elevated
    
    # Paste shadow near bottom of item
    shadow_x = (800 - shadow.width) // 2
    shadow_y = py + nh - shadow.height // 2
    canvas.paste(shadow, (shadow_x, shadow_y), shadow)
    
    # Paste product
    canvas.paste(resized, (px, py), resized)
    
    # Convert to RGB and save webp
    rgb_card = canvas.convert('RGB')
    out_path = os.path.join(VERIFIED_DIR, dest_name)
    rgb_card.save(out_path, 'WEBP', quality=95)
    print(f"Saved {dest_name} (product: {nw}x{nh})")

def main():
    items = [
        ("rembg_dodla_milk.png", "dry-dodla-toned-milk.webp"),
        ("rembg_heritage_curd.png", "dry-heritage-curd-450g.webp"),
        ("rembg_arokya_toned_milk.png", "dry-arokya-toned-milk.webp"),
        ("rembg_arokya_curd.png", "dry-arokya-curd-450g.webp"),
    ]
    for src, dst in items:
        p = os.path.join(PACKSHOTS_DIR, src)
        if os.path.exists(p):
            create_product_card(p, dst)
        else:
            print(f"Missing source: {p}")

if __name__ == "__main__":
    main()
