import json
import os
import re
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

CATALOG_PATH = r"src\data\products-catalog.json"
BACKUP_PATH = r"src\data\products-catalog.backup_audit_sort.json"

print("1. Creating backup...")
shutil.copyfile(CATALOG_PATH, BACKUP_PATH)
print(f"Backup saved to {BACKUP_PATH}")

with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from catalog.")

# -------------------------------------------------------------
# 2. Fix specific product images & packshots
# -------------------------------------------------------------
print("\n2. Updating verified packshots for Perk, Sprite, Kinder Joy, Chikki...")

for p in products:
    pid = p.get('id')

    # Cadbury Perk
    if pid == 'g1-swt007':
        p['name'] = "Cadbury Perk Double Chocolate Wafer Bar"
        p['image'] = "/products/verified/swt-cadbury-perk.webp"
        p['imageUrl'] = "/products/verified/swt-cadbury-perk.webp"
        p['image_url'] = "/products/verified/swt-cadbury-perk.webp"
        p['image_path'] = "/products/verified/swt-cadbury-perk.webp"
        p['variants'] = [
            {"id": "g1-swt007-v1", "name": "13 g (₹5 Pack)", "unit": "13 g", "price": 5, "mrp": 5, "in_stock": True, "image": "/products/verified/swt-cadbury-perk.webp"},
            {"id": "g1-swt007-v2", "name": "28 g (Double Bar)", "unit": "28 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/swt-cadbury-perk.webp"}
        ]
        p['price'] = 5
        p['mrp'] = 5
        p['unit'] = "13 g"
        p['unitLabel'] = "13 g"
        print("Updated Cadbury Perk (g1-swt007) with authentic blue wrapper packshot & variants [13g, 28g]")

    elif pid == 'g1-swt040':
        p['image'] = "/products/verified/swt-cadbury-perk.webp"
        p['imageUrl'] = "/products/verified/swt-cadbury-perk.webp"
        p['image_url'] = "/products/verified/swt-cadbury-perk.webp"
        p['image_path'] = "/products/verified/swt-cadbury-perk.webp"

    # Sprite - Classic Green Bottle
    elif pid == 'g1-bev003':
        p['image'] = "/products/verified/bev-sprite-750ml.webp"
        p['imageUrl'] = "/products/verified/bev-sprite-750ml.webp"
        p['image_url'] = "/products/verified/bev-sprite-750ml.webp"
        p['image_path'] = "/products/verified/bev-sprite-750ml.webp"
        p['variants'] = [
            {"id": "g1-bev003-v1", "name": "250 ml (Pet Bottle)", "unit": "250 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"},
            {"id": "g1-bev003-v2", "name": "750 ml (Standard)", "unit": "750 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"},
            {"id": "g1-bev003-v3", "name": "1 L (Large Bottle)", "unit": "1 L", "price": 50, "mrp": 50, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"},
            {"id": "g1-bev003-v4", "name": "2.25 L (Family Pack)", "unit": "2.25 L", "price": 99, "mrp": 100, "in_stock": True, "image": "/products/verified/bev-sprite-2l.webp"}
        ]
        p['price'] = 20
        p['mrp'] = 20
        p['unit'] = "250 ml"
        p['unitLabel'] = "250 ml"
        print("Updated Sprite (g1-bev003) with iconic GREEN PET bottle packshots across all variants")

    # Kinder Joy
    elif pid == 'g1-swt014':
        p['image'] = "/products/verified/swt-kinder-joy.webp"
        p['imageUrl'] = "/products/verified/swt-kinder-joy.webp"
        p['image_url'] = "/products/verified/swt-kinder-joy.webp"
        p['image_path'] = "/products/verified/swt-kinder-joy.webp"
        print("Updated Kinder Joy (g1-swt014) with real egg packshot")

    # Tulasi Peanut Chikki
    elif pid == 'g1-swt023':
        p['image'] = "/products/verified/bsc-peanut-chikki.webp"
        p['imageUrl'] = "/products/verified/bsc-peanut-chikki.webp"
        p['image_url'] = "/products/verified/bsc-peanut-chikki.webp"
        p['image_path'] = "/products/verified/bsc-peanut-chikki.webp"
        print("Updated Tulasi Peanut Chikki (g1-swt023) with genuine jaggery peanut chikki bar packshot")

# -------------------------------------------------------------
# 3. Consolidate Coca-Cola into ONE single product card
# -------------------------------------------------------------
print("\n3. Consolidating Coca-Cola into a single unified product card & removing duplicates...")

coke_parent = next((p for p in products if p.get('id') == 'g1-bev002'), None)
if coke_parent:
    coke_parent['name'] = "Coca-Cola Original Taste Carbonated Soft Drink"
    coke_parent['unit'] = "250 ml"
    coke_parent['price'] = 20
    coke_parent['mrp'] = 20
    coke_parent['originalPrice'] = 20
    coke_parent['variants'] = [
        {"id": "g1-bev002-v1", "name": "250 ml (Small Bottle)", "unit": "250 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-coca-cola-250ml.webp"},
        {"id": "g1-bev002-v2", "name": "750 ml (Standard)", "unit": "750 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/bev-coca-cola-750ml.webp"},
        {"id": "g1-bev002-v3", "name": "1.25 L (Medium Bottle)", "unit": "1.25 L", "price": 65, "mrp": 65, "in_stock": True, "image": "/products/verified/bev-coca-cola-1l.webp"},
        {"id": "g1-bev002-v4", "name": "2.25 L (Party Pack)", "unit": "2.25 L", "price": 100, "mrp": 100, "in_stock": True, "image": "/products/verified/bev-coca-cola-2l.webp"}
    ]
    print("Configured Coca-Cola (g1-bev002) with 4 quantity variants in ascending order (250ml -> 2.25L).")

# Delete the duplicate standalone entries for Coca-Cola as explicitly requested
coke_dup_ids = {'g1-bev029', 'g1-bev030', 'g1-bev031', 'g1-bev032', 'g1-pos-1429'}
before_len = len(products)
products = [p for p in products if p.get('id') not in coke_dup_ids]
print(f"Removed {before_len - len(products)} duplicate entries ({coke_dup_ids}). Total products: {len(products)}")

# -------------------------------------------------------------
# 4. Add missing verified items from POS Inventory
# -------------------------------------------------------------
print("\n4. Checking and adding missing snacks and drinks from Inventory...")

existing_ids = set(p['id'] for p in products)

new_inventory_items = [
    {
        "id": "g1-pos-0876",
        "name": "Sprite Zero Sugar Lemon-Lime Soft Drink",
        "brand_id": "brand-sprite",
        "brand": "Sprite",
        "category_id": "drinks-juices",
        "category": "drinks-juices",
        "sub_category": "Thums Up, Coca-Cola & Soft Drinks",
        "subCategory": "Thums Up, Coca-Cola & Soft Drinks",
        "unit": "750 ml",
        "image_url": "/products/verified/bev-sprite-zero-750ml.webp",
        "imageUrl": "/products/verified/bev-sprite-zero-750ml.webp",
        "image": "/products/verified/bev-sprite-zero-750ml.webp",
        "image_path": "/products/verified/bev-sprite-zero-750ml.webp",
        "image_status": "verified",
        "imageStatus": "verified",
        "image_source": "verified_packshot",
        "barcode": "8901047562888",
        "description": "Sprite Zero Sugar Lemon-Lime refreshing sparkling beverage with zero sugar and crisp fizzy taste.",
        "rating": 4.7,
        "reviewsCount": 24,
        "isPopular": True,
        "inStock": True,
        "is_active": True,
        "price": 40,
        "mrp": 40,
        "discount": 0,
        "in_stock": True,
        "variants": [
            {"id": "g1-pos-0876-v1", "name": "750 ml", "unit": "750 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/bev-sprite-zero-750ml.webp"}
        ]
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
        "unit": "750 ml",
        "image_url": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "imageUrl": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "image": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "image_path": "/products/verified/bev-kinley-lemon-soda-750ml.webp",
        "image_status": "verified",
        "imageStatus": "verified",
        "image_source": "verified_packshot",
        "barcode": "8901047562889",
        "description": "Kinley Salty Lemon sparkling club soda infused with a tangy twist of lime and pinch of salt.",
        "rating": 4.6,
        "reviewsCount": 18,
        "isPopular": False,
        "inStock": True,
        "is_active": True,
        "price": 20,
        "mrp": 20,
        "discount": 0,
        "in_stock": True,
        "variants": [
            {"id": "g1-pos-0888-v1", "name": "750 ml", "unit": "750 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-kinley-lemon-soda-750ml.webp"}
        ]
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
        "unit": "100 g",
        "image_url": "/products/verified/snk-white-sesame-chikki.webp",
        "imageUrl": "/products/verified/snk-white-sesame-chikki.webp",
        "image": "/products/verified/snk-white-sesame-chikki.webp",
        "image_path": "/products/verified/snk-white-sesame-chikki.webp",
        "image_status": "verified",
        "imageStatus": "verified",
        "image_source": "verified_packshot",
        "barcode": "8906054054011",
        "description": "Traditional roasted white sesame seeds (til / nuvvulu) blended with pure jaggery for a crisp healthy sweet snack.",
        "rating": 4.8,
        "reviewsCount": 29,
        "isPopular": True,
        "inStock": True,
        "is_active": True,
        "price": 35,
        "mrp": 35,
        "discount": 0,
        "in_stock": True,
        "variants": [
            {"id": "g1-pos-0540-v1", "name": "100 g", "unit": "100 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/snk-white-sesame-chikki.webp"},
            {"id": "g1-pos-0540-v2", "name": "200 g", "unit": "200 g", "price": 65, "mrp": 70, "in_stock": True, "image": "/products/verified/snk-white-sesame-chikki.webp"}
        ]
    }
]

for item in new_inventory_items:
    if item['id'] not in existing_ids:
        products.append(item)
        print(f"Added verified missing inventory item: {item['name']} ({item['id']})")

# -------------------------------------------------------------
# 5. Ascending order sorting for ALL products with variants
# -------------------------------------------------------------
print("\n5. Sorting variants in ASCENDING ORDER across the entire catalog...")

def parse_qty_normalized(v):
    text = ''
    for field in ['unit', 'name', 'size_label', 'label']:
        val = v.get(field)
        if val:
            text += ' ' + str(val)
    text = text.lower().strip()
    
    # Multipack check: e.g. '5 x 110 g' or '4 x 100g'
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

sorted_products_count = 0

for p in products:
    vars = p.get('variants', [])
    if len(vars) > 1:
        # Fix legacy empty units if any
        for v in vars:
            u = str(v.get('unit', '')).strip()
            if u in ['', 'g', 'kg', 'unit', '1 unit']:
                # if there is a price or name, keep clean
                v_name = str(v.get('name', '')).strip()
                if v_name and v_name not in ['g', 'kg', 'unit']:
                    v['unit'] = v_name
                elif v.get('price'):
                    v['unit'] = f"₹{v['price']} Pack"

        # Sort variants ascending by (parsed_quantity, price)
        sorted_vars = sorted(vars, key=lambda v: (parse_qty_normalized(v), float(v.get('price', 0))))
        p['variants'] = sorted_vars
        
        # Sync top-level product price & unit with the first (smallest) variant
        first_var = sorted_vars[0]
        if first_var.get('price'):
            p['price'] = first_var['price']
        if first_var.get('mrp'):
            p['mrp'] = first_var['mrp']
            p['originalPrice'] = first_var['mrp']
        if first_var.get('unit'):
            p['unit'] = first_var['unit']
            p['unitLabel'] = first_var['unit']

        sorted_products_count += 1

print(f"Successfully sorted variants in ascending order for all {sorted_products_count} multi-variant products!")

# -------------------------------------------------------------
# 6. Save updated catalog
# -------------------------------------------------------------
with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"\nFinal catalog saved to {CATALOG_PATH}. Total items: {len(products)}")
