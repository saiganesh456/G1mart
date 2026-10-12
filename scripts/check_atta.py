import os
import json

BASE_DIR = r"d:\web-agency-projects\G1mart"
with open(os.path.join(BASE_DIR, 'data', 'migrated_products.json'), 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(BASE_DIR, 'data', 'migrated_brands.json'), 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_map = {b['id']: b['name'] for b in brands}

def find_prods(cat_id):
    res = []
    for p in products:
        if p.get('category_id') == cat_id:
            res.append(p)
    return res

atta_prods = find_prods('atta-rice-dal')
for p in atta_prods:
    bname = brand_map.get(p.get('brand_id'), 'Unbranded')
    print(f"[{p['id']}] {bname}: {p['name']} | img={p.get('image_url')}")
