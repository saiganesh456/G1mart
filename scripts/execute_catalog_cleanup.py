import json
import os
import shutil

# Load existing files
with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)

with open('src/data/legacyIdMap.json', 'r', encoding='utf-8') as f:
    legacy_map = json.load(f)

print(f"Initial: {len(products)} products, {len(variants)} variants, {len(legacy_map)} legacy map entries")

# Backup originals
shutil.copyfile('data/migrated_products.json', 'data/migrated_products.json.bak')
shutil.copyfile('data/migrated_product_variants.json', 'data/migrated_product_variants.json.bak')
shutil.copyfile('src/data/legacyIdMap.json', 'src/data/legacyIdMap.json.bak')

prod_by_id = {p['id']: p for p in products}

# 1. Product Merges: map old_id -> canonical_id
merges = {
    # Freedom Oil duplicates
    'g1-p0418': 'g1-p1701',
    'g1-p0459': 'g1-p1701',
    'g1-p0640': 'g1-p1701',
    'g1-p0847': 'g1-p1701',
    'g1-p0950': 'g1-p1701',
    
    # Ruchi Gold duplicate
    'g1-p0458': 'g1-p0166',
    
    # Priya Gold duplicate
    'g1-p0470': 'g1-p0788',
    
    # JS Oils duplicate
    'g1-p1016': 'g1-p0619',
    
    # GRB Ghee duplicate
    'g1-p0634': 'g1-p0635',
    
    # Idhayam duplicates
    'g1-p1682': 'g1-p1667',
    'g1-p1686': 'g1-p1667',
    
    # Aashirvaad Atta duplicates
    'g1-p0426': 'g1-p1572',
    'g1-p1573': 'g1-p1572',
    
    # Aashirvaad Select Atta duplicate
    'g1-p1580': 'g1-p1579',
    
    # Nature Fresh Atta duplicate
    'g1-p1588': 'g1-p1585',
    
    # MTR Rava Idli Mix duplicate
    'g1-p1514': 'g1-p1133',
    
    # Dals duplicates
    'g1-p0380': 'g1-p0327', # Kandi Pappu 50kg bag -> Toor Dal
    'g1-p0381': 'g1-p0327', # Sai Pappu 50kg bag -> Toor Dal
    'g1-p0382': 'g1-p0391', # White Urad Dal -> Minapappu
    'g1-p0383': 'g1-p0391', # White Urad Dal 250g -> Minapappu
    'g1-p0389': 'g1-p0391', # Minapappu 50kg bag -> Minapappu
    'g1-p0390': 'g1-p0391', # Minapappu -> Minapappu
    'g1-p0386': 'g1-p0388', # Pachisenga Pappu 50kg bag -> Pachisenaga Pappu
    'g1-p0387': 'g1-p0388', # Pachisenagapappu -> Pachisenaga Pappu
    'g1-p0392': 'g1-p0393', # Verusenaga Pappu 50kg bag -> Verusenaga Pappu
    'g1-p0570': 'g1-p0412', # HR Moong Dal -> Moong Dal
    'g1-p0668': 'g1-p0412', # Moong Dall -> Moong Dal
}

# Update legacy map
for old_id, canonical_id in merges.items():
    legacy_map[old_id] = canonical_id
    # Also if any old key in legacy_map mapped to old_id, update to canonical_id
    for k, v in list(legacy_map.items()):
        if v == old_id:
            legacy_map[k] = canonical_id

# 2. Strict Cross-Category Relocations
category_relocations = {
    'g1-p0171': ('oral-care', 'Toothpaste', 'Colgate Active Salt Toothpaste'),
    'g1-p0526': ('oral-care', 'Toothpaste', 'Colgate Salt Toothpaste'),
    'g1-p0374': ('hair-care', 'Shampoos', 'Meera Badam Shampoo'),
    'g1-p0888': ('hair-care', 'Shampoos', 'Clinic Plus Rice Water Shampoo'),
    'g1-p0572': ('chips-namkeen', 'Haldiram Mixture & Sev', 'Haldiram Masala Peanuts'),
    'g1-p0578': ('chips-namkeen', 'Haldiram Mixture & Sev', 'Haldiram Salted Peanuts'),
    'g1-p0577': ('chips-namkeen', 'Haldiram Mixture & Sev', "Haldiram's Khatta Meetha"),
    'g1-p0680': ('sweets-chocolates', 'Chocolates & Candies', 'Fitday Millet Chikki'),
    'g1-p0672': ('spices-masalas', 'Sambar & Rasam Powders', 'Fried Rice Masala'),
    'g1-p0422': ('dry-fruits-cereals', 'Cashews (Jeedi Pappu)', 'VT Jeedipappu (Premium Cashews)'),
    'g1-p0440': ('oil-ghee-masala', 'Pure Cow Ghee', 'Aashirvaad Svasti Pure Cow Ghee'),
    'g1-p1131': ('instant-food', 'Oats & Cornflakes', 'MTR Poha'),
    'g1-p1132': ('instant-food', 'MTR Breakfast Mixes', 'MTR Upma Mix'),
    'g1-p1133': ('instant-food', 'MTR Breakfast Mixes', 'MTR Instant Rava Idli Mix'),
    'g1-p0615': ('soaps-bath', 'Bathing Soaps', 'Santoor Sandal & Turmeric Bath Soap'),
    'g1-p1591': ('atta-rice-dal', 'Atta & Wheat Flour', 'Patanjali Navratna Atta'),
}

