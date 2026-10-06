import urllib.request
import urllib.parse
import json
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def search_jiomart(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.jiomart.com/search/{encoded}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            # Look for product card images: e.g. https://www.jiomart.com/images/product/original/... or similar
            imgs = re.findall(r'https://www\.jiomart\.com/images/product/[^\s"\'<>]+\.(?:jpg|jpeg|webp|png)', html)
            if not imgs:
                imgs = re.findall(r'https://[^\s"\'<>]+\.jiomart\.com/[^\s"\'<>]+\.(?:jpg|jpeg|webp|png)', html)
            return list(dict.fromkeys(imgs))
    except Exception as e:
        return []

queries = [
    ("Mysore Sandal Soap 75g", "Mysore Sandal 75g"),
    ("Mysore Sandal Soap 125g", "Mysore Sandal 125g"),
    ("Wagh Bakri Tea 250g", "Wagh Bakri 250g"),
    ("Exo Dishwash Bar 125g", "Exo bar 125g"),
    ("Ujala Supreme 75ml", "Ujala Supreme 75ml"),
    ("Medimix Ayurvedic Soap 125g", "Medimix 125g"),
    ("Margo Soap 100g", "Margo 100g")
]

for label, q in queries:
    found = search_jiomart(q)
    print(f"\n{label} ({len(found)} images found):")
    for img in found[:3]:
        print("  ", img)
