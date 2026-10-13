import json
import os

CATALOG_PATH = "src/data/products-catalog.json"
MIGRATED_PATH = "data/migrated_products.json"
VARIANTS_PATH = "data/migrated_product_variants.json"

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    catalog = json.load(f)

with open(MIGRATED_PATH, "r", encoding="utf-8") as f:
    migrated = json.load(f)

with open(VARIANTS_PATH, "r", encoding="utf-8") as f:
    variants_list = json.load(f)

# Helper to find and update in list of dicts
def update_product_fields(p_list, pid, updates):
    found = False
    for p in p_list:
        if p.get("id") == pid:
            p.update(updates)
            found = True
    return found

updates_dict = {
    "g1-p0405": {
        "name": "G1 Mart Masoor Dal (Red Lentils / ఎర్ర కందిపప్పు)",
        "image": "/products/generated_pouches/g1_masoor_dal_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_masoor_dal_pouch.webp",
        "image_url": "/products/generated_pouches/g1_masoor_dal_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Toor, Chana & Other Dals",
        "sub_category": "Toor, Chana & Other Dals",
        "price": 56,
        "mrp": 56,
        "originalPrice": 56,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p0408": {
        "name": "G1 Mart Green Moong Whole (Pesalu / పెసలు)",
        "image": "/products/generated_pouches/g1_green_moong_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_green_moong_pouch.webp",
        "image_url": "/products/generated_pouches/g1_green_moong_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Pesara Pappu (Moong)",
        "sub_category": "Pesara Pappu (Moong)",
        "price": 62,
        "mrp": 62,
        "originalPrice": 62,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p0412": {
        "name": "G1 Mart Pesara Pappu (Yellow Moong Dal / పెసరపప్పు)",
        "image": "/products/generated_pouches/g1_yellow_moong_dal_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_yellow_moong_dal_pouch.webp",
        "image_url": "/products/generated_pouches/g1_yellow_moong_dal_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Pesara Pappu (Moong)",
        "sub_category": "Pesara Pappu (Moong)",
        "price": 65,
        "mrp": 65,
        "originalPrice": 65,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p1011": {
        "name": "G1 Mart Alasandalu (Black-Eyed Peas / అలసందలు)",
        "image": "/products/generated_pouches/g1_alasandalu_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_alasandalu_pouch.webp",
        "image_url": "/products/generated_pouches/g1_alasandalu_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Toor, Chana & Other Dals",
        "sub_category": "Toor, Chana & Other Dals",
        "price": 55,
        "mrp": 55,
        "originalPrice": 55,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p1012": {
        "name": "G1 Mart Rajma Seeds (Red Kidney Beans / రాజ్మా)",
        "image": "/products/generated_pouches/g1_rajma_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_rajma_pouch.webp",
        "image_url": "/products/generated_pouches/g1_rajma_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Toor, Chana & Other Dals",
        "sub_category": "Toor, Chana & Other Dals",
        "price": 75,
        "mrp": 75,
        "originalPrice": 75,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p0195": {
        "name": "G1 Mart Tella Bataneelu (White Peas / తెల్ల బఠానీలు)",
        "image": "/products/generated_pouches/g1_tella_bataneelu_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_tella_bataneelu_pouch.webp",
        "image_url": "/products/generated_pouches/g1_tella_bataneelu_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Toor, Chana & Other Dals",
        "sub_category": "Toor, Chana & Other Dals",
        "price": 45,
        "mrp": 45,
        "originalPrice": 45,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p0460": {
        "name": "G1 Mart Telagapindi (Sesame Press / తెలగపిండి)",
        "image": "/products/generated_pouches/g1_telagapindi_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_telagapindi_pouch.webp",
        "image_url": "/products/generated_pouches/g1_telagapindi_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Toor, Chana & Other Dals",
        "sub_category": "Toor, Chana & Other Dals",
        "price": 50,
        "mrp": 50,
        "originalPrice": 50,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p0391": {
        "name": "G1 Mart Minapappu (Urad Gota / Whole Black Gram / మినపప్పు)",
        "image": "/products/generated_pouches/g1_urad_dal_pouch.webp",
        "imageUrl": "/products/generated_pouches/g1_urad_dal_pouch.webp",
        "image_url": "/products/generated_pouches/g1_urad_dal_pouch.webp",
        "category": "local-dals",
        "category_id": "local-dals",
        "subCategory": "Minapappu (Urad)",
        "sub_category": "Minapappu (Urad)",
        "price": 75,
        "mrp": 75,
        "originalPrice": 75,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p0737": {
        "name": "NO. 1 Kurnool Special Premium Quality Rice (Daana Daana Khila Khila)",
        "image": "/products/packshots/kurnool-special-rice-25kg.webp",
        "imageUrl": "/products/packshots/kurnool-special-rice-25kg.webp",
        "image_url": "/products/packshots/kurnool-special-rice-25kg.webp",
        "brand": "Kurnool Special",
        "category": "atta-rice-dal",
        "category_id": "atta-rice-dal",
        "subCategory": "Kolam, Sona Masuri & Boiled Rice",
        "sub_category": "Kolam, Sona Masuri & Boiled Rice",
        "unit": "25 kg Bag",
        "price": 1450,
        "mrp": 1450,
        "originalPrice": 1450,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-ric037": {
        "name": "NO. 1 Kurnool Special Premium Quality Rice Bag (Daana Daana Khila Khila)",
        "image": "/products/packshots/kurnool-special-rice-25kg.webp",
        "imageUrl": "/products/packshots/kurnool-special-rice-25kg.webp",
        "image_url": "/products/packshots/kurnool-special-rice-25kg.webp",
        "brand": "Kurnool Special",
        "category": "atta-rice-dal",
        "category_id": "atta-rice-dal",
        "subCategory": "Kolam, Sona Masuri & Boiled Rice",
        "sub_category": "Kolam, Sona Masuri & Boiled Rice",
        "unit": "25 kg Bag",
        "price": 1450,
        "mrp": 1450,
        "originalPrice": 1450,
        "discountPercentage": 0,
        "discount": 0
    },
    "g1-p1572": {
        "name": "Aashirvaad Superior MP Whole Wheat Chakki Atta",
        "image": "/products/packshots/aashirvaad-atta-5kg.jpg",
        "imageUrl": "/products/packshots/aashirvaad-atta-5kg.jpg",
        "image_url": "/products/packshots/aashirvaad-atta-5kg.jpg",
        "price": 65,
        "mrp": 65,
        "originalPrice": 65,
        "discountPercentage": 0,
        "discount": 0,
        "variants": [
            {"id": "g1-p1572-v1", "name": "1 kg", "unit": "1 kg", "price": 65, "mrp": 65, "in_stock": True, "image": "/products/packshots/aashirvaad-atta-1kg.jpg"},
            {"id": "g1-p1572-v2", "name": "2 kg", "unit": "2 kg", "price": 125, "mrp": 125, "in_stock": True, "image": "/products/packshots/aashirvaad-atta-1kg.jpg"},
            {"id": "g1-p1572-v3", "name": "5 kg", "unit": "5 kg", "price": 295, "mrp": 295, "in_stock": True, "image": "/products/packshots/aashirvaad-atta-5kg.jpg"},
            {"id": "g1-p1572-v4", "name": "10 kg", "unit": "10 kg", "price": 540, "mrp": 540, "in_stock": True, "image": "/products/packshots/aashirvaad-atta-10kg.jpg"}
        ]
    }
}

