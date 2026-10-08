import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Sort by itemNumber
sorted_products = sorted(products, key=lambda p: int(p.get('itemNumber') or 0))

print(f"Total products: {len(sorted_products)}")
print("First 200 products overview:")
with open('data/first_200_products.txt', 'w', encoding='utf-8') as out:
    for idx, p in enumerate(sorted_products[:200], 1):
        line = f"#{idx:03d} | ItemNo: {p.get('itemNumber')} | ID: {p.get('id')} | Name: {p.get('name')} | Brand: {p.get('brand')} | Cat: {p.get('category')} | SubCat: {p.get('subCategory')} | Price: {p.get('price')} | Img: {p.get('imageUrl')}"
        out.write(line + "\n")

print("Saved first 200 products to data/first_200_products.txt")
