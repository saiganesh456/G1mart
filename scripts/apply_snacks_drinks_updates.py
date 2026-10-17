import json
import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

CATALOG_PATH = r"C:\Users\gumma\.gemini\antigravity\scratch\G1mart\src\data\products-catalog.json"
BACKUP_PATH = r"C:\Users\gumma\.gemini\antigravity\scratch\G1mart\src\data\products-catalog.backup_snacks_drinks.json"

print("1. Backing up catalog...")
shutil.copyfile(CATALOG_PATH, BACKUP_PATH)
print(f"Backup saved to {BACKUP_PATH}")

with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

catalog_map = {p['id']: p for p in catalog}

print("\n2. Fixing misplaced items...")
# A. Move Weikfield Baking Soda out of drinks-juices to instant-food
if 'g1-p1138' in catalog_map:
    p = catalog_map['g1-p1138']
    p['name'] = "Weikfield Baking Soda"
    p['category'] = "instant-food"
    p['category_id'] = "instant-food"
    p['category_name'] = "Instant & Frozen Food"
    p['subCategory'] = "Baking & Dessert Mixes"
    p['sub_category'] = "Baking & Dessert Mixes"
    p['image'] = "/products/packshots/weikfield-baking-soda-100g.webp"
    p['imageUrl'] = "/products/packshots/weikfield-baking-soda-100g.webp"
    p['image_url'] = "/products/packshots/weikfield-baking-soda-100g.webp"
    p['image_path'] = "/products/packshots/weikfield-baking-soda-100g.webp"
    p['unit'] = "100 g"
    p['price'] = 28
    p['mrp'] = 28
    p['originalPrice'] = 28
    p['variants'] = [
        {"id": "g1-p1138-v1", "name": "100 g", "unit": "100 g", "price": 28, "mrp": 28, "in_stock": True, "image": "/products/packshots/weikfield-baking-soda-100g.webp"}
    ]
    print("Fixed Weikfield Baking Soda (g1-p1138) -> moved from drinks-juices to instant-food with proper packshot")

print("\n3. Enriching multi-quantity variants for common products...")

# Thums Up (250ml, 750ml, 1L, 2.25L)
if 'g1-bev001' in catalog_map:
    p = catalog_map['g1-bev001']
    p['variants'] = [
        {"id": "g1-bev001-v1", "name": "250 ml (Can/PET)", "unit": "250 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-thums-up-750ml.webp"},
        {"id": "g1-bev001-v2", "name": "750 ml (Standard)", "unit": "750 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/bev-thums-up-750ml.webp"},
        {"id": "g1-bev001-v3", "name": "1 L (Large Bottle)", "unit": "1 L", "price": 50, "mrp": 50, "in_stock": True, "image": "/products/verified/bev-thums-up-750ml.webp"},
        {"id": "g1-bev001-v4", "name": "2.25 L (Party Pack)", "unit": "2.25 L", "price": 99, "mrp": 99, "in_stock": True, "image": "/products/verified/bev-thums-up-750ml.webp"}
    ]
    print("Configured Thums Up (g1-bev001) with 4 quantity variants (250ml, 750ml, 1L, 2.25L)")

# Coca-Cola (250ml, 750ml, 2.25L)
if 'g1-bev002' in catalog_map:
    p = catalog_map['g1-bev002']
    p['variants'] = [
        {"id": "g1-bev002-v1", "name": "250 ml", "unit": "250 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-coca-cola-750ml.webp"},
        {"id": "g1-bev002-v2", "name": "750 ml", "unit": "750 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/bev-coca-cola-750ml.webp"},
        {"id": "g1-bev002-v3", "name": "2.25 L", "unit": "2.25 L", "price": 99, "mrp": 99, "in_stock": True, "image": "/products/verified/bev-coca-cola-750ml.webp"}
    ]

