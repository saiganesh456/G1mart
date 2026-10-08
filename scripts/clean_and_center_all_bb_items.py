import requests
from PIL import Image
from io import BytesIO

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

BB_STRIP_ITEMS = [
    # 1. Urad Dal - Clean white split urad dal!
    ('urad-dal', 'https://www.bigbasket.com/media/uploads/p/l/40017981_7-tata-sampann-unpolished-urad-dal-split.jpg', 0.72),
    # 2. Cashew Nuts / Kaju
    ('cashew-nuts', 'https://www.bbassets.com/media/uploads/p/l/40112393_6-bb-royal-cashewkaju-broken.jpg', 0.72),
    # 3. Peanuts / Groundnuts
    ('peanuts', 'https://www.bigbasket.com/media/uploads/p/xl/40094998_10-bb-royal-organic-raw-peanuts.jpg', 0.72),
    # 4. Dry Coconut / Copra
    ('dry-coconut', 'https://www.bbassets.com/media/uploads/p/m/20000568_6-bb-royal-dry-coprakhopra.jpg', 0.72),
    # 5. Cloves / Laung
    ('cloves', 'https://www.bbassets.com/media/uploads/p/l/30000279_11-bb-royal-cloveslaunga.jpg', 0.72),
    # 6. Green Cardamom / Elaichi
    ('cardamom', 'https://www.bbassets.com/media/uploads/p/l/20000463_11-bb-royal-cardamomelaichi-green.jpg', 0.72),
    # 7. Fennel Seeds / Saunf / Sompu
    ('fennel-seeds', 'https://www.bbassets.com/media/uploads/p/l/20000476_3-bb-royal-fennelsaunf-big.jpg', 0.72),
    # 8. Fenugreek Seeds / Methi / Menthulu
    ('fenugreek-seeds', 'https://www.bbassets.com/media/uploads/p/l/10000478_10-bb-royal-fenugreekmethi.jpg', 0.72),
    # 9. Cinnamon / Dalchini
    ('cinnamon', 'https://www.bbassets.com/media/uploads/p/l/40324008_1-popular-essentials-cinnamondalchini-whole.jpg', 0.72),
    # 10. Basmati Rice (India Gate)
    ('basmati-rice', 'https://www.bbassets.com/media/uploads/p/l/40361646_3-india-gate-feast-rozzana-basmati-rice.jpg', 0.72),
    # 11. Vermicelli (Bambino)
    ('vermicelli', 'https://www.bigbasket.com/media/uploads/p/l/40086008_8-bambino-vermicelli-roasted.jpg', 0.72),
    # 12. Ponds Talc
    ('ponds-talc', 'https://www.bbassets.com/media/uploads/p/l/229144_9-ponds-dreamflower-fragrant-talc.jpg', 0.72),
    # 13. Close Up Toothpaste
    ('close-up-toothpaste', 'https://www.bbassets.com/media/uploads/p/l/266639_22-close-up-everfresh-anti-germ-gel-toothpaste-red-hot.jpg', 0.72)
]

for name, u, crop_pct in BB_STRIP_ITEMS:
    try:
        r = requests.get(u, headers=headers, timeout=8)
        raw = Image.open(BytesIO(r.content))
        rgba = raw.convert('RGBA')
        w, h = rgba.size
        # Trim right sidebar
        box = rgba.crop((0, 0, int(w * crop_pct), h))
        scale = 520 / max(box.width, box.height)
        new_w, new_h = max(1, int(box.width * scale)), max(1, int(box.height * scale))
        res = box.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Save transparent PNG
        c_png = Image.new('RGBA', (600, 600), (255, 255, 255, 0))
        c_png.paste(res, ((600 - new_w) // 2, (600 - new_h) // 2), res)
        c_png.save(f'public/products/packshots/{name}.png', 'PNG')
        
        # Save pure white JPEG
        c_jpg = Image.new('RGB', (600, 600), (255, 255, 255))
        c_jpg.paste(res, ((600 - new_w) // 2, (600 - new_h) // 2), res)
        c_jpg.save(f'public/products/packshots/{name}.jpg', 'JPEG', quality=95)
        print(f"Cleaned and saved: {name}")
    except Exception as e:
        print(f"Error {name}: {e}")
