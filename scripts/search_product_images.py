import urllib.request
import urllib.parse
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def search_ddg_img(query):
    url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        links = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png)', html)
        valid = [l for l in links if any(k in l.lower() for k in ['jiomart', 'bbassets', 'zepto', 'blinkit', 'amazon', 'flipkart'])]
        return list(dict.fromkeys(valid))
    except Exception as e:
        print('Error:', e)
        return []

print('Mysore Sandal 75g:', search_ddg_img('Mysore Sandal soap 75g bbassets OR jiomart'))
print('Wagh Bakri 250g:', search_ddg_img('Wagh Bakri tea 250g bbassets OR jiomart'))
