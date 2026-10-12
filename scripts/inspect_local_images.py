import os
import json
from PIL import Image

BASE_DIR = r"d:\web-agency-projects\G1mart"
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")
PACKSHOTS_DIR = os.path.join(BASE_DIR, "public", "products", "packshots")

with open(os.path.join(BASE_DIR, 'data', 'migrated_products.json'), 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(BASE_DIR, 'data', 'migrated_brands.json'), 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_id_to_name = {b['id']: b['name'] for b in brands}
for p in products:
    p['brand_name'] = brand_id_to_name.get(p.get('brand_id'), '')

print("Products in catalog:", len(products))

# List all verified files
verified_files = set(os.listdir(VERIFIED_DIR)) if os.path.exists(VERIFIED_DIR) else set()
packshot_files = set(os.listdir(PACKSHOTS_DIR)) if os.path.exists(PACKSHOTS_DIR) else set()

print("Verified files count:", len(verified_files))
print("Packshot files count:", len(packshot_files))

# Find out what products have local verified files
products_with_verified = []
for p in products:
    img_url = p.get('image_url') or ''
    if img_url.startswith('/products/verified/'):
        fname = os.path.basename(img_url)
        if fname in verified_files:
            products_with_verified.append(p)
    elif img_url.startswith('/products/packshots/'):
        fname = os.path.basename(img_url)
        if fname in packshot_files:
            products_with_verified.append(p)

print(f"Products with verified local images: {len(products_with_verified)}")
