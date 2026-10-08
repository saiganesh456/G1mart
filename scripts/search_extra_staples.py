import requests
import json

items = [
    'Tamarind',
    'Nutrela Soya Chunks',
    'Fortune Soya Chunks',
    'Kelloggs Corn Flakes',
    'Gulab Jamun MTR'
]

for item in items:
    url = f"https://in.openfoodfacts.org/cgi/search.pl?search_terms={requests.utils.quote(item)}&search_simple=1&action=process&json=1&page_size=5"
    try:
        r = requests.get(url, headers={'User-Agent': 'G1Mart-Bot/2.0'}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            print(f"\nItem: {item} ({len(prods)} found)")
            for p in prods[:3]:
                name = p.get('product_name')
                brand = p.get('brands')
                front = p.get('image_front_url')
                img = p.get('image_url')
                print(f"  [{brand}] {name}: front={front} img={img}")
    except Exception as e:
        print(f"Error {item}: {e}")
