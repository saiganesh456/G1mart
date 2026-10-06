import os
import re
import json
import csv

SCRATCH_DIR = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch'
OCR_CACHE_FILE = os.path.join(SCRATCH_DIR, 'ocr_cache.json')
CATALOG_JSON_PATH = os.path.abspath('src/data/products-catalog.json')
MASTER_CATALOG_JSON = os.path.abspath('data/g1_mart_master_product_catalog.json')
MASTER_CATALOG_CSV = os.path.abspath('data/g1_mart_master_product_catalog.csv')

with open(OCR_CACHE_FILE, 'r', encoding='utf-8') as f:
    ocr_cache = json.load(f)

with open(CATALOG_JSON_PATH, 'r', encoding='utf-8') as f:
    existing_catalog = json.load(f)

print(f"Loaded {len(existing_catalog)} existing catalog products.")

# Normalize text helper
def norm(text):
    if not text:
        return ""
    return re.sub(r'[^a-z0-9]', '', text.lower())

def extract_size(text):
    if not text:
        return None
    # match patterns like 100g, 100 g, 1kg, 500ml, 1ltr, 1.2g, 10.1g, etc.
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

# Known Brands
KNOWN_BRANDS = [
    'Aashirvaad', 'Aachi', 'Britannia', 'Cadbury', 'Parle', 'Sunfeast',
    'Mysore Sandal', 'Margo', 'Zoom', 'Ultra Wash', 'Wagh Bakri', 'Navchetan',
    'Lotte', 'Kitkat', 'Perk', 'Milkybar', 'Munch', '5 Star', '5Star', 'Comfort',
    'Head & Shoulders', 'Head and Shoulders', 'Sunrise', 'Hide & Seek', 'Bourbon',
    'Eno', 'Gokul', 'Navratna', 'Santoor', 'Lion Honey', 'Stayfree', 'Maggi',
    'Hamam', 'Malkist', 'Elite', 'Bingo', 'Savlon', 'Nimyle', 'Wipro Softouch',
    'Tata Salt', 'Bru', 'Colgate', 'Dettol', 'Choki Choki', 'Arokya', 'All Out',
    'Apsara', 'Ariel', 'Tulsi', 'Rajaram', 'Barari', 'Quaker Oats', 'Kleenol',
    'GKL', 'Cheers'
]

def detect_brand(text):
    if not text:
        return None
    for b in KNOWN_BRANDS:
        pattern = r'\b' + re.escape(b) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return b
    return None

def detect_category(name, brand):
    name_l = (name or "").lower()
    if any(w in name_l for w in ['atta', 'rice', 'dal', 'oil', 'salt', 'rava', 'sooji', 'sugar', 'vermicelli', 'flour', 'jaggery', 'jeera', 'mustard', 'turmeric', 'masala', 'chilli', 'coriander']):
        return 'staples'
    if any(w in name_l for w in ['biscuit', 'cookie', 'rusk', 'chips', 'wafer', 'namkeen', 'snack', 'chikki', 'mixture', 'noodles', 'popcorn', 'pie', 'fryum']):
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
    if any(w in name_l for w in ['milk', 'curd', 'paneer', 'cheese', 'butter', 'ghee']):
        return 'dairy'
    return 'grocery'

print("Master catalog extraction framework ready.")
