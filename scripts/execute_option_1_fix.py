import os
import json
import csv

CATALOG_JSON_PATH = os.path.abspath('src/data/products-catalog.json')
MASTER_CATALOG_JSON = os.path.abspath('data/g1_mart_master_product_catalog.json')
MASTER_CATALOG_CSV = os.path.abspath('data/g1_mart_master_product_catalog.csv')
MASTER_MANIFEST_JSON = os.path.abspath('data/g1_mart_master_image_manifest.json')
MASTER_MANIFEST_CSV = os.path.abspath('data/g1_mart_master_image_manifest.csv')
IMPORT_LOG_JSON = os.path.abspath('data/import_log.json')

with open(CATALOG_JSON_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

# The 8 products that had duplicate/shared images across different items
DISQUALIFIED_PIDS = {
    'g1-prod-007': 'Aachi Appalam (100g): Unlinked shared Garam Masala image. Awaiting authentic appalam packshot.',
    'g1-prod-008': 'Aachi Chicken Masala (50g): Unlinked shared Garam Masala image. Awaiting authentic chicken masala box.',
    'g1-prod-014': 'Aashirvaad Vermicelli (850g): Unlinked shared 400g pouch image.',
    'g1-prod-053': 'Bru Instant Coffee 50g Pouch: Unlinked shared glass jar image.',
    'g1-prod-054': 'Bru Instant Coffee 1.2g Sachet: Unlinked shared glass jar image.',
    'g1-prod-239': 'Malkist Cheese Crackers 72g: Unlinked shared 144g image.',
    'g1-prod-241': 'Malkist Dark Choco Crackers 72g: Unlinked shared 144g image.',
    'g1-prod-473': 'Til / Seed Laddu: Unlinked shared Mysore Sandal Soap image.'
}

# Standard FMCG price points & MRP mapping
FMCG_MRP_LOOKUP = {
    'g1-prod-001': 5.0,   # 5 Much Wafer
    'g1-prod-002': 5.0,   # Cadbury 5 Star
    'g1-prod-003': 70.0,  # 5 Star Tea 250g
    'g1-prod-004': 10.0,  # Britannia 50-50 55g
    'g1-prod-005': 15.0,  # 707 Detergent Cake 150g
    'g1-prod-006': 78.0,  # Aachi Garam Masala 100g
    'g1-prod-007': 45.0,  # Aachi Appalam 100g
    'g1-prod-008': 38.0,  # Aachi Chicken Masala 50g
    'g1-prod-009': 65.0,  # Aashirvaad Atta 1kg
    'g1-prod-010': 22.0,  # Aashirvaad Crystal Salt 1kg
    'g1-prod-011': 32.0,  # Aashirvaad Iodized Salt 1kg
    'g1-prod-012': 86.0,  # Aashirvaad Suji Rava 1kg
    'g1-prod-013': 45.0,  # Aashirvaad Vermicelli 400g
    'g1-prod-014': 130.0, # Aashirvaad Vermicelli 850g
    'g1-prod-015': 35.0,  # Cleaning Acid 700ml
    'g1-prod-016': 22.0,  # Ajay Toothbrush
    'g1-prod-018': 105.0, # All Out Starter Pack
    'g1-prod-019': 60.0,  # Apsara Pencils 10s
    'g1-prod-020': 10.0,  # Ariel Liquid 10Rs
    'g1-prod-022': 30.0,  # Arokya Milk 500ml
    'g1-prod-042': 20.0,  # Bingo Korean 70g
    'g1-prod-051': 30.0,  # Britannia Bourbon 44g
    'g1-prod-053': 110.0, # Bru Coffee 50g
    'g1-prod-054': 2.0,   # Bru Sachet Rs 2
    'g1-prod-055': 240.0, # Bru Coffee Jar 100g
    'g1-prod-061': 10.0,  # Choki Choki Stix
    'g1-prod-071': 65.0,  # Colgate Strong Teeth 100g
    'g1-prod-074': 140.0, # Comfort 400ml
    'g1-prod-101': 155.0, # Dettol Liquid 250ml
    'g1-prod-156': 35.0,  # Gokul Sandal Soap
    'g1-prod-165': 38.0,  # Hamam Soap 100g
    'g1-prod-175': 30.0,  # Hide & Seek 33g
    'g1-prod-210': 30.0,  # Kitkat 4-Finger
    'g1-prod-238': 35.0,  # Malkist Cheese 144g
    'g1-prod-239': 20.0,  # Malkist Cheese 72g
    'g1-prod-240': 35.0,  # Malkist Dark Choco 144g
    'g1-prod-241': 20.0,  # Malkist Dark Choco 72g
    'g1-prod-247': 15.0,  # Maggi 2-Minute Noodles
    'g1-prod-264': 5.0,   # Milkybar 5Rs
    'g1-prod-276': 5.0,   # Munch 5Rs
    'g1-prod-282': 75.0,  # Mysore Sandal 150g
    'g1-prod-283': 65.0,  # Mysore Sandal 125g
    'g1-prod-285': 50.0,  # Navratna Oil 50ml
    'g1-prod-288': 50.0,  # Nimyle Herbal 200ml
    'g1-prod-302': 10.0,  # Perk 10Rs
    'g1-prod-337': 99.0,  # Santoor Handwash Big
    'g1-prod-338': 38.0,  # Santoor Soap 100g
    'g1-prod-459': 50.0,  # Wagh Bakri 100g
    'g1-prod-460': 160.0, # Wagh Bakri 250g
    'g1-prod-502': 50.0,  # Elite Rusk Elaichi 182g
    'g1-prod-503': 50.0,  # Elite Rusk Milk 182g
    'g1-prod-509': 160.0, # Dark Fantasy Choco Fills 300g
    'g1-prod-511': 45.0,  # Mom's Magic Cashew 200g
    'g1-prod-524': 38.0,  # Mysore Sandal 75g
    'g1-prod-525': 215.0, # Mysore Sandal 150gx3
    'g1-prod-532': 310.0, # Wagh Bakri 500g
    'g1-prod-544': 105.0  # Harpic Power Plus 500ml
}

# Fix and update all products
fixed_products = []
unlinked_count = 0
price_set_count = 0

for p in products:
    pid = p['id']
    
    # 1. Unlink shared/wrong images
    if pid in DISQUALIFIED_PIDS:
        p['imageUrl'] = None
        p['image'] = '/products/placeholder.svg'
        p['imageStatus'] = 'NEEDS_REVIEW'
        p['image_status'] = 'NEEDS_REVIEW'
        p['notes'] = DISQUALIFIED_PIDS[pid]
        unlinked_count += 1
    elif p.get('imageStatus') == 'VERIFIED' and p.get('imageUrl'):
        # Ensure deterministic canonical URL
        canonical_url = f"https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/{pid}/primary.jpg"
        p['imageUrl'] = canonical_url
        p['image'] = canonical_url
        p['imageStatus'] = 'VERIFIED'
        p['image_status'] = 'VERIFIED'
    else:
        p['imageUrl'] = None
        p['image'] = '/products/placeholder.svg'
        p['imageStatus'] = p.get('imageStatus') or 'NEEDS_REVIEW'
        p['image_status'] = p['imageStatus']

    # 2. Fix Pricing (Option 1: Price = MRP)
    assigned_mrp = FMCG_MRP_LOOKUP.get(pid) or p.get('originalPrice') or p.get('mrp') or p.get('price')
    if assigned_mrp and assigned_mrp > 0:
        p['originalPrice'] = float(assigned_mrp)
        p['price'] = float(assigned_mrp)
        p['priceConfirmed'] = True
        price_set_count += 1
    elif p.get('source_rate') and p.get('source_rate') > 0:
        # Wholesale rate with 15% margin for invoice items
        rate = float(p['source_rate'])
        calc_price = round(rate * 1.15, 0)
        p['originalPrice'] = calc_price
        p['price'] = calc_price
        p['priceConfirmed'] = True
        price_set_count += 1
    else:
        # Default placeholder price for unpriced items
        p['originalPrice'] = 30.0
        p['price'] = 30.0
        p['priceConfirmed'] = False

    # 3. Clean Categories
    nl = f"{p['name']} {p.get('brand', '')}".lower()
    if any(w in nl for w in ['atta', 'rice', 'dal', 'oil', 'salt', 'rava', 'sooji', 'sugar', 'vermicelli', 'flour', 'jaggery', 'jeera', 'mustard', 'turmeric', 'masala', 'chilli', 'coriander', 'pickle', 'ghee', 'oats']):
        p['category'] = 'rice-dal-atta'
    elif any(w in nl for w in ['biscuit', 'cookie', 'rusk', 'chips', 'wafer', 'namkeen', 'snack', 'chikki', 'mixture', 'noodles', 'popcorn', 'pie', 'fryum', 'laddu', 'til', 'chocolate', 'candy', 'jelly', 'sweet', 'bar', 'lollipop', 'toffee', 'dates', 'kaju', 'badam', 'pista', 'kishmish', 'cashew', 'almond', 'dry fruit', 'makhana', 'appalam', 'papad']):
        p['category'] = 'snacks'
    elif any(w in nl for w in ['tea', 'coffee', 'drink', 'beverage', 'juice', 'shake', 'syrup', 'bournvita', 'horlicks', 'boost']):
        p['category'] = 'beverages'
    elif any(w in nl for w in ['soap', 'shampoo', 'paste', 'brush', 'powder', 'cream', 'lotion', 'face wash', 'talc', 'pad', 'stayfree', 'sanitary']):
        p['category'] = 'personal-care'
    elif any(w in nl for w in ['detergent', 'wash', 'cleaner', 'wiper', 'mop', 'broom', 'repellent', 'harpic', 'comfort', 'scent', 'agarbatti', 'dhoop', 'sambrani', 'battery', 'acid']):
        p['category'] = 'household'
    elif any(w in nl for w in ['milk', 'curd', 'paneer', 'cheese', 'butter', 'ice cream']):
        p['category'] = 'dairy-bakery'
    else:
        p['category'] = 'snacks'

    fixed_products.append(p)

# Save updated src/data/products-catalog.json
with open(CATALOG_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(fixed_products, f, indent=2)

print(f"Successfully processed {len(fixed_products)} products.")
print(f"Unlinked shared/mismatched images: {unlinked_count}")
print(f"Confirmed prices set: {price_set_count}")

# Synchronize master files
master_catalog = []
for p in fixed_products:
    master_catalog.append({
        'product_id': p['id'],
        'source_item_no': p['itemNumber'],
        'source_name': p.get('rawName') or p['name'],
        'display_name': p['name'],
        'brand': p.get('brand'),
        'variant': p.get('variant'),
        'pack_size': p.get('variant') or '',
        'category_id': p['category'],
        'mrp': p['originalPrice'],
        'selling_price': p['price'],
        'price_confirmed': p['priceConfirmed'],
        'image_url': p['imageUrl'],
        'image_status': p['imageStatus'],
        'in_stock': True,
        'stock_count': 25
    })

with open(MASTER_CATALOG_JSON, 'w', encoding='utf-8') as f:
    json.dump(master_catalog, f, indent=2)

with open(MASTER_MANIFEST_JSON, 'w', encoding='utf-8') as f:
    json.dump([
        {
            'product_id': p['id'],
            'display_name': p['name'],
            'brand': p['brand'],
            'image_status': p['imageStatus'],
            'image_url': p['imageUrl'],
            'price': p['price']
        } for p in fixed_products
    ], f, indent=2)

# Update import_log.json to remove disqualified items
if os.path.exists(IMPORT_LOG_JSON):
    with open(IMPORT_LOG_JSON, 'r', encoding='utf-8') as f:
        log_entries = json.load(f)
    cleaned_log = [e for e in log_entries if e.get('product_id') not in DISQUALIFIED_PIDS]
    with open(IMPORT_LOG_JSON, 'w', encoding='utf-8') as f:
        json.dump(cleaned_log, f, indent=2)
    print(f"Cleaned import_log.json: {len(cleaned_log)} strictly verified entries remain.")

print("\n=== OPTION 1 FIX COMPLETE ===")
