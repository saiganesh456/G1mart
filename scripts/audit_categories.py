import json
import re

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Rules for detecting misplaced products
# For instance:
# In atta-rice-dal:
#   - Shampoos, conditioners, soaps, hair oils -> hair-care / soaps-bath
#   - Masalas, spices, turmeric, mirchi, chilli -> spices-masalas
#   - Namkeen, chips, khatta meetha, chikki, snacks -> chips-namkeen / sweets-chocolates
#   - Dal, pappu, toor, moong, urad, chana dal, peanuts, senagalu -> local-dals
#   - Noodles, semiya, upma mix, idli mix -> instant-food

mismatches = []
for p in products:
    cid = p.get('category_id')
    name = p['name']
    name_lower = name.lower()
    
    # Check atta-rice-dal
    if cid == 'atta-rice-dal':
        # Check if it is a dal/pulse
        if any(w in name_lower for w in ['dal', 'pappu', 'toor', 'urad', 'moong', 'senagalu', 'peanuts', 'groundnut', 'senga nodi']):
            mismatches.append((p['id'], name, cid, 'local-dals', 'dal/pulse keyword'))
        elif any(w in name_lower for w in ['shampoo', 'clinic plus', 'hair']):
            mismatches.append((p['id'], name, cid, 'hair-care', 'hair keyword'))
        elif any(w in name_lower for w in ['masala', 'mirchi', 'chilli', 'turmeric', 'dhania', 'coriander']):
            mismatches.append((p['id'], name, cid, 'spices-masalas', 'spice keyword'))
        elif any(w in name_lower for w in ['khatta meetha', 'chikki', 'chips', 'namkeen']):
            mismatches.append((p['id'], name, cid, 'chips-namkeen', 'snack keyword'))
        elif any(w in name_lower for w in ['instant', 'upma mix', 'idli mix', 'rava idli mix']):
            mismatches.append((p['id'], name, cid, 'instant-food', 'instant mix keyword'))

print(f"Total misplaced in atta-rice-dal: {len(mismatches)}")
for m in mismatches:
    print(m)
