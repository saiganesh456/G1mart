import os
import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image
from io import BytesIO

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT, 'public')
VERIFIED_DIR = os.path.join(PUBLIC_DIR, 'products', 'verified')
PACKSHOTS_DIR = os.path.join(PUBLIC_DIR, 'products', 'packshots')
COLLAGES_DIR = os.path.join(PUBLIC_DIR, 'categories', 'collages')

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

def format_image(img, out_path):
    w, h = img.size
    canvas = Image.new('RGB', (800, 800), (255, 255, 255))
    scale = min(720 / w, 720 / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    if resized.mode == 'RGBA':
        canvas.paste(resized, ((800 - nw) // 2, (800 - nh) // 2), mask=resized)
    else:
        canvas.paste(resized, ((800 - nw) // 2, (800 - nh) // 2))
    canvas.save(out_path, 'WEBP', quality=92)
    print(f"Saved {out_path} ({os.path.getsize(out_path)} B)")

FIX_TARGETS = [
    {
        'name': 'Karachi Bakery Authentic Fruit Biscuits',
        'query': 'Karachi Bakery Fruit Biscuits 250g box bigbasket',
        'file': 'bsc-karachi-fruit.webp'
    },
    {
        'name': 'Karachi Bakery Irani Chai Osmania Biscuits',
        'query': 'Karachi Bakery Osmania Biscuits 250g box bigbasket',
        'file': 'bsc-karachi-osmania.webp'
    },
    {
        'name': 'Malkist Double Chocolatey Crackers',
        'query': 'Malkist Double Chocolatey Crackers 135g blinkit bigbasket',
        'file': 'bsc-malkist-chocolate.webp'
    },
    {
        'name': 'Malkist Cappuccino Crackers',
        'query': 'Malkist Cappuccino Crackers 135g blinkit bigbasket',
        'file': 'bsc-malkist-cappuccino.webp'
    },
    {
        'name': 'Malkist Cheese Crackers',
        'query': 'Malkist Cheese Crackers 135g blinkit bigbasket',
        'file': 'bsc-malkist-cheese.webp'
    },
    {
        'name': 'Horlicks Malt Nutrition Biscuits',
        'query': 'Horlicks Nutrition Biscuits 200g bigbasket packshot',
        'file': 'bsc-horlicks-biscuits.webp'
    }
]

for t in FIX_TARGETS:
    out_path = os.path.join(VERIFIED_DIR, t['file'])
    print(f"\nFetching {t['name']} -> {t['file']}")
    urls = search_bing(t['query'])
    downloaded = False
    for u in urls[:8]:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=7) as res:
                data = res.read()
            if len(data) < 5000:
                continue
            im = Image.open(BytesIO(data))
            # Basic check to avoid extreme aspect ratio
            w, h = im.size
            if w / h > 2.5 or h / w > 2.5:
                continue
            format_image(im, out_path)
            downloaded = True
            break
        except Exception as e:
            continue
    if not downloaded:
        print(f"Failed to fetch for {t['name']}")
