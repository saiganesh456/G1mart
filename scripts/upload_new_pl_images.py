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

PL_UPLOADS = {
    "pdf1-094": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_cheemala_mandu_1791279899409.jpg",
    "pdf1-042": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_bleaching_powder_1791279926512.jpg",
    "pdf1-043": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_bleaching_250g_1791279953846.jpg",
    "pdf1-093": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_suji_rava_1791279979900.jpg"
}

os.makedirs("public/products", exist_ok=True)

for pid, src_path in PL_UPLOADS.items():
    if not os.path.exists(src_path):
        print(f"Missing file: {src_path}")
        continue
    
    # 1. Copy locally
    dest_local = f"public/products/{pid}.jpg"
    shutil.copy2(src_path, dest_local)
    print(f"Copied {pid} -> {dest_local}")
    
    # 2. Upload to Supabase Storage
    with open(src_path, "rb") as f:
        img_bytes = f.read()
        
    up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{pid}/primary.jpg"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
    }
    req = urllib.request.Request(up_url, data=img_bytes, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as res:
            print(f"Uploaded {pid} to Storage: HTTP {res.status}")
            
        pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
        probe_req = urllib.request.Request(pub_url)
        with urllib.request.urlopen(probe_req, context=ctx) as p_res:
            print(f"Verified Public URL for {pid}: HTTP {p_res.status}, size {len(p_res.read())} bytes")
    except Exception as e:
        print(f"Upload failed for {pid}: {e}")
