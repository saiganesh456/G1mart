import urllib.request
import urllib.parse
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://duckduckgo.com/'
}

def search_ddg_img(query):
    token_url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(token_url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    vqd_match = re.search(r'vqd=([0-9\-]+)', html) or re.search(r'vqd="([^"]+)"', html)
    if not vqd_match:
        return []
    
    vqd = vqd_match.group(1)
    i_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
    req2 = urllib.request.Request(i_url, headers=headers)
    with urllib.request.urlopen(req2, timeout=10) as resp2:
        res = json.loads(resp2.read().decode('utf-8'))
        return res.get('results', [])

queries = [
    ('g1-prod-007', 'Aachi Appalam 100g'),
    ('g1-prod-008', 'Aachi Chicken Masala 50g pack'),
    ('g1-prod-053', 'Bru Instant Coffee 50g pouch'),
    ('g1-prod-054', 'Bru Instant Coffee 1.2g sachet 2rs'),
    ('g1-prod-014', 'Aashirvaad Roasted Vermicelli 850g pack')
]

for pid, q in queries:
    results = search_ddg_img(q)
    print(f"\n=== Query: {q} ({pid}) ===")
    for r in results[:3]:
        print(f"Title: {r.get('title')}")
        print(f"Image: {r.get('image')}")
        print(f"Dims:  {r.get('width')}x{r.get('height')}")
