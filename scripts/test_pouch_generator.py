import os
import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import io

os.makedirs("public/products/verified", exist_ok=True)

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
                        if im.size[0] >= 200 and im.size[1] >= 200:
                            return im
                except:
                    continue
    except Exception as e:
        print(f"Error fetching texture for {query}: {e}")
    return None

def create_jeevan_mart_packshot(product_title, search_query, net_weight, out_path):
    print(f"Creating Jeevan Mart pouch for: {product_title}...")
    # Canvas size: 800x800
    canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    
    # 1. Fetch realistic product texture/grain
    texture = fetch_texture_image(f"{search_query} raw high resolution close up")
    if not texture:
        texture = fetch_texture_image(f"{search_query} grocery grain texture")
    
    # 2. Pouch shape parameters
    # Stand-up pouch coordinates
    pouch_x1, pouch_y1 = 180, 100
    pouch_x2, pouch_y2 = 620, 720
    pouch_w = pouch_x2 - pouch_x1
    pouch_h = pouch_y2 - pouch_y1
    
    # Create pouch mask
    pouch_mask = Image.new("L", (800, 800), 0)
    draw_mask = ImageDraw.Draw(pouch_mask)
    
    # Pouch polygon / rounded stand-up pouch shape
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
    
    # Smooth the pouch mask
    pouch_mask = pouch_mask.filter(ImageFilter.GaussianBlur(1))
    
    # 3. Fill pouch with product grain texture
    pouch_layer = Image.new("RGBA", (800, 800), (240, 240, 240, 255))
    if texture:
        tw, th = texture.size
        # Tile or fit texture into pouch area
        scaled_texture = texture.resize((pouch_w + 60, pouch_h + 40), Image.Resampling.LANCZOS)
        pouch_layer.paste(scaled_texture, (pouch_x1 - 30, pouch_y1 - 20))
    else:
        # Fallback warm grain color
        draw_pouch = ImageDraw.Draw(pouch_layer)
        draw_pouch.rectangle([pouch_x1 - 30, pouch_y1 - 20, pouch_x2 + 30, pouch_y2 + 20], fill=(235, 200, 140, 255))
        
    # 4. Top sealed heat-strip (Silver / Frosted metallic grip seal)
    seal_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_seal = ImageDraw.Draw(seal_layer)
    # Heat seal crimps
    draw_seal.rectangle([pouch_x1 - 10, pouch_y1, pouch_x2 + 10, pouch_y1 + 45], fill=(230, 235, 240, 245))
    for step in range(pouch_y1 + 5, pouch_y1 + 42, 6):
        draw_seal.line([(pouch_x1, step), (pouch_x2, step)], fill=(190, 200, 210, 160), width=2)
    # Notch line
    draw_seal.line([(pouch_x1 - 10, pouch_y1 + 28), (pouch_x1 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    draw_seal.line([(pouch_x2 - 10, pouch_y1 + 28), (pouch_x2 + 10, pouch_y1 + 28)], fill=(120, 120, 120, 200), width=3)
    
    # Standup bottom gusset shadow
    draw_seal.ellipse([pouch_x1 + 10, pouch_y2 - 35, pouch_x2 - 10, pouch_y2 + 5], fill=(30, 30, 30, 50))
    
    # 5. Glossy plastic pouch shading & 3D edge highlights
    gloss_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_gloss = ImageDraw.Draw(gloss_layer)
    # Vertical soft sheen highlight on left-middle
    draw_gloss.line([(pouch_x1 + 55, pouch_y1 + 50), (pouch_x1 + 45, pouch_y2 - 40)], fill=(255, 255, 255, 75), width=28)
    draw_gloss.line([(pouch_x2 - 50, pouch_y1 + 50), (pouch_x2 - 60, pouch_y2 - 40)], fill=(0, 0, 0, 35), width=22)
    gloss_layer = gloss_layer.filter(ImageFilter.GaussianBlur(8))
    
    # 6. Premium Branded Label on front
    # Label is a modern matte card with Jeevan Mart logo, product title, and purity guarantee
    label_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_label = ImageDraw.Draw(label_layer)
    
    lbl_x1, lbl_y1 = pouch_x1 + 30, pouch_y1 + 120
    lbl_x2, lbl_y2 = pouch_x2 - 30, pouch_y1 + 340
    
    # Label card with rounded corners and drop shadow
    # Label shadow
    draw_label.rounded_rectangle([lbl_x1 + 4, lbl_y1 + 6, lbl_x2 + 4, lbl_y2 + 6], radius=16, fill=(0, 0, 0, 80))
    # Label background (Deep emerald green + gold accents)
    draw_label.rounded_rectangle([lbl_x1, lbl_y1, lbl_x2, lbl_y2], radius=16, fill=(15, 60, 30, 240), outline=(230, 185, 80, 255), width=3)
    
    # Inner gold border
    draw_label.rounded_rectangle([lbl_x1 + 6, lbl_y1 + 6, lbl_x2 - 6, lbl_y2 - 6], radius=12, outline=(230, 185, 80, 140), width=1)
    
    # Brand Header: "JEEVAN MART" & Logo
    logo_path = "public/logo.png"
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            lw, lh = logo_img.size
            ratio = min(54 / lw, 54 / lh)
            nlw, nlh = int(lw * ratio), int(lh * ratio)
            logo_img = logo_img.resize((nlw, nlh), Image.Resampling.LANCZOS)
            label_layer.paste(logo_img, (lbl_x1 + 22, lbl_y1 + 16), logo_img)
        except:
            pass
            
    # Text: "JEEVAN MART" in bold gold
    draw_label.text((lbl_x1 + 86, lbl_y1 + 26), "JEEVAN MART", fill=(255, 215, 0, 255), anchor="lt")
    draw_label.text((lbl_x1 + 86, lbl_y1 + 46), "DIRECT FARM FRESH QUALITY", fill=(180, 230, 190, 255), anchor="lt")
    
    # Gold separator line
    draw_label.line([(lbl_x1 + 20, lbl_y1 + 75), (lbl_x2 - 20, lbl_y1 + 75)], fill=(230, 185, 80, 200), width=2)
    
    # Product Title in bold white uppercase
    clean_title = product_title.upper()
    if len(clean_title) > 28:
        clean_title = clean_title[:28] + "..."
    draw_label.text(((lbl_x1 + lbl_x2) // 2, lbl_y1 + 115), clean_title, fill=(255, 255, 255, 255), anchor="mm")
    
    # Subtitle / Purity badge
    draw_label.text(((lbl_x1 + lbl_x2) // 2, lbl_y1 + 150), "100% PURE & NATURAL • ZERO PRESERVATIVES", fill=(220, 245, 220, 255), anchor="mm")
    
    # Net Weight & Packaging badge
    draw_label.rounded_rectangle([lbl_x1 + 25, lbl_y1 + 175, lbl_x1 + 145, lbl_y1 + 205], radius=8, fill=(230, 185, 80, 255))
    draw_label.text((lbl_x1 + 85, lbl_y1 + 190), f"NET WT: {net_weight}", fill=(15, 50, 25, 255), anchor="mm")
    
    draw_label.rounded_rectangle([lbl_x2 - 155, lbl_y1 + 175, lbl_x2 - 25, lbl_y1 + 205], radius=8, fill=(35, 95, 55, 255), outline=(230, 185, 80, 180), width=1)
    draw_label.text((lbl_x2 - 90, lbl_y1 + 190), "GRADE A SELECT", fill=(255, 255, 255, 255), anchor="mm")

    # 7. Composite all layers within pouch mask
    pouch_comp = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    pouch_comp.paste(pouch_layer, (0, 0))
    pouch_comp.alpha_composite(seal_layer)
    pouch_comp.alpha_composite(gloss_layer)
    pouch_comp.alpha_composite(label_layer)
    
    # Apply pouch mask
    canvas.paste(pouch_comp, (0, 0), pouch_mask)
    
    # 8. Soft Ground Drop Shadow under pouch
    shadow_layer = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow_layer)
    draw_shadow.ellipse([pouch_x1 - 10, pouch_y2 - 15, pouch_x2 + 10, pouch_y2 + 35], fill=(0, 0, 0, 90))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))
    
    final_canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    final_canvas.alpha_composite(shadow_layer)
    final_canvas.alpha_composite(canvas)
    
    final_canvas.save(out_path, "WEBP", quality=92)
    print(f"Saved: {out_path} ({os.path.getsize(out_path)} bytes)")

# Test on 3 products
create_jeevan_mart_packshot("Kandi Pappu (Toor Dal)", "Toor dal yellow pigeon pea", "1 kg", "public/products/verified/g1-p0327.webp")
create_jeevan_mart_packshot("Idli Rava", "Idli rava rice semolina white", "1 kg", "public/products/verified/g1-p0206.webp")
create_jeevan_mart_packshot("Royal Basmati Rice", "Basmati rice long grain white", "1 kg", "public/products/verified/g1-p0411.webp")
