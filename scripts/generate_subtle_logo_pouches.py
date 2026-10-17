import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POUCH_DIR = os.path.join(BASE_DIR, "public", "products", "generated_pouches")
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")
PACKSHOT_DIR = os.path.join(BASE_DIR, "public", "products", "packshots")

BASE_POUCH_PATH = "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg"
MASK_PATH = os.path.join(BASE_DIR, "scratch_pouch_mask.png")
LOGO_PATH = os.path.join(BASE_DIR, "public", "assets", "images", "g1_mart_banner_transparent.png")

base_pouch = Image.open(BASE_POUCH_PATH).convert("RGBA")
pouch_mask = Image.open(MASK_PATH).convert("L")
logo_img = Image.open(LOGO_PATH).convert("RGBA")

# Colors
C_ENG = (7, 69, 34, 255)      # Deep brand green
C_TEL = (25, 45, 28, 255)     # Deep dark green
C_WT = (40, 50, 45, 255)      # Charcoal

def fit_font(text, font_path, initial_size, max_width):
    size = initial_size
    font = ImageFont.truetype(font_path, size)
    dummy_draw = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    while size > 9:
        bbox = dummy_draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        if tw <= max_width:
            return font
        size -= 1
        font = ImageFont.truetype(font_path, size)
    return font

def render_small_g1_label(canvas_w, canvas_h, eng_line1, eng_line2, telugu_text, weight_text):
    """
    Renders a compact, sleek badge at the upper-middle of the pouch with a SMALL logo
    as requested by user, leaving 85%+ of the transparent window crystal clear.
    """
    scale = canvas_w / 800.0
    
    # Compact label bounds: narrower & shorter so window is wide open
    lx1 = int(295 * scale)
    ly1 = int(295 * scale)
    lx2 = int(505 * scale)
    ly2 = int(555 * scale)
    max_txt_w = int((lx2 - lx1) - (16 * scale))

    layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Clean subtle drop shadow
    draw.rounded_rectangle([lx1 + 2, ly1 + 2, lx2 + 2, ly2 + 3], radius=int(10 * scale), fill=(0, 0, 0, 35))
    # Crisp white card with subtle green-grey border
    draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=int(10 * scale), fill=(255, 255, 255, 253), outline=(215, 228, 220, 255), width=int(1.5 * scale))

    # G1 Mart Small Logo (105px wide, compact and refined)
    target_w = int(105 * scale)
    target_h = int(logo_img.height * (target_w / logo_img.width))
    logo_scaled = logo_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    logo_x = (canvas_w - target_w) // 2
    logo_y = ly1 + int(12 * scale)
    layer.paste(logo_scaled, (logo_x, logo_y), logo_scaled)

    cx = canvas_w // 2

    # Fitted typography
    nirmala_path = "C:\\Windows\\Fonts\\Nirmala.ttc"
    if not os.path.exists(nirmala_path):
        nirmala_path = "C:\\Windows\\Fonts\\Nirmala.ttf"

    f_eng1 = fit_font(eng_line1, "arialbd.ttf", int(21 * scale), max_txt_w)
    f_eng2 = fit_font(eng_line2, "arialbd.ttf", int(17 * scale), max_txt_w) if eng_line2 else None
    f_tel = fit_font(telugu_text, nirmala_path, int(22 * scale), max_txt_w)
    f_wt = fit_font(weight_text, "arialbd.ttf", int(13 * scale), max_txt_w)

    if eng_line2:
        draw.text((cx, ly1 + int(76 * scale)), eng_line1, fill=C_ENG, font=f_eng1, anchor="mm")
        draw.text((cx, ly1 + int(102 * scale)), eng_line2, fill=C_ENG, font=f_eng2, anchor="mm")
        draw.text((cx, ly1 + int(148 * scale)), telugu_text, fill=C_TEL, font=f_tel, anchor="mm")
    else:
        draw.text((cx, ly1 + int(88 * scale)), eng_line1, fill=C_ENG, font=f_eng1, anchor="mm")
        draw.text((cx, ly1 + int(144 * scale)), telugu_text, fill=C_TEL, font=f_tel, anchor="mm")

    draw.text((cx, ly2 - int(18 * scale)), weight_text, fill=C_WT, font=f_wt, anchor="mm")
    return layer

def build_pouch_from_texture(tex_img_path, eng1, eng2, telugu, weight, out_filename):
    tex = Image.open(tex_img_path).convert("RGBA")
    tw, th = tex.size
    md = min(tw, th)
    tex_sq = tex.crop(((tw-md)//2, (th-md)//2, (tw+md)//2, (th+md)//2)).resize((1024, 1024), Image.Resampling.LANCZOS)

    comp = base_pouch.copy()
    comp.paste(tex_sq, (0, 0), pouch_mask)

    # Plastic Sheen
    sheen = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))
    gl_draw = ImageDraw.Draw(sheen)
    gl_draw.line([(320, 370), (300, 780)], fill=(255, 255, 255, 75), width=28)
    gl_draw.line([(715, 370), (700, 780)], fill=(255, 255, 255, 45), width=20)
    sheen = sheen.filter(ImageFilter.GaussianBlur(10))
    comp.alpha_composite(sheen)

    lbl = render_small_g1_label(1024, 1024, eng1, eng2, telugu, weight)
    comp.alpha_composite(lbl)

    out_path = os.path.join(POUCH_DIR, out_filename)
    comp.convert("RGB").save(out_path, "WEBP", quality=95)
    print(f"[OK] Generated {out_filename}")
    return out_path

