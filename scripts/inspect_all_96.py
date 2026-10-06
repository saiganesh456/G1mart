import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products[:36]:
    brand = p.get('brand') or 'G1 Mart / Generic'
    status = p.get('image_status', 'NEEDS_REVIEW')
    has_img = "HAS_IMG" if p.get('image_url') else "NO_IMG"
    print(f"#{p['item_no']:02d} | {p['id']} | {p['product_name']} | Brand: {brand} | Pack: {p['pack_size']} | MRP: ₹{p['mrp']} | {has_img} | {status}")
