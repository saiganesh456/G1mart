import json
import os

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

attas = [p for p in products if p.get('category_id') == 'atta-rice-dal']
print(f"Total attas: {len(attas)}")
for a in attas:
    img = a.get('image_url')
    exists = True
    if img and img.startswith('/'):
        exists = os.path.exists('public' + img)
    print(f"{a['id']} | {a['name']} | sub: {a.get('sub_category')} | img: {img} | exists locally: {exists}")
