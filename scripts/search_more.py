import json
with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    n = p['name'].lower()
    b = (p.get('brand') or '').lower()
    if any(k in n or k in b for k in ['bourbon', 'fortune', 'frooti', 'colin', 'kurkure', 'lays', 'bingo']):
        print(p['id'] + ': ' + p['name'] + ' (' + str(p.get('brand')) + ', ' + str(p.get('category_id')) + ')')
