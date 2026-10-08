import json
import os

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Catalog items: {len(catalog)}")
print("First 10 catalog items:")
for p in catalog[:10]:
    print(f"  id: {p.get('id')} | itemNumber: {p.get('itemNumber')} | name: {p.get('name')} | brand: {p.get('brand')} | img: {p.get('imageUrl')}")

with open('src/data/image_generation_log.json', 'r', encoding='utf-8') as f:
    gen_log = json.load(f)

print(f"\nGen log items: {len(gen_log)}")
gen_dict = {x.get('productId'): x for x in gen_log}

# Check if public/products has files matching catalog IDs
local_files = os.listdir('public/products')
local_files_set = set(local_files)

matched_local = 0
for p in catalog:
    pid = p.get('id')
    expected_file = f"{pid}.jpg"
    if expected_file in local_files_set:
        matched_local += 1

print(f"\nCatalog items with matching file in public/products: {matched_local} / {len(catalog)}")
