import requests
import json

targets = [
    ('tamarind', 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=Tamarind+500g&search_simple=1&action=process&json=1&page_size=5'),
    ('soya_chunks', 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=Nutrela+Soya+Chunks&search_simple=1&action=process&json=1&page_size=5'),
    ('corn_flakes', 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=Kelloggs+Corn+Flakes&search_simple=1&action=process&json=1&page_size=5'),
    ('all_out', 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=All+Out+mosquito&search_simple=1&action=process&json=1&page_size=5'),
    ('stayfree', 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=Stayfree&search_simple=1&action=process&json=1&page_size=5'),
    ('huggies', 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=Huggies&search_simple=1&action=process&json=1&page_size=5')
]

for label, url in targets:
    try:
        r = requests.get(url, headers={'User-Agent': 'G1Mart-Audit/2.0'}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            print(f"=== {label} ({len(prods)}) ===")
            for p in prods[:3]:
                name = p.get('product_name')
                brand = p.get('brands')
                front = p.get('image_front_url')
                img = p.get('image_url')
                print(f"  [{brand}] {name}: front={front}")
    except Exception as e:
        print(f"Error {label}: {e}")
