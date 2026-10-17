import os
import sys
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAIN_DIR = "C:/Users/gumma/.gemini/antigravity/brain/77f14123-e9a3-4e82-87a7-bb5c859a0b7b"
PREV_BRAIN_DIR = "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894"
POUCH_DIR = os.path.join(BASE_DIR, "public", "products", "generated_pouches")

LOGO_PATH = os.path.join(BASE_DIR, "scratch_perfect_logo.png")
logo_img = Image.open(LOGO_PATH).convert("RGBA")

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

def render_compact_g1_label(canvas_w, canvas_h, eng_name, telugu_name, weight_label="1 KG"):
    """
    Renders a sleek, compact G1 Mart badge placed at the upper center
    so that 80%+ of the transparent pouch and product items remain completely visible!
    """
    layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    
    scale = canvas_w / 1024.0
    
    lw = int(270 * scale)
    lh = int(220 * scale)
    cx = canvas_w // 2
    lx1 = cx - (lw // 2)
    lx2 = cx + (lw // 2)
    ly1 = int(320 * scale)
    ly2 = ly1 + lh
    
    # Drop shadow
    draw.rounded_rectangle([lx1 + 2, ly1 + 3, lx2 + 2, ly2 + 4], radius=int(14 * scale), fill=(0, 0, 0, 35))
    # Crisp white card with clean subtle border
    draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=int(14 * scale), fill=(255, 255, 255, 252), outline=(215, 225, 218, 255), width=int(1.5 * scale))
    
    # G1 Mart Logo
    target_w = int(140 * scale)
    target_h = int(logo_img.height * (target_w / logo_img.width))
    logo_scaled = logo_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    logo_x = cx - (target_w // 2)
    logo_y = ly1 + int(14 * scale)
    layer.paste(logo_scaled, (logo_x, logo_y), logo_scaled)
    
    max_txt_w = lw - int(24 * scale)
    nirmala_path = "C:/Windows/Fonts/Nirmala.ttc"
    if not os.path.exists(nirmala_path):
        nirmala_path = "C:/Windows/Fonts/Nirmala.ttf"
        
    f_eng = fit_font(eng_name, "arialbd.ttf", int(21 * scale), max_txt_w)
    f_tel = fit_font(telugu_name, nirmala_path, int(22 * scale), max_txt_w) if telugu_name else None
    f_wt = fit_font(f"NET WT: {weight_label}", "arialbd.ttf", int(13 * scale), max_txt_w)
    
    if telugu_name and f_tel:
        draw.text((cx, ly1 + int(90 * scale)), eng_name, fill=(12, 60, 28, 255), font=f_eng, anchor="mm")
        draw.text((cx, ly1 + int(134 * scale)), telugu_name, fill=(20, 45, 25, 255), font=f_tel, anchor="mm")
    else:
        draw.text((cx, ly1 + int(108 * scale)), eng_name, fill=(12, 60, 28, 255), font=f_eng, anchor="mm")
        
    draw.text((cx, ly2 - int(20 * scale)), f"NET WT: {weight_label}", fill=(40, 50, 45, 255), font=f_wt, anchor="mm")
    
    return layer

def build_pouch(base_img_path, eng_name, telugu_name, weight_label, dest_filename):
    base = Image.open(base_img_path).convert("RGBA")
    w, h = base.size
    
    lbl = render_compact_g1_label(w, h, eng_name, telugu_name, weight_label)
    comp = Image.alpha_composite(base, lbl).convert("RGB")
    
    dest_path = os.path.join(POUCH_DIR, dest_filename)
    comp.save(dest_path, "WEBP", quality=94)
    print(f"Generated: {dest_path}")
    return dest_path

POUCH_ITEMS = [
    # Category 1: Rice, Atta & Flours
    {
        "base": os.path.join(BRAIN_DIR, "rice_pouch_1792211401787.jpg"),
        "eng": "Sona Masoori Raw Rice",
        "tel": "సోనా మసూరి బియ్యం",
        "wt": "1 KG",
        "dest": "g1_rice_pouch.webp"
    },
    {
        "base": os.path.join(BRAIN_DIR, "poha_pouch_1792211430397.jpg"),
        "eng": "Doddu Atukulu (Thick Poha)",
        "tel": "దొడ్డు అటుకులు",
        "wt": "500g",
        "dest": "g1_poha_pouch.webp"
    },
    {
        "base": os.path.join(BRAIN_DIR, "atta_pouch_1792211461078.jpg"),
        "eng": "Chakki Fresh Atta",
        "tel": "గోధుమ పిండి",
        "wt": "1 KG",
        "dest": "g1_atta_pouch.webp"
    },
    {
        "base": os.path.join(BRAIN_DIR, "maida_pouch_1792212430459.jpg"),
        "eng": "Maida Pindi (Refined Flour)",
        "tel": "మైదా పిండి",
        "wt": "1 KG",
        "dest": "g1_maida_pouch.webp"
    },
    {
        "base": os.path.join(BRAIN_DIR, "corn_flour_pouch_1792212461304.jpg"),
        "eng": "Pure Corn Flour",
        "tel": "మొక్కజొన్న పిండి",
        "wt": "500g",
        "dest": "g1_corn_flour_pouch.webp"
    },
    {
        "base": os.path.join(BRAIN_DIR, "wheat_grains_pouch_1792212492375.jpg"),
        "eng": "Whole Wheat Grains",
        "tel": "గోధుమలు",
        "wt": "1 KG",
        "dest": "g1_wheat_grains_pouch.webp"
    },
    # Category 2: Dals & Pulses
    {
        "base": os.path.join(PREV_BRAIN_DIR, "yellow_moong_dal_1791880584664.jpg"),
        "eng": "Pesara Pappu (Moong Dal)",
        "tel": "పెసరపప్పు",
        "wt": "1 KG",
        "dest": "g1_yellow_moong_dal_pouch.webp"
    },
    # Category 5: Sugar, Salt & Jaggery
    {
        "base": os.path.join(BRAIN_DIR, "sugar_pouch_1792212532194.jpg"),
        "eng": "Refined Crystal Sugar",
        "tel": "పంచదార",
        "wt": "1 KG",
        "dest": "g1_sugar_pouch.webp"
    },
    {
        "base": os.path.join(BRAIN_DIR, "bellam_pouch_1792212563018.jpg"),
        "eng": "Pure Country Bellam",
        "tel": "నాటు బెల్లం",
        "wt": "1 KG",
        "dest": "g1_bellam_pouch.webp"
    },
    # Category 6: Dry Fruits & Nuts
    {
        "base": os.path.join(BRAIN_DIR, "pista_pouch_1792212594898.jpg"),
        "eng": "Salted Pistachios",
        "tel": "పిస్తా పప్పు",
        "wt": "250g",
        "dest": "g1_pista_pouch.webp"
    }
]

if __name__ == "__main__":
    for item in POUCH_ITEMS:
        build_pouch(item["base"], item["eng"], item["tel"], item["wt"], item["dest"])
    print("All HD transparent G1 Mart pouches successfully composited!")
