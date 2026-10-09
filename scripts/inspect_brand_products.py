import json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

test_brands = ['Aashirvaad', 'Santoor', 'Britannia', 'Surf Excel', 'Ariel', 'Vim', 'Mysore Sandal', 'Cadbury', 'Colgate', 'Dettol', 'Dove', 'Parle', 'Kurkure', 'Lays', 'Haldiram', 'Tata', 'Ponds', 'Horlicks', 'Lifebuoy', 'Lux', 'Arun Icecreams', 'Aachi', 'Exo', 'Unibic']
for tb in test_brands:
    prods = [p for p in products if (p.get('brand') or '').lower() == tb.lower() or tb.lower() in p['name'].lower()]
    print(f'=== {tb} ({len(prods)} products) ===')
    for p in prods:
        pid = p['id']
        pname = p['name']
        pcat = p.get('subCategory') or p.get('category')
        print(f'  [{pid}] {pname} ({pcat})')
