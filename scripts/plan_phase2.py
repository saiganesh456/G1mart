import json
import re
import csv
from collections import defaultdict, Counter

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
with open('data/migrated_product_variants.json', 'r', encoding='utf-8') as f:
    variants = json.load(f)
with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = json.load(f)

# Existing brands map
brand_name_to_id = {b['name'].lower(): b['id'] for b in brands}
brand_id_to_name = {b['id']: b['name'] for b in brands}

# -----------------------------------------------------------------------------
# 1. KNOWN BRANDS DICTIONARY FOR EXTRACTION
# -----------------------------------------------------------------------------
KNOWN_BRANDS = [
    ('Aachi', ['aachi', 'aacsi']),
    ('Aashirvaad', ['aashirvaad', 'asirvad']),
    ('Amul', ['amul']),
    ('Arun Icecreams', ['arun']),
    ('Bajaj', ['bajaj']),
    ('Bambino', ['bambino']),
    ('Bingo', ['bingo']),
    ('Boost', ['boost']),
    ('Bournvita', ['bournvita']),
    ('Britannia', ['britannia', 'good day', 'treat', 'mariegold', 'nutrichoice', 'bourbon', 'milk bikis', 'little hearts', 'pure magic', 'jim jam', 'tiger']),
    ('Bru', ['bru']),
    ('Cadbury', ['cadbury', 'dairy milk', 'bournville', '5 star', '5star', 'perk', 'fuse', 'gems', 'oreo']),
    ('Catch', ['catch']),
    ('Ching\'s Secret', ['chings', 'ching']),
    ('Cinthol', ['cinthol']),
    ('Clinic Plus', ['clinic plus']),
    ('Colgate', ['colgate']),
    ('Comfort', ['comfort']),
    ('Dabur', ['dabur', 'hajmola', 'meswak', 'vatika', 'red paste', 'gulabari', 'chyawanprash']),
    ('Dazzy', ['dazzy']),
    ('Dettol', ['dettol']),
    ('Dhara', ['dhara']),
    ('Dove', ['dove']),
    ('Eno', ['eno']),
    ('Everest', ['everest']),
    ('Exo', ['exo']),
    ('FAB', ['fab liquid', 'fab ']),
    ('Fiama', ['fiama']),
    ('Fortune', ['fortune']),
    ('Frooti', ['frooti']),
    ('Garnier', ['garnier']),
    ('Gemini', ['gemini']),
    ('Gillette', ['gillette']),
    ('Glucon-D', ['glucon-d', 'glucon d', 'glucond']),
    ('Godrej', ['godrej', 'aer', 'hit ']),
    ('Good Knight', ['good knight', 'goodknight']),
    ('Haldiram\'s', ['haldiram', 'haldirams']),
    ('Hamam', ['hamam']),
    ('Head & Shoulders', ['head & shoulders', 'head and shoulders']),
    ('Heritage', ['heritage']),
    ('Himalaya', ['himalaya']),
    ('Horlicks', ['horlicks']),
    ('Huggies', ['huggies', 'hugges']),
    ('India Gate', ['india gate']),
    ('Johnson\'s Baby', ['johnson', 'johnsonis', 'johnsons']),
    ('Keo Karpin', ['keo karpin']),
    ('Kesh King', ['kesh king']),
    ('Kinley', ['kinley']),
    ('Kissan', ['kisan', 'kissan']),
    ('Knorr', ['knorr']),
    ('Kopiko', ['kopiko']),
    ('Kurkure', ['kurkure']),
    ('Kwality Wall\'s', ['kwality']),
    ('Lay\'s', ['lays', 'lay\'s']),
    ('Lifebuoy', ['lifebuoy', 'lifebouy']),
    ('Limca', ['limca']),
    ('Lipton', ['lipton']),
    ('Liril', ['liril']),
    ('Lizol', ['lizol']),
    ('Lotte', ['lotte', 'choco pie']),
    ('Lux', ['lux']),
    ('Maaza', ['maaza']),
    ('Maggi', ['maggi', 'maggie']),
    ('Makhana', ['makhana']),
    ('Mangaldeep', ['mangaldeep']),
    ('Marico', ['saffola', 'parachute', 'mediker', 'livon', 'set wet', 'nihar']),
    ('Mortein', ['mortein']),
    ('Medimix', ['medimix']),
    ('Meera', ['meera']),
    ('Mirinda', ['mirinda']),
    ('Mother Dairy', ['mother dairy']),
    ('Mountain Dew', ['mountain dew']),
    ('MTR', ['mtr']),
    ('Mysore Sandal', ['mysore sandal']),
    ('Nandini', ['nandini']),
    ('Nescafe', ['nescafe']),
    ('Nestle', ['nestle', 'munch', 'kitkat', 'milkybar', 'everyday', 'cerelac']),
    ('Nivea', ['nivea']),
    ('Nutrela', ['nutrela']),
    ('Odonil', ['odonil']),
    ('Oral-B', ['oral-b', 'oral b']),
    ('Palmolive', ['palmolive']),
    ('Pampers', ['pampers']),
    ('Pantene', ['pantene']),
    ('Parachute', ['parachute']),
    ('Parle', ['parle', 'parle-g', 'parle g', 'monaco', 'krackjack', 'hide & seek', 'hide and seek', 'melody', 'mango bite', 'happy happy', 'kismi']),
    ('Patanjali', ['patanjali']),
    ('Pears', ['pears']),
    ('Pepsodent', ['pepsodent']),
    ('Pepsi', ['pepsi']),
    ('Pillsbury', ['pillsbury']),
    ('Ponds', ['ponds', 'pond\'s']),
    ('Pril', ['pril']),
    ('Priya', ['priya']),
    ('Pulse', ['pulse']),
    ('Red Bull', ['red bull']),
    ('Red Label', ['red label']),
    ('Rin', ['rin']),
    ('Rooh Afza', ['rooh afza']),
    ('Ruchi Gold', ['ruchi gold', 'ruchi']),
    ('Saffola', ['saffola']),
    ('Santoor', ['santoor']),
    ('Sensodyne', ['sensodyne']),
    ('7UP', ['7up', '7 up']),
    ('Shikakai', ['shikakai']),
    ('Slice', ['slice']),
    ('Snickers', ['snickers']),
    ('Sprite', ['sprite']),
    ('Sri Durga', ['sri durga', 'sridurga']),
    ('Stayfree', ['stayfree', 'stay free']),
    ('Sunfeast', ['sunfeast', 'dark fantasy', 'bounce', 'mom\'s magic', 'fantastik', 'yippee']),
    ('Sunsilk', ['sunsilk']),
    ('Surf Excel', ['surf excel', 'surf']),
    ('Taj Mahal', ['taj mahal']),
    ('Tang', ['tang']),
    ('Tata', ['tata', 'tetley', 'sampann']),
    ('Thums Up', ['thumsup', 'thumbs up', 'thums up']),
    ('Tide', ['tide']),
    ('Too Yumm', ['too yumm', 'too yumm!']),
    ('Tresemme', ['tresemme']),
    ('Tropicana', ['tropicana']),
    ('Ujala', ['ujala']),
    ('Unibic', ['unibic']),
    ('Vandevi', ['vandevi']),
    ('Vaseline', ['vaseline']),
    ('Veet', ['veet']),
    ('Vicks', ['vicks']),
    ('Vim', ['vim']),
    ('Whisper', ['whisper']),
    ('Wipro', ['safewash', 'glitto']),
    ('Yardley', ['yardley']),
    ('Zandu', ['zandu']),
    ('Zed Black', ['zed black']),
]

