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
        print(f"Error searching '{query}':", e)
        return []

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "public", "products", "packshots_fmcg")
session = rembg.new_session("u2net")

TARGETS = {
    "hd_aashirvaad_atta": [
        "https://www.bigbasket.com/media/uploads/p/l/126906_8-aashirvaad-atta-whole-wheat.jpg",
        "aashirvaad superior mp chakki atta 5kg front packshot white background bigbasket",
        "aashirvaad shudh chakki atta 10kg packet white background",
        "aashirvaad atta packet bright white background"
    ],
    "hd_thums_up_bottle": [
        "https://www.bigbasket.com/media/uploads/p/l/251006_12-thums-up-soft-drink.jpg",
        "thums up soft drink bottle 750ml white background bigbasket",
        "thums up bottle 1.25l white background",
        "thums up cold drink bottle packshot"
    ],
    "hd_maaza_bottle": [
        "https://www.bigbasket.com/media/uploads/p/l/251044_6-maaza-mango-drink.jpg",
        "maaza mango drink bottle 1.2l white background bigbasket",
        "maaza mango drink 600ml bottle white background",
        "frooti mango drink bottle 1.2l white background"
    ],
    "hd_everest_tikhalal_box": [
        "https://www.bigbasket.com/media/uploads/p/l/206778_7-everest-chilli-powder-tikhalal.jpg",
        "everest tikhalal chilli powder carton box red white background",
        "everest tikhalal 100g red box white background",
        "everest tikhalal red chilli powder front packshot"
    ],
    "hd_dettol_soap_bar": [
        "https://www.bigbasket.com/media/uploads/p/l/266961_16-dettol-bathing-soap-bar-original.jpg",
        "dettol original bathing soap bar green packshot white background",
        "dettol soap bar green angled 3d white background",
        "dettol soap 125g pack white background bigbasket"
    ],
    "hd_amul_icecream_tub": [
        "https://www.bigbasket.com/media/uploads/p/l/40013014_5-amul-gold-ice-cream-vanilla-magic.jpg",
        "amul ice cream tub 1l white background bigbasket",
        "havmor ice cream tub vanilla white background",
        "amul vanilla magic ice cream tub packshot"
    ],
    "hd_tata_salt_bright": [
        "https://www.bigbasket.com/media/uploads/p/l/241600_7-tata-salt-iodized.jpg",
        "tata salt 1kg packet bright white background bigbasket",
        "tata salt desh ka namak packshot white background",
        "tata salt packet front packshot"
    ]
}

for name, candidates in TARGETS.items():
    print(f"Fetching {name}...")
    urls = []
    for c in candidates:
        if c.startswith("http://") or c.startswith("https://"):
            urls.append(c)
        else:
            urls.extend(search_bing(c)[:3])

    saved = False
    for u in urls[:10]:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
                data = r.read()
            raw = Image.open(BytesIO(data)).convert('RGB')
            if raw.width < 150 or raw.height < 150:
                continue
            cutout = rembg.remove(raw, session=session)
            bbox = cutout.getbbox()
            if not bbox:
                continue
            bw = bbox[2] - bbox[0]
            bh = bbox[3] - bbox[1]
            if bw < 80 or bh < 80:
                continue
            cropped = cutout.crop(bbox)
            out_p = os.path.join(OUT_DIR, f"{name}.png")
            cropped.save(out_p, "PNG")
            print(f"  [SAVED] {name}.png ({cropped.size[0]}x{cropped.size[1]}) from {u[:55]}...")
            saved = True
            break
        except Exception as e:
            continue
    if not saved:
        print(f"  [FAILED] {name}")

print("\nUltra-HD assets fetching completed.")
