import urllib.request
import urllib.parse
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://duckduckgo.com/'
}

def search_ddg_img(query):
    # Step 1: get vqd token
    token_url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(token_url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    vqd_match = re.search(r'vqd=([0-9\-]+)', html) or re.search(r'vqd="([^"]+)"', html)
    if not vqd_match:
        print("Could not find vqd token in DDG response")
        return []
    
    vqd = vqd_match.group(1)
    print("Found vqd:", vqd)
    
    # Step 2: call i.js
    i_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
    req2 = urllib.request.Request(i_url, headers=headers)
    with urllib.request.urlopen(req2, timeout=10) as resp2:
        res = json.loads(resp2.read().decode('utf-8'))
        results = res.get('results', [])
        print(f"Results for '{query}': {len(results)}")
        for r in results[:3]:
            print(f"  Title: {r.get('title')}")
            print(f"  Image: {r.get('image')} ({r.get('width')}x{r.get('height')})")
            print(f"  Source: {r.get('url')}")
        return results

search_ddg_img("Britannia Bourbon Biscuits 120g")
search_ddg_img("Ariel Matic Top Load Detergent 1kg")
