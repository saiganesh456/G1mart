import os
import sys
import json
import urllib.request
import ssl
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKSHOT_DIR = os.path.join(BASE_DIR, 'public', 'products', 'packshots')
VERIFIED_DIR = os.path.join(BASE_DIR, 'public', 'products', 'verified')
POUCH_DIR = os.path.join(BASE_DIR, 'public', 'products', 'generated_pouches')
os.makedirs(PACKSHOT_DIR, exist_ok=True)
os.makedirs(VERIFIED_DIR, exist_ok=True)
os.makedirs(POUCH_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Download & Format Authentic Branded Packshots
# ---------------------------------------------------------------------------
BRAND_URLS = [
    {
        'id': 'tata-salt',
        'url': 'https://www.bbassets.com/media/uploads/p/l/241600_11-tata-salt-iodized.jpg',
        'out_verified': 'tata-salt-1kg.webp',
        'legacy_packshots': ['tata-salt.jpg', 'tata-salt.png', 'tata-salt-1kg.webp']
    },
    {
        'id': 'aashirvaad-salt',
        'url': 'https://www.bbassets.com/media/uploads/p/l/236834_10-aashirvaad-salt-iodised.jpg',
        'out_verified': 'aashirvaad-salt-1kg.webp',
        'legacy_packshots': ['aashirvaad-salt.jpg', 'aashirvaad-salt.png', 'aashirvaad-salt-1kg.webp']
    },
    {
        'id': 'catch-salt',
        'url': 'https://www.bbassets.com/media/uploads/p/l/10000404_18-catch-sprinklers-table-salt-iodized.jpg',
        'out_verified': 'catch-table-salt-sprinkler-200g.webp',
        'legacy_packshots': ['catch-table-salt-sprinkler-200g.webp']
    },
    {
        'id': 'madhur-sugar',
        'url': 'https://www.bbassets.com/media/uploads/p/l/244096_7-madhur-sugar-refined.jpg',
        'out_verified': 'madhur-sugar-1kg.webp',
        'legacy_packshots': ['madhur-sugar.jpg', 'madhur-sugar-clean.png', 'madhur-sugar-1kg.webp']
    },
    {
        'id': 'parrys-sugar',
        'url': 'https://www.bbassets.com/media/uploads/p/l/40004538_4-parrys-sugar-white-label.jpg',
        'out_verified': 'parrys-sugar-1kg.webp',
        'legacy_packshots': ['parrys-sugar-1kg.webp']
    },
    {
        'id': 'dabur-honey',
        'url': 'https://www.bbassets.com/media/uploads/p/xxl/202277_13-dabur-100-pure-honey-worlds-no1-honey-brand-with-no-sugar-adulteration.jpg',
        'out_verified': 'dabur-honey-500g.webp',
        'legacy_packshots': ['dabur-honey-500g.webp']
    },
    {
        'id': 'sugar-free-gold',
        'url': 'https://www.bbassets.com/media/uploads/p/l/40108475_7-sugar-free-gold-low-calorie-sweetener.jpg',
        'out_verified': 'sugar-free-gold-100p.webp',
        'legacy_packshots': ['sugar-free-gold-100p.webp']
    },
    {
        'id': 'lion-honey',
        'url': 'https://www.bbassets.com/media/uploads/p/l/275208_5-lion-honey-kashmir.jpg',
        'out_verified': 'lion-honey-500g.webp',
        'legacy_packshots': ['lion-honey-500g.webp']
    },
    {
        'id': 'puro-salt',
        'url': 'https://www.bbassets.com/media/uploads/p/l/40182432_3-puro-healthy-salt-natural-himalayan-pink-rock-salt.jpg',
        'out_verified': 'puro-rock-salt-1kg.webp',
        'legacy_packshots': ['puro-rock-salt-1kg.webp']
    }
]

def format_packshot(img, target_size=(800, 800)):
    w, h = img.size
    canvas = Image.new('RGB', target_size, (255, 255, 255))
    scale = min(700 / w, 700 / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        resized_rgba = img.convert('RGBA').resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized_rgba, ((800 - nw) // 2, (800 - nh) // 2), mask=resized_rgba)
    else:
        canvas.paste(resized, ((800 - nw) // 2, (800 - nh) // 2))
    return canvas

def process_branded_images():
    print("=== 1. PROCESSING BRANDED PRODUCT IMAGES ===")
    for item in BRAND_URLS:
        print(f"Fetching {item['id']}...")
        try:
            req = urllib.request.Request(item['url'], headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
                raw_data = r.read()
            raw_img = Image.open(BytesIO(raw_data))
            formatted = format_packshot(raw_img)

            # Save in verified
            ver_path = os.path.join(VERIFIED_DIR, item['out_verified'])
            formatted.save(ver_path, 'WEBP', quality=95)
            print(f"  [OK] Saved verified: {item['out_verified']}")

            # Save legacy packshot aliases
            for alias in item['legacy_packshots']:
                p_path = os.path.join(PACKSHOT_DIR, alias)
                if alias.endswith('.jpg'):
                    formatted.save(p_path, 'JPEG', quality=95)
                elif alias.endswith('.png'):
                    formatted.save(p_path, 'PNG')
                else:
                    formatted.save(p_path, 'WEBP', quality=95)
                print(f"  [OK] Saved alias: {alias}")
        except Exception as e:
            print(f"  [FAIL] Error for {item['id']}: {e}")

    # Synchronize Aashirvaad Crystal Salt
    crystal_src = os.path.join(VERIFIED_DIR, 'g1-p0482.webp')
    if os.path.exists(crystal_src):
        c_img = Image.open(crystal_src)
        c_fmt = format_packshot(c_img)
        c_fmt.save(os.path.join(VERIFIED_DIR, 'aashirvaad-crystal-salt-1kg.webp'), 'WEBP', quality=95)
        c_fmt.save(os.path.join(PACKSHOT_DIR, 'aashirvaad-crystal-salt.jpg'), 'JPEG', quality=95)
        c_fmt.save(os.path.join(PACKSHOT_DIR, 'aashirvaad-crystal-salt.png'), 'PNG')
        print("  [OK] Aashirvaad Crystal Salt synced across verified and packshots!")

# ---------------------------------------------------------------------------
# 2. Build High-Quality Jeevan Mart Private Label Pouches with Exact Logo
# ---------------------------------------------------------------------------
def build_jeevanmart_pouches():
    print("\n=== 2. GENERATING JEEVAN MART PRIVATE LABEL POUCHES ===")
    logo_path = os.path.join(BASE_DIR, 'public', 'logo.png')
    logo_raw = Image.open(logo_path).convert('RGBA')
    logo_bbox = logo_raw.getbbox()
    logo_cropped = logo_raw.crop(logo_bbox) # Exact tight high-res logo

    # Pouch items specification
    pouch_specs = [
        {
            'file': 'g1_crystal_salt_pouch.webp',
            'eng1': 'Natural Crystal Salt',
            'eng2': '(Kallu Uppu / Sea Salt)',
            'tel': 'కల్లు ఉప్పు',
            'weight': 'NET WT: 1 KG',
            'accent': (22, 101, 52),     # Fresh green
            'bg_tone': (248, 252, 250),
            'border_tone': (200, 230, 210)
        },
        {
            'file': 'g1_table_salt_pouch.webp',
            'eng1': 'Iodised Table Salt',
            'eng2': '(Vacuum Refined Salt)',
            'tel': 'మెత్తటి ఉప్పు',
            'weight': 'NET WT: 1 KG',
            'accent': (22, 101, 52),
            'bg_tone': (248, 252, 250),
            'border_tone': (200, 230, 210)
        },
        {
            'file': 'g1_sugar_pouch.webp',
            'eng1': 'Refined White Sugar',
            'eng2': '(Pure Cane Panchadara)',
            'tel': 'పంచదార',
            'weight': 'NET WT: 1 KG',
            'accent': (180, 83, 9),      # Amber/Gold accent
            'bg_tone': (255, 254, 248),
            'border_tone': (245, 230, 200)
        },
        {
            'file': 'g1_bellam_pouch.webp',
            'eng1': 'Pure Country Bellam',
            'eng2': '(Unpolished Desi Jaggery)',
            'tel': 'స్వచ్ఛమైన బెల్లం',
            'weight': 'NET WT: 1 KG',
            'accent': (146, 64, 14),     # Rich jaggery amber
            'bg_tone': (255, 252, 245),
            'border_tone': (240, 215, 175)
        },
        {
            'file': 'g1_thati_bellam_pouch.webp',
            'eng1': 'Pure Thati Bellam',
            'eng2': '(Palm Jaggery / Karupatti)',
            'tel': 'తాటి బెల్లం',
            'weight': 'NET WT: 500g',
            'accent': (120, 53, 15),     # Deep palm jaggery
            'bg_tone': (254, 250, 245),
            'border_tone': (235, 205, 170)
        },
        {
            'file': 'g1_patika_bellam_pouch.webp',
            'eng1': 'Patika Bellam',
            'eng2': '(Mishri Rock Sugar Crystals)',
            'tel': 'పటిక బెల్లం',
            'weight': 'NET WT: 500g',
            'accent': (22, 101, 52),
            'bg_tone': (250, 252, 250),
            'border_tone': (210, 235, 220)
        },
        {
            'file': 'g1_jaggery_powder_pouch.webp',
            'eng1': 'Organic Jaggery Powder',
            'eng2': '(Pure Bellam Thoolu / Gur)',
            'tel': 'బెల్లం తూలు',
            'weight': 'NET WT: 500g',
            'accent': (146, 64, 14),
            'bg_tone': (255, 252, 245),
            'border_tone': (240, 215, 175)
        }
    ]

    font_eng1 = ImageFont.truetype("arialbd.ttf", 34)
    font_eng2 = ImageFont.truetype("arialbd.ttf", 23)
    font_tel = ImageFont.truetype("C:\\Windows\\Fonts\\Nirmala.ttc", 38)
    font_wt = ImageFont.truetype("arialbd.ttf", 20)
    font_brand = ImageFont.truetype("arialbd.ttf", 15)

    for spec in pouch_specs:
        canvas = Image.new('RGB', (800, 800), (255, 255, 255))
        draw = ImageDraw.Draw(canvas)

        # 1. Elegant Studio Stand-Up Pouch Outline (Curved corners, pristine shadow)
        # Soft outer shadow
        draw.rounded_rectangle([170, 70, 630, 735], radius=28, fill=(0, 0, 0, 15))
        draw.rounded_rectangle([172, 72, 628, 733], radius=28, fill=(0, 0, 0, 25))

        # Main Pouch Body
        draw.rounded_rectangle([170, 70, 630, 730], radius=28, fill=spec['bg_tone'], outline=spec['border_tone'], width=3)

        # Top seal ribbing details
        for y_seal in range(85, 130, 10):
            draw.line([(200, y_seal), (600, y_seal)], fill=(225, 235, 228), width=1)
        # Notch cutouts
        draw.polygon([(170, 135), (185, 140), (170, 145)], fill=(255, 255, 255))
        draw.polygon([(630, 135), (615, 140), (630, 145)], fill=(255, 255, 255))

        # 2. Crisp White Label Plaque
        lx1, ly1, lx2, ly2 = 210, 160, 590, 650
        draw.rounded_rectangle([lx1 + 2, ly1 + 3, lx2 + 2, ly2 + 4], radius=20, fill=(0, 0, 0, 30))
        draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=20, fill=(255, 255, 255), outline=spec['border_tone'], width=2)

        # 3. Paste the Official Jeevan Mart / G1 Mart Logo
        target_logo_w = 260
        target_logo_h = int(logo_cropped.height * (target_logo_w / logo_cropped.width))
        scaled_logo = logo_cropped.resize((target_logo_w, target_logo_h), Image.Resampling.LANCZOS)
        logo_x = (800 - target_logo_w) // 2
        logo_y = ly1 + 25
        canvas.paste(scaled_logo, (logo_x, logo_y), mask=scaled_logo)

        # Gold decorative divider
        draw.line([(250, logo_y + target_logo_h + 18), (550, logo_y + target_logo_h + 18)], fill=spec['border_tone'], width=2)

        # 4. Product Typography
        # English Title
        draw.text((400, logo_y + target_logo_h + 46), spec['eng1'], fill=spec['accent'], font=font_eng1, anchor="mm")
        # English Subtitle
        draw.text((400, logo_y + target_logo_h + 82), spec['eng2'], fill=(90, 105, 95), font=font_eng2, anchor="mm")

        # Telugu Name (Deep rich color)
        draw.text((400, logo_y + target_logo_h + 138), spec['tel'], fill=(20, 50, 30), font=font_tel, anchor="mm")

        # Purity / Quality Badge
        badge_y = ly2 - 68
        draw.rounded_rectangle([270, badge_y, 530, badge_y + 36], radius=18, fill=(240, 248, 242), outline=(180, 220, 195), width=1)
        draw.text((400, badge_y + 18), "100% PURE & NATURAL • DAILY ESSENTIALS", fill=(30, 110, 50), font=font_brand, anchor="mm")

        # Net Weight Plaque
        draw.rounded_rectangle([290, ly2 - 20, 510, ly2 + 20], radius=12, fill=spec['accent'], outline=(255, 255, 255), width=2)
        draw.text((400, ly2), spec['weight'], fill=(255, 255, 255), font=font_wt, anchor="mm")

        # Save to generated_pouches and verified
        out_pouch = os.path.join(POUCH_DIR, spec['file'])
        out_ver = os.path.join(VERIFIED_DIR, spec['file'])
        canvas.save(out_pouch, 'WEBP', quality=95)
        canvas.save(out_ver, 'WEBP', quality=95)
        print(f"  [OK] Generated {spec['file']} with exact official logo!")

if __name__ == '__main__':
    process_branded_images()
    build_jeevanmart_pouches()
