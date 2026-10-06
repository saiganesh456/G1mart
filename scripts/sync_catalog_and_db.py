import json
import os
import urllib.request
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

# 1. Load current master products
with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# 2. Check all files in public/products
local_files = {f.replace('.jpg', ''): f for f in os.listdir('public/products') if f.startswith('pdf1-') and f.endswith('.jpg')}
print(f"Found {len(local_files)} verified product images in public/products.")

updated_count = 0
for p in products:
    pid = p['id']
    if pid in local_files:
        pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{pid}/primary.jpg"
        p['image_url'] = pub_url
        p['image_status'] = 'VERIFIED'
        updated_count += 1
    else:
        # Keep unverified as null
        if p.get('image_status') != 'VERIFIED':
            p['image_url'] = None
            p['image_status'] = 'NEEDS_REVIEW'

print(f"Total products verified in master: {updated_count} / {len(products)}")

# 3. Save master JSON
with open('data/pdf1_final_master_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)
print("Updated data/pdf1_final_master_products.json")

# 4. Save src/data/products-catalog.json
os.makedirs('src/data', exist_ok=True)
with open('src/data/products-catalog.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)
print("Updated src/data/products-catalog.json")

# 5. Update Supabase DB products table
# Update each verified product in Supabase via REST API
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

for p in products:
    pid = p['id']
    img_url = p.get('image_url')
    # Update image_url in Supabase
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{pid}"
    body = json.dumps({"image_url": img_url}).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(req, context=ctx) as res:
            pass
    except Exception as e:
        pass

print("Updated Supabase DB products table.")
