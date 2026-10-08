import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import requests
from io import BytesIO
from PIL import Image
from rembg import remove

os.makedirs("public/products/packshots", exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

FLAGGED_ITEMS = [
    # 1. Unibic Choco Ripple (Replaces Aashirvaad Atta photo on Unibic!)
    ("unibic-choco-ripple", "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/770c9ae8-8973-452d-8226-4b4e22675a99/UNIBIC-Choco-Ripple.jpeg"),
    
    # 2. Haldiram Khatta Meetha (Replaces Tea cups / gift box on HR Khatta Meetha!)
    ("haldiram-khatta-meetha", "https://international.haldiram.com/assets/images/products/Khatta_Meetha_big.jpg"),

    # 3. Aashirvaad Double Roasted Suji Rava (Replaces marble floor photo!)
    ("aashirvaad-suji-rava", "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/83fd23b9-d299-42ee-aaef-f40480830a91/Aashirvaad-Double-Roasted-Suji-Rava.jpg"),

    # 4. Lalitha Idli Rava (Replaces Makhana snack photo!)
    ("lalitha-idli-rava", "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2025/12/16/3505e7df-3a0c-48ce-b3f0-3994405e33fc_2LYD9Y0G4V_MN_16122025.png"),

    # 5. Ariel Front Load Liquid 10 (Replaces floor photo!)
    ("ariel-front-liq", "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/25933567-5761-483c-94df-35acd41298ad/Ariel-Power-Gel-Liquid-Detergent-for-Front-load-washing-machine.jpeg"),
    
    # 6. FAB Liquid 10 (Replaces cleaning spray bottles stock photo!)
    ("fab-liquid", "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/CIW/2026/7/30/328380f9-fdd9-47a0-be14-e40512c726de_10908_1.png"),

    # 7. Vim Dishwash Bar (Replaces old photo)
    ("vim-bar", "https://www.bigbasket.com/media/uploads/p/s/317229_14-vim-dishwash-bar-lemon.jpg"),

    # 8. Colgate Strong Teeth (Replaces old photo)
    ("colgate-strong-teeth", "https://www.colgate.com/content/dam/cp-sites-aem/oral-care/oral-care-center/en_in/brand-pages/colgate-strong-teeth/strong-teeth-product-mobile2.png"),
    ("colgate-toothpaste", "https://www.colgate.com/content/dam/cp-sites-aem/oral-care/oral-care-center/en_in/brand-pages/colgate-strong-teeth/strong-teeth-product-mobile2.png"),

    # 9. Disposable Paper Plates / Launch Plate (Replaces party balloons decor!)
    ("launch-plate", "https://png.pngtree.com/png-vector/20240122/ourmid/pngtree-white-disposable-plate-isolated-with-clipping-path-png-image_11444295.png"),
    ("disposable-paper-plates", "https://png.pngtree.com/png-vector/20240122/ourmid/pngtree-white-disposable-plate-isolated-with-clipping-path-png-image_11444295.png"),

    # 10. Turmeric Powder 50g (Replaces Dettol antiseptic bottle!)
    ("turmeric-powder", "https://images.openfoodfacts.org/images/products/890/172/512/5141/front_en.5.400.jpg"),
]

def process_item(slug, url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code != 200 or len(r.content) < 1000:
            print(f"Failed to fetch {slug}: {r.status_code}")
            return False

        img = Image.open(BytesIO(r.content)).convert("RGBA")
        # Remove background
        cutout = remove(img)

        bbox = cutout.getbbox()
        if bbox:
            cutout = cutout.crop(bbox)

        target_size = (600, 600)
        max_dim = 500

        w, h = cutout.size
        scale = min(max_dim / w, max_dim / h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        resized = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Transparent PNG
        trans = Image.new("RGBA", target_size, (255, 255, 255, 0))
        offset = ((target_size[0] - new_w) // 2, (target_size[1] - new_h) // 2)
        trans.paste(resized, offset, resized)
        trans.save(f"public/products/packshots/{slug}.png", "PNG", optimize=True)

        # White JPEG
        white = Image.new("RGBA", target_size, (255, 255, 255, 255))
        white.paste(resized, offset, resized)
        white.convert("RGB").save(f"public/products/packshots/{slug}.jpg", "JPEG", quality=92, optimize=True)

        print(f"Successfully created studio packshot for: {slug}")
        return True
    except Exception as e:
        print(f"Error {slug}: {e}")
        return False

for slug, url in FLAGGED_ITEMS:
    process_item(slug, url)
