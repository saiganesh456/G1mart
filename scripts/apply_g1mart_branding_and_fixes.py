import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

prods_file = 'data/migrated_products.json'
vars_file = 'data/migrated_product_variants.json'
brands_file = 'data/migrated_brands.json'

with open(prods_file, 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(vars_file, 'r', encoding='utf-8') as f:
    variants = json.load(f)

with open(brands_file, 'r', encoding='utf-8') as f:
    brands = json.load(f)

print(f"Loaded {len(products)} products, {len(variants)} variants, {len(brands)} brands")

# 1. Update brand-g1mart in brands
for b in brands:
    if b['id'] == 'brand-g1mart' or 'jeevan' in b['name'].lower():
        b['name'] = 'G1Mart'
        b['logo_url'] = '/assets/images/g1_mart_banner_transparent.png'
        print(f"Updated brand {b['id']} to G1Mart")

# 2. Rename all "Jeevan Mart" products to "G1Mart" and fix image mismatches
retired_ids = {'g1-p0379', 'g1-p0402', 'g1-sug017', 'g1-p0769', 'g1-p0855', 'g1-p0976', 'g1-sug008'}

updated_products = []
for p in products:
    pid = p['id']
    if pid in retired_ids:
        print(f"Retiring redundant duplicate: {pid} ({p['name']})")
        continue

    # Fix Jeevan Mart names
    if 'Jeevan Mart' in p['name']:
        old_name = p['name']
        p['name'] = p['name'].replace('Jeevan Mart', 'G1Mart')
        p['brand'] = 'G1Mart'
        p['brand_id'] = 'brand-g1mart'
        print(f"Renamed: {old_name} -> {p['name']}")
    elif p.get('brand') == 'Jeevan Mart':
        p['brand'] = 'G1Mart'
        p['brand_id'] = 'brand-g1mart'

    # Fix image mismatches
    if pid == 'g1-p0482': # Aashirvaad Crystal Salt
        p['image_url'] = '/products/verified/aashirvaad-crystal-salt-1kg.webp'
        p['imageUrl'] = '/products/verified/aashirvaad-crystal-salt-1kg.webp'
        p['image'] = '/products/verified/aashirvaad-crystal-salt-1kg.webp'
        print("Fixed Aashirvaad Crystal Salt image mismatch")
    elif pid == 'g1-p0716': # Aashirvaad Salt
        p['image_url'] = '/products/verified/aashirvaad-salt-1kg.webp'
        p['imageUrl'] = '/products/verified/aashirvaad-salt-1kg.webp'
        p['image'] = '/products/verified/aashirvaad-salt-1kg.webp'
        print("Fixed Aashirvaad Salt image mismatch")
    elif pid in ['g1-p0138', 'g1-sug013']: # Dabur Honey
        p['image_url'] = '/products/packshots/dabur-honey-500g.webp'
        p['imageUrl'] = '/products/packshots/dabur-honey-500g.webp'
        p['image'] = '/products/packshots/dabur-honey-500g.webp'
        print("Fixed Dabur Honey image to high-res dabur-honey-500g.webp")
    elif pid == 'g1-sug001': # Tata Salt
        p['image_url'] = '/products/packshots/tata-salt.png'
        p['imageUrl'] = '/products/packshots/tata-salt.png'
        p['image'] = '/products/packshots/tata-salt.png'
    elif pid == 'g1-sug007': # Madhur Sugar
        p['image_url'] = '/products/packshots/madhur-sugar-clean.png'
        p['imageUrl'] = '/products/packshots/madhur-sugar-clean.png'
        p['image'] = '/products/packshots/madhur-sugar-clean.png'

    updated_products.append(p)

# 3. Add G1Mart Premium Guntur Dry Red Mirchi (ఎండు మిర్చి) to spices-masalas
mirchi_id = 'g1-canon-mirchi-01'
existing_mirchi = [p for p in updated_products if p['id'] == mirchi_id]
if not existing_mirchi:
    mirchi_product = {
        'id': mirchi_id,
        'name': 'G1Mart Premium Guntur Dry Red Mirchi (ఎండు మిర్చి)',
        'brand_id': 'brand-g1mart',
        'brand': 'G1Mart',
        'category_id': 'spices-masalas',
        'category': 'spices-masalas',
        'sub_category': 'Chilli & Turmeric Powder',
        'subCategory': 'Chilli & Turmeric Powder',
        'image_url': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
        'imageUrl': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
        'image': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
        'image_status': 'verified',
        'imageStatus': 'verified',
        'description': 'Premium sun-dried whole Guntur red chillies packed in clean white food-grade pouch with official G1Mart seal. Known for deep vibrant red color, sharp pungency, and rich aroma essential for Andhra tadka, sambar, rasam, and spicy chutneys.',
        'inStock': True,
        'is_active': True,
        'isActive': True,
        'is_verified': True,
    }
    updated_products.insert(0, mirchi_product)
    print("Added G1Mart Premium Guntur Dry Red Mirchi to spices-masalas!")

# 4. Update variants
mirchi_variants = [
    {'id': f'{mirchi_id}-v1', 'product_id': mirchi_id, 'size_label': '100 g Pouch', 'price': 38, 'mrp': 45, 'stock': 60, 'image_url': '/products/generated_pouches/g1_dry_mirchi_pouch.webp'},
    {'id': f'{mirchi_id}-v2', 'product_id': mirchi_id, 'size_label': '250 g Pouch', 'price': 89, 'mrp': 105, 'stock': 80, 'image_url': '/products/generated_pouches/g1_dry_mirchi_pouch.webp'},
    {'id': f'{mirchi_id}-v3', 'product_id': mirchi_id, 'size_label': '500 g Pouch', 'price': 169, 'mrp': 199, 'stock': 50, 'image_url': '/products/generated_pouches/g1_dry_mirchi_pouch.webp'},
    {'id': f'{mirchi_id}-v4', 'product_id': mirchi_id, 'size_label': '1 kg Value Pack', 'price': 320, 'mrp': 380, 'stock': 30, 'image_url': '/products/generated_pouches/g1_dry_mirchi_pouch.webp'},
]

updated_variants = [v for v in variants if v['product_id'] not in retired_ids and v['product_id'] != mirchi_id]
updated_variants.extend(mirchi_variants)

# Save files
with open(prods_file, 'w', encoding='utf-8') as f:
    json.dump(updated_products, f, indent=2, ensure_ascii=False)

with open(vars_file, 'w', encoding='utf-8') as f:
    json.dump(updated_variants, f, indent=2, ensure_ascii=False)

with open(brands_file, 'w', encoding='utf-8') as f:
    json.dump(brands, f, indent=2, ensure_ascii=False)

print(f"COMPLETED: {len(updated_products)} products, {len(updated_variants)} variants, {len(brands)} brands.")
