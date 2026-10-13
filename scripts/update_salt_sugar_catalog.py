import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

PROD_FILE = os.path.join(DATA_DIR, 'migrated_products.json')
VAR_FILE = os.path.join(DATA_DIR, 'migrated_product_variants.json')
BRANDS_FILE = os.path.join(DATA_DIR, 'migrated_brands.json')

with open(PROD_FILE, 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(VAR_FILE, 'r', encoding='utf-8') as f:
    variants = json.load(f)

with open(BRANDS_FILE, 'r', encoding='utf-8') as f:
    brands = json.load(f)

print(f"Initial: {len(products)} products, {len(variants)} variants, {len(brands)} brands")

# Ensure required brands exist with clean display names
brand_entries = {
    'brand-tata-salt': 'Tata Salt',
    'brand-aashirvaad': 'Aashirvaad',
    'brand-catch': 'Catch',
    'brand-puro': 'Puro',
    'brand-madhur': 'Madhur',
    'brand-trust': 'Trust',
    'brand-parrys': "Parry's",
    'brand-sugar-free': 'Sugar Free',
    'brand-24-mantra': '24 Mantra Organic',
    'brand-organic-tattva': 'Organic Tattva',
    'brand-patanjali': 'Patanjali',
    'brand-dabur': 'Dabur',
    'brand-lion': 'Lion',
    'brand-g1mart': 'Jeevan Mart'
}

existing_brand_ids = {b['id']: b for b in brands}
for b_id, b_name in brand_entries.items():
    if b_id in existing_brand_ids:
        existing_brand_ids[b_id]['name'] = b_name
    else:
        brands.append({'id': b_id, 'name': b_name, 'logo_url': None})

# 1. Reassign Poha (Atukulu) and Sabudana (Saggubiyyam) to "atta-rice-dal"
for p in products:
    if p['id'] in ['g1-sug020', 'g1-sug021', 'g1-sug022', 'g1-sug023', 'g1-sug024']:
        p['category_id'] = 'atta-rice-dal'
        p['sub_category'] = 'Millets & Poha'
        print(f"Reassigned {p['id']} ({p['name']}) to atta-rice-dal -> Millets & Poha")

# 2. Curated Pristine Products for "sugar-salt-staples"
CURATED_SUGAR_SALT_PRODUCTS = [
    # ── Salt & Rock Salt ──
    {
        'id': 'g1-sug001',
        'name': 'Tata Salt Vacuum Evaporated Iodised Salt',
        'brand_id': 'brand-tata-salt',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/verified/tata-salt-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 28, 'mrp': 30, 'stock': 120}
        ]
    },
    {
        'id': 'g1-sug002',
        'name': 'Tata Salt Lite Low Sodium Salt',
        'brand_id': 'brand-tata-salt',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/packshots/tata-salt-lite-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 45, 'mrp': 50, 'stock': 60}
        ]
    },
    {
        'id': 'g1-sug003',
        'name': 'Tata Salt Rock Salt (Sendha Namak)',
        'brand_id': 'brand-tata-salt',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/packshots/tata-rock-salt-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 110, 'mrp': 120, 'stock': 40}
        ]
    },
    {
        'id': 'g1-sug004',
        'name': 'Aashirvaad Iodised Salt',
        'brand_id': 'brand-aashirvaad',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/verified/aashirvaad-salt-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 26, 'mrp': 30, 'stock': 85}
        ]
    },
    {
        'id': 'g1-sug005',
        'name': 'Aashirvaad Crystal Salt (Kallu Uppu)',
        'brand_id': 'brand-aashirvaad',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/verified/aashirvaad-crystal-salt-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 24, 'mrp': 28, 'stock': 75}
        ]
    },
    {
        'id': 'g1-sug006',
        'name': 'Catch Table Salt Sprinkler',
        'brand_id': 'brand-catch',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/verified/catch-table-salt-sprinkler-200g.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '200 g', 'price': 42, 'mrp': 45, 'stock': 50}
        ]
    },
    {
        'id': 'g1-sug026',
        'name': 'Puro Healthy Salt (Natural Himalayan Pink Rock Salt)',
        'brand_id': 'brand-puro',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/verified/puro-rock-salt-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 115, 'mrp': 129, 'stock': 35}
        ]
    },
    {
        'id': 'g1-sug025',
        'name': 'Jeevan Mart Natural Crystal Salt (కల్లు ఉప్పు)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/generated_pouches/g1_crystal_salt_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 18, 'mrp': 22, 'stock': 200}
        ]
    },
    {
        'id': 'g1-sug027',
        'name': 'Jeevan Mart Iodised Table Salt (మెత్తటి ఉప్పు)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Tata & Crystal Salt',
        'image_url': '/products/generated_pouches/g1_table_salt_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 20, 'mrp': 25, 'stock': 150}
        ]
    },

    # ── Sugar & Sulphur-Free ──
    {
        'id': 'g1-sug007',
        'name': 'Madhur Pure & Hygienic Sulphurless Sugar',
        'brand_id': 'brand-madhur',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Sugar & Sulphur-Free',
        'image_url': '/products/verified/madhur-sugar-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 58, 'mrp': 65, 'stock': 90},
            {'size_label': '5 kg', 'price': 275, 'mrp': 310, 'stock': 30}
        ]
    },
    {
        'id': 'g1-sug009',
        'name': 'Trust Classic Pure Cane Sugar',
        'brand_id': 'brand-trust',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Sugar & Sulphur-Free',
        'image_url': '/products/packshots/trust-classic-sugar-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 56, 'mrp': 62, 'stock': 65}
        ]
    },
    {
        'id': 'g1-sug028',
        'name': "Parry's Pure Refined White Sugar",
        'brand_id': 'brand-parrys',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Sugar & Sulphur-Free',
        'image_url': '/products/verified/parrys-sugar-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 55, 'mrp': 60, 'stock': 80}
        ]
    },
    {
        'id': 'g1-sug029',
        'name': 'Sugar Free Gold Low Calorie Sweetener (Pellets)',
        'brand_id': 'brand-sugar-free',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Sugar & Sulphur-Free',
        'image_url': '/products/verified/sugar-free-gold-100p.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '100 Pellets', 'price': 75, 'mrp': 80, 'stock': 50}
        ]
    },
    {
        'id': 'g1-sug015',
        'name': 'Jeevan Mart Refined White Sugar (పంచదార)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Sugar & Sulphur-Free',
        'image_url': '/products/generated_pouches/g1_sugar_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 48, 'mrp': 55, 'stock': 250},
            {'size_label': '2 kg', 'price': 95, 'mrp': 110, 'stock': 120},
            {'size_label': '5 kg', 'price': 235, 'mrp': 265, 'stock': 80}
        ]
    },
    {
        'id': 'g1-sug019',
        'name': 'Jeevan Mart Patika Bellam (పటిక బెల్లం / Mishri Rock Sugar)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Sugar & Sulphur-Free',
        'image_url': '/products/generated_pouches/g1_patika_bellam_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '500 g', 'price': 48, 'mrp': 60, 'stock': 60}
        ]
    },

    # ── Jaggery & Bellam ──
    {
        'id': 'g1-sug010',
        'name': 'Organic Tattva Organic Jaggery Powder',
        'brand_id': 'brand-organic-tattva',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Country Bellam (Jaggery)',
        'image_url': '/products/packshots/organic-tattva-jaggery-powder-500g.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '500 g', 'price': 85, 'mrp': 99, 'stock': 40}
        ]
    },
    {
        'id': 'g1-sug011',
        'name': '24 Mantra Organic Jaggery Block',
        'brand_id': 'brand-24-mantra',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Country Bellam (Jaggery)',
        'image_url': '/products/packshots/24-mantra-organic-jaggery-500g.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '500 g', 'price': 75, 'mrp': 85, 'stock': 45}
        ]
    },
    {
        'id': 'g1-sug012',
        'name': 'Patanjali Jaggery Gur',
        'brand_id': 'brand-patanjali',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Country Bellam (Jaggery)',
        'image_url': '/products/packshots/patanjali-jaggery-1kg.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '1 kg', 'price': 88, 'mrp': 95, 'stock': 50}
        ]
    },
    {
        'id': 'g1-sug016',
        'name': 'Jeevan Mart Pure Country Bellam (స్వచ్ఛమైన బెల్లం)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Country Bellam (Jaggery)',
        'image_url': '/products/generated_pouches/g1_bellam_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '500 g', 'price': 45, 'mrp': 55, 'stock': 120},
            {'size_label': '1 kg', 'price': 85, 'mrp': 100, 'stock': 90}
        ]
    },
    {
        'id': 'g1-sug018',
        'name': 'Jeevan Mart Pure Thati Bellam (తాటి బెల్లం / Palm Jaggery)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Country Bellam (Jaggery)',
        'image_url': '/products/generated_pouches/g1_thati_bellam_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '500 g', 'price': 155, 'mrp': 180, 'stock': 35}
        ]
    },
    {
        'id': 'g1-sug030',
        'name': 'Jeevan Mart Organic Jaggery Powder (బెల్లం తూలు)',
        'brand_id': 'brand-g1mart',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Country Bellam (Jaggery)',
        'image_url': '/products/generated_pouches/g1_jaggery_powder_pouch.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '500 g', 'price': 55, 'mrp': 65, 'stock': 80},
            {'size_label': '1 kg', 'price': 105, 'mrp': 125, 'stock': 50}
        ]
    },

    # ── Pure Honey & Sweeteners ──
    {
        'id': 'g1-sug014',
        'name': 'Dabur 100% Pure Honey',
        'brand_id': 'brand-dabur',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Pure Honey & Tamarind',
        'image_url': '/products/verified/dabur-honey-500g.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '250 g', 'price': 135, 'mrp': 155, 'stock': 40},
            {'size_label': '500 g', 'price': 235, 'mrp': 270, 'stock': 55}
        ]
    },
    {
        'id': 'g1-sug031',
        'name': 'Lion Kashmir Honey',
        'brand_id': 'brand-lion',
        'category_id': 'sugar-salt-staples',
        'sub_category': 'Pure Honey & Tamarind',
        'image_url': '/products/verified/lion-honey-500g.webp',
        'image_status': 'verified',
        'is_active': True,
        'variants': [
            {'size_label': '250 g', 'price': 120, 'mrp': 140, 'stock': 30},
            {'size_label': '500 g', 'price': 215, 'mrp': 250, 'stock': 45}
        ]
    }
]

