import json
import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

CATALOG_PATH = r"C:\Users\gumma\.gemini\antigravity\scratch\G1mart\src\data\products-catalog.json"
BACKUP_PATH = r"C:\Users\gumma\.gemini\antigravity\scratch\G1mart\src\data\products-catalog.backup_user_audit.json"

print("1. Creating catalog backup...")
shutil.copyfile(CATALOG_PATH, BACKUP_PATH)
print(f"Backup saved to {BACKUP_PATH}")

with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Loaded {len(catalog)} products from catalog.")

catalog_map = {p['id']: p for p in catalog}

# -------------------------------------------------------------
# 2. Targeted Image & Quality Rectifications
# -------------------------------------------------------------
print("\n2. Applying targeted image and product fixes...")

# A. Heritage Curd Pouch
if 'g1-dry004' in catalog_map:
    p = catalog_map['g1-dry004']
    p['name'] = "Heritage Fresh Thick Homogenised Curd Pouch"
    p['image'] = "/products/verified/dry-heritage-curd-450g.webp"
    p['imageUrl'] = "/products/verified/dry-heritage-curd-450g.webp"
    p['image_url'] = "/products/verified/dry-heritage-curd-450g.webp"
    p['image_path'] = "/products/verified/dry-heritage-curd-450g.webp"
    p['unit'] = "450 g"
    p['price'] = 38
    p['mrp'] = 38
    p['variants'] = [
        {"id": "g1-dry004-v1", "name": "200 g", "unit": "200 g", "price": 15, "mrp": 15, "in_stock": True, "image": "/products/verified/dry-heritage-curd-200g.webp"},
        {"id": "g1-dry004-v2", "name": "450 g", "unit": "450 g", "price": 38, "mrp": 38, "in_stock": True, "image": "/products/verified/dry-heritage-curd-450g.webp"},
        {"id": "g1-dry004-v3", "name": "1 kg", "unit": "1 kg", "price": 72, "mrp": 72, "in_stock": True, "image": "/products/verified/dry-heritage-curd-1kg.webp"}
    ]
    print("Fixed Heritage Curd Pouch (g1-dry004) with clear packshot & 3 quantity variants (200g, 450g, 1kg)")

# B. Arun Double Blast Ice Cream
if 'g1-dry034' in catalog_map:
    p = catalog_map['g1-dry034']
    p['name'] = "Arun Icecreams Double Blast Ice Cream Bar"
    p['image'] = "/products/verified/dry-arun-double-blast.webp"
    p['imageUrl'] = "/products/verified/dry-arun-double-blast.webp"
    p['image_url'] = "/products/verified/dry-arun-double-blast.webp"
    p['image_path'] = "/products/verified/dry-arun-double-blast.webp"
    p['unit'] = "70 ml"
    p['price'] = 40
    p['mrp'] = 40
    p['variants'] = [
        {"id": "g1-dry034-v1", "name": "70 ml", "unit": "70 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/dry-arun-double-blast.webp"}
    ]
    print("Fixed Arun Double Blast (g1-dry034) with genuine chocolate bar packshot (refrigerator removed)")

# C. Parle Hide & Seek Chocolate Chip Biscuits
if 'g1-bsc002' in catalog_map:
    p = catalog_map['g1-bsc002']
    p['name'] = "Parle Hide & Seek Chocolate Chip Biscuits"
    p['image'] = "/products/verified/bsc-parle-hide-seek.webp"
    p['imageUrl'] = "/products/verified/bsc-parle-hide-seek.webp"
    p['image_url'] = "/products/verified/bsc-parle-hide-seek.webp"
    p['image_path'] = "/products/verified/bsc-parle-hide-seek.webp"
    p['unit'] = "120 g"
    p['price'] = 35
    p['mrp'] = 35
    p['variants'] = [
        {"id": "g1-bsc002-v1", "name": "33 g (₹10 Pack)", "unit": "33 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/bsc-parle-hide-seek.webp"},
        {"id": "g1-bsc002-v2", "name": "120 g (Standard Pack)", "unit": "120 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/bsc-parle-hide-seek.webp"}
    ]
    print("Fixed Parle Hide & Seek (g1-bsc002) with authentic purple packshot & 2 quantity variants")

# D. Heritage Buttermilk
if 'g1-dry014' in catalog_map:
    p = catalog_map['g1-dry014']
    p['image'] = "/products/verified/dry-heritage-buttermilk.webp"
    p['imageUrl'] = "/products/verified/dry-heritage-buttermilk.webp"
    p['image_url'] = "/products/verified/dry-heritage-buttermilk.webp"
    p['image_path'] = "/products/verified/dry-heritage-buttermilk.webp"

