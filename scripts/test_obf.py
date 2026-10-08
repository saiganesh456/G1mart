import requests

brands = ['Colgate', 'Santoor', 'Mysore Sandal', 'Cinthol', 'Lux', 'Pears', 'Dettol', 'Lifebuoy', 'Dove', 'Vim']

for b in brands:
    url = "https://in.openbeautyfacts.org/cgi/search.pl"
    params = {
        'search_terms': b,
        'search_simple': 1,
        'action': 'process',
        'json': 1,
        'page_size': 3
    }
    try:
        r = requests.get(url, params=params, headers={'User-Agent': 'G1Mart-App/1.0'}, timeout=5)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            print(f"Brand: {b} -> Found {data.get('count')} products")
            for p in prods[:2]:
                print(f"  - {p.get('product_name')} : {p.get('image_front_url') or p.get('image_url')}")
    except Exception as e:
        print(f"Error {b}: {e}")
