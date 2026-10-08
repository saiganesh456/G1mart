import json
import csv
import re
import sys
from collections import defaultdict, Counter

sys.stdout.reconfigure(encoding='utf-8')

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)
with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = json.load(f)

# Import plan classifier from plan_phase2
from plan_phase2 import classify_product, extract_brand, normalize_name

brand_id_to_name = {b['id']: b['name'] for b in brands}

# Categorize and assign brands
classified = []
for p in products:
    current_b = brand_id_to_name.get(p.get('brand_id'), '')
    extracted_b = extract_brand(p['name'], current_b)
    cat, sub = classify_product(p)
    
    # Fix specific items:
    if 'tongue cleaner' in p['name'].lower():
        cat = 'oral-care'
        sub = 'Toothbrushes & Tongue Cleaners'
    elif 'eno' in p['name'].lower():
        cat = 'sugar-salt-staples'
        sub = 'Other Staples'
        extracted_b = 'Eno'

    if not extracted_b:
        final_b = 'G1 Mart Fresh' if cat == 'vegetables-fruits' else 'Local / Unbranded'
    else:
        final_b = extracted_b

    classified.append({
        'id': p['id'],
        'name': p['name'],
        'norm_name': normalize_name(p['name']),
        'old_cat': p.get('category_id'),
        'new_cat': cat,
        'sub_cat': sub,
        'old_brand': current_b or 'Unassigned',
        'new_brand': final_b,
    })

# Identify low-confidence items for review.csv
review_items = []
for item in classified:
    reasons = []
    name = item['name'].strip()
    name_l = name.lower()

    if len(name) <= 3:
        reasons.append('Abbreviated or extremely short product name')
    if name_l in ['gum 5rs main', 'gum 10rs main']:
        reasons.append('Ambiguous whether stationery adhesive or confectionery chewing gum')
    if name_l in ['high power']:
        reasons.append('Ambiguous hardware/cleaning chemical brand')
    if name_l in ['lock 60mm']:
        reasons.append('Hardware utility item')
    if name_l in ['fabric']:
        reasons.append('Generic fabric care or textile reference')
    if name_l in ['cinna']:
        reasons.append('Ambiguous spelling (Cinnamon whole spice vs snack)')
    if name_l in ['jawa']:
        reasons.append('Ambiguous Telugu pulse/grain or beverage')
    if item['new_brand'] == 'Local / Unbranded' and item['new_cat'] in ['baby-care', 'skin-care']:
        reasons.append('Personal/baby care item with unverified local manufacturer')

    if reasons:
        review_items.append({
            'product_id': item['id'],
            'product_name': item['name'],
            'current_category': item['old_cat'],
            'suggested_category': item['new_cat'],
            'suggested_sub_category': item['sub_cat'],
            'current_brand': item['old_brand'],
            'suggested_brand': item['new_brand'],
            'confidence': 'LOW',
            'reason_for_review': ' | '.join(reasons),
        })

print(f'Total items for /audit/review.csv: {len(review_items)}')

# Write /audit/review.csv
csv_fields = [
    'product_id', 'product_name', 'current_category', 'suggested_category',
    'suggested_sub_category', 'current_brand', 'suggested_brand', 'confidence', 'reason_for_review'
]

with open('audit/review.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=csv_fields)
    writer.writeheader()
    writer.writerows(review_items)

# Mirror to parent directory audit if present
try:
    with open('../audit/review.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields)
        writer.writeheader()
        writer.writerows(review_items)
except Exception:
    pass

print('Wrote audit/review.csv successfully.')
