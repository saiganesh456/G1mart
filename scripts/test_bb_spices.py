import urllib.request, urllib.parse, re, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def search_bb(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
        bb = [u for u in murls if 'bbassets.com' in u or 'bigbasket.com' in u]
        return bb if bb else murls
    except Exception as e:
        return []

targets = {
    'jeera': 'BB Royal Cumin Seeds Jeera bigbasket',
    'coriander_whole': 'BB Royal Coriander Whole Dhania bigbasket',
    'coriander_powder': 'BB Royal Coriander Powder Dhania bigbasket',
    'black_pepper': 'BB Royal Black Pepper Whole Kali Mirch bigbasket',
    'garam_masala': 'MDH Super Garam Masala bigbasket'
}

for k, q in targets.items():
    urls = search_bb(q)
    print(f"\n{k}:")
    for u in urls[:2]:
        print("  ", u)
