import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POUCH_DIR = os.path.join(BASE_DIR, "public", "products", "generated_pouches")
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")
PACKSHOT_DIR = os.path.join(BASE_DIR, "public", "products", "packshots")

os.makedirs(POUCH_DIR, exist_ok=True)
os.makedirs(VERIFIED_DIR, exist_ok=True)
os.makedirs(PACKSHOT_DIR, exist_ok=True)

BASE_POUCH_PATH = "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg"
MASK_PATH = os.path.join(BASE_DIR, "scratch_pouch_mask.png")
LOGO_PATH = os.path.join(BASE_DIR, "public", "assets", "images", "g1_mart_banner_transparent.png")

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

    # G1 Mart Official Banner Logo
    target_w = int(185 * scale)
    target_h = int(logo_img.height * (target_w / logo_img.width))
    logo_scaled = logo_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    logo_x = (canvas_w - target_w) // 2
    logo_y = ly1 + int(16 * scale)
    layer.paste(logo_scaled, (logo_x, logo_y), logo_scaled)

    cx = canvas_w // 2

    # Fitted typography
    f_eng1 = fit_font(eng_line1, "arialbd.ttf", int(24 * scale), max_txt_w)
    f_eng2 = fit_font(eng_line2, "arialbd.ttf", int(20 * scale), max_txt_w) if eng_line2 else None
    f_tel = fit_font(telugu_text, "C:\\Windows\\Fonts\\Nirmala.ttc", int(28 * scale), max_txt_w)
    f_wt = fit_font(weight_text, "arialbd.ttf", int(16 * scale), max_txt_w)

    if eng_line2:
        draw.text((cx, ly1 + int(98 * scale)), eng_line1, fill=C_ENG, font=f_eng1, anchor="mm")
        draw.text((cx, ly1 + int(128 * scale)), eng_line2, fill=C_ENG, font=f_eng2, anchor="mm")
        draw.text((cx, ly1 + int(182 * scale)), telugu_text, fill=C_TEL, font=f_tel, anchor="mm")
    else:
        draw.text((cx, ly1 + int(112 * scale)), eng_line1, fill=C_ENG, font=f_eng1, anchor="mm")
        draw.text((cx, ly1 + int(176 * scale)), telugu_text, fill=C_TEL, font=f_tel, anchor="mm")

    draw.text((cx, ly2 - int(24 * scale)), weight_text, fill=C_WT, font=f_wt, anchor="mm")
    return layer

def build_mirchi_pouch():
    tex_img_path = "scratch_dry_mirchi_tex.png"
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

    lbl = render_g1_label(1024, 1024, "Guntur Dry Red Mirchi", "(Whole Red Chillies)", "ఎండు మిర్చి", "NET WT: 500g")
    comp.alpha_composite(lbl)

    out_pouch_path = os.path.join(POUCH_DIR, "g1_dry_mirchi_pouch.webp")
    out_packshot_path = os.path.join(PACKSHOT_DIR, "g1-dry-mirchi.webp")
    
    comp.save(out_pouch_path, "WEBP", quality=92)
    comp.save(out_packshot_path, "WEBP", quality=92)
    print(f"Generated Dry Mirchi Pouch: {out_pouch_path} and {out_packshot_path}")

build_mirchi_pouch()
