import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print("=== ALL ATTA-RICE-DAL ITEMS ===")
for p in products:
    if p.get('category_id') == 'atta-rice-dal':
        print(f"{p['id']}: {p['name']} | sub: {p.get('sub_category') or p.get('subCategory')} | img: {p.get('image_url')}")
