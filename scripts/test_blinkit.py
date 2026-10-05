import urllib.request
import urllib.parse
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'app_client': 'consumer_web',
    'Accept': 'application/json, text/plain, */*',
    'lat': '14.4426', # Nellore coordinates!
    'lon': '79.9865',
}

endpoints = [
    'https://blinkit.com/v1/search/products?q=britannia+bourbon',
    'https://blinkit.com/v2/search/products?q=britannia+bourbon',
    'https://blinkit.com/search/products?q=britannia+bourbon',
    'https://blinkit.com/v5/search/products?q=britannia+bourbon'
]

for ep in endpoints:
    try:
        req = urllib.request.Request(ep, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            print(f"{ep}: status {resp.status}, length {len(data)}")
            try:
                js = json.loads(data.decode('utf-8'))
                print("   Keys:", list(js.keys()))
            except:
                pass
    except Exception as e:
        print(f"{ep}: error {e}")
