import urllib.request
import hashlib
import json
from collections import defaultdict

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

verified = [p for p in products if p.get('imageUrl') and p.get('imageStatus') == 'VERIFIED']
print(f'Checking {len(verified)} verified products...')

hash_map = defaultdict(list)
for p in verified:
    url = p['imageUrl']
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=10).read()
        h = hashlib.md5(data).hexdigest()
        hash_map[h].append((p['id'], p['name']))
    except Exception as e:
        print(f"Error fetching {p['id']}: {e}")

duplicates = {h: p_list for h, p_list in hash_map.items() if len(p_list) > 1}
print(f"\nTotal unique images: {len(hash_map)}")
print(f"Duplicate image groups: {len(duplicates)}")

for h, p_list in duplicates.items():
    print(f"\nDuplicate Hash {h} shared by {len(p_list)} products:")
    for pid, name in p_list:
        print(f"   [{pid}] {name}")