for pid, (cat, sub, clean_name) in category_relocations.items():
    if pid in prod_by_id:
        p = prod_by_id[pid]
        p['category_id'] = cat
        p['category'] = cat
        p['sub_category'] = sub
        p['subCategory'] = sub
        p['name'] = clean_name
        if pid == 'g1-p0577':
            p['image_url'] = '/products/packshots/haldiram-khatta-meetha.jpg'
        elif pid == 'g1-p0440':
            p['image_url'] = 'https://www.bigbasket.com/media/uploads/p/l/266099_8-aashirvaad-svasti-ghee.jpg'
        elif pid == 'g1-p0422':
            p['image_url'] = '/products/generated_pouches/g1_cashews_pouch.webp'
        elif pid == 'g1-p1131':
            p['image_url'] = '/products/generated_pouches/g1_poha_pouch.webp'
        elif pid in ['g1-p1132', 'g1-p1133']:
            p['image_url'] = 'https://www.bigbasket.com/media/uploads/p/l/126903_8-mtr-instant-rava-idli-mix.jpg'

# 3. Product Updates & Packshot Assignments

# Atta & Flours
if 'g1-p1572' in prod_by_id:
    p = prod_by_id['g1-p1572']
    p['name'] = 'Aashirvaad Superior MP Whole Wheat Chakki Atta'
    p['brand'] = 'Aashirvaad'
    p['sub_category'] = 'Atta & Wheat Flour'
    p['subCategory'] = 'Atta & Wheat Flour'
    p['image_url'] = '/products/packshots/aashirvaad-atta-5kg.jpg'
    p['imageUrl'] = '/products/packshots/aashirvaad-atta-5kg.jpg'
    p['image_status'] = 'verified'

if 'g1-p1579' in prod_by_id:
    p = prod_by_id['g1-p1579']
    p['name'] = 'Aashirvaad Select 100% Sharbati Atta'
    p['brand'] = 'Aashirvaad'
    p['sub_category'] = 'Atta & Wheat Flour'
    p['subCategory'] = 'Atta & Wheat Flour'
    p['image_url'] = 'https://www.bigbasket.com/media/uploads/p/l/240097_10-aashirvaad-select-sharbati-atta.jpg'
    p['imageUrl'] = 'https://www.bigbasket.com/media/uploads/p/l/240097_10-aashirvaad-select-sharbati-atta.jpg'
    p['image_status'] = 'verified'

if 'g1-p1581' in prod_by_id:
    p = prod_by_id['g1-p1581']
    p['name'] = 'Pillsbury Chakki Fresh Atta'
    p['brand'] = 'Pillsbury'
    p['sub_category'] = 'Atta & Wheat Flour'
    p['subCategory'] = 'Atta & Wheat Flour'
    p['image_url'] = '/products/packshots/pillsbury-atta-5kg.jpg'
    p['imageUrl'] = '/products/packshots/pillsbury-atta-5kg.jpg'
    p['image_status'] = 'verified'

if 'g1-p1585' in prod_by_id:
    p = prod_by_id['g1-p1585']
    p['name'] = 'Nature Fresh Sampoorna Chakki Atta'
    p['brand'] = 'Nature Fresh'
    p['sub_category'] = 'Atta & Wheat Flour'
    p['subCategory'] = 'Atta & Wheat Flour'
    p['image_url'] = '/products/packshots/nature-fresh-atta-5kg.jpg'
    p['imageUrl'] = '/products/packshots/nature-fresh-atta-5kg.jpg'
    p['image_status'] = 'verified'

if 'g1-p1586' in prod_by_id:
    p = prod_by_id['g1-p1586']
    p['name'] = 'Fortune Chakki Fresh Atta 100% Whole Wheat'
    p['brand'] = 'Fortune'
    p['sub_category'] = 'Atta & Wheat Flour'
    p['subCategory'] = 'Atta & Wheat Flour'
    p['image_url'] = '/products/packshots/fortune-atta-5kg.jpg'
    p['imageUrl'] = '/products/packshots/fortune-atta-5kg.jpg'
    p['image_status'] = 'verified'

if 'g1-p1590' in prod_by_id:
    p = prod_by_id['g1-p1590']
    p['name'] = 'Patanjali Traditional Whole Wheat Chakki Atta'
    p['brand'] = 'Patanjali'
    p['sub_category'] = 'Atta & Wheat Flour'
    p['subCategory'] = 'Atta & Wheat Flour'
    p['image_url'] = '/products/packshots/patanjali-atta-5kg.jpg'
    p['imageUrl'] = '/products/packshots/patanjali-atta-5kg.jpg'
    p['image_status'] = 'verified'

