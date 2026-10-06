import os
import shutil
import urllib.request
import ssl
from PIL import Image
import io

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

PL_MAP = {
    "pdf1-074": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_ganji_pindi_1791274222393.jpg",
    "pdf1-089": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_washing_soda_1791274244719.jpg"
}

os.makedirs("public/products", exist_ok=True)

for pid, src_path in PL_MAP.items():
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        continue
    
    # 1. Copy locally
    dest_local = f"public/products/{pid}.jpg"
    shutil.copy2(src_path, dest_local)
    print(f"Copied locally to {dest_local}")
    
    # 2. Read bytes
    with open(src_path, "rb") as f:
        img_bytes = f.read()
        
    # 3. Upload to Supabase Storage
    up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{pid}/primary.jpg"
    up_headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
    }
    up_req = urllib.request.Request(up_url, data=img_bytes, headers=up_headers, method='POST')
    with urllib.request.urlopen(up_req, context=ctx) as up_res:
        print(f"Uploaded {pid} to Storage: {up_res.status}")
        
    # 4. Probe public URL
    pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
    probe_req = urllib.request.Request(pub_url)
    with urllib.request.urlopen(probe_req, context=ctx) as probe_res:
        print(f"Probed public URL for {pid}: {probe_res.status}, size: {len(probe_res.read())}")
