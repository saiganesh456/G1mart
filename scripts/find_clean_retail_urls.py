import urllib.request, urllib.parse, re, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def search_clean(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
        
        # Prioritize Grofers (Blinkit), Zepto, Amazon, BigBasket
        trusted = [u for u in murls if any(d in u.lower() for d in ['grofers', 'zepto', 'bbassets', 'media-amazon', 'jiomart'])]
        return trusted if trusted else murls
    except Exception as e:
        return []

queries = {
    'jeera': 'Catch Jeera Whole Cumin Seeds grofers',
    'coriander_seeds': 'Catch Coriander Whole Dhania grofers',
    'coriander_powder': 'Catch Coriander Powder grofers',
    'black_pepper': 'Catch Black Pepper Table Sprinkler grofers',
    'garam_masala': 'Everest Garam Masala grofers',
    'chicken_masala': 'Everest Chicken Masala grofers',
    'biryani_masala': 'Kohinoor Biryani Masala grofers'
}

for k, q in queries.items():
    urls = search_clean(q)
    print(f"\n{k} ({q}):")
    for u in urls[:3]:
        print("  ", u)
