import json
import os
from collections import Counter

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

with open("data/migrated_brands.json", "r", encoding="utf-8") as f:
    brands = json.load(f)

with open("data/migrated_categories.json", "r", encoding="utf-8") as f:
    categories = json.load(f)

print(f"Total Products: {len(products)}")
print(f"Total Brands: {len(brands)}")
print(f"Total Categories: {len(categories)}")

brands_with_logo = [b for b in brands if b.get("logo_url")]
print(f"Brands with logo: {len(brands_with_logo)} / {len(brands)}")

print("\n--- Category Breakdown ---")
for c in categories:
    cat_id = c["id"]
    cat_name = c["name"]
    prods = [p for p in products if p.get("category_id") == cat_id or p.get("category") == cat_id]
    with_img = [p for p in prods if p.get("image_url")]
    print(f"{cat_id} ({cat_name}): {len(prods)} products | {len(with_img)} with image | {len(prods) - len(with_img)} missing")

# Check existing files in public/
public_imgs = []
for root, dirs, files in os.walk("public"):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.svg')):
            public_imgs.append(os.path.join(root, f).replace("\\", "/"))

print(f"\nTotal image files in public: {len(public_imgs)}")
# Count by subfolder
folder_counts = Counter([os.path.dirname(p) for p in public_imgs])
for folder, count in folder_counts.most_common(10):
    print(f"  {folder}: {count} images")
