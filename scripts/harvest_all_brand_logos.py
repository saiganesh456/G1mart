import os
import urllib.request
import urllib.parse
import re
import ssl
import time
from PIL import Image, ImageDraw, ImageFont
import io
import json

os.makedirs("public/brands", exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

BRANDS = [
    ("aashirvaad", "Aashirvaad", "Aashirvaad logo transparent png"),
    ("britannia", "Britannia", "Britannia logo transparent png"),
    ("cadbury", "Cadbury", "Cadbury logo transparent png"),
    ("unibic", "Unibic", "Unibic logo transparent png"),
    ("sunfeast", "Sunfeast", "Sunfeast logo transparent png"),
    ("colgate", "Colgate", "Colgate logo transparent png"),
    ("mysore-sandal", "Mysore Sandal", "Mysore Sandal soap logo transparent png"),
    ("santoor", "Santoor", "Wipro Santoor soap logo transparent png"),
    ("dettol", "Dettol", "Dettol logo transparent png"),
    ("dove", "Dove", "Dove soap logo transparent png"),
    ("pears", "Pears", "Pears soap logo transparent png"),
    ("surf-excel", "Surf Excel", "Surf Excel logo transparent png"),
    ("vim", "Vim", "Vim dishwash logo transparent png"),
    ("exo", "Exo", "Exo dishwash logo transparent png"),
    ("horlicks", "Horlicks", "Horlicks logo transparent png"),
    ("bru", "Bru", "Bru coffee logo transparent png"),
    ("3-roses", "3 Roses", "Brooke Bond 3 Roses tea logo transparent png"),
    ("parle", "Parle", "Parle logo transparent png"),
    ("freedom", "Freedom", "Freedom healthy oil logo transparent png"),
    ("aachi", "Aachi", "Aachi masala logo transparent png"),
    ("kissan", "Kissan", "Kissan logo transparent png"),
    ("knorr", "Knorr", "Knorr soup logo transparent png"),
    ("arun-icecreams", "Arun Icecreams", "Arun Icecreams logo transparent png"),
    ("nestle", "Nestle", "Nestle logo transparent png"),
    ("dabur", "Dabur", "Dabur logo transparent png"),
    ("ponds", "Ponds", "Ponds institute logo transparent png"),
    ("huggies", "Huggies", "Huggies diapers logo transparent png"),
    ("ujala", "Ujala", "Ujala fabric whitener logo transparent png"),
    ("rin", "Rin", "Rin detergent logo transparent png"),
    ("comfort", "Comfort", "Comfort fabric conditioner logo transparent png"),
    ("parachute", "Parachute", "Parachute coconut oil logo transparent png"),
    ("clinic-plus", "Clinic Plus", "Clinic Plus shampoo logo transparent png"),
    ("meera", "Meera", "Meera shampoo logo transparent png"),
    ("bingo", "Bingo", "ITC Bingo logo transparent png"),
    ("lifebuoy", "Lifebuoy", "Lifebuoy logo transparent png"),
    ("himalaya", "Himalaya", "Himalaya herbals logo transparent png"),
    ("cinthol", "Cinthol", "Godrej Cinthol logo transparent png"),
    ("harpic", "Harpic", "Harpic toilet cleaner logo transparent png"),
    ("lizol", "Lizol", "Lizol disinfectant logo transparent png"),
    ("whisper", "Whisper", "Whisper sanitary pads logo transparent png"),
    ("stayfree", "Stayfree", "Stayfree pads logo transparent png"),
    ("ariel", "Ariel", "Ariel detergent logo transparent png"),
    ("tide", "Tide", "Tide detergent logo transparent png"),
    ("thums-up", "Thums Up", "Thums Up logo transparent png"),
    ("coca-cola", "Coca-Cola", "Coca-Cola logo transparent png"),
    ("sprite", "Sprite", "Sprite soda logo transparent png"),
    ("maaza", "Maaza", "Maaza mango logo transparent png"),
    ("limca", "Limca", "Limca drink logo transparent png"),
    ("bambino", "Bambino", "Bambino agro vermicelli logo transparent png"),
    ("mtr", "MTR", "MTR foods logo transparent png"),
    ("tata", "Tata", "Tata logo transparent png"),
    ("tata-salt", "Tata Salt", "Tata Salt logo transparent png"),
    ("wagh-bakri", "Wagh Bakri", "Wagh Bakri tea logo transparent png"),
    ("taj-mahal", "Taj Mahal", "Brooke Bond Taj Mahal tea logo transparent png"),
    ("red-label", "Red Label", "Brooke Bond Red Label tea logo transparent png"),
    ("sensodyne", "Sensodyne", "Sensodyne toothpaste logo transparent png"),
    ("close-up", "Close Up", "Close Up toothpaste logo transparent png"),
    ("eno", "Eno", "Eno fruit salt logo transparent png"),
    ("wheel", "Wheel", "Active Wheel detergent logo transparent png"),
    ("domex", "Domex", "Domex disinfectant cleaner logo transparent png"),
    ("odonil", "Odonil", "Odonil room freshener logo transparent png"),
    ("priya", "Priya", "Priya foods pickles logo transparent png"),
    ("boost", "Boost", "Boost energy drink logo transparent png"),
    ("lipton", "Lipton", "Lipton tea logo transparent png"),
    ("vaseline", "Vaseline", "Vaseline petroleum jelly logo transparent png"),
    ("garnier", "Garnier", "Garnier logo transparent png"),
    ("lotte", "Lotte", "Lotte choco pie logo transparent png"),
    ("fiama", "Fiama", "Fiama Di Wills logo transparent png"),
    ("sunsilk", "Sunsilk", "Sunsilk shampoo logo transparent png"),
    ("medimix", "Medimix", "Medimix ayurvedic soap logo transparent png"),
    ("godrej", "Godrej", "Godrej logo transparent png"),
    ("hatsun", "Hatsun", "Hatsun agro logo transparent png"),
    ("pepsodent", "Pepsodent", "Pepsodent toothpaste logo transparent png"),
    ("yardley", "Yardley", "Yardley London logo transparent png"),
    ("amul", "Amul", "Amul the taste of India logo transparent png"),
    ("sri-durga", "Sri Durga", "Sri Durga ghee logo transparent png"),
    ("zed-black", "Zed Black", "Zed Black agarbatti logo transparent png"),
    ("mangaldeep", "Mangaldeep", "ITC Mangaldeep agarbatti logo transparent png"),
]

def search_logo(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        return []

def download_and_process_logo(url, out_path):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            data = res.read()
            img = Image.open(io.BytesIO(data))
            img = img.convert("RGBA")
            
            # Make square canvas (200x200) with transparent padding
            canvas = Image.new("RGBA", (200, 200), (255, 255, 255, 0))
            w, h = img.size
            if w < 10 or h < 10:
                return False
            ratio = min(170 / w, 170 / h)
            nw = max(1, int(w * ratio))
            nh = max(1, int(h * ratio))
            resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
            offset = ((200 - nw) // 2, (200 - nh) // 2)
            canvas.paste(resized, offset, resized)
            canvas.save(out_path, "PNG")
            return True
    except Exception as e:
        return False

def make_fallback_logo(brand_name, out_path):
    canvas = Image.new("RGBA", (200, 200), (255, 255, 255, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Draw soft circle background
    draw.ellipse([8, 8, 192, 192], fill=(245, 247, 250, 255), outline=(220, 226, 235, 255), width=2)
    
    # Try basic font or text
    # Draw brand initial in bold
    initial = (brand_name[0] if brand_name else "B").upper()
    draw.text((100, 80), initial, fill=(46, 125, 50, 255), anchor="mm")
    
    # Draw brand short name below
    short_name = brand_name[:12]
    draw.text((100, 140), short_name, fill=(30, 41, 59, 255), anchor="mm")
    
    canvas.save(out_path, "PNG")

downloaded = 0
fallbacks = 0

for slug, name, query in BRANDS:
    out_file = f"public/brands/{slug}.png"
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
        downloaded += 1
        continue
    
    urls = search_logo(query)
    success = False
    for u in urls[:5]:
        if download_and_process_logo(u, out_file):
            print(f"[OK] {name} -> {out_file}")
            downloaded += 1
            success = True
            break
        time.sleep(0.1)
    
    if not success:
        print(f"[Fallback] {name}")
        make_fallback_logo(name, out_file)
        fallbacks += 1

print(f"\nDone! Downloaded: {downloaded}, Fallbacks: {fallbacks}")
