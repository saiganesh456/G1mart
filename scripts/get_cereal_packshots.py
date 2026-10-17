import urllib.request
import ssl
from PIL import Image
import io
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def download_and_save(url, dest):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
        data = resp.read()
        im = Image.open(io.BytesIO(data))
        if im.mode == 'RGBA':
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[3])
            im = bg
        else:
            im = im.convert('RGB')
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        im.save(dest, 'WEBP', quality=95)
        print(f"Saved: {dest} ({im.size})")

cereals = [
    ("https://www.bigbasket.com/media/uploads/p/l/40179976_9-kelloggs-corn-flakes-original.jpg", "public/products/packshots/kelloggs-corn-flakes.webp"),
    ("https://www.bbassets.com/media/uploads/p/l/40355961_1-quaker-rolled-oats.jpg", "public/products/packshots/quaker-oats.webp")
]

for url, dest in cereals:
    try:
        download_and_save(url, dest)
    except Exception as e:
        print(f"Failed {url}: {e}")
