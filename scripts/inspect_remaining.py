import sys
sys.path.append('scripts')
from test_rule_engine import RULES

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

santoor_items = []
goodday_items = []

for p in products:
    primary = f"{p.get('brand', '')} {p.get('name', '')} {p.get('rawName', '')}".lower()
    full = f"{primary} {p.get('subCategory', '')}".lower()
    match = None
    for pattern, img, cat, subcat in RULES:
        if re.search(pattern, primary) or re.search(pattern, full):
            match = img
            break
    if not match:
        cat = p.get('category', '')
        if 'personal' in cat: match = '/products/packshots/santoor-soap.jpg'
        elif 'snack' in cat: match = '/products/packshots/good-day.jpg'
    
    label = f"{p.get('brand')} - {p.get('name')} (raw: {p.get('rawName')})"
    if match == '/products/packshots/santoor-soap.jpg':
        santoor_items.append(label)
    elif match == '/products/packshots/good-day.jpg':
        goodday_items.append(label)

print(f"Total mapped to santoor-soap: {len(santoor_items)}")
print("--- Sample 30 items mapped to santoor-soap ---")
for s in santoor_items[:30]:
    print(" ", s)

print(f"\nTotal mapped to good-day: {len(goodday_items)}")
print("--- Sample 30 items mapped to good-day ---")
for g in goodday_items[:30]:
    print(" ", g)
