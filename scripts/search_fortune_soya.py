import urllib.request, urllib.parse, re, ssl
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
        return murls
    except Exception as e:
        return []

urls = search_bing_img("Fortune Soya Badi packshot white background")
print("Found urls:", len(urls))
for u in urls[:5]:
    print(" ", u)
    try:
        r = requests.get(u, headers=headers, timeout=6)
        if r.status_code == 200 and len(r.content) > 3000:
            img = Image.open(BytesIO(r.content))
            ext = 'png' if img.mode == 'RGBA' else 'jpg'
            img.save(f'public/products/packshots/test-fortune-soya.{ext}')
            print(f"Saved test-fortune-soya.{ext} ({img.size})")
            break
    except Exception as e:
        print("  download error:", e)
