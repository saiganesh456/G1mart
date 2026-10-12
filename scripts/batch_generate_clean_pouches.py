import os
import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

def fetch_texture_image(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            for u in murls[:5]:
                try:
                    img_req = urllib.request.Request(u, headers=HEADERS)
                    with urllib.request.urlopen(img_req, context=ctx, timeout=8) as ires:
                        data = ires.read()
                        im = Image.open(io.BytesIO(data)).convert("RGBA")
                        if im.size[0] >= 300 and im.size[1] >= 300:
                            return im
                except:
                    continue
    except Exception as e:
        print(f"Error fetching texture for {query}: {e}")
    return None

def create_g1_clean_packshot(product_title, telugu_title, search_query, net_weight, out_path):
    print(f"Creating G1 clean white pouch for: {product_title}...")
    canvas = Image.new("RGBA", (800, 800), (255, 255, 255, 255))
    
    # 1. Fetch realistic product texture/grain
    texture = fetch_texture_image(f"{search_query} raw high resolution")
    if not texture:
        texture = fetch_texture_image(f"{search_query} texture")
    
    # 2. Pouch shape parameters
    pouch_x1, pouch_y1 = 180, 100
    pouch_x2, pouch_y2 = 620, 720
    pouch_w = pouch_x2 - pouch_x1
    pouch_h = pouch_y2 - pouch_y1
    
    # Create pouch mask
    pouch_mask = Image.new("L", (800, 800), 0)
    draw_mask = ImageDraw.Draw(pouch_mask)
    
    pouch_points = [
        (pouch_x1 + 30, pouch_y1),          # top-left notch
        (pouch_x2 - 30, pouch_y1),          # top-right notch
        (pouch_x2, pouch_y1 + 50),          # top-right shoulder
        (pouch_x2 + 20, pouch_y2 - 60),     # right belly
        (pouch_x2 - 25, pouch_y2),          # bottom-right foot
        (pouch_x1 + 25, pouch_y2),          # bottom-left foot
        (pouch_x1 - 20, pouch_y2 - 60),     # left belly
        (pouch_x1, pouch_y1 + 50),          # top-left shoulder
    ]
    draw_mask.polygon(pouch_points, fill=255)
    pouch_mask = pouch_mask.filter(ImageFilter.GaussianBlur(1))
    
    # 3. Fill pouch with product grain texture (transparent clear pouch showing product completely!)
    pouch_layer = Image.new("RGBA", (800, 800), (245, 245, 245, 255))
    if texture:
        scaled_texture = texture.resize((pouch_w + 60, pouch_h + 40), Image.Resampling.LANCZOS)
        pouch_layer.paste(scaled_texture, (pouch_x1 - 30, pouch_y1 - 20))
    else:
        draw_pouch = ImageDraw.Draw(pouch_layer)
        draw_pouch.rectangle([pouch_x1 - 30, pouch_y1 - 20, pouch_x2 + 30, pouch_y2 + 20], fill=(240, 235, 225, 255))
        
    # 4. Top sealed heat-strip (Silver / Frosted metallic grip seal)
    seal_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_seal = ImageDraw.Draw(seal_layer)
    draw_seal.rectangle([pouch_x1 - 10, pouch_y1, pouch_x2 + 10, pouch_y1 + 45], fill=(235, 238, 242, 245))
    for step in range(pouch_y1 + 5, pouch_y1 + 42, 6):
        draw_seal.line([(pouch_x1, step), (pouch_x2, step)], fill=(180, 190, 205, 160), width=2)
    # Tear notches
    draw_seal.line([(pouch_x1 - 10, pouch_y1 + 28), (pouch_x1 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    draw_seal.line([(pouch_x2 - 10, pouch_y1 + 28), (pouch_x2 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    
    # 5. Glossy plastic pouch shading & 3D edge highlights
    gloss_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_gloss = ImageDraw.Draw(gloss_layer)
    draw_gloss.line([(pouch_x1 + 55, pouch_y1 + 50), (pouch_x1 + 45, pouch_y2 - 40)], fill=(255, 255, 255, 80), width=30)
    draw_gloss.line([(pouch_x2 - 50, pouch_y1 + 50), (pouch_x2 - 60, pouch_y2 - 40)], fill=(0, 0, 0, 30), width=20)
    gloss_layer = gloss_layer.filter(ImageFilter.GaussianBlur(8))
    
    # 6. Clean White G1 Mart Product Label
    label_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_label = ImageDraw.Draw(label_layer)
    
    lbl_w = 260
    lbl_h = 240
    lbl_x1 = 400 - (lbl_w // 2)
    lbl_y1 = 330
    lbl_x2 = 400 + (lbl_w // 2)
    lbl_y2 = lbl_y1 + lbl_h
    
    # Soft drop shadow for white label
    draw_label.rounded_rectangle([lbl_x1 + 3, lbl_y1 + 5, lbl_x2 + 3, lbl_y2 + 5], radius=16, fill=(0, 0, 0, 45))
    # Crisp pure white label card
    draw_label.rounded_rectangle([lbl_x1, lbl_y1, lbl_x2, lbl_y2], radius=16, fill=(255, 255, 255, 250), outline=(225, 230, 225, 255), width=2)
    
    # Brand Header: G1 Mart Logo
    logo_path = "public/logo.png"
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            lw, lh = logo_img.size
            ratio = min(90 / lw, 38 / lh)
            nlw, nlh = int(lw * ratio), int(lh * ratio)
            logo_img = logo_img.resize((nlw, nlh), Image.Resampling.LANCZOS)
            label_layer.paste(logo_img, (400 - (nlw // 2), lbl_y1 + 18), logo_img)
        except:
            pass
            
    # Product Title in bold dark green / black font
    clean_title = product_title
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 20)
        # Use Nirmala.ttf for Telugu text on Windows
        nirmala_path = "C:/Windows/Fonts/Nirmala.ttf"
        font_sub = ImageFont.truetype(nirmala_path, 16) if os.path.exists(nirmala_path) else ImageFont.truetype("arial.ttf", 15)
        font_wt = ImageFont.truetype("arialbd.ttf", 13)
    except:
        font_large = ImageFont.load_default()
        font_sub = font_large
        font_wt = font_large
        
    draw_label.text((400, lbl_y1 + 80), clean_title, fill=(20, 50, 30, 255), font=font_large, anchor="mm")
    if telugu_title:
        draw_label.text((400, lbl_y1 + 115), telugu_title, fill=(70, 90, 75, 255), font=font_sub, anchor="mm")
        
    # Thin divider line
    draw_label.line([(lbl_x1 + 30, lbl_y1 + 145), (lbl_x2 - 30, lbl_y1 + 145)], fill=(230, 235, 230, 255), width=1)
    
    # Net Weight Pill
    pill_w = 90
    pill_h = 28
    px1, py1 = 400 - (pill_w // 2), lbl_y1 + 165
    px2, py2 = px1 + pill_w, py1 + pill_h
    draw_label.rounded_rectangle([px1, py1, px2, py2], radius=14, fill=(235, 247, 238, 255), outline=(160, 215, 175, 255), width=1)
    draw_label.text((400, py1 + (pill_h // 2)), net_weight, fill=(25, 120, 50, 255), font=font_wt, anchor="mm")
    
    # Subtitle guarantee
    draw_label.text((400, lbl_y1 + 215), "100% PURE & FRESH", fill=(140, 155, 145, 255), font=font_wt, anchor="mm")

    # 7. Composite all layers within pouch mask
    pouch_comp = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    pouch_comp.paste(pouch_layer, (0, 0))
    pouch_comp.alpha_composite(seal_layer)
    pouch_comp.alpha_composite(gloss_layer)
    pouch_comp.alpha_composite(label_layer)
    
    pouch_final = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    pouch_final.paste(pouch_comp, (0, 0), pouch_mask)
    
    # 8. Soft Ground Drop Shadow under pouch
    shadow_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow_layer)
    draw_shadow.ellipse([pouch_x1 - 10, pouch_y2 - 15, pouch_x2 + 10, pouch_y2 + 35], fill=(0, 0, 0, 60))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))
    
    final_canvas = Image.new("RGBA", (800, 800), (255, 255, 255, 255))
    final_canvas.alpha_composite(shadow_layer)
    final_canvas.alpha_composite(pouch_final)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    final_canvas.convert("RGB").save(out_path, "WEBP", quality=92)
    print(f"Saved: {out_path} ({os.path.getsize(out_path)} bytes)")

ITEMS = [
    ("Sona Masoori Rice", "బియ్యం", "sona masoori raw white rice grains isolated", "1 KG", "public/products/generated_pouches/g1_rice_pouch.webp"),
    ("Flattened Rice", "అటుకులు", "white poha flattened rice flakes isolated", "500g", "public/products/generated_pouches/g1_poha_pouch.webp"),
    ("Whole Wheat", "గోధుమలు", "raw wheat grains godhumalu isolated", "1 KG", "public/products/generated_pouches/g1_wheat_grains_pouch.webp"),
    ("Chakki Fresh Atta", "గోధుమ పిండి", "whole wheat chakki atta flour powder isolated", "1 KG", "public/products/generated_pouches/g1_atta_pouch.webp"),
    ("Yellow Moong Dal", "పెసరపప్పు", "yellow moong dal split lentils raw isolated", "1 KG", "public/products/generated_pouches/g1_yellow_moong_dal_pouch.webp"),
    ("Maida Flour", "మైదా పిండి", "maida flour white powder bowl isolated", "1 KG", "public/products/generated_pouches/g1_maida_pouch.webp"),
    ("Corn Flour", "కార్న్ ఫ్లోర్", "corn starch corn flour yellow powder isolated", "1 KG", "public/products/generated_pouches/g1_corn_flour_pouch.webp"),
    ("Ragi Flour", "రాగి పిండి", "finger millet ragi flour brown isolated", "1 KG", "public/products/generated_pouches/g1_ragi_pouch.webp"),
    ("Alasandalu", "అలసందలు", "black eyed peas lobia alasandalu cowpeas isolated", "1 KG", "public/products/generated_pouches/g1_alasandalu_pouch.webp"),
    ("Pistachio", "పిస్తా", "pistachio nuts shelled raw green isolated", "250g", "public/products/generated_pouches/g1_pista_pouch.webp"),
    ("Kismis", "కిస్మిస్", "golden green raisins kismis dry fruits isolated", "250g", "public/products/generated_pouches/g1_kismis_pouch.webp"),
    ("Telagapindi", "తెల్లగపిండి", "sesame meal cake powder telagapindi isolated", "500g", "public/products/generated_pouches/g1_telagapindi_pouch.webp"),
]

for title, telugu, query, wt, path in ITEMS:
    try:
        create_g1_clean_packshot(title, telugu, query, wt, path)
    except Exception as e:
        print(f"Error on {title}: {e}")

print("Batch generation completed!")
