import os
import shutil
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

PICKLE_MAP = {
    "pdf1-083": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_lime_pickle_1791282139234.jpg",
    "pdf1-084": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_avakaya_pickle_1791282054265.jpg",
    "pdf1-085": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_cutmango_pickle_1791282201994.jpg",
    "pdf1-086": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_lime_pickle_1791282139234.jpg",
    "pdf1-087": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_cutmango_pickle_1791282201994.jpg",
    "pdf1-088": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_redchilli_pickle_1791282170210.jpg",
    "pdf1-089": r"C:\Users\gumma\.gemini\antigravity-ide\brain\7ee39792-2136-4526-9b10-73f1fee29945\g1_mixedveg_pickle_1791282240464.jpg",
}

for pid, src in PICKLE_MAP.items():
    dest = f"public/products/{pid}.jpg"
    shutil.copy2(src, dest)
    
    with open(src, 'rb') as f:
        data = f.read()
        
    up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{pid}/primary.jpg"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
    }
    req = urllib.request.Request(up_url, data=data, headers=headers, method='POST')
    with urllib.request.urlopen(req, context=ctx) as res:
        print(f"Uploaded {pid} to Storage: HTTP {res.status}")
        
    pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
    probe = urllib.request.Request(pub_url)
    with urllib.request.urlopen(probe, context=ctx) as pres:
        print(f"Verified {pid} Public URL: HTTP {pres.status}, size {len(pres.read())} bytes")

print("All Regional Pickles uploaded and verified.")
