import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)
with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = {b['id']: b['name'] for b in json.load(f)}

v_by_p = {}
for v in variants:
    v_by_p.setdefault(v['product_id'], []).append(v)

target_brands = ['santoor', 'medimix', 'mysore sandal', 'lux', 'dettol']
for p in products:
    bname = brands.get(p.get('brand_id'), '')
    if any(tb in bname.lower() for tb in target_brands) and p.get('category_id') == 'soaps-bath':
        print(f"{p['id']} | Brand: {bname} | Name: {p['name']} | Img: {p['image_url']}")
        for v in v_by_p.get(p['id'], []):
            print(f"   Variant {v['id']}: size={v['size_label']} price={v['price']} mrp={v['mrp']} stock={v['stock']}")