# E. Kissan Tomato Ketchup (Fix blank image & add multi-quantity variants)
if 'g1-p0311' in catalog_map:
    p = catalog_map['g1-p0311']
    p['name'] = "Kissan Fresh Tomato Ketchup"
    p['image'] = "/products/packshots/kissan-fresh-tomato-ketchup-500g.webp"
    p['imageUrl'] = "/products/packshots/kissan-fresh-tomato-ketchup-500g.webp"
    p['image_url'] = "/products/packshots/kissan-fresh-tomato-ketchup-500g.webp"
    p['image_path'] = "/products/packshots/kissan-fresh-tomato-ketchup-500g.webp"
    p['unit'] = "500 g"
    p['price'] = 85
    p['mrp'] = 85
    p['variants'] = [
        {"id": "g1-p0311-v1", "name": "45 g (Mini Squeeze)", "unit": "45 g", "price": 5, "mrp": 5, "in_stock": True, "image": "/products/packshots/kissan-fresh-tomato-ketchup-500g.webp"},
        {"id": "g1-p0311-v2", "name": "500 g (Bottle)", "unit": "500 g", "price": 85, "mrp": 85, "in_stock": True, "image": "/products/packshots/kissan-fresh-tomato-ketchup-500g.webp"},
        {"id": "g1-p0311-v3", "name": "1 kg (Refill Pouch)", "unit": "1 kg", "price": 145, "mrp": 145, "in_stock": True, "image": "/products/packshots/kissan-fresh-tomato-ketchup-1kg.webp"}
    ]
    print("Fixed Kissan Tomato Ketchup (g1-p0311) with authentic packshot & 3 quantity variants")

