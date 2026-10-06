import urllib.request
import urllib.parse
import json
import re
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def search_bing_direct(q):
    encoded = urllib.parse.quote(q)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            # Extract murl and also title/desc if available
            matches = re.findall(r'\{&quot;murl&quot;:&quot;(https?://[^&]+)&quot;.*?&quot;t&quot;:&quot;([^&]+)&quot;', html)
            if not matches:
                # Fallback to simple murl
                murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
                return [(m, '') for m in murls[:10]]
            return matches[:10]
    except Exception as e:
        return []

test_items = [
    ("pdf1-001", "Mysore Sandal Soap 75g", "site:amazon.in OR site:bigbasket.com Mysore Sandal Soap 75g"),
    ("pdf1-002", "Mysore Sandal Soap 125g", "site:amazon.in OR site:bigbasket.com Mysore Sandal Soap 125g"),
    ("pdf1-003", "Mysore Sandal Soap 150g", "site:amazon.in OR site:bigbasket.com Mysore Sandal Soap 150g"),
    ("pdf1-004", "Wagh Bakri Tea 100g", "site:amazon.in OR site:bigbasket.com Wagh Bakri Leaf Tea 100g"),
    ("pdf1-005", "Wagh Bakri Tea 250g", "site:amazon.in OR site:bigbasket.com Wagh Bakri Leaf Tea 250g"),
    ("pdf1-006", "Wagh Bakri Tea 500g", "site:amazon.in OR site:bigbasket.com Wagh Bakri Leaf Tea 500g"),
    ("pdf1-008", "Mysore Sandal Baby Soap 75g", "Mysore Sandal Baby Soap 75g Bigbasket Amazon"),
    ("pdf1-009", "Exo Dishwash Bar 60g", "site:bigbasket.com Exo Dishwash Bar 60g"),
    ("pdf1-010", "Exo Dishwash Bar 125g", "site:bigbasket.com Exo Dishwash Bar 125g"),
    ("pdf1-011", "Exo Dishwash Bar 300g", "site:bigbasket.com Exo Dishwash Bar 300g"),
    ("pdf1-012", "Exo Dishwash Tub 250g", "site:bigbasket.com Exo Dishwash Tub 250g"),
    ("pdf1-013", "Exo Dishwash Tub 500g", "site:bigbasket.com Exo Dishwash Tub 500g"),
    ("pdf1-014", "Ujala Supreme 30ml", "site:bigbasket.com OR site:amazon.in Ujala Supreme 30ml"),
    ("pdf1-015", "Ujala Supreme 75ml", "site:bigbasket.com OR site:amazon.in Ujala Supreme 75ml"),
    ("pdf1-016", "Ujala Supreme 250ml", "site:bigbasket.com OR site:amazon.in Ujala Supreme 250ml"),
]

for pid, name, q in test_items:
    print(f"\n[{pid}] {name}")
    results = search_bing_direct(q)
    for murl, title in results[:4]:
        if any(d in murl.lower() for d in ['media-amazon.com', 'bbassets.com', 'jiomart', 'flipkart', 'imimg']):
            print(f"  RETAIL: {murl[:90]}... | {title[:60]}")
        else:
            print(f"  OTHER:  {murl[:90]}... | {title[:60]}")
