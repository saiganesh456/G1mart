import os
import sys
import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_texture(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            for u in murls[:6]:
                try:
                    img_req = urllib.request.Request(u, headers=HEADERS)
                    with urllib.request.urlopen(img_req, context=ctx, timeout=8) as ires:
                        data = ires.read()
                        im = Image.open(io.BytesIO(data)).convert('RGBA')
                        if im.size[0] >= 250 and im.size[1] >= 250:
                            return im
                except:
                    continue
    except Exception as e:
        print(f"Error fetching {query}: {e}")
    return None

def make_clean_pouch(title, telugu, query, wt, out_path):
    print(f"Generating clean pouch for {title} ({telugu})...")
    canvas = Image.new('RGBA', (800, 800), (255, 255, 255, 255))
    texture = fetch_texture(query)
    
    pouch_x1, pouch_y1 = 180, 100
    pouch_x2, pouch_y2 = 620, 720
    pouch_w = pouch_x2 - pouch_x1
    pouch_h = pouch_y2 - pouch_y1
    
    pouch_mask = Image.new('L', (800, 800), 0)
    draw_mask = ImageDraw.Draw(pouch_mask)
    pouch_points = [
        (pouch_x1 + 30, pouch_y1),
        (pouch_x2 - 30, pouch_y1),
        (pouch_x2, pouch_y1 + 50),
        (pouch_x2 + 20, pouch_y2 - 60),
        (pouch_x2 - 25, pouch_y2),
        (pouch_x1 + 25, pouch_y2),
        (pouch_x1 - 20, pouch_y2 - 60),
        (pouch_x1, pouch_y1 + 50),
    ]
    draw_mask.polygon(pouch_points, fill=255)
    pouch_mask = pouch_mask.filter(ImageFilter.GaussianBlur(1))
    
    pouch_layer = Image.new('RGBA', (800, 800), (245, 245, 245, 255))
    if texture:
        scaled = texture.resize((pouch_w + 60, pouch_h + 40), Image.Resampling.LANCZOS)
        pouch_layer.paste(scaled, (pouch_x1 - 30, pouch_y1 - 20))
    else:
        d = ImageDraw.Draw(pouch_layer)
        d.rectangle([pouch_x1 - 30, pouch_y1 - 20, pouch_x2 + 30, pouch_y2 + 20], fill=(240, 235, 225, 255))
        
    seal_layer = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    draw_seal = ImageDraw.Draw(seal_layer)
    draw_seal.rectangle([pouch_x1 - 10, pouch_y1, pouch_x2 + 10, pouch_y1 + 45], fill=(235, 238, 242, 245))
    for step in range(pouch_y1 + 5, pouch_y1 + 42, 6):
        draw_seal.line([(pouch_x1, step), (pouch_x2, step)], fill=(180, 190, 205, 160), width=2)
    draw_seal.line([(pouch_x1 - 10, pouch_y1 + 28), (pouch_x1 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    draw_seal.line([(pouch_x2 - 10, pouch_y1 + 28), (pouch_x2 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    
    gloss_layer = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    draw_gloss = ImageDraw.Draw(gloss_layer)
    draw_gloss.line([(pouch_x1 + 55, pouch_y1 + 50), (pouch_x1 + 45, pouch_y2 - 40)], fill=(255, 255, 255, 80), width=30)
    draw_gloss.line([(pouch_x2 - 50, pouch_y1 + 50), (pouch_x2 - 60, pouch_y2 - 40)], fill=(0, 0, 0, 30), width=20)
    gloss_layer = gloss_layer.filter(ImageFilter.GaussianBlur(8))
    
    label_layer = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    draw_label = ImageDraw.Draw(label_layer)
    lbl_w, lbl_h = 260, 240
    lbl_x1 = 400 - (lbl_w // 2)
    lbl_y1 = 330
    lbl_x2 = 400 + (lbl_w // 2)
    lbl_y2 = lbl_y1 + lbl_h
    
    draw_label.rounded_rectangle([lbl_x1 + 3, lbl_y1 + 5, lbl_x2 + 3, lbl_y2 + 5], radius=16, fill=(0, 0, 0, 45))
    draw_label.rounded_rectangle([lbl_x1, lbl_y1, lbl_x2, lbl_y2], radius=16, fill=(255, 255, 255, 250), outline=(225, 230, 225, 255), width=2)
    
    logo_path = 'public/logo.png'
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert('RGBA')
            lw, lh = logo_img.size
            ratio = min(90 / lw, 38 / lh)
            nlw, nlh = int(lw * ratio), int(lh * ratio)
            logo_img = logo_img.resize((nlw, nlh), Image.Resampling.LANCZOS)
            label_layer.paste(logo_img, (400 - (nlw // 2), lbl_y1 + 18), logo_img)
        except:
            pass
        
    font_large = ImageFont.truetype('arialbd.ttf', 20)
    font_sub = ImageFont.truetype(r'C:\Windows\Fonts\Nirmala.ttf', 18)
    font_wt = ImageFont.truetype('arialbd.ttf', 13)
    
    draw_label.text((400, lbl_y1 + 80), title, fill=(20, 50, 30, 255), font=font_large, anchor='mm')
    if telugu:
        draw_label.text((400, lbl_y1 + 115), telugu, fill=(40, 70, 45, 255), font=font_sub, anchor='mm')
        
    draw_label.line([(lbl_x1 + 30, lbl_y1 + 145), (lbl_x2 - 30, lbl_y1 + 145)], fill=(230, 235, 230, 255), width=1)
    
    pill_w, pill_h = 90, 28
    px1, py1 = 400 - (pill_w // 2), lbl_y1 + 165
    px2, py2 = px1 + pill_w, py1 + pill_h
    draw_label.rounded_rectangle([px1, py1, px2, py2], radius=14, fill=(235, 247, 238, 255), outline=(160, 215, 175, 255), width=1)
    draw_label.text((400, py1 + (pill_h // 2)), wt, fill=(25, 120, 50, 255), font=font_wt, anchor='mm')
    draw_label.text((400, lbl_y1 + 215), "100% PURE & FRESH", fill=(140, 155, 145, 255), font=font_wt, anchor="mm")
    
    pouch_comp = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    pouch_comp.paste(pouch_layer, (0, 0))
    pouch_comp.alpha_composite(seal_layer)
    pouch_comp.alpha_composite(gloss_layer)
    pouch_comp.alpha_composite(label_layer)
    
    pouch_final = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    pouch_final.paste(pouch_comp, (0, 0), pouch_mask)
    
    shadow_layer = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow_layer)
    draw_shadow.ellipse([pouch_x1 - 10, pouch_y2 - 15, pouch_x2 + 10, pouch_y2 + 35], fill=(0, 0, 0, 60))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))
    
    final_canvas = Image.new('RGBA', (800, 800), (255, 255, 255, 255))
    final_canvas.alpha_composite(shadow_layer)
    final_canvas.alpha_composite(pouch_final)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    final_canvas.convert('RGB').save(out_path, 'WEBP', quality=92)
    print(f"Saved: {out_path}")

if __name__ == '__main__':
    make_clean_pouch('Pepper Powder', 'మిరియాల పొడి', 'black pepper powder ground texture', '100g', 'scratch_check/test_pepper_powder_pouch.webp')
    make_clean_pouch('Cardamom (Elaichi)', 'ఏలకులు', 'green cardamom pods raw isolated texture', '100g', 'scratch_check/test_elaichi_pouch.webp')
