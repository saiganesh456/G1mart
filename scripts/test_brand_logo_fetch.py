import os
import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image
import io

os.makedirs("public/brands", exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

def search_logo(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"Error querying {query}: {e}")
        return []

def download_and_process_logo(url, out_path):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            data = res.read()
            img = Image.open(io.BytesIO(data))
            img = img.convert("RGBA")
            
            # Make square canvas (200x200) with padding
            canvas = Image.new("RGBA", (200, 200), (255, 255, 255, 0))
            w, h = img.size
            ratio = min(170 / w, 170 / h)
            nw = max(1, int(w * ratio))
            nh = max(1, int(h * ratio))
            resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
            offset = ((200 - nw) // 2, (200 - nh) // 2)
            canvas.paste(resized, offset, resized)
            canvas.save(out_path, "PNG")
            return True
    except Exception as e:
        return False

# Test for Aashirvaad
urls = search_logo("Aashirvaad logo transparent png")
print("Aashirvaad URLs found:", len(urls))
success = False
for u in urls[:5]:
    if download_and_process_logo(u, "public/brands/aashirvaad.png"):
        print(f"Successfully saved Aashirvaad logo from {u[:60]}...")
        success = True
        break

if not success:
    print("Could not download Aashirvaad logo from first 5 URLs")
