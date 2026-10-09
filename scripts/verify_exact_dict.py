import os, json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

prod_by_id = {p['id']: p for p in products}

# Exact mappings dictionary: packshot base -> (list of exact product_ids, brand, product_line, variant, pack_size, confidence)
EXACT_MAPPINGS = {
    'aashirvaad-atta': (['g1-p0440'], 'Aashirvaad', 'Whole Wheat Atta', 'Regular', '10kg', 1.0),
    'aashirvaad-atta-1kg': (['g1-p0440'], 'Aashirvaad', 'Whole Wheat Atta', 'Regular', '1kg', 1.0),
    'aashirvaad-salt': (['g1-p0716'], 'Aashirvaad', 'Iodised Salt', 'Regular', '1kg', 1.0),
    'aashirvaad-crystal-salt': (['g1-p0482'], 'Aashirvaad', 'Crystal Salt', 'Regular', '1kg', 1.0),
    'aashirvaad-suji-rava': (['g1-p0457', 'g1-p0859'], 'Aashirvaad', 'Suji Rava', 'Roasted/Plain', '500g', 1.0),
    'aachi-appalam': (['g1-p0541'], 'Aachi', 'Appalam / Papad', 'Classic Plain', '100g', 1.0),
    'ariel-front-liq': (['g1-p0036'], 'Ariel', 'Matic Power Gel', 'Front Load Liquid', '3.2kg', 1.0),
    'good-day': (['g1-p0061'], 'Britannia', 'Good Day', 'Cashew Cookies', '120g', 1.0),
    'cinthol-soap': (['g1-p0122', 'g1-p0024'], 'Cinthol', 'Original Soap', 'Deodorant & Complexion', '100g', 1.0),
    'mysore-sandal-soap': (['g1-p0543', 'g1-p0712'], 'Mysore Sandal', 'Pure Sandalwood Soap', 'Original Sandal', '75g', 1.0),
    'santoor-soap': (['g1-p0615', 'g1-p0189'], 'Santoor', 'Sandal & Turmeric Bath Soap', 'Sandal & Turmeric', '100g', 1.0),
    'surf-excel': (['g1-p0332', 'g1-p0303', 'g1-p0304'], 'Surf Excel', 'Easy Wash', 'Detergent Powder', '1kg', 1.0),
    'vim-bar': (['g1-p0425', 'g1-p0307'], 'Vim', 'Dishwash Bar', 'Lemon', '125g', 1.0),
    'colgate-toothpaste': (['g1-p0551', 'g1-p0534'], 'Colgate', 'Strong Teeth', 'Dental Cream', '100g', 1.0),
    'tata-salt': (['g1-p0202', 'g1-p0028'], 'Tata Salt', 'Vacuum Evaporated Salt', 'Iodised', '1kg', 1.0),
    'cadbury-5-star': (['g1-p0746', 'g1-p0747'], 'Cadbury', '5 Star', 'Caramel Chocolate', '40g', 1.0),
    'cadbury-dairy-milk': (['g1-p0011'], 'Cadbury', 'Dairy Milk', 'Milk Chocolate', '50g', 1.0),
    'haldiram-khatta-meetha': (['g1-p0577'], \"Haldiram's\", 'Khatta Meetha', 'Sweet & Sour Namkeen', '200g', 1.0),
    'lalitha-idli-rava': (['g1-p0428'], 'Sri Lalitha', 'Idly Ravva', 'Premium Idly Ravva', '1kg', 1.0),
    'dettol-soap': (['g1-p0023'], 'Dettol', 'Original Germ Protection', 'Classic Green', '125g', 1.0),
    'dove-soap': (['g1-p0533', 'g1-p0848'], 'Dove', 'Cream Beauty Bar', 'White', '100g', 1.0),
    'lifebuoy-soap': (['g1-p0714', 'g1-p0005'], 'Lifebuoy', 'Total 10 / Neem & Aloe', 'Red / Green', '125g', 1.0),
    'lux-soap': (['g1-p0522', 'g1-p0515', 'g1-p0525'], 'Lux', 'Glowing Skin Soap', 'Rose & Vitamin E', '100g', 1.0),
    'pears-soap': (['g1-p0007'], 'Pears', 'Pure & Gentle', 'Amber Glycerine', '125g', 1.0),
    'maggi-noodles': (['g1-p0273'], 'Nestle Maggi', '2-Minute Noodles', 'Masala', '70g', 1.0),
    'unibic-choco-ripple': (['g1-p0002'], 'Unibic', 'Choco Ripple', 'Chocolate Creme', '150g', 1.0),
    'britannia-bourbon': (['g1-p0781'], 'Britannia', 'Bourbon', 'Chocolate Creme', '150g', 1.0),
    'red-label-tea': (['g1-p0958'], 'Brooke Bond Red Label', 'Natural Care Tea', 'Spiced Tea', '250g', 1.0),
    'wagh-bakri-tea': (['g1-p0817', 'g1-p0905'], 'Wagh Bakri', 'Premium Leaf Tea', 'Leaf', '250g', 1.0),
    'parachute-oil': (['g1-p0117', 'g1-p0435'], 'Parachute', '100% Pure Coconut Oil', 'Pure Coconut', '200ml', 1.0),
    'arun-donut': (['g1-p0043'], 'Arun Icecreams', 'Ice Cream Donut', 'Chocolate Donut', '60ml', 1.0),
    'arun-bites': (['g1-p0035'], 'Arun Icecreams', 'Bites', 'Ice Cream Bites', '50ml', 1.0),
    'arun-icecream': (['g1-p0032'], 'Arun Icecreams', 'Ice Cream Cup', 'Vanilla', '100ml', 1.0),
    'exo-scrubber': (['g1-p0850'], 'Exo', 'Safecool Scrubber', 'Anti-Bacterial', '1 pc', 1.0),
    'stayfree': (['g1-p0090'], 'Stayfree', 'Secure Regular', 'Cottony Wings', '7 pads', 1.0),
    'huggies': (['g1-p0105', 'g1-p0106', 'g1-p0107'], 'Huggies', 'Wonder Pants', 'Baby Diapers', 'Medium/Large/XL', 1.0),
    'close-up-toothpaste': (['g1-p0467', 'g1-p0544'], 'Close Up', 'Everfresh', 'Red Hot Gel', '80g', 1.0),
    'cleaner-spray': (['g1-p0276'], 'Colin', 'Glass Cleaner', 'Regular Blue', '500ml', 1.0),
    'bingo-mad-angles': (['g1-p0862'], 'Bingo', 'Mad Angles', 'Tomato / Chaat', '66g', 1.0),
    'nestle-munch': (['g1-p0199'], 'Nestle', 'Munch', 'Chocolate Wafer', '25g', 1.0),
    'parle-g': (['g1-p0026'], 'Parle', 'Parle-G', 'Gluco Biscuits', '250g', 1.0)
}

print(f'Defined {len(EXACT_MAPPINGS)} high-confidence exact packshot mappings.')
for k, (pids, b, l, v, s, conf) in EXACT_MAPPINGS.items():
    for pid in pids:
        p = prod_by_id[pid]
        print(f'{k:<25} -> {pid} ({p[\"name\"]} | {p.get(\"brand\")} | {p.get(\"category_id\")})')
