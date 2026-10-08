import requests

url = "https://in.openfoodfacts.org/cgi/search.pl"
params = {
    'search_terms': 'Lays',
    'search_simple': 1,
    'action': 'process',
    'json': 1,
    'page_size': 20
}

r = requests.get(url, params=params, headers={'User-Agent': 'G1Mart-App/1.0'}).json()
for p in r.get('products', []):
    name = p.get('product_name')
    img = p.get('image_front_url') or p.get('image_url')
    if img:
        print(f"{name} -> {img}")
