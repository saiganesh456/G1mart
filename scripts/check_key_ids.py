import os
import json

BASE_DIR = r"d:\web-agency-projects\G1mart"
with open(os.path.join(BASE_DIR, 'data', 'migrated_products.json'), 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(BASE_DIR, 'data', 'migrated_brands.json'), 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_map = {b['id']: b['name'] for b in brands}

prod_by_id = {p['id']: p for p in products}

print("Searching key hero items across verified directory:")
test_ids = [
    'g1-p0440', 'g1-p0428', 'g1-p0022', 'g1-p0043', 'g1-p0061', 'g1-p0026', 'g1-p0011',
    'g1-p0199', 'g1-p0122', 'g1-p0023', 'g1-p0007', 'g1-p0202', 'g1-p0028', 'g1-p0039',
    'g1-p0317', 'g1-p0293', 'g1-p0311', 'g1-p0036', 'g1-p0332', 'g1-p0425', 'g1-p0850',
    'g1-p0862', 'g1-p0817', 'g1-p0273', 'g1-p0541', 'g1-p0551', 'g1-p0117', 'g1-p0105',
    'g1-p0090'
]

for tid in test_ids:
    p = prod_by_id.get(tid)
    vpath = os.path.join(BASE_DIR, 'public', 'products', 'verified', f'{tid}.webp')
    exists = os.path.exists(vpath)
    if p:
        bname = brand_map.get(p.get('brand_id'), 'Unbranded')
        print(f"{tid}: {p['name']} ({bname}) | cat={p.get('category_id')} | verified_exists={exists}")
    else:
        print(f"{tid}: NOT IN CATALOG | verified_exists={exists}")
