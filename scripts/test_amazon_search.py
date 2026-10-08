import urllib.request, urllib.parse, re, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def search_amazon(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
        
        amazon_urls = [u for u in murls if 'media-amazon.com' in u]
        return amazon_urls if amazon_urls else murls
    except Exception as e:
        return []

queries = {
    'jeera': 'Catch Jeera Whole Cumin Seeds 100g amazon.in',
    'coriander_powder': 'Catch Coriander Powder 200g amazon.in',
    'black_pepper': 'Catch Black Pepper Table Sprinkler 100g amazon.in',
    'garam_masala': 'MDH Garam Masala 100g amazon.in',
    'biryani_masala': 'Everest Shahi Biryani Masala amazon.in',
    'chicken_masala': 'Everest Chicken Masala 100g amazon.in'
}

for k, q in queries.items():
    urls = search_amazon(q)
    print(f"\n{k}:")
    for u in urls[:2]:
        print("  ", u)
