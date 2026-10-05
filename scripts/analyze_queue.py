import json
from collections import Counter

with open('data/needs_review_analysis.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

brands = Counter([i.get('brand') for i in items if i.get('brand')])
cats = Counter([i.get('category') for i in items if i.get('category')])

print("Top Brands:")
for b, c in brands.most_common(25):
    print(f"  {b}: {c}")

print("\nTop Categories:")
for cat, c in cats.most_common(15):
    print(f"  {cat}: {c}")

no_brand = [i for i in items if not i.get('brand')]
print(f"\nItems with no brand: {len(no_brand)}")
