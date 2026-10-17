import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

# 1. Search OpenFoodFacts
def search_off(query):
    url = f"https://in.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=5"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            for p in data.get('products', []):
                img = p.get('image_front_url') or p.get('image_url')
                name = p.get('product_name')
                if img:
                    print(f"  [OFF] {name}: {img}")
    except Exception as e:
        print(f"OFF error {query}: {e}")

# 2. Search BigBasket via public search API
def search_bb(query):
    url = f"https://www.bigbasket.com/customservice/sysetem/valparams/?type=deck&deck_id=search&slug={query}"
    try:
        r = requests.get(f"https://www.bigbasket.com/product/query/{query}/", headers=headers, timeout=10)
        print(f"  [BB] status: {r.status_code}")
    except Exception as e:
        pass

queries = ['dry dates', 'golden raisins', 'kismis', 'raw pumpkin seeds', 'watermelon seeds', 'muskmelon seeds']

for q in queries:
    print(f"\nSearching for '{q}':")
    search_off(q)
