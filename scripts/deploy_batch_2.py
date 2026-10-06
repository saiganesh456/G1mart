import os
import sys
import json
import io
import ssl
import urllib.request
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

BATCH_2 = {
    "pdf1-003": {
        "url": "https://m.media-amazon.com/images/I/71DublkdqFL.jpg",
        "source": "Amazon India (Exact 150g Mysore Sandal Bar)"
    },
    "pdf1-006": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40052451_3-wagh-bakri-leaf-tea.jpg",
        "source": "BigBasket (Exact 500g Wagh Bakri Leaf Tea Carton)"
    },
    "pdf1-011": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40031946_5-exo-dishwash-bar-touch-shine.jpg",
        "source": "BigBasket (Exact 300g Exo Dishwash Bar)"
    },
    "pdf1-028": {
        "url": "https://rukminim3.flixcart.com/image/850/850/xif0q/soap/n/p/m/1-125-gold-soap-125g-mysore-sandal-original-imahggyzbw8ggysd.jpeg?q=90",
        "source": "Flipkart (Exact 125g Mysore Sandal Gold Box)"
    },
    "pdf1-064": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40237249_1-henko-matic-liquid-detergent-front-load.jpg",
        "source": "BigBasket (Exact 1L Henko Matic Front Load Bottle)"
    },
    "pdf1-065": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40237248_2-henko-matic-liquid-detergent-top-load-nano-fibre-lock-technology-999-germ-protection.jpg",
        "source": "BigBasket (Exact 1L Henko Matic Top Load Bottle)"
    }
}

os.makedirs("public/products", exist_ok=True)

def process_and_upload(pid, img_url, source_name):
    print(f"\nProcessing {pid} from {source_name}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(img_url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
            if res.status != 200:
                print(f"  HTTP error {res.status}")
                return None
            data = res.read()
            
        img = Image.open(io.BytesIO(data)).convert('RGB')
        w, h = img.size
        print(f"  Downloaded: {w}x{h} ({len(data)} bytes)")
        
        canvas_size = 1000
        scale = (canvas_size * 0.90) / max(w, h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
        offset_x = (canvas_size - new_w) // 2
        offset_y = (canvas_size - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y))
        
        buf = io.BytesIO()
        canvas.save(buf, format='JPEG', quality=92)
        jpeg_bytes = buf.getvalue()
        
        local_path = f"public/products/{pid}.jpg"
        with open(local_path, 'wb') as lf:
            lf.write(jpeg_bytes)
        print(f"  Saved local: {local_path} ({len(jpeg_bytes)} bytes)")
        
        up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{pid}/primary.jpg"
        up_headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
        }
        up_req = urllib.request.Request(up_url, data=jpeg_bytes, headers=up_headers, method='POST')
        with urllib.request.urlopen(up_req, context=ctx, timeout=15) as up_res:
            print(f"  Uploaded to Storage: HTTP {up_res.status}")
            
        pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
        probe_req = urllib.request.Request(pub_url)
        with urllib.request.urlopen(probe_req, context=ctx) as probe_res:
            print(f"  Verified Public URL: HTTP {probe_res.status}, size {len(probe_res.read())} bytes")
            return pub_url
            
    except Exception as e:
        print(f"  Failed for {pid}: {e}")
        return None

if __name__ == '__main__':
    for pid, info in BATCH_2.items():
        process_and_upload(pid, info['url'], info['source'])
    print("\nBatch 2 deployment complete.")
