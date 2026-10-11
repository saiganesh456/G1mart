import os
import sys
sys.stdout.reconfigure(line_buffering=True)
import re
import io
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

with open('scratch_check/placard_products.json', 'r', encoding='utf-8') as f:
    placard_prods = json.load(f)

print(f"Total placard products to convert: {len(placard_prods)}")

logo_path = 'public/logo.png'
logo_img = Image.open(logo_path).convert('RGBA')

font_large = ImageFont.truetype('arialbd.ttf', 20)
font_medium = ImageFont.truetype('arialbd.ttf', 16)
font_small = ImageFont.truetype('arialbd.ttf', 13)
font_telugu = ImageFont.truetype('C:/Windows/Fonts/Nirmala.ttf', 16)

TELUGU_DICT = {
    'noodles': 'నూడుల్స్',
    'masala': 'మసాలా',
    'ginger garlic': 'అల్లం వెల్లుల్లి పేస్ట్',
    'red chilli': 'ఎర్ర మిరపకాయ',
    'chilli': 'మిరపకాయ',
    'mango pickle': 'మామిడికాయ పచ్చడి',
    'pickle': 'పచ్చడి',
    'pappula podi': 'పప్పుల పొడి',
    'podi': 'పొడి',
    'pani puri': 'పానీపూరి మసాలా',
    'biryani': 'బిర్యానీ మసాలా',
    'garam masala': 'గరం మసాలా',
    'sambar': 'సాంబార్ పొడి',
    'rasam': 'రసం పొడి',
    'salt': 'ఉప్పు',
    'sugar': 'చక్కెర',
    'jaggery': 'బెల్లం',
    'bellam': 'బెల్లం',
    'tamarind': 'చింతపండు',
    'ragi': 'రాగి పిండి',
    'wheat': 'గోధుమలు',
    'atta': 'గోధుమ పిండి',
    'rice': 'బియ్యం',
    'corn': 'మొక్కజొన్న',
    'flour': 'పిండి',
    'rava': 'రవ్వ',
    'vermicelli': 'సేమియా',
    'soap': 'సబ్బు',
    'milk': 'పాలు',
    'curd': 'పెరుగు',
    'ghee': 'నెయ్యి',
    'oil': 'నూనె',
    'dal': 'పప్పు',
    'pappu': 'పప్పు',
    'cashew': 'జీడిపప్పు',
    'almond': 'బాదం పప్పు',
    'kismis': 'కిస్మిస్',
    'dates': 'ఖర్జూరం',
    'pista': 'పిస్తా',
    'groundnut': 'వేరుశెనగ',
    'peanut': 'వేరుశెనగ',
    'tea': 'టీ పొడి',
    'coffee': 'కాఫీ పొడి',
    'honey': 'తేనె',
    'papad': 'అప్పడాలు',
    'appalam': 'అప్పడాలు',
    'mop': 'మాప్',
    'broom': 'చీపురు',
    'brush': 'బ్రష్',
    'lock': 'తాళం',
    'agarbatti': 'అగరబత్తి',
    'incense': 'అగరబత్తి',
    'sambrani': 'సాంబ్రాణి',
}

def get_telugu_name(name):
    low = name.lower()
    for kw, te in TELUGU_DICT.items():
        if kw in low:
            return te
    return "100% PURE & NATURAL"

def extract_weight(name):
    m = re.search(r'(\d+\s*(?:kg|kgs|g|gm|gms|ml|lt|ltr|rupees|rs))', name, re.IGNORECASE)
    if m:
        return m.group(1).upper()
    return "100g"

