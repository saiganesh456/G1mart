import json
import os
import re

# File paths
PROD_FILE = "data/migrated_products.json"
VAR_FILE = "data/migrated_product_variants.json"
BRAND_FILE = "data/migrated_brands.json"
CAT_FILE = "data/migrated_categories.json"

with open(PROD_FILE, 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(VAR_FILE, 'r', encoding='utf-8') as f:
    variants = json.load(f)

with open(BRAND_FILE, 'r', encoding='utf-8') as f:
    brands = json.load(f)

brands_map = {b['id']: b for b in brands}

# Brand image mappings
PACKSHOT_BRAND_MAP = {
    'santoor': '/products/packshots/santoor-soap.png',
    'medimix': '/products/packshots/mysore-sandal-soap.png', # Clean green ayurvedic soap cut-out
    'mysore sandal': '/products/packshots/mysore-sandal-soap.png',
    'lux': '/products/packshots/lux-soap.png',
    'dettol': '/products/packshots/dettol-soap.png',
    'dove': '/products/packshots/dove-soap.png',
    'pears': '/products/packshots/pears-soap.png',
    'cinthol': '/products/packshots/cinthol-soap.png',
    'lifebuoy': '/products/packshots/lifebuoy-soap.png',
    'aashirvaad': '/products/packshots/aashirvaad-atta.png',
    'tata': '/products/packshots/tata-salt.png',
    'surf excel': '/products/packshots/surf-excel.png',
    'vim': '/products/packshots/vim-bar.png',
    'maggi': '/products/packshots/maggi-noodles.png',
    'colgate': '/products/packshots/colgate-toothpaste.png',
    'horlicks': '/products/packshots/horlicks.png',
    'kurkure': '/products/packshots/kurkure.png',
    'lays': '/products/packshots/lays-chips.png',
    'good day': '/products/packshots/good-day.png',
    'parle-g': '/products/packshots/parle-g.png',
    'parle': '/products/packshots/parle-g.png',
    'amul': '/products/packshots/amul-milk.jpg',
    'wagh bakri': '/products/packshots/wagh-bakri-tea.jpg',
    'red label': '/products/packshots/red-label-tea.png',
    'bru': '/products/packshots/bru-instant.png',
    'thums up': '/products/packshots/thums-up.png',
    'coca-cola': '/products/packshots/coca-cola.png',
    'cadbury': '/products/packshots/cadbury-dairy-milk.png',
    '5 star': '/products/packshots/cadbury-5-star.png',
}

# Specific curated soap definitions matching user requirements
CURATED_SOAPS = {
    'g1-p0615': {
        'name': 'Santoor Sandal & Turmeric Bath Soap',
        'brand_id': 'brand-santoor',
        'image_url': '/products/packshots/santoor-soap.png',
        'variants': [
            {'size_label': '75g', 'price': 38.0, 'mrp': 40.0, 'stock': 25},
            {'size_label': '150g', 'price': 72.0, 'mrp': 80.0, 'stock': 15},
            {'size_label': '4x75g (Multipack)', 'price': 145.0, 'mrp': 160.0, 'stock': 0}, # Out of stock per req 5
            {'size_label': '4x125g (Value Pack)', 'price': 235.0, 'mrp': 260.0, 'stock': 12},
        ]
    },
    'g1-p0514': {
        'name': 'Medimix Ayurvedic Classic 18 Herbs Soap',
        'brand_id': 'brand-medimix',
        'image_url': '/products/packshots/mysore-sandal-soap.png',
        'variants': [
            {'size_label': '75g', 'price': 36.0, 'mrp': 40.0, 'stock': 20},
            {'size_label': '125g', 'price': 58.0, 'mrp': 65.0, 'stock': 14},
            {'size_label': '4x75g', 'price': 138.0, 'mrp': 155.0, 'stock': 0}, # Out of stock per req 5
            {'size_label': '5x125g (Super Saver)', 'price': 275.0, 'mrp': 310.0, 'stock': 8},
        ]
    },
    'g1-p0543': {
        'name': 'Mysore Sandal Pure Sandalwood Soap',
        'brand_id': 'brand-mysore-sandal',
        'image_url': '/products/packshots/mysore-sandal-soap.png',
        'variants': [
            {'size_label': '75g', 'price': 48.0, 'mrp': 52.0, 'stock': 30},
            {'size_label': '125g', 'price': 78.0, 'mrp': 85.0, 'stock': 18},
            {'size_label': '150g', 'price': 92.0, 'mrp': 100.0, 'stock': 12},
            {'size_label': '3x75g', 'price': 138.0, 'mrp': 150.0, 'stock': 0}, # Out of stock per req 5
        ]
    },
    'g1-p0522': {
        'name': 'LUX Rose & Vitamin E Glowing Skin Soap',
        'brand_id': 'brand-lux',
        'image_url': '/products/packshots/lux-soap.png',
        'variants': [
            {'size_label': '100g', 'price': 42.0, 'mrp': 45.0, 'stock': 25},
            {'size_label': '150g', 'price': 60.0, 'mrp': 68.0, 'stock': 18},
            {'size_label': '4x100g', 'price': 162.0, 'mrp': 180.0, 'stock': 0}, # Out of stock per req 5
            {'size_label': '4x150g (Value Pack)', 'price': 235.0, 'mrp': 270.0, 'stock': 10},
        ]
    },
    'g1-p0023': {
        'name': 'Dettol Original Germ Protection Bathing Soap',
        'brand_id': 'brand-dettol',
        'image_url': '/products/packshots/dettol-soap.png',
        'variants': [
            {'size_label': '75g', 'price': 38.0, 'mrp': 42.0, 'stock': 35},
            {'size_label': '125g', 'price': 65.0, 'mrp': 72.0, 'stock': 20},
            {'size_label': '4x75g', 'price': 145.0, 'mrp': 165.0, 'stock': 0}, # Out of stock per req 5
            {'size_label': '4x125g (Buy 3 Get 1)', 'price': 245.0, 'mrp': 285.0, 'stock': 15},
        ]
    },
    'g1-p0159': {
        'name': 'Dettol Skincare Nourishing Soap',
        'brand_id': 'brand-dettol',
        'image_url': '/products/packshots/dettol-soap.png',
        'variants': [
            {'size_label': '75g', 'price': 40.0, 'mrp': 44.0, 'stock': 25},
            {'size_label': '125g', 'price': 68.0, 'mrp': 75.0, 'stock': 18},
            {'size_label': '4x125g', 'price': 255.0, 'mrp': 295.0, 'stock': 10},
        ]
    },
    'g1-p0102': {
        'name': 'Santoor Hand Wash Gentle Care',
        'brand_id': 'brand-santoor',
        'image_url': '/products/packshots/santoor-soap.png',
        'variants': [
            {'size_label': '200ml (Pump)', 'price': 85.0, 'mrp': 95.0, 'stock': 20},
            {'size_label': '175ml (Refill)', 'price': 48.0, 'mrp': 55.0, 'stock': 18},
            {'size_label': '750ml (Refill Pack)', 'price': 140.0, 'mrp': 165.0, 'stock': 0}, # Out of stock
        ]
    },
}

# Update products list and variants list
updated_products = []
updated_variants = []

# Map existing variants by product_id
var_map = {}
for v in variants:
    var_map.setdefault(v['product_id'], []).append(v)

for p in products:
    pid = p['id']
    b_id = p.get('brand_id', '')
    b_name = brands_map.get(b_id, {}).get('name', 'G1 Mart Fresh')
    cat_id = p.get('category_id', '')

    # Apply curated overrides
    if pid in CURATED_SOAPS:
        curated = CURATED_SOAPS[pid]
        p['name'] = curated['name']
        p['brand_id'] = curated['brand_id']
        p['image_url'] = curated['image_url']
        updated_products.append(p)
        v_idx = 1
        for cv in curated['variants']:
            updated_variants.append({
                'id': f"{pid}-v{v_idx}",
                'product_id': pid,
                'size_label': cv['size_label'],
                'price': float(cv['price']),
                'mrp': float(cv['mrp']),
                'stock': int(cv['stock']),
            })
            v_idx += 1
        continue

    # Set image if matching known brand packshots
    b_lower = b_name.lower()
    for pk, img_url in PACKSHOT_BRAND_MAP.items():
        if pk in b_lower or pk in p['name'].lower():
            if not p.get('image_url') or p['image_url'].endswith('placeholder.svg'):
                p['image_url'] = img_url
            break

    p_vars = var_map.get(pid, [])
    if not p_vars:
        # Create a default variant
        p_vars = [{
            'id': f"{pid}-v1",
            'product_id': pid,
            'size_label': '1 unit',
            'price': 45.0,
            'mrp': 50.0,
            'stock': 15,
        }]

    # Ensure all variants have clean sizes, non-zero prices and realistic MRPs
    cleaned_p_vars = []
    v_idx = 1
    for v in p_vars:
        sz = v.get('size_label') or '1 unit'
        if sz.lower() in ('pieces', 'piece', 'pc', 'set', 'pack', 'standard'):
            sz = '1 unit'
        
        pr = float(v.get('price') or 0.0)
        mr = float(v.get('mrp') or pr)
        if pr <= 0:
            pr = 45.0
            mr = 50.0
        elif mr < pr:
            mr = round(pr * 1.15, 0)
        elif mr == pr:
            mr = round(pr * 1.12, 0)

        st = int(v.get('stock') or 15)

        cleaned_p_vars.append({
            'id': f"{pid}-v{v_idx}",
            'product_id': pid,
            'size_label': sz,
            'price': round(pr, 2),
            'mrp': round(mr, 2),
            'stock': st,
        })
        v_idx += 1

    updated_products.append(p)
    updated_variants.extend(cleaned_p_vars)

# Save updated files
with open(PROD_FILE, 'w', encoding='utf-8') as f:
    json.dump(updated_products, f, indent=2)

with open(VAR_FILE, 'w', encoding='utf-8') as f:
    json.dump(updated_variants, f, indent=2)

print(f"Enriched {len(updated_products)} products and {len(updated_variants)} variants successfully.")
