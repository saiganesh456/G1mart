import json
import os
import shutil
from PIL import Image

print("=== 1. OVERWRITING RICE PACKSHOT FILES ===")
# Overwrite sonamasuri-rice.jpg with Kurnool Special Bag
kurnool_webp = "public/products/packshots/kurnool-special-rice-25kg.webp"
if os.path.exists(kurnool_webp):
    im_k = Image.open(kurnool_webp).convert("RGB")
    im_k.save("public/products/packshots/sonamasuri-rice.jpg", "JPEG", quality=95)
    im_k.save("public/products/packshots/kurnool-special-rice-bag.webp", "WEBP", quality=95)
    im_k.save("public/products/verified/g1-p0737.webp", "WEBP", quality=95)
    print("Updated sonamasuri-rice.jpg and kurnool-special-rice-bag.webp")

# Ensure Sri Lalitha 25kg image is present in both formats
lalitha_webp = "public/products/packshots/sri-lalitha-rice-25kg.webp"
if os.path.exists(lalitha_webp):
    im_l = Image.open(lalitha_webp).convert("RGB")
    im_l.save("public/products/packshots/sri-lalitha-raw-rice-25kg.webp", "WEBP", quality=95)
    im_l.save("public/products/packshots/sri-lalitha-rice-25kg.jpg", "JPEG", quality=95)
    print("Updated sri-lalitha-raw-rice-25kg.webp and sri-lalitha-rice-25kg.jpg")

print("=== 2. UPDATING MIGRATED_PRODUCT_VARIANTS.JSON ===")
VARS_PATH = "data/migrated_product_variants.json"
with open(VARS_PATH, "r", encoding="utf-8") as f:
    variants = json.load(f)

for v in variants:
    if v.get("product_id") == "g1-ric037":
        v["image_url"] = "/products/packshots/kurnool-special-rice-25kg.webp"
        v["price"] = 1450
        v["mrp"] = 1450
        v["size_label"] = "25 kg"
        print("Updated g1-ric037-v1 in migrated_product_variants.json")

# Ensure Sri Lalitha 25kg variant exists
lalitha_var_exists = False
for v in variants:
    if v.get("product_id") == "g1-ric051":
        lalitha_var_exists = True
        v["image_url"] = "/products/packshots/sri-lalitha-rice-25kg.webp"
        v["price"] = 1495
        v["mrp"] = 1495
        v["size_label"] = "25 kg"

if not lalitha_var_exists:
    variants.append({
        "id": "g1-ric051-v1",
        "product_id": "g1-ric051",
        "size_label": "25 kg",
        "price": 1495,
        "mrp": 1495,
        "stock": 50,
        "image_url": "/products/packshots/sri-lalitha-rice-25kg.webp"
    })
    print("Added g1-ric051-v1 variant for Sri Lalitha 25kg rice bag")

with open(VARS_PATH, "w", encoding="utf-8") as f:
    json.dump(variants, f, indent=2, ensure_ascii=False)

print("=== 3. UPDATING PRODUCTS IN CATALOG & MIGRATED_PRODUCTS ===")
sri_lalitha_sku = {
    "id": "g1-ric051",
    "name": "Sri Lalitha Sona Masoori Raw Rice Bag (Original Pewtexed Rice)",
    "brand_id": "brand-srilalitha",
    "brand": "Sri Lalitha",
    "category_id": "atta-rice-dal",
    "category": "atta-rice-dal",
    "sub_category": "Kolam, Sona Masuri & Boiled Rice",
    "subCategory": "Kolam, Sona Masuri & Boiled Rice",
    "category_name": "Rice, Atta & Flours",
    "image": "/products/packshots/sri-lalitha-rice-25kg.webp",
    "imageUrl": "/products/packshots/sri-lalitha-rice-25kg.webp",
    "image_url": "/products/packshots/sri-lalitha-rice-25kg.webp",
    "image_status": "verified",
    "imageStatus": "verified",
    "unit": "25 kg",
    "price": 1495,
    "mrp": 1495,
    "originalPrice": 1495,
    "discountPercentage": 0,
    "discount": 0,
    "in_stock": True,
    "inStock": True,
    "is_active": True,
    "variants": [
        {
            "id": "g1-ric051-v1",
            "name": "25 kg",
            "unit": "25 kg",
            "price": 1495,
            "mrp": 1495,
            "in_stock": True,
            "image": "/products/packshots/sri-lalitha-rice-25kg.webp"
        }
    ]
}

for fpath in ["src/data/products-catalog.json", "data/migrated_products.json"]:
    with open(fpath, "r", encoding="utf-8") as f:
        prods = json.load(f)
    
    # Update g1-ric037
    for p in prods:
        if p.get("id") == "g1-ric037":
            p["image"] = "/products/packshots/kurnool-special-rice-25kg.webp"
            p["imageUrl"] = "/products/packshots/kurnool-special-rice-25kg.webp"
            p["image_url"] = "/products/packshots/kurnool-special-rice-25kg.webp"
            p["price"] = 1450
            p["mrp"] = 1450
            p["originalPrice"] = 1450
            p["discount"] = 0
            p["discountPercentage"] = 0
            if "variants" in p:
                for v in p["variants"]:
                    v["image"] = "/products/packshots/kurnool-special-rice-25kg.webp"
                    v["price"] = 1450
                    v["mrp"] = 1450
    
    # Check if g1-ric051 exists
    found_lalitha = False
    for p in prods:
        if p.get("id") == "g1-ric051":
            p.update(sri_lalitha_sku)
            found_lalitha = True
    if not found_lalitha:
        prods.append(sri_lalitha_sku)
        
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(prods, f, indent=2, ensure_ascii=False)
    print(f"Updated {fpath}")

print("Rice variants and images synchronized completely!")
