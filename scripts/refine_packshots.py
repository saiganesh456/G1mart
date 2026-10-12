import os
from PIL import Image
import rembg

BASE_DIR = r"d:\web-agency-projects\G1mart"
bg_path = os.path.join(BASE_DIR, "public", "banners", "bg_fresh_produce.jpg")
showcase_path = os.path.join(BASE_DIR, "public", "assets", "images", "g1_fresh_produce_showcase_1790614129023.jpg")
onions_path = os.path.join(BASE_DIR, "public", "products", "verified", "g1-p0236.webp")
out_dir = os.path.join(BASE_DIR, "public", "products", "packshots")

session = rembg.new_session('u2netp')

# 1. Onions from g1-p0236.webp
im_onions = Image.open(onions_path)
nobg_onions = rembg.remove(im_onions, session=session)
bbox_onions = nobg_onions.getbbox()
if bbox_onions:
    crop_onions = nobg_onions.crop(bbox_onions)
    crop_onions.thumbnail((600, 600), Image.Resampling.LANCZOS)
    crop_onions.save(os.path.join(out_dir, "fresh-onion.png"), "PNG")
    print(f"Saved fresh-onion.png: {crop_onions.size}")

# 2. Tomato from showcase (1200x896)
im_showcase = Image.open(showcase_path)
# Crop around the tomato vine on the left of cutting board: x=(110, 350) to (490, 720)
crop_tom = im_showcase.crop((110, 350, 490, 720))
nobg_tom = rembg.remove(crop_tom, session=session)
bbox_tom = nobg_tom.getbbox()
if bbox_tom:
    crop_tom = nobg_tom.crop(bbox_tom)
    scale = 600 / max(crop_tom.size)
    crop_tom = crop_tom.resize((int(crop_tom.width * scale), int(crop_tom.height * scale)), Image.Resampling.LANCZOS)
    crop_tom.save(os.path.join(out_dir, "fresh-tomato.png"), "PNG")
    print(f"Saved fresh-tomato.png: {crop_tom.size}")

# 3. Potato from bg_fresh_produce (1200x800)
# Potatoes at bottom right: x=825, y=520, w=160, h=330
im_bg = Image.open(bg_path)
crop_pot = im_bg.crop((825, 520, 980, 850))
nobg_pot = rembg.remove(crop_pot, session=session)
bbox_pot = nobg_pot.getbbox()
if bbox_pot:
    crop_pot = nobg_pot.crop(bbox_pot)
    scale = 600 / max(crop_pot.size)
    crop_pot = crop_pot.resize((int(crop_pot.width * scale), int(crop_pot.height * scale)), Image.Resampling.LANCZOS)
    crop_pot.save(os.path.join(out_dir, "fresh-potato.png"), "PNG")
    print(f"Saved fresh-potato.png: {crop_pot.size}")

# 4. Green chilli / cucumber from showcase:
# Fresh cucumber in center of showcase: x=320, y=440, w=260, h=280
crop_cuc = im_showcase.crop((320, 440, 580, 720))
nobg_cuc = rembg.remove(crop_cuc, session=session)
bbox_cuc = nobg_cuc.getbbox()
if bbox_cuc:
    crop_cuc = nobg_cuc.crop(bbox_cuc)
    scale = 600 / max(crop_cuc.size)
    crop_cuc = crop_cuc.resize((int(crop_cuc.width * scale), int(crop_cuc.height * scale)), Image.Resampling.LANCZOS)
    crop_cuc.save(os.path.join(out_dir, "fresh-green-chilli.png"), "PNG")
    print(f"Saved fresh-green-chilli.png (fresh cucumber/chilli): {crop_cuc.size}")

# 5. Clean Coca-Cola (remove red curtain from packshots/coca-cola.png)
im_coke = Image.open(os.path.join(out_dir, "coca-cola.png"))
nobg_coke = rembg.remove(im_coke, session=session)
bbox_coke = nobg_coke.getbbox()
if bbox_coke:
    crop_coke = nobg_coke.crop(bbox_coke)
    scale = 600 / max(crop_coke.size)
    crop_coke = crop_coke.resize((int(crop_coke.width * scale), int(crop_coke.height * scale)), Image.Resampling.LANCZOS)
    crop_coke.save(os.path.join(out_dir, "coca-cola.png"), "PNG")
    print(f"Saved clean coca-cola.png: {crop_coke.size}")

# 6. Clean KitKat (remove watermark from g1-p0211.webp)
im_kitkat = Image.open(os.path.join(BASE_DIR, "public", "products", "verified", "g1-p0211.webp"))
# Crop bottom 12% to remove the alamy watermark strip
kw, kh = im_kitkat.size
clean_kit = im_kitkat.crop((0, 0, kw, int(kh * 0.88)))
nobg_kit = rembg.remove(clean_kit, session=session)
bbox_kit = nobg_kit.getbbox()
if bbox_kit:
    clean_kit = nobg_kit.crop(bbox_kit)
    scale = 600 / max(clean_kit.size)
    clean_kit = clean_kit.resize((int(clean_kit.width * scale), int(clean_kit.height * scale)), Image.Resampling.LANCZOS)
    clean_kit.save(os.path.join(out_dir, "kitkat.png"), "PNG")
    print(f"Saved clean kitkat.png: {clean_kit.size}")
