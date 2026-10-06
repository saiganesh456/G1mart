import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

url = "https://www.jiomart.com/search/mysore%20sandal%20soap"
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=12) as res:
        html = res.read().decode('utf-8', errors='ignore')
        
        # Look for image patterns with escaped slashes
        unescaped = html.replace('\\/', '/')
        imgs = re.findall(r'https://[^\s"\'<>]+\.(?:jpg|jpeg|webp|png)', unescaped)
        print("Images found after unescaping:", len(imgs))
        for img in list(dict.fromkeys(imgs))[:15]:
            print("  ", img)
except Exception as e:
    print("Error:", e)
