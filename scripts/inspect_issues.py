import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print('=== 5-STAR / DAIRY MILK ITEMS ===')
for p in products:
    name = f"{p.get('brand', '')} {p.get('name', '')}"
    if p.get('imageUrl') == '/products/packshots/cadbury-5-star.jpg' or 'dairy milk' in name.lower() or '5 star' in name.lower() or 'cadbury' in name.lower():
        print(f"  {p.get('id')}: {name} -> {p.get('imageUrl')}")

print(f"\n=== TOOR DAL ITEMS ({len([p for p in products if p.get('imageUrl') == '/products/packshots/toor-dal.jpg'])}) ===")
for p in [p for p in products if p.get('imageUrl') == '/products/packshots/toor-dal.jpg'][:30]:
    print(f"  {p.get('id')}: {p.get('brand', '')} {p.get('name', '')} -- Subcat: {p.get('subCategory', '')}")

print('\n=== AASHIRVAAD ITEMS ===')
for p in products:
    name = f"{p.get('brand', '')} {p.get('name', '')}"
    if 'aashirvaad' in name.lower():
        print(f"  {p.get('id')}: {name} -> {p.get('imageUrl')}")

print('\n=== TURMERIC ITEMS ===')
for p in products:
    name = f"{p.get('brand', '')} {p.get('name', '')}"
    if 'turmeric' in name.lower() or 'pasupu' in name.lower() or 'haldi' in name.lower():
        print(f"  {p.get('id')}: {name} -> {p.get('imageUrl')}")
