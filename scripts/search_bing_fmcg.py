import urllib.request, urllib.parse, re, ssl
import json
import requests
from PIL import Image
from io import BytesIO

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def search_bing_img(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
        return murls
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

targets = {
    'tamarind': 'BB Popular Tamarind bigbasket 500g',
    'soya-chunks': 'Nutrela Soya Chunks packshot white background',
    'stayfree': 'Stayfree Secure Sanitary Pads packshot white background',
    'goodknight': 'Good Knight Flash Liquid Vapouriser packshot white background',
    'huggies': 'Huggies Wonder Pants Diapers packshot white background'
}

for k, q in targets.items():
    urls = search_bing_img(q)
    print(f"\n{k} ({len(urls)} found):")
    for u in urls[:3]:
        print("  ", u)
        # Try downloading the first valid one
        try:
            r = requests.get(u, headers=headers, timeout=6)
            if r.status_code == 200 and len(r.content) > 2000:
                img = Image.open(BytesIO(r.content))
                ext = 'png' if img.mode == 'RGBA' else 'jpg'
                img.save(f'public/products/packshots/test-{k}.{ext}')
                print(f"   -> Saved test-{k}.{ext} ({img.size})")
                break
        except Exception as e:
            print(f"   -> download error: {e}")