EXPLICIT_CATEGORY_FIXES = {
    'g1-p0270': 'sweets-chocolates',   # Dairy Milk Fruit&nut
    'g1-p0244': 'sweets-chocolates',   # Dazzy Fruit Bonbon
    'g1-p0966': 'sweets-chocolates',   # MIX Fruit Jelly
    'g1-p0253': 'biscuits-bakery',     # Unibic Fruit & NUT
    'g1-p0862': 'chips-namkeen',       # Bingo Tomato
    'g1-p0995': 'chips-namkeen',       # Makhana Cream&onion
    'g1-p0628': 'hair-care',           # Meera Shampoo Onion
    'g1-p0629': 'hair-care',           # Meera Onion Shampoo
    'g1-p0420': 'instant-food',        # Knorr Tomato Soup
    'g1-p0729': 'instant-food',        # Tomato Soup
    'g1-p0651': 'oil-ghee-masala',     # SRI Durga Tomato Pickle
    'g1-p0696': 'oil-ghee-masala',     # Tomato Pickel
    'g1-p0293': 'sauces-spreads',      # Kisan Mixedfruit 2RS
    'g1-p0263': 'sweets-chocolates',   # Dazzy Choco Orange
    'g1-p0820': 'sweets-chocolates',   # Sunfeast Fantastik Choco Almond
    'g1-p0822': 'sweets-chocolates',   # Sunfeast Fantastik Roast&almond
    'g1-p0161': 'hair-care',           # Dabur Almond Hair OIL
    'g1-p0374': 'hair-care',           # Meera Shampoo Badam
    'g1-p0032': 'dairy-bread-eggs',    # Arun Icecream
    'g1-p0081': 'atta-rice-dal',       # Pottu Minapappu
    'g1-p0094': 'dry-fruits-cereals',  # Jeedi Pappu 10rs
    'g1-p0329': 'atta-rice-dal',       # Verusenaga Pappu
    'g1-p0700': 'sweets-chocolates',   # Assorated Fruit
}

