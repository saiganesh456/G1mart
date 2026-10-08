import requests
import json

url = "https://in.openfoodfacts.org/cgi/search.pl?search_terms=Kurkure+Masala+Munch&search_simple=1&action=process&json=1&page_size=10"
r = requests.get(url, headers={'User-Agent': 'G1Mart-Audit/2.0'}, timeout=10)
if r.status_code == 200:
    data = r.json()
    prods = data.get('products', [])
    print(f"OFF prods: {len(prods)}")
    for p in prods:
        name = p.get('product_name')
        img = p.get('image_front_url') or p.get('image_url')
        print(f"  {name}: {img}")
