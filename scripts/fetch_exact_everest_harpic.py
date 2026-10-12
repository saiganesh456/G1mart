import urllib.request
import urllib.parse
import re
import ssl
import os
import sys
from io import BytesIO
from PIL import Image
import rembg

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return murls
    except Exception as e:
        return []

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "public", "products", "packshots_fmcg")
session = rembg.new_session("u2net")

TARGETS = {
    "real_everest_tikhalal": [
        "everest tikhalal chilli powder packet red white background bigbasket",
        "everest tikhalal red chilli powder carton white background",
        "everest tikhalal chilli powder packshot"
    ],
    "real_harpic_power_plus": [
        "harpic disinfectant toilet cleaner original blue 500ml bottle white background",
        "harpic power plus 10x max clean blue bottle white background",
        "harpic toilet cleaner blue bottle white background"
    ],
    "real_kitkat_vertical": [
        "nestle kitkat 4 finger chocolate bar vertical packshot white background",
        "kitkat 4 finger chocolate bar red pack white background",
        "nestle kitkat chocolate packet vertical white background"
    ],
    "real_colgate_box": [
        "colgate strong teeth dental cream toothpaste carton box vertical white background",
        "colgate strong teeth toothpaste packshot bigbasket",
        "colgate dental cream toothpaste carton red white background"
    ]
}

for name, queries in TARGETS.items():
    print(f"Searching for {name}...")
    urls = []
    for q in queries:
        urls.extend(search_bing(q)[:4])
    
    saved = False
    for u in urls[:12]:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
                data = r.read()
            raw = Image.open(BytesIO(data)).convert('RGB')
            if raw.width < 120 or raw.height < 120:
                continue
            cutout = rembg.remove(raw, session=session)
            bbox = cutout.getbbox()
            if not bbox:
                continue
            bw = bbox[2] - bbox[0]
            bh = bbox[3] - bbox[1]
            if bw < 50 or bh < 50:
                continue
            cropped = cutout.crop(bbox)
            out_p = os.path.join(OUT_DIR, f"{name}.png")
            cropped.save(out_p, "PNG")
            print(f"  [SAVED] {name}.png ({cropped.size[0]}x{cropped.size[1]}) from {u[:50]}...")
            saved = True
            break
        except Exception:
            continue
    if not saved:
        print(f"  [FAILED] Could not get {name}")

print("\nDone fetching exact packshots.")
