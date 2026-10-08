import requests
import re
from urllib.parse import unquote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

queries = [
    'Parachute Pure Coconut Oil bigbasket',
    'Frooti Mango Drink bigbasket',
    'Horlicks Classic Malt bigbasket',
    'Hatsun Curd bigbasket',
    'Surf Excel Quick Wash Powder bigbasket',
    'Mysore Sandal Soap bigbasket'
]

for q in queries:
    url = f"https://search.yahoo.com/search?p={requests.utils.quote(q)}"
    try:
        r = requests.get(url, headers=headers, timeout=8)
        # Yahoo redirect links: RU=https%3a%2f%2f...
        matches = re.findall(r'RU=(https?%3a%2f%2f[^/]+bigbasket\.com[^/&]+)/RK', r.text)
        if not matches:
            matches = re.findall(r'href="(https?://[^"]*bigbasket\.com[^"]*)"', r.text)
        
        cleaned = [unquote(m) for m in matches if 'bigbasket.com/pd/' in unquote(m)]
        print(f"\n{q} -> status {r.status_code}, BB pd links: {len(cleaned)}")
        for l in cleaned[:2]:
            print("  ", l)
    except Exception as e:
        print(f"{q} -> Error: {e}")
