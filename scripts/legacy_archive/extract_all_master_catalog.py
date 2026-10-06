import os
import re
import json
import csv

SCRATCH_DIR = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch'
OCR_CACHE_FILE = os.path.join(SCRATCH_DIR, 'ocr_cache.json')
CATALOG_JSON_PATH = os.path.abspath('src/data/products-catalog.json')
MASTER_CATALOG_JSON = os.path.abspath('data/g1_mart_master_product_catalog.json')
MASTER_CATALOG_CSV = os.path.abspath('data/g1_mart_master_product_catalog.csv')
MASTER_MANIFEST_JSON = os.path.abspath('data/g1_mart_master_image_manifest.json')
MASTER_MANIFEST_CSV = os.path.abspath('data/g1_mart_master_image_manifest.csv')
RESEARCH_MANIFEST_JSON = os.path.abspath('data/product_research_manifest.json')
RESEARCH_MANIFEST_CSV = os.path.abspath('data/product_research_manifest.csv')

with open(OCR_CACHE_FILE, 'r', encoding='utf-8') as f:
    ocr_cache = json.load(f)

with open(CATALOG_JSON_PATH, 'r', encoding='utf-8') as f:
    existing_catalog = json.load(f)

# Helper functions
def clean_str(s):
    if not s:
        return ""
    return re.sub(r'\s+', ' ', str(s)).strip()

def norm_sku(brand, name, size):
    b = clean_str(brand).lower()
    n = clean_str(name).lower()
    s = clean_str(size).lower()
    # clean non-alphanumeric
    b = re.sub(r'[^a-z0-9]', '', b)
    n = re.sub(r'[^a-z0-9]', '', n)
    s = re.sub(r'[^a-z0-9]', '', s)
    return f"{b}_{n}_{s}"

def extract_size(text):
    if not text:
        return None
    m = re.search(r'(\d+(\.\d+)?)\s*(kg|g|gm|gms|ml|ltr|l|pcs|pc|set|sets|pkt|box)\b', text, re.IGNORECASE)
    if m:
        num = m.group(1)
        u = m.group(3).lower()
        if u in ['gm', 'gms']:
            u = 'g'
        elif u == 'ltr':
            u = 'l'
        elif u == 'pc':
            u = 'pcs'
        return f"{num}{u}"
    return None

KNOWN_BRANDS = [
    'Aashirvaad', 'Aachi', 'Britannia', 'Cadbury', 'Parle', 'Sunfeast',
    'Mysore Sandal', 'Margo', 'Zoom', 'Ultra Wash', 'Wagh Bakri', 'Navchetan',
    'Lotte', 'Kitkat', 'Perk', 'Milkybar', 'Munch', '5 Star', '5Star', 'Comfort',
    'Head & Shoulders', 'Head and Shoulders', 'Sunrise', 'Hide & Seek', 'Bourbon',
    'Eno', 'Gokul', 'Navratna', 'Santoor', 'Lion Honey', 'Stayfree', 'Maggi',
    'Hamam', 'Malkist', 'Elite', 'Bingo', 'Savlon', 'Nimyle', 'Wipro Softouch',
    'Tata Salt', 'Bru', 'Colgate', 'Dettol', 'Choki Choki', 'Arokya', 'All Out',
    'Apsara', 'Ariel', 'Tulsi', 'Rajaram', 'Barari', 'Quaker Oats', 'Kleenol',
    'GKL', 'Cheers', 'Medimix', 'Ujala', 'Henko', 'Exo', 'Crisp & Shine',
    'Nippo', 'Fevigum', 'Good Knight', 'Horlicks', 'Boost', 'Vim', 'Wheel',
    'Surf Excel', 'Rin', 'Tide', 'Patanjali', 'Everest', 'MDH', 'Fortune'
]

def detect_brand(text):
    if not text:
        return None
    for b in KNOWN_BRANDS:
        pattern = r'\b' + re.escape(b) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return b
    return None

