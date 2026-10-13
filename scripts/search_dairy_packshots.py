import urllib.request
import urllib.parse
import re
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def search(q):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(q)}&form=HDRSC2"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return murls
    except Exception as e:
        print(f"Error {q}: {e}")
        return []

queries = [
    "arokya toned milk pouch 500ml white background",
    "arokya full cream milk pouch 500ml white background",
    "arokya curd pouch white background",
    "dodla dairy milk pouch 500ml",
    "heritage daily health toned milk pouch",
    "amul ice cream tub vanilla magic packshot white background",
    "amul ice cream tub 1l packshot"
]

for q in queries:
    res = search(q)
    print(f"=== {q} ===")
    for u in res[:4]:
        print(" ", u)
