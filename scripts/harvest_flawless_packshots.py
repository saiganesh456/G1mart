import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
from PIL import Image
from io import BytesIO
import os

os.makedirs("public/products/packshots", exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

DOWNLOAD_TARGETS = {
    'good-day': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/13c4d1f4-26dc-470b-9940-8fd8c29d2be6/Britannia-Good-Day-Cashew-Cookies.png',
    'kurkure': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/96f46aeb-92ea-47b6-9171-72b7b7904666/Kurkure-Namkeen-Masala-Munch.jpg',
    'fortune-oil': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/d5573936-a73f-4298-8e68-0578dc73f042/Fortune-Sunlite-Refined-Sunflower-Oil.jpeg',
    'sunflower-oil': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/d5573936-a73f-4298-8e68-0578dc73f042/Fortune-Sunlite-Refined-Sunflower-Oil.jpeg',
    'tata-salt': 'https://cdn.zeptonow.com/production/ik-seo/tr:w-312,ar-1200-1200,pr-true,f-auto,q-40/cms/product_variant/1c70221b-4440-4d55-87e7-46fcce72fefd/Tata-Salt-Free-Flowing-and-Iodized-Namak-Vacuum-Evaporated-Salt-in-Fresh.jpeg',
    'aashirvaad-salt': 'https://cdn.zeptonow.com/production/ik-seo/tr:w-312,ar-1200-1200,pr-true,f-auto,q-40/cms/product_variant/1c70221b-4440-4d55-87e7-46fcce72fefd/Tata-Salt-Free-Flowing-and-Iodized-Namak-Vacuum-Evaporated-Salt-in-Fresh.jpeg',
    'vim-bar': 'https://www.bbassets.com/media/uploads/p/l/317229_14-vim-dishwash-bar-lemon.jpg',
    'parachute-oil': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/111e661b-72c8-4aa7-bab4-78352d132144/Parachute-100-Pure-Coconut-Oil-Bottle.jpg',
    'frooti': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/1ac0eea5-566c-40f6-820b-19ec55138957/Frooti-Mango-Fruit-Juice.jpeg',
    'horlicks': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/13127afc-46fe-48c2-b1d1-718e037f54d6/Horlicks-Nutrition-Drink-Jar.jpeg',
    'mysore-sandal-soap': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/f9104904-c8c8-435c-9f15-12db7f0051a0/Mysore-Sandal-Soap.jpeg',
    'surf-excel': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/186a78ad-83db-44bd-94ee-e0481e201454/Surf-Excel-Quick-Wash-Detergent-Powder.png',
    'curd-dahi': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/f235a1ee-7bcb-4fba-b6e3-02c41961198c/Hatsun-Curd-Pouch.jpeg',
    'arun-donut': 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/f3cff741-246a-4806-bc11-b237388ea13f.png',
    'arun-icecream': 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/f3cff741-246a-4806-bc11-b237388ea13f.png',
    'maggi-noodles': 'https://cdn.zeptonow.com/production/ik-seo/inventory/product/35a37616-0c17-4aeb-ace0-36532a9f533e-c875e02e-2d42-4d68-ba50-acd32f107412/Maggi-2-minute-noodles.jpeg',
    'coca-cola': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/aa3aa71a-e094-4547-9357-cd6e73c737f2/Coca-Cola-PET.jpeg',
    'dettol-soap': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/1341bad2-814a-42eb-8de7-600605213348/Dettol-Bathing-Orignal-Soap.jpeg',
    'pooja-agarbatti': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/b6684a84-ea28-478c-81d2-730aeff6f66e/Cycle-Pure-Woods-Natural-Masala-Agarbatti.jpg',
    'ponds-talc': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/82fbc441-0c0b-466f-ac08-c659a93d5fee/Pond-s-Dreamflower-Perfumed-Powder-With-Vitamin-B3-For-Women-Pink-Lily.jpg',
    'cleaner-spray': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/6542690e-10f0-40e5-a5d9-7b2b0b280d38/Colin-Glass-Cleaner-Surface-Cleaner-Liquid-Spray.jpeg',
    'aachi-chilli': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/463b26b9-b7af-4aed-bc1d-f7671d165723/Aachi-Chilli-Powder.jpeg'
}

for slug, url in DOWNLOAD_TARGETS.items():
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code == 200 and len(r.content) > 1000:
            raw = Image.open(BytesIO(r.content))
            
            # If palette mode or RGBA, convert properly
            if raw.mode == 'P':
                img = raw.convert('RGBA')
            else:
                img = raw.convert('RGBA')
                
            # If image has white background or transparent, crop content
            # If slug is vim-bar, the raw is already transparent cutout
            # Let's crop bounding box of non-white or non-transparent
            bbox = img.getbbox()
            if bbox:
                img = img.crop(bbox)
                
            w, h = img.size
            scale = min(500 / w, 500 / h)
            new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Save PNG (transparent canvas)
            canvas_png = Image.new('RGBA', (600, 600), (255, 255, 255, 0))
            offset = ((600 - new_w) // 2, (600 - new_h) // 2)
            canvas_png.paste(resized, offset, resized)
            canvas_png.save(f"public/products/packshots/{slug}.png", "PNG", optimize=True)
            
            # Save JPG (pure white canvas)
            canvas_jpg = Image.new('RGB', (600, 600), (255, 255, 255))
            canvas_jpg.paste(resized, offset, resized)
            canvas_jpg.save(f"public/products/packshots/{slug}.jpg", "JPEG", quality=95, optimize=True)
            
            print(f"[OK] Saved {slug} -> (600, 600) PNG & JPG")
        else:
            print(f"[FAIL] Failed {slug} -> status {r.status_code}")
    except Exception as e:
        print(f"[ERROR] Error {slug} -> {e}")
