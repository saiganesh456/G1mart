import json

with open("src/data/products-catalog.json", "r", encoding="utf-8") as f:
    cat = json.load(f)

print(f"products-catalog.json length: {len(cat)}")
if len(cat) > 0:
    print("Sample item 0:", json.dumps(cat[0], indent=2))
    print("Sample item 10:", json.dumps(cat[10], indent=2))

with open("src/data/legacyIdMap.json", "r", encoding="utf-8") as f:
    legacy_map = json.load(f)
print(f"legacyIdMap length: {len(legacy_map)}")
print("Sample legacy map items:", list(legacy_map.items())[:10])
