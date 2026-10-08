import json
import csv
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Group missing products by sub_category
missing_by_sub = defaultdict(list)
for p in products:
    if p.get('image_status') == 'missing' or not p.get('image_url'):
        sub = p.get('sub_category') or 'General Essentials'
        missing_by_sub[sub].append(p)

rows = []
for sub, p_list in missing_by_sub.items():
    # Top 3 products of each sub-category get Priority 1
    for idx, p in enumerate(p_list):
        priority = 1 if idx < 3 else 2
        rows.append({
            'product_id': p['id'],
            'product_name': p['name'],
            'brand': p.get('brand') or 'Local / Unbranded',
            'category': p.get('category_id') or '',
            'sub_category': sub,
            'priority': priority,
            'barcode': p.get('barcode') or '',
            'status': 'missing'
        })

# Sort by priority (1 first, then 2), then category, sub_category
rows.sort(key=lambda r: (r['priority'], r['category'], r['sub_category'], r['product_name']))

fields = ['product_id', 'product_name', 'brand', 'category', 'sub_category', 'priority', 'barcode', 'status']

with open('audit/images-needed.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)

try:
    with open('../audit/images-needed.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
except Exception:
    pass

p1_count = sum(1 for r in rows if r['priority'] == 1)
p2_count = sum(1 for r in rows if r['priority'] == 2)

print(f"Exported /audit/images-needed.csv with {len(rows)} missing products.")
print(f"  - Priority 1 (Top 3 per subcategory): {p1_count}")
print(f"  - Priority 2 (Remaining catalog): {p2_count}")
