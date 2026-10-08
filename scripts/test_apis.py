import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'x-application-id': '685945f46c8c7aee3f3af605',
    'x-company-id': '1'
}

endpoints = [
    'https://www.jiomart.com/api/v1/catalog/search?q=aashirvaad',
    'https://www.jiomart.com/api/catalog/search?q=aashirvaad',
    'https://www.jiomart.com/api/v1/products?q=aashirvaad',
    'https://api.fynd.com/service/application/catalog/v1.0/products?q=aashirvaad',
    'https://api.fynd.com/service/application/catalog/v2.0/products?q=aashirvaad'
]

for ep in endpoints:
    try:
        r = requests.get(ep, headers=headers, timeout=5)
        print(f"{ep} -> {r.status_code} (len: {len(r.text)})")
        if r.status_code == 200:
            print("  Preview:", r.text[:200])
    except Exception as e:
        print(f"{ep} -> Error: {e}")