# Other flours
if 'g1-p1597' in prod_by_id:
    prod_by_id['g1-p1597']['image_url'] = '/products/generated_pouches/g1_ragi_pouch.webp'
    prod_by_id['g1-p1597']['sub_category'] = 'Millets & Poha'
    prod_by_id['g1-p1597']['subCategory'] = 'Millets & Poha'

if 'g1-p1598' in prod_by_id:
    prod_by_id['g1-p1598']['image_url'] = '/products/verified/g1-p0407.webp'
    prod_by_id['g1-p1598']['sub_category'] = 'Millets & Poha'
    prod_by_id['g1-p1598']['subCategory'] = 'Millets & Poha'

if 'g1-p1599' in prod_by_id:
    prod_by_id['g1-p1599']['image_url'] = '/products/generated_pouches/g1_corn_flour_pouch.webp'
    prod_by_id['g1-p1599']['sub_category'] = 'Maida & Besan'
    prod_by_id['g1-p1599']['subCategory'] = 'Maida & Besan'

if 'g1-p1600' in prod_by_id:
    prod_by_id['g1-p1600']['image_url'] = '/products/generated_pouches/g1_maida_pouch.webp'
    prod_by_id['g1-p1600']['sub_category'] = 'Maida & Besan'
    prod_by_id['g1-p1600']['subCategory'] = 'Maida & Besan'

if 'g1-p1601' in prod_by_id:
    prod_by_id['g1-p1601']['image_url'] = '/products/generated_pouches/g1_chana_dal_pouch.webp'
    prod_by_id['g1-p1601']['sub_category'] = 'Maida & Besan'
    prod_by_id['g1-p1601']['subCategory'] = 'Maida & Besan'

if 'g1-p1028' in prod_by_id:
    prod_by_id['g1-p1028']['name'] = 'Senaga Pindi (Pure Gram Flour Besan)'
    prod_by_id['g1-p1028']['sub_category'] = 'Maida & Besan'
    prod_by_id['g1-p1028']['subCategory'] = 'Maida & Besan'
    prod_by_id['g1-p1028']['image_url'] = '/products/generated_pouches/g1_chana_dal_pouch.webp'

if 'g1-p1140' in prod_by_id:
    prod_by_id['g1-p1140']['image_url'] = '/products/generated_pouches/g1_corn_flour_pouch.webp'
    prod_by_id['g1-p1140']['sub_category'] = 'Maida & Besan'
    prod_by_id['g1-p1140']['subCategory'] = 'Maida & Besan'

# Normalize all subcategories in atta-rice-dal
atta_sub_rules = [
    (['atta', 'flour', 'wheat', 'godhumalu'], 'Atta & Wheat Flour'),
    (['rice', 'biyyam', 'basmati', 'sonamasuri'], 'Sonamasuri & Basmati Rice'),
    (['rava', 'ravva', 'sooji', 'bansi'], 'Idli & Bombay Rava'),
    (['maida', 'besan', 'corn flour', 'pindi'], 'Maida & Besan'),
    (['millet', 'korralu', 'ragi', 'sajjalu', 'jowar', 'sorghum', 'poha', 'sabudana', 'saggubiyyam'], 'Millets & Poha'),
]

for p in products:
    if p.get('category_id') == 'atta-rice-dal':
        nl = p['name'].lower()
        assigned = False
        for kws, sub_name in atta_sub_rules:
            if any(k in nl for k in kws):
                p['sub_category'] = sub_name
                p['subCategory'] = sub_name
                assigned = True
                break
        if not assigned:
            p['sub_category'] = 'Atta & Wheat Flour'
            p['subCategory'] = 'Atta & Wheat Flour'

