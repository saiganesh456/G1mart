import urllib.request
import urllib.parse
import re
import json

def search_ddg_images(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    # Extract links
    links = re.findall(r'<a class="result__url"[^>]*href="([^"]+)"', html)
    print(f"DDG search '{query}' found {len(links)} links:")
    for l in links[:5]:
        print("  ", l)

search_ddg_images("Britannia Bourbon Biscuits 120g BigBasket JioMart")
search_ddg_images("Ariel Matic Top Load Detergent 1kg BigBasket JioMart")
