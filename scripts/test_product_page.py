import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = "https://www.jiomart.com/p/groceries/ariel-matic-top-load-detergent-powder-1-kg/491317352"
print("Testing JioMart product page:", url)
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        # Find og:image or twitter:image or large product image
        og_img = re.search(r'<meta property="og:image" content="([^"]+)"', html)
        if og_img:
            print("Found og:image:", og_img.group(1))
        # Find any large image URL
        imgs = re.findall(r'https://[^\s"\'<>]+\.(?:jpg|jpeg|png)', html)
        prod_imgs = [i for i in imgs if 'product' in i or 'item' in i]
        print("Product images found:", len(prod_imgs))
        for p in list(set(prod_imgs))[:5]:
            print("  ", p)
except Exception as e:
    print("Error:", e)
