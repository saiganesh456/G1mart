import json
from collections import Counter
import re

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total products: {len(products)}")

# Check brands
brands = Counter(p.get('brand') for p in products)
print(f"Total distinct brands: {len(brands)}")
print("\nTop 25 brands:")
for b, cnt in brands.most_common(25):
    print(f"  {b}: {cnt}")

# Check image distribution right now
imgs = Counter(p.get('imageUrl') for p in products)
print(f"\nTotal distinct image URLs: {len(imgs)}")
for img, cnt in imgs.most_common(20):
    print(f"  {cnt:4d}: {img}")
