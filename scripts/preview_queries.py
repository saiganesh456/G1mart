import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    pid = p['id']
    num = p['item_no']
    name = p['product_name']
    brand = p.get('brand') or ''
    pack = p['pack_size']
    mrp = p['mrp']
    
    # Formulate precise query
    # E.g. Mysore Sandal Pure Sandalwood Soap 75g
    clean_name = name.split('(')[0].strip()
    clean_name = clean_name.replace('Anti-Bacterial', '').replace('Antibacterial', '').strip()
    
    q = f"{brand} {clean_name} {pack} packshot"
    print(f"#{num:02d} [{pid}]: Query -> {q}")
