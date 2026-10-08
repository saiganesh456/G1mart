import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

queries = [
    "Aashirvaad Shuddh Chakki Atta packet bigbasket",
    "Cadbury 5 Star chocolate bar packshot zepto",
    "Cadbury Dairy Milk chocolate bar packshot zepto",
    "Tata Sampann Turmeric Powder packet bigbasket",
    "Tata Sampann Cumin Seeds Jeera bigbasket",
    "Catch Coriander Seeds Dhania bigbasket",
    "Tata Sampann Black Pepper bigbasket",
    "Tata Sampann Toor Dal packet 1kg bigbasket",
    "Tata Sampann Moong Dal bigbasket",
    "Tata Sampann Chana Dal bigbasket",
    "India Gate Basmati Rice Feast Rozzana bigbasket"
]

for q in queries:
    results = search_bing(q)
    print(f"\nQuery: {q} -> Found {len(results)}")
    for r in results[:3]:
        print("  ", r)
