import requests
import json
import sys

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = "https://www.bigbasket.com/listing-svc/v2/products?type=pc&slug=all&page=1&tab_type=[%22all%22]&sorted_on=relevance&q=kurkure+masala+munch"
r = requests.get(url, headers=headers, timeout=10)
print("Status:", r.status_code)
if r.status_code == 200:
    data = r.json()
    tabs = data.get('tabs', [])
    for t in tabs:
        prods = t.get('product_info', {}).get('products', [])
        for p in prods[:5]:
            desc = p.get('desc')
            brand = p.get('brand', {}).get('name')
            images = p.get('images', [])
            print(f"Product: {brand} - {desc}")
            for img in images:
                print(f"  img: {img.get('l')}")
