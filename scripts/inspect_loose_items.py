import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

keywords = ['jeedi', 'cashew', 'badam', 'almond', 'makhana', 'sunflower', 'sugar', 'bellam', 'jaggery', 'putnala', 'minapa', 'kandi', 'senaga', 'avalu', 'jeera', 'dhaniyalu', 'vadiyalu', 'fryums', 'pesara', 'moong']

for p in data:
    name = p.get('name', '')
    name_lower = name.lower()
    for kw in keywords:
        if kw in name_lower:
            pid = p.get('id')
            cat = p.get('category')
            img = p.get('imageUrl')
            variants = p.get('variants', [])
            print(f"{pid} | {name} | cat: {cat} | img: {img} | var_count: {len(variants)}")
            break
