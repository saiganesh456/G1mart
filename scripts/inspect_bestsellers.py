import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Find popularProducts logic from src/app/(storefront)/page.tsx:
# allProducts.filter(p => p.priceConfirmed && p.price > 0 && p.imageStatus === 'VERIFIED').slice(0, 6)
bestsellers = [p for p in products if p.get('priceConfirmed') and p.get('price', 0) > 0 and p.get('imageStatus') == 'VERIFIED'][:10]

print("Current top 10 bestsellers on HomePage:")
for p in bestsellers:
    print(f"- {p.get('name')} (Price: {p.get('price')}) => {p.get('imageUrl')}")