# Cooking Oils & Ghee Updates
oil_updates = {
    'g1-p1701': {
        'name': 'Freedom Refined Sunflower Oil',
        'brand': 'Freedom',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/freedom-oil-1l.jpg',
    },
    'g1-p1627': {
        'name': 'Fortune Sunlite Refined Sunflower Oil',
        'brand': 'Fortune',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/fortune-sunlite-clean.jpg',
    },
    'g1-p1622': {
        'name': 'Gold Drop Refined Sunflower Oil',
        'brand': 'Gold Drop',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/gold-drop-sunflower-clean.jpg',
    },
    'g1-p1632': {
        'name': 'Saffola Gold Pro Healthy Edible Oil',
        'brand': 'Saffola',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/saffola-gold-oil.jpg',
    },
    'g1-p1637': {
        'name': 'Dhara Refined Sunflower Oil',
        'brand': 'Dhara',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/dhara-sunflower-oil.jpg',
    },
    'g1-p1642': {
        'name': 'Gemini Sunflower Oil',
        'brand': 'Gemini',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/gemini-sunflower-oil.jpg',
    },
    'g1-p1647': {
        'name': 'Sunpure Refined Sunflower Oil',
        'brand': 'Sunpure',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/sunpure-sunflower-oil.png',
    },
    'g1-p0788': {
        'name': 'Priya Gold Refined Sunflower Oil',
        'brand': 'Priya',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/priya-gold-oil.jpg',
    },
    'g1-p0166': {
        'name': 'Ruchi Gold Refined Palmolein Oil',
        'brand': 'Ruchi Gold',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/ruchi-gold-oil.jpg',
    },
    'g1-p1657': {
        'name': 'Fortune Soya Health Refined Soyabean Oil',
        'brand': 'Fortune',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/fortune-soya-oil.jpg',
    },
    'g1-p1662': {
        'name': 'Fortune Filtered Groundnut Oil',
        'brand': 'Fortune',
        'sub_category': 'Groundnut Oil',
        'image_url': '/products/packshots/fortune-groundnut-oil.jpg',
    },
    'g1-p0874': {
        'name': 'Freedom Double Filtered Groundnut Oil',
        'brand': 'Freedom',
        'sub_category': 'Groundnut Oil',
        'image_url': '/products/verified/g1-p0874.webp',
    },
    'g1-p0997': {
        'name': 'Vijaya Double Filtered Groundnut Oil',
        'brand': 'Vijaya',
        'sub_category': 'Groundnut Oil',
        'image_url': '/products/packshots/vijaya-groundnut-oil.jpg',
    },
    'g1-p0952': {
        'name': 'Freedom Physically Refined Rice Bran Oil',
        'brand': 'Freedom',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/verified/g1-p0952.webp',
    },
    'g1-p1667': {
        'name': 'Idhayam Pure Sesame / Gingelly Oil',
        'brand': 'Idhayam',
        'sub_category': 'Deepam & Pooja Oils',
        'image_url': '/products/packshots/idhayam-oil.jpg',
    },
    'g1-p1672': {
        'name': 'Amul Pure Ghee',
        'brand': 'Amul',
        'sub_category': 'Pure Cow Ghee',
        'image_url': '/products/packshots/amul-ghee.jpg',
    },
    'g1-p1675': {
        'name': 'Patanjali Cow Ghee',
        'brand': 'Patanjali',
        'sub_category': 'Pure Cow Ghee',
        'image_url': '/products/packshots/patanjali-cow-ghee.jpg',
    },
    'g1-p0635': {
        'name': 'GRB Pure Ghee',
        'brand': 'GRB',
        'sub_category': 'Pure Cow Ghee',
        'image_url': '/products/packshots/grb-ghee.jpg',
    },
    'g1-p0279': {
        'name': 'Hatsun Pure Ghee',
        'brand': 'Hatsun',
        'sub_category': 'Pure Cow Ghee',
        'image_url': '/products/packshots/amul-ghee.jpg',
    },
    'g1-p0156': {
        'name': 'SUN Gold Refined Sunflower Oil',
        'brand': 'Sun Gold',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/sunflower-oil.jpg',
    },
    'g1-p0589': {
        'name': 'More Light Refined Sunflower Oil 5L',
        'brand': 'More Light',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/freedom-oil-5l.jpg',
    },
    'g1-p0619': {
        'name': 'JS Refined Cooking Oil',
        'brand': 'JS',
        'sub_category': 'Sunflower Oil',
        'image_url': '/products/packshots/sunflower-oil.jpg',
    },
}

for pid, fields in oil_updates.items():
    if pid in prod_by_id:
        p = prod_by_id[pid]
        p.update(fields)
        p['imageUrl'] = fields['image_url']
        p['subCategory'] = fields['sub_category']
        p['image_status'] = 'verified'
        p['category_id'] = 'oil-ghee-masala'
        p['category'] = 'oil-ghee-masala'

# Dals & Pulses Updates in local-dals
dal_updates = {
    'g1-p0327': {
        'name': 'Kandi Pappu (Premium Toor Dal)',
        'sub_category': 'Kandi Pappu (Toor Dal)',
        'image_url': '/products/generated_pouches/g1_kandi_pappu_pouch.webp',
    },
    'g1-p0391': {
        'name': 'Minapappu (Urad Gota / Whole Black Gram)',
        'sub_category': 'Minapappu (Urad Dal)',
        'image_url': '/products/generated_pouches/g1_urad_dal_pouch.webp',
    },
    'g1-p0388': {
        'name': 'Pachisenaga Pappu (Bengal Gram / Chana Dal)',
        'sub_category': 'Senaga Pappu (Chana Dal)',
        'image_url': '/products/generated_pouches/g1_chana_dal_pouch.webp',
    },
    'g1-p0393': {
        'name': 'Verusenaga Pappu (Peanuts / Groundnuts)',
        'sub_category': 'Peanuts & Fried Gram',
        'image_url': '/products/generated_pouches/g1_groundnuts_pouch.webp',
    },
    'g1-p0412': {
        'name': 'Pesara Pappu (Yellow Moong Dal)',
        'sub_category': 'Pesara Pappu (Moong)',
        'image_url': '/products/generated_pouches/g1_yellow_moong_dal_pouch.webp',
    },
}

