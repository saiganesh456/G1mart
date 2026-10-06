import urllib.request
import urllib.parse
import re
import ssl
import io
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def search_bing_images(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        return []

def get_best_image(query, prefer_domains=['amazon.com', 'media-amazon', 'bigbasket', 'bbassets', 'jiomart', 'flipkart']):
    urls = search_bing_images(query)
    # Prefer trusted retail CDNs
    trusted = [u for u in urls if any(d in u.lower() for d in prefer_domains)]
    candidates = trusted + [u for u in urls if u not in trusted]
    
    for c in candidates[:8]:
        try:
            req = urllib.request.Request(c, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
                if res.status == 200:
                    data = res.read()
                    if len(data) > 25000:
                        img = Image.open(io.BytesIO(data))
                        w, h = img.size
                        if w >= 600 and h >= 600:
                            return c, w, h, len(data)
        except Exception:
            continue
    return None, 0, 0, 0

test_skus = [
    "Mysore Sandal Soap 75g India",
    "Mysore Sandal Soap 125g India",
    "Wagh Bakri Premium Leaf Tea 250g India",
    "Exo Touch & Shine Dishwash Bar 125g India",
    "Ujala Supreme Fabric Whitener 75ml India",
    "Medimix Ayurvedic 18 Herbs Classic Bath Soap 125g India",
    "Margo Neem Soap 100g India"
]

for q in test_skus:
    url, w, h, size = get_best_image(q)
    print(f"QUERY: {q}")
    if url:
        print(f"  FOUND: {w}x{h} ({size} bytes) -> {url}")
    else:
        print("  NOT FOUND")
    print("-" * 50)
