import json
import os

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

for cat_id in ['biscuits-bakery', 'dairy-bread-eggs', 'instant-food', 'ice-creams']:
    items = [p for p in catalog if p.get('category_id') == cat_id]
    print(f"\n==================== {cat_id.upper()} ({len(items)} items) ====================")
    for p in items:
        img = p.get('image_url', '')
        path = os.path.join('public', img.lstrip('/'))
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        print(f"[{p['id']}] {p['name']} | MRP: Rs.{p.get('mrp')} | {p['brand']} | sub: {p.get('sub_category')} | exists: {exists} ({size} B) | img: {img}")
