import json

cat = json.load(open('src/data/products-catalog.json', encoding='utf-8'))

target_cids = [
    'biscuits-bakery',
    'chips-namkeen',
    'sweets-chocolates',
    'drinks-juices',
    'tea-coffee-milk-drinks',
    'dairy-bread-eggs',
    'instant-food'
]

current_items = [p for p in cat if p.get('category_id') in target_cids]
print(f"Total current items in target categories: {len(current_items)}")

# Check anomalies in current items
anomalies = []
for p in current_items:
    cid = p.get('category_id')
    name = p.get('name', '').lower()
    
    # Check category mismatches
    if cid == 'drinks-juices' and ('fantasy' in name or 'biscuit' in name or 'cookie' in name or 'pie' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Biscuit/Cookie in Drinks'))
    elif cid == 'drinks-juices' and 'eno' in name:
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Antacid in Drinks'))
    elif cid == 'biscuits-bakery' and ('yippee' in name or 'noodle' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Noodles in Biscuits'))
    elif cid == 'biscuits-bakery' and ('munch' in name or 'melody' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Chocolate/Toffee in Biscuits'))
    elif cid == 'tea-coffee-milk-drinks' and ('brush' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Hardware brush in Tea/Coffee'))
    elif cid == 'dairy-bread-eggs' and ('dairy milk' in name or 'milkybar' in name or 'milky bar' in name or 'toblerone' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Chocolate in Dairy'))
    elif cid == 'dairy-bread-eggs' and ('biscuit' in name or 'biscot' in name or 'wafer' in name or 'rusk' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Biscuit in Dairy'))
    elif cid == 'dairy-bread-eggs' and ('makhana' in name or 'nuggets' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Snack in Dairy'))
    elif cid == 'sweets-chocolates' and ('betek nut' in name or 'crane' in name or 'kissan' in name or 'sweet corn' in name):
        anomalies.append((p['id'], p['name'], cid, 'MISPLACED: Non-chocolate/confectionery in Sweets'))

print(f"Total obvious category misplacements found: {len(anomalies)}")
for a in anomalies[:20]:
    print(f"  [{a[0]}] {a[1]} ({a[2]}) -> {a[3]}")

# Check duplicates in current items
from collections import Counter
names_clean = [p.get('name', '').strip().lower() for p in current_items]
counts = Counter(names_clean)
dups = [k for k, v in counts.items() if v > 1]
print(f"Duplicate product names count: {len(dups)}")
for d in dups[:10]:
    print(f"  Duplicate name: '{d}' (count: {counts[d]})")
