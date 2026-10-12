import json
from collections import defaultdict

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_id_to_name = {b['id']: b['name'] for b in brands}

by_cat = defaultdict(list)
for p in products:
    p['brand_name'] = brand_id_to_name.get(p.get('brand_id'), 'Unbranded')
    by_cat[p.get('category_id')].append(p)

for cat_id, prods in sorted(by_cat.items(), key=lambda x: str(x[0])):
    print(f"\n==================== CATEGORY: {cat_id} ({len(prods)} products) ====================")
    # Group by brand
    by_brand = defaultdict(list)
    for p in prods:
        by_brand[p['brand_name']].append(p)
    
    # Sort brands by count
    for brand, bprods in sorted(by_brand.items(), key=lambda x: -len(x[1])):
        img_prods = [p for p in bprods if p.get('image_url') and not p.get('image_url', '').endswith('placeholder.svg')]
        print(f"  Brand: {brand} ({len(bprods)} items, {len(img_prods)} with real img)")
        for p in img_prods[:3]:
            print(f"    - [{p['id']}] {p['name']} -> {p['image_url']}")
