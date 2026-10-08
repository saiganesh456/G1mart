import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import requests
from io import BytesIO
from PIL import Image
from rembg import remove

os.makedirs("public/products/packshots", exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

def clean_save(slug, urls):
    for u in urls:
        try:
            print(f"Trying {slug} from {u[:60]}...")
            r = requests.get(u, headers=HEADERS, timeout=12)
            if r.status_code != 200 or len(r.content) < 1500:
                print(f"  Failed: {r.status_code}")
                continue

            img = Image.open(BytesIO(r.content)).convert("RGBA")
            # Pre-resize to max 500x500 to prevent ONNX out of memory
            img.thumbnail((500, 500), Image.Resampling.LANCZOS)

            # Apply AI background removal
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

            # PNG
            trans = Image.new("RGBA", target_size, (255, 255, 255, 0))
            offset = ((target_size[0] - new_w) // 2, (target_size[1] - new_h) // 2)
            trans.paste(resized, offset, resized)
            trans.save(f"public/products/packshots/{slug}.png", "PNG", optimize=True)

            # JPG
            white = Image.new("RGBA", target_size, (255, 255, 255, 255))
            white.paste(resized, offset, resized)
            white.convert("RGB").save(f"public/products/packshots/{slug}.jpg", "JPEG", quality=92, optimize=True)

            print(f"✓ SUCCESSFULLY saved studio photoshoot: {slug}")
            return True
        except Exception as e:
            print(f"  Error on {u[:40]}: {e}")
    return False

ITEMS = [
    ("unibic-choco-ripple", [
        "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/770c9ae8-8973-452d-8226-4b4e22675a99/UNIBIC-Choco-Ripple.jpeg",
        "https://5.imimg.com/data5/SELLER/Default/2023/7/324460577/OJ/SH/BG/34912835/choco-ripple-2-500x500.png"
    ]),
    ("haldiram-khatta-meetha", [
        "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=540/da/cms-assets/cms/product/rc-upload-1771214347138-359.png",
        "https://www.bigbasket.com/media/uploads/p/s/1203950_1-haldirams-namkeen-khatta-meetha.jpg",
        "https://international.haldiram.com/assets/images/products/Khatta_Meetha_big.jpg"
    ]),
    ("lalitha-idli-rava", [
        "https://cdn.zeptonow.com/production/ik-seo/tr:w-312,ar-1200-1200,pr-true,f-auto,q-40/cms/product_variant/37dde588-26a6-4e50-a3d5-e5ae749ce433/Sri-Lalitha-Premium-Idli-Sooji-Rava.jpeg",
        "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2025/12/16/3505e7df-3a0c-48ce-b3f0-3994405e33fc_2LYD9Y0G4V_MN_16122025.png"
    ]),
    ("ariel-front-liq", [
        "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/25933567-5761-483c-94df-35acd41298ad/Ariel-Power-Gel-Liquid-Detergent-for-Front-load-washing-machine.jpeg",
        "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/CIW/2026/7/30/328380f9-fdd9-47a0-be14-e40512c726de_10908_1.png"
    ]),
    ("fab-liquid", [
        "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/25933567-5761-483c-94df-35acd41298ad/Ariel-Power-Gel-Liquid-Detergent-for-Front-load-washing-machine.jpeg",
        "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/CIW/2026/7/30/328380f9-fdd9-47a0-be14-e40512c726de_10908_1.png"
    ]),
    ("vim-bar", [
        "https://www.bigbasket.com/media/uploads/p/s/317229_14-vim-dishwash-bar-lemon.jpg",
        "https://jagsfresh-bucket.s3.amazonaws.com/media/package/img_one/2021-02-04/Vim_Dishwash_Bar_300_g.jpg"
    ]),
    ("colgate-toothpaste", [
        "https://www.colgate.com/content/dam/cp-sites-aem/oral-care/oral-care-center/en_in/brand-pages/colgate-strong-teeth/strong-teeth-product-mobile2.png",
        "https://images.openbeautyfacts.org/images/products/890/131/401/0520/front_en.3.400.jpg"
    ]),
    ("launch-plate", [
        "https://media.istockphoto.com/id/872572508/photo/generic-paper-plate.jpg",
        "https://png.pngtree.com/png-vector/20240122/ourmid/pngtree-white-disposable-plate-isolated-with-clipping-path-png-image_11444295.png"
    ]),
    ("disposable-paper-plates", [
        "https://media.istockphoto.com/id/872572508/photo/generic-paper-plate.jpg"
    ]),
    ("parachute-oil", [
        "https://images.openbeautyfacts.org/images/products/890/108/815/0729/front_en.3.400.jpg",
        "https://images.openbeautyfacts.org/images/products/890/108/800/8723/front_en.10.400.jpg"
    ]),
    ("cleaner-spray", [
        "https://images.openfoodfacts.org/images/products/890/139/631/3106/front_en.10.400.jpg"
    ])
]

for slug, urls in ITEMS:
    clean_save(slug, urls)
