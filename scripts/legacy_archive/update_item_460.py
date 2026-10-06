import os
import sys
import json
import csv

sys.path.append(os.path.abspath('scripts'))
from catalog_pipeline_core import update_supabase_product

# 1. Update Supabase
payload = {
    'name': 'Wagh Bakri Tea 250g',
    'brand': 'Wagh Bakri',
    'variant': 'Premium Leaf',
    'unit': 'Pieces',
    'category_id': 'beverages',
    'original_price': 160.0,
    'price': None,
    'image_url': 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/g1-prod-460/primary.jpg',
    'image_status': 'VERIFIED'
}
res = update_supabase_product('g1-prod-460', payload)
print('Supabase update for 460:', res)

# 2. Update products-catalog.json
with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

for p in cat:
    if p.get('sourceItemNo') == 460 or p.get('id') == 'g1-prod-460':
        p['name'] = 'Wagh Bakri Tea 250g'
        p['brand'] = 'Wagh Bakri'
        p['variant'] = 'Premium Leaf'
        p['category'] = 'beverages'
        p['originalPrice'] = 160.0
        p['price'] = None
        p['imageUrl'] = payload['image_url']
        p['image'] = payload['image_url']
        p['imageStatus'] = 'VERIFIED'
        break

with open('src/data/products-catalog.json', 'w', encoding='utf-8') as f:
    json.dump(cat, f, indent=2)

# 3. Update manifest
with open('data/product-research-manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

for m in manifest:
    if m.get('item_no') == 460:
        m['display_name'] = 'Wagh Bakri Tea 250g'
        m['brand'] = 'Wagh Bakri'
        m['variant'] = 'Premium Leaf'
        m['pack_size'] = '250g'
        m['category'] = 'beverages'
        m['mrp'] = 160.0
        m['selling_price'] = None
        m['product_match_status'] = 'VERIFIED'
        m['image_match_status'] = 'VERIFIED'
        m['confidence'] = 'HIGH'
        m['image_source_url'] = 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/39b0811e-4354-4109-88b7-227d351b971c/Wagh-Bakri-Premium-Leaf-Tea.jpeg'
        m['supabase_image_url'] = payload['image_url']
        m['notes'] = 'Wagh Bakri Tea 250g official Indian packaging. Verified MRP 160.'
        break

with open('data/product-research-manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

with open('data/product-research-manifest.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'item_no', 'source_name', 'display_name', 'brand', 'product_type',
        'variant', 'pack_size', 'unit', 'category', 'mrp', 'selling_price',
        'product_match_status', 'image_match_status', 'confidence',
        'product_source_url', 'image_source_url', 'supabase_image_url', 'notes'
    ])
    writer.writeheader()
    writer.writerows(manifest)

print('Manifest and catalog updated successfully.')
