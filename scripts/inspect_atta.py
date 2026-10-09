import json

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

atta_products = [p for p in products if p.get("category_id") == "atta-rice-dal" or p.get("category") == "atta-rice-dal"]
print(f"Total in atta-rice-dal: {len(atta_products)}")
for p in atta_products:
    print(f"{p.get('id')} | {p.get('name')} | brand: {p.get('brand')} | img: {p.get('image_url')}")
