import os
import sys
import json
import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image
from io import BytesIO

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKSHOT_DIR = os.path.join(BASE_DIR, 'public', 'products', 'packshots')
VERIFIED_DIR = os.path.join(BASE_DIR, 'public', 'products', 'verified')
os.makedirs(PACKSHOT_DIR, exist_ok=True)
os.makedirs(VERIFIED_DIR, exist_ok=True)

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

def download_and_format_packshot(url, output_path, target_size=(800, 800)):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
        content = res.read()
    
    img = Image.open(BytesIO(content))
    w, h = img.size
    if w < 120 or h < 120:
        raise Exception(f"Image too small: {w}x{h}")
    
    # Standardize to 800x800 with white background
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(700 / w, 700 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2), mask=resized)
    else:
        img = img.convert('RGB')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(700 / w, 700 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2))
    
    canvas.save(output_path, 'WEBP', quality=92)
    return True

BRANDS_TO_FETCH = [
    {
        'name': 'Tata Salt Vacuum Evaporated Iodised Salt 1kg',
        'file': 'tata-salt-1kg.webp',
        'queries': [
            'Tata Salt Vacuum Evaporated Iodised Salt 1kg packshot amazon',
            'Tata Salt 1kg pouch white background packshot',
            'Tata Salt 1 kg packet jiomart'
        ]
    },
    {
        'name': 'Aashirvaad Iodised Salt 1kg',
        'file': 'aashirvaad-salt-1kg.webp',
        'queries': [
            'Aashirvaad Iodized Salt 1kg pouch jiomart',
            'Aashirvaad Iodised Salt 1kg packshot',
            'Aashirvaad Salt 1kg packet amazon'
        ]
    },
    {
        'name': 'Aashirvaad Crystal Salt 1kg Kallu Uppu',
        'file': 'aashirvaad-crystal-salt-1kg.webp',
        'queries': [
            'Aashirvaad Crystal Salt 1kg packshot',
            'Aashirvaad Iodized Crystal Salt 1 kg jiomart',
            'Aashirvaad Kallu Uppu 1kg packet'
        ]
    },
    {
        'name': 'Tata Salt Lite 1kg Low Sodium',
        'file': 'tata-salt-lite-1kg.webp',
        'queries': [
            'Tata Salt Lite 1kg packshot',
            'Tata Salt Lite Low Sodium Salt 1kg jiomart'
        ]
    },
    {
        'name': 'Tata Himalayan Rock Salt Sendha Namak 1kg',
        'file': 'tata-rock-salt-1kg.webp',
        'queries': [
            'Tata Himalayan Rock Salt 1kg packshot',
            'Tata Salt Rock Salt Sendha Namak 1kg jiomart'
        ]
    },
    {
        'name': 'Tata Salt Black Salt 200g Kala Namak',
        'file': 'tata-black-salt-200g.webp',
        'queries': [
            'Tata Salt Black Salt 200g packshot',
            'Tata Salt Kala Namak 200g jiomart'
        ]
    },
    {
        'name': 'Catch Table Salt Sprinkler 200g',
        'file': 'catch-table-salt-sprinkler-200g.webp',
        'queries': [
            'Catch Table Salt Sprinkler 200g packshot amazon',
            'Catch Table Salt Sprinkler 200 g jiomart'
        ]
    },
    {
        'name': 'Catch Black Salt Sprinkler 200g',
        'file': 'catch-black-salt-sprinkler-200g.webp',
        'queries': [
            'Catch Black Salt Sprinkler 200g packshot amazon',
            'Catch Kala Namak Sprinkler 200 g jiomart'
        ]
    },
    {
        'name': 'Puro Healthy Salt Himalayan Pink Rock Salt 1kg',
        'file': 'puro-rock-salt-1kg.webp',
        'queries': [
            'Puro Healthy Salt 1kg pouch packshot',
            'Puro Himalayan Pink Rock Salt 1kg jiomart'
        ]
    },
    {
        'name': 'Madhur Pure Sulphurless Sugar 1kg',
        'file': 'madhur-sugar-1kg.webp',
        'queries': [
            'Madhur Pure and Hygienic Sugar 1kg packshot',
            'Madhur Sugar 1kg pouch jiomart'
        ]
    },
    {
        'name': 'Trust Classic Pure Cane Sugar 1kg',
        'file': 'trust-classic-sugar-1kg.webp',
        'queries': [
            'Trust Classic Pure Cane Sugar 1kg packshot',
            'Trust Classic Sugar 1kg jiomart'
        ]
    },
    {
        'name': 'Parrys Pure Refined Sugar 1kg',
        'file': 'parrys-sugar-1kg.webp',
        'queries': [
            'Parrys Pure Refined Sugar 1kg packet packshot',
            'Parrys Sugar 1kg packet jiomart'
        ]
    },
    {
        'name': 'Trust Natural Demerara Brown Sugar 500g',
        'file': 'trust-brown-sugar-500g.webp',
        'queries': [
            'Trust Natural Demerara Brown Sugar 500g packshot',
            'Trust Brown Sugar 500g jiomart'
        ]
    },
    {
        'name': 'Sugar Free Gold Pellets 100 Dispenser',
        'file': 'sugar-free-gold-100p.webp',
        'queries': [
            'Sugar Free Gold 100 Pellets packshot',
            'Sugar Free Gold Sweetener 100 pellets dispenser'
        ]
    },
    {
        'name': 'Sugar Free Natura Sweetener Powder 100g',
        'file': 'sugar-free-natura-100g.webp',
        'queries': [
            'Sugar Free Natura 100g jar packshot',
            'Sugar Free Natura Diet Sugar 100g'
        ]
    },
    {
        'name': '24 Mantra Organic Jaggery Powder 500g',
        'file': '24-mantra-organic-jaggery-500g.webp',
        'queries': [
            '24 Mantra Organic Jaggery Powder 500g packshot',
            '24 Mantra Jaggery 500g jiomart'
        ]
    },
    {
        'name': 'Organic Tattva Jaggery Powder 500g',
        'file': 'organic-tattva-jaggery-powder-500g.webp',
        'queries': [
            'Organic Tattva Jaggery Powder 500g packshot',
            'Organic Tattva Organic Jaggery Powder 500g jiomart'
        ]
    },
    {
        'name': 'Patanjali Jaggery Gur 1kg',
        'file': 'patanjali-jaggery-1kg.webp',
        'queries': [
            'Patanjali Jaggery 1kg packet packshot',
            'Patanjali Gur 1kg pack jiomart'
        ]
    },
    {
        'name': 'Slurrp Farm Organic Jaggery Powder 500g',
        'file': 'slurrp-farm-jaggery-500g.webp',
        'queries': [
            'Slurrp Farm Organic Jaggery Powder 500g packshot',
            'Slurrp Farm Jaggery 500g amazon'
        ]
    },
    {
        'name': 'Dabur Pure Honey 500g',
        'file': 'dabur-honey-500g.webp',
        'queries': [
            'Dabur Honey 500g glass bottle packshot jiomart',
            'Dabur Pure Honey 500g bottle packshot'
        ]
    },
    {
        'name': 'Patanjali Pure Honey 500g',
        'file': 'patanjali-honey-500g.webp',
        'queries': [
            'Patanjali Pure Honey 500g bottle packshot jiomart',
            'Patanjali Honey 500g packshot'
        ]
    },
    {
        'name': 'Lion Honey 500g',
        'file': 'lion-honey-500g.webp',
        'queries': [
            'Lion Kashmir Honey 500g bottle packshot',
            'Lion Honey 500g bottle jiomart'
        ]
    },
    {
        'name': 'Saffola Active 100% Pure Honey 500g',
        'file': 'saffola-honey-500g.webp',
        'queries': [
            'Saffola Honey 500g bottle packshot jiomart',
            'Saffola 100 Pure Honey 500g packshot'
        ]
    }
]