for pid, fields in dal_updates.items():
    if pid in prod_by_id:
        p = prod_by_id[pid]
        p.update(fields)
        p['imageUrl'] = fields['image_url']
        p['subCategory'] = fields['sub_category']
        p['image_status'] = 'verified'
        p['category_id'] = 'local-dals'
        p['category'] = 'local-dals'

# Normalize all subcategories in local-dals
dal_sub_rules = [
    (['kandi', 'toor'], 'Kandi Pappu (Toor Dal)'),
    (['minapa', 'urad'], 'Minapappu (Urad Dal)'),
    (['pesara', 'moong', 'mung'], 'Pesara Pappu (Moong)'),
    (['senaga', 'chana', 'kabuli', 'bengal gram'], 'Senaga Pappu (Chana Dal)'),
    (['verusenaga', 'peanut', 'groundnut', 'putnalu', 'fried gram'], 'Peanuts & Fried Gram'),
]

for p in products:
    if p.get('category_id') == 'local-dals':
        nl = p['name'].lower()
        assigned = False
        for kws, sub_name in dal_sub_rules:
            if any(k in nl for k in kws):
                p['sub_category'] = sub_name
                p['subCategory'] = sub_name
                assigned = True
                break
        if not assigned:
            p['sub_category'] = 'Senaga Pappu (Chana Dal)'
            p['subCategory'] = 'Senaga Pappu (Chana Dal)'

# Remove merged products from products list
excluded_ids = set(merges.keys())
clean_products = [p for p in products if p['id'] not in excluded_ids]
print(f"Products after deduplication: {len(clean_products)} (removed {len(excluded_ids)} merged duplicates)")

