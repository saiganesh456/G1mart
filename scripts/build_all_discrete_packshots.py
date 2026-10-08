import os
import requests
from PIL import Image
from io import BytesIO

os.makedirs("public/products/packshots", exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

ITEMS = [
    # 1. Moong Dal
    ("moong-dal", [
        "https://www.bbassets.com/media/uploads/p/l/30002287_11-tata-sampann-unpolished-moong-dal.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/40156311_10-tata-sampann-organic-moong-dal.jpg"
    ]),

    # 2. Chana Dal
    ("chana-dal", [
        "https://www.bigbasket.com/media/uploads/p/l/40156315_10-tata-sampann-organic-chana-dal.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/20005212-7_2-tata-sampann-unpolished-chana-dal.jpg"
    ]),

    # 3. Urad Dal
    ("urad-dal", [
        "https://www.bbassets.com/media/uploads/p/l/10000438_18-bb-royal-urad-dalwhite-split.jpg",
        "https://www.bigbasket.com/media/uploads/p/l/10000436_16-bb-royal-urad-dal-whole.jpg"
    ]),

    # 4. Jeera / Cumin Seeds
    ("jeera-cumin-seeds", [
        "https://www.bbassets.com/media/uploads/p/l/40334089_3-tata-sampann-whole-spices-cumin-seeds.jpg",
        "https://www.bbassets.com/media/uploads/p/s/40334089_1-tata-sampann-whole-spices-cumin-seeds.jpg"
    ]),

    # 5. Coriander Seeds
    ("coriander-seeds", [
        "https://www.bbassets.com/media/uploads/p/m/40351644_1-catch-dhaniacoriander-whole.jpg",
        "https://images.openfoodfacts.org/images/products/890/290/122/2654/front_en.3.400.jpg"
    ]),

    # 6. Coriander Powder
    ("coriander-powder", [
        "https://www.bbassets.com/media/uploads/p/l/40351640_1-catch-origins-double-parrot-corianderdhania-powder.jpg",
        "https://images.openfoodfacts.org/images/products/890/178/643/2011/front_en.3.400.jpg"
    ]),

    # 7. Black Pepper
    ("black-pepper", [
        "https://www.bbassets.com/media/uploads/p/l/40355232_3-tata-sampann-pure-black-pepper-powder.jpg",
        "https://images.openfoodfacts.org/images/products/890/119/211/4006/front_en.3.400.jpg"
    ]),

    # 8. Mustard Seeds
    ("mustard-seeds", [
        "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=480,h=480/da/cms-assets/cms/product/83e0236e-58a3-4d83-9d9f-2778f8f6321e.jpg"
    ]),

    # 9. Fenugreek Seeds
    ("fenugreek-seeds", [
        "https://www.bbassets.com/media/uploads/p/l/10000478_10-bb-royal-fenugreekmethi.jpg"
    ]),

    # 10. Fennel Seeds
    ("fennel-seeds", [
        "https://www.bbassets.com/media/uploads/p/l/20000476_3-bb-royal-fennelsaunf-big.jpg"
    ]),

    # 11. Cloves
    ("cloves", [
        "https://www.bbassets.com/media/uploads/p/l/30000279_11-bb-royal-cloveslaunga.jpg"
    ]),

    # 12. Cardamom
    ("cardamom", [
        "https://www.bbassets.com/media/uploads/p/l/20000463_11-bb-royal-cardamomelaichi-green.jpg"
    ]),

    # 13. Cinnamon
    ("cinnamon", [
        "https://www.bbassets.com/media/uploads/p/l/40324008_1-popular-essentials-cinnamondalchini-whole.jpg"
    ]),

    # 14. Garam Masala
    ("garam-masala", [
        "https://images.openfoodfacts.org/images/products/890/178/610/0507/front_en.4.400.jpg"
    ]),

    # 15. Chicken Masala
    ("chicken-masala", [
        "https://www.bbassets.com/media/uploads/p/l/100286160_2-aachi-masala-chicken.jpg"
    ]),

    # 16. Biryani Masala
    ("biryani-masala", [
        "https://maharajasuper.com/cdn/shop/files/Aachi-Biryani-Masala-50g-edited_3.png?v=1741924838",
        "https://supersavings.lk/wp-content/uploads/2021/10/aachi-biryani-masala.png"
    ]),

    # 17. Cashew Nuts
    ("cashew-nuts", [
        "https://www.bbassets.com/media/uploads/p/l/40112393_6-bb-royal-cashewkaju-broken.jpg"
    ]),

    # 18. Peanuts
    ("peanuts", [
        "https://www.bigbasket.com/media/uploads/p/xl/40094998_10-bb-royal-organic-raw-peanuts.jpg",
        "https://www.bbassets.com/media/uploads/p/l/10000442_21-bb-royal-peanuts-mungaphalishengdana-raw.jpg"
    ]),

    # 19. Dry Coconut
    ("dry-coconut", [
        "https://www.bbassets.com/media/uploads/p/m/20000568_6-bb-royal-dry-coprakhopra.jpg"
    ]),

    # 20. Papad / Appalam
    ("aachi-appalam", [
        "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/827fcac3-0358-4e1e-b5d3-6bc6203c4f00/Lijjat-Moong-Papad-Crunchy-Classic.jpeg"
    ]),

    # 21. Basmati Rice
    ("basmati-rice", [
        "https://www.bbassets.com/media/uploads/p/l/40361646_3-india-gate-feast-rozzana-basmati-rice.jpg"
    ]),

    # 22. Vermicelli
    ("vermicelli", [
        "https://www.bigbasket.com/media/uploads/p/l/40086008_8-bambino-vermicelli-roasted.jpg"
    ]),

    # 23. Shampoo
    ("shampoo", [
        "https://www.bbassets.com/media/uploads/p/l/1200006058_3-head-shoulders-cool-menthol-anti-dandruff-shampoo-for-hair-care.jpg"
    ]),

    # 24. Toothpaste (Gel)
    ("close-up-toothpaste", [
        "https://www.bbassets.com/media/uploads/p/l/266639_22-close-up-everfresh-anti-germ-gel-toothpaste-red-hot.jpg"
    ]),

    # 25. Talc
    ("ponds-talc", [
        "https://www.bbassets.com/media/uploads/p/l/229144_9-ponds-dreamflower-fragrant-talc.jpg"
    ])
]

def process_item(slug, urls):
    for u in urls:
        try:
            r = requests.get(u, headers=headers, timeout=8)
            if r.status_code != 200 or len(r.content) < 1000:
                continue
            
            img = Image.open(BytesIO(r.content)).convert('RGB')
            w, h = img.size
            
            # If image has the BigBasket side strip on the right, crop it:
            # BB side strip is usually right 20% of the image if aspect ratio is roughly 1:1 and right column is colored
            # Check right 15% edge:
            if 'bbassets' in u or 'bigbasket' in u:
                right_sample = img.crop((int(w * 0.85), int(h * 0.2), w, int(h * 0.8)))
                # If right sample isn't white, crop the main packet:
                # E.g. main packet is at x: 0 to 80%
                # Only crop if there's an actual side strip
                colors = right_sample.getcolors(maxcolors=1000)
                # If predominantly non-white:
                # We can crop the main packet (left ~78%)
                # Let's inspect if right column is mostly a solid color
                # For safety, crop only if the side strip text is present
                pass
            
            scale = 520 / max(w, h)
            new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))
            res = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            canvas = Image.new('RGB', (600, 600), (255, 255, 255))
            canvas.paste(res, ((600 - new_w) // 2, (600 - new_h) // 2))
            
            canvas.save(f"public/products/packshots/{slug}.jpg", "JPEG", quality=95)
            canvas.save(f"public/products/packshots/{slug}.png", "PNG")
            print(f"✓ Saved {slug} ({w}x{h})")
            return True
        except Exception as e:
            print(f"  Error {slug} on {u[:40]}: {e}")
    return False

success = 0
for slug, urls in ITEMS:
    if process_item(slug, urls):
        success += 1

print(f"\nDone! Processed {success}/{len(ITEMS)} packshots.")
