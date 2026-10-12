import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print("Checking each category for anomalies...")
anomalies = []

for p in products:
    cid = p.get('category_id')
    name = p['name'].lower()
    pid = p['id']

    # Biscuits category
    if cid == 'biscuits-bakery':
        if any(w in name for w in ['soap', 'shampoo', 'detergent', 'oil', 'masala', 'dal', 'rice']):
            anomalies.append((pid, p['name'], cid, 'check biscuits'))
            
    # Chips namkeen
    if cid == 'chips-namkeen':
        if any(w in name for w in ['shampoo', 'soap', 'oil', 'paste', 'detergent']):
            anomalies.append((pid, p['name'], cid, 'check chips'))

    # Tea coffee
    if cid == 'tea-coffee-milk-drinks':
        if any(w in name for w in ['shampoo', 'soap', 'cleaner', 'noodle', 'oil']):
            anomalies.append((pid, p['name'], cid, 'check tea'))

    # Drinks juices
    if cid == 'drinks-juices':
        if any(w in name for w in ['soap', 'shampoo', 'harpic', 'atta', 'dal', 'oil']):
            anomalies.append((pid, p['name'], cid, 'check drinks'))

    # Floor cleaners
    if cid == 'floor-surface-cleaners':
        if any(w in name for w in ['biscuit', 'tea', 'coffee', 'chocolate', 'oil', 'rice', 'dal']):
            anomalies.append((pid, p['name'], cid, 'check cleaners'))

    # Pooja needs
    if cid == 'pooja-needs':
        if any(w in name for w in ['shampoo', 'biscuit', 'noodle', 'chocolate']):
            anomalies.append((pid, p['name'], cid, 'check pooja'))

    # Oral care
    if cid == 'oral-care':
        if any(w in name for w in ['shampoo', 'soap', 'biscuit', 'oil', 'tea']):
            anomalies.append((pid, p['name'], cid, 'check oral'))

    # Soaps bath
    if cid == 'soaps-bath':
        if any(w in name for w in ['tea', 'coffee', 'biscuit', 'rice', 'atta', 'dal', 'oil']):
            anomalies.append((pid, p['name'], cid, 'check soaps'))

    # Hair care
    if cid == 'hair-care':
        if any(w in name for w in ['biscuit', 'tea', 'atta', 'rice', 'dal', 'detergent']):
            anomalies.append((pid, p['name'], cid, 'check hair'))

print(f"Total anomalies found: {len(anomalies)}")
for a in anomalies:
    print(a)
