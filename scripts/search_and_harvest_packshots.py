import os
import sys
import json
import re
import io
import ssl
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
    'bbassets.com',
    'bigbasket.com',
    'jiomart.com',
    'flipkart.com',
    'imimg.com',
    'zeptonow.com',
    'blinkit.com',
    'instamart',
    'swiggy',
    'reliancedigital',
    'dmart.in'
]

def search_bing_image_urls(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            # Deduplicate preserving order
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"  [Error searching Bing for '{query}']: {e}")
        return []

def download_and_process_image(candidates):
    # Sort candidates prioritizing trusted grocery/retail CDNs
    trusted = [u for u in candidates if any(d in u.lower() for d in TRUSTED_DOMAINS)]
    other = [u for u in candidates if u not in trusted]
    sorted_urls = trusted + other

    for c in sorted_urls[:8]:
        try:
            req = urllib.request.Request(c, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
                if res.status != 200:
                    continue
                data = res.read()
                if len(data) < 20000: # Skip icons or thumbnails
                    continue
                
                img = Image.open(io.BytesIO(data))
                w, h = img.size
                if w < 400 or h < 400: # Must be decent resolution
                    continue
                
                # Convert to RGB
                img = img.convert('RGB')
                
                # Create a clean square white canvas (1000x1000 or max(w,h))
                target_size = max(w, h, 800)
                # Keep within reasonable bounds
                target_size = min(target_size, 1200)
                
                # Scale img so max dimension is target_size * 0.92 (leaving small padding)
                scale = (target_size * 0.92) / max(w, h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # Create white square canvas
                canvas = Image.new('RGB', (target_size, target_size), (255, 255, 255))
                offset_x = (target_size - new_w) // 2
                offset_y = (target_size - new_h) // 2
                canvas.paste(resized_img, (offset_x, offset_y))
                
                buf = io.BytesIO()
                canvas.save(buf, format='JPEG', quality=92)
                return buf.getvalue(), c, w, h
        except Exception:
            continue
            
    return None, None, 0, 0

def upload_to_supabase_storage(product_id, jpeg_bytes):
    up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{product_id}/primary.jpg"
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
                pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{product_id}/primary.jpg"
                return pub_url
    except Exception as e:
        print(f"  [Upload error for {product_id}]: {e}")
    return None

if __name__ == "__main__":
    print("Search and Harvest Packshots Engine Ready.")
