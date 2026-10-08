import json
from collections import defaultdict
import re

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Group products by image
img_to_products = defaultdict(list)
for p in products:
    img_to_products[p.get('imageUrl')].append(p)

# Print all products in santoor-soap
print(f"=== PRODUCTS WITH santoor-soap ({len(img_to_products['/products/packshots/santoor-soap.jpg'])}) ===")
for p in img_to_products['/products/packshots/santoor-soap.jpg'][:40]:
    print(f"#{p.get('itemNumber')}: [{p.get('category')} / {p.get('subCategory')}] {p.get('rawName')}")

# Print all products in good-day
print(f"\n=== PRODUCTS WITH good-day ({len(img_to_products['/products/packshots/good-day.jpg'])}) ===")
for p in img_to_products['/products/packshots/good-day.jpg'][:40]:
    print(f"#{p.get('itemNumber')}: [{p.get('category')} / {p.get('subCategory')}] {p.get('rawName')}")
