import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

kandi_prods = [p for p in products if 'kandi_pappu' in str(p.get('image_url', '')) and not any(k in p['name'].lower() for k in ['toor', 'kandi pappu', 'kandipappu'])]
print(f'Products to remediate: {len(kandi_prods)}')

from collections import defaultdict
by_cat = defaultdict(list)
for p in kandi_prods:
    by_cat[p.get('category_id', 'unknown')].append(p)

for cat, items in by_cat.items():
    print(f"\n=== {cat} ({len(items)}) ===")
    for p in items[:15]:
        print(f"  {p['id']}: {p['name']}")
