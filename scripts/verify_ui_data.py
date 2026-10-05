import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

check_ids = ['g1-prod-002', 'g1-prod-004', 'g1-prod-006', 'g1-prod-007', 'g1-prod-008', 'g1-prod-013', 'g1-prod-014', 'g1-prod-053', 'g1-prod-055', 'g1-prod-473']
for p in products:
    if p['id'] in check_ids:
        print(f"{p['id']:12} | {p['name'][:30]:30} | Price: Rs.{p.get('price'):<4} | MRP: Rs.{p.get('originalPrice'):<4} | Confirmed: {str(p.get('priceConfirmed')):<5} | Img: {p.get('image')[-25:]}")
