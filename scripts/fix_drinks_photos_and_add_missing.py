import os
import json
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
os.makedirs(VERIFIED_DIR, exist_ok=True)

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

def format_image_canvas(img, output_path, target_size=(800, 800)):
    w, h = img.size
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2), mask=resized)
    else:
        img = img.convert('RGB')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2))

    canvas.save(output_path, 'WEBP', quality=92)
    print(f"Saved {output_path} ({os.path.getsize(output_path)} B)")

def download_image(query, filename):
    out_path = os.path.join(VERIFIED_DIR, filename)
    print(f"\nDownloading for query: {query} -> {filename}")
    urls = search_bing(query)
    for u in urls[:8]:
        try:
            req = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=7) as res:
                data = res.read()
            if len(data) < 5000:
                continue
            im = Image.open(BytesIO(data))
            w, h = im.size
            if w < 100 or h < 100:
                continue
            format_image_canvas(im, out_path)
            return True
        except Exception as e:
            continue
    print(f"Failed to download for: {query}")
    return False

# 1. FIX THE 4 ERRONEOUS DRINKS PHOTOS FROM THE SCREENSHOT
FIX_PHOTOS = [
    # Fix Card 3: must be a CAN, not a bottle
    ("Thums Up 250ml tin can bigbasket packshot", "bev-thums-up-can.webp"),
    # Fix Card 8: single 250ml bottle, not Malaysian 24-pack case
    ("Sprite 250ml pet bottle single packshot bigbasket", "bev-sprite-250ml.webp"),
    # Fix Card 2: clean single 2.25L bottle without black background banner
    ("Thums Up 2.25L bottle packshot white background bigbasket", "bev-thums-up-2l.webp"),
    # Fix Card 1: single 1.25L bottle, not double bottles
    ("Thums Up 1.25L bottle packshot white background bigbasket", "bev-thums-up-1l.webp"),
]

for q, f in FIX_PHOTOS:
    download_image(q, f)

# 2. DOWNLOAD IMAGES FOR MISSING SKUs IDENTIFIED FROM USER'S LIST
NEW_SKUS = [
    # Cold Drinks & Water
    ("Sting Energy Drink 250ml bottle packshot bigbasket", "bev-sting-energy.webp"),
    ("Mirinda 250ml bottle packshot bigbasket", "bev-mirinda-250ml.webp"),
    ("Kinley Club Soda 750ml bottle packshot bigbasket", "bev-kinley-soda.webp"),
    ("Campa Cola 500ml bottle packshot", "bev-campa-cola.webp"),
    ("Campa Orange 500ml bottle packshot", "bev-campa-orange.webp"),
    ("Campa Lemon 500ml bottle packshot", "bev-campa-lemon.webp"),
    ("Bailley packaged drinking water 1L bottle packshot", "bev-bailley-water.webp"),

    # Chips & Snacks
    ("Lays Chile Limon potato chips 50g pouch packshot", "snk-lays-chile-limon.webp"),
    ("Kurkure Naughty Tomato 70g pouch packshot", "snk-kurkure-naughty-tomato.webp"),
    ("Kurkure Solid Masti Twisteez Masala packshot", "snk-kurkure-solid-masti.webp"),
    ("Pringles Texas BBQ 107g can packshot", "snk-pringles-texas-bbq.webp"),
    ("Balaji Wafers Masala Masti 50g pouch packshot", "snk-balaji-wafers-masala.webp"),
    ("Balaji Wafers Simply Salted 50g pouch packshot", "snk-balaji-wafers-salted.webp"),
    ("Yellow Diamond Rings Masala 45g pouch packshot", "snk-yellow-diamond-rings.webp"),

    # Biscuits
    ("Britannia Tiger Krunch Glucose Biscuits packshot", "bsc-britannia-tiger.webp"),
    ("Sunfeast Farmlite Digestive High Fibre Biscuits packshot", "bsc-sunfeast-farmlite.webp"),
    ("Britannia NutriChoice Oats and Millets Biscuits packshot", "bsc-nutrichoice-oats.webp"),
    ("Britannia Toastea Milk Rusk 200g packshot", "bsc-britannia-milk-rusk.webp"),
    ("Unibic Orange Splash Cookies packshot", "bsc-unibic-orange-splash.webp"),

    # Chocolates & Candy
    ("Lotte Choco Pie single pack packshot bigbasket", "swt-lotte-choco-pie.webp"),
    ("Nestle KitKat Chunky 38g bar packshot", "swt-kitkat-chunky.webp"),
    ("Nestle Bar One Chocolate Bar packshot", "swt-nestle-bar-one.webp"),
    ("Nestle Milkybar Moosha bar packshot", "swt-milkybar-moosha.webp"),
    ("Nestle Polo Mint 25g roll packshot", "swt-nestle-polo.webp"),
    ("Parle Kismi Toffee Bar packshot", "swt-parle-kismi.webp"),
    ("Parle Mango Bite Candy pouch 200g packshot", "swt-parle-mango-bite.webp"),
    ("Pulse Guava with Tangy Twist candy pouch packshot", "swt-pulse-guava.webp"),
]

for q, f in NEW_SKUS:
    download_image(q, f)

print("All image replacements and new SKU images fetched successfully.")