def build_pouch_from_base(base_img_path, eng1, eng2, telugu, weight, out_filename):
    base = Image.open(base_img_path).convert("RGBA")
    if base.size != (1024, 1024):
        base = base.resize((1024, 1024), Image.Resampling.LANCZOS)
    lbl = render_small_g1_label(1024, 1024, eng1, eng2, telugu, weight)
    comp = Image.alpha_composite(base, lbl)
    out_path = os.path.join(POUCH_DIR, out_filename)
    comp.convert("RGB").save(out_path, "WEBP", quality=95)
    print(f"[OK] Generated from base {out_filename}")
    return out_path

# 1. Real Harvested Textures
build_pouch_from_texture("scratch_cloves_tex.png", "Lavangalu", "(Whole Cloves)", "లవంగాలు", "NET WT: 50g", "g1_lavangalu_pouch.webp")
build_pouch_from_texture("scratch_cinnamon_tex.png", "Dalchinachekka", "(Cinnamon Sticks)", "దాల్చిన చెక్క", "NET WT: 50g", "g1_dalchina_pouch.webp")
build_pouch_from_texture("scratch_fennel_tex.png", "Sompu", "(Sweet Fennel Seeds)", "సోంపు", "NET WT: 100g", "g1_sompu_pouch.webp")
build_pouch_from_texture("scratch_poppy_tex.png", "Gasagasalu", "(White Poppy Seeds)", "గసగసాలు", "NET WT: 50g", "g1_gasagasalu_pouch.webp")
build_pouch_from_texture("scratch_tamarind_tex.png", "Chintapandu", "(Cleaned Tamarind)", "చింతపండు", "NET WT: 500g", "g1_chintapandu_pouch.webp")
build_pouch_from_texture("scratch_copra_tex.png", "Endu Kobbari", "(Dry Coconut / Copra)", "ఎండు కొబ్బరి", "NET WT: 250g", "g1_kobbari_pouch.webp")
build_pouch_from_texture("scratch_bay_leaves_tex.png", "Biryani Aaku", "(Dried Bay Leaves)", "బిర్యానీ ఆకు", "NET WT: 50g", "g1_biryani_aaku_pouch.webp")
build_pouch_from_texture("scratch_sesame_tex.png", "Tella Nuvvulu", "(White Sesame Seeds)", "తెల్ల నువ్వులు", "NET WT: 100g", "g1_nuvvulu_pouch.webp")
build_pouch_from_texture("scratch_mustard_tex.png", "Avalu", "(Mustard Seeds)", "ఆవాలు", "NET WT: 100g", "g1_avalu_pouch.webp")
if os.path.exists("scratch_dry_mirchi_tex.png"):
    build_pouch_from_texture("scratch_dry_mirchi_tex.png", "Guntur Endu Mirchi", "(Dried Red Chillies)", "ఎండు మిర్చి", "NET WT: 500g", "g1_dry_mirchi_pouch.webp")

# 2. Existing Authentic Pouches with Small Logo Badge
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_jeera_pouch.webp"), "Jeelakarra", "(Cumin Seeds)", "జీలకర్ర", "NET WT: 250g", "g1_jeera_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_coriander_seeds_pouch.webp"), "Dhaniyalu", "(Coriander Seeds)", "ధనియాలు", "NET WT: 250g", "g1_coriander_seeds_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_menthulu_pouch.webp"), "Menthulu", "(Fenugreek Seeds)", "మెంతులు", "NET WT: 100g", "g1_menthulu_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_elaichi_pouch.webp"), "Yalukalu", "(Green Cardamom)", "యాలకులు", "NET WT: 50g", "g1_elaichi_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_miriyalu_pouch.webp"), "Miriyalu", "(Black Pepper)", "మిరియాలు", "NET WT: 100g", "g1_miriyalu_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_vamu_pouch.webp"), "Vamu", "(Ajwain Seeds)", "వాము", "NET WT: 100g", "g1_vamu_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_anasa_puvvu_pouch.webp"), "Anasa Puvvu", "(Star Anise)", "అనాస పువ్వు", "NET WT: 50g", "g1_anasa_puvvu_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_japathri_pouch.webp"), "Japathri", "(Mace)", "జాపత్రి", "NET WT: 25g", "g1_japathri_pouch.webp")
build_pouch_from_base("scratch_old_pappula.png", "Pappula Podi", "(Roasted Gram Podi)", "పప్పుల పొడి", "NET WT: 150g", "g1_pappula_podi_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_kobbari_karam_podi_pouch.webp"), "Kobbari Karam Podi", "(Dry Coconut Podi)", "కొబ్బరి కారం పొడి", "NET WT: 150g", "g1_kobbari_karam_podi_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_turmeric_powder_pouch.webp"), "Pasupu", "(Pure Turmeric Powder)", "పసుపు పొడి", "NET WT: 250g", "g1_turmeric_powder_pouch.webp")
build_pouch_from_base(os.path.join(POUCH_DIR, "g1_coriander_powder_pouch.webp"), "Dhaniyala Podi", "(Coriander Powder)", "ధనియాల పొడి", "NET WT: 250g", "g1_coriander_powder_pouch.webp")

print("All G1 Mart loose pouches successfully regenerated with subtle small logo and maximum clear window visibility!")
