import json
import os
import re
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

PROD_PATH = r"data\migrated_products.json"
VAR_PATH = r"data\migrated_product_variants.json"

print("1. Backing up migrated files...")
shutil.copyfile(PROD_PATH, f"{PROD_PATH}.backup_audit_sort")
shutil.copyfile(VAR_PATH, f"{VAR_PATH}.backup_audit_sort")

with open(PROD_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(VAR_PATH, 'r', encoding='utf-8') as f:
    variants = json.load(f)

print(f"Loaded {len(products)} products and {len(variants)} variants from data/")

# -------------------------------------------------------------
# 2. Update specific products in migrated_products.json
# -------------------------------------------------------------
print("\n2. Updating products with verified images...")

for p in products:
    pid = p.get('id')
    if pid == 'g1-swt007':
        p['name'] = "Cadbury Perk Double Chocolate Wafer Bar"
        p['image_url'] = "/products/verified/swt-cadbury-perk.webp"
        p['imageUrl'] = "/products/verified/swt-cadbury-perk.webp"
        p['image'] = "/products/verified/swt-cadbury-perk.webp"
    elif pid == 'g1-swt040':
        p['image_url'] = "/products/verified/swt-cadbury-perk.webp"
        p['imageUrl'] = "/products/verified/swt-cadbury-perk.webp"
        p['image'] = "/products/verified/swt-cadbury-perk.webp"
    elif pid == 'g1-bev003':
        p['image_url'] = "/products/verified/bev-sprite-750ml.webp"
        p['imageUrl'] = "/products/verified/bev-sprite-750ml.webp"
        p['image'] = "/products/verified/bev-sprite-750ml.webp"
    elif pid == 'g1-swt014':
        p['image_url'] = "/products/verified/swt-kinder-joy.webp"
        p['imageUrl'] = "/products/verified/swt-kinder-joy.webp"
        p['image'] = "/products/verified/swt-kinder-joy.webp"
    elif pid == 'g1-swt023':
        p['image_url'] = "/products/verified/bsc-peanut-chikki.webp"
        p['imageUrl'] = "/products/verified/bsc-peanut-chikki.webp"
        p['image'] = "/products/verified/bsc-peanut-chikki.webp"

# -------------------------------------------------------------
# 3. Consolidate Coca-Cola into single product in data/
# -------------------------------------------------------------
print("\n3. Unifying Coca-Cola and removing duplicates...")

coke_prod = next((p for p in products if p['id'] == 'g1-bev002'), None)
if coke_prod:
    coke_prod['name'] = "Coca-Cola Original Taste Carbonated Soft Drink"
    coke_prod['image_url'] = "/products/verified/bev-coca-cola-250ml.webp"
    coke_prod['imageUrl'] = "/products/verified/bev-coca-cola-250ml.webp"
    coke_prod['image'] = "/products/verified/bev-coca-cola-250ml.webp"

dup_coke_ids = {'g1-bev029', 'g1-bev030', 'g1-bev031', 'g1-bev032', 'g1-pos-1429'}
products = [p for p in products if p['id'] not in dup_coke_ids]

# Remove variants belonging to removed duplicate products
variants = [v for v in variants if v.get('product_id') not in dup_coke_ids]

# Ensure g1-bev002 has all 4 variants in ascending order
coke_variants = [
    {"id": "g1-bev002-v1", "product_id": "g1-bev002", "size_label": "250 ml (Small Bottle)", "price": 20, "mrp": 20, "stock": 50, "image_url": "/products/verified/bev-coca-cola-250ml.webp"},
    {"id": "g1-bev002-v2", "product_id": "g1-bev002", "size_label": "750 ml (Standard)", "price": 40, "mrp": 40, "stock": 50, "image_url": "/products/verified/bev-coca-cola-750ml.webp"},
    {"id": "g1-bev002-v3", "product_id": "g1-bev002", "size_label": "1.25 L (Medium Bottle)", "price": 65, "mrp": 65, "stock": 50, "image_url": "/products/verified/bev-coca-cola-1l.webp"},
    {"id": "g1-bev002-v4", "product_id": "g1-bev002", "size_label": "2.25 L (Party Pack)", "price": 100, "mrp": 100, "stock": 50, "image_url": "/products/verified/bev-coca-cola-2l.webp"}
]
variants = [v for v in variants if v.get('product_id') != 'g1-bev002']
variants.extend(coke_variants)

# Ensure Sprite (g1-bev003) has green bottle variants in ascending order
sprite_variants = [
    {"id": "g1-bev003-v1", "product_id": "g1-bev003", "size_label": "250 ml (Pet Bottle)", "price": 20, "mrp": 20, "stock": 50, "image_url": "/products/verified/bev-sprite-750ml.webp"},
    {"id": "g1-bev003-v2", "product_id": "g1-bev003", "size_label": "750 ml (Standard)", "price": 40, "mrp": 40, "stock": 50, "image_url": "/products/verified/bev-sprite-750ml.webp"},
    {"id": "g1-bev003-v3", "product_id": "g1-bev003", "size_label": "1 L (Large Bottle)", "price": 50, "mrp": 50, "stock": 50, "image_url": "/products/verified/bev-sprite-750ml.webp"},
    {"id": "g1-bev003-v4", "product_id": "g1-bev003", "size_label": "2.25 L (Family Pack)", "price": 100, "mrp": 100, "stock": 50, "image_url": "/products/verified/bev-sprite-2l.webp"}
]
variants = [v for v in variants if v.get('product_id') != 'g1-bev003']
variants.extend(sprite_variants)

# Ensure Cadbury Perk (g1-swt007) has variants
perk_variants = [
    {"id": "g1-swt007-v1", "product_id": "g1-swt007", "size_label": "13 g (₹5 Pack)", "price": 5, "mrp": 5, "stock": 50, "image_url": "/products/verified/swt-cadbury-perk.webp"},
    {"id": "g1-swt007-v2", "product_id": "g1-swt007", "size_label": "28 g (Double Bar)", "price": 10, "mrp": 10, "stock": 50, "image_url": "/products/verified/swt-cadbury-perk.webp"}
]
variants = [v for v in variants if v.get('product_id') != 'g1-swt007']
variants.extend(perk_variants)

# Ensure Kinder Joy (g1-swt014) has correct variant image
for v in variants:
    if v.get('product_id') == 'g1-swt014':
        v['image_url'] = "/products/verified/swt-kinder-joy.webp"
    elif v.get('product_id') == 'g1-swt023':
        v['image_url'] = "/products/verified/bsc-peanut-chikki.webp"

# -------------------------------------------------------------
# 4. Add missing items from Inventory to data/
# -------------------------------------------------------------
print("\n4. Adding missing inventory items to data/...")

prod_ids = set(p['id'] for p in products)

new_migrated_products = [
    {
        "id": "g1-pos-0876",
        "name": "Sprite Zero Sugar Lemon-Lime Soft Drink",
        "brand_id": "brand-sprite",
        "brand": "Sprite",
        "category_id": "drinks-juices",
        "category": "drinks-juices",
        "sub_category": "Thums Up, Coca-Cola & Soft Drinks",
        "subCategory": "Thums Up, Coca-Cola & Soft Drinks",
        "image_url": "/products/verified/bev-sprite-zero-750ml.webp",
        "imageUrl": "/products/verified/bev-sprite-zero-750ml.webp",
        "image": "/products/verified/bev-sprite-zero-750ml.webp",
        "image_status": "verified",
        "barcode": "8901047562888",
        "inStock": True,
        "is_active": True,
        "price": 40,
        "mrp": 40
    },
    {
        "id": "g1-pos-0888",
        "name": "Kinley Salty Lemon Carbonated Soda",
        "brand_id": "brand-kinley",
        "brand": "Kinley",
        "category_id": "drinks-juices",
        "category": "drinks-juices",
        "sub_category": "Water, Soda & Mixers",
        "subCategory": "Water, Soda & Mixers",
        "image_url": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "imageUrl": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "image": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "image_status": "verified",
        "barcode": "8901047562889",
        "inStock": True,
        "is_active": True,
        "price": 20,
        "mrp": 20
    },
    {
        "id": "g1-pos-0540",
        "name": "Sri Krishna White Sesame Chikki (Til Chikki)",
        "brand_id": "brand-sri-krishna",
        "brand": "Sri Krishna",
        "category_id": "sweets-chocolates",
        "category": "sweets-chocolates",
        "sub_category": "Packaged Traditional Sweets",
        "subCategory": "Packaged Traditional Sweets",
        "image_url": "/products/verified/snk-white-sesame-chikki.webp",
        "imageUrl": "/products/verified/snk-white-sesame-chikki.webp",
        "image": "/products/verified/snk-white-sesame-chikki.webp",
        "image_status": "verified",
        "barcode": "8906054054011",
        "inStock": True,
        "is_active": True,
        "price": 35,
        "mrp": 35
    }
]

new_migrated_variants = [
    {"id": "g1-pos-0876-v1", "product_id": "g1-pos-0876", "size_label": "750 ml", "price": 40, "mrp": 40, "stock": 50, "image_url": "/products/verified/bev-sprite-zero-750ml.webp"},
    {"id": "g1-pos-0888-v1", "product_id": "g1-pos-0888", "size_label": "750 ml", "price": 20, "mrp": 20, "stock": 50, "image_url": "/products/verified/bev-kinley-lemon-soda-750ml.webp"},
    {"id": "g1-pos-0540-v1", "product_id": "g1-pos-0540", "size_label": "100 g", "price": 35, "mrp": 35, "stock": 50, "image_url": "/products/verified/snk-white-sesame-chikki.webp"},
    {"id": "g1-pos-0540-v2", "product_id": "g1-pos-0540", "size_label": "200 g", "price": 65, "mrp": 70, "stock": 50, "image_url": "/products/verified/snk-white-sesame-chikki.webp"}
]

for p in new_migrated_products:
    if p['id'] not in prod_ids:
        products.append(p)
        print(f"Added product {p['name']} ({p['id']})")

existing_var_ids = set(v['id'] for v in variants)
for v in new_migrated_variants:
    if v['id'] not in existing_var_ids:
        variants.append(v)

# -------------------------------------------------------------
# 5. Ascending order sorting for ALL product variants in data/
# -------------------------------------------------------------
print("\n5. Sorting all product variants in ASCENDING ORDER...")

def parse_qty_normalized(v):
    text = ''
    for field in ['size_label', 'unit', 'name']:
        val = v.get(field)
        if val:
            text += ' ' + str(val)
    text = text.lower().strip()
    
    # Multipack check: e.g. '5 x 110 g'
    m_multi = re.search(r'(\d+)\s*x\s*([\d\.]+)\s*(kg|g|gm|ml|l)', text)
    if m_multi:
        count = float(m_multi.group(1))
        unit_val = float(m_multi.group(2))
        u = m_multi.group(3)
        if u in ['kg', 'l']:
            return count * unit_val * 1000.0
        return count * unit_val
    
    # kg
    m = re.search(r'([\d\.]+)\s*(?:kg|kgs|kilo)', text)
    if m:
        return float(m.group(1)) * 1000.0
    
    # liter / l
    m = re.search(r'([\d\.]+)\s*(?:ltr|ltrs|liter|liters|litre|litres|\bl\b)', text)
    if m:
        return float(m.group(1)) * 1000.0
        
    # ml
    m = re.search(r'([\d\.]+)\s*(?:ml)', text)
    if m:
        return float(m.group(1))
        
    # g / gm / gms / grams
    m = re.search(r'([\d\.]+)\s*(?:g|gm|gms|gram|grams)\b', text)
    if m:
        return float(m.group(1))
        
    # pack / pcs / count / eggs / bags / rolls
    m = re.search(r'([\d\.]+)\s*(?:pc|pcs|pack|pk|piece|pieces|tablets|capsules|units|count|bags|eggs|bars|rolls|roll)\b', text)
    if m:
        return float(m.group(1))
        
    # bare number
    m = re.search(r'([\d\.]+)', text)
    if m:
        return float(m.group(1))
        
    return float(v.get('price', 0))

# Group variants by product_id
vars_by_prod = {}
for v in variants:
    pid = v.get('product_id')
    if pid not in vars_by_prod:
        vars_by_prod[pid] = []
    vars_by_prod[pid].append(v)

sorted_variants = []
# Iterate in the order of products
seen_pids = set()
for p in products:
    pid = p['id']
    seen_pids.add(pid)
    p_vars = vars_by_prod.get(pid, [])
    if len(p_vars) > 1:
        # Sort ascending by quantity, then price
        p_vars_sorted = sorted(p_vars, key=lambda v: (parse_qty_normalized(v), float(v.get('price', 0))))
        sorted_variants.extend(p_vars_sorted)
    else:
        sorted_variants.extend(p_vars)

# Add any remaining variants whose products might not be in products
for pid, p_vars in vars_by_prod.items():
    if pid not in seen_pids:
        sorted_variants.extend(p_vars)

print(f"Sorted variants for {len(vars_by_prod)} products. Total variants: {len(sorted_variants)}")

# -------------------------------------------------------------
# 6. Save updated migrated JSONs
# -------------------------------------------------------------
with open(PROD_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

with open(VAR_PATH, 'w', encoding='utf-8') as f:
    json.dump(sorted_variants, f, indent=2, ensure_ascii=False)

print(f"\nFinal saved to {PROD_PATH} ({len(products)} products) and {VAR_PATH} ({len(sorted_variants)} variants).")
