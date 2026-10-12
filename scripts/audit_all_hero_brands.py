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
prod_map = {p['id']: p for p in products}

for p in products:
    p['brand_name'] = brand_map.get(p.get('brand_id'), 'Local / Unbranded')

def is_valid_local_img(img_url):
    if not img_url:
        return False
    if img_url.startswith('http') or 'placeholder' in img_url:
        return False
    # Check if competitor in path
    for bad in ['bigbasket', 'blinkit', 'zepto', 'jiomart', 'amazon', 'flipkart']:
        if bad in img_url.lower():
            return False
    rel = img_url.lstrip('/')
    full = os.path.join(BASE_DIR, 'public', rel.replace('public/', ''))
    return os.path.exists(full)

# Find products for a brand in a category
def find_brand_prods_in_cat(cat_id, brand_keywords):
    matches = []
    for p in products:
        if p.get('category_id') != cat_id:
            continue
        b_name = p['brand_name'].lower()
        p_name = p['name'].lower()
        for kw in brand_keywords:
            if kw.lower() in b_name or kw.lower() in p_name:
                matches.append(p)
                break
    return matches

print("Auditing hero brands across all categories...")
