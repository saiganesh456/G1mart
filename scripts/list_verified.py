import json

with open('data/pdf1_branded_image_research.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

verified = [i for i in items if i.get('status') == 'VERIFIED_EXACT']
print(f"Total VERIFIED_EXACT items: {len(verified)}")
for v in verified:
    print(f"#{v['item_no']:03d} | {v['product_name']} | MRP: {v['mrp']} | URL: {v.get('image_url')}")
