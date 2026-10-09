import json
from collections import Counter

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

missing = [p for p in products if not p.get("image_url")]
print(f"Total missing images: {len(missing)} / {len(products)}")

missing_brands = Counter([p.get("brand") or "Local / Unbranded" for p in missing])
print("\nMissing by brand (Top 25):")
for b, count in missing_brands.most_common(25):
    print(f"  {b}: {count}")

missing_cats = Counter([p.get("category_id") or p.get("category") or "other" for p in missing])
print("\nMissing by category:")
for c, count in missing_cats.most_common():
    print(f"  {c}: {count}")
