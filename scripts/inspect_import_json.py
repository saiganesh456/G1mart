import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/pdf1_complete_import.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for i in items[:15]:
    print(f"#{i.get('item_no')}: {i.get('product_name')} | image_url: {i.get('image_url')} | image_status: {i.get('image_status')}")

# Check summary of image_status across all 96
from collections import Counter
c = Counter(i.get('image_status') for i in items)
print("\nImage status distribution in pdf1_complete_import.json:", c)