# Sprite (250ml, 750ml, 1L, 2.25L)
if 'g1-bev003' in catalog_map:
    p = catalog_map['g1-bev003']
    p['variants'] = [
        {"id": "g1-bev003-v1", "name": "250 ml", "unit": "250 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"},
        {"id": "g1-bev003-v2", "name": "750 ml", "unit": "750 ml", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"},
        {"id": "g1-bev003-v3", "name": "1 L", "unit": "1 L", "price": 50, "mrp": 50, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"},
        {"id": "g1-bev003-v4", "name": "2.25 L", "unit": "2.25 L", "price": 99, "mrp": 99, "in_stock": True, "image": "/products/verified/bev-sprite-750ml.webp"}
    ]

# Maaza (250ml, 600ml, 1.2L)
if 'g1-bev009' in catalog_map:
    p = catalog_map['g1-bev009']
    p['variants'] = [
        {"id": "g1-bev009-v1", "name": "250 ml", "unit": "250 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-maaza-600ml.webp"},
        {"id": "g1-bev009-v2", "name": "600 ml", "unit": "600 ml", "price": 42, "mrp": 42, "in_stock": True, "image": "/products/verified/bev-maaza-600ml.webp"},
        {"id": "g1-bev009-v3", "name": "1.2 L", "unit": "1.2 L", "price": 75, "mrp": 75, "in_stock": True, "image": "/products/verified/bev-maaza-600ml.webp"}
    ]

# Kinley Water (500ml, 1L)
if 'g1-bev045' in catalog_map:
    p = catalog_map['g1-bev045']
    p['variants'] = [
        {"id": "g1-bev045-v1", "name": "500 ml", "unit": "500 ml", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/bev-kinley-500ml.webp"},
        {"id": "g1-bev045-v2", "name": "1 L", "unit": "1 L", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-kinley-water-1l.webp"}
    ]

# Cadbury Dairy Milk (13g, 24g, 50g)
if 'g1-swt001' in catalog_map:
    p = catalog_map['g1-swt001']
    p['variants'] = [
        {"id": "g1-swt001-v1", "name": "13 g (₹5 Pack)", "unit": "13 g", "price": 5, "mrp": 5, "in_stock": True, "image": "/products/verified/swt-cadbury-dairy-milk.webp"},
        {"id": "g1-swt001-v2", "name": "24 g (₹10 Pack)", "unit": "24 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/swt-cadbury-dairy-milk.webp"},
        {"id": "g1-swt001-v3", "name": "50 g (Regular Bar)", "unit": "50 g", "price": 45, "mrp": 45, "in_stock": True, "image": "/products/verified/swt-cadbury-dairy-milk.webp"}
    ]

# Cadbury 5 Star (10g, 20g, 40g)
if 'g1-swt006' in catalog_map:
    p = catalog_map['g1-swt006']
    p['variants'] = [
        {"id": "g1-swt006-v1", "name": "10 g (₹5 Pack)", "unit": "10 g", "price": 5, "mrp": 5, "in_stock": True, "image": "/products/verified/swt-cadbury-5-star.webp"},
        {"id": "g1-swt006-v2", "name": "20 g (₹10 Pack)", "unit": "20 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/swt-cadbury-5-star.webp"},
        {"id": "g1-swt006-v3", "name": "40 g (Classic Bar)", "unit": "40 g", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/swt-cadbury-5-star.webp"}
    ]

# Nestlé Munch (9g, 18g)
if 'g1-swt010' in catalog_map:
    p = catalog_map['g1-swt010']
    p['variants'] = [
        {"id": "g1-swt010-v1", "name": "9 g (₹5 Pack)", "unit": "9 g", "price": 5, "mrp": 5, "in_stock": True, "image": "/products/verified/swt-nestle-munch.webp"},
        {"id": "g1-swt010-v2", "name": "18 g (₹10 Pack)", "unit": "18 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/swt-nestle-munch.webp"}
    ]

# Nestlé KitKat (12.8g, 27.5g, 38.5g)
if 'g1-swt009' in catalog_map:
    p = catalog_map['g1-swt009']
    p['variants'] = [
        {"id": "g1-swt009-v1", "name": "12.8 g (₹10 Pack)", "unit": "12.8 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/swt-nestle-kitkat.webp"},
        {"id": "g1-swt009-v2", "name": "27.5 g (2-Finger)", "unit": "27.5 g", "price": 25, "mrp": 25, "in_stock": True, "image": "/products/verified/swt-nestle-kitkat.webp"},
        {"id": "g1-swt009-v3", "name": "38.5 g (4-Finger)", "unit": "38.5 g", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/swt-nestle-kitkat.webp"}
    ]

# Lotte Choco Pie (28g, 168g)
if 'g1-swt053' in catalog_map:
    p = catalog_map['g1-swt053']
    p['variants'] = [
        {"id": "g1-swt053-v1", "name": "28 g (Single)", "unit": "28 g", "price": 15, "mrp": 15, "in_stock": True, "image": "/products/verified/swt-lotte-choco-pie.webp"},
        {"id": "g1-swt053-v2", "name": "168 g (6-Pack Box)", "unit": "168 g", "price": 90, "mrp": 90, "in_stock": True, "image": "/products/verified/swt-lotte-choco-pie.webp"}
    ]

# Brooke Bond 3 Roses Tea (100g, 250g, 500g)
if 'g1-tea001' in catalog_map:
    p = catalog_map['g1-tea001']
    p['variants'] = [
        {"id": "g1-tea001-v1", "name": "100 g", "unit": "100 g", "price": 40, "mrp": 40, "in_stock": True, "image": "/products/verified/tea-3-roses-dust.webp"},
        {"id": "g1-tea001-v2", "name": "250 g", "unit": "250 g", "price": 150, "mrp": 150, "in_stock": True, "image": "/products/verified/tea-3-roses-dust.webp"},
        {"id": "g1-tea001-v3", "name": "500 g", "unit": "500 g", "price": 315, "mrp": 315, "in_stock": True, "image": "/products/verified/tea-3-roses-dust.webp"}
    ]

# Brooke Bond Taj Mahal Tea (100g, 250g, 500g)
if 'g1-tea005' in catalog_map:
    p = catalog_map['g1-tea005']
    p['variants'] = [
        {"id": "g1-tea005-v1", "name": "100 g", "unit": "100 g", "price": 65, "mrp": 65, "in_stock": True, "image": "/products/verified/tea-taj-mahal.webp"},
        {"id": "g1-tea005-v2", "name": "250 g", "unit": "250 g", "price": 175, "mrp": 175, "in_stock": True, "image": "/products/verified/tea-taj-mahal.webp"},
        {"id": "g1-tea005-v3", "name": "500 g", "unit": "500 g", "price": 375, "mrp": 375, "in_stock": True, "image": "/products/verified/tea-taj-mahal.webp"}
    ]

# Tata Gemini Tea (50g, 100g, 250g, 500g, 1kg)
if 'g1-tea007' in catalog_map:
    p = catalog_map['g1-tea007']
    p['variants'] = [
        {"id": "g1-tea007-v1", "name": "50 g", "unit": "50 g", "price": 25, "mrp": 25, "in_stock": True, "image": "/products/verified/tea-tata-gemini.webp"},
        {"id": "g1-tea007-v2", "name": "100 g", "unit": "100 g", "price": 45, "mrp": 45, "in_stock": True, "image": "/products/verified/tea-tata-gemini.webp"},
        {"id": "g1-tea007-v3", "name": "250 g", "unit": "250 g", "price": 140, "mrp": 140, "in_stock": True, "image": "/products/verified/tea-tata-gemini.webp"},
        {"id": "g1-tea007-v4", "name": "500 g", "unit": "500 g", "price": 275, "mrp": 275, "in_stock": True, "image": "/products/verified/tea-tata-gemini.webp"},
        {"id": "g1-tea007-v5", "name": "1 kg", "unit": "1 kg", "price": 540, "mrp": 540, "in_stock": True, "image": "/products/verified/tea-tata-gemini.webp"}
    ]

# Bru Instant Coffee (25g, 50g, 100g, 200g)
if 'g1-tea013' in catalog_map:
    p = catalog_map['g1-tea013']
    p['variants'] = [
        {"id": "g1-tea013-v1", "name": "25 g", "unit": "25 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/tea-bru-instant.webp"},
        {"id": "g1-tea013-v2", "name": "50 g", "unit": "50 g", "price": 75, "mrp": 75, "in_stock": True, "image": "/products/verified/tea-bru-instant.webp"},
        {"id": "g1-tea013-v3", "name": "100 g", "unit": "100 g", "price": 180, "mrp": 180, "in_stock": True, "image": "/products/verified/tea-bru-instant.webp"},
        {"id": "g1-tea013-v4", "name": "200 g", "unit": "200 g", "price": 350, "mrp": 350, "in_stock": True, "image": "/products/verified/tea-bru-instant.webp"}
    ]

# Horlicks Classic Malt (200g, 500g, 1kg)
if 'g1-tea020' in catalog_map:
    p = catalog_map['g1-tea020']
    p['variants'] = [
        {"id": "g1-tea020-v1", "name": "200 g", "unit": "200 g", "price": 110, "mrp": 110, "in_stock": True, "image": "/products/verified/tea-horlicks-classic.webp"},
        {"id": "g1-tea020-v2", "name": "500 g", "unit": "500 g", "price": 255, "mrp": 255, "in_stock": True, "image": "/products/verified/tea-horlicks-classic.webp"},
        {"id": "g1-tea020-v3", "name": "1 kg", "unit": "1 kg", "price": 480, "mrp": 480, "in_stock": True, "image": "/products/verified/tea-horlicks-classic.webp"}
    ]

# Boost Health Drink (200g, 500g, 1kg)
if 'g1-tea021' in catalog_map:
    p = catalog_map['g1-tea021']
    p['variants'] = [
        {"id": "g1-tea021-v1", "name": "200 g", "unit": "200 g", "price": 115, "mrp": 115, "in_stock": True, "image": "/products/verified/tea-boost-health-drink.webp"},
        {"id": "g1-tea021-v2", "name": "500 g", "unit": "500 g", "price": 265, "mrp": 265, "in_stock": True, "image": "/products/verified/tea-boost-health-drink.webp"},
        {"id": "g1-tea021-v3", "name": "1 kg", "unit": "1 kg", "price": 490, "mrp": 490, "in_stock": True, "image": "/products/verified/tea-boost-health-drink.webp"}
    ]

# -------------------------------------------------------------
# 4. Add Missing Products from Inventory PDF
# -------------------------------------------------------------
print("\n4. Adding missing products from inventory PDF...")

NEW_SNACKS_DRINKS = [
    {
        "id": "g1-pos-1054", "itemNumber": 1054,
        "name": "Minute Maid Pulpy Orange Juice", "brand": "Minute Maid", "brand_id": "brand-minute-maid",
        "category": "drinks-juices", "category_id": "drinks-juices", "category_name": "Cold Drinks & Juices",
        "subCategory": "Fruit Juices & Pulps", "sub_category": "Fruit Juices & Pulps",
        "unit": "1 L", "price": 75, "mrp": 75, "originalPrice": 75, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/bev-pulpy-orange-1l.webp", "imageUrl": "/products/verified/bev-pulpy-orange-1l.webp",
        "image_url": "/products/verified/bev-pulpy-orange-1l.webp", "image_path": "/products/verified/bev-pulpy-orange-1l.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Deliciously refreshing orange fruit drink with real chewy orange pulp.",
        "rating": 4.8, "reviewsCount": 38, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1054-v1", "name": "1 L", "unit": "1 L", "price": 75, "mrp": 75, "in_stock": True, "image": "/products/verified/bev-pulpy-orange-1l.webp"}]
    },
    {
        "id": "g1-pos-1429", "itemNumber": 1429,
        "name": "Kinley Club Soda", "brand": "Kinley", "brand_id": "brand-kinley",
        "category": "drinks-juices", "category_id": "drinks-juices", "category_name": "Cold Drinks & Juices",
        "subCategory": "Sodas & Mixers", "sub_category": "Sodas & Mixers",
        "unit": "750 ml", "price": 20, "mrp": 20, "originalPrice": 20, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/bev-kinley-soda-750ml.webp", "imageUrl": "/products/verified/bev-kinley-soda-750ml.webp",
        "image_url": "/products/verified/bev-kinley-soda-750ml.webp", "image_path": "/products/verified/bev-kinley-soda-750ml.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Extra bubbly club soda with high carbonation for refreshments and mixed drinks.",
        "rating": 4.7, "reviewsCount": 24, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1429-v1", "name": "750 ml", "unit": "750 ml", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/bev-kinley-soda-750ml.webp"}]
    },
    {
        "id": "g1-pos-0412", "itemNumber": 412,
        "name": "Haldiram's Nagpur Tasty Soya Chips", "brand": "Haldiram's", "brand_id": "brand-haldirams",
        "category": "chips-namkeen", "category_id": "chips-namkeen", "category_name": "Chips, Namkeen & Snacks",
        "subCategory": "Chips & Crisps", "sub_category": "Chips & Crisps",
        "unit": "42 g", "price": 10, "mrp": 10, "originalPrice": 10, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/snk-haldiram-soya-sticks.webp", "imageUrl": "/products/verified/snk-haldiram-soya-sticks.webp",
        "image_url": "/products/verified/snk-haldiram-soya-sticks.webp", "image_path": "/products/verified/snk-haldiram-soya-sticks.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Crispy protein-rich soya chips tossed in aromatic Indian spices.",
        "rating": 4.7, "reviewsCount": 20, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0412-v1", "name": "42 g", "unit": "42 g", "price": 10, "mrp": 10, "in_stock": True, "image": "/products/verified/snk-haldiram-soya-sticks.webp"}]
    },
    {
        "id": "g1-pos-0050", "itemNumber": 50,
        "name": "Andhra Special Spicy Garlic Mixture (Vellulli Mixture)", "brand": "G1 Mart Snacks", "brand_id": "brand-g1mart",
        "category": "chips-namkeen", "category_id": "chips-namkeen", "category_name": "Chips, Namkeen & Snacks",
        "subCategory": "South Indian Namkeen & Mixtures", "sub_category": "South Indian Namkeen & Mixtures",
        "unit": "100 g", "price": 30, "mrp": 30, "originalPrice": 30, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/snk-andhra-garlic-mixture.webp", "imageUrl": "/products/verified/snk-andhra-garlic-mixture.webp",
        "image_url": "/products/verified/snk-andhra-garlic-mixture.webp", "image_path": "/products/verified/snk-andhra-garlic-mixture.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Traditional crunchy South Indian mixture packed with fried garlic pods, crispy sev, boondi, and curry leaves.",
        "rating": 4.9, "reviewsCount": 42, "isPopular": True, "isBestDeal": True,
        "variants": [
            {"id": "g1-pos-0050-v1", "name": "100 g", "unit": "100 g", "price": 30, "mrp": 30, "in_stock": True, "image": "/products/verified/snk-andhra-garlic-mixture.webp"},
            {"id": "g1-pos-0050-v2", "name": "200 g", "unit": "200 g", "price": 55, "mrp": 55, "in_stock": True, "image": "/products/verified/snk-andhra-garlic-mixture.webp"}
        ]
    },
    {
        "id": "g1-pos-1082", "itemNumber": 1082,
        "name": "Premium Crisp Borugulu (Murmura / Puffed Rice)", "brand": "G1 Mart Staples", "brand_id": "brand-g1mart",
        "category": "chips-namkeen", "category_id": "chips-namkeen", "category_name": "Chips, Namkeen & Snacks",
        "subCategory": "South Indian Namkeen & Mixtures", "sub_category": "South Indian Namkeen & Mixtures",
        "unit": "500 g", "price": 35, "mrp": 35, "originalPrice": 35, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/snk-g1-borugulu.webp", "imageUrl": "/products/verified/snk-g1-borugulu.webp",
        "image_url": "/products/verified/snk-g1-borugulu.webp", "image_path": "/products/verified/snk-g1-borugulu.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Double-cleaned crispy puffed rice (బొరుగులు / మరమరాలు) ideal for bhel puri and evening uggani.",
        "rating": 4.8, "reviewsCount": 35, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1082-v1", "name": "500 g", "unit": "500 g", "price": 35, "mrp": 35, "in_stock": True, "image": "/products/verified/snk-g1-borugulu.webp"}]
    },
    {
        "id": "g1-pos-1009", "itemNumber": 1009,
        "name": "Nirmala Sweet Betel Nut (Scented Supari)", "brand": "Nirmala", "brand_id": "brand-nirmala",
        "category": "sweets-chocolates", "category_id": "sweets-chocolates", "category_name": "Sweets & Chocolates",
        "subCategory": "Candies, Toffees & Gums", "sub_category": "Candies, Toffees & Gums",
        "unit": "50 g", "price": 20, "mrp": 20, "originalPrice": 20, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/swt-nirmala-sweet-supari.webp", "imageUrl": "/products/verified/swt-nirmala-sweet-supari.webp",
        "image_url": "/products/verified/swt-nirmala-sweet-supari.webp", "image_path": "/products/verified/swt-nirmala-sweet-supari.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Iconic Andhra sweet scented supari mouth freshener prepared with select betel nuts and fragrant spices.",
        "rating": 4.8, "reviewsCount": 31, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-1009-v1", "name": "50 g", "unit": "50 g", "price": 20, "mrp": 20, "in_stock": True, "image": "/products/verified/swt-nirmala-sweet-supari.webp"}]
    },
    {
        "id": "g1-pos-0998", "itemNumber": 998,
        "name": "Tata Tea Chakra Gold Strong Blend", "brand": "Tata Tea", "brand_id": "brand-tata-tea",
        "category": "tea-coffee-milk-drinks", "category_id": "tea-coffee-milk-drinks", "category_name": "Tea, Coffee & Health Drinks",
        "subCategory": "Tea & Chai", "sub_category": "Tea & Chai",
        "unit": "250 g", "price": 135, "mrp": 135, "originalPrice": 135, "discount": 0, "discountPercentage": 0,
        "inStock": True, "in_stock": True, "isActive": True, "is_active": True,
        "image": "/products/verified/tea-tata-chakra-gold.webp", "imageUrl": "/products/verified/tea-tata-chakra-gold.webp",
        "image_url": "/products/verified/tea-tata-chakra-gold.webp", "image_path": "/products/verified/tea-tata-chakra-gold.webp",
        "imageStatus": "verified", "image_status": "verified",
        "description": "Strong and golden fragrant tea blend crafted specially for South Indian tea lovers.",
        "rating": 4.8, "reviewsCount": 29, "isPopular": True, "isBestDeal": False,
        "variants": [{"id": "g1-pos-0998-v1", "name": "250 g", "unit": "250 g", "price": 135, "mrp": 135, "in_stock": True, "image": "/products/verified/tea-tata-chakra-gold.webp"}]
    }
]

added_count = 0
for np in NEW_SNACKS_DRINKS:
    if np['id'] not in catalog_map:
        catalog.append(np)
        catalog_map[np['id']] = np
        added_count += 1
        print(f"Added new product: [{np['id']}] {np['name']} (Rs.{np['price']})")
    else:
        catalog_map[np['id']].update(np)

print(f"\nAdded {added_count} new products into catalog.")
print(f"Total catalog products now: {len(catalog)}")

with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("Catalog successfully updated and saved!")
