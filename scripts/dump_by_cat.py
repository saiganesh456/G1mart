import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for cid in sorted(list(set(p.get('category_id') for p in products))):
    prods = [p for p in products if p.get('category_id') == cid]
    print(f"\n=================== {cid} ({len(prods)} products) ===================")
    for p in prods:
        print(f"  {p['id']}: {p['name']} ({p.get('brand', 'No Brand')})")
