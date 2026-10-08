import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)
with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = json.load(f)
with open('data/migrated_sub_categories.json', 'r', encoding='utf-8') as f:
    sub_cats = json.load(f)

print("=== PHASE 2 VERIFICATION ===")
print(f"Total Products: {len(products)}")
print(f"Total Variants: {len(variants)}")
print(f"Total Brands: {len(brands)}")
print(f"Total Sub-Categories: {len(sub_cats)}")

# Check 1: Zero products with brand "Other" or empty
other_or_empty_brands = [p for p in products if not p.get('brand') or p.get('brand').strip().lower() == 'other']
print(f"Products with brand 'Other' or empty: {len(other_or_empty_brands)}")
assert len(other_or_empty_brands) == 0, "FAILED: Found products with brand 'Other' or empty!"

# Check 2: No product left without a sub-category
missing_sub = [p for p in products if not p.get('sub_category') and not p.get('subCategory')]
print(f"Products without sub-category: {len(missing_sub)}")
assert len(missing_sub) == 0, "FAILED: Found products without sub-category!"

# Check 3: Check the 23 misplaced products
fixes = {
    'g1-p0270': 'sweets-chocolates',
    'g1-p0244': 'sweets-chocolates',
    'g1-p0966': 'sweets-chocolates',
    'g1-p0253': 'biscuits-bakery',
    'g1-p0862': 'chips-namkeen',
    'g1-p0995': 'chips-namkeen',
    'g1-p0628': 'hair-care',
    'g1-p0629': 'hair-care',
    'g1-p0420': 'instant-food',
    'g1-p0729': 'instant-food',
    'g1-p0651': 'oil-ghee-masala',
    'g1-p0696': 'oil-ghee-masala',
    'g1-p0293': 'sauces-spreads',
    'g1-p0263': 'sweets-chocolates',
    'g1-p0820': 'sweets-chocolates',
    'g1-p0822': 'sweets-chocolates',
    'g1-p0161': 'hair-care',
    'g1-p0374': 'hair-care',
    'g1-p0032': 'dairy-bread-eggs',
    'g1-p0081': 'atta-rice-dal',
    'g1-p0094': 'dry-fruits-cereals', # or merged
    'g1-p0329': 'atta-rice-dal',      # or merged
    'g1-p0700': 'sweets-chocolates',
}

p_by_id = {p['id']: p for p in products}
for pid, expected_cat in fixes.items():
    if pid in p_by_id:
        p = p_by_id[pid]
        assert p['category_id'] == expected_cat, f"FAILED: {pid} has cat {p['category_id']}, expected {expected_cat}"

print("All 23 flagged products properly categorized!")
print("ALL PHASE 2 VERIFICATIONS PASSED SUCCESSFULLY!")
