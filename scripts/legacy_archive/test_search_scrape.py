import urllib.request
import json
import urllib.parse
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

query = "Britannia Bourbon 120g"
url = f"https://www.jiomart.com/search/{urllib.parse.quote(query)}"

print("Fetching JioMart search:", url)
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"JioMart HTML length: {len(html)}")
        # find image URLs in HTML
        imgs = re.findall(r'https://www\.jiomart\.com/images/product/original/[a-zA-Z0-9_\-\.]+', html)
        print("Found JioMart original images:", len(imgs), imgs[:3])
except Exception as e:
    print("JioMart error:", e)

# Test BigBasket search
bb_url = f"https://www.bigbasket.com/listing-svc/v2/products?type=pc&slug={urllib.parse.quote(query)}"
print("\nFetching BigBasket:", bb_url)
try:
    req = urllib.request.Request(bb_url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("BigBasket JSON keys:", list(data.keys()))
except Exception as e:
    print("BigBasket error:", e)
