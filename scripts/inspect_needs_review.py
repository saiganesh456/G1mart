import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

needs_review = [p for p in cat if p.get('imageStatus') == 'NEEDS_REVIEW']
print('Total NEEDS_REVIEW products:', len(needs_review))

for i, p in enumerate(needs_review[:50]):
    ino = p.get('sourceItemNo')
    src = p.get('sourceName') or p.get('rawName')
    name = p.get('name')
    brand = p.get('brand')
    print(f"[{ino:03d}] Source: '{src}' | Clean: '{name}' | Brand: '{brand}'")
