import urllib.request
import urllib.parse
import json

def test_off(query):
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={urllib.parse.quote(query)}&search_simple=1&action=process&json=1&page_size=5"
    headers = {'User-Agent': 'G1Mart-CatalogPipeline/1.0 (contact@g1mart.in)'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"OFF search '{query}': count={data.get('count')}")
            for p in data.get('products', [])[:3]:
                print(f"  Name: {p.get('product_name')}")
                print(f"  Brand: {p.get('brands')}")
                print(f"  Quantity: {p.get('quantity')}")
                print(f"  Image: {p.get('image_front_url')}")
    except Exception as e:
        print(f"OFF error '{query}': {e}")

test_off("Maggi 2-Minute Noodles Masala")
test_off("Britannia Bourbon")
test_off("Parle-G")
test_off("Tata Salt")
test_off("Bru Instant")
