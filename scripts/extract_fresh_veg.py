import os
from PIL import Image
import rembg

BASE_DIR = r"d:\web-agency-projects\G1mart"
bg_path = os.path.join(BASE_DIR, "public", "banners", "bg_fresh_produce.jpg")
showcase_path = os.path.join(BASE_DIR, "public", "assets", "images", "g1_fresh_produce_showcase_1790614129023.jpg")
out_dir = os.path.join(BASE_DIR, "public", "products", "packshots")

session = rembg.new_session('u2netp')

im_bg = Image.open(bg_path)
w, h = im_bg.size
print(f"Loaded bg_fresh_produce.jpg ({w}x{h})")

# 1. Tomato: top left (0, 45, 155, 330)
tomato_crop = im_bg.crop((0, 45, 155, 330))
# 2. Green chilli: top (75, 0, 365, 205)
chilli_crop = im_bg.crop((75, 0, 365, 205))
# 3. Onion: top right (730, 95, 895, 230)
onion_crop = im_bg.crop((730, 95, 895, 230))
# 4. Potato: bottom right (825, 515, 990, 860)
potato_crop = im_bg.crop((825, 515, 990, 860))
# 5. Orange / fruit: (310, 210, 420, 365)
orange_crop = im_bg.crop((310, 210, 420, 365))

def process_veg(img, name, target_long=600):
    nobg = rembg.remove(img, session=session)
    bbox = nobg.getbbox()
    if bbox:
        cropped = nobg.crop(bbox)
        cw, ch = cropped.size
        scale = target_long / max(cw, ch)
        nw, nh = max(10, int(cw * scale)), max(10, int(ch * scale))
        resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        out_path = os.path.join(out_dir, f"{name}.png")
        resized.save(out_path, "PNG")
        print(f"  [OK] Saved {name}.png: size={resized.size}")
        return out_path
    else:
        print(f"  [FAIL] No bbox for {name}")
    return None

process_veg(tomato_crop, "fresh-tomato")
process_veg(potato_crop, "fresh-potato")
process_veg(onion_crop, "fresh-onion")
process_veg(chilli_crop, "fresh-green-chilli")
process_veg(orange_crop, "fresh-orange")
print("Done extracting vegetables!")