def detect_category(name):
    name_l = (name or "").lower()
    if any(w in name_l for w in ['atta', 'rice', 'dal', 'oil', 'salt', 'rava', 'sooji', 'sugar', 'vermicelli', 'flour', 'jaggery', 'jeera', 'mustard', 'turmeric', 'masala', 'chilli', 'coriander', 'pickle', 'ghee']):
        return 'staples'
    if any(w in name_l for w in ['biscuit', 'cookie', 'rusk', 'chips', 'wafer', 'namkeen', 'snack', 'chikki', 'mixture', 'noodles', 'popcorn', 'pie', 'fryum', 'laddu', 'til']):
        return 'snacks'
    if any(w in name_l for w in ['chocolate', 'candy', 'jelly', 'sweet', 'bar', 'lollipop', 'toffee']):
        return 'confectionery'
    if any(w in name_l for w in ['tea', 'coffee', 'drink', 'beverage', 'juice', 'shake', 'syrup']):
        return 'beverages'
    if any(w in name_l for w in ['soap', 'shampoo', 'paste', 'brush', 'powder', 'cream', 'lotion', 'face wash', 'oil', 'talc', 'pad', 'stayfree']):
        return 'personal-care'
    if any(w in name_l for w in ['detergent', 'wash', 'cleaner', 'wiper', 'mop', 'broom', 'repellent', 'harpic', 'comfort', 'scent', 'agarbatti', 'dhoop', 'sambrani', 'battery']):
        return 'household'
    if any(w in name_l for w in ['dates', 'kaju', 'badam', 'pista', 'kishmish', 'cashew', 'almond', 'dry fruit', 'makhana']):
        return 'dry-fruits'
    if any(w in name_l for w in ['milk', 'curd', 'paneer', 'cheese', 'butter']):
        return 'dairy'
    return 'grocery'

# Initialize Master Catalog from existing 472 products
master_catalog = []
sku_index = {} # normalized key -> master_item

for p in existing_catalog:
    item_no = p.get('sourceItemNo') or p.get('itemNumber')
    pid = p.get('id') or f"g1-prod-{item_no:03d}"
    name = p.get('name')
    brand = p.get('brand') or detect_brand(name) or detect_brand(p.get('sourceName'))
    size = extract_size(name) or extract_size(p.get('sourceName'))
    category = p.get('category') or detect_category(name)
    mrp = p.get('originalPrice')
    selling_price = p.get('price') # Keep existing or None
    image_url = p.get('imageUrl')
    image_status = p.get('imageStatus') or ('VERIFIED' if image_url and 'primary.jpg' in image_url else 'MISSING_IMAGE')
    
    master_item = {
        'product_id': pid,
        'source_item_no': item_no,
        'source_name': p.get('sourceName') or p.get('rawName') or name,
        'source_document': 'PRODUCTS.PDF',
        'source_page': 1,
        'source_documents': ['PRODUCTS.PDF'],
        'supplier': 'G1 Mart Historical Sales',
        'invoice_date': '23-09-2026 to 29-09-2026',
        'display_name': name,
        'brand': brand,
        'variant': p.get('variant'),
        'pack_size': size,
        'unit': p.get('unit') or 'Pieces',
        'package_configuration': None,
        'category_id': category,
        'mrp': mrp,
        'mrp_source': 'Verified Source' if mrp and image_status == 'VERIFIED' else None,
        'selling_price': selling_price,
        'source_quantity': None,
        'source_rate': None,
        'source_amount': None,
        'product_match_status': 'VERIFIED' if image_status == 'VERIFIED' else 'NEEDS_REVIEW',
        'confidence': 'HIGH' if image_status == 'VERIFIED' else 'MEDIUM',
        'product_source_url': f"https://g1mart.in/product/{pid}",
        'image_source_url': image_url,
        'image_source_type': 'Supabase Storage' if image_url else None,
        'image_status': image_status,
        'notes': 'Existing catalog product from PRODUCTS.PDF'
    }
    master_catalog.append(master_item)
    
    # Register SKU index
    key = norm_sku(brand, name, size)
    if key and key not in sku_index:
        sku_index[key] = master_item

print(f"Master catalog initialized with {len(master_catalog)} items.")
