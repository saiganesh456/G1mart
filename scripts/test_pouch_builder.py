import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def make_pouch(base_img_path, eng_line1, eng_line2, telugu_text, weight_text, out_path):
    # 1. Open base image and resize to 800x800
    base = Image.open(base_img_path).convert("RGBA")
    if base.size != (800, 800):
        base = base.resize((800, 800), Image.Resampling.LANCZOS)
    
    # 2. Label bounds (matching Kandi Pappu & Chana Dal)
    lx1, ly1 = 286, 286
    lx2, ly2 = 514, 580
    lw = lx2 - lx1
    lh = ly2 - ly1
    
    # 3. Create label overlay
    label_img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw = ImageDraw.Draw(label_img)
    
    # Drop shadow
    draw.rounded_rectangle([lx1 + 2, ly1 + 3, lx2 + 2, ly2 + 3], radius=10, fill=(0, 0, 0, 40))
    # White card
    draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=10, fill=(255, 255, 255, 255), outline=(230, 235, 230, 255), width=1)
    
    # 4. Paste Logo
    logo = Image.open("scratch_perfect_logo.png").convert("RGBA")
    logo_w, logo_h = logo.size
    target_w = 175
    target_h = int(logo_h * (target_w / logo_w))
    logo_scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
    logo_x = 400 - (target_w // 2)
    logo_y = ly1 + 18
    label_img.paste(logo_scaled, (logo_x, logo_y), logo_scaled)
    
    # 5. Fonts
    font_eng1 = ImageFont.truetype("arialbd.ttf", 26)
    font_eng2 = ImageFont.truetype("arialbd.ttf", 23)
    font_tel = ImageFont.truetype("C:\\Windows\\Fonts\\Nirmala.ttc", 28)
    font_wt = ImageFont.truetype("arialbd.ttf", 16)
    
    # Colors
    c_eng = (7, 69, 34, 255)      # Deep brand green
    c_tel = (25, 45, 28, 255)     # Deep dark green
    c_wt = (20, 25, 20, 255)      # Crisp charcoal
    
    draw = ImageDraw.Draw(label_img)
    
    # Position text
    if eng_line2:
        draw.text((400, ly1 + 105), eng_line1, fill=c_eng, font=font_eng1, anchor="mm")
        draw.text((400, ly1 + 140), eng_line2, fill=c_eng, font=font_eng2, anchor="mm")
        draw.text((400, ly1 + 192), telugu_text, fill=c_tel, font=font_tel, anchor="mm")
    else:
        draw.text((400, ly1 + 120), eng_line1, fill=c_eng, font=font_eng1, anchor="mm")
        draw.text((400, ly1 + 180), telugu_text, fill=c_tel, font=font_tel, anchor="mm")
        
    draw.text((400, ly2 - 25), weight_text, fill=c_wt, font=font_wt, anchor="mm")
    
    # 6. Composite onto base
    final_img = Image.alpha_composite(base, label_img)
    final_rgb = final_img.convert("RGB")
    
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    final_rgb.save(out_path, "WEBP", quality=95)
    print(f"Saved: {out_path}")

make_pouch(
    "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg",
    "Yellow Moong Dal",
    "(Pesara Pappu)",
    "పెసరపప్పు",
    "NET WT: 1 KG",
    "scratch_test_moong.webp"
)
