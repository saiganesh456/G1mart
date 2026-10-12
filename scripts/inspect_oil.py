import json

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products: {len(products)}")
for p in products:
    img = p.get("image_url") or ""
    name = p.get("name", "")
    cat = p.get("category_id", "")
    if any(k in img.lower() or k in name.lower() for k in ["saffola", "gold drop", "oil", "fortune", "freedom"]):
        if cat in ["oil-ghee-masala", "atta-rice-dal"]:
            print(f"{p.get('id')} : {name} ({cat}) -> {img}")
