import json
import os

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

oils = [p for p in products if p.get('category_id') == 'oil-ghee-masala']
print(f"Total oils: {len(oils)}")
for o in oils:
    img = o.get('image_url')
    # check if file exists locally if starts with /
    exists = True
    if img and img.startswith('/'):
        exists = os.path.exists('public' + img)
    print(f"{o['id']} | {o['name']} | img: {img} | exists locally: {exists}")