def extract_brand(p_name, current_brand):
    name_l = p_name.lower()
    if current_brand and current_brand not in ['G1 Mart Fresh', 'G1 Mart', 'Other', 'none', None]:
        return current_brand
    for brand_name, triggers in KNOWN_BRANDS:
        for t in triggers:
            if re.search(r'\b' + re.escape(t) + r'\b', name_l):
                return brand_name
    return None

def classify_product(p):
    pid = p['id']
    name = p['name']
    name_l = name.lower()
    current_cat = p.get('category_id') or ''

    if pid in EXPLICIT_CATEGORY_FIXES:
        cat = EXPLICIT_CATEGORY_FIXES[pid]
    else:
        cat = current_cat

    if cat == 'hygiene' or cat == 'none' or not cat:
        if any(k in name_l for k in ['pappu', 'dal', 'rajma', 'pesalu', 'korralu', 'chana', 'soya chunk', 'wheat', 'rice', 'rava', 'flour', 'atta', 'millets']):
            cat = 'atta-rice-dal'
        elif any(k in name_l for k in ['masala', 'rasam', 'sambar', 'elachi', 'karam', 'gasagasaalu', 'mirchi', 'jeera', 'dhaniya', 'pepper', 'haldi', 'turmeric', 'powder', 'pickle', 'pickel', 'oil', 'ghee']):
            cat = 'oil-ghee-masala'
        elif any(k in name_l for k in ['tea', 'coffee', 'taj mahal', 'bru', 'red label']):
            cat = 'tea-coffee-milk-drinks'
        elif any(k in name_l for k in ['thumsup', 'thumbs up', 'sprite', 'coke', 'pepsi', 'maaza', 'frooti', 'fizz', 'soda', 'drink', 'badam milk']):
            cat = 'drinks-juices'
        elif any(k in name_l for k in ['biscuit', 'cookie', 'rusk', 'cake', 'happy happy', 'good day', 'bourbon', 'marie', 'wafer']):
            cat = 'biscuits-bakery'
        elif any(k in name_l for k in ['chocolate', 'choco', 'dairy milk', 'munch', 'perk', '5 star', 'candy', 'jelly', 'bonbon', 'sweet']):
            cat = 'sweets-chocolates'
        elif any(k in name_l for k in ['surf', 'tide', 'ariel', 'rin', 'wheel', 'detergent', 'fab liquid', 'comfort', 'ujala', 'washing']):
            cat = 'laundry-detergents'
        elif any(k in name_l for k in ['agarbatti', 'dhoop', 'zed black', 'lia cones', 'camphor', 'karpooram', 'diya', 'pooja', 'cones']):
            cat = 'pooja-needs'
        elif any(k in name_l for k in ['huggies', 'hugges', 'pampers', 'diaper', 'baby']):
            cat = 'baby-care'
        elif any(k in name_l for k in ['odonil', 'air fresh', 'aer', 'lizol', 'harpic', 'hit', 'mosquito', 'all out', 'good knight']):
            cat = 'floor-surface-cleaners'
        elif any(k in name_l for k in ['shampoo', 'hair oil', 'tresemme', 'clinic plus', 'sunsilk', 'pantene', 'vatika', 'parachute']):
            cat = 'hair-care'
        elif any(k in name_l for k in ['soap', 'hand wash', 'body wash', 'santoor', 'dettol', 'lux', 'lifebuoy', 'pears']):
            cat = 'soaps-bath'
        elif any(k in name_l for k in ['lock', 'lighter', 'match', 'scrub', 'foil', 'bag']):
            cat = 'kitchenware'
        elif any(k in name_l for k in ['kismis', 'badam', 'cashew', 'jeedi pappu', 'kharjuram', 'dates', 'almond', 'walnut']):
            cat = 'dry-fruits-cereals'
        elif any(k in name_l for k in ['stay free', 'stayfree', 'whisper', 'sanitary', 'pad', 'napkin', 'sofy', 'intimate']):
            cat = 'hygiene'

    sub = 'General Essentials'

    if cat == 'atta-rice-dal':
        if any(k in name_l for k in ['pappu', 'dal', 'rajma', 'pesalu', 'chana', 'gram', 'pulse']):
            sub = 'Pulses & Dal'
        elif any(k in name_l for k in ['rice', 'biryani rice', 'basmati', 'millets', 'korralu']):
            sub = 'Rice & Grains'
        elif any(k in name_l for k in ['atta', 'flour', 'wheat', 'chakki']):
            sub = 'Atta & Flours'
        elif any(k in name_l for k in ['poha', 'atukulu', 'dalia', 'vermicelli']):
            sub = 'Poha & Dalia'
        else:
            sub = 'Pulses & Dal'

    elif cat == 'oil-ghee-masala':
        if any(k in name_l for k in ['oil', 'refined', 'sunflower', 'groundnut oil', 'mustard oil', 'deepam']):
            sub = 'Edible Oils'
        elif any(k in name_l for k in ['ghee', 'vanaspati', 'dalda']):
            sub = 'Ghee & Vanaspati'
        elif any(k in name_l for k in ['pickle', 'pickel', 'chutney', 'pachadi']):
            sub = 'Pickles & Chutneys'
        elif any(k in name_l for k in ['masala', 'rasam', 'sambar', 'karam', 'powder', 'chilli powder', 'turmeric powder']):
            sub = 'Masala Powders'
        else:
            sub = 'Whole Spices'

    elif cat == 'dairy-bread-eggs':
        if any(k in name_l for k in ['ice cream', 'icecream', 'kulfi', 'arun', 'cone', 'cassata']):
            sub = 'Ice Creams'
        elif any(k in name_l for k in ['milk', 'curd', 'dahi']):
            sub = 'Milk & Curd'
        elif any(k in name_l for k in ['butter', 'cheese']):
            sub = 'Butter & Cheese'
        elif any(k in name_l for k in ['paneer', 'cream']):
            sub = 'Paneer & Cream'
        elif any(k in name_l for k in ['bread', 'pav', 'bun']):
            sub = 'Bread & Pav'
        elif 'egg' in name_l:
            sub = 'Eggs'
        else:
            sub = 'Milk & Curd'

    elif cat == 'dry-fruits-cereals':
        if any(k in name_l for k in ['cereal', 'oats', 'corn flakes', 'muesli', 'kellogg']):
            sub = 'Breakfast Cereals & Oats'
        else:
            sub = 'Dry Fruits & Nuts'

    elif cat == 'sugar-salt-staples':
        if any(k in name_l for k in ['salt', 'uppu']):
            sub = 'Salt'
        elif any(k in name_l for k in ['sugar', 'jaggery', 'bellam']):
            sub = 'Sugar & Jaggery'
        elif any(k in name_l for k in ['sooji', 'rava', 'maida', 'besan']):
            sub = 'Sooji, Maida & Besan'
        else:
            sub = 'Other Staples'

    elif cat == 'vegetables-fruits':
        if any(k in name_l for k in ['apple', 'banana', 'orange', 'mango', 'grapes', 'fruit']):
            sub = 'Fresh Fruits'
        else:
            sub = 'Fresh Vegetables'

    elif cat == 'biscuits-bakery':
        if any(k in name_l for k in ['cookie', 'unibic', 'butter cookie']):
            sub = 'Cookies'
        elif any(k in name_l for k in ['rusk', 'toast']):
            sub = 'Rusk & Bakery Snacks'
        elif any(k in name_l for k in ['cake', 'wafer', 'pie']):
            sub = 'Cakes & Wafers'
        else:
            sub = 'Biscuits'

    elif cat == 'chips-namkeen':
        if any(k in name_l for k in ['chips', 'potato', 'bingo', 'lays', 'crisps']):
            sub = 'Chips & Crisps'
        elif any(k in name_l for k in ['makhana', 'popcorn', 'peanut', 'roasted']):
            sub = 'Popcorn & Roasted Snacks'
        else:
            sub = 'Namkeen & Bhujia'

    elif cat == 'sweets-chocolates':
        if any(k in name_l for k in ['chocolate', 'choco', 'dairy milk', 'munch', 'perk', '5 star', 'kitkat', 'snickers']):
            sub = 'Chocolates'
        elif any(k in name_l for k in ['halwa', 'laddu', 'peda', 'gulab jamun', 'rasgulla', 'chikki']):
            sub = 'Indian Sweets'
        else:
            sub = 'Candies & Gums'

    elif cat == 'drinks-juices':
        if any(k in name_l for k in ['juice', 'slice', 'maaza', 'frooti', 'real', 'tropicana']):
            sub = 'Juices & Fruit Drinks'
        elif any(k in name_l for k in ['glucon', 'energy', 'red bull', 'tang']):
            sub = 'Energy & Health Drinks'
        elif any(k in name_l for k in ['soda', 'water', 'kinley', 'mineral water']):
            sub = 'Water & Soda'
        else:
            sub = 'Soft Drinks & Sodas'

    elif cat == 'tea-coffee-milk-drinks':
        if any(k in name_l for k in ['coffee', 'nescafe', 'bru']):
            sub = 'Coffee'
        elif any(k in name_l for k in ['horlicks', 'boost', 'bournvita', 'complan', 'ensure']):
            sub = 'Health Drink Mixes'
        else:
            sub = 'Tea'

    elif cat == 'instant-food':
        if any(k in name_l for k in ['maggi', 'yippee', 'noodle', 'pasta', 'vermicelli']):
            sub = 'Instant Noodles & Pasta'
        elif any(k in name_l for k in ['soup', 'knorr']):
            sub = 'Ready to Cook & Soups'
        else:
            sub = 'Instant Noodles & Pasta'

    elif cat == 'sauces-spreads':
        if any(k in name_l for k in ['jam', 'kissan', 'marmalade', 'peanut butter', 'spread', 'mayonnaise']):
            sub = 'Jams & Spreads'
        elif any(k in name_l for k in ['honey', 'syrup']):
            sub = 'Honey & Syrups'
        else:
            sub = 'Sauces & Ketchup'

    elif cat == 'soaps-bath':
        if any(k in name_l for k in ['body wash', 'shower gel']):
            sub = 'Body Wash & Shower Gel'
        elif any(k in name_l for k in ['hand wash', 'sanitizer', 'handwash']):
            sub = 'Hand Wash & Sanitizers'
        else:
            sub = 'Bathing Soaps'

    elif cat == 'hair-care':
        if any(k in name_l for k in ['hair oil', 'oil']):
            sub = 'Hair Oil'
        elif any(k in name_l for k in ['conditioner', 'gel', 'serum', 'dye', 'color']):
            sub = 'Conditioner & Styling'
        else:
            sub = 'Shampoo'

    elif cat == 'skin-care':
        if any(k in name_l for k in ['talc', 'powder', 'ponds']):
            sub = 'Talcum Powders'
        elif any(k in name_l for k in ['lotion', 'body lotion']):
            sub = 'Body Lotions'
        else:
            sub = 'Face Wash & Creams'

    elif cat == 'oral-care':
        if any(k in name_l for k in ['brush', 'toothbrush', 'tongue']):
            sub = 'Toothbrushes & Tongue Cleaners'
        elif 'mouthwash' in name_l:
            sub = 'Mouthwash'
        else:
            sub = 'Toothpaste'

    elif cat == 'baby-care':
        if any(k in name_l for k in ['diaper', 'huggies', 'pampers', 'wipe']):
            sub = 'Baby Diapers & Wipes'
        elif any(k in name_l for k in ['cerelac', 'food']):
            sub = 'Baby Food'
        else:
            sub = 'Baby Bath & Skin Care'

    elif cat == 'hygiene':
        if any(k in name_l for k in ['razor', 'blade', 'gillette', 'shave', 'veet']):
            sub = 'Hair Removal & Shaving'
        elif any(k in name_l for k in ['wash', 'v wash', 'intimate']):
            sub = 'Intimate & Personal Hygiene'
        else:
            sub = 'Sanitary Pads & Napkins'

    elif cat == 'laundry-detergents':
        if any(k in name_l for k in ['bar', 'soap', 'rin bar', 'wheel bar']):
            sub = 'Detergent Bars'
        elif any(k in name_l for k in ['comfort', 'fabric', 'bleach', 'ujala']):
            sub = 'Fabric Conditioners & Bleach'
        else:
            sub = 'Detergent Powders & Liquids'

    elif cat == 'dishwash':
        if any(k in name_l for k in ['scrub', 'sponge', 'pad', 'steel']):
            sub = 'Scrubs & Sponges'
        else:
            sub = 'Dishwash Bars & Liquids'

    elif cat == 'floor-surface-cleaners':
        if any(k in name_l for k in ['harpic', 'toilet']):
            sub = 'Toilet Cleaners'
        elif any(k in name_l for k in ['odonil', 'aer', 'air fresh']):
            sub = 'Air Fresheners'
        elif any(k in name_l for k in ['mosquito', 'hit', 'good knight', 'all out', 'repellent']):
            sub = 'Mosquito & Pest Repellents'
        else:
            sub = 'Floor & Surface Cleaners'

    elif cat == 'pooja-needs':
        if any(k in name_l for k in ['camphor', 'karpooram', 'diya', 'oil', 'wicks']):
            sub = 'Pooja Oil, Camphor & Diya'
        else:
            sub = 'Agarbatti & Dhoop'

    elif cat == 'kitchenware':
        if any(k in name_l for k in ['foil', 'match', 'disposable']):
            sub = 'Disposables & Matches'
        else:
            sub = 'Kitchen Storage & Utilities'

    return cat, sub

