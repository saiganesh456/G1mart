import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

staple_words = ['atta', 'flour', 'rice', 'dal', 'pappu', 'sunflower oil', 'groundnut oil', 'toor dal', 'moong dal', 'wheat']

for cid in ['baby-care', 'hygiene', 'kitchenware', 'skin-care', 'laundry-detergents', 'dishwash']:
    prods = [p for p in products if p.get('category_id') == cid]
    for p in prods:
        name = p['name'].lower()
        for w in staple_words:
            if w in name and 'rice' not in name: # ignore rice bran / water if personal care
                print(f"Anomaly in {cid}: {p['id']} - {p['name']}")
