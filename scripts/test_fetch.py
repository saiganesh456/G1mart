import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

def search_image_urls(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
        html = res.read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
        return murls[:5]

print("Freedom oil bottle:", search_image_urls("Freedom refined sunflower oil bottle packshot"))
print("Dry nuts bowl:", search_image_urls("mixed dry nuts bowl isolated white background"))
print("Unibic wafer:", search_image_urls("unibic wafer packshot isolated white background"))