# Cache git 2a9995d tree for quick extraction
converted_count = 0
for idx, p in enumerate(placard_prods):
    pid = p['id']
    name = p.get('name', 'Product')
    dest_path = f"public/products/verified/{pid}.webp"
    
    # Try reading existing file if present, else git
    raw_bytes = None
    if os.path.exists(dest_path):
        with open(dest_path, 'rb') as f_in:
            raw_bytes = f_in.read()
    if not raw_bytes or len(raw_bytes) < 500:
        res = subprocess.run(['git', 'show', f'2a9995d:public/products/verified/{pid}.webp'], capture_output=True)
        raw_bytes = res.stdout
        
    if not raw_bytes or len(raw_bytes) < 500:
        continue
        
    try:
        base_im = Image.open(io.BytesIO(raw_bytes)).convert('RGBA')
        if base_im.size != (800, 800):
            base_im = base_im.resize((800, 800), Image.Resampling.LANCZOS)
            
        # Composite on pure white background
        white_bg = Image.new('RGBA', (800, 800), (255, 255, 255, 255))
        # Add subtle bottom ground shadow under pouch
        shadow_ground = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
        d_g = ImageDraw.Draw(shadow_ground)
        d_g.ellipse([180, 705, 620, 745], fill=(0, 0, 0, 55))
        shadow_ground = shadow_ground.filter(ImageFilter.GaussianBlur(14))
        white_bg.alpha_composite(shadow_ground)
        white_bg.paste(base_im, (0, 0), base_im)
        
        # Dimensions to 100% cover the dark green rectangle [210, 220, 590, 440]
        lbl_w = 405
        lbl_h = 246
        cx, cy = 400, 330
        x1 = cx - (lbl_w // 2)
        y1 = cy - (lbl_h // 2)
        x2 = cx + (lbl_w // 2)
        y2 = cy + (lbl_h // 2)
        
        label_layer = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
        d = ImageDraw.Draw(label_layer)
        
        # Soft shadow
        d.rounded_rectangle([x1 + 4, y1 + 6, x2 + 4, y2 + 6], radius=16, fill=(0, 0, 0, 75))
        label_layer = label_layer.filter(ImageFilter.GaussianBlur(3))
        d = ImageDraw.Draw(label_layer)
        
        # Crisp clean white label card
        d.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=(255, 255, 255, 255), outline=(215, 225, 220, 255), width=2)
        
        # G1 Mart Logo
        lw, lh = logo_img.size
        ratio = min(110 / lw, 38 / lh)
        nlw, nlh = int(lw * ratio), int(lh * ratio)
        resized_logo = logo_img.resize((nlw, nlh), Image.Resampling.LANCZOS)
        label_layer.paste(resized_logo, (cx - (nlw // 2), y1 + 16), resized_logo)
        
        # Product Title
        clean_title = name.title()
        if len(clean_title) > 24:
            f_title = font_medium
            if len(clean_title) > 32:
                clean_title = clean_title[:30] + "..."
        else:
            f_title = font_large
            
        d.text((cx, y1 + 78), clean_title, fill=(20, 55, 30, 255), font=f_title, anchor='mm')
        
        # Telugu name
        te_text = get_telugu_name(name)
        d.text((cx, y1 + 110), te_text, fill=(45, 75, 50, 255), font=font_telugu, anchor='mm')
        
        # Divider
        d.line([(x1 + 35, y1 + 138), (x2 - 35, y1 + 138)], fill=(225, 235, 228, 255), width=1)
        
        # Weight badge
        wt = extract_weight(name)
        pw, ph = 96, 28
        px1 = cx - (pw // 2)
        py1 = y1 + 158
        px2 = px1 + pw
        py2 = py1 + ph
        d.rounded_rectangle([px1, py1, px2, py2], radius=14, fill=(235, 248, 240, 255), outline=(155, 215, 175, 255), width=1)
        d.text((cx, py1 + (ph // 2)), wt, fill=(25, 120, 50, 255), font=font_small, anchor='mm')
        
        d.text((cx, y1 + 215), "DIRECT FARM FRESH QUALITY", fill=(130, 150, 138, 255), font=font_small, anchor='mm')
        
        final_im = Image.alpha_composite(white_bg, label_layer)
        final_im.convert('RGB').save(dest_path, 'WEBP', quality=92)
        converted_count += 1
        if converted_count % 50 == 0:
            print(f"Progress: converted {converted_count}/{len(placard_prods)} products...")
    except Exception as e:
        print(f"Error on {pid}: {e}")

print(f"\nALL DONE! Successfully converted {converted_count} products to our clean white G1 MART packaging style!")
