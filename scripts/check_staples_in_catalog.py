import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

prods = json.load(open('src/data/products-catalog.json', 'r', encoding='utf-8'))
keywords = ['makhana', 'sunflower', 'putnala', 'vadiyalu', 'sugar', 'bellam', 'jaggery', 'mustard', 'avalu', 'jeedipappu', 'badam']

for k in keywords:
    matches = [p for p in prods if k in p.get('name', '').lower() or k in p.get('teluguName', '').lower()]
    print(f"Keyword '{k}': {len(matches)} matches")
    for m in matches[:5]:
        print(f"  {m['id']}: {m['name']} ({m.get('packSize')}) -> {m.get('image')}")
