import json
import re

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

needs_review = [p for p in cat if p.get('imageStatus') == 'NEEDS_REVIEW']
print(f"Total NEEDS_REVIEW: {len(needs_review)}")

brands = {}
for p in needs_review:
    b = p.get('brand') or 'Unbranded'
    brands[b] = brands.get(b, 0) + 1

sorted_brands = sorted(brands.items(), key=lambda x: x[1], reverse=True)
print("\nTop brands in NEEDS_REVIEW:")
for b, count in sorted_brands[:30]:
    print(f" - {b}: {count} items")
