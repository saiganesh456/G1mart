import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

url = "https://www.jiomart.com/search/mysore%20sandal%20soap"
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as res:
        html = res.read().decode('utf-8', errors='ignore')
        print("Page length:", len(html))
        # Look for any image urls
        all_imgs = re.findall(r'https://[^\s"\'<>]+\.(?:jpg|jpeg|webp)', html)
        print("Found image URLs:", len(all_imgs))
        for img in list(dict.fromkeys(all_imgs))[:10]:
            print("  ", img)
except Exception as e:
    print("Error:", e)
