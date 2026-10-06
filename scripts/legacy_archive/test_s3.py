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

scripts = re.findall(r'<script[^>]*>([^<]+)</script>', html)
s3 = scripts[3]

# Search for image URLs in script 3
urls = re.findall(r'https://cdn1\.jiomartjcp\.com[^\s"\'<>\\]+', s3)
print(f"Found {len(urls)} CDN URLs in Script 3:")
for u in list(set(urls))[:10]:
    print("  ", u)

# Search for product names or mrp
names = re.findall(r'"name":"([^"]+)"', s3)
print(f"\nFound {len(names)} 'name' fields:")
for n in list(set(names))[:10]:
    print("  ", n)
