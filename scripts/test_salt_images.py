import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return murls
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

queries = [
    "Tata Salt Vacuum Evaporated Iodised Salt 1kg packshot",
    "Aashirvaad Iodised Salt 1kg packshot pouch",
    "Aashirvaad Crystal Salt 1kg Kallu Uppu packshot",
    "Parrys Pure Refined Sugar 1kg packet",
    "Sugar Free Gold Pellets 100",
    "Dabur Pure Honey 500g bottle",
    "Patanjali Pure Honey 500g bottle",
    "Puro Himalayan Pink Rock Salt 1kg pouch",
    "Catch Table Salt Sprinkler 200g",
    "Lion Honey 500g bottle"
]

for q in queries:
    res = search_bing(q)
    print(q, "--> Found:", len(res), res[0] if res else "None")
