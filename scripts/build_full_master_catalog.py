import os
import re
import json
import csv

CATALOG_JSON_PATH = os.path.abspath('src/data/products-catalog.json')
MASTER_CATALOG_JSON = os.path.abspath('data/g1_mart_master_product_catalog.json')
MASTER_CATALOG_CSV = os.path.abspath('data/g1_mart_master_product_catalog.csv')
MASTER_MANIFEST_JSON = os.path.abspath('data/g1_mart_master_image_manifest.json')
MASTER_MANIFEST_CSV = os.path.abspath('data/g1_mart_master_image_manifest.csv')
RESEARCH_MANIFEST_JSON = os.path.abspath('data/product_research_manifest.json')
RESEARCH_MANIFEST_CSV = os.path.abspath('data/product_research_manifest.csv')
IMPORT_REPORT_JSON = os.path.abspath('data/g1_mart_master_import_report.json')

with open(CATALOG_JSON_PATH, 'r', encoding='utf-8') as f:
    existing_catalog = json.load(f)

print(f"Loaded {len(existing_catalog)} existing products from catalog.")

def norm_str(s):
    if not s:
        return ""
    return re.sub(r'[^a-z0-9]', '', str(s).lower())

def extract_pack_size(text):
    if not text:
        return None
    m = re.search(r'(\d+(\.\d+)?)\s*(kg|g|gm|gms|ml|ltr|l|pcs|pc|set|sets|pkt|box|cups|sticks)\b', str(text), re.IGNORECASE)
    if m:
        val = m.group(1)
        u = m.group(3).lower()
        if u in ['gm', 'gms']:
            u = 'g'
        elif u == 'ltr':
            u = 'l'
        elif u == 'pc':
            u = 'pcs'
        return f"{val}{u}"
    return None

def detect_category(name, brand=""):
    nl = f"{name} {brand}".lower()
    if any(w in nl for w in ['atta', 'rice', 'dal', 'oil', 'salt', 'rava', 'sooji', 'sugar', 'vermicelli', 'flour', 'jaggery', 'jeera', 'mustard', 'turmeric', 'masala', 'chilli', 'coriander', 'pickle', 'ghee', 'oats']):
        return 'staples'
    if any(w in nl for w in ['biscuit', 'cookie', 'rusk', 'chips', 'wafer', 'namkeen', 'snack', 'chikki', 'mixture', 'noodles', 'popcorn', 'pie', 'fryum', 'laddu', 'til']):
        return 'snacks'
    if any(w in nl for w in ['chocolate', 'candy', 'jelly', 'sweet', 'bar', 'lollipop', 'toffee']):
        return 'confectionery'
    if any(w in nl for w in ['tea', 'coffee', 'drink', 'beverage', 'juice', 'shake', 'syrup']):
        return 'beverages'
    if any(w in nl for w in ['soap', 'shampoo', 'paste', 'brush', 'powder', 'cream', 'lotion', 'face wash', 'oil', 'talc', 'pad', 'stayfree', 'sanitary']):
        return 'personal-care'
    if any(w in nl for w in ['detergent', 'wash', 'cleaner', 'wiper', 'mop', 'broom', 'repellent', 'harpic', 'comfort', 'scent', 'agarbatti', 'dhoop', 'sambrani', 'battery']):
        return 'household'
    if any(w in nl for w in ['dates', 'kaju', 'badam', 'pista', 'kishmish', 'cashew', 'almond', 'dry fruit', 'makhana']):
        return 'dry-fruits'
    if any(w in nl for w in ['milk', 'curd', 'paneer', 'cheese', 'butter']):
        return 'dairy'
    return 'grocery'

# Initialize master list from existing 472 products
master_products = []
sku_map = {} # normalized exact key -> master_item

for p in existing_catalog:
    item_no = p.get('sourceItemNo') or p.get('itemNumber')
    pid = p.get('id') or f"g1-prod-{item_no:03d}"
    name = p.get('name')
    brand = p.get('brand')
    size = extract_pack_size(name) or extract_pack_size(p.get('sourceName'))
    category = p.get('category') or detect_category(name, brand)
    mrp = p.get('originalPrice')
    selling_price = p.get('price')
    image_url = p.get('imageUrl')
    image_status = p.get('imageStatus') or ('VERIFIED' if image_url and 'primary.jpg' in image_url else 'MISSING_IMAGE')
    
    item = {
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
        'notes': 'Existing catalog product'
    }
    master_products.append(item)
    
    # Generate SKU lookup key: brand + normalized_core_name + size
    core_name = re.sub(r'\b(\d+(\.\d+)?)\s*(kg|g|gm|ml|ltr|l|pcs|pc)\b', '', name, flags=re.IGNORECASE)
    sku_key = f"{norm_str(brand)}_{norm_str(core_name)}_{norm_str(size)}"
    if sku_key not in sku_map:
        sku_map[sku_key] = item
    # Also index by exact normalized display name
    name_key = norm_str(name)
    if name_key not in sku_map:
        sku_map[name_key] = item

