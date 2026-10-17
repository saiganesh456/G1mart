import os
import sys
import json
import shutil
from PIL import Image, ImageDraw, ImageFilter, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POUCH_DIR = os.path.join(BASE_DIR, "public", "products", "generated_pouches")
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")
LOGO_PATH = os.path.join(BASE_DIR, "scratch_perfect_logo.png")

logo_img = Image.open(LOGO_PATH).convert("RGBA")

C_ENG = (7, 69, 34, 255)      # Deep brand green
C_TEL = (25, 45, 28, 255)     # Deep dark green
C_WT = (20, 25, 20, 255)      # Charcoal

def fit_font(text, font_path, initial_size, max_width):
    size = initial_size
    font = ImageFont.truetype(font_path, size)
    dummy_draw = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    while size > 10:
        bbox = dummy_draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        if tw <= max_width:
            return font
        size -= 1
        font = ImageFont.truetype(font_path, size)
    return font

def render_g1_label(canvas_w, canvas_h, eng_line1, eng_line2, telugu_text, weight_text):
    scale = canvas_w / 800.0
    lx1 = int(280 * scale)
    ly1 = int(282 * scale)
    lx2 = int(520 * scale)
    ly2 = int(588 * scale)
    max_txt_w = int((lx2 - lx1) - (20 * scale))

    layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Clean drop shadow
    draw.rounded_rectangle([lx1 + 2, ly1 + 3, lx2 + 2, ly2 + 4], radius=int(12 * scale), fill=(0, 0, 0, 45))
    # Crisp white card with subtle green border
    draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=int(12 * scale), fill=(255, 255, 255, 255), outline=(220, 230, 222, 255), width=int(1.5 * scale))

    # G1 Mart Logo
    target_w = int(175 * scale)
    target_h = int(logo_img.height * (target_w / logo_img.width))
    logo_scaled = logo_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    logo_x = (canvas_w - target_w) // 2
    logo_y = ly1 + int(18 * scale)
    layer.paste(logo_scaled, (logo_x, logo_y), logo_scaled)

    cx = canvas_w // 2

    # Fitted typography
    f_eng1 = fit_font(eng_line1, "arialbd.ttf", int(26 * scale), max_txt_w)
    f_eng2 = fit_font(eng_line2, "arialbd.ttf", int(22 * scale), max_txt_w) if eng_line2 else None
    tel_font_path = "C:\\Windows\\Fonts\\NirmalaB.ttf" if os.path.exists("C:\\Windows\\Fonts\\NirmalaB.ttf") else "C:\\Windows\\Fonts\\Nirmala.ttf"
    f_tel = fit_font(telugu_text, tel_font_path, int(28 * scale), max_txt_w)
    f_wt = fit_font(weight_text, "arialbd.ttf", int(16 * scale), max_txt_w)

    if eng_line2:
        draw.text((cx, ly1 + int(105 * scale)), eng_line1, fill=C_ENG, font=f_eng1, anchor="mm")
        draw.text((cx, ly1 + int(138 * scale)), eng_line2, fill=C_ENG, font=f_eng2, anchor="mm")
        draw.text((cx, ly1 + int(190 * scale)), telugu_text, fill=C_TEL, font=f_tel, anchor="mm")
    else:
        draw.text((cx, ly1 + int(120 * scale)), eng_line1, fill=C_ENG, font=f_eng1, anchor="mm")
        draw.text((cx, ly1 + int(182 * scale)), telugu_text, fill=C_TEL, font=f_tel, anchor="mm")

    draw.text((cx, ly2 - int(25 * scale)), weight_text, fill=C_WT, font=f_wt, anchor="mm")
    return layer

def build_jeevan_mart_pack(source_img_path, eng1, eng2, telugu, weight, out_pouch_name, verified_files=[]):
    img = Image.open(source_img_path).convert("RGBA")
    
    # Crop to square if not already square
    w, h = img.size
    dim = min(w, h)
    img_sq = img.crop(((w - dim) // 2, (h - dim) // 2, (w + dim) // 2, (h + dim) // 2))
    img_800 = img_sq.resize((800, 800), Image.Resampling.LANCZOS)
    
    # Render label layer
    label_layer = render_g1_label(800, 800, eng1, eng2, telugu, weight)
    
    # Composite label over image
    final_img = Image.alpha_composite(img_800, label_layer).convert("RGB")
    
    # Save to generated_pouches
    out_pouch_path = os.path.join(POUCH_DIR, out_pouch_name)
    final_img.save(out_pouch_path, "WEBP", quality=95)
    print(f"Saved: {out_pouch_path}")
    
    # Also sync to verified directory
    for vf in verified_files:
        dest_path = os.path.join(VERIFIED_DIR, vf)
        final_img.save(dest_path, "WEBP", quality=95)
        print(f"  Synced to verified: {dest_path}")

if __name__ == "__main__":
    print("=== Building Jeevan Mart Stand-up Pouches with Verified G1 Mart Branding ===")
    
    # 1. Alasandalu (Black-Eyed Peas / అలసందలు)
    build_jeevan_mart_pack(
        r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\9a6b8f7e-2607-41f5-83fd-eee09ff5b572\alasandalu_packshot_1792248370709.jpg",
        "Alasandalu",
        "(Black-Eyed Peas)",
        "అలసందలు",
        "NET WT: 1 KG",
        "g1_alasandalu_pouch.webp",
        ["g1-p1011.webp"]
    )
    
    # 2. Red Alasandalu (Red Cowpeas / ఎర్ర అలసందలు)
    build_jeevan_mart_pack(
        r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\9a6b8f7e-2607-41f5-83fd-eee09ff5b572\red_alasandalu_packshot_1792248396989.jpg",
        "Red Alasandalu",
        "(Red Cowpeas)",
        "ఎర్ర అలసందలు",
        "NET WT: 500g",
        "g1_red_alasandalu_pouch.webp",
        ["g1-red-alasandalu.webp"]
    )

    # 3. Pappula Podi (Roasted Gram Podi / పప్పుల పొడి)
    build_jeevan_mart_pack(
        r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\9a6b8f7e-2607-41f5-83fd-eee09ff5b572\pappula_podi_packshot_1792248422361.jpg",
        "Pappula Podi",
        "(Roasted Gram Podi)",
        "పప్పుల పొడి",
        "NET WT: 150g",
        "g1_pappula_podi_pouch.webp",
        ["g1-pappula-podi.webp", "g1-p0706.webp"]
    )

    # 4. Pure Telagapindi (Sesame Press Meal / తెలగపిండి)
    build_jeevan_mart_pack(
        r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\9a6b8f7e-2607-41f5-83fd-eee09ff5b572\telagapindi_packshot_1792248444241.jpg",
        "Pure Telagapindi",
        "(Sesame Press Meal)",
        "తెలగపిండి",
        "NET WT: 500g",
        "g1_telagapindi_pouch.webp",
        ["g1-p0460.webp"]
    )

    # 5. Whole Green Moong (Whole Pesalu / పచ్చ పెసలు)
    build_jeevan_mart_pack(
        r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\9a6b8f7e-2607-41f5-83fd-eee09ff5b572\pesalu_green_moong_packshot_1792248465857.jpg",
        "Green Moong Whole",
        "(Whole Pesalu)",
        "పచ్చ పెసలు",
        "NET WT: 1 KG",
        "g1_green_moong_pouch.webp",
        ["g1_pesalu_pouch.webp", "g1-p0408.webp"]
    )

    print("\nAll 5 Jeevan Mart pouches built and synchronized successfully!")

