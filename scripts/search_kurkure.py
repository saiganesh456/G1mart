import requests
import json

headers = {'User-Agent': 'Mozilla/5.0'}

# Test Zepto search API
print("Searching Zepto...")
try:
    r = requests.get('https://api.zeptonow.com/api/v1/inventory/catalogue/search/?query=kurkure+masala+munch', headers=headers, timeout=10)
    print("Zepto status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        print("Zepto data keys:", list(data.keys()))
except Exception as e:
    print("Zepto search error:", e)

# Test Blinkit search
print("Searching Blinkit...")
try:
    r = requests.get('https://blinkit.com/v1/search?q=kurkure%20masala%20munch', headers=headers, timeout=10)
    print("Blinkit status:", r.status_code)
except Exception as e:
    print("Blinkit error:", e)

# Test JioMart
print("Searching JioMart...")
try:
    r = requests.get('https://www.jiomart.com/catalogsearch/result?q=kurkure%20masala%20munch', headers=headers, timeout=10)
    print("JioMart status:", r.status_code)
    # search for images in html
    import re
    imgs = re.findall(r'https://www\.jiomart\.com/images/product/original/[a-zA-Z0-9_\-\./]+\.jpg', r.text)
    print("JioMart images found:", len(imgs))
    for img in imgs[:5]:
        print("JioMart img:", img)
except Exception as e:
    print("JioMart error:", e)
