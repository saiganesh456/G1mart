import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print("=== ALL OIL PRODUCTS ===")
oils = [p for p in products if p.get('category_id') == 'oil-ghee-masala']
for p in oils:
    print(p['id'], ":::", p['name'], ":::", p.get('brand'), ":::", p.get('image_url'))
