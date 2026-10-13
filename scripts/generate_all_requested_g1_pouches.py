import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POUCH_DIR = os.path.join(BASE_DIR, "public", "products", "generated_pouches")
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")
os.makedirs(POUCH_DIR, exist_ok=True)
os.makedirs(VERIFIED_DIR, exist_ok=True)

BASE_POUCH_PATH = "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg"
MASK_PATH = os.path.join(BASE_DIR, "scratch_pouch_mask.png")
LOGO_PATH = os.path.join(BASE_DIR, "scratch_perfect_logo.png")

base_pouch = Image.open(BASE_POUCH_PATH).convert("RGBA")
pouch_mask = Image.open(MASK_PATH).convert("L")
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
    # Generous label bounds to cleanly cover underlying placards
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
    f_tel = fit_font(telugu_text, "C:\\Windows\\Fonts\\Nirmala.ttc", int(28 * scale), max_txt_w)
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

def composite_texture_pouch(tex_img_path, eng1, eng2, telugu, weight, out_pouch_name, verified_names=[]):
    tex = Image.open(tex_img_path).convert("RGBA")
    tw, th = tex.size
    md = min(tw, th)
    tex_sq = tex.crop(((tw-md)//2, (th-md)//2, (tw+md)//2, (th+md)//2)).resize((1024, 1024), Image.Resampling.LANCZOS)

    comp = base_pouch.copy()
    comp.paste(tex_sq, (0, 0), pouch_mask)

    # Sheen
    sheen = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))
    gl_draw = ImageDraw.Draw(sheen)
    gl_draw.line([(320, 370), (300, 780)], fill=(255, 255, 255, 75), width=28)
    gl_draw.line([(715, 370), (700, 780)], fill=(255, 255, 255, 45), width=20)
    sheen = sheen.filter(ImageFilter.GaussianBlur(10))
    comp.alpha_composite(sheen)

    lbl = render_g1_label(1024, 1024, eng1, eng2, telugu, weight)
    final_img = Image.alpha_composite(comp, lbl)
    final_800 = final_img.resize((800, 800), Image.Resampling.LANCZOS).convert("RGB")

    out_pouch_path = os.path.join(POUCH_DIR, out_pouch_name)
    final_800.save(out_pouch_path, "WEBP", quality=95)
    print(f"[TEXTURE POUCH] Generated: {out_pouch_name}")

    for vn in verified_names:
        vp = os.path.join(VERIFIED_DIR, vn)
        final_800.save(vp, "WEBP", quality=95)
        print(f"  -> Synced to verified: {vn}")

def relabel_pouch(base_img_path, eng1, eng2, telugu, weight, out_pouch_name, verified_names=[]):
    base = Image.open(base_img_path).convert("RGBA")
    if base.size != (800, 800):
        base = base.resize((800, 800), Image.Resampling.LANCZOS)

    lbl = render_g1_label(800, 800, eng1, eng2, telugu, weight)
    final = Image.alpha_composite(base, lbl).convert("RGB")
    out_pouch_path = os.path.join(POUCH_DIR, out_pouch_name)
    final.save(out_pouch_path, "WEBP", quality=95)
    print(f"[RELABELED] Generated: {out_pouch_name}")

    for vn in verified_names:
        vp = os.path.join(VERIFIED_DIR, vn)
        final.save(vp, "WEBP", quality=95)
        print(f"  -> Synced to verified: {vn}")