print(f"Master index created with {len(master_products)} items ({len(sku_map)} lookup keys).")

# Next available ID counter
next_id_num = 473
duplicate_merged_count = 0
new_products_count = 0

# Import structured items from scripts/parse_all_invoices.py
import sys
sys.path.append(os.path.abspath('scripts'))
from parse_all_invoices import extracted_items

for item in extracted_items:
    brand = item.get('brand')
    disp = item.get('display_name')
    size = item.get('pack_size') or extract_pack_size(disp)
    var = item.get('variant')
    doc = item.get('source_document')
    
    core_name = re.sub(r'\b(\d+(\.\d+)?)\s*(kg|g|gm|ml|ltr|l|pcs|pc)\b', '', disp, flags=re.IGNORECASE)
    sku_key = f"{norm_str(brand)}_{norm_str(core_name)}_{norm_str(size)}"
    name_key = norm_str(disp)
    
    match = None
    if sku_key in sku_map and sku_key != "__":
        match = sku_map[sku_key]
    elif name_key in sku_map:
        match = sku_map[name_key]
        
    if match:
        # EXACT SAME SKU EXISTS -> MERGE
        duplicate_merged_count += 1
        if doc not in match['source_documents']:
            match['source_documents'].append(doc)
        # Enrich MRP if not reliably known
        if match.get('mrp') is None and item.get('mrp') is not None:
            match['mrp'] = item.get('mrp')
            match['mrp_source'] = item.get('mrp_source')
        # Store supplier details
        if not match.get('supplier') or match.get('supplier') == 'G1 Mart Historical Sales':
            match['supplier'] = item.get('supplier')
            match['invoice_date'] = item.get('invoice_date')
    else:
        # GENUINELY NEW SKU -> CREATE SEPARATE PRODUCT
        new_products_count += 1
        new_pid = f"g1-prod-{next_id_num:03d}"
        next_id_num += 1
        
        new_item = {
            'product_id': new_pid,
            'source_item_no': next_id_num - 1,
            'source_name': item.get('source_name'),
            'source_document': doc,
            'source_page': item.get('source_page', 1),
            'source_documents': [doc],
            'supplier': item.get('supplier'),
            'invoice_date': item.get('invoice_date'),
            'display_name': disp,
            'brand': brand,
            'variant': var,
            'pack_size': size,
            'unit': item.get('unit', 'Pieces'),
            'package_configuration': item.get('package_configuration'),
            'category_id': item.get('category_id') or detect_category(disp, brand),
            'mrp': item.get('mrp'),
            'mrp_source': item.get('mrp_source'),
            'selling_price': None, # Rule 16: Keep NULL
            'source_quantity': item.get('source_quantity'),
            'source_rate': item.get('source_rate'),
            'source_amount': item.get('source_amount'),
            'product_match_status': item.get('product_match_status', 'NEEDS_REVIEW'),
            'confidence': item.get('confidence', 'MEDIUM'),
            'product_source_url': f"https://g1mart.in/product/{new_pid}",
            'image_source_url': None,
            'image_source_type': None,
            'image_status': 'MISSING_IMAGE',
            'notes': item.get('notes', 'New SKU from supplier source document')
        }
        master_products.append(new_item)
        sku_map[sku_key] = new_item
        sku_map[name_key] = new_item

print("\n" + "=" * 50)
print("CATALOG DEDUPLICATION & MERGE REPORT")
print("=" * 50)
print(f"Existing Products:       472")
print(f"Duplicate SKUs Merged:   {duplicate_merged_count}")
print(f"New Unique SKUs Added:   {new_products_count}")
print(f"Final Master Catalog:    {len(master_products)} products")
print("=" * 50)

# Save Master Catalog JSON & CSV
os.makedirs(os.path.dirname(MASTER_CATALOG_JSON), exist_ok=True)
with open(MASTER_CATALOG_JSON, 'w', encoding='utf-8') as f:
    json.dump(master_products, f, indent=2)

fieldnames = [
    'product_id', 'source_item_no', 'source_name', 'source_document', 'source_page',
    'source_documents', 'supplier', 'invoice_date', 'display_name', 'brand',
    'variant', 'pack_size', 'unit', 'package_configuration', 'category_id',
    'mrp', 'mrp_source', 'selling_price', 'source_quantity', 'source_rate',
    'source_amount', 'product_match_status', 'confidence', 'product_source_url',
    'image_source_url', 'image_source_type', 'image_status', 'notes'
]

with open(MASTER_CATALOG_CSV, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for row in master_products:
        row_copy = dict(row)
        if isinstance(row_copy.get('source_documents'), list):
            row_copy['source_documents'] = "; ".join(row_copy['source_documents'])
        writer.writerow(row_copy)

print(f"Saved: {MASTER_CATALOG_JSON}")
print(f"Saved: {MASTER_CATALOG_CSV}")
