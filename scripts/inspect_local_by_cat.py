import json
from collections import defaultdict

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

local_by_cat = defaultdict(list)
for p in products:
    brand = p.get("brand") or "Local / Unbranded"
    if brand in ["Local / Unbranded", "G1 Mart", "G1 Mart Fresh"]:
        cat = p.get("category_id") or p.get("category") or "other"
        local_by_cat[cat].append(p)

for cat, prods in sorted(local_by_cat.items()):
    print(f"\nCategory '{cat}': {len(prods)} local products")
    for p in prods[:10]:
        print(f"  {p['id']} | {p['name']} | existing_img: {p.get('image_url')}")
    if len(prods) > 10:
        print(f"  ... and {len(prods) - 10} more")
