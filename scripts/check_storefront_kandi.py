import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    prods = json.load(f)

kandi_prods = []
for p in prods:
    url = p.get('imageUrl') or p.get('image_url') or p.get('image') or ''
    if 'kandi_pappu' in url or 'g1_kandi' in url:
        kandi_prods.append((p.get('id'), p.get('name'), url))

print(f"Total products using kandi pappu image: {len(kandi_prods)}")
for item in kandi_prods:
    print(f"  {item[0]}: {item[1]} -> {item[2]}")
