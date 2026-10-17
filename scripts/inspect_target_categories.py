import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

print("=== SUGAR-SALT-STAPLES ===")
sss = [p for p in products if p.get('category_id') == 'sugar-salt-staples' or p.get('category') == 'sugar-salt-staples']
for p in sss:
    if p.get('isActive') is not False and p.get('is_active') is not False:
        print(f"[{p['id']}] {p['name']} | brand: {p.get('brand')} (brand_id: {p.get('brand_id')}) | img: {p.get('image_url')}")

print("\n=== DRY-FRUITS-CEREALS ===")
dfc = [p for p in products if p.get('category_id') == 'dry-fruits-cereals' or p.get('category') == 'dry-fruits-cereals']
for p in dfc:
    if p.get('isActive') is not False and p.get('is_active') is not False:
        print(f"[{p['id']}] {p['name']} | brand: {p.get('brand')} (brand_id: {p.get('brand_id')}) | img: {p.get('image_url')}")
