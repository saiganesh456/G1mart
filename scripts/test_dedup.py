import json
import re

with open('src/data/products-catalog.json', encoding='utf-8') as f:
    products = json.load(f)

size_patterns = [
    r'\b(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|ml|l|ltr|litre|litres|pcs|pieces|pc|tablets|capsules|units))\b',
    r'\b(?:pack\s+of\s+\d+)\b',
    r'\b(?:set\s+of\s+\d+)\b',
    r'\b\d+\s*x\s*\d+\s*(?:g|gm|ml|kg)\b',
    r'\b1\s*\+\s*1\b',
]

combined_size_re = re.compile('|'.join(size_patterns), re.IGNORECASE)

def extract_base_name_and_size(name, existing_unit, existing_pack_size):
    matches = combined_size_re.findall(name)
    clean_name = combined_size_re.sub('', name).strip()
    clean_name = re.sub(r'[\(\)\-\,\s]+$', '', clean_name).strip()
    clean_name = re.sub(r'^\s*[\(\)\-\,]+', '', clean_name).strip()
    clean_name = re.sub(r'\s{2,}', ' ', clean_name)
    
    size_label = None
    if matches:
        for m in matches:
            if isinstance(m, tuple):
                for sub in m:
                    if sub:
                        size_label = sub
                        break
            elif m:
                size_label = m
                break
    if not size_label:
        if existing_pack_size and existing_pack_size.lower() not in ('pieces', 'pack', 'set', 'standard', '1 unit'):
            size_label = existing_pack_size
        elif existing_unit and existing_unit.lower() not in ('pieces', 'pack', 'set', 'standard', '1 unit'):
            size_label = existing_unit
        else:
            size_label = existing_pack_size or existing_unit or 'Standard'
            
    return clean_name, size_label

samples = ['Santoor 150g', 'Santoor 75g', 'Mysore Sandal Soap 125g', 'Wagh Bakri Premium Leaf Tea 250g', 'Unibic Wafer', 'Santoor Hand Wash 200ml']
for s in samples:
    b, sz = extract_base_name_and_size(s, '', '')
    print(f'{s} -> Base: "{b}", Size: "{sz}"')

# Let's see how many products group together
groups = {}
for p in products:
    b, sz = extract_base_name_and_size(p.get('name', ''), p.get('unit', ''), p.get('pack_size', ''))
    brand = (p.get('brand') or '').strip().lower()
    key = (brand, b.lower())
    if key not in groups:
        groups[key] = []
    groups[key].append((p, b, sz))

multi_variant = {k: v for k, v in groups.items() if len(v) > 1}
print(f'Total original products: {len(products)}')
print(f'Unique merged products: {len(groups)}')
print(f'Products with multiple variants: {len(multi_variant)}')

# Show 5 examples of merged products
count = 0
for k, v in multi_variant.items():
    if count >= 8: break
    print(f"\nProduct: Brand='{v[0][0].get('brand')}', Name='{v[0][1]}'")
    for orig, _, sz in v:
        print(f"  - Variant: size='{sz}', orig_name='{orig.get('name')}', price={orig.get('price')}, mrp={orig.get('originalPrice')}")
    count += 1