# -----------------------------------------------------------------------------
# 3. MERGE CANDIDATES (Size Duplicates into Multi-Variant Products)
# -----------------------------------------------------------------------------
var_by_pid = defaultdict(list)
for v in variants:
    var_by_pid[v['product_id']].append(v)

def normalize_name(name):
    n = name.strip()
    n = re.sub(r'(?i)\b\d+(\.\d+)?\s*(kg|g|gm|gms|l|ltr|ml|pc|pcs|pack|pk|rs|r)\b', '', n)
    n = re.sub(r'(?i)\b(rs|r)\s*\d+\b', '', n)
    n = re.sub(r'[\(\)\[\],-]', ' ', n)
    return re.sub(r'\s+', ' ', n).strip().title()

product_data = []
for p in products:
    current_b = brand_id_to_name.get(p.get('brand_id'), '')
    extracted_b = extract_brand(p['name'], current_b)
    cat, sub = classify_product(p)
    if not extracted_b:
        final_b = 'G1 Mart Fresh' if cat == 'vegetables-fruits' else 'Local / Unbranded'
    else:
        final_b = extracted_b

    product_data.append({
        'id': p['id'],
        'name': p['name'],
        'norm_name': normalize_name(p['name']),
        'cat': cat,
        'sub': sub,
        'brand': final_b,
        'image_url': p.get('image_url'),
        'image_status': p.get('image_status', 'missing'),
    })

