import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

with open('data/migrated_product_variants.json', encoding='utf-8') as f:
    variants = json.load(f)

vars_by_pid = {}
for v in variants:
    pid = v.get('product_id')
    vars_by_pid.setdefault(pid, []).append(v)

dfc = [p for p in products if p.get('category_id') == 'dry-fruits-cereals' or p.get('category') == 'dry-fruits-cereals']

print(f"=== DRY-FRUITS-CEREALS: {len(dfc)} items in catalog ===")
for p in dfc:
    is_act = p.get('isActive', True) and p.get('is_active', True)
    p_vars = vars_by_pid.get(p['id'], [])
    var_str = ', '.join([f"{v.get('size_label')} (₹{v.get('price')})" for v in p_vars])
    print(f"\nID: {p['id']} | Active: {is_act}")
    print(f"  Name: {p.get('name')}")
    print(f"  Brand: {p.get('brand')} (brand_id: {p.get('brand_id')})")
    print(f"  SubCategory: {p.get('sub_category') or p.get('subCategory')}")
    print(f"  Image: {p.get('image_url')}")
    print(f"  Variants ({len(p_vars)}): [{var_str}]")