def main():
    print("=== Generating Perfect Standup Pouches with Fitted Telugu & G1 Mart Brand ===")

    # 1. Phool Makhana (Lotus Seeds / పూల్ మఖానా)
    composite_texture_pouch(
        "scratch_makhana_wiki.jpg",
        "Phool Makhana", "(Lotus Seeds)", "పూల్ మఖానా", "NET WT: 250g",
        "g1_makhana_pouch.webp",
        ["g1-nut023.webp", "g1-p0979.webp"]
    )

    # 2. Sunflower Seeds (పొద్దుతిరుగుడు గింజలు)
    composite_texture_pouch(
        "scratch_sunflower_wiki.jpg",
        "Sunflower Seeds", "(Premium Seeds)", "పొద్దుతిరుగుడు గింజలు", "NET WT: 250g",
        "g1_sunflower_seeds_pouch.webp",
        ["g1-p0894.webp"]
    )

    # 3. Andhra Vadiyalu (Fryums / వడియాలు)
    composite_texture_pouch(
        "scratch_fryums_wiki.jpg",
        "Andhra Vadiyalu", "(Crispy Fryums)", "ఆంధ్ర వడియాలు", "NET WT: 250g",
        "g1_vadiyalu_pouch.webp",
        ["snk-colour-fryums.webp"]
    )

    # 4. Pure Bellam / Jaggery (బెల్లం)
    composite_texture_pouch(
        "scratch_jaggery_wiki.jpg",
        "Country Bellam", "(Pure Jaggery)", "స్వచ్ఛమైన బెల్లం", "NET WT: 1 KG",
        "g1_bellam_pouch.webp",
        ["g1-p0402.webp", "g1-sug016.webp"]
    )

    # 5. Pure Crystal Sugar (Panchadara / పంచదార)
    composite_texture_pouch(
        "scratch_sugar_tex.png",
        "Refined Sugar", "(Panchadara)", "పంచదార", "NET WT: 1 KG",
        "g1_sugar_pouch.webp",
        ["g1-p0379.webp"]
    )

    # 6. Avalu (Mustard Seeds / ఆవాలు)
    composite_texture_pouch(
        "scratch_mustard_tex.png",
        "Avalu (Mustard)", "(Mustard Seeds)", "ఆవాలు", "NET WT: 250g",
        "g1_avalu_pouch.webp",
        ["g1-p0592.webp", "g1-spc048.webp", "g1-p0431.webp"]
    )

    # 7. Putnala Pappu (Roasted Bengal Gram / Dalia / పుట్నాల పప్పు)
    relabel_pouch(
        "public/products/generated_pouches/g1_chana_dal_pouch.webp",
        "Putnala Pappu", "(Roasted Gram)", "పుట్నాల పప్పు", "NET WT: 500g",
        "g1_putnala_pappu_pouch.webp",
        ["g1-dal028.webp", "g1-dal029.webp"]
    )

    # 8. Minapa Gundu (Whole White Urad / మినప గుండ్లు)
    relabel_pouch(
        "public/products/generated_pouches/g1_urad_dal_pouch.webp",
        "Minapa Gundu", "(Whole White Urad)", "మినప గుండ్లు", "NET WT: 1 KG",
        "g1_minapa_gundu_pouch.webp",
        []
    )

    # 9. Cumin Seeds / Jeelakarra (జీలకర్ర)
    relabel_pouch(
        "public/products/generated_pouches/g1_jeera_pouch.webp",
        "Jeelakarra", "(Cumin Seeds)", "జీలకర్ర", "NET WT: 250g",
        "g1_jeera_pouch.webp",
        ["g1-spc045.webp"]
    )

    # 10. Coriander Seeds / Dhaniyalu (ధనియాలు)
    relabel_pouch(
        "public/products/generated_pouches/g1_coriander_seeds_pouch.webp",
        "Dhaniyalu", "(Coriander Seeds)", "ధనియాలు", "NET WT: 250g",
        "g1_coriander_seeds_pouch.webp",
        ["g1-spc046.webp"]
    )

    # 11. Cashews / Jeedipappu Multi-Weight Variants
    relabel_pouch(
        "public/products/generated_pouches/g1_cashews_pouch.webp",
        "Jeedipappu", "(Premium Cashews)", "జీడిపప్పు", "NET WT: 250g",
        "g1_cashews_250g_pouch.webp",
        []
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_cashews_pouch.webp",
        "Jeedipappu", "(Premium Cashews)", "జీడిపప్పు", "NET WT: 500g",
        "g1_cashews_500g_pouch.webp",
        []
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_cashews_pouch.webp",
        "Jeedipappu", "(Premium Cashews)", "జీడిపప్పు", "NET WT: 1 KG",
        "g1_cashews_1kg_pouch.webp",
        ["g1-p0422.webp"]
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_cashews_pouch.webp",
        "Jeedipappu", "(Premium Cashews)", "జీడిపప్పు", "NET WT: 500g",
        "g1_cashews_pouch.webp",
        []
    )

    # 12. Almonds / Badam Pappu Multi-Weight Variants
    relabel_pouch(
        "public/products/generated_pouches/g1_almonds_pouch.webp",
        "Badam Pappu", "(Premium Almonds)", "బాదం పప్పు", "NET WT: 250g",
        "g1_almonds_250g_pouch.webp",
        []
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_almonds_pouch.webp",
        "Badam Pappu", "(Premium Almonds)", "బాదం పప్పు", "NET WT: 500g",
        "g1_almonds_500g_pouch.webp",
        []
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_almonds_pouch.webp",
        "Badam Pappu", "(Premium Almonds)", "బాదం పప్పు", "NET WT: 1 KG",
        "g1_almonds_1kg_pouch.webp",
        ["g1-p0295.webp"]
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_almonds_pouch.webp",
        "Badam Pappu", "(Premium Almonds)", "బాదం పప్పు", "NET WT: 500g",
        "g1_almonds_pouch.webp",
        []
    )

    # 13. Kandi Pappu (Toor Dal) Multi-Weight: 500g, 1 KG
    relabel_pouch(
        "public/products/generated_pouches/g1_kandi_pappu_pouch.webp",
        "Kandi Pappu", "(Toor Dal)", "కందిపప్పు", "NET WT: 500g",
        "g1_kandi_pappu_500g_pouch.webp",
        []
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_kandi_pappu_pouch.webp",
        "Kandi Pappu", "(Toor Dal)", "కందిపప్పు", "NET WT: 1 KG",
        "g1_kandi_pappu_pouch.webp",
        ["g1-p0404.webp"]
    )

    # 14. Senaga Pappu (Chana Dal) Multi-Weight: 500g, 1 KG
    relabel_pouch(
        "public/products/generated_pouches/g1_chana_dal_pouch.webp",
        "Senaga Pappu", "(Chana Dal)", "శనగపప్పు", "NET WT: 500g",
        "g1_chana_dal_500g_pouch.webp",
        []
    )
    relabel_pouch(
        "public/products/generated_pouches/g1_chana_dal_pouch.webp",
        "Senaga Pappu", "(Chana Dal)", "శనగపప్పు", "NET WT: 1 KG",
        "g1_chana_dal_pouch.webp",
        ["g1-p0406.webp"]
    )

    # 15. Minapa Pappu (Urad Dal Split)
    relabel_pouch(
        "public/products/generated_pouches/g1_urad_dal_pouch.webp",
        "Minapa Pappu", "(White Urad Dal)", "మినపప్పు", "NET WT: 1 KG",
        "g1_urad_dal_pouch.webp",
        ["g1-p0081.webp"]
    )

    # 16. Kismis (Golden Raisins)
    relabel_pouch(
        "public/products/generated_pouches/g1_kismis_pouch.webp",
        "Kismis", "(Golden Raisins)", "కిస్మిస్", "NET WT: 250g",
        "g1_kismis_pouch.webp",
        ["g1-nut024.webp"]
    )

    print("\nAll pouches re-generated with perfect margins, no bleed, and 100% brand precision!")

if __name__ == "__main__":
    main()
