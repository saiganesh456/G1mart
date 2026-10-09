import os, json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

print(f'Catalog loaded: {len(products)} products')

# Let's inspect products matching key packshots:
queries = [
    ('aashirvaad-atta', 'Aashirvaad', 'Atta'),
    ('aashirvaad-salt', 'Aashirvaad', 'Salt'),
    ('aashirvaad-crystal-salt', 'Aashirvaad', 'Crystal Salt'),
    ('aashirvaad-suji-rava', 'Aashirvaad', 'Suji Rava'),
    ('ariel-front-liq', 'Ariel', 'Liquid'),
    ('good-day', 'Britannia', 'Good DAY'),
    ('cinthol-soap', 'Cinthol', 'Soap'),
    ('mysore-sandal-soap', 'Mysore Sandal', 'Soap'),
    ('santoor-soap', 'Santoor', 'Soap'),
    ('surf-excel', 'Surf Excel', 'Detergent'),
    ('vim-bar', 'Vim', 'Bar'),
    ('colgate-toothpaste', 'Colgate', 'Strong Teeth'),
    ('tata-salt', 'Tata', 'Salt'),
    ('cadbury-5-star', 'Cadbury', '5 Star'),
    ('cadbury-dairy-milk', 'Cadbury', 'Dairy Milk'),
    ('haldiram-khatta-meetha', 'HR', 'Khatta Meetha'),
    ('lalitha-idli-rava', 'Lalitha', 'Idly Ravva'),
    ('dettol-soap', 'Dettol', 'Soap'),
    ('dove-soap', 'Dove', 'Soap'),
    ('lifebuoy-soap', 'Lifebuoy', 'Soap'),
    ('lux-soap', 'Lux', 'Soap'),
    ('pears-soap', 'Pears', 'Soap'),
    ('maggi-noodles', 'Maggi', 'Noodles'),
    ('unibic-choco-ripple', 'Unibic', 'Choco Ripple'),
    ('red-label-tea', 'Red Label', 'Tea'),
    ('stayfree', 'Stayfree', 'Secure'),
    ('huggies', 'Huggies', 'Pants'),
    ('wagh-bakri-tea', 'Wagh Bakri', 'Tea'),
    ('parachute-oil', 'Parachute', 'Oil'),
    ('arun-donut', 'Arun', 'Donut'),
    ('arun-bites', 'Arun', 'Bites'),
    ('arun-icecream', 'Arun', 'Icecream'),
    ('exo-scrubber', 'Exo', 'Scrub')
]

for label, brand_kw, name_kw in queries:
    matched = []
    for p in products:
        b = (p.get('brand') or '').lower()
        n = p['name'].lower()
        sub = (p.get('subCategory') or '').lower()
        if brand_kw.lower() in b or brand_kw.lower() in n:
            if not name_kw or name_kw.lower() in n or name_kw.lower() in sub:
                matched.append((p['id'], p['name'], p.get('brand'), p.get('category_id')))
    print(f'=== {label} ===')
    for m in matched[:5]:
        print(f'  {m[0]}: {m[1]} ({m[2]}, {m[3]})')
