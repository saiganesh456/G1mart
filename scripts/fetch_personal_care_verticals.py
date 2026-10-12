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

targets = {
    'colgate_vertical': 'colgate maxfresh toothpaste standing tube white background',
    'listerine_bottle': 'listerine cool mint mouthwash bottle white background',
    'johnsons_baby_lotion': 'johnsons baby lotion bottle pink white background',
    'johnsons_baby_powder': 'johnsons baby powder bottle white background',
    'vaseline_body_lotion': 'vaseline intensive care body lotion yellow bottle white background',
    'whisper_vertical_pack': 'whisper ultra clean sanitary pads xl plus packet white background',
    'vwash_plus_bottle': 'v wash plus intimate wash bottle white background',
    'nutella_hazelnut_jar': 'nutella hazelnut spread jar white background',
    'kissan_mixed_fruit_jam': 'kissan mixed fruit jam jar white background',
    'oreo_biscuit_pack': 'oreo original biscuit packet blue white background'
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(BASE_DIR, "public", "products", "packshots_fmcg")
session = rembg.new_session("u2net")

for name, q in targets.items():
    out_file = os.path.join(out_dir, f"{name}.png")
    if os.path.exists(out_file):
        print(f"[EXISTS] {name}.png")
        continue

    print(f"Fetching {name}...")
    urls = search_bing(q)
    for u in urls[:6]:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
                data = r.read()
            raw = Image.open(BytesIO(data)).convert('RGB')
            if raw.width < 100 or raw.height < 100:
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
            cropped.save(out_file, 'PNG')
            print(f"  [SAVED] {name}.png ({cropped.size[0]} by {cropped.size[1]})")
            break
        except Exception:
            continue
print("Vertical packshots completed.")
