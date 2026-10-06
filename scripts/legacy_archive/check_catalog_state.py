import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Total catalog items: {len(catalog)}")
status_counts = {}
for p in catalog:
    s = p.get('imageStatus') or p.get('image_status') or 'UNKNOWN'
    status_counts[s] = status_counts.get(s, 0) + 1

print("Catalog image status counts:", status_counts)

# Let's inspect items 1 to 30
print("\nSample items 1-15:")
for p in catalog[:15]:
    print(f"Item #{p.get('sourceItemNo')}: name='{p.get('name')}', brand='{p.get('brand')}', status='{p.get('imageStatus')}', img='{p.get('imageUrl')}'")
