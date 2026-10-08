import json
from collections import Counter

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

dals = [p for p in products if p.get('subCategory') == 'Dals & Pulses']
print(f"Total Dals & Pulses items: {len(dals)}")
dal_imgs = Counter(p.get('imageUrl') for p in dals)
print('\nDals & Pulses image distribution:')
for img, count in dal_imgs.most_common():
    print(f"  {count:2d}x : {img}")

print('\nAll items in Dals & Pulses:')
for p in dals:
    print(f"  {p.get('name')}: {p.get('imageUrl')}")
