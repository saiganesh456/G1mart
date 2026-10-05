import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

for p in cat:
    ino = p.get('sourceItemNo', 0)
    if ino >= 171:
        print(f"{ino:03d} | {p.get('name')} | Brand: {p.get('brand')} | Cat: {p.get('category')}")
