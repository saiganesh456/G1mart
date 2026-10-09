import json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

targets = {
    'aashirvaad-atta': ('Aashirvaad', 'Atta'),
    'aashirvaad-salt': ('Aashirvaad', 'Salt'),
    'aashirvaad-crystal-salt': ('Aashirvaad', 'Crystal Salt'),
    'aashirvaad-suji-rava': ('Aashirvaad', 'Suji Rava'),
    'ariel-front-liq': ('Ariel', 'Front Liquid'),
    'good-day': ('Britannia', 'Good DAY'),
    'cinthol-soap': ('Cinthol', 'Soap'),
    'mysore-sandal-soap': ('Mysore Sandal', 'Soap'),
    'santoor-soap': ('Santoor', 'Sandal'),
    'surf-excel': ('Surf Excel', 'Detergent'),
    'vim-bar': ('Vim', 'Bar'),
    'colgate-toothpaste': ('Colgate', 'Strong Teeth'),
    'tata-salt': ('Tata', 'Salt'),
    'cadbury-5-star': ('Cadbury', '5 Star'),
    'cadbury-dairy-milk': ('Cadbury', 'Dairy Milk'),
    'kurkure': ('Kurkure', 'Masala'),
    'thums-up': ('Thums Up', ''),
    'parachute-oil': ('Parachute', 'Oil'),
    'haldiram-khatta-meetha': ('Haldiram', 'Khatta Meetha'),
    'lalitha-idli-rava': ('Lalitha', 'Idli Rava'),
    'dettol-soap': ('Dettol', 'Original'),
    'dove-soap': ('Dove', 'Soap'),
    'lifebuoy-soap': ('Lifebuoy', 'Soap'),
    'lux-soap': ('Lux', 'Rose'),
    'pears-soap': ('Pears', 'Pure & Gentle'),
    'maggi-noodles': ('Maggi', 'Noodles'),
    'arun-donut': ('Arun', 'Donut'),
    'arun-bites': ('Arun', 'Bites'),
    'arun-icecream': ('Arun', 'Icecream'),
    'unibic-choco-ripple': ('Unibic', 'Choco Ripple'),
    'wagh-bakri-tea': ('Wagh Bakri', 'Tea'),
    'red-label-tea': ('Red Label', 'Tea'),
    'stayfree': ('Stayfree', 'Secure'),
    'huggies': ('Huggies', 'Diaper'),
    'horlicks': ('Horlicks', ''),
    'close-up-toothpaste': ('Close Up', ''),
    'cleaner-spray': ('Colin', 'Cleaner'),
    'exo-scrubber': ('Exo', 'Scrub')
}

for name, (b, kw) in targets.items():
    matches = []
    for p in products:
        p_name = p['name'].lower()
        p_brand = (p.get('brand') or '').lower()
        p_sub = (p.get('subCategory') or '').lower()
        if (b.lower() in p_brand or b.lower() in p_name) and (kw.lower() in p_name or kw.lower() in p_sub):
            matches.append(p['id'] + ': ' + p['name'])
    print(name + ' -> ' + str(matches[:3]))
