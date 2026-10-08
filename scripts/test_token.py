import requests
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

r = requests.get('https://www.jiomart.com/catalogsearch/result?q=aashirvaad+atta', headers=headers, timeout=10)
text = r.text

tokens = re.findall(r'["\']([A-Za-z0-9_\-\.]{50,})["\']', text)
print(f"Found {len(tokens)} token-like strings in JioMart page")
for t in tokens[:10]:
    print("Token candidate:", t[:30], "...", t[-10:])
