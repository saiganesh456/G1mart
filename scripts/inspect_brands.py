import json
from collections import Counter

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

with open("data/migrated_brands.json", "r", encoding="utf-8") as f:
    brands = json.load(f)

brand_counts = Counter([p.get("brand") or "Local / Unbranded" for p in products])
print(f"Total unique brands in products: {len(brand_counts)}")
print("\nTop 40 brands by product count:")
for b, count in brand_counts.most_common(40):
    print(f"  {b}: {count} products")
