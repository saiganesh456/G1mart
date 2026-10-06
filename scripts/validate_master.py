import json

with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

required_keys = [
    'product_name', 'brand', 'variant', 'pack_size', 'mrp', 'source_rate',
    'selling_price', 'image_url', 'image_status', 'verification_status',
    'identity_status', 'mrp_status', 'source_pdf', 'invoice_number',
    'invoice_page', 'invoice_rows', 'raw_invoice_description', 'notes'
]

errors = []
if len(products) != 96:
    errors.append(f"Expected 96 products, got {len(products)}")

ids = set()
for idx, p in enumerate(products):
    pid = p.get('id')
    if not pid:
        errors.append(f"Product at index {idx} missing id")
    elif pid in ids:
        errors.append(f"Duplicate id {pid}")
    ids.add(pid)
    
    for rk in required_keys:
        if rk not in p:
            errors.append(f"Product {pid} missing key {rk}")
            
    if p.get('selling_price') is not None:
        errors.append(f"Product {pid} selling_price is not NULL: {p.get('selling_price')}")
        
    if 'category_id' in p and p['category_id'] is not None:
        errors.append(f"Product {pid} category_id is assigned: {p.get('category_id')}")

if errors:
    print(f"Validation FAILED with {len(errors)} errors:")
    for e in errors[:10]:
        print(" ", e)
else:
    print("Validation PASSED! Exactly 96 products, 0 duplicates, all required keys present, selling_price is strictly NULL, categories unassigned.")

# Breakdown of statuses
from collections import Counter
print("Image statuses:", Counter(p['image_status'] for p in products))
print("Identity statuses:", Counter(p['identity_status'] for p in products))
print("MRP statuses:", Counter(p['mrp_status'] for p in products))
