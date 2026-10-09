import json
import os

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print("First 5 products in migrated_products.json:")
for p in products[:5]:
    print(json.dumps(p, indent=2))

# Check where g1-prod-*.jpg are mapped or mentioned in the codebase
print("\nSearching codebase for g1-prod:")
for root, dirs, files in os.walk("."):
    if any(x in root for x in ["node_modules", ".git", ".next"]):
        continue
    for f in files:
        if f.endswith(('.js', '.ts', '.py', '.json', '.txt', '.csv')):
            filepath = os.path.join(root, f)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()
                    if "g1-prod-" in content:
                        print(f"Found g1-prod- in: {filepath}")
            except Exception as e:
                pass
