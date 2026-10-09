import json
from collections import Counter

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

brands = Counter([p.get("brand") or "Local / Unbranded" for p in products])
print(f"Total brands: {len(brands)}")
for b, count in brands.most_common():
    print(f"'{b}': {count},")
