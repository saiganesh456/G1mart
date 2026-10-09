import json
with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    if 'santoor' in p['name'].lower() or 'santoor' in (p.get('brand') or '').lower():
        print(p['id'], '|', p['brand'], '|', p['name'], '|', p.get('subCategory'), '|', p.get('category_id'))
