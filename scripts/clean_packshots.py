import os
from PIL import Image
import rembg

BASE_DIR = r"d:\web-agency-projects\G1mart"
packshots_dir = os.path.join(BASE_DIR, "public", "products", "packshots")

session = rembg.new_session('u2netp')

def ensure_transparent_png(filename, out_name):
    src = os.path.join(packshots_dir, filename)
    dst = os.path.join(packshots_dir, out_name)
    if not os.path.exists(src):
        print(f"File not found: {src}")
        return
    im = Image.open(src)
    if im.mode == 'RGBA':
        # Check if alpha is actually transparent
        extrema = im.getextrema()
        if extrema[3][0] < 255:
            print(f"{filename} already has transparency: {im.size}")
            if src != dst:
                im.save(dst, "PNG")
            return
    print(f"Removing background from {filename} -> {out_name}...")
    nobg = rembg.remove(im, session=session)
    bbox = nobg.getbbox()
    if bbox:
        cropped = nobg.crop(bbox)
        cw, ch = cropped.size
        scale = 600 / max(cw, ch)
        nw, nh = max(10, int(cw * scale)), max(10, int(ch * scale))
        resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        resized.save(dst, "PNG")
        print(f"  [OK] Saved {out_name}: {resized.size}")
    else:
        nobg.save(dst, "PNG")

# Let's ensure these key ones have transparent RGBA PNGs:
ensure_transparent_png("cadbury-5-star.png", "cadbury-5-star.png")
ensure_transparent_png("chana-dal.png", "chana-dal.png")
ensure_transparent_png("fortune-sunlite-clean.jpg", "fortune-sunlite-clean.png")
ensure_transparent_png("freedom-oil-1l.jpg", "freedom-oil-1l.png")
ensure_transparent_png("amul-milk.jpg", "amul-milk.png")
if os.path.exists(os.path.join(packshots_dir, "amul-ghee.jpg")):
    ensure_transparent_png("amul-ghee.jpg", "amul-ghee.png")
ensure_transparent_png("body-spray.png", "body-spray.png")
ensure_transparent_png("nestle-munch.jpg", "nestle-munch.png")
ensure_transparent_png("kitkat.png" if os.path.exists(os.path.join(packshots_dir, "kitkat.png")) else "nestle-munch.jpg", "nestle-munch.png")
