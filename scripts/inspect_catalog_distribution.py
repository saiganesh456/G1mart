import json
from collections import Counter

catalog_path = "src/data/products-catalog.json"
with open(catalog_path, "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products: {len(products)}")

img_counts = Counter(p.get("imageUrl") for p in products)
print("\nTop 15 most repeated images:")
for img, cnt in img_counts.most_common(15):
    print(f"{cnt:4d}: {img}")

# Look at santoor-soap
santoor_items = [p for p in products if p.get("imageUrl") == "/products/packshots/santoor-soap.jpg"]
print(f"\n--- Sample 20 products with santoor-soap ({len(santoor_items)} total) ---")
for p in santoor_items[:20]:
    print(f"[{p.get('category')}] [{p.get('subCategory')}] {p.get('brand')} | {p.get('name')}")

# Look at good-day
good_day_items = [p for p in products if p.get("imageUrl") == "/products/packshots/good-day.jpg"]
print(f"\n--- Sample 20 products with good-day ({len(good_day_items)} total) ---")
for p in good_day_items[:20]:
    print(f"[{p.get('category')}] [{p.get('subCategory')}] {p.get('brand')} | {p.get('name')}")
