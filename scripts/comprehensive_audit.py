import json
import re

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total products in catalog: {len(products)}")

category_checks = {
    'hair-care': ['shampoo', 'conditioner', 'hair oil', 'vatika', 'clinic plus', 'head & shoulders', 'pantene', 'tresemme', 'sunsilk', 'dove shampoo', 'kesh king', 'bajaj almond', 'parachute advansed'],
    'soaps-bath': ['soap', 'bath', 'body wash', 'cinthol', 'dettol soap', 'lifebuoy', 'lux', 'mysore sandal', 'pears', 'santoor', 'fiama', 'hamam', 'medimix'],
    'spices-masalas': ['masala', 'mirchi', 'chilli', 'turmeric', 'pasupu', 'haldi', 'dhania', 'coriander', 'jeera', 'cumin', 'mustard', 'aavalu', 'pepper', 'garam masala', 'sambar powder', 'rasam powder', 'ginger garlic paste', 'avakaya', 'pickle', 'cloves', 'lavangalu', 'elaichi', 'cardamom', 'cinnamon', 'dalchini'],
    'chips-namkeen': ['mixture', 'namkeen', 'murukku', 'chekkalu', 'borugulu', 'puffed rice', 'kurkure', 'lays', 'bingo', 'chips', 'khatta meetha', 'bhujia', 'sev', 'salted peanuts', 'masala peanuts'],
    'sweets-chocolates': ['chocolate', 'cadbury', 'dairy milk', 'kitkat', '5 star', 'snickers', 'munch', 'perk', 'chikki', 'soan papdi', 'gulab jamun mix', 'rasgulla', 'sweet'],
    'tea-coffee-milk-drinks': ['tea', 'coffee', 'chai', 'horlicks', 'boost', 'bournvita', 'complan', 'bru', 'nescafe', 'red label', 'taj mahal', 'wagh bakri', 'green tea'],
    'drinks-juices': ['frooti', 'maaza', 'slice', 'coca-cola', 'coke', 'thums up', 'sprite', 'fanta', 'pepsi', 'limca', 'appy fizz', 'real juice', 'tropicana', 'sting', 'red bull', 'soda'],
    'laundry-detergents': ['surf excel', 'ariel', 'tide', 'rin', 'wheel', 'ghadi', 'detergent', 'washing powder', 'fabric conditioner', 'comfort', 'ala'],
    'dishwash': ['vim', 'exo', 'pril', 'dishwash', 'scrub sponge', 'scrubber'],
    'floor-surface-cleaners': ['lizol', 'harpic', 'domex', 'colin', 'phenyl', 'cleaner', 'all out', 'goodknight', 'hit spray', 'mosquito', 'mortein'],
    'oral-care': ['colgate', 'close up', 'pepsodent', 'sensodyne', 'dabur red', 'meswak', 'toothpaste', 'toothbrush'],
    'sugar-salt-staples': ['salt', 'uppu', 'sugar', 'chekkera', 'sugar free', 'jaggery', 'bellam', 'honey', 'tamarind', 'chintapandu'],
    'dry-fruits-cereals': ['cashew', 'jeedi pappu', 'almond', 'badam', 'kismis', 'raisin', 'pista', 'pistachio', 'walnut', 'dates', 'khajoor', 'anjeer'],
    'instant-food': ['maggi', 'yippee', 'noodles', 'pasta', 'macaroni', 'vermicelli', 'semiya', 'oats', 'corn flakes', 'upma mix', 'idli mix', 'dosa mix', 'poha'],
    'local-dals': ['dal', 'pappu', 'toor', 'urad', 'moong', 'chana dal', 'senaga pappu', 'senagalu', 'groundnut', 'peanuts', 'rajma', 'alasandalu', 'green peas', 'soya chunks'],
    'oil-ghee-masala': ['oil', 'nune', 'ghee', 'neyyi', 'sunflower', 'groundnut oil', 'palmolein', 'sesame oil', 'gingelly', 'deepam'],
    'atta-rice-dal': ['atta', 'flour', 'wheat', 'godhumalu', 'rice', 'biyyam', 'rava', 'ravva', 'sooji', 'maida', 'besan', 'senaga pindi', 'millets', 'korralu', 'ragi', 'sajjalu', 'jowar'],
}

misplaced = []
for p in products:
    cid = p.get('category_id')
    name = p['name'].lower()
    
    # Check if a product in current cid matches another category strongly
    # For instance, shampoo in atta-rice-dal, or harpic in sweets
    for target_cat, keywords in category_checks.items():
        if cid == target_cat:
            continue
        # Specific strong misplacements
        if target_cat == 'hair-care' and any(k in name for k in ['shampoo', 'clinic plus', 'head & shoulders', 'pantene', 'sunsilk', 'dove shampoo', 'hair oil']):
            misplaced.append((p['id'], p['name'], cid, target_cat))
            break
        elif target_cat == 'laundry-detergents' and any(k in name for k in ['surf excel', 'ariel', 'tide', 'rin bar', 'washing powder', 'detergent powder']):
            misplaced.append((p['id'], p['name'], cid, target_cat))
            break
        elif target_cat == 'oral-care' and any(k in name for k in ['toothpaste', 'colgate', 'close up', 'toothbrush']):
            misplaced.append((p['id'], p['name'], cid, target_cat))
            break
        elif target_cat == 'floor-surface-cleaners' and any(k in name for k in ['harpic', 'lizol', 'colin', 'goodknight', 'hit spray']):
            misplaced.append((p['id'], p['name'], cid, target_cat))
            break
        elif target_cat == 'chips-namkeen' and cid in ['atta-rice-dal', 'local-dals', 'oil-ghee-masala'] and any(k in name for k in ['khatta meetha', 'chips', 'kurkure', 'lays', 'bingo', 'salted peanuts', 'masala peanuts']):
            misplaced.append((p['id'], p['name'], cid, target_cat))
            break
        elif target_cat == 'spices-masalas' and cid in ['atta-rice-dal', 'local-dals'] and any(k in name for k in ['garam masala', 'fried rice masala', 'meat masala', 'sambar powder', 'rasam powder', 'ginger garlic paste']):
            misplaced.append((p['id'], p['name'], cid, target_cat))
            break

print(f"\nFound {len(misplaced)} cross-category misplaced items:")
for m in misplaced:
    print(m)
