import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Sort by itemNumber if available
sorted_items = sorted(catalog, key=lambda x: int(x.get('itemNumber') or 0))
print("First 20 items by itemNumber:")
for p in sorted_items[:20]:
    print(f"#{p.get('itemNumber')}: {p.get('brand')} | {p.get('name')} | raw: {p.get('rawName')} | img: {p.get('imageUrl')}")

print("\nWhat about id g1-1, g1-2, etc.?")
for i in range(1, 15):
    p = next((x for x in catalog if x.get('id') == f"g1-{i}"), None)
    if p:
        print(f"id g1-{i}: #{p.get('itemNumber')} | {p.get('brand')} | {p.get('name')} | img: {p.get('imageUrl')}")
