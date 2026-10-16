import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

prods = json.load(open('data/migrated_products.json', encoding='utf-8'))
for p in prods:
    cid = p.get('category_id') or p.get('category')
    if cid == 'sugar-salt-staples':
        print(p['id'], '|', p['name'], '|', p.get('image_url'))
