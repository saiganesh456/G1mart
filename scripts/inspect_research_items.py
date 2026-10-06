import json

with open('data/pdf1_branded_image_research.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for idx, i in enumerate(items[:15]):
    print(f"Item #{i.get('item_no')}: {i.get('product_name')}")
    print(f"  status: {i.get('status')}")
    print(f"  image_url: {i.get('image_url')}")
    print(f"  image_source: {i.get('image_source')}")
    print(f"  reason: {i.get('reason')}")
