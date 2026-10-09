import urllib.request
import ssl
from PIL import Image
import io
import rembg

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

url = "https://m.media-amazon.com/images/I/81CBNdk2FrL._SL1500_.jpg"
req = urllib.request.Request(url, headers=HEADERS)
with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
    data = res.read()
    orig = Image.open(io.BytesIO(data))
    print("Downloaded Amazon image size:", orig.size)
    
    # Remove background with rembg
    nobg = rembg.remove(orig)
    
    # Crop to bounding box
    bbox = nobg.split()[3].getbbox()
    if bbox:
        nobg = nobg.crop(bbox)
    
    # Place on 800x800 transparent canvas
    canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    w, h = nobg.size
    ratio = min(660 / w, 660 / h)
    nw = max(1, int(w * ratio))
    nh = max(1, int(h * ratio))
    resized = nobg.resize((nw, nh), Image.Resampling.LANCZOS)
    offset = ((800 - nw) // 2, (800 - nh) // 2)
    canvas.paste(resized, offset, resized)
    
    canvas.save("public/products/verified/g1-p0482.webp", "WEBP", quality=95)
    canvas.save("public/products/packshots/aashirvaad-crystal-salt.png", "PNG")
    print("Successfully replaced Aashirvaad Crystal Salt with pristine studio packshot!")
