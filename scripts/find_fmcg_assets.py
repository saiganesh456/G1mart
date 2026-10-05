import urllib.request
import urllib.parse
import json
import re

def search_ddg_img(query):
    url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        links = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png)', html)
        valid = [l for l in links if any(k in l.lower() for k in ['jiomart', 'bbassets', 'zepto', 'blinkit', 'aachi', 'flipkart', 'amazon', 'dmart', 'itcstore', 'hul'])]
        return list(dict.fromkeys(valid))
    except Exception as e:
        print('Error:', e)
        return []

print('Aachi Appalam:', search_ddg_img('Aachi Appalam 100g bigbasket jiomart'))
print('Aachi Chicken Masala:', search_ddg_img('Aachi Chicken Masala 50g bigbasket jiomart'))
print('Bru Instant 50g pouch:', search_ddg_img('Bru Instant Coffee 50g pouch bigbasket jiomart'))
print('Bru Instant Sachet:', search_ddg_img('Bru Instant Coffee 1.2g sachet bigbasket'))
