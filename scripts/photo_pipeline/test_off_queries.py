import json
import os
import requests

def test_queries():
    headers = {"User-Agent": "G1MartCatalog/1.0 (catalog@g1mart.local)"}
    queries = [
        ("Parle", "Parle-G"),
        ("Tata", "Tata Salt"),
        ("Nestle", "Maggi 2-Minute"),
        ("Surf Excel", "Surf Excel Quick Wash"),
        ("Coca-Cola", "Thums Up"),
        ("Wipro", "Santoor Sandal"),
        ("Colgate", "Colgate Strong Teeth"),
        ("Horlicks", "Horlicks Classic Malt"),
        ("Britannia", "Good Day Cashew"),
        ("Fortune", "Fortune Sunlite Sunflower Oil"),
        ("Aachi", "Aachi Chilli Powder"),
    ]
    for brand, name in queries:
        url = "https://world.openfoodfacts.org/cgi/search.pl"
        params = {
            "search_terms": f"{brand} {name}",
            "search_simple": "1",
            "action": "process",
            "json": "1",
            "page_size": "3"
        }
        try:
            r = requests.get(url, params=params, headers=headers, timeout=5)
            if r.status_code == 200:
                data = r.json()
                products = data.get('products', [])
                print(f"Query '{brand} {name}': found {len(products)} products")
                for p in products[:1]:
                    img = p.get('image_front_url') or p.get('image_url')
                    print(f"   Match: {p.get('product_name')} | Brands: {p.get('brands')} | Img: {img}")
        except Exception as e:
            print(f"Query '{brand} {name}' failed: {e}")

if __name__ == "__main__":
    test_queries()
