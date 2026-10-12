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

# Also check packshots directory
packshots = os.listdir(os.path.join(BASE_DIR, 'public', 'products', 'packshots'))
verified = os.listdir(os.path.join(BASE_DIR, 'public', 'products', 'verified'))

def valid_image(img_url):
    if not img_url or img_url.startswith('http') or 'placeholder' in img_url:
        return False
    rel = img_url.lstrip('/')
    full = os.path.join(BASE_DIR, 'public', rel.replace('public/', ''))
    return os.path.exists(full)

# Print all products in category with brand and valid image
def inspect_cat(cat_id, brand_filters=None):
    cat_prods = [p for p in products if p.get('category_id') == cat_id]
    print(f"\n=== CATEGORY: {cat_id} (Total: {len(cat_prods)}) ===")
    
    # Group by brand
    b_map = defaultdict(list)
    for p in cat_prods:
        b_map[p['brand_name']].append(p)
        
    for bname, plist in sorted(b_map.items(), key=lambda x: -len(x[1])):
        valid_p = [p for p in plist if valid_image(p.get('image_url'))]
        if brand_filters and not any(bf.lower() in bname.lower() for bf in brand_filters):
            continue
        print(f"  Brand: {bname} ({len(plist)} items, {len(valid_p)} valid images)")
        for p in plist[:5]:
            v = valid_image(p.get('image_url'))
            print(f"    - [{p['id']}] {p['name']} | ValidImg={v} | Img={p.get('image_url')}")

# Test some specific categories
inspect_cat('atta-rice-dal')
inspect_cat('local-dals')
inspect_cat('oil-ghee-masala')
inspect_cat('spices-masalas')
inspect_cat('sugar-salt-staples')
inspect_cat('dry-fruits-cereals')
inspect_cat('vegetables-fruits')
inspect_cat('dairy-bread-eggs')
inspect_cat('instant-food')
inspect_cat('biscuits-bakery')
inspect_cat('sauces-spreads')
inspect_cat('chips-namkeen')
inspect_cat('sweets-chocolates')
inspect_cat('tea-coffee-milk-drinks')
inspect_cat('drinks-juices')
inspect_cat('laundry-detergents')
inspect_cat('dishwash')
inspect_cat('floor-surface-cleaners')
inspect_cat('pooja-needs')
inspect_cat('kitchenware')
inspect_cat('soaps-bath')
inspect_cat('hair-care')
inspect_cat('oral-care')
inspect_cat('skin-care')
inspect_cat('baby-care')
inspect_cat('hygiene')
