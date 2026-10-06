import urllib.request
import json

headers = {'User-Agent': 'G1Mart-App/1.0'}
url = "https://in.openfoodfacts.org/cgi/search.pl?search_terms=Mysore+Sandal&search_simple=1&action=process&json=1"

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as res:
        data = json.loads(res.read().decode('utf-8'))
        print("OpenFoodFacts products found:", data.get('count'))
        for p in data.get('products', [])[:5]:
            print(f"  {p.get('product_name')} | image: {p.get('image_url')}")
except Exception as e:
    print("Error:", e)