# Deactivate obsolete/duplicate IDs in sugar-salt-staples
OBSOLETE_IDS = {
    'g1-p0028', 'g1-p0138', 'g1-p0160', 'g1-p0185', 'g1-p0200', 'g1-p0350',
    'g1-p0379', 'g1-p0402', 'g1-p0482', 'g1-p0716', 'g1-p0769', 'g1-p0855',
    'g1-p0976', 'g1-sug008', 'g1-sug013', 'g1-sug017'
}

for p in products:
    if p['id'] in OBSOLETE_IDS:
        p['is_active'] = False
        p['isActive'] = False

# Upsert curated products into products list
prod_map = {p['id']: p for p in products}
var_map = {}
for v in variants:
    pid = v['product_id']
    if pid not in var_map:
        var_map[pid] = []
    var_map[pid].append(v)

for item in CURATED_SUGAR_SALT_PRODUCTS:
    p_id = item['id']
    prod_data = {
        'id': p_id,
        'name': item['name'],
        'brand_id': item['brand_id'],
        'category_id': item['category_id'],
        'sub_category': item['sub_category'],
        'image_url': item['image_url'],
        'image_status': item['image_status'],
        'is_active': True,
        'isActive': True
    }
    prod_map[p_id] = prod_data

    # Rebuild variants for curated item
    new_vars = []
    for idx, var in enumerate(item['variants'], 1):
        v_id = f"var-{p_id}-{idx}"
        new_vars.append({
            'id': v_id,
            'product_id': p_id,
            'size_label': var['size_label'],
            'price': var['price'],
            'mrp': var['mrp'],
            'stock': var['stock']
        })
    var_map[p_id] = new_vars

# Flatten updated products and variants
final_products = list(prod_map.values())
final_variants = []
for p_vars in var_map.values():
    final_variants.extend(p_vars)

# Save updated files
with open(PROD_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_products, f, indent=2, ensure_ascii=False)

with open(VAR_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_variants, f, indent=2, ensure_ascii=False)

with open(BRANDS_FILE, 'w', encoding='utf-8') as f:
    json.dump(brands, f, indent=2, ensure_ascii=False)

print("\n=== CATALOG UPDATE SUMMARY ===")
print(f"Total Products: {len(final_products)}")
print(f"Total Variants: {len(final_variants)}")
print(f"Total Brands: {len(brands)}")
active_sugar_salt = [p for p in final_products if p.get('category_id') == 'sugar-salt-staples' and p.get('is_active') is not False]
print(f"Active Products in 'sugar-salt-staples': {len(active_sugar_salt)}")
for p in active_sugar_salt:
    print(f"  • {p['name']} [{p['sub_category']}] -> {p['image_url']}")
