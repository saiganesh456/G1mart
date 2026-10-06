import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

# Load pdf1_complete_import.json
with open('data/pdf1_complete_import.json', 'r', encoding='utf-8') as f:
    pdf1_products = json.load(f)

# List all objects in storage bucket
list_url = f"{SUPABASE_URL}/storage/v1/object/list/product-images"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

req = urllib.request.Request(list_url, data=json.dumps({"prefix": "", "limit": 200}).encode('utf-8'), headers=headers, method='POST')
with urllib.request.urlopen(req, context=ctx) as res:
    root_items = json.loads(res.read().decode('utf-8'))

storage_products = set()
for item in root_items:
    name = item.get('name')
    if name.startswith('g1-prod-'):
        storage_products.add(name)

print(f"Total product folders in Supabase Storage: {len(storage_products)}")

matching = []
missing = []
for p in pdf1_products:
    pid = p['id']
    if pid in storage_products:
        matching.append(p)
    else:
        missing.append(p)

print(f"Matching PDF #1 products in Storage: {len(matching)}")
print(f"Missing PDF #1 products in Storage: {len(missing)}")

print("\nMatching items:")
for m in matching:
    print(f"  {m['id']} (#{m['item_no']:03d}) - {m['product_name']} ({m['pack_size']})")
