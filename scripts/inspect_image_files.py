import os
import json

for folder in ["public/products", "public/products/generated", "public/products/packshots", "public/products/verified"]:
    if os.path.exists(folder):
        files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
        print(f"\nFolder: {folder} ({len(files)} files)")
        print("Sample files:", files[:15])

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# Check if product IDs match files in public/products
p_ids = [p["id"] for p in products]
print(f"\nSample product IDs: {p_ids[:10]}")

# Check legacy archives or other json files
for fname in os.listdir("data"):
    if fname.endswith(".json"):
        fpath = os.path.join("data", fname)
        size = os.path.getsize(fpath)
        print(f"data/{fname}: {size} bytes")
