import json
from collections import defaultdict

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

active = [p for p in products if p.get('is_active', True) and p.get('isActive', True)]

cats = defaultdict(lambda: {'total': 0, 'g1': 0, 'loose': 0, 'brands': set(), 'placeholders': 0})

for p in active:
    c = p.get('category_id') or p.get('category') or 'unknown'
    cats[c]['total'] += 1
    b = (p.get('brand') or '').lower()
    if 'g1' in b:
        cats[c]['g1'] += 1
    elif 'local' in b or 'unbranded' in b or not b:
        cats[c]['loose'] += 1
    else:
        cats[c]['brands'].add(p.get('brand'))
    
    img = p.get('image_url') or ''
    if not img or 'placeholder' in img:
        cats[c]['placeholders'] += 1

print('=== CATEGORIES AUDIT ===')
for c, d in sorted(cats.items(), key=lambda x: -x[1]['total']):
    brand_sample = ', '.join(list(d['brands'])[:3])
    print(f"{c}: {d['total']} items | G1Mart: {d['g1']} | Loose: {d['loose']} | Placeholders: {d['placeholders']} | Brands: {brand_sample}")
