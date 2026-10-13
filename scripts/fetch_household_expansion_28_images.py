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
DATA_PATH = os.path.join(ROOT, 'data', 'verified_household_expansion_28.json')
PUBLIC_IMG_DIR = os.path.join(ROOT, 'public', 'products', 'verified')
os.makedirs(PUBLIC_IMG_DIR, exist_ok=True)

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} expansion 28 household products for image pipeline...")

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
    except Exception as e:
        return []

def download_and_format(url, output_path, target_size=(800, 800)):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
        content = res.read()
    
    img = Image.open(BytesIO(content))
    w, h = img.size
    if w < 100 or h < 100:
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

def process_product(p):
    img_rel = p['image_url']
    filename = os.path.basename(img_rel)
    target_path = os.path.join(PUBLIC_IMG_DIR, filename)

    if os.path.exists(target_path) and os.path.getsize(target_path) > 10000:
        return (p['id'], p['name'], True, "already_exists", target_path)

    for q in p['queries']:
        urls = search_bing_images(q)
        for u in urls[:12]:
            if any(bad in u.lower() for bad in ['svg', 'gif', 'icon', 'banner', 'logo']):
                continue
            try:
                download_and_format(u, target_path)
                return (p['id'], p['name'], True, u, target_path)
            except Exception:
                pass
    return (p['id'], p['name'], False, "failed", "")

print("Starting parallel download with 6 worker threads...")
results = []
with ThreadPoolExecutor(max_workers=6) as executor:
    futures = {executor.submit(process_product, p): p for p in products}
    for idx, fut in enumerate(as_completed(futures), 1):
        pid, name, success, source, out_path = fut.result()
        results.append((pid, name, success, source, out_path))
        status_str = "OK" if success else "FAILED"
        print(f"[{idx}/{len(products)}] {status_str}: {pid} - {name} ({source[:60]})")

failed = [r for r in results if not r[2]]
print(f"\nDone! Successful: {len(results) - len(failed)} / {len(products)}")
if failed:
    print(f"Failed items ({len(failed)}):")
    for f in failed:
        print(f"  - {f[0]}: {f[1]}")
