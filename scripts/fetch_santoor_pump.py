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

HEADERS = {'User-Agent': 'Mozilla/5.0'}

def search(q):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(q)}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx) as r:
        return re.findall(r'"murl":"(https?://[^"]+)"', r.read().decode('utf-8', errors='ignore'))

session = rembg.new_session("u2net")
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "products", "packshots_fmcg")

for u in search("santoor liquid handwash pump bottle white background bigbasket")[:8]:
    try:
        req = urllib.request.Request(u, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            im = Image.open(BytesIO(r.read())).convert('RGB')
        if im.height > 250:
            cut = rembg.remove(im, session=session)
            bbox = cut.getbbox()
            if bbox:
                cr = cut.crop(bbox)
                cr.save(os.path.join(OUT_DIR, "santoor_handwash_pump.png"))
                print("Saved santoor_handwash_pump.png:", cr.size)
                break
    except Exception:
        pass
