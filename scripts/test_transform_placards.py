from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import json

logo_path = 'public/logo.png'
logo_img = None
if os.path.exists(logo_path):
    logo_img = Image.open(logo_path).convert('RGBA')

font_large = ImageFont.truetype('arialbd.ttf', 20)
font_medium = ImageFont.truetype('arialbd.ttf', 16)
font_small = ImageFont.truetype('arialbd.ttf', 13)
font_telugu = ImageFont.truetype('C:/Windows/Fonts/Nirmala.ttf', 16)

def apply_g1_packaging_style(img_path, title, telugu="", net_weight="100g"):
    if not os.path.exists(img_path):
        return False
    try:
        base_im = Image.open(img_path).convert('RGBA')
        if base_im.size != (800, 800):
            base_im = base_im.resize((800, 800), Image.Resampling.LANCZOS)
            
        # Target label dimensions to 100% conceal the old green placard [210, 220, 590, 440]
        lbl_w = 400
        lbl_h = 246
        cx, cy = 400, 330
        x1 = cx - (lbl_w // 2)
        y1 = cy - (lbl_h // 2)
        x2 = cx + (lbl_w // 2)
        y2 = cy + (lbl_h // 2)
        
        label_layer = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
        d = ImageDraw.Draw(label_layer)
        
        # 1. Soft elegant drop shadow
        d.rounded_rectangle([x1 + 4, y1 + 6, x2 + 4, y2 + 6], radius=16, fill=(0, 0, 0, 75))
        label_layer = label_layer.filter(ImageFilter.GaussianBlur(3))
        d = ImageDraw.Draw(label_layer)
        
        # 2. Crisp clean white label card
        d.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=(255, 255, 255, 255), outline=(215, 225, 220, 255), width=2)
        
        # 3. Official G1 Mart Logo
        if logo_img:
            lw, lh = logo_img.size
            ratio = min(110 / lw, 38 / lh)
            nlw, nlh = int(lw * ratio), int(lh * ratio)
            resized_logo = logo_img.resize((nlw, nlh), Image.Resampling.LANCZOS)
            label_layer.paste(resized_logo, (cx - (nlw // 2), y1 + 16), resized_logo)
            
        # 4. Product Title in bold green/black
        clean_title = title.title()
        if len(clean_title) > 24:
            f_title = font_medium
        else:
            f_title = font_large
            
        d.text((cx, y1 + 78), clean_title, fill=(20, 55, 30, 255), font=f_title, anchor='mm')
        
        # 5. Telugu subtitle or Tagline
        if telugu:
            d.text((cx, y1 + 110), telugu, fill=(45, 75, 50, 255), font=font_telugu, anchor='mm')
        else:
            d.text((cx, y1 + 110), "100% PURE & NATURAL", fill=(50, 110, 60, 255), font=font_small, anchor='mm')
            
        # 6. Subtle Divider
        d.line([(x1 + 35, y1 + 138), (x2 - 35, y1 + 138)], fill=(225, 235, 228, 255), width=1)
        
        # 7. Pill Badge: Net Wt & Quality Guarantee
        pw, ph = 96, 28
        px1 = cx - (pw // 2)
        py1 = y1 + 158
        px2 = px1 + pw
        py2 = py1 + ph
        d.rounded_rectangle([px1, py1, px2, py2], radius=14, fill=(235, 248, 240, 255), outline=(155, 215, 175, 255), width=1)
        d.text((cx, py1 + (ph // 2)), net_weight, fill=(25, 120, 50, 255), font=font_small, anchor='mm')
        
        d.text((cx, y1 + 215), "DIRECT FARM FRESH QUALITY", fill=(130, 150, 138, 255), font=font_small, anchor='mm')
        
        final_im = Image.alpha_composite(base_im, label_layer)
        final_im.convert('RGB').save(img_path, 'WEBP', quality=92)
        return True
    except Exception as e:
        print(f"Error on {img_path}: {e}")
        return False

# Test on the 6 products from the user's screenshot
test_items = [
    ("public/products/verified/g1-p0675.webp", "Noodles Masala", "నూడుల్స్ మసాలా", "100g"),
    ("public/products/verified/g1-p0679.webp", "Pani Puri Masala", "పానీపూరి మసాలా", "100g"),
    ("public/products/verified/g1-p0693.webp", "Ginger Garlic Paste", "అల్లం వెల్లుల్లి పేస్ట్", "200g"),
    ("public/products/verified/g1-p0694.webp", "Red Chilli Pickle", "ఎర్ర మిరపకాయ పచ్చడి", "300g"),
    ("public/products/verified/g1-p0695.webp", "Mango Pickle", "మామిడికాయ పచ్చడి", "300g"),
    ("public/products/verified/g1-p0706.webp", "Pappula Podi", "పప్పుల పొడి", "200g"),
]

for path, title, te, wt in test_items:
    success = apply_g1_packaging_style(path, title, te, wt)
    print(f"Processed {title}: {success}")
