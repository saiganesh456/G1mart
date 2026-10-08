import json
from collections import Counter

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

pce = [p for p in products if p.get('subCategory') == 'Personal Care Essentials']
print(f"Total Personal Care Essentials items: {len(pce)}")
for p in pce[:40]:
    print(f"  {p.get('brand', '')} | {p.get('name', '')} | raw: {p.get('rawName', '')}")

pkg = [p for p in products if p.get('subCategory') == 'Packaged Foods']
print(f"\nTotal Packaged Foods items: {len(pkg)}")
for p in pkg[:30]:
    print(f"  {p.get('brand', '')} | {p.get('name', '')} | raw: {p.get('rawName', '')}")
