import json
from collections import Counter

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

staples = [p for p in products if p.get('subCategory') == 'Kitchen Staples']
print(f"Total Kitchen Staples items: {len(staples)}")
s_imgs = Counter(p.get('imageUrl') for p in staples)
for img, count in s_imgs.most_common():
    print(f"  {count:2d}x : {img}")

print('\nAll items in Kitchen Staples:')
for p in staples:
    print(f"  {p.get('name')}: {p.get('imageUrl')}")
