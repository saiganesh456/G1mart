import requests
import json
from urllib.parse import quote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

queries = [
    '24 Mantra Tamarind',
    'Priya Tamarind',
    'Aachi Tamarind',
    'Catch Tamarind',
    'MTR Tamarind',
    'Dabur Hommade Tamarind Paste'
]

for q in queries:
    url = f"https://in.openfoodfacts.org/cgi/search.pl?search_terms={quote(q)}&search_simple=1&action=process&json=1&page_size=3"
    try:
        r = requests.get(url, headers={'User-Agent': 'G1Mart-Audit/2.0'}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            for p in data.get('products', []):
                print(f"[{q}] {p.get('brands')} - {p.get('product_name')}: {p.get('image_front_url')}")
    except Exception as e:
        print(f"Err {q}: {e}")
