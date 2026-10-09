import os
import json

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products in migrated_products: {len(products)}")
print("First 3:", products[:3])

# Check files in public/products
prod_files = os.listdir("public/products")
print(f"Total files in public/products: {len(prod_files)}")
print("Sample files in public/products:", prod_files[:10])

# Are there files matching product IDs?
matching_by_id = [p for p in products if f"{p['id']}.jpg" in prod_files or f"{p['id']}.webp" in prod_files or f"{p['id']}.png" in prod_files]
print(f"Products matching ID directly in public/products: {len(matching_by_id)}")

# Check public/products/verified
verified_files = os.listdir("public/products/verified") if os.path.exists("public/products/verified") else []
print(f"Files in public/products/verified: {len(verified_files)}")
matching_verified = [p for p in products if f"{p['id']}.webp" in verified_files or f"{p['id']}.jpg" in verified_files or f"{p['id']}.png" in verified_files]
print(f"Products matching verified files: {len(matching_verified)}")
