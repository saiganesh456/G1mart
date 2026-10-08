import json
import re

with open('src/data/products-catalog.json', encoding='utf-8') as f:
    products = json.load(f)

SUBCAT_TO_CAT = {
    'Atta, Flours & Sooji': 'atta-rice-dal',
    'Rice, Poha & Vermicelli': 'atta-rice-dal',
    'Dals & Pulses': 'atta-rice-dal',
    'Edible Cooking Oils & Ghee': 'oil-ghee-masala',
    'Spices, Masalas & Seeds': 'oil-ghee-masala',
    'Dairy & Ice Creams': 'dairy-bread-eggs',
    'Salt, Sugar & Jaggery': 'sugar-salt-staples',
    'Kitchen Staples': 'sugar-salt-staples',
    'Biscuits, Rusks & Cookies': 'biscuits-bakery',
    'Chocolates & Sweets': 'sweets-chocolates',
    'Chips & Namkeen': 'chips-namkeen',
    'Cold Drinks & Health Juices': 'drinks-juices',
    'Tea, Chai & Coffee': 'tea-coffee-milk-drinks',
    'Packaged Foods': 'instant-food',
    'Laundry & Detergents': 'laundry-detergents',
    'Dishwashing & Utensil Care': 'dishwash',
    'Cleaners & Pest Control': 'floor-surface-cleaners',
    'Cleaning Essentials': 'floor-surface-cleaners',
    'Electricals & Batteries': 'kitchenware',
    'Pooja Agarbatti & Dhoop': 'pooja-needs',
    'Bath Soaps': 'soaps-bath',
    'Oral Care': 'oral-care',
    'Hair Oils & Care': 'hair-care',
    'Personal Care Essentials': 'hygiene',
}

def map_product_to_new_category(p):
    sub = p.get('subCategory') or ''
    name = (p.get('name') or '').lower()
    
    # Specific keywords
    if 'baby' in name or 'diaper' in name:
        return 'baby-care'
    if 'sauce' in name or 'jam' in name or 'ketchup' in name or 'spread' in name or 'mayonnaise' in name:
        return 'sauces-spreads'
    if 'vegetable' in name or 'fruit' in name or 'onion' in name or 'potato' in name or 'tomato' in name:
        return 'vegetables-fruits'
    if 'almond' in name or 'cashew' in name or 'badam' in name or 'kaju' in name or 'cereal' in name or 'oats' in name or 'corn flakes' in name:
        return 'dry-fruits-cereals'
    if 'cream' in name or 'lotion' in name or 'face wash' in name or 'skin' in name:
        return 'skin-care'
        
    if sub in SUBCAT_TO_CAT:
        return SUBCAT_TO_CAT[sub]
        
    # Old category fallback
    old_cat = p.get('category') or ''
    if old_cat == 'pooja-essentials':
        return 'pooja-needs'
    if old_cat == 'snacks-beverages':
        return 'chips-namkeen'
    if old_cat == 'grocery-staples':
        return 'sugar-salt-staples'
    if old_cat == 'household-cleaning':
        return 'floor-surface-cleaners'
    if old_cat == 'personal-care':
        return 'soaps-bath'
        
    return 'sugar-salt-staples'

counts = {}
for p in products:
    c = map_product_to_new_category(p)
    counts[c] = counts.get(c, 0) + 1

print("Distribution across 24 categories:")
for c, cnt in sorted(counts.items(), key=lambda x: -x[1]):
    print(f"  {c:25}: {cnt}")
