import os
import json
import shutil
from PIL import Image, ImageDraw, ImageFont

BRAIN_DIR = "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894"

def make_pouch(base_img_path, eng_line1, eng_line2, telugu_text, weight_text, out_pouch_path, out_verified_path=None):
    base = Image.open(base_img_path).convert("RGBA")
    if base.size != (800, 800):
        base = base.resize((800, 800), Image.Resampling.LANCZOS)
    
    lx1, ly1 = 286, 286
    lx2, ly2 = 514, 580
    
    label_img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw = ImageDraw.Draw(label_img)
    
    # Drop shadow
    draw.rounded_rectangle([lx1 + 2, ly1 + 3, lx2 + 2, ly2 + 3], radius=10, fill=(0, 0, 0, 40))
    # Crisp white card
    draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=10, fill=(255, 255, 255, 255), outline=(230, 235, 230, 255), width=1)
    
    # Logo
    logo = Image.open("scratch_perfect_logo.png").convert("RGBA")
    lw, lh = logo.size
    target_w = 175
    target_h = int(lh * (target_w / lw))
    logo_scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
    logo_x = 400 - (target_w // 2)
    logo_y = ly1 + 18
    label_img.paste(logo_scaled, (logo_x, logo_y), logo_scaled)
    
    # Fonts
    font_eng1 = ImageFont.truetype("arialbd.ttf", 26)
    font_eng2 = ImageFont.truetype("arialbd.ttf", 23)
    font_tel = ImageFont.truetype("C:\\Windows\\Fonts\\Nirmala.ttc", 28)
    font_wt = ImageFont.truetype("arialbd.ttf", 16)
    
    c_eng = (7, 69, 34, 255)      # Deep brand green
    c_tel = (25, 45, 28, 255)     # Deep dark green
    c_wt = (20, 25, 20, 255)      # Charcoal
    
    draw = ImageDraw.Draw(label_img)
    if eng_line2:
        draw.text((400, ly1 + 105), eng_line1, fill=c_eng, font=font_eng1, anchor="mm")
        draw.text((400, ly1 + 140), eng_line2, fill=c_eng, font=font_eng2, anchor="mm")
        draw.text((400, ly1 + 192), telugu_text, fill=c_tel, font=font_tel, anchor="mm")
    else:
        draw.text((400, ly1 + 120), eng_line1, fill=c_eng, font=font_eng1, anchor="mm")
        draw.text((400, ly1 + 180), telugu_text, fill=c_tel, font=font_tel, anchor="mm")
        
    draw.text((400, ly2 - 25), weight_text, fill=c_wt, font=font_wt, anchor="mm")
    
    final_img = Image.alpha_composite(base, label_img)
    final_rgb = final_img.convert("RGB")
    
    os.makedirs(os.path.dirname(os.path.abspath(out_pouch_path)), exist_ok=True)
    final_rgb.save(out_pouch_path, "WEBP", quality=95)
    print(f"Generated pouch: {out_pouch_path}")
    
    if out_verified_path:
        os.makedirs(os.path.dirname(os.path.abspath(out_verified_path)), exist_ok=True)
        final_rgb.save(out_verified_path, "WEBP", quality=95)
        print(f"Copied to verified: {out_verified_path}")

print("=== 1. GENERATING G1 MART POUCHES ===")

# 1. Yellow Moong Dal
make_pouch(
    os.path.join(BRAIN_DIR, "yellow_moong_dal_1791880584664.jpg"),
    "Yellow Moong Dal",
    "(Pesara Pappu)",
    "పెసరపప్పు",
    "NET WT: 1 KG",
    "public/products/generated_pouches/g1_yellow_moong_dal_pouch.webp",
    "public/products/verified/g1-p0412.webp"
)

# 2. Red Lentils (Masoor Dal)
make_pouch(
    os.path.join(BRAIN_DIR, "masoor_dal_pouch_1791880607447.jpg"),
    "Red Lentils",
    "(Masoor Dal)",
    "ఎర్ర కందిపప్పు",
    "NET WT: 1 KG",
    "public/products/generated_pouches/g1_masoor_dal_pouch.webp",
    "public/products/verified/g1-p0405.webp"
)

# 3. Green Moong Whole (Mung Bean / Pesalu)
make_pouch(
    os.path.join(BRAIN_DIR, "green_moong_pouch_1791881527282.jpg"),
    "Green Moong Whole",
    "(Pesalu)",
    "పెసలు",
    "NET WT: 1 KG",
    "public/products/generated_pouches/g1_green_moong_pouch.webp",
    "public/products/verified/g1-p0408.webp"
)

# 4. Alasandalu (Black-eyed peas / Cowpeas)
make_pouch(
    os.path.join(BRAIN_DIR, "alasandalu_clean_pouch_1791881804846.jpg"),
    "Alasandalu",
    "(Black-Eyed Peas)",
    "అలసందలు",
    "NET WT: 1 KG",
    "public/products/generated_pouches/g1_alasandalu_pouch.webp",
    "public/products/verified/g1-p1011.webp"
)

# 5. Tella Bataneelu (White Dried Peas)
make_pouch(
    os.path.join(BRAIN_DIR, "white_peas_clean_pouch_1791881828705.jpg"),
    "Tella Bataneelu",
    "(White Peas)",
    "తెల్ల బఠానీలు",
    "NET WT: 1 KG",
    "public/products/generated_pouches/g1_tella_bataneelu_pouch.webp",
    "public/products/verified/g1-p0195.webp"
)

# 6. Telagapindi (Sesame Press Meal)
make_pouch(
    os.path.join(BRAIN_DIR, "telagapindi_clean_pouch_1791881850266.jpg"),
    "Telagapindi",
    "(Sesame Press)",
    "తెలగపిండి",
    "NET WT: 500 G",
    "public/products/generated_pouches/g1_telagapindi_pouch.webp",
    "public/products/verified/g1-p0460.webp"
)

# 7. Sync existing high quality pouches to verified fallbacks
shutil.copyfile("public/products/generated_pouches/g1_urad_dal_pouch.webp", "public/products/verified/g1-p0391.webp")
shutil.copyfile("public/products/generated_pouches/g1_urad_dal_pouch.webp", "public/products/verified/g1-p0081.webp")
shutil.copyfile("public/products/generated_pouches/g1_rajma_pouch.webp", "public/products/verified/g1-p1012.webp")
shutil.copyfile("public/products/generated_pouches/g1_rajma_pouch.webp", "public/products/verified/g1-p0082.webp")
shutil.copyfile("public/products/generated_pouches/g1_kabuli_chana_pouch.webp", "public/products/verified/g1-p0190.webp")
shutil.copyfile("public/products/generated_pouches/g1_kabuli_chana_pouch.webp", "public/products/verified/g1-p0191.webp")

print("=== 2. PROCESSING RICE BAGS (HD PHOTOSHOOT) ===")

# Kurnool Rice Bag
kurnool_src = os.path.join(BRAIN_DIR, "kurnool_rice_hd_bag_1791881905231.jpg")
kurnool_img = Image.open(kurnool_src).convert("RGB")
if kurnool_img.size != (800, 800):
    kurnool_img = kurnool_img.resize((800, 800), Image.Resampling.LANCZOS)
kurnool_img.save("public/products/packshots/kurnool-special-rice-25kg.webp", "WEBP", quality=95)
kurnool_img.save("public/products/packshots/kurnool-special-rice-bag.webp", "WEBP", quality=95)
kurnool_img.save("public/products/verified/g1-p0737.webp", "WEBP", quality=95)
print("Saved Kurnool Special Rice packshots")

# Sri Lalitha Rice Bag
lalitha_src = os.path.join(BRAIN_DIR, "sri_lalitha_rice_hd_1791881929734.jpg")
lalitha_img = Image.open(lalitha_src).convert("RGB")
if lalitha_img.size != (800, 800):
    lalitha_img = lalitha_img.resize((800, 800), Image.Resampling.LANCZOS)
lalitha_img.save("public/products/packshots/sri-lalitha-rice-25kg.webp", "WEBP", quality=95)
lalitha_img.save("public/products/packshots/sri-lalitha-raw-rice-25kg.webp", "WEBP", quality=95)
print("Saved Sri Lalitha Rice packshots")

print("=== 3. PROCESSING AASHIRVAAD ATTA HD PACKSHOT ===")
atta_src = os.path.join(BRAIN_DIR, "aashirvaad_atta_hd_1791882114164.jpg")
atta_img = Image.open(atta_src).convert("RGB")
# Crop tighter around pack to zoom in and eliminate excess white margins
# atta_img is 1024x1024
# Packshot is centered, rotis at bottom
w, h = atta_img.size
crop_box = (int(w * 0.08), int(h * 0.02), int(w * 0.92), int(h * 0.98))
atta_zoomed = atta_img.crop(crop_box).resize((800, 800), Image.Resampling.LANCZOS)

atta_zoomed.save("public/products/packshots/aashirvaad-atta-1kg.jpg", "JPEG", quality=95)
atta_zoomed.save("public/products/packshots/aashirvaad-atta-5kg.jpg", "JPEG", quality=95)
atta_zoomed.save("public/products/packshots/aashirvaad-atta-10kg.jpg", "JPEG", quality=95)
atta_zoomed.save("public/products/packshots/aashirvaad-atta.jpg", "JPEG", quality=95)
atta_zoomed.save("public/products/packshots/aashirvaad-atta.png", "PNG")
atta_zoomed.save("public/products/verified/g1-p1572.webp", "WEBP", quality=95)
print("Saved Aashirvaad zoomed HD packshots")

print("\nAll assets generated and positioned successfully!")
