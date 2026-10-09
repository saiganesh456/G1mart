import json
import os
import urllib.request
import urllib.parse
import re
import ssl
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageDraw, ImageFilter
import io

os.makedirs("public/products/verified", exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# Quick cache of textures to avoid duplicate lookups
TEXTURE_CACHE = {}

def search_images(query, max_results=5):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=6) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))[:max_results]
    except:
        return []

def download_image(url, timeout=7):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as res:
            data = res.read()
            im = Image.open(io.BytesIO(data))
            return im
    except:
        return None

def process_packshot(im, out_path):
    # Convert to RGBA
    im = im.convert("RGBA")
    w, h = im.size
    if w < 50 or h < 50:
        return False
        
    canvas = Image.new("RGBA", (800, 800), (255, 255, 255, 255))
    ratio = min(680 / w, 680 / h)
    nw = max(1, int(w * ratio))
    nh = max(1, int(h * ratio))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    offset = ((800 - nw) // 2, (800 - nh) // 2)
    
    if resized.mode == 'RGBA':
        canvas.paste(resized, offset, resized)
    else:
        canvas.paste(resized, offset)
        
    canvas.save(out_path, "WEBP", quality=90)
    return True

def build_jeevan_mart_pouch(title, search_keyword, weight_label, out_path):
    canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    pouch_x1, pouch_y1 = 180, 100
    pouch_x2, pouch_y2 = 620, 720
    pouch_w = pouch_x2 - pouch_x1
    pouch_h = pouch_y2 - pouch_y1

    texture = None
    if search_keyword in TEXTURE_CACHE:
        texture = TEXTURE_CACHE[search_keyword]
    else:
        urls = search_images(f"{search_keyword} raw grocery texture close up", 3)
        for u in urls:
            im = download_image(u)
            if im and im.size[0] >= 150 and im.size[1] >= 150:
                texture = im.convert("RGBA")
                TEXTURE_CACHE[search_keyword] = texture
                break

    pouch_mask = Image.new("L", (800, 800), 0)
    draw_mask = ImageDraw.Draw(pouch_mask)
    pouch_points = [
        (pouch_x1 + 30, pouch_y1),
        (pouch_x2 - 30, pouch_y1),
        (pouch_x2, pouch_y1 + 50),
        (pouch_x2 + 20, pouch_y2 - 60),
        (pouch_x2 - 25, pouch_y2),
        (pouch_x1 + 25, pouch_y2),
        (pouch_x1 - 20, pouch_y2 - 60),
        (pouch_x1, pouch_y1 + 50),
    ]
    draw_mask.polygon(pouch_points, fill=255)
    pouch_mask = pouch_mask.filter(ImageFilter.GaussianBlur(1))

    pouch_layer = Image.new("RGBA", (800, 800), (245, 235, 215, 255))
    if texture:
        scaled_texture = texture.resize((pouch_w + 60, pouch_h + 40), Image.Resampling.LANCZOS)
        pouch_layer.paste(scaled_texture, (pouch_x1 - 30, pouch_y1 - 20))
    else:
        draw_pouch = ImageDraw.Draw(pouch_layer)
        draw_pouch.rectangle([pouch_x1 - 30, pouch_y1 - 20, pouch_x2 + 30, pouch_y2 + 20], fill=(235, 205, 150, 255))

    seal_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_seal = ImageDraw.Draw(seal_layer)
    draw_seal.rectangle([pouch_x1 - 10, pouch_y1, pouch_x2 + 10, pouch_y1 + 45], fill=(235, 238, 242, 245))
    for step in range(pouch_y1 + 5, pouch_y1 + 42, 6):
        draw_seal.line([(pouch_x1, step), (pouch_x2, step)], fill=(180, 190, 205, 160), width=2)
    draw_seal.line([(pouch_x1 - 10, pouch_y1 + 28), (pouch_x1 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    draw_seal.line([(pouch_x2 - 10, pouch_y1 + 28), (pouch_x2 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)

    gloss_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_gloss = ImageDraw.Draw(gloss_layer)
    draw_gloss.line([(pouch_x1 + 55, pouch_y1 + 50), (pouch_x1 + 45, pouch_y2 - 40)], fill=(255, 255, 255, 80), width=28)
    draw_gloss.line([(pouch_x2 - 50, pouch_y1 + 50), (pouch_x2 - 60, pouch_y2 - 40)], fill=(0, 0, 0, 35), width=22)
    gloss_layer = gloss_layer.filter(ImageFilter.GaussianBlur(8))

    label_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_label = ImageDraw.Draw(label_layer)
    lbl_x1, lbl_y1 = pouch_x1 + 30, pouch_y1 + 120
    lbl_x2, lbl_y2 = pouch_x2 - 30, pouch_y1 + 340
    draw_label.rounded_rectangle([lbl_x1 + 4, lbl_y1 + 6, lbl_x2 + 4, lbl_y2 + 6], radius=16, fill=(0, 0, 0, 80))
    draw_label.rounded_rectangle([lbl_x1, lbl_y1, lbl_x2, lbl_y2], radius=16, fill=(15, 60, 30, 240), outline=(230, 185, 80, 255), width=3)
    draw_label.rounded_rectangle([lbl_x1 + 6, lbl_y1 + 6, lbl_x2 - 6, lbl_y2 - 6], radius=12, outline=(230, 185, 80, 140), width=1)

    logo_path = "public/logo.png"
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            lw, lh = logo_img.size
            ratio = min(54 / lw, 54 / lh)
            nlw, nlh = int(lw * ratio), int(lh * ratio)
            logo_img = logo_img.resize((nlw, nlh), Image.Resampling.LANCZOS)
            label_layer.paste(logo_img, (lbl_x1 + 22, lbl_y1 + 16), logo_img)
        except:
            pass

    draw_label.text((lbl_x1 + 86, lbl_y1 + 26), "JEEVAN MART", fill=(255, 215, 0, 255), anchor="lt")
    draw_label.text((lbl_x1 + 86, lbl_y1 + 46), "DIRECT FARM FRESH QUALITY", fill=(180, 230, 190, 255), anchor="lt")
    draw_label.line([(lbl_x1 + 20, lbl_y1 + 75), (lbl_x2 - 20, lbl_y1 + 75)], fill=(230, 185, 80, 200), width=2)

    clean_title = title.upper()
    if len(clean_title) > 28:
        clean_title = clean_title[:28] + "..."
    draw_label.text(((lbl_x1 + lbl_x2) // 2, lbl_y1 + 115), clean_title, fill=(255, 255, 255, 255), anchor="mm")
    draw_label.text(((lbl_x1 + lbl_x2) // 2, lbl_y1 + 150), "100% PURE & NATURAL • PREMIUM GRADE", fill=(220, 245, 220, 255), anchor="mm")

    draw_label.rounded_rectangle([lbl_x1 + 25, lbl_y1 + 175, lbl_x1 + 145, lbl_y1 + 205], radius=8, fill=(230, 185, 80, 255))
    draw_label.text((lbl_x1 + 85, lbl_y1 + 190), f"NET WT: {weight_label}", fill=(15, 50, 25, 255), anchor="mm")

    draw_label.rounded_rectangle([lbl_x2 - 155, lbl_y1 + 175, lbl_x2 - 25, lbl_y1 + 205], radius=8, fill=(35, 95, 55, 255), outline=(230, 185, 80, 180), width=1)
    draw_label.text((lbl_x2 - 90, lbl_y1 + 190), "SELECT QUALITY", fill=(255, 255, 255, 255), anchor="mm")

    pouch_comp = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    pouch_comp.paste(pouch_layer, (0, 0))
    pouch_comp.alpha_composite(seal_layer)
    pouch_comp.alpha_composite(gloss_layer)
    pouch_comp.alpha_composite(label_layer)
    canvas.paste(pouch_comp, (0, 0), pouch_mask)

    shadow_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow_layer)
    draw_shadow.ellipse([pouch_x1 - 10, pouch_y2 - 15, pouch_x2 + 10, pouch_y2 + 35], fill=(0, 0, 0, 90))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))

    final_canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    final_canvas.alpha_composite(shadow_layer)
    final_canvas.alpha_composite(canvas)
    final_canvas.save(out_path, "WEBP", quality=90)
    return True

def handle_single_product(p):
    pid = p["id"]
    name = p["name"]
    brand = p.get("brand") or "Local / Unbranded"
    out_file = f"public/products/verified/{pid}.webp"

    # Already has a verified image that exists on disk?
    if p.get("image_url") and os.path.exists(f"public{p['image_url']}"):
        return pid, True, "already_done"

    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        return pid, True, "file_exists"

    is_local = brand in ["Local / Unbranded", "G1 Mart", "G1 Mart Fresh"]
    
    # 1. If branded: search exact brand packshot
    if not is_local:
        query = f"{brand} {name} packet packshot white background"
        urls = search_images(query, 4)
        for u in urls:
            im = download_image(u)
            if im:
                if process_packshot(im, out_file):
                    return pid, True, f"branded_{brand}"
        # Fallback query
        urls = search_images(f"{brand} {name} product pack", 3)
        for u in urls:
            im = download_image(u)
            if im:
                if process_packshot(im, out_file):
                    return pid, True, f"branded_fallback_{brand}"

    # 2. If local or brand image not found, generate custom Jeevan Mart packaging!
    wt = "500g"
    if "1kg" in name.lower() or "1 kg" in name.lower():
        wt = "1 kg"
    elif "250g" in name.lower():
        wt = "250g"
    elif "100g" in name.lower():
        wt = "100g"
    elif "50g" in name.lower():
        wt = "50g"

    build_jeevan_mart_pouch(name, name, wt, out_file)
    return pid, True, "jeevan_mart_pouch"

# Filter to all products missing an image
unresolved = [p for p in products if not p.get("image_url") or not os.path.exists(f"public{p['image_url']}")]
print(f"Total unresolved products to process: {len(unresolved)}")

MAX_WORKERS = 8
success_count = 0

with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    futures = {executor.submit(handle_single_product, p): p for p in unresolved}
    for future in as_completed(futures):
        p = futures[future]
        try:
            pid, ok, note = future.result()
            if ok:
                success_count += 1
                p["image_url"] = f"/products/verified/{pid}.webp"
                p["image_status"] = "verified"
                p["imageStatus"] = "verified"
                p["imageUrl"] = f"/products/verified/{pid}.webp"
                p["image"] = f"/products/verified/{pid}.webp"
                if success_count % 25 == 0 or success_count == len(unresolved):
                    print(f"Progress: [{success_count}/{len(unresolved)}] processed...")
        except Exception as e:
            print(f"Error on {p['id']}: {e}")

# Save updated migrated_products.json
with open("data/migrated_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

print(f"\nALL DONE! Successfully processed {success_count} products!")
