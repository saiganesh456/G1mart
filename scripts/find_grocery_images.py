import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def find_urls(q):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(q)}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx) as r:
        html = r.read().decode('utf-8', errors='ignore')
        return re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)

queries = [
    'site:amazon.in "Aashirvaad Iodised Salt" 1kg',
    'site:bigbasket.com "Aashirvaad Salt"',
    'site:amazon.in "Parrys White Sugar" 1kg',
    'site:bigbasket.com "Sugar Free Gold"',
    'site:bigbasket.com "Dabur Honey" 500g',
    'site:bigbasket.com "Tata Salt"',
    'site:amazon.in "Puro Healthy Salt" 1kg',
    'site:bigbasket.com "Lion Honey"'
]

for q in queries:
    all_urls = find_urls(q)
    valid = [u for u in all_urls if any(d in u.lower() for d in ['amazon', 'bigbasket', 'bbassets', 'grofers', 'blinkit', 'jiomart', 'zepto', 'dmart'])]
    print(q, "--> Found valid:", len(valid))
    if valid:
        print("   URL:", valid[0])
    elif all_urls:
        print("   Other:", all_urls[0])
