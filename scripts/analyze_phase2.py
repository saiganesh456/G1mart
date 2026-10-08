import json
import re
from collections import defaultdict

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)
with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = json.load(f)

print(f'Total products: {len(products)}')
print(f'Total variants: {len(variants)}')

# Check variants per product
var_by_pid = defaultdict(list)
for v in variants:
    var_by_pid[v['product_id']].append(v)

# Size stripping regex
def get_base_name(name):
    n = name.strip()
    # Strip weights/volumes/units like 100g, 100gm, 1kg, 500ml, 1ltr, 10rs, 20rs, 100 g, 1 kg
    n = re.sub(r'(?i)\b\d+(\.\d+)?\s*(kg|g|gm|gms|l|ltr|ml|pc|pcs|pack|pk|rs|r)\b', '', n)
    n = re.sub(r'(?i)\b(rs|r)\s*\d+\b', '', n)
    n = re.sub(r'[\(\)\[\],-]', ' ', n)
    n = re.sub(r'\s+', ' ', n).strip().title()
    return n

groups = defaultdict(list)
for p in products:
    b_name = get_base_name(p['name'])
    groups[b_name].append(p)

duplicate_groups = {k: v for k, v in groups.items() if len(v) > 1 and len(k) > 2}
print(f'Duplicate product groups by base name: {len(duplicate_groups)}')
sample_count = 0
for k, v in duplicate_groups.items():
    if sample_count < 15:
        print(f'  Group "{k}":')
        for item in v:
            var_count = len(var_by_pid.get(item['id'], []))
            print(f'    - {item["id"]}: {item["name"]} (variants: {var_count})')
        sample_count += 1
