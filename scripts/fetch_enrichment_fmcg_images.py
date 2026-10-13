import json
import os
import sys
import urllib.request
import urllib.parse
import re
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from io import BytesIO

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = os.path.join(ROOT, 'data', 'verified_fmcg_enrichment_100.json')
PUBLIC_IMG_DIR = os.path.join(ROOT, 'public', 'products', 'verified')
os.makedirs(PUBLIC_IMG_DIR, exist_ok=True)

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} enrichment FMCG products for image pipeline...")

def search_bing_images(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception:
        return []

def format_image_canvas(img, output_path, target_size=(800, 800)):
    w, h = img.size
    if w < 70 or h < 70:
        raise Exception(f"Image too small: {w}x{h}")

    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2), mask=resized)
    else:
        img = img.convert('RGB')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2))

    canvas.save(output_path, 'WEBP', quality=90)
    return True

def download_and_format(url, output_path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
        content = res.read()
    img = Image.open(BytesIO(content))
    return format_image_canvas(img, output_path)

def process_product(p):
    filename = os.path.basename(p['image'])
    target_path = os.path.join(PUBLIC_IMG_DIR, filename)

    if os.path.exists(target_path) and os.path.getsize(target_path) > 10000:
        return (p['name'], True, "already_exists")

    # Check local legacy/packshot images if available in public/products/packshots
    local_candidates = [
        os.path.join(ROOT, 'public', 'products', 'packshots', filename.replace('.webp', '.jpg')),
        os.path.join(ROOT, 'public', 'products', 'packshots', filename.replace('.webp', '.png')),
        os.path.join(ROOT, 'public', 'products', 'packshots', filename.replace('dry-', '').replace('.webp', '.jpg')),
        os.path.join(ROOT, 'public', 'products', 'packshots', filename.replace('dry-', '').replace('.webp', '.png'))
    ]
    for cand in local_candidates:
        if os.path.exists(cand) and os.path.getsize(cand) > 10000:
            try:
                img = Image.open(cand)
                format_image_canvas(img, target_path)
                return (p['name'], True, "from_local_packshots")
            except Exception:
                pass

    queries = [
        p['search_query'],
        f"{p['brand']} {p['name']} packshot white background",
        f"{p['name']} product packshot white background",
        f"{p['brand']} {p['variant']} packshot"
    ]

    for q in queries:
        urls = search_bing_images(q)
        for u in urls[:12]:
            if any(bad in u.lower() for bad in ['svg', 'gif', 'icon', 'banner', 'logo']):
                continue
            try:
                download_and_format(u, target_path)
                return (p['name'], True, u)
            except Exception:
                pass

    return (p['name'], False, "failed")

if __name__ == '__main__':
    print("Starting parallel download for 98 enrichment products with 8 worker threads...")
    success_count = 0
    failed = []

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_product, p): p for p in products}
        for idx, fut in enumerate(as_completed(futures), 1):
            name, success, info = fut.result()
            if success:
                success_count += 1
                print(f"[{idx}/{len(products)}] SUCCESS: {name} ({info})")
            else:
                failed.append(name)
                print(f"[{idx}/{len(products)}] FAILED: {name}")

    print("\n==========================================")
    print(f"COMPLETED: {success_count}/{len(products)} images downloaded.")
    if failed:
        print(f"Failed items ({len(failed)}): {failed}")
    print("==========================================")