def main():
    print("Curating pristine studio packshots for Salt, Sugar & Jaggery...")
    for idx, item in enumerate(BRANDS_TO_FETCH, 1):
        target_path = os.path.join(VERIFIED_DIR, item['file'])
        packshot_path = os.path.join(PACKSHOT_DIR, item['file'])

        # Also replace broken packshots
        print(f"[{idx}/{len(BRANDS_TO_FETCH)}] Fetching: {item['name']} -> {item['file']}")
        saved = False
        for q in item['queries']:
            urls = search_bing(q)
            for u in urls[:10]:
                if any(bad in u.lower() for bad in ['svg', 'gif', 'car', 'vehicle', 'auto', 'tata-motors', 'wallpaper', 'logo']):
                    continue
                try:
                    download_and_format_packshot(u, target_path)
                    # Also save in packshot_dir for backwards compatibility
                    download_and_format_packshot(u, packshot_path)
                    print(f"   ✓ SUCCESS from: {u[:75]}")
                    saved = True
                    break
                except Exception as e:
                    pass
            if saved:
                break
        if not saved:
            print(f"   ✗ FAILED to fetch for: {item['name']}")

    # Specifically fix legacy paths:
    # Overwrite tata-salt.jpg and tata-salt.png with authentic tata-salt-1kg.webp!
    tata_salt_src = os.path.join(VERIFIED_DIR, 'tata-salt-1kg.webp')
    if os.path.exists(tata_salt_src):
        im = Image.open(tata_salt_src)
        im.save(os.path.join(PACKSHOT_DIR, 'tata-salt.jpg'), 'JPEG', quality=95)
        im.save(os.path.join(PACKSHOT_DIR, 'tata-salt.png'), 'PNG')
        print("✓ Overwrote legacy tata-salt.jpg (car) and tata-salt.png with real Tata Salt packshot!")

    # Overwrite aashirvaad-salt.jpg and aashirvaad-salt.png with authentic aashirvaad-salt-1kg.webp!
    aashirvaad_salt_src = os.path.join(VERIFIED_DIR, 'aashirvaad-salt-1kg.webp')
    if os.path.exists(aashirvaad_salt_src):
        im = Image.open(aashirvaad_salt_src)
        im.save(os.path.join(PACKSHOT_DIR, 'aashirvaad-salt.jpg'), 'JPEG', quality=95)
        im.save(os.path.join(PACKSHOT_DIR, 'aashirvaad-salt.png'), 'PNG')
        print("✓ Overwrote legacy aashirvaad-salt.jpg and aashirvaad-salt.png with real Aashirvaad Salt packshot!")

if __name__ == '__main__':
    main()
