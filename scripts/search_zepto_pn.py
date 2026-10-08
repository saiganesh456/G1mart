import requests
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

zepto_urls = [
    "https://www.zeptonow.com/pn/nutrela-soya-chunks-protein-rich/pvid/bb4c7fc7-62ec-4780-b2f7-e23be8a29a66",
    "https://www.zeptonow.com/pn/kelloggs-corn-flakes/pvid/f86df332-9a0d-4a11-a8d2-ecf505315f60"
]

# Let's search Zepto pages directly using Google / DuckDuckGo / Yahoo
search_queries = [
    "site:zeptonow.com/pn/ nutrela soya chunks",
    "site:zeptonow.com/pn/ kellogg corn flakes",
    "site:zeptonow.com/pn/ stayfree",
    "site:zeptonow.com/pn/ all out",
    "site:zeptonow.com/pn/ good knight",
    "site:zeptonow.com/pn/ tamarind",
    "site:zeptonow.com/pn/ huggies"
]

for q in search_queries:
    url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(q)}"
    r = requests.get(url, headers=headers, timeout=8)
    links = re.findall(r'href="(https?://[^"]*zeptonow\.com/pn/[^"]+)"', r.text)
    print(f"Query: {q} -> Found {len(links)} links")
    for l in links[:2]:
        print(" ", l)
