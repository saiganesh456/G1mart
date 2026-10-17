import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update data/migrated_products.json
prods = json.load(open('data/migrated_products.json', encoding='utf-8'))

# Remove g1-bev-coke (duplicate of g1-bev002)
before_count = len(prods)
prods = [p for p in prods if p['id'] != 'g1-bev-coke']
print(f"Removed g1-bev-coke from migrated_products.json: {before_count} -> {len(prods)}")

# Fix g1-p1138 Weikfield Baking Soda (move out of drinks-juices to instant-food)
for p in prods:
    if p['id'] == 'g1-p1138':
        p['category_id'] = 'instant-food'
        p['category'] = 'instant-food'
        p['sub_category'] = 'Baking & Dessert Mixes'
        p['subCategory'] = 'Baking & Dessert Mixes'
        print("Moved g1-p1138 Weikfield Baking Soda to instant-food")

with open('data/migrated_products.json', 'w', encoding='utf-8') as f:
    json.dump(prods, f, indent=2, ensure_ascii=False)

# 2. Update data/migrated_product_variants.json
variants = json.load(open('data/migrated_product_variants.json', encoding='utf-8'))

# Remove any variants for g1-bev-coke
variants = [v for v in variants if v.get('product_id') != 'g1-bev-coke']

# Fix Thums Up (g1-bev001) variants: exactly 4 unique sizes
thums_clean_variants = [
    {
        'id': 'g1-bev001-v1',
        'product_id': 'g1-bev001',
        'size_label': '250 ml (Pet Bottle)',
        'price': 20,
        'mrp': 20,
        'stock': 50,
        'image_url': '/products/verified/bev-thums-up-250ml.webp'
    },
    {
        'id': 'g1-bev001-v2',
        'product_id': 'g1-bev001',
        'size_label': '750 ml (Standard Bottle)',
        'price': 40,
        'mrp': 40,
        'stock': 50,
        'image_url': '/products/verified/bev-thums-up-750ml.webp'
    },
    {
        'id': 'g1-bev001-v3',
        'product_id': 'g1-bev001',
        'size_label': '1.25 L (Medium Bottle)',
        'price': 65,
        'mrp': 65,
        'stock': 50,
        'image_url': '/products/verified/bev-thums-up-1l.webp'
    },
    {
        'id': 'g1-bev001-v4',
        'product_id': 'g1-bev001',
        'size_label': '2.25 L (Family Pack)',
        'price': 100,
        'mrp': 100,
        'stock': 50,
        'image_url': '/products/verified/bev-thums-up-2l.webp'
    }
]

# Remove old g1-bev001 variants and insert clean ones
variants = [v for v in variants if v.get('product_id') != 'g1-bev001']
variants.extend(thums_clean_variants)

def parse_qty_key(label):
    if not label: return ''
    s = label.lower().replace(' ', '')
    m = re.search(r'(\d+(\.\d+)?(kg|g|gm|l|ml))', s)
    if m: return m.group(1)
    return s

# Group by product_id
grouped = {}
for v in variants:
    pid = v['product_id']
    if pid not in grouped:
        grouped[pid] = []
    grouped[pid].append(v)

deduped_variants = []
for pid, pvars in grouped.items():
    if len(pvars) <= 1:
        deduped_variants.extend(pvars)
    else:
        # check duplicate quantities
        seen_keys = set()
        kept_vars = []
        for v in pvars:
            label = str(v.get('size_label') or '')
            k = parse_qty_key(label)
            # If it's a multipack or distinct pack type (pouch vs bottle, tin vs bar), distinguish it
            if 'x' in label.lower() or 'multipack' in label.lower():
                k = 'multi_' + label
            elif 'tin' in label.lower() and 'tin' not in ''.join(seen_keys):
                k = k + '_tin'
            elif 'spray' in label.lower():
                k = k + '_spray'
            elif 'refill' in label.lower() or 'refil' in label.lower():
                k = k + '_refill'
            
            if k and k in seen_keys:
                print(f"Deduplicating duplicate variant in {pid}: {label}")
                continue
            if k:
                seen_keys.add(k)
            kept_vars.append(v)
        deduped_variants.extend(kept_vars)

with open('data/migrated_product_variants.json', 'w', encoding='utf-8') as f:
    json.dump(deduped_variants, f, indent=2, ensure_ascii=False)

print(f"Updated migrated_product_variants.json: {len(deduped_variants)} variants saved.")

# 4. Also update src/data/products-catalog.json to be 100% in sync
cat = json.load(open('src/data/products-catalog.json', encoding='utf-8'))
for p in cat:
    if p['id'] == 'g1-bev001':
        p['variants'] = [
            {'id': 'g1-bev001-v1', 'name': '250 ml (Pet Bottle)', 'unit': '250 ml', 'price': 20, 'mrp': 20, 'in_stock': True, 'image': '/products/verified/bev-thums-up-250ml.webp'},
            {'id': 'g1-bev001-v2', 'name': '750 ml (Standard Bottle)', 'unit': '750 ml', 'price': 40, 'mrp': 40, 'in_stock': True, 'image': '/products/verified/bev-thums-up-750ml.webp'},
            {'id': 'g1-bev001-v3', 'name': '1.25 L (Medium Bottle)', 'unit': '1.25 L', 'price': 65, 'mrp': 65, 'in_stock': True, 'image': '/products/verified/bev-thums-up-1l.webp'},
            {'id': 'g1-bev001-v4', 'name': '2.25 L (Family Pack)', 'unit': '2.25 L', 'price': 100, 'mrp': 100, 'in_stock': True, 'image': '/products/verified/bev-thums-up-2l.webp'}
        ]
        p['price'] = 20
        p['mrp'] = 20
        p['unit'] = '250 ml'
        p['unitLabel'] = '250 ml'

with open('src/data/products-catalog.json', 'w', encoding='utf-8') as f:
    json.dump(cat, f, indent=2, ensure_ascii=False)

print("Updated src/data/products-catalog.json for Thums Up.")
