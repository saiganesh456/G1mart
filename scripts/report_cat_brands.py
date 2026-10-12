import os
import json
from collections import defaultdict

BASE_DIR = r"d:\web-agency-projects\G1mart"
with open(os.path.join(BASE_DIR, 'data', 'migrated_products.json'), 'r', encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(BASE_DIR, 'data', 'migrated_brands.json'), 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_map = {b['id']: b['name'] for b in brands}
for p in products:
    p['brand_name'] = brand_map.get(p.get('brand_id'), 'Local / Unbranded')

def is_valid_local_img(img_url):
    if not img_url:
        return False
    if img_url.startswith('http') or 'placeholder' in img_url:
        return False
    for bad in ['bigbasket', 'blinkit', 'zepto', 'jiomart', 'amazon', 'flipkart']:
        if bad in img_url.lower():
            return False
    rel = img_url.lstrip('/')
    full = os.path.join(BASE_DIR, 'public', rel.replace('public/', ''))
    return os.path.exists(full)

# For each category, let's find all brands stocked and those with valid images
def report_cat_brands(cat_id):
    c_prods = [p for p in products if p.get('category_id') == cat_id]
    b_map = defaultdict(list)
    for p in c_prods:
        b_map[p['brand_name']].append(p)
    
    print(f"\n==================== CATEGORY: {cat_id} ====================")
    for bname, plist in sorted(b_map.items(), key=lambda x: -len(x[1])):
        valid_plist = [p for p in plist if is_valid_local_img(p.get('image_url'))]
        print(f"  {bname:<25} Total={len(plist):<3} Valid={len(valid_plist):<3}")
        for p in valid_plist[:3]:
            print(f"      [{p['id']}] {p['name']} -> {p['image_url']}")

categories_to_check = [
    'atta-rice-dal', 'local-dals', 'oil-ghee-masala', 'spices-masalas', 'sauces-spreads',
    'sugar-salt-staples', 'dry-fruits-cereals', 'vegetables-fruits', 'dairy-bread-eggs',
    'instant-food', 'chips-namkeen', 'sweets-chocolates', 'biscuits-bakery',
    'tea-coffee-milk-drinks', 'drinks-juices', 'laundry-detergents', 'dishwash',
    'floor-surface-cleaners', 'pooja-needs', 'kitchenware', 'soaps-bath', 'hair-care',
    'oral-care', 'skin-care', 'baby-care', 'hygiene'
]

for cid in categories_to_check:
    report_cat_brands(cid)
