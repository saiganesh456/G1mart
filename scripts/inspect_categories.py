import json
from collections import Counter

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

cats = Counter(p.get('category') for p in products)
print("Categories in products-catalog.json:")
for cat, cnt in cats.most_common():
    print(f"  {cat}: {cnt}")

print("\nSubCategories in products-catalog.json:")
subcats = Counter(p.get('subCategory') for p in products)
for sub, cnt in subcats.most_common(20):
    print(f"  {sub}: {cnt}")
