import os
import sys
import json
import re
import io
import ssl
import time
import urllib.request
import urllib.parse
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

TRUSTED_DOMAINS = [
    'media-amazon.com',
    'images-eu.ssl-images-amazon.com',
    'bbassets.com',
    'bigbasket.com',
    'jiomart.com',
    'flipkart.com',
    'imimg.com',
    'zepto',
    'blinkit',
    'instamart',
    'swiggy',
    'dmart.in'
]

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        return []

def download_and_process(candidates):
    # Sort prioritizing trusted retail CDNs
    trusted = [u for u in candidates if any(d in u.lower() for d in TRUSTED_DOMAINS)]
    other = [u for u in candidates if u not in trusted]
    
    # Try trusted first, then clean other image hosts
    for u in (trusted + other)[:12]:
        # Filter out obvious junk
        low = u.lower()
        if any(bad in low for bad in ['.svg', 'logo', 'icon', 'banner', 'vector', 'britannica', 'wikipedia', 'tripadvisor']):
            continue
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
                if res.status != 200:
                    continue
                data = res.read()
                if len(data) < 20000: # skip small images
                    continue
                
                img = Image.open(io.BytesIO(data))
                w, h = img.size
                if w < 400 or h < 400:
                    continue
                
                # Check aspect ratio isn't absurd (e.g. wide banner)
                ratio = w / h
                if ratio < 0.45 or ratio > 2.2:
                    continue
                
                img = img.convert('RGB')
                target_size = max(w, h, 800)
                target_size = min(target_size, 1200)
                
                # Scale keeping aspect ratio
                scale = (target_size * 0.90) / max(w, h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # Place onto white square canvas
                canvas = Image.new('RGB', (target_size, target_size), (255, 255, 255))
                offset_x = (target_size - new_w) // 2
                offset_y = (target_size - new_h) // 2
                canvas.paste(resized, (offset_x, offset_y))
                
                buf = io.BytesIO()
                canvas.save(buf, format='JPEG', quality=92)
                return buf.getvalue(), u, w, h
        except Exception:
            continue
            
    return None, None, 0, 0

def upload_to_supabase(pid, jpeg_bytes):
    up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{pid}/primary.jpg"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
    }
    req = urllib.request.Request(up_url, data=jpeg_bytes, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
            if res.status in (200, 201):
                return f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
    except Exception as e:
        print(f"  [Upload error {pid}]: {e}")
    return None

def build_queries(p):
    brand = p.get('brand') or ''
    name = p['product_name']
    pack = p['pack_size']
    
    # Strip brand from name if present to avoid redundancy
    clean_name = name
    if brand and clean_name.lower().startswith(brand.lower()):
        clean_name = clean_name[len(brand):].strip()
    
    # Remove parenthetical notes for core search
    core_name = clean_name.split('(')[0].strip()
    
    queries = [
        f"{brand} {core_name} {pack} packshot",
        f"{brand} {core_name} {pack} India",
        f"{brand} {name} India",
        f"{brand} {core_name}"
    ]
    return list(dict.fromkeys(queries))

def main():
    os.makedirs("public/products", exist_ok=True)
    with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
        
    print(f"Loaded {len(products)} products.")
    
    # Items already verified with custom / confirmed assets
    already_done = {'pdf1-007', 'pdf1-094', 'pdf1-095', 'pdf1-096', 'pdf1-042', 'pdf1-043', 'pdf1-093'}
    
    verified_count = len(already_done)
    unmatched_count = 0
    
    for idx, p in enumerate(products, 1):
        pid = p['id']
        num = p['item_no']
        
        if pid in already_done:
            print(f"[{idx}/96] #{num:02d} {pid} ALREADY VERIFIED ({p['product_name']})")
            p['image_status'] = 'VERIFIED'
            p['image_url'] = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
            continue
            
        print(f"\n[{idx}/96] #{num:02d} {pid}: {p['product_name']} | Brand: {p.get('brand')} | Pack: {p['pack_size']}")
        
        # Check if local file already exists
        local_path = f"public/products/{pid}.jpg"
        
        queries = build_queries(p)
        found_bytes = None
        source_url = None
        orig_w = orig_h = 0
        
        for q in queries:
            urls = search_bing(q)
            if urls:
                b_bytes, s_url, w, h = download_and_process(urls)
                if b_bytes:
                    found_bytes = b_bytes
                    source_url = s_url
                    orig_w, orig_h = w, h
                    print(f"  -> MATCH on query '{q}'")
                    print(f"     Source: {source_url} ({orig_w}x{orig_h})")
                    break
            time.sleep(0.3)
            
        if found_bytes:
            # Save local
            with open(local_path, 'wb') as lf:
                lf.write(found_bytes)
            # Upload to Supabase
            pub_url = upload_to_supabase(pid, found_bytes)
            if pub_url:
                p['image_url'] = pub_url
                p['image_status'] = 'VERIFIED'
                p['image_source'] = source_url
                verified_count += 1
                print(f"  [SUCCESS] Uploaded & Verified: {pub_url}")
            else:
                p['image_status'] = 'NEEDS_REVIEW'
                unmatched_count += 1
        else:
            print(f"  [NO EXACT PACKSHOT FOUND] Retaining image_url=null, NEEDS_REVIEW")
            p['image_status'] = 'NEEDS_REVIEW'
            unmatched_count += 1
            
        time.sleep(0.5)
        
    print("\n" + "="*50)
    print(f"HARVEST COMPLETE: {verified_count} VERIFIED, {unmatched_count} NEEDS_REVIEW out of 96")
    
    # Save master json
    with open('data/pdf1_final_master_products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
        
    print("Updated data/pdf1_final_master_products.json successfully.")

if __name__ == '__main__':
    main()
