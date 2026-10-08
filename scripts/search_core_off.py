import requests
import json

queries = [
    'Dairy Milk',
    'Cadbury 5 Star',
    'Turmeric Powder',
    'Jeera',
    'Coriander',
    'Black Pepper',
    'Fennel Seeds',
    'Fenugreek',
    'Garam Masala',
    'Aashirvaad Atta',
    'Arun Icecream',
    'Freedom Sunflower Oil'
]

for q in queries:
    url = f"https://in.openfoodfacts.org/cgi/search.pl?search_terms={requests.utils.quote(q)}&search_simple=1&action=process&json=1&page_size=8"
    try:
        r = requests.get(url, headers={'User-Agent': 'G1Mart-Audit/2.0'}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            print(f"\n=== Query: {q} (Found {len(prods)}) ===")
            for p in prods[:4]:
                name = p.get('product_name')
                brand = p.get('brands')
                img = p.get('image_front_url') or p.get('image_url')
                if img:
                    print(f"  - [{brand}] {name}: {img}")
    except Exception as e:
        print(f"Error {q}: {e}")
