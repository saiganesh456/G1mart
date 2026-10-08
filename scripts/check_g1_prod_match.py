import json
import os

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

local_files = set(os.listdir('public/products'))

matches_by_num = 0
matches_by_id = 0

for p in catalog:
    item_num = p.get('itemNumber')
    if item_num is not None:
        filename_num = f"g1-prod-{int(item_num):03d}.jpg"
        if filename_num in local_files:
            matches_by_num += 1

print(f"Matches if using g1-prod-{{num:03d}}.jpg: {matches_by_num} / {len(catalog)}")

# Check what g1-prod files exist
g1_prod_files = sorted([f for f in local_files if f.startswith('g1-prod-')])
print(f"Total g1-prod files in public/products: {len(g1_prod_files)}")
if g1_prod_files:
    print(f"First 10 g1-prod files: {g1_prod_files[:10]}")
    print(f"Last 10 g1-prod files: {g1_prod_files[-10:]}")