# F. Veeba Mayonnaise (Fix ginger-garlic-paste image mismatch)
if 'g1-p1173' in catalog_map:
    p = catalog_map['g1-p1173']
    p['name'] = "Veeba Truly Eggless Mayonnaise"
    p['image'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['imageUrl'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['image_url'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['image_path'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['unit'] = "275 g"
    p['price'] = 85
    p['mrp'] = 85
    print("Fixed Veeba Mayonnaise (g1-p1173) with proper packshot (removed ginger garlic paste)")

if 'g1-p1175' in catalog_map:
    p = catalog_map['g1-p1175']
    p['name'] = "Veeba Burger Mayonnaise"
    p['image'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['imageUrl'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['image_url'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['image_path'] = "/products/packshots/veeba-eggless-mayo-275g.webp"
    p['unit'] = "275 g"
    p['price'] = 85
    p['mrp'] = 85
    print("Fixed Veeba Burger Mayonnaise (g1-p1175) with proper packshot (removed ginger garlic paste)")

# G. Fix misplaced categories
if 'g1-p0780' in catalog_map:
    p = catalog_map['g1-p0780']
    p['name'] = "Britannia Treat Jim Jam Sandwich Biscuits"
    p['category'] = "biscuits-bakery"
    p['category_id'] = "biscuits-bakery"
    p['subCategory'] = "Cream Biscuits & Choco Fills"
    p['sub_category'] = "Cream Biscuits & Choco Fills"
    p['image'] = "/products/verified/bsc-jim-jam-10rs.webp"
    p['imageUrl'] = "/products/verified/bsc-jim-jam-10rs.webp"
    p['image_url'] = "/products/verified/bsc-jim-jam-10rs.webp"
    p['unit'] = "50 g"
    p['price'] = 10
    p['mrp'] = 10
    print("Moved Jim Jam Biscuits (g1-p0780) to biscuits-bakery")

for gj_id in ['g1-p0688', 'g1-p1019']:
    if gj_id in catalog_map:
        p = catalog_map[gj_id]
        p['name'] = "Gits Instant Gulab Jamun Dessert Mix"
        p['category'] = "instant-food"
        p['category_id'] = "instant-food"
        p['subCategory'] = "Ready Mixes & Breakfast"
        p['sub_category'] = "Ready Mixes & Breakfast"
        p['image'] = "/products/packshots/gits-gulab-jamun-mix-200g.webp"
        p['imageUrl'] = "/products/packshots/gits-gulab-jamun-mix-200g.webp"
        p['image_url'] = "/products/packshots/gits-gulab-jamun-mix-200g.webp"
        p['unit'] = "200 g"
        p['price'] = 135
        p['mrp'] = 135
        print(f"Moved Gulab Jamun Mix ({gj_id}) to instant-food")

# Deactivate bad raw placeholder items in sauces
raw_bad_sauces = ['g1-p0486', 'g1-p0597', 'g1-p0690', 'g1-p0826', 'g1-p1183', 'g1-p1561', 'g1-p1562', 'g1-p1563']
for r_id in raw_bad_sauces:
    if r_id in catalog_map:
        catalog_map[r_id]['isActive'] = False
        catalog_map[r_id]['is_active'] = False
        catalog_map[r_id]['inStock'] = False
        catalog_map[r_id]['in_stock'] = False

# -------------------------------------------------------------
# 3. Add Multi-Quantity Variants on Common Core Products
# -------------------------------------------------------------
print("\n3. Enriching multi-quantity variants...")

# Arokya Milk (500ml, 1L)
if 'g1-dry053' in catalog_map:
    catalog_map['g1-dry053']['variants'] = [
        {"id": "g1-dry053-v1", "name": "500 ml", "unit": "500 ml", "price": 30, "mrp": 30, "in_stock": True, "image": "/products/verified/dry-arokya-toned-milk.webp"},
        {"id": "g1-dry053-v2", "name": "1 L", "unit": "1 L", "price": 60, "mrp": 60, "in_stock": True, "image": "/products/verified/dry-arokya-toned-milk.webp"}
    ]

# Heritage Milk (500ml, 1L)
if 'g1-dry001' in catalog_map:
    catalog_map['g1-dry001']['variants'] = [
        {"id": "g1-dry001-v1", "name": "500 ml", "unit": "500 ml", "price": 29, "mrp": 29, "in_stock": True, "image": "/products/verified/dry-heritage-toned-milk.webp"},
        {"id": "g1-dry001-v2", "name": "1 L", "unit": "1 L", "price": 58, "mrp": 58, "in_stock": True, "image": "/products/verified/dry-heritage-toned-milk.webp"}
    ]

# Maggi 2-Minute Masala Noodles (48g, 70g, 140g, 280g)
if 'g1-ins001' in catalog_map:
    catalog_map['g1-ins001']['variants'] = [
        {"id": "g1-ins001-v1", "name": "48 g (Chhota Pack)", "unit": "48 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/packshots/maggi-2-minute-noodles-70g.webp"},
        {"id": "g1-ins001-v2", "name": "70 g (Single Pack)", "unit": "70 g", "price": 14, "mrp": 14, "in_stock": True, "image": "/products/packshots/maggi-2-minute-noodles-70g.webp"},
        {"id": "g1-ins001-v3", "name": "140 g (2-in-1 Pack)", "unit": "140 g", "price": 28, "mrp": 28, "in_stock": True, "image": "/products/packshots/maggi-2-minute-noodles-70g.webp"},
        {"id": "g1-ins001-v4", "name": "280 g (4-Pack Multipack)", "unit": "280 g", "price": 56, "mrp": 56, "in_stock": True, "image": "/products/packshots/maggi-2-minute-noodles-multipack.webp"}
    ]

# YiPPee Magic Masala (60g, 240g)
if 'g1-ins004' in catalog_map:
    catalog_map['g1-ins004']['variants'] = [
        {"id": "g1-ins004-v1", "name": "60 g (Single Pack)", "unit": "60 g", "price": 12, "mrp": 12, "in_stock": True, "image": "/products/packshots/yippee-magic-masala-single.webp"},
        {"id": "g1-ins004-v2", "name": "240 g (4-Pack Multipack)", "unit": "240 g", "price": 48, "mrp": 48, "in_stock": True, "image": "/products/packshots/yippee-magic-masala-4pack.webp"}
    ]

# Parle-G (65g, 130g, 1kg)
if 'g1-bsc068' in catalog_map:
    catalog_map['g1-bsc068']['variants'] = [
        {"id": "g1-bsc068-v1", "name": "65 g (Pocket Pack)", "unit": "65 g", "price": 5, "mrp": 5, "in_stock": True, "image": "/products/verified/bsc-parle-g-5rs.webp"},
        {"id": "g1-bsc068-v2", "name": "130 g (Standard Pack)", "unit": "130 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/bsc-parle-g-10rs.webp"},
        {"id": "g1-bsc068-v3", "name": "1 kg (Family Pack)", "unit": "1 kg", "price": 120, "mrp": 120, "in_stock": True, "image": "/products/verified/bsc-parle-g-1kg.webp"}
    ]

# Britannia Good Day Cashew (42g, 120g, 600g)
if 'g1-bsc070' in catalog_map:
    catalog_map['g1-bsc070']['variants'] = [
        {"id": "g1-bsc070-v1", "name": "42 g (Pocket Pack)", "unit": "42 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/bsc-good-day-cashew-10rs.webp"},
        {"id": "g1-bsc070-v2", "name": "120 g (Standard Pack)", "unit": "120 g", "price": 30, "mrp": 30, "in_stock": True, "image": "/products/verified/bsc-good-day-cashew-10rs.webp"},
        {"id": "g1-bsc070-v3", "name": "600 g (Family Pack)", "unit": "600 g", "price": 120, "mrp": 120, "in_stock": True, "image": "/products/verified/bsc-good-day-cashew-600g.webp"}
    ]

# Britannia Marie Gold (120g, 1kg)
if 'g1-bsc073' in catalog_map:
    catalog_map['g1-bsc073']['variants'] = [
        {"id": "g1-bsc073-v1", "name": "120 g (Pocket Pack)", "unit": "120 g", "price": 15, "mrp": 15, "in_stock": True, "image": "/products/verified/bsc-marie-gold-120g.webp"},
        {"id": "g1-bsc073-v2", "name": "1 kg (Family Pack)", "unit": "1 kg", "price": 110, "mrp": 110, "in_stock": True, "image": "/products/verified/bsc-marie-gold-1kg.webp"}
    ]

# Cadbury Oreo Vanilla (43g, 120g)
if 'g1-bsc041' in catalog_map:
    catalog_map['g1-bsc041']['variants'] = [
        {"id": "g1-bsc041-v1", "name": "43 g (Pocket Pack)", "unit": "43 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/bsc-oreo-vanilla-10rs.webp"},
        {"id": "g1-bsc041-v2", "name": "120 g (Standard Pack)", "unit": "120 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/bsc-oreo-vanilla.webp"}
    ]

# Kissan Mixed Fruit Jam (200g, 500g)
if 'g1-sau012' in catalog_map:
    catalog_map['g1-sau012']['variants'] = [
        {"id": "g1-sau012-v1", "name": "200 g (Glass Jar)", "unit": "200 g", "price": 75, "mrp": 75, "in_stock": True, "image": "/products/packshots/mixed-fruit-jam.jpg"},
        {"id": "g1-sau012-v2", "name": "500 g (Glass Jar)", "unit": "500 g", "price": 165, "mrp": 165, "in_stock": True, "image": "/products/packshots/mixed-fruit-jam.jpg"}
    ]

# Arun Vanilla Family Tub (500ml, 1L)
if 'g1-dry026' in catalog_map:
    catalog_map['g1-dry026']['variants'] = [
        {"id": "g1-dry026-v1", "name": "500 ml", "unit": "500 ml", "price": 110, "mrp": 110, "in_stock": True, "image": "/products/verified/dry-arun-vanilla-tub.webp"},
        {"id": "g1-dry026-v2", "name": "1 L", "unit": "1 L", "price": 160, "mrp": 160, "in_stock": True, "image": "/products/verified/ice-arun-vanilla-1l.webp"}
    ]

# Arun Butterscotch Family Tub (500ml, 1L)
if 'g1-dry027' in catalog_map:
    catalog_map['g1-dry027']['variants'] = [
        {"id": "g1-dry027-v1", "name": "500 ml", "unit": "500 ml", "price": 130, "mrp": 130, "in_stock": True, "image": "/products/verified/dry-arun-butterscotch-tub.webp"},
        {"id": "g1-dry027-v2", "name": "1 L", "unit": "1 L", "price": 180, "mrp": 180, "in_stock": True, "image": "/products/verified/ice-arun-butterscotch-1l.webp"}
    ]

# -------------------------------------------------------------
# 4. Add Missing Products from Inventory PDF
# -------------------------------------------------------------
print("\n4. Adding missing products from inventory PDF...")

NEW_PRODUCTS = [
    # Dairy
    {
        "id": "g1-pos-1017", "itemNumber": 1017,
        "name": "Hatsun Pure Fresh Curd Pouch", "brand": "Hatsun", "brand_id": "brand-hatsun",
        "category": "dairy-bread-eggs", "category_id": "dairy-bread-eggs", "category_name": "Dairy, Bread & Eggs",
        "subCategory": "Fresh Milk & Curd", "sub_category": "Fresh Milk & Curd",
        "unit": "400 g", "price": 35, "mrp": 35, "originalPrice": 35, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-hatsun-curd.webp", "imageUrl": "/products/verified/dry-hatsun-curd.webp",
        "image_url": "/products/verified/dry-hatsun-curd.webp", "image_path": "/products/verified/dry-hatsun-curd.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Pure, thick homogenised curd made from high quality pasteurised milk. Perfect for curd rice and raita.",
        "rating": 4.8, "reviewsCount": 26, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1017-v1", "name": "400 g", "unit": "400 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/dry-hatsun-curd.webp"}]
    },
    {
        "id": "g1-pos-1154", "itemNumber": 1154,
        "name": "Hatsun Sweet Malai Lassi", "brand": "Hatsun", "brand_id": "brand-hatsun",
        "category": "dairy-bread-eggs", "category_id": "dairy-bread-eggs", "category_name": "Dairy, Bread & Eggs",
        "subCategory": "Chilled Beverages & Lassi", "sub_category": "Chilled Beverages & Lassi",
        "unit": "200 ml", "price": 20, "mrp": 20, "originalPrice": 20, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-hatsun-malai-lassi.webp", "imageUrl": "/products/verified/dry-hatsun-malai-lassi.webp",
        "image_url": "/products/verified/dry-hatsun-malai-lassi.webp", "image_path": "/products/verified/dry-hatsun-malai-lassi.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Rich and refreshing sweet malai lassi chilled and ready to drink.",
        "rating": 4.7, "reviewsCount": 19, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1154-v1", "name": "200 ml", "unit": "200 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/dry-hatsun-malai-lassi.webp"}]
    },
    {
        "id": "g1-pos-1414", "itemNumber": 1414,
        "name": "Hatsun Fresh Mango Lassi Pouch", "brand": "Hatsun", "brand_id": "brand-hatsun",
        "category": "dairy-bread-eggs", "category_id": "dairy-bread-eggs", "category_name": "Dairy, Bread & Eggs",
        "subCategory": "Chilled Beverages & Lassi", "sub_category": "Chilled Beverages & Lassi",
        "unit": "200 ml", "price": 25, "mrp": 25, "originalPrice": 25, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-hatsun-mango-lassi.webp", "imageUrl": "/products/verified/dry-hatsun-mango-lassi.webp",
        "image_url": "/products/verified/dry-hatsun-mango-lassi.webp", "image_path": "/products/verified/dry-hatsun-mango-lassi.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Luscious blend of Alphonso mango pulp and thick creamy curd.",
        "rating": 4.8, "reviewsCount": 22, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1414-v1", "name": "200 ml", "unit": "200 ml", "price": 25, "mrp": 25, "in_stock": True, "image": "/products/verified/dry-hatsun-mango-lassi.webp"}]
    },
    {
        "id": "g1-pos-1413", "itemNumber": 1413,
        "name": "Hatsun Masala Jeera Buttermilk", "brand": "Hatsun", "brand_id": "brand-hatsun",
        "category": "dairy-bread-eggs", "category_id": "dairy-bread-eggs", "category_name": "Dairy, Bread & Eggs",
        "subCategory": "Chilled Beverages & Lassi", "sub_category": "Chilled Beverages & Lassi",
        "unit": "200 ml", "price": 12, "mrp": 12, "originalPrice": 12, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-hatsun-jeera-buttermilk.webp", "imageUrl": "/products/verified/dry-hatsun-jeera-buttermilk.webp",
        "image_url": "/products/verified/dry-hatsun-jeera-buttermilk.webp", "image_path": "/products/verified/dry-hatsun-jeera-buttermilk.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Cooling spiced churned buttermilk seasoned with roasted jeera and curry leaves.",
        "rating": 4.7, "reviewsCount": 18, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1413-v1", "name": "200 ml", "unit": "200 ml", "price": 12, "mrp": 12, "in_stock": True, "image": "/products/verified/dry-hatsun-jeera-buttermilk.webp"}]
    },
    {
        "id": "g1-pos-1431", "itemNumber": 1431,
        "name": "Hatsun Fresh Malai Paneer", "brand": "Hatsun", "brand_id": "brand-hatsun",
        "category": "dairy-bread-eggs", "category_id": "dairy-bread-eggs", "category_name": "Dairy, Bread & Eggs",
        "subCategory": "Paneer, Butter & Cheese", "sub_category": "Paneer, Butter & Cheese",
        "unit": "200 g", "price": 105, "mrp": 105, "originalPrice": 105, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-hatsun-paneer-200g.webp", "imageUrl": "/products/verified/dry-hatsun-paneer-200g.webp",
        "image_url": "/products/verified/dry-hatsun-paneer-200g.webp", "image_path": "/products/verified/dry-hatsun-paneer-200g.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Soft and succulent vacuum-sealed fresh paneer made from pure cow milk.",
        "rating": 4.8, "reviewsCount": 31, "isPopular": True, "isBestDeal": False,
        "variants": [
            {"id": "g1-pos-1431-v1", "name": "200 g", "unit": "200 g", "price": 105, "mrp": 105, "in_stock": True, "image": "/products/verified/dry-hatsun-paneer-200g.webp"},
            {"id": "g1-pos-1431-v2", "name": "500 g", "unit": "500 g", "price": 240, "mrp": 240, "in_stock": True, "image": "/products/verified/dry-hatsun-paneer-200g.webp"}
        ]
    },
    {
        "id": "g1-pos-1412", "itemNumber": 1412,
        "name": "Hatsun Pure Cow Ghee", "brand": "Hatsun", "brand_id": "brand-hatsun",
        "category": "oil-ghee-masala", "category_id": "oil-ghee-masala", "category_name": "Oil, Ghee & Masala",
        "subCategory": "Edible Oils & Ghee", "sub_category": "Edible Oils & Ghee",
        "unit": "500 ml", "price": 385, "mrp": 385, "originalPrice": 385, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-hatsun-ghee-500ml.webp", "imageUrl": "/products/verified/dry-hatsun-ghee-500ml.webp",
        "image_url": "/products/verified/dry-hatsun-ghee-500ml.webp", "image_path": "/products/verified/dry-hatsun-ghee-500ml.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Aromatic golden granular pure cow ghee made with traditional churning process.",
        "rating": 4.9, "reviewsCount": 42, "isPopular": True, "isBestDeal": True,
        "variants": [
            {"id": "g1-pos-1412-v1", "name": "200 ml", "unit": "200 ml", "price": 165, "mrp": 165, "in_stock": True, "image": "/products/verified/dry-hatsun-ghee-500ml.webp"},
            {"id": "g1-pos-1412-v2", "name": "500 ml", "unit": "500 ml", "price": 385, "mrp": 385, "in_stock": True, "image": "/products/verified/dry-hatsun-ghee-500ml.webp"},
            {"id": "g1-pos-1412-v3", "name": "1 L", "unit": "1 L", "price": 740, "mrp": 740, "in_stock": True, "image": "/products/verified/dry-hatsun-ghee-500ml.webp"}
        ]
    },
    {
        "id": "g1-pos-0671", "itemNumber": 671,
        "name": "Farm Fresh White Eggs Protective Pack", "brand": "Farm Fresh", "brand_id": "brand-farm-fresh",
        "category": "dairy-bread-eggs", "category_id": "dairy-bread-eggs", "category_name": "Dairy, Bread & Eggs",
        "subCategory": "Fresh Eggs", "sub_category": "Fresh Eggs",
        "unit": "6 pcs", "price": 48, "mrp": 48, "originalPrice": 48, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/dry-farm-fresh-eggs-6pack.webp", "imageUrl": "/products/verified/dry-farm-fresh-eggs-6pack.webp",
        "image_url": "/products/verified/dry-farm-fresh-eggs-6pack.webp", "image_path": "/products/verified/dry-farm-fresh-eggs-6pack.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Hygienically sorted and cleaned protein-rich table eggs in secure molded packaging.",
        "rating": 4.8, "reviewsCount": 55, "isPopular": True, "isBestDeal": False,
        "variants": [
            {"id": "g1-pos-0671-v1", "name": "6 pcs", "unit": "6 pcs", "price": 48, "mrp": 48, "in_stock": True, "image": "/products/verified/dry-farm-fresh-eggs-6pack.webp"},
            {"id": "g1-pos-0671-v2", "name": "12 pcs", "unit": "12 pcs", "price": 95, "mrp": 95, "in_stock": True, "image": "/products/verified/dry-farm-fresh-eggs-6pack.webp"},
            {"id": "g1-pos-0671-v3", "name": "30 pcs (Full Tray)", "unit": "30 pcs", "price": 210, "mrp": 210, "in_stock": True, "image": "/products/verified/dry-farm-fresh-eggs-6pack.webp"}
        ]
    },

    # Ice Creams
    {
        "id": "g1-pos-1033", "itemNumber": 1033,
        "name": "Arun Icecreams Lipstick Strawberry Ice Bar", "brand": "Arun Icecreams", "brand_id": "brand-arun-icecreams",
        "category": "ice-creams", "category_id": "ice-creams", "category_name": "Ice Creams & More",
        "subCategory": "Arun Icecreams Sticks & Bars", "sub_category": "Arun Icecreams Sticks & Bars",
        "unit": "45 ml", "price": 10, "mrp": 10, "originalPrice": 10, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ice-arun-lipstick.webp", "imageUrl": "/products/verified/ice-arun-lipstick.webp",
        "image_url": "/products/verified/ice-arun-lipstick.webp", "image_path": "/products/verified/ice-arun-lipstick.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Fun strawberry ice candy bar designed in classic push-up lipstick style.",
        "rating": 4.7, "reviewsCount": 20, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1033-v1", "name": "45 ml", "unit": "45 ml", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/ice-arun-lipstick.webp"}]
    },
    {
        "id": "g1-pos-1157", "itemNumber": 1157,
        "name": "Arun Icecreams Fun Wheel Ice Cream", "brand": "Arun Icecreams", "brand_id": "brand-arun-icecreams",
        "category": "ice-creams", "category_id": "ice-creams", "category_name": "Ice Creams & More",
        "subCategory": "Arun Icecreams Sticks & Bars", "sub_category": "Arun Icecreams Sticks & Bars",
        "unit": "60 ml", "price": 20, "mrp": 20, "originalPrice": 20, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ice-arun-fun-wheel.webp", "imageUrl": "/products/verified/ice-arun-fun-wheel.webp",
        "image_url": "/products/verified/ice-arun-fun-wheel.webp", "image_path": "/products/verified/ice-arun-fun-wheel.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Multi-flavor swirl ice cream wheel stick bar with bright colors and creamy texture.",
        "rating": 4.7, "reviewsCount": 16, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1157-v1", "name": "60 ml", "unit": "60 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/ice-arun-fun-wheel.webp"}]
    },
    {
        "id": "g1-pos-1359", "itemNumber": 1359,
        "name": "Arun Icecreams Chocolate Trio Ball", "brand": "Arun Icecreams", "brand_id": "brand-arun-icecreams",
        "category": "ice-creams", "category_id": "ice-creams", "category_name": "Ice Creams & More",
        "subCategory": "Arun Icecreams Sticks & Bars", "sub_category": "Arun Icecreams Sticks & Bars",
        "unit": "60 ml", "price": 25, "mrp": 25, "originalPrice": 25, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ice-arun-chocolate-ball.webp", "imageUrl": "/products/verified/ice-arun-chocolate-ball.webp",
        "image_url": "/products/verified/ice-arun-chocolate-ball.webp", "image_path": "/products/verified/ice-arun-chocolate-ball.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Crispy chocolate-covered ice cream sphere ball filled with luscious cream.",
        "rating": 4.8, "reviewsCount": 24, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1359-v1", "name": "60 ml", "unit": "60 ml", "price": 25, "mrp": 25, "in_stock": True, "image": "/products/verified/ice-arun-chocolate-ball.webp"}]
    },

    # Instant Food & Noodles
    {
        "id": "g1-pos-0707", "itemNumber": 707,
        "name": "Sunfeast YiPPee! Wow Masala Instant Noodles", "brand": "Sunfeast", "brand_id": "brand-sunfeast",
        "category": "instant-food", "category_id": "instant-food", "category_name": "Instant & Frozen Food",
        "subCategory": "Noodles, Pasta & Vermicelli", "sub_category": "Noodles, Pasta & Vermicelli",
        "unit": "65 g", "price": 14, "mrp": 14, "originalPrice": 14, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ins-yippee-wow-masala.webp", "imageUrl": "/products/verified/ins-yippee-wow-masala.webp",
        "image_url": "/products/verified/ins-yippee-wow-masala.webp", "image_path": "/products/verified/ins-yippee-wow-masala.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Non-sticky round noodles infused with rich spices and dehydrated vegetables.",
        "rating": 4.7, "reviewsCount": 28, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0707-v1", "name": "65 g", "unit": "65 g", "price": 14, "mrp": 14, "in_stock": True, "image": "/products/verified/ins-yippee-wow-masala.webp"}]
    },
    {
        "id": "g1-pos-0225", "itemNumber": 225,
        "name": "Knorr Classic Thick Tomato Soup Mix", "brand": "Knorr", "brand_id": "brand-knorr",
        "category": "instant-food", "category_id": "instant-food", "category_name": "Instant & Frozen Food",
        "subCategory": "Ready Mixes & Breakfast", "sub_category": "Ready Mixes & Breakfast",
        "unit": "53 g", "price": 35, "mrp": 35, "originalPrice": 35, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ins-knorr-tomato-soup.webp", "imageUrl": "/products/verified/ins-knorr-tomato-soup.webp",
        "image_url": "/products/verified/ins-knorr-tomato-soup.webp", "image_path": "/products/verified/ins-knorr-tomato-soup.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Restaurant quality rich and tangy tomato soup seasoned with herbs and croutons.",
        "rating": 4.8, "reviewsCount": 35, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0225-v1", "name": "53 g", "unit": "53 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/ins-knorr-tomato-soup.webp"}]
    },
    {
        "id": "g1-pos-0521", "itemNumber": 521,
        "name": "Bambino Roasted Short Vermicelli (Semiya)", "brand": "Bambino", "brand_id": "brand-bambino",
        "category": "instant-food", "category_id": "instant-food", "category_name": "Instant & Frozen Food",
        "subCategory": "Noodles, Pasta & Vermicelli", "sub_category": "Noodles, Pasta & Vermicelli",
        "unit": "250 g", "price": 28, "mrp": 28, "originalPrice": 28, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ins-bambino-vermicelli-250g.webp", "imageUrl": "/products/verified/ins-bambino-vermicelli-250g.webp",
        "image_url": "/products/verified/ins-bambino-vermicelli-250g.webp", "image_path": "/products/verified/ins-bambino-vermicelli-250g.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Pre-roasted 100% hard wheat semolina vermicelli for quick payasam and upma.",
        "rating": 4.8, "reviewsCount": 40, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0521-v1", "name": "250 g", "unit": "250 g", "price": 28, "mrp": 28, "in_stock": True, "image": "/products/verified/ins-bambino-vermicelli-250g.webp"}]
    },
    {
        "id": "g1-pos-0233", "itemNumber": 233,
        "name": "Dharani Roasted Upma Rava (Suji)", "brand": "Dharani", "brand_id": "brand-dharani",
        "category": "instant-food", "category_id": "instant-food", "category_name": "Instant & Frozen Food",
        "subCategory": "Ready Mixes & Breakfast", "sub_category": "Ready Mixes & Breakfast",
        "unit": "500 g", "price": 42, "mrp": 42, "originalPrice": 42, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ins-dharani-upma-rava-500g.webp", "imageUrl": "/products/verified/ins-dharani-upma-rava-500g.webp",
        "image_url": "/products/verified/ins-dharani-upma-rava-500g.webp", "image_path": "/products/verified/ins-dharani-upma-rava-500g.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Granular roasted wheat rava for fluffy traditional South Indian upma and kesari.",
        "rating": 4.7, "reviewsCount": 21, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0233-v1", "name": "500 g", "unit": "500 g", "price": 42, "mrp": 42, "in_stock": True, "image": "/products/verified/ins-dharani-upma-rava-500g.webp"}]
    },
    {
        "id": "g1-pos-0221", "itemNumber": 221,
        "name": "Premium Thick Poha (Atukulu)", "brand": "G1 Mart Staples", "brand_id": "brand-g1mart",
        "category": "instant-food", "category_id": "instant-food", "category_name": "Instant & Frozen Food",
        "subCategory": "Ready Mixes & Breakfast", "sub_category": "Ready Mixes & Breakfast",
        "unit": "500 g", "price": 38, "mrp": 38, "originalPrice": 38, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/ins-thick-poha-500g.webp", "imageUrl": "/products/verified/ins-thick-poha-500g.webp",
        "image_url": "/products/verified/ins-thick-poha-500g.webp", "image_path": "/products/verified/ins-thick-poha-500g.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Clean, unpolished thick flattened rice flakes for quick breakfast poha and snacks.",
        "rating": 4.8, "reviewsCount": 29, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0221-v1", "name": "500 g", "unit": "500 g", "price": 38, "mrp": 38, "in_stock": True, "image": "/products/verified/ins-thick-poha-500g.webp"}]
    },

    # Sauces & Spreads
    {
        "id": "g1-pos-1389", "itemNumber": 1389,
        "name": "Kissan Sweet & Spicy Tomato Chilli Sauce Bottle", "brand": "Kissan", "brand_id": "brand-kissan",
        "category": "sauces-spreads", "category_id": "sauces-spreads", "category_name": "Sauces & Spreads",
        "subCategory": "Tomato Ketchup & Chilli Sauce", "sub_category": "Tomato Ketchup & Chilli Sauce",
        "unit": "200 g", "price": 55, "mrp": 55, "originalPrice": 55, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/sau-kissan-sweet-spicy.webp", "imageUrl": "/products/verified/sau-kissan-sweet-spicy.webp",
        "image_url": "/products/verified/sau-kissan-sweet-spicy.webp", "image_path": "/products/verified/sau-kissan-sweet-spicy.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Unique tangy and spicy sauce made with farm fresh tomatoes and zesty red chillies.",
        "rating": 4.8, "reviewsCount": 33, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1389-v1", "name": "200 g", "unit": "200 g", "price": 55, "mrp": 55, "in_stock": True, "image": "/products/verified/sau-kissan-sweet-spicy.webp"}]
    },
    {
        "id": "g1-pos-1391", "itemNumber": 1391,
        "name": "Kissan Crunchy Peanut Butter", "brand": "Kissan", "brand_id": "brand-kissan",
        "category": "sauces-spreads", "category_id": "sauces-spreads", "category_name": "Sauces & Spreads",
        "subCategory": "Jams, Honey & Spreads", "sub_category": "Jams, Honey & Spreads",
        "unit": "350 g", "price": 175, "mrp": 175, "originalPrice": 175, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/sau-kissan-peanut-butter.webp", "imageUrl": "/products/verified/sau-kissan-peanut-butter.webp",
        "image_url": "/products/verified/sau-kissan-peanut-butter.webp", "image_path": "/products/verified/sau-kissan-peanut-butter.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "High-protein roasted peanut butter with crunchy bits for morning toast and smoothies.",
        "rating": 4.9, "reviewsCount": 27, "isPopular": True, "isBestDeal": True,
        "variants": [{"id": "g1-pos-1391-v1", "name": "350 g", "unit": "350 g", "price": 175, "mrp": 175, "in_stock": True, "image": "/products/verified/sau-kissan-peanut-butter.webp"}]
    },

    # Biscuits
    {
        "id": "g1-pos-0017", "itemNumber": 17,
        "name": "Unibic Danish Coconut Cookies", "brand": "Unibic", "brand_id": "brand-unibic",
        "category": "biscuits-bakery", "category_id": "biscuits-bakery", "category_name": "Biscuits, Cookies & Rusks",
        "subCategory": "Cookies & Premium Biscuits", "sub_category": "Cookies & Premium Biscuits",
        "unit": "150 g", "price": 50, "mrp": 50, "originalPrice": 50, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/bsc-unibic-coconut.webp", "imageUrl": "/products/verified/bsc-unibic-coconut.webp",
        "image_url": "/products/verified/bsc-unibic-coconut.webp", "image_path": "/products/verified/bsc-unibic-coconut.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Crisp traditional Danish-recipe cookies loaded with desiccated coconut shreds.",
        "rating": 4.8, "reviewsCount": 22, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0017-v1", "name": "150 g", "unit": "150 g", "price": 50, "mrp": 50, "in_stock": True, "image": "/products/verified/bsc-unibic-coconut.webp"}]
    },
    {
        "id": "g1-pos-0539", "itemNumber": 539,
        "name": "Sri Krishna Crunchy Peanut Chikki Bar", "brand": "Sri Krishna", "brand_id": "brand-sri-krishna",
        "category": "biscuits-bakery", "category_id": "biscuits-bakery", "category_name": "Biscuits, Cookies & Rusks",
        "subCategory": "Traditional Indian Sweets", "sub_category": "Traditional Indian Sweets",
        "unit": "100 g", "price": 30, "mrp": 30, "originalPrice": 30, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/bsc-peanut-chikki.webp", "imageUrl": "/products/verified/bsc-peanut-chikki.webp",
        "image_url": "/products/verified/bsc-peanut-chikki.webp", "image_path": "/products/verified/bsc-peanut-chikki.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Traditional roasted groundnut chikki sweetened with natural jaggery.",
        "rating": 4.8, "reviewsCount": 38, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0539-v1", "name": "100 g", "unit": "100 g", "price": 30, "mrp": 30, "in_stock": True, "image": "/products/verified/bsc-peanut-chikki.webp"}]
    }
]

added_count = 0
for np in NEW_PRODUCTS:
    if np['id'] not in catalog_map:
        catalog.append(np)
        catalog_map[np['id']] = np
        added_count += 1
        print(f"Added new product: [{np['id']}] {np['name']} (Rs.{np['price']})")
    else:
        # update existing
        catalog_map[np['id']].update(np)

print(f"\nAdded {added_count} new verified products into catalog.")
print(f"Total catalog products now: {len(catalog)}")

with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("Catalog successfully updated and saved!")
