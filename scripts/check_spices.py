import json
from collections import Counter

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

spices = [p for p in products if p.get('subCategory') == 'Spices, Masalas & Seeds']
print(f"Total Spices, Masalas & Seeds items: {len(spices)}")
spice_imgs = Counter(p.get('imageUrl') for p in spices)
print('\nSpices & Masalas image distribution:')
for img, count in spice_imgs.most_common():
    print(f"  {count:2d}x : {img}")

print('\nSample 25 items in Spices & Masalas:')
for p in spices[:25]:
    print(f"  {p.get('name')}: {p.get('imageUrl')}")
