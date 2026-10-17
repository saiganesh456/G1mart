import shutil, os, json

target_dir = r'public\products\verified'

files = [
    ('bev-thums-up-250ml.webp', 'bev-thums-up-250ml-single.webp'),
    ('bev-thums-up-750ml.webp', 'bev-thums-up-750ml-single.webp'),
    ('bev-thums-up-1l.webp', 'bev-thums-up-1l-single.webp'),
    ('bev-thums-up-2l.webp', 'bev-thums-up-2l-single.webp'),
]

for src, dst in files:
    src_p = os.path.join(target_dir, src)
    dst_p = os.path.join(target_dir, dst)
    shutil.copy2(src_p, dst_p)
    print(f"Copied {src_p} -> {dst_p} ({os.path.getsize(dst_p)} bytes)")

# Update src/data/products-catalog.json
cat_p = 'src/data/products-catalog.json'
with open(cat_p, 'r', encoding='utf-8') as f:
    cat = json.load(f)

for p in cat:
    if p.get('id') == 'g1-bev001':
        p['image_url'] = '/products/verified/bev-thums-up-250ml-single.webp'
        p['imageUrl'] = '/products/verified/bev-thums-up-250ml-single.webp'
        p['image'] = '/products/verified/bev-thums-up-250ml-single.webp'
        p['image_path'] = '/products/verified/bev-thums-up-250ml-single.webp'
        for v in p.get('variants', []):
            label = (v.get('name') or v.get('unit') or '').lower()
            if '250' in label:
                v['image'] = '/products/verified/bev-thums-up-250ml-single.webp'
            elif '750' in label:
                v['image'] = '/products/verified/bev-thums-up-750ml-single.webp'
            elif '1.25' in label or ('1' in label and '2.25' not in label and '2' not in label):
                v['image'] = '/products/verified/bev-thums-up-1l-single.webp'
            elif '2.25' in label or '2' in label:
                v['image'] = '/products/verified/bev-thums-up-2l-single.webp'

with open(cat_p, 'w', encoding='utf-8') as f:
    json.dump(cat, f, indent=2, ensure_ascii=False)
print("Updated products-catalog.json")

# Update data/migrated_products.json
mig_prods_p = 'data/migrated_products.json'
with open(mig_prods_p, 'r', encoding='utf-8') as f:
    mig_prods = json.load(f)

for p in mig_prods:
    if p.get('id') == 'g1-bev001':
        p['image_url'] = '/products/verified/bev-thums-up-250ml-single.webp'
        p['imageUrl'] = '/products/verified/bev-thums-up-250ml-single.webp'
        p['image'] = '/products/verified/bev-thums-up-250ml-single.webp'
        p['image_path'] = '/products/verified/bev-thums-up-250ml-single.webp'

with open(mig_prods_p, 'w', encoding='utf-8') as f:
    json.dump(mig_prods, f, indent=2, ensure_ascii=False)
print("Updated data/migrated_products.json")

# Update data/migrated_product_variants.json
mig_vars_p = 'data/migrated_product_variants.json'
with open(mig_vars_p, 'r', encoding='utf-8') as f:
    mig_vars = json.load(f)

for v in mig_vars:
    if v.get('product_id') == 'g1-bev001':
        label = (v.get('size_label') or '').lower()
        if '250' in label:
            v['image_url'] = '/products/verified/bev-thums-up-250ml-single.webp'
        elif '750' in label:
            v['image_url'] = '/products/verified/bev-thums-up-750ml-single.webp'
        elif '1.25' in label or ('1' in label and '2.25' not in label and '2' not in label):
            v['image_url'] = '/products/verified/bev-thums-up-1l-single.webp'
        elif '2.25' in label or '2' in label:
            v['image_url'] = '/products/verified/bev-thums-up-2l-single.webp'

with open(mig_vars_p, 'w', encoding='utf-8') as f:
    json.dump(mig_vars, f, indent=2, ensure_ascii=False)
print("Updated data/migrated_product_variants.json")
