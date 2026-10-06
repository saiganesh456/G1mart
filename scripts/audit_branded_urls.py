import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/pdf1_branded_image_research.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total branded research items: {len(items)}")

verified = [i for i in items if i.get('status') == 'VERIFIED_EXACT']
print(f"VERIFIED_EXACT count: {len(verified)}")
for v in verified:
    url = v.get('image_url')
    print(f"  Item #{v['item_no']:03d} | {v['brand']} | {v['product_name']} | {v['pack_size']} | {url}")

needs_review = [i for i in items if i.get('status') == 'NEEDS_REVIEW']
print(f"\nNEEDS_REVIEW count: {len(needs_review)}")
not_found = [i for i in items if i.get('status') == 'NOT_FOUND']
print(f"NOT_FOUND count: {len(not_found)}")