# Check if Sri Lalitha exists
lalitha_exists = False
for p in catalog:
    if "lalitha" in p.get("name", "").lower() or p.get("id") == "g1-ric034":
        lalitha_exists = True
        p.update({
            "name": "Sri Lalitha Sona Masoori Raw Rice (Original Pewtexed Rice)",
            "brand": "Sri Lalitha",
            "image": "/products/packshots/sri-lalitha-rice-25kg.webp",
            "imageUrl": "/products/packshots/sri-lalitha-rice-25kg.webp",
            "image_url": "/products/packshots/sri-lalitha-rice-25kg.webp",
            "category": "atta-rice-dal",
            "category_id": "atta-rice-dal",
            "subCategory": "Kolam, Sona Masuri & Boiled Rice",
            "sub_category": "Kolam, Sona Masuri & Boiled Rice",
            "unit": "25 kg Bag",
            "price": 1495,
            "mrp": 1495,
            "originalPrice": 1495,
            "discountPercentage": 0,
            "discount": 0,
            "in_stock": True,
            "inStock": True
        })
        print("Updated Sri Lalitha Rice in catalog")

if not lalitha_exists:
    sri_lalitha_prod = {
        "id": "g1-ric034",
        "name": "Sri Lalitha Sona Masoori Raw Rice (Original Pewtexed Rice)",
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
        "unit": "25 kg Bag",
        "price": 1495,
        "mrp": 1495,
        "originalPrice": 1495,
        "discountPercentage": 0,
        "discount": 0,
        "in_stock": True,
        "inStock": True,
        "is_active": True
    }
    catalog.append(sri_lalitha_prod)
    migrated.append(sri_lalitha_prod)
    print("Added Sri Lalitha Rice to catalog")

# Apply updates to catalog and migrated
for pid, upd in updates_dict.items():
    update_product_fields(catalog, pid, upd)
    update_product_fields(migrated, pid, upd)
    print(f"Updated {pid} in datasets")

with open(CATALOG_PATH, "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

with open(MIGRATED_PATH, "w", encoding="utf-8") as f:
    json.dump(migrated, f, indent=2, ensure_ascii=False)

print("Catalog and migrated products updated successfully!")
