import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import requests
from io import BytesIO
from PIL import Image
from rembg import remove

os.makedirs("public/products/packshots", exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

STUDIO_ASSETS = [
    # 1. Cadbury 5 Star - NO HANDS!
    ("cadbury-5-star", [
        "https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/ac3f68dc-cf78-4448-801c-b5e21cc2d458/Cadbury-5-Star-Chocolatey-Bar.jpg",
        "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1100-1100,pr-true,f-auto,q-80/cms/product_variant/b6a1f729-74c6-4ef2-af54-23f49c3983b8/Cadbury-5-Star-Chocolate-Bar-Kitted.jpeg",
        "https://cdn.zeptonow.com/production/tr:w-450,ar-1500-1500,pr-true,f-webp,q-80/inventory/product/0174bbdc-c1f7-470f-8960-ba51e7460f3a-Cadbury_5_Star_Chocolate_Bar_(Pack_of_2).jpg"
    ]),

    # 2. Cadbury Dairy Milk - NO HANDS!
    ("cadbury-dairy-milk", [
        "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1100-1100,pr-true,f-auto,q-40,dpr-2/cms/product_variant/7ebd0461-c4a2-40fa-8736-3568f830051c/Cadbury-Dairy-Milk-Chocolate-Bar-Pack.jpg",
        "https://www.bigbasket.com/media/uploads/p/s/100020979_14-cadbury-dairy-milk-chocolate-bar.jpg",
        "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1100-1100,pr-true,f-auto,q-40,dpr-2/cms/product_variant/0b36025b-3875-4b71-8ebd-27901517b26a/Cadbury-Dairy-Milk-Chocolate-Bar-Pack.jpg"
    ]),

    # 3. Aashirvaad Shuddh Chakki Atta - Crisp & pristine!
    ("aashirvaad-atta", [
        "https://www.bigbasket.com/media/uploads/p/l/40127506_7-aashirvaad-shudh-chakki-atta.jpg",
        "https://m.media-amazon.com/images/I/91Lj2AJXfOL._SL1500_.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40127505_8-aashirvaad-shudh-chakki-atta.jpg"
    ]),
    ("aashirvaad-atta-1kg", [
        "https://www.bigbasket.com/media/uploads/p/l/40127506_7-aashirvaad-shudh-chakki-atta.jpg"
    ]),

    # 4. Turmeric Powder - Bright yellow Haldi, NOT red chilli!
    ("turmeric-powder", [
        "https://www.bbassets.com/media/uploads/p/l/40095122_18-tata-sampann-turmeric-powder.jpg",
        "https://www.bigbasket.com/media/uploads/p/xl/40070758_10-tata-sampann-turmeric-powder.jpg",
        "https://res.retailershakti.com/incom/images/product/Tata-Sampann-Turmeric-Powder-1606729434-10079332-1.jpg"
    ]),

    # 5. Toor Dal - Clean pulse, NO HUMAN FACE!
    ("toor-dal", [
        "https://www.bbassets.com/media/uploads/p/l/40293855_1-fortune-arhartoor-dal-unpolished-sortex-cleaned.jpg",
        "https://www.bbassets.com/media/uploads/p/l/10000425_15-bb-royal-toor-dalarhar-dal-desi.jpg"
    ]),

    # 6. Moong Dal - Golden yellow split dal
    ("moong-dal", [
        "https://www.bbassets.com/media/uploads/p/l/30002287_11-tata-sampann-unpolished-moong-dal.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/40156311_10-tata-sampann-organic-moong-dal.jpg"
    ]),

    # 7. Chana Dal - Clean Bengal gram
    ("chana-dal", [
        "https://www.bigbasket.com/media/uploads/p/l/40156315_10-tata-sampann-organic-chana-dal.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/20005212-7_2-tata-sampann-unpolished-chana-dal.jpg"
    ]),

    # 8. Urad Dal - Minapappu
    ("urad-dal", [
        "https://www.bbassets.com/media/uploads/p/l/10000438_18-bb-royal-urad-dalwhite-split.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/10000436_16-bb-royal-urad-dal-whole.jpg"
    ]),

    # 9. Jeera / Cumin Seeds
    ("jeera-cumin-seeds", [
        "https://www.bbassets.com/media/uploads/p/l/40334089_3-tata-sampann-whole-spices-cumin-seeds.jpg",
        "https://www.bbassets.com/media/uploads/p/s/40334089_1-tata-sampann-whole-spices-cumin-seeds.jpg"
    ]),

    # 10. Coriander Seeds / Dhaniyalu
    ("coriander-seeds", [
        "https://www.bbassets.com/media/uploads/p/m/40351644_1-catch-dhaniacoriander-whole.jpg",
        "https://images.openfoodfacts.org/images/products/890/290/122/2654/front_en.3.400.jpg"
    ]),

    # 11. Coriander Powder
    ("coriander-powder", [
        "https://www.bbassets.com/media/uploads/p/l/40351640_1-catch-origins-double-parrot-corianderdhania-powder.jpg",
        "https://images.openfoodfacts.org/images/products/890/178/643/2011/front_en.3.400.jpg"
    ]),

    # 12. Black Pepper / Miriyalu
    ("black-pepper", [
        "https://www.bbassets.com/media/uploads/p/l/40355232_3-tata-sampann-pure-black-pepper-powder.jpg",
        "https://images.openfoodfacts.org/images/products/890/119/211/4006/front_en.3.400.jpg"
    ]),

    # 13. Mustard Seeds / Rai / Avalu
    ("mustard-seeds", [
        "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=480,h=480/da/cms-assets/cms/product/83e0236e-58a3-4d83-9d9f-2778f8f6321e.jpg"
    ]),

    # 14. Fenugreek Seeds / Methi / Menthulu
    ("fenugreek-seeds", [
        "https://www.bbassets.com/media/uploads/p/l/10000478_10-bb-royal-fenugreekmethi.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40203896_2-bb-royal-organic-methi.jpg"
    ]),

    # 15. Fennel Seeds / Saunf / Sompu
    ("fennel-seeds", [
        "https://www.bbassets.com/media/uploads/p/l/20000476_3-bb-royal-fennelsaunf-big.jpg",
        "https://www.bigbasket.com/media/uploads/p/xl/40100965_11-bb-royal-organic-fennel-saunf-powder.jpg"
    ]),

    # 16. Cloves / Laung / Lavangalu
    ("cloves", [
        "https://www.bbassets.com/media/uploads/p/l/30000279_11-bb-royal-cloveslaunga.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40203901_3-bb-royal-organic-cloves.jpg"
    ]),

    # 17. Green Cardamom / Elaichi / Yalukalu
    ("cardamom", [
        "https://www.bbassets.com/media/uploads/p/l/20000463_11-bb-royal-cardamomelaichi-green.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40093899_8-bb-royal-organic-cardamomelachi-green.jpg"
    ]),

    # 18. Cinnamon / Dalchini
    ("cinnamon", [
        "https://www.bbassets.com/media/uploads/p/l/40324008_1-popular-essentials-cinnamondalchini-whole.jpg"
    ]),

    # 19. Garam Masala
    ("garam-masala", [
        "https://images.openfoodfacts.org/images/products/890/178/610/0507/front_en.4.400.jpg"
    ]),

    # 20. Chicken Masala
    ("chicken-masala", [
        "https://www.bbassets.com/media/uploads/p/l/100286160_2-aachi-masala-chicken.jpg",
        "https://www.bbassets.com/media/uploads/p/l/100286169_3-aachi-masala-pepper-chicken.jpg"
    ]),

    # 21. Biryani Masala
    ("biryani-masala", [
        "https://maharajasuper.com/cdn/shop/files/Aachi-Biryani-Masala-50g-edited_3.png?v=1741924838",
        "https://supersavings.lk/wp-content/uploads/2021/10/aachi-biryani-masala.png"
    ]),

    # 22. Cashew Nuts / Kaju / Jeedi Pappu
    ("cashew-nuts", [
        "https://www.bbassets.com/media/uploads/p/l/40112393_6-bb-royal-cashewkaju-broken.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40088187_17-bb-royal-organic-cashew-broken.jpg"
    ]),

    # 23. Peanuts / Groundnuts / Verusenaga Pappu
    ("peanuts", [
        "https://www.bigbasket.com/media/uploads/p/xl/40094998_10-bb-royal-organic-raw-peanuts.jpg",
        "https://www.bbassets.com/media/uploads/p/l/10000442_21-bb-royal-peanuts-mungaphalishengdana-raw.jpg"
    ]),

    # 24. Dry Coconut / Copra / Yendu Kobbari
    ("dry-coconut", [
        "https://www.bbassets.com/media/uploads/p/m/20000568_6-bb-royal-dry-coprakhopra.jpg"
    ]),

    # 25. Papad / Appalam
    ("aachi-appalam", [
        "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/827fcac3-0358-4e1e-b5d3-6bc6203c4f00/Lijjat-Moong-Papad-Crunchy-Classic.jpeg"
    ]),

    # 26. Basmati Rice
    ("basmati-rice", [
        "https://www.bbassets.com/media/uploads/p/l/40361646_3-india-gate-feast-rozzana-basmati-rice.jpg",
        "https://m.media-amazon.com/images/I/71WlPihg6nL.jpg"
    ]),

    # 27. Vermicelli / Seviyan
    ("vermicelli", [
        "https://www.bigbasket.com/media/uploads/p/l/40086008_8-bambino-vermicelli-roasted.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40086008_10-bambino-vermicelli-roasted.jpg"
    ]),

    # 28. Shampoo
    ("shampoo", [
        "https://www.bbassets.com/media/uploads/p/l/1200006058_3-head-shoulders-cool-menthol-anti-dandruff-shampoo-for-hair-care.jpg"
    ]),

    # 29. Toothpaste (Gel / Red)
    ("close-up-toothpaste", [
        "https://www.bbassets.com/media/uploads/p/l/266639_22-close-up-everfresh-anti-germ-gel-toothpaste-red-hot.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/306128_15-close-up-everfresh-anti-germ-gel-toothpaste-red-hot.jpg"
    ]),

    # 30. Talcum Powder
    ("ponds-talc", [
        "https://www.bbassets.com/media/uploads/p/l/229144_9-ponds-dreamflower-fragrant-talc.jpg",
        "https://www.bbassets.com/media/uploads/p/l/266854_7-ponds-dreamflower-fragrant-talc.jpg"
    ])
]

def process_packshot(slug, urls):
    for u in urls:
        try:
            print(f"Fetching {slug} from: {u[:75]}...")
            r = requests.get(u, headers=HEADERS, timeout=12)
            if r.status_code != 200 or len(r.content) < 1500:
                print(f"  Skipped (code={r.status_code}, len={len(r.content)})")
                continue

            img = Image.open(BytesIO(r.content)).convert("RGBA")
            # Always pre-resize to max 500x500 to keep rembg ONNX lightweight and prevent RAM spikes
            img.thumbnail((500, 500), Image.Resampling.LANCZOS)

            # AI background isolation
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

            # 1. Save transparent PNG
            trans = Image.new("RGBA", target_size, (255, 255, 255, 0))
            offset = ((target_size[0] - new_w) // 2, (target_size[1] - new_h) // 2)
            trans.paste(resized, offset, resized)
            trans.save(f"public/products/packshots/{slug}.png", "PNG", optimize=True)

            # 2. Save pure white JPEG (#FFFFFF studio standard)
            white = Image.new("RGBA", target_size, (255, 255, 255, 255))
            white.paste(resized, offset, resized)
            white.convert("RGB").save(f"public/products/packshots/{slug}.jpg", "JPEG", quality=92, optimize=True)

            print(f"  ✓ SUCCESS: Generated studio packshot for '{slug}'")
            return True
        except Exception as e:
            print(f"  Error on {slug}: {e}")
    return False

success_count = 0
for slug, urls in STUDIO_ASSETS:
    if process_packshot(slug, urls):
        success_count += 1

print(f"\nCompleted! Generated {success_count}/{len(STUDIO_ASSETS)} high-definition studio packshots.")
