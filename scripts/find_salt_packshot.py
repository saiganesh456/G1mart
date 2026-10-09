import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image
import io

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

query = "ITC Aashirvaad Crystal Salt 1kg packet packshot transparent png"
encoded = urllib.parse.quote(query)
url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
req = urllib.request.Request(url, headers=HEADERS)
try:
    with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
        html = res.read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
        print("Found urls:", len(murls))
        for u in murls[:10]:
            print(u)
except Exception as e:
    print("Error:", e)
