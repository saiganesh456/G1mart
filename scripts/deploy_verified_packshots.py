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

# Confirmed exact product packshots (Verified authentic retailer/brand CDNs)
CONFIRMED_PACKSHOTS = {
    # Mysore Sandal
    "pdf1-001": {
        "url": "https://www.bbassets.com/media/uploads/p/xl/100003862_1-mysore-sandal-bathing-soap.jpg",
        "source": "BigBasket (Exact 75g Single Bathing Bar)"
    },
    "pdf1-002": {
        "url": "https://www.bbassets.com/media/uploads/p/xl/100003902_1-mysore-sandal-bathing-soap.jpg",
        "source": "BigBasket (Exact 125g Single Bathing Bar)"
    },
    "pdf1-008": {
        "url": "https://www.bigbasket.com/media/uploads/p/xl/20005825_1-mysore-sandal-bathing-soap-baby.jpg",
        "source": "BigBasket (Exact 75g Baby Care Bathing Bar)"
    },
    
    # Wagh Bakri Tea
    "pdf1-004": {
        "url": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=480,h=480/app/images/products/full_screen/pro_400964.jpg?ts=1695214435",
        "source": "Blinkit (Exact 100g Wagh Bakri Leaf Tea Carton)"
    },
    "pdf1-005": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40052450_6-wagh-bakri-leaf-tea.jpg",
        "source": "BigBasket (Exact 250g Wagh Bakri Leaf Tea Carton)"
    },
    
    # Swastiks
    "pdf1-007": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40053896_5-swastiks-roasted-vermicelli.jpg",
        "source": "BigBasket (Exact 400g Swastiks Roasted Vermicelli Pouch)"
    },
    
    # Exo Dishwash
    "pdf1-009": {
        "url": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=480,h=480/app/images/products/sliding_image/401150a.jpg",
        "source": "Blinkit (Exact Exo Dishwash Bar 60g / Rs.5 Pack)"
    },
    "pdf1-010": {
        "url": "https://www.bigbasket.com/media/uploads/p/xl/280076_5-exo-dish-shine-bar-pack.jpg",
        "source": "BigBasket (Exact Exo Dishwash Bar 125g Pack)"
    },
    "pdf1-012": {
        "url": "https://www.bbassets.com/media/uploads/p/l/40111629_6-exo-dishwash-bar-round-touch-shine.jpg",
        "source": "BigBasket (Exact Exo Dishwash Round Tub 250g)"
    },
    
    # Ujala Supreme
    "pdf1-015": {
        "url": "https://5.imimg.com/data5/SELLER/Default/2023/11/360411207/KR/OV/IR/29537917/75ml-ujala-supreme-1000x1000.jpg",
        "source": "IndiaMART / Jyothy Labs (Exact 75ml Ujala Supreme Bottle)"
    },
    
    # Medimix Ayurvedic Soaps
    "pdf1-024": {
        "url": "https://m.media-amazon.com/images/I/61IT+XG5v5L._SL1500_.jpg",
        "source": "Amazon India (Exact 125g Medimix Sandal Soap Box)"
    },
    "pdf1-025": {
        "url": "https://m.media-amazon.com/images/I/7153aMX+y8L._SL1500_.jpg",
        "source": "Amazon India (Exact 125g Medimix Glycerine Soap Box)"
    },
    "pdf1-027": {
        "url": "https://www.bbassets.com/media/uploads/p/l/100014879_3-medimix-bathing-soap-ayurvedic-soap-with-18-herbs.jpg",
        "source": "BigBasket (Exact 125g Medimix 18 Herbs Classic Bar)"
    },
    
    # Margo Soap
    "pdf1-030": {
        "url": "https://m.media-amazon.com/images/I/61vzyPALUGL._SL1500_.jpg",
        "source": "Amazon India (Exact 100g Margo Neem Soap Single Bar)"
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
        
        # Create standard 1000x1000 square white canvas
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
        
        # Save local copy
        local_path = f"public/products/{pid}.jpg"
        with open(local_path, 'wb') as lf:
            lf.write(jpeg_bytes)
        print(f"  Saved local: {local_path} ({len(jpeg_bytes)} bytes)")
        
        # Upload to Supabase Storage
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
            
        # Probe public URL
        pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
        probe_req = urllib.request.Request(pub_url)
        with urllib.request.urlopen(probe_req, context=ctx) as probe_res:
            print(f"  Verified Public URL: HTTP {probe_res.status}, size {len(probe_res.read())} bytes")
            return pub_url
            
    except Exception as e:
        print(f"  Failed for {pid}: {e}")
        return None

if __name__ == '__main__':
    results = {}
    for pid, info in CONFIRMED_PACKSHOTS.items():
        pub = process_and_upload(pid, info['url'], info['source'])
        if pub:
            results[pid] = pub
            
    print(f"\nSuccessfully deployed {len(results)} exact packshots.")
