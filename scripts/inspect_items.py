import json
import sys

# Ensure utf-8 output
sys.stdout.reconfigure(encoding='utf-8')

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)

v_by_p = {}
for v in variants:
    v_by_p.setdefault(v['product_id'], []).append(v)

check_ids = ['g1-p0153', 'g1-p0154', 'g1-p0762', 'g1-p1025', 'g1-p0449', 'g1-p0755', 'g1-p0756', 'g1-p0094', 'g1-p0581', 'g1-p0088', 'g1-p1005', 'g1-p0095', 'g1-p0877']
for cid in check_ids:
    p = next((x for x in products if x['id'] == cid), None)
    vs = v_by_p.get(cid, [])
    if p:
        v_str = ', '.join([f"{v.get('size_label')} (Rs.{v.get('price')}/MRP Rs.{v.get('mrp')})" for v in vs])
        print(f"{p['id']}: \"{p['name']}\" (cat: {p.get('category_id')}) -> variants: [{v_str}]")