# Group by (norm_name, brand, cat)
merge_groups = defaultdict(list)
for p in product_data:
    key = (p['norm_name'].lower(), p['brand'].lower(), p['cat'])
    merge_groups[key].append(p)

merge_candidates = {k: v for k, v in merge_groups.items() if len(v) > 1 and len(k[0]) > 2}

print(f'=== SIZE DUPLICATE MERGE CANDIDATES ===')
print(f'Total groups to merge: {len(merge_candidates)}')
merged_products_count = 0
for (norm, b, cat), group in merge_candidates.items():
    primary = group[0]
    secondaries = group[1:]
    merged_products_count += len(secondaries)
    print(f'Primary Product: {primary["id"]} "{primary["name"]}" ({b}) [{cat}]')
    for s in secondaries:
        print(f'  <- Merge secondary: {s["id"]} "{s["name"]}"')

print(f'\nTotal secondary products to merge into variants: {merged_products_count}')
print(f'Final product count after merge: {len(products) - merged_products_count}')

# -----------------------------------------------------------------------------
# 4. LOW CONFIDENCE ROWS FOR /audit/review.csv
# -----------------------------------------------------------------------------
review_rows = []
for p in product_data:
    # Flags for review:
    # 1. Name is very short (< 4 chars)
    # 2. Local / Unbranded and high price or ambiguous category
    # 3. Product belongs to multiple potential categories
    is_low_conf = False
    reason = []
    if len(p['name'].strip()) < 4:
        is_low_conf = True
        reason.append('Very short name')
    if p['norm_name'] in ['High Power', 'Lock 60Mm', 'Zed Black', 'Fabric']:
        is_low_conf = True
        reason.append('Generic brand or hardware item')
    if p['brand'] == 'Local / Unbranded' and p['cat'] in ['baby-care', 'oral-care']:
        is_low_conf = True
        reason.append('Personal/baby care item without recognized FMCG brand')

    if is_low_conf:
        review_rows.append({
            'product_id': p['id'],
            'product_name': p['name'],
            'suggested_category': p['cat'],
            'suggested_sub_category': p['sub'],
            'suggested_brand': p['brand'],
            'reason_for_review': '; '.join(reason),
        })

print(f'\nTotal items flagged for review in /audit/review.csv: {len(review_rows)}')
