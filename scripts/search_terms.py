import json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

for term in ['kurkure', 'parachute', 'haldiram', 'lalitha', 'stayfree', 'colin', 'cleaner']:
    matches = [p['id'] + ': ' + p['name'] + ' (' + str(p.get('brand')) + ')' for p in products if term in p['name'].lower() or term in (p.get('brand') or '').lower()]
    print(term + ' -> ' + str(matches[:5]))
