import re
import json
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

query = "Britannia Bourbon"
url = f"https://www.jiomart.com/search/{urllib.parse.quote(query)}"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# Check script tags
scripts = re.findall(r'<script[^>]*>([^<]+)</script>', html)
print(f"Total script tags: {len(scripts)}")
for idx, s in enumerate(scripts):
    if 'product' in s.lower() and ('image' in s.lower() or 'img' in s.lower() or 'mrp' in s.lower()):
        print(f"Script #{idx} mentions product/image/mrp (length {len(s)})")
        # print snippet
        matches = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', s)
        if matches:
            print(f"   Found {len(matches)} image URLs in script #{idx}:")
            for m in list(set(matches))[:3]:
                print("     ", m)

# Also check for any img src in the raw html
raw_imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Total img tags in HTML: {len(raw_imgs)}")
for r in raw_imgs[:10]:
    print("   IMG:", r)
