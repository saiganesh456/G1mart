import urllib.request
import urllib.parse
import re
import ssl
import io
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

RETAIL_DOMAINS = [
    'media-amazon.com',
    'images-eu.ssl-images-amazon.com',
    'bbassets.com',
    'bigbasket.com',
    'jiomart.com',
    'flixcart.com',
    'grofers.com',
    'blinkit.com',
    'zepto',
    'imimg.com',
    'dmart.in',
    'apollopharmacy.in',
    'netmeds.com',
    'mysoresandal.co.in',
    'waghbakritea.com',
    'jyothylabs.com',
    'medimixayurveda.com'
]

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception:
        return []

def find_retail_packshot(product_name, pack_size, extra_terms=""):
    queries = [
        f"{product_name} {pack_size} {extra_terms}".strip(),
        f"{product_name} {pack_size} grocery packshot India",
        f"{product_name} {pack_size} BigBasket",
        f"{product_name} {pack_size} Amazon India"
    ]
    
    seen_urls = set()
    for q in queries:
        urls = search_bing(q)
        for u in urls:
            if u in seen_urls:
                continue
            seen_urls.add(u)
            # Check domain
            if any(d in u.lower() for d in RETAIL_DOMAINS):
                # Download and check size
                try:
                    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
                        if res.status == 200:
                            data = res.read()
                            if len(data) >= 20000:
                                img = Image.open(io.BytesIO(data))
                                w, h = img.size
                                if w >= 450 and h >= 450:
                                    return u, w, h, len(data), q
                except Exception:
                    continue
    return None, 0, 0, 0, None

test_skus = [
    ("pdf1-001", "Mysore Sandal Soap", "75g"),
    ("pdf1-002", "Mysore Sandal Soap", "125g"),
    ("pdf1-003", "Mysore Sandal Soap", "150g"),
    ("pdf1-004", "Wagh Bakri Premium Leaf Tea", "100g"),
    ("pdf1-005", "Wagh Bakri Premium Leaf Tea", "250g"),
    ("pdf1-006", "Wagh Bakri Premium Leaf Tea", "500g"),
    ("pdf1-008", "Mysore Sandal Baby Soap", "75g"),
    ("pdf1-009", "Exo Touch & Shine Dishwash Bar", "60g"),
    ("pdf1-010", "Exo Touch & Shine Dishwash Bar", "125g"),
    ("pdf1-011", "Exo Touch & Shine Dishwash Bar", "300g"),
    ("pdf1-012", "Exo Touch & Shine Dishwash Round Tub", "250g"),
    ("pdf1-013", "Exo Touch & Shine Dishwash Round Tub", "500g"),
    ("pdf1-014", "Ujala Supreme Fabric Whitener", "30ml"),
    ("pdf1-015", "Ujala Supreme Fabric Whitener", "75ml"),
    ("pdf1-016", "Ujala Supreme Fabric Whitener", "250ml"),
    ("pdf1-023", "Medimix Ayurvedic 18 Herbs Bath Soap", "75g"),
    ("pdf1-024", "Medimix Ayurvedic Sandal Bath Soap", "125g"),
    ("pdf1-025", "Medimix Ayurvedic Glycerine Soap", "125g"),
    ("pdf1-027", "Medimix Ayurvedic 18 Herbs Bath Soap", "125g"),
    ("pdf1-028", "Mysore Sandal Gold Soap", "125g"),
    ("pdf1-030", "Margo Neem Soap", "100g"),
    ("pdf1-064", "Henko Matic Front Load Liquid Detergent", "1 L"),
    ("pdf1-065", "Henko Matic Top Load Liquid Detergent", "1 L"),
    ("pdf1-074", "Mysore Sandal Talcum Powder", "100g"),
    ("pdf1-075", "Mysore Sandal Talcum Powder", "300g"),
]

for pid, name, pack in test_skus:
    url, w, h, size, q = find_retail_packshot(name, pack)
    print(f"[{pid}] {name} ({pack}):")
    if url:
        print(f"  FOUND: {w}x{h} ({size} bytes) via query '{q}'")
        print(f"  URL: {url}")
    else:
        print("  NOT FOUND")
    print("-" * 50)
