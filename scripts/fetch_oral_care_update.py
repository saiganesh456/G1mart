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

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

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

session = rembg.new_session("u2net")
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "products", "packshots_fmcg")

# 1. Vertical Colgate tube/box with clear branding
for u in search_bing("colgate maxfresh standing tube red white background bigbasket")[:8]:
    try:
        req = urllib.request.Request(u, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            im = Image.open(BytesIO(r.read())).convert('RGB')
        if im.height > 250:
            cut = rembg.remove(im, session=session)
            bbox = cut.getbbox()
            if bbox:
                cr = cut.crop(bbox)
                cr.save(os.path.join(OUT_DIR, "vertical_colgate_bold.png"))
                print("Saved vertical_colgate_bold.png:", cr.size)
                break
    except Exception:
        pass

# 2. Oral-B Toothbrush packshot
for u in search_bing("oral b toothbrush pack white background bigbasket")[:8]:
    try:
        req = urllib.request.Request(u, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            im = Image.open(BytesIO(r.read())).convert('RGB')
        if im.height > 250:
            cut = rembg.remove(im, session=session)
            bbox = cut.getbbox()
            if bbox:
                cr = cut.crop(bbox)
                cr.save(os.path.join(OUT_DIR, "oral_b_toothbrush.png"))
                print("Saved oral_b_toothbrush.png:", cr.size)
                break
    except Exception:
        pass

print("Oral care update done.")
