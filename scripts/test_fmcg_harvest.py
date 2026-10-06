import urllib.request
import urllib.parse
import json
import re
import ssl
import sys
import io
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def get_bing_murls(query):
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
        return []

queries = [
    ("pdf1-001", "Mysore Sandal Soap 75g", "Mysore Sandal Soap 75g Amazon India"),
    ("pdf1-002", "Mysore Sandal Soap 125g", "Mysore Sandal Soap 125g Amazon India"),
    ("pdf1-003", "Mysore Sandal Soap 150g", "Mysore Sandal Soap 150g Amazon India"),
    ("pdf1-004", "Wagh Bakri Tea 100g", "Wagh Bakri Premium Leaf Tea 100g"),
    ("pdf1-005", "Wagh Bakri Tea 250g", "Wagh Bakri Premium Leaf Tea 250g"),
    ("pdf1-006", "Wagh Bakri Tea 500g", "Wagh Bakri Premium Leaf Tea 500g"),
    ("pdf1-008", "Mysore Sandal Baby Soap 75g", "Mysore Sandal Baby Soap 75g"),
    ("pdf1-009", "Exo Dishwash Bar 60g", "Exo Touch and Shine Dishwash Bar 60g"),
    ("pdf1-010", "Exo Dishwash Bar 125g", "Exo Touch and Shine Dishwash Bar 125g"),
    ("pdf1-011", "Exo Dishwash Bar 300g", "Exo Dishwash Bar 300g"),
    ("pdf1-012", "Exo Dishwash Tub 250g", "Exo Touch and Shine Dishwash Round 250g"),
    ("pdf1-013", "Exo Dishwash Tub 500g", "Exo Touch and Shine Dishwash Round 500g"),
    ("pdf1-014", "Ujala Supreme 30ml", "Ujala Supreme Fabric Whitener 30ml"),
    ("pdf1-015", "Ujala Supreme 75ml", "Ujala Supreme Fabric Whitener 75ml"),
    ("pdf1-016", "Ujala Supreme 250ml", "Ujala Supreme Fabric Whitener 250ml"),
    ("pdf1-017", "Crisp & Shine 100g", "Crisp and Shine Fabric Stiffener 100g"),
    ("pdf1-018", "Crisp & Shine 200g", "Crisp and Shine Fabric Stiffener 200g"),
    ("pdf1-019", "Crisp & Shine 500g", "Crisp and Shine Fabric Stiffener Bottle 500g"),
    ("pdf1-023", "Medimix 18 Herbs 75g", "Medimix Ayurvedic 18 Herbs Soap 75g"),
    ("pdf1-024", "Medimix Sandal 125g", "Medimix Sandal Soap 125g"),
    ("pdf1-025", "Medimix Glycerine 125g", "Medimix Glycerine Soap 125g"),
    ("pdf1-027", "Medimix 18 Herbs 125g", "Medimix Ayurvedic 18 Herbs Soap 125g"),
    ("pdf1-028", "Mysore Sandal Gold 125g", "Mysore Sandal Gold Soap 125g"),
    ("pdf1-030", "Margo Soap 100g", "Margo Neem Soap 100g"),
    ("pdf1-064", "Henko Front Load 1L", "Henko Matic Front Load Liquid Detergent 1L"),
    ("pdf1-065", "Henko Top Load 1L", "Henko Matic Top Load Liquid Detergent 1L"),
]

for pid, name, q in queries:
    murls = get_bing_murls(q)
    # Filter for retail domains
    retail = [u for u in murls if any(d in u.lower() for d in ['media-amazon.com', 'bbassets.com', 'bigbasket.com', 'jiomart.com', 'flipkart.com', 'imimg.com', 'zepto', 'blinkit', 'reliancedigital', 'dmart'])]
    print(f"[{pid}] {name}: {len(retail)} retail matches found")
    if retail:
        print(f"  Top: {retail[0]}")
    else:
        print(f"  Fallback top: {murls[0] if murls else 'NONE'}")
