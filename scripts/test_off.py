import requests

url = "https://in.openfoodfacts.org/cgi/search.pl"
params = {
    'search_terms': 'Aashirvaad',
    'search_simple': 1,
    'action': 'process',
    'json': 1,
    'page_size': 5
}

r = requests.get(url, params=params, headers={'User-Agent': 'G1Mart-ProductCatalog/1.0 (contact@g1mart.com)'}, timeout=10)
print("Status:", r.status_code)
if r.status_code == 200:
    data = r.json()
    print("Products count:", data.get('count'))
    for p in data.get('products', [])[:5]:
        print("Product:", p.get('product_name'))
        print("Image:", p.get('image_url') or p.get('image_front_url'))
