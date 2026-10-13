import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
cat_path = os.path.join(ROOT, 'src', 'data', 'products-catalog.json')

with open(cat_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

snk = [p for p in products if p.get('category_id') == 'chips-namkeen']
bsc = [p for p in products if p.get('category_id') == 'biscuits-bakery']

print(f"Total products in chips-namkeen: {len(snk)}")
print(f"Total products in biscuits-bakery: {len(bsc)}")

img_errors = 0
price_mismatch = 0

for p in snk + bsc:
    # Check image
    img = p.get('image', '').lstrip('/')
    img_disk = os.path.join(ROOT, 'public', img.replace('/', os.sep))
    if not os.path.exists(img_disk) or os.path.getsize(img_disk) < 5000:
        print(f"Image Error: {p['id']} - {p['name']} -> {img_disk}")
        img_errors += 1
    
    # Check price == mrp
    if p.get('price') != p.get('mrp'):
        print(f"Price Mismatch: {p['id']} - {p['name']} (price: {p.get('price')}, mrp: {p.get('mrp')})")
        price_mismatch += 1
    
    # Check variant price == mrp
    for v in p.get('variants', []):
        if v.get('price') != v.get('mrp'):
            print(f"Variant Price Mismatch: {p['id']} - {v.get('id')} (price: {v.get('price')}, mrp: {v.get('mrp')})")
            price_mismatch += 1

print("\n--- AUDIT RESULTS ---")
print(f"Total Snack & Biscuit Products: {len(snk) + len(bsc)}")
print(f"Image Errors: {img_errors}")
print(f"Price Mismatches (Price != MRP): {price_mismatch}")
if img_errors == 0 and price_mismatch == 0:
    print("ALL INVARIANTS PASSED PERFECTLY (100% Valid)!")
