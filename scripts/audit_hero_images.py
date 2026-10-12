import os
import json
import csv
from collections import defaultdict

BASE_DIR = r"d:\web-agency-projects\G1mart"
with open(os.path.join(BASE_DIR, 'data', 'migrated_products.json'), 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(BASE_DIR, 'data', 'migrated_brands.json'), 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_map = {b['id']: b['name'] for b in brands}
for p in products:
    p['brand_name'] = brand_map.get(p.get('brand_id'), 'Local / Unbranded')

# Check what image files actually exist on disk
verified_dir = os.path.join(BASE_DIR, 'public', 'products', 'verified')
packshots_dir = os.path.join(BASE_DIR, 'public', 'products', 'packshots')

def get_real_image_file(img_url):
    if not img_url:
        return None
    if img_url.startswith('http'):
        return None # hot-linked, not allowed per IMAGE RULES!
    if 'placeholder' in img_url:
        return None
    # Check local file
    rel_path = img_url.lstrip('/')
    full_path = os.path.join(BASE_DIR, 'public', rel_path.replace('public/', ''))
    if os.path.exists(full_path):
        return full_path
    full_path2 = os.path.join(BASE_DIR, rel_path)
    if os.path.exists(full_path2):
        return full_path2
    return None

for p in products:
    p['local_img_file'] = get_real_image_file(p.get('image_url'))

# Let's see which products in each category have real local images
print("Summary of products with local images:")
cat_real = defaultdict(list)
for p in products:
    if p['local_img_file']:
        cat_real[p.get('category_id')].append(p)

for c, plist in sorted(cat_real.items()):
    print(f"Category: {c} -> {len(plist)} products with verified local files")