# 4. Construct Multi-Size Variants for Consolidated Products
# Define the precise variants dictionary
custom_variants = {
    # Aashirvaad Atta
    'g1-p1572': [
        {'size_label': '1 kg', 'price': 58, 'mrp': 65, 'image_url': '/products/packshots/aashirvaad-atta-1kg.jpg', 'stock': 50},
        {'size_label': '2 kg', 'price': 114, 'mrp': 125, 'image_url': '/products/packshots/aashirvaad-atta-1kg.jpg', 'stock': 35},
        {'size_label': '5 kg', 'price': 270, 'mrp': 295, 'image_url': '/products/packshots/aashirvaad-atta-5kg.jpg', 'stock': 45},
        {'size_label': '10 kg', 'price': 495, 'mrp': 540, 'image_url': '/products/packshots/aashirvaad-atta-10kg.jpg', 'stock': 40},
    ],
    # Aashirvaad Select Sharbati Atta
    'g1-p1579': [
        {'size_label': '1 kg', 'price': 72, 'mrp': 80, 'image_url': 'https://www.bigbasket.com/media/uploads/p/l/240097_10-aashirvaad-select-sharbati-atta.jpg', 'stock': 30},
        {'size_label': '5 kg', 'price': 345, 'mrp': 380, 'image_url': 'https://www.bigbasket.com/media/uploads/p/l/240097_10-aashirvaad-select-sharbati-atta.jpg', 'stock': 25},
    ],
    # Pillsbury Chakki Fresh Atta
    'g1-p1581': [
        {'size_label': '1 kg', 'price': 55, 'mrp': 60, 'image_url': '/products/packshots/pillsbury-atta-2kg.jpg', 'stock': 35},
        {'size_label': '2 kg', 'price': 108, 'mrp': 120, 'image_url': '/products/packshots/pillsbury-atta-2kg.jpg', 'stock': 25},
        {'size_label': '5 kg', 'price': 265, 'mrp': 290, 'image_url': '/products/packshots/pillsbury-atta-5kg.jpg', 'stock': 40},
        {'size_label': '10 kg', 'price': 485, 'mrp': 530, 'image_url': '/products/packshots/pillsbury-atta-10kg.jpg', 'stock': 30},
    ],
    # Nature Fresh Sampoorna Chakki Atta
    'g1-p1585': [
        {'size_label': '1 kg', 'price': 52, 'mrp': 58, 'image_url': '/products/packshots/nature-fresh-atta-5kg.jpg', 'stock': 30},
        {'size_label': '5 kg', 'price': 248, 'mrp': 275, 'image_url': '/products/packshots/nature-fresh-atta-5kg.jpg', 'stock': 35},
        {'size_label': '10 kg', 'price': 465, 'mrp': 510, 'image_url': '/products/packshots/nature-fresh-atta-10kg.jpg', 'stock': 25},
    ],
    # Fortune Chakki Fresh Atta
    'g1-p1586': [
        {'size_label': '1 kg', 'price': 50, 'mrp': 56, 'image_url': '/products/packshots/fortune-atta-5kg.jpg', 'stock': 30},
        {'size_label': '5 kg', 'price': 245, 'mrp': 270, 'image_url': '/products/packshots/fortune-atta-5kg.jpg', 'stock': 35},
        {'size_label': '10 kg', 'price': 460, 'mrp': 500, 'image_url': '/products/packshots/fortune-atta-5kg.jpg', 'stock': 25},
    ],
    # Patanjali Whole Wheat Chakki Atta
    'g1-p1590': [
        {'size_label': '1 kg', 'price': 45, 'mrp': 50, 'image_url': '/products/packshots/patanjali-atta-5kg.jpg', 'stock': 35},
        {'size_label': '5 kg', 'price': 215, 'mrp': 240, 'image_url': '/products/packshots/patanjali-atta-5kg.jpg', 'stock': 40},
        {'size_label': '10 kg', 'price': 410, 'mrp': 450, 'image_url': '/products/packshots/patanjali-atta-5kg.jpg', 'stock': 30},
    ],
    # Freedom Refined Sunflower Oil
    'g1-p1701': [
        {'size_label': '500 ml', 'price': 75, 'mrp': 85, 'image_url': '/products/packshots/freedom-oil-1l.jpg', 'stock': 45},
        {'size_label': '1 L', 'price': 145, 'mrp': 165, 'image_url': '/products/packshots/freedom-oil-1l.jpg', 'stock': 60},
        {'size_label': '2 L', 'price': 305, 'mrp': 340, 'image_url': '/products/packshots/freedom-oil-1l.jpg', 'stock': 25},
        {'size_label': '5 L', 'price': 745, 'mrp': 825, 'image_url': '/products/packshots/freedom-oil-5l.jpg', 'stock': 35},
        {'size_label': '15 L', 'price': 2250, 'mrp': 2450, 'image_url': '/products/packshots/freedom-oil-5l.jpg', 'stock': 15},
        {'size_label': '15 kg', 'price': 2450, 'mrp': 2650, 'image_url': '/products/packshots/freedom-oil-5l.jpg', 'stock': 12},
    ],
    # Fortune Sunlite Refined Sunflower Oil
    'g1-p1627': [
        {'size_label': '1 L', 'price': 145, 'mrp': 165, 'image_url': '/products/packshots/fortune-sunlite-clean.jpg', 'stock': 40},
        {'size_label': '5 L', 'price': 750, 'mrp': 835, 'image_url': '/products/packshots/fortune-sunlite-clean.jpg', 'stock': 25},
    ],
    # Gold Drop Sunflower Oil
    'g1-p1622': [
        {'size_label': '1 L', 'price': 140, 'mrp': 160, 'image_url': '/products/packshots/gold-drop-sunflower-clean.jpg', 'stock': 35},
        {'size_label': '5 L', 'price': 720, 'mrp': 810, 'image_url': '/products/packshots/gold-drop-sunflower-clean.jpg', 'stock': 20},
    ],
    # Saffola Gold
    'g1-p1632': [
        {'size_label': '1 L', 'price': 175, 'mrp': 195, 'image_url': '/products/packshots/saffola-gold-oil.jpg', 'stock': 30},
        {'size_label': '5 L', 'price': 895, 'mrp': 990, 'image_url': '/products/packshots/saffola-gold-oil.jpg', 'stock': 20},
    ],
    # Dhara Sunflower Oil
    'g1-p1637': [
        {'size_label': '1 L', 'price': 135, 'mrp': 155, 'image_url': '/products/packshots/dhara-sunflower-oil.jpg', 'stock': 35},
        {'size_label': '5 L', 'price': 695, 'mrp': 780, 'image_url': '/products/packshots/dhara-sunflower-oil.jpg', 'stock': 20},
    ],
    # Gemini Sunflower Oil
    'g1-p1642': [
        {'size_label': '1 L', 'price': 138, 'mrp': 158, 'image_url': '/products/packshots/gemini-sunflower-oil.jpg', 'stock': 35},
        {'size_label': '5 L', 'price': 710, 'mrp': 790, 'image_url': '/products/packshots/gemini-sunflower-oil.jpg', 'stock': 20},
    ],
    # Sunpure Sunflower Oil
    'g1-p1647': [
        {'size_label': '1 L', 'price': 135, 'mrp': 155, 'image_url': '/products/packshots/sunpure-sunflower-oil.png', 'stock': 30},
        {'size_label': '5 L', 'price': 690, 'mrp': 775, 'image_url': '/products/packshots/sunpure-sunflower-oil.png', 'stock': 20},
    ],
    # Priya Gold Sunflower Oil
    'g1-p0788': [
        {'size_label': '1 L', 'price': 135, 'mrp': 150, 'image_url': '/products/packshots/priya-gold-oil.jpg', 'stock': 40},
        {'size_label': '5 L', 'price': 680, 'mrp': 750, 'image_url': '/products/packshots/priya-gold-oil.jpg', 'stock': 20},
    ],
    # Ruchi Gold Palmolein Oil
    'g1-p0166': [
        {'size_label': '1 L', 'price': 105, 'mrp': 120, 'image_url': '/products/packshots/ruchi-gold-oil.jpg', 'stock': 45},
        {'size_label': '5 L', 'price': 530, 'mrp': 590, 'image_url': '/products/packshots/ruchi-gold-oil.jpg', 'stock': 25},
    ],
    # Fortune Soya Oil
    'g1-p1657': [
        {'size_label': '1 L', 'price': 125, 'mrp': 145, 'image_url': '/products/packshots/fortune-soya-oil.jpg', 'stock': 35},
        {'size_label': '5 L', 'price': 630, 'mrp': 710, 'image_url': '/products/packshots/fortune-soya-oil.jpg', 'stock': 20},
    ],
    # Fortune Groundnut Oil
    'g1-p1662': [
        {'size_label': '1 L', 'price': 175, 'mrp': 195, 'image_url': '/products/packshots/fortune-groundnut-oil.jpg', 'stock': 30},
        {'size_label': '5 L', 'price': 890, 'mrp': 980, 'image_url': '/products/packshots/fortune-groundnut-oil.jpg', 'stock': 20},
    ],
    # Freedom Groundnut Oil
    'g1-p0874': [
        {'size_label': '1 L', 'price': 170, 'mrp': 190, 'image_url': '/products/verified/g1-p0874.webp', 'stock': 35},
        {'size_label': '5 L', 'price': 860, 'mrp': 950, 'image_url': '/products/verified/g1-p0874.webp', 'stock': 20},
    ],
    # Vijaya Groundnut Oil
    'g1-p0997': [
        {'size_label': '1 L', 'price': 170, 'mrp': 190, 'image_url': '/products/packshots/vijaya-groundnut-oil.jpg', 'stock': 30},
        {'size_label': '5 L', 'price': 860, 'mrp': 950, 'image_url': '/products/packshots/vijaya-groundnut-oil.jpg', 'stock': 20},
    ],
    # Idhayam Sesame Oil
    'g1-p1667': [
        {'size_label': '200 ml', 'price': 95, 'mrp': 105, 'image_url': '/products/packshots/idhayam-oil.jpg', 'stock': 30},
        {'size_label': '500 ml', 'price': 230, 'mrp': 250, 'image_url': '/products/packshots/idhayam-oil.jpg', 'stock': 35},
        {'size_label': '1 L', 'price': 450, 'mrp': 490, 'image_url': '/products/packshots/idhayam-oil.jpg', 'stock': 40},
        {'size_label': '5 L', 'price': 2200, 'mrp': 2400, 'image_url': '/products/packshots/idhayam-oil.jpg', 'stock': 15},
    ],
    # Amul Pure Ghee
    'g1-p1672': [
        {'size_label': '200 ml', 'price': 130, 'mrp': 140, 'image_url': '/products/packshots/amul-ghee.jpg', 'stock': 25},
        {'size_label': '500 ml', 'price': 310, 'mrp': 335, 'image_url': '/products/packshots/amul-ghee.jpg', 'stock': 40},
        {'size_label': '1 L', 'price': 610, 'mrp': 650, 'image_url': '/products/packshots/amul-ghee.jpg', 'stock': 30},
    ],
    # Patanjali Cow Ghee
    'g1-p1675': [
        {'size_label': '200 ml', 'price': 125, 'mrp': 135, 'image_url': '/products/packshots/patanjali-cow-ghee.jpg', 'stock': 25},
        {'size_label': '500 ml', 'price': 295, 'mrp': 320, 'image_url': '/products/packshots/patanjali-cow-ghee.jpg', 'stock': 35},
        {'size_label': '1 L', 'price': 580, 'mrp': 620, 'image_url': '/products/packshots/patanjali-cow-ghee.jpg', 'stock': 30},
    ],
    # GRB Pure Ghee
    'g1-p0635': [
        {'size_label': '50 ml', 'price': 45, 'mrp': 50, 'image_url': '/products/packshots/grb-ghee.jpg', 'stock': 35},
        {'size_label': '200 ml', 'price': 175, 'mrp': 190, 'image_url': '/products/packshots/grb-ghee.jpg', 'stock': 30},
        {'size_label': '500 ml', 'price': 395, 'mrp': 430, 'image_url': '/products/packshots/grb-ghee.jpg', 'stock': 35},
        {'size_label': '1 L', 'price': 780, 'mrp': 840, 'image_url': '/products/packshots/grb-ghee.jpg', 'stock': 20},
    ],
    # JS Refined Cooking Oil
    'g1-p0619': [
        {'size_label': '500 ml', 'price': 52, 'mrp': 58, 'image_url': '/products/packshots/sunflower-oil.jpg', 'stock': 35},
        {'size_label': '1 L', 'price': 100, 'mrp': 115, 'image_url': '/products/packshots/sunflower-oil.jpg', 'stock': 35},
    ],
    # Kandi Pappu (Toor Dal)
    'g1-p0327': [
        {'size_label': '500 g', 'price': 85, 'mrp': 95, 'image_url': '/products/generated_pouches/g1_kandi_pappu_pouch.webp', 'stock': 40},
        {'size_label': '1 kg', 'price': 165, 'mrp': 185, 'image_url': '/products/generated_pouches/g1_kandi_pappu_pouch.webp', 'stock': 50},
        {'size_label': '2 kg', 'price': 320, 'mrp': 360, 'image_url': '/products/generated_pouches/g1_kandi_pappu_pouch.webp', 'stock': 30},
        {'size_label': '5 kg', 'price': 790, 'mrp': 890, 'image_url': '/products/generated_pouches/g1_kandi_pappu_pouch.webp', 'stock': 25},
    ],
    # Minapappu (Urad Dal)
    'g1-p0391': [
        {'size_label': '500 g', 'price': 75, 'mrp': 85, 'image_url': '/products/generated_pouches/g1_urad_dal_pouch.webp', 'stock': 40},
        {'size_label': '1 kg', 'price': 145, 'mrp': 165, 'image_url': '/products/generated_pouches/g1_urad_dal_pouch.webp', 'stock': 50},
        {'size_label': '2 kg', 'price': 285, 'mrp': 320, 'image_url': '/products/generated_pouches/g1_urad_dal_pouch.webp', 'stock': 30},
        {'size_label': '5 kg', 'price': 700, 'mrp': 790, 'image_url': '/products/generated_pouches/g1_urad_dal_pouch.webp', 'stock': 20},
    ],
    # Pachisenaga Pappu (Chana Dal)
    'g1-p0388': [
        {'size_label': '500 g', 'price': 45, 'mrp': 50, 'image_url': '/products/generated_pouches/g1_chana_dal_pouch.webp', 'stock': 40},
        {'size_label': '1 kg', 'price': 85, 'mrp': 95, 'image_url': '/products/generated_pouches/g1_chana_dal_pouch.webp', 'stock': 50},
        {'size_label': '2 kg', 'price': 165, 'mrp': 185, 'image_url': '/products/generated_pouches/g1_chana_dal_pouch.webp', 'stock': 30},
        {'size_label': '5 kg', 'price': 400, 'mrp': 450, 'image_url': '/products/generated_pouches/g1_chana_dal_pouch.webp', 'stock': 20},
    ],
    # Verusenaga Pappu (Peanuts)
    'g1-p0393': [
        {'size_label': '500 g', 'price': 75, 'mrp': 85, 'image_url': '/products/generated_pouches/g1_groundnuts_pouch.webp', 'stock': 40},
        {'size_label': '1 kg', 'price': 145, 'mrp': 165, 'image_url': '/products/generated_pouches/g1_groundnuts_pouch.webp', 'stock': 50},
        {'size_label': '2 kg', 'price': 280, 'mrp': 315, 'image_url': '/products/generated_pouches/g1_groundnuts_pouch.webp', 'stock': 30},
        {'size_label': '5 kg', 'price': 680, 'mrp': 760, 'image_url': '/products/generated_pouches/g1_groundnuts_pouch.webp', 'stock': 20},
    ],
    # Pesara Pappu (Moong Dal)
    'g1-p0412': [
        {'size_label': '500 g', 'price': 65, 'mrp': 75, 'image_url': '/products/generated_pouches/g1_yellow_moong_dal_pouch.webp', 'stock': 40},
        {'size_label': '1 kg', 'price': 125, 'mrp': 140, 'image_url': '/products/generated_pouches/g1_yellow_moong_dal_pouch.webp', 'stock': 50},
        {'size_label': '2 kg', 'price': 245, 'mrp': 275, 'image_url': '/products/generated_pouches/g1_yellow_moong_dal_pouch.webp', 'stock': 30},
        {'size_label': '5 kg', 'price': 590, 'mrp': 660, 'image_url': '/products/generated_pouches/g1_yellow_moong_dal_pouch.webp', 'stock': 20},
    ],
}

# Filter out existing variants for updated products or excluded products
filtered_variants = [v for v in variants if v['product_id'] not in custom_variants and v['product_id'] not in excluded_ids]

# Append new custom variants
for pid, v_list in custom_variants.items():
    for idx, v_data in enumerate(v_list, start=1):
        filtered_variants.append({
            'id': f"{pid}-v{idx}",
            'product_id': pid,
            'size_label': v_data['size_label'],
            'price': v_data['price'],
            'mrp': v_data['mrp'],
            'stock': v_data.get('stock', 30),
            'image_url': v_data.get('image_url', None)
        })

print(f"Final variants count: {len(filtered_variants)}")

# Save updated files
with open('data/migrated_products.json', 'w', encoding='utf-8') as f:
    json.dump(clean_products, f, indent=2)

with open('data/migrated_product_variants.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_variants, f, indent=2)

with open('src/data/legacyIdMap.json', 'w', encoding='utf-8') as f:
    json.dump(legacy_map, f, indent=2)

print("Catalog cleanup executed successfully!")
