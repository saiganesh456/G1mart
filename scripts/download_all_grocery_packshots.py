import urllib.request, urllib.parse, re, ssl, io, os
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

PACKSHOTS_DIR = os.path.join('public', 'products', 'packshots')
os.makedirs(PACKSHOTS_DIR, exist_ok=True)

ITEMS = [
    # 1. Basmati Rice
    ('india-gate-classic-1kg.webp', 'India Gate Classic Basmati Rice 1kg packshot white background'),
    ('india-gate-classic-5kg.webp', 'India Gate Classic Basmati Rice 5kg bag packshot'),
    ('india-gate-rozzana-1kg.webp', 'India Gate Feast Rozzana Basmati Rice 1kg packshot'),
    ('india-gate-rozzana-5kg.webp', 'India Gate Feast Rozzana Basmati Rice 5kg packshot'),
    ('india-gate-dubar-1kg.webp', 'India Gate Dubar Basmati Rice 1kg packshot'),
    ('daawat-traditional-1kg.webp', 'Daawat Traditional Basmati Rice 1kg packshot white background'),
    ('daawat-traditional-5kg.webp', 'Daawat Traditional Basmati Rice 5kg packshot'),
    ('daawat-rozana-super-1kg.webp', 'Daawat Rozana Super Basmati Rice 1kg packshot'),
    ('daawat-rozana-super-5kg.webp', 'Daawat Rozana Super Basmati Rice 5kg packshot'),
    ('fortune-biryani-special-1kg.webp', 'Fortune Biryani Special Basmati Rice 1kg packshot'),
    ('fortune-biryani-special-5kg.webp', 'Fortune Biryani Special Basmati Rice 5kg packshot'),
    ('kohinoor-basmati-1kg.webp', 'Kohinoor Super Silver Basmati Rice 1kg packshot'),
    ('lal-qilla-basmati-1kg.webp', 'Lal Qilla Traditional Basmati Rice 1kg packshot'),

    # 2. Atta & Flours
    ('aashirvaad-select-sharbati-5kg.webp', 'Aashirvaad Select Sharbati 100% MP Whole Wheat Atta 5kg packshot'),
    ('tata-sampann-multigrain-atta-1kg.webp', 'Tata Sampann 100% Multigrain Atta 1kg packshot'),
    ('tata-sampann-multigrain-atta-5kg.webp', 'Tata Sampann 100% Multigrain Atta 5kg packshot'),
    ('fortune-maida-1kg.webp', 'Fortune Maida 1kg packshot'),
    ('tata-sampann-besan-500g.webp', 'Tata Sampann 100% Chana Dal Besan 500g packshot'),
    ('fortune-sooji-500g.webp', 'Fortune Sooji Rava 500g packshot'),
    ('bambino-roasted-vermicelli-400g.webp', 'Bambino Roasted Vermicelli 400g packshot'),
    ('bambino-roasted-vermicelli-850g.webp', 'Bambino Roasted Vermicelli 850g packshot'),
    ('anil-roasted-vermicelli-400g.webp', 'Anil Roasted Vermicelli 400g packshot'),
    ('mtr-vermicelli-400g.webp', 'MTR Roasted Vermicelli 400g packshot'),

    # 3. Cooking Oils
    ('freedom-sunflower-1l-pouch.webp', 'Freedom Refined Sunflower Oil 1L pouch packshot'),
    ('freedom-sunflower-1l-bottle.webp', 'Freedom Refined Sunflower Oil 1L bottle packshot white background single bottle'),
    ('freedom-sunflower-5l-can.webp', 'Freedom Refined Sunflower Oil 5L can packshot'),
    ('freedom-rice-bran-oil-1l.webp', 'Freedom Physically Refined Rice Bran Oil 1L pouch packshot'),
    ('fortune-sunlite-1l-pouch.webp', 'Fortune Sunlite Refined Sunflower Oil 1L pouch packshot'),
    ('fortune-sunlite-1l-bottle.webp', 'Fortune Sunlite Refined Sunflower Oil 1L bottle packshot single bottle'),
    ('fortune-sunlite-5l-can.webp', 'Fortune Sunlite Refined Sunflower Oil 5L can packshot'),
    ('gold-winner-1l-pouch.webp', 'Gold Winner Refined Sunflower Oil 1L pouch packshot'),
    ('gold-winner-1l-bottle.webp', 'Gold Winner Refined Sunflower Oil 1L bottle packshot'),
    ('gold-winner-5l-can.webp', 'Gold Winner Refined Sunflower Oil 5L can packshot'),
    ('gemini-sunflower-1l-pouch.webp', 'Gemini Refined Sunflower Oil 1L pouch packshot'),
    ('gemini-sunflower-5l-can.webp', 'Gemini Refined Sunflower Oil 5L can packshot'),
    ('sunpure-sunflower-1l-pouch.webp', 'Sunpure Refined Sunflower Oil 1L pouch packshot'),
    ('sunpure-sunflower-5l-can.webp', 'Sunpure Refined Sunflower Oil 5L can packshot'),
    ('sundrop-superlite-1l-pouch.webp', 'Sundrop Super Lite Advanced Sunflower Oil 1L pouch packshot'),
    ('sundrop-superlite-5l-can.webp', 'Sundrop Super Lite Advanced Sunflower Oil 5L can packshot'),
    ('saffola-gold-1l-pouch.webp', 'Saffola Gold Pro Healthy Edible Oil 1L pouch packshot'),
    ('saffola-gold-5l-can.webp', 'Saffola Gold Pro Healthy Edible Oil 5L can packshot'),
    ('saffola-active-1l-pouch.webp', 'Saffola Active Edible Oil 1L pouch packshot'),
    ('saffola-tasty-1l-pouch.webp', 'Saffola Tasty Pro Edible Oil 1L pouch packshot'),
    ('fortune-mustard-oil-1l.webp', 'Fortune Kachi Ghani Mustard Oil 1L bottle packshot'),
    ('fortune-groundnut-oil-1l.webp', 'Fortune Filtered Groundnut Oil 1L pouch packshot'),
    ('freedom-groundnut-oil-1l.webp', 'Freedom Double Filtered Groundnut Oil 1L pouch packshot'),
    ('idhayam-gingelly-500ml.webp', 'Idhayam Pure Sesame Gingelly Oil 500ml bottle packshot'),
    ('idhayam-gingelly-1l.webp', 'Idhayam Pure Sesame Gingelly Oil 1L bottle packshot'),
    ('parachute-coconut-oil-200ml.webp', 'Parachute Pure Coconut Oil 200ml bottle packshot'),
    ('parachute-coconut-oil-500ml.webp', 'Parachute Pure Coconut Oil 500ml bottle packshot'),
    ('figaro-olive-oil-500ml.webp', 'Figaro Pure Olive Oil 500ml tin packshot'),
    ('borges-extra-virgin-olive-oil-500ml.webp', 'Borges Extra Virgin Olive Oil 500ml bottle packshot'),

    # 4. Ghee & Butter
    ('amul-pure-ghee-500ml.webp', 'Amul Pure Ghee 500ml pouch refill packshot'),
    ('amul-pure-ghee-1l.webp', 'Amul Pure Ghee 1L tin packshot'),
    ('nandini-pure-ghee-500ml.webp', 'Nandini Pure Cow Ghee 500ml pouch packshot'),
    ('nandini-pure-ghee-1l.webp', 'Nandini Pure Cow Ghee 1L pouch packshot'),
    ('heritage-cow-ghee-500ml.webp', 'Heritage Pure Cow Ghee 500ml jar packshot'),
    ('dodla-pure-ghee-500ml.webp', 'Dodla Pure Ghee 500ml jar packshot'),
    ('grb-pure-ghee-500ml.webp', 'GRB Pure Ghee 500ml jar packshot'),
    ('amul-salted-butter-100g.webp', 'Amul Pasteurized Butter 100g packshot'),
    ('amul-salted-butter-500g.webp', 'Amul Pasteurized Butter 500g packshot'),
    ('britannia-butter-100g.webp', 'Britannia Delicious Salted Butter 100g packshot'),

    # 5. Dals & Pulses (Tata Sampann & Nutrela)
    ('tata-sampann-toor-dal-1kg.webp', 'Tata Sampann Unpolished Toor Dal 1kg packshot'),
    ('tata-sampann-toor-dal-500g.webp', 'Tata Sampann Unpolished Toor Dal 500g packshot'),
    ('tata-sampann-chana-dal-1kg.webp', 'Tata Sampann Unpolished Chana Dal 1kg packshot'),
    ('tata-sampann-chana-dal-500g.webp', 'Tata Sampann Unpolished Chana Dal 500g packshot'),
    ('tata-sampann-moong-dal-1kg.webp', 'Tata Sampann Unpolished Moong Dal 1kg packshot'),
    ('tata-sampann-moong-dal-500g.webp', 'Tata Sampann Unpolished Moong Dal 500g packshot'),
    ('tata-sampann-urad-dal-1kg.webp', 'Tata Sampann Unpolished Urad Dal Split 1kg packshot'),
    ('tata-sampann-urad-whole-1kg.webp', 'Tata Sampann Unpolished Urad Whole 1kg packshot'),
    ('tata-sampann-masoor-dal-1kg.webp', 'Tata Sampann Unpolished Masoor Dal 1kg packshot'),
    ('tata-sampann-kabuli-chana-1kg.webp', 'Tata Sampann Unpolished Kabuli Chana 1kg packshot'),
    ('tata-sampann-kala-chana-1kg.webp', 'Tata Sampann Unpolished Kala Chana 1kg packshot'),
    ('tata-sampann-rajma-1kg.webp', 'Tata Sampann Unpolished Rajma 1kg packshot'),
    ('tata-sampann-green-moong-1kg.webp', 'Tata Sampann Unpolished Green Moong 1kg packshot'),
    ('tata-sampann-soya-chunks-200g.webp', 'Tata Sampann 100% Soya Chunks 200g packshot'),
    ('nutrela-soya-chunks-200g.webp', 'Nutrela Soya Chunks 200g packshot'),

    # 6. Spices & Masalas
    ('everest-turmeric-powder-200g.webp', 'Everest Turmeric Powder 200g packshot'),
    ('everest-turmeric-powder-500g.webp', 'Everest Turmeric Powder 500g packshot'),
    ('everest-tikhalal-chilli-200g.webp', 'Everest Tikhalal Chilli Powder 200g packshot'),
    ('everest-kashmirilal-100g.webp', 'Everest Kashmirilal Kashmiri Chilli Powder 100g packshot'),
    ('everest-coriander-powder-200g.webp', 'Everest Coriander Powder 200g packshot'),
    ('everest-garam-masala-100g.webp', 'Everest Garam Masala 100g packshot'),
    ('everest-kitchen-king-100g.webp', 'Everest Kitchen King Masala 100g packshot'),
    ('everest-chicken-masala-100g.webp', 'Everest Chicken Masala 100g packshot'),
    ('everest-meat-masala-100g.webp', 'Everest Meat Masala 100g packshot'),
    ('everest-pav-bhaji-100g.webp', 'Everest Pav Bhaji Masala 100g packshot'),
    ('everest-chhole-masala-100g.webp', 'Everest Chhole Masala 100g packshot'),
    ('everest-chaat-masala-100g.webp', 'Everest Chaat Masala 100g packshot'),
    ('everest-sambhar-masala-100g.webp', 'Everest Sambhar Masala 100g packshot'),
    ('everest-kasuri-methi-50g.webp', 'Everest Kasuri Methi 50g box packshot'),
    ('everest-hingraj-50g.webp', 'Everest Hingraj Asafoetida Powder 50g packshot'),
    ('tata-sampann-turmeric-200g.webp', 'Tata Sampann Turmeric Powder 200g packshot'),
    ('tata-sampann-chilli-200g.webp', 'Tata Sampann Red Chilli Powder 200g packshot'),
    ('tata-sampann-coriander-200g.webp', 'Tata Sampann Coriander Powder 200g packshot'),
    ('tata-sampann-garam-masala-100g.webp', 'Tata Sampann Garam Masala 100g packshot'),
    ('catch-turmeric-200g.webp', 'Catch Turmeric Powder 200g packshot'),
    ('catch-chilli-200g.webp', 'Catch Red Chilli Powder 200g packshot'),
    ('catch-coriander-200g.webp', 'Catch Coriander Powder 200g packshot'),
    ('catch-sprinkler-chaat-masala-100g.webp', 'Catch Chaat Masala Sprinkler 100g packshot'),
    ('catch-sprinkler-black-pepper-100g.webp', 'Catch Black Pepper Sprinkler 100g packshot'),
    ('mtr-sambar-powder-200g.webp', 'MTR Sambar Powder 200g packshot'),
    ('mtr-rasam-powder-200g.webp', 'MTR Rasam Powder 200g packshot'),
    ('mtr-puliyogare-powder-100g.webp', 'MTR Puliyogare Powder 100g packshot'),
    ('mtr-bisibele-bath-100g.webp', 'MTR Bisibele Bath Powder 100g packshot'),
    ('aachi-sambar-powder-200g.webp', 'Aachi Sambar Powder 200g packshot'),
    ('aachi-rasam-powder-200g.webp', 'Aachi Rasam Powder 200g packshot'),
    ('aachi-chicken-masala-100g.webp', 'Aachi Chicken Masala 100g packshot'),
    ('aachi-mutton-masala-100g.webp', 'Aachi Mutton Masala 100g packshot'),
    ('aachi-fish-fry-masala-50g.webp', 'Aachi Fish Fry Masala 50g packshot'),
    ('sakthi-sambar-powder-100g.webp', 'Sakthi Sambar Powder 100g packshot'),
    ('sakthi-chicken-masala-100g.webp', 'Sakthi Chicken Masala 100g packshot'),
    ('dabur-hommade-ginger-garlic-paste-200g.webp', 'Dabur Hommade Ginger Garlic Paste 200g packshot'),
    ('priya-mango-pickle-300g.webp', 'Priya Mango Pickle 300g jar packshot'),
    ('priya-gongura-pickle-300g.webp', 'Priya Gongura Pickle 300g jar packshot'),
    ('priya-tomato-pickle-300g.webp', 'Priya Tomato Pickle 300g jar packshot'),
    ('priya-lemon-pickle-300g.webp', 'Priya Lemon Pickle 300g jar packshot'),
    ('priya-red-chilli-pickle-300g.webp', 'Priya Red Chilli Pickle 300g jar packshot'),
    ('lijjat-urad-papad-200g.webp', 'Lijjat Urad Papad 200g packshot'),

    # 7. Salt, Sugar & Sweeteners
    ('tata-salt-lite-1kg.webp', 'Tata Salt Lite 1kg packet packshot'),
    ('tata-rock-salt-1kg.webp', 'Tata Salt Rock Salt Sendha Namak 1kg packshot'),
    ('catch-table-salt-sprinkler-200g.webp', 'Catch Table Salt Sprinkler 200g packshot'),
    ('organic-tattva-jaggery-powder-500g.webp', 'Organic Tattva Jaggery Powder 500g packshot'),
    ('24-mantra-organic-jaggery-500g.webp', '24 Mantra Organic Jaggery 500g packshot'),
    ('patanjali-jaggery-1kg.webp', 'Patanjali Jaggery Gur 1kg packshot'),
    ('trust-classic-sugar-1kg.webp', 'Trust Classic Pure Cane Sugar 1kg packshot'),

    # 8. Dry Fruits & Nuts
    ('happilo-almonds-200g.webp', 'Happilo 100% Natural California Almonds 200g single pouch packshot'),
    ('happilo-cashews-200g.webp', 'Happilo 100% Natural Whole Cashews 200g single pouch packshot'),
    ('happilo-pistachios-200g.webp', 'Happilo Premium California Pistachios 200g single pouch packshot'),
    ('happilo-raisins-200g.webp', 'Happilo Premium Indian Golden Raisins 200g single pouch packshot'),
    ('happilo-anjeer-200g.webp', 'Happilo Dried Afghani Anjeer 200g single pouch packshot'),
    ('happilo-walnuts-200g.webp', 'Happilo Premium Walnut Kernels 200g single pouch packshot'),
    ('nutraj-almonds-250g.webp', 'Nutraj California Almonds 250g single pouch packshot'),
    ('nutraj-cashews-250g.webp', 'Nutraj Premium Whole Cashews 250g single pouch packshot'),
    ('farmley-mixed-dry-fruits-200g.webp', 'Farmley Daily Mixed Dry Fruits & Nuts 200g single pouch packshot'),
    ('lion-dates-200g.webp', 'Lion Dates Seedless 200g box packshot'),
    ('lion-dates-500g.webp', 'Lion Arabian Dates 500g box packshot'),
    ('true-elements-chia-seeds-150g.webp', 'True Elements Raw Chia Seeds 150g packshot'),
    ('true-elements-pumpkin-seeds-150g.webp', 'True Elements Raw Pumpkin Seeds 150g packshot'),

    # 9. Sauces, Condiments & Jams
    ('kissan-fresh-tomato-ketchup-500g.webp', 'Kissan Fresh Tomato Ketchup 500g bottle packshot'),
    ('kissan-fresh-tomato-ketchup-1kg.webp', 'Kissan Fresh Tomato Ketchup 1kg refill pouch packshot'),
    ('maggi-rich-tomato-ketchup-500g.webp', 'Maggi Rich Tomato Ketchup 500g bottle packshot'),
    ('maggi-hot-sweet-sauce-500g.webp', 'Maggi Hot & Sweet Tomato Chilli Sauce 500g bottle packshot'),
    ('chings-secret-schezwan-chutney-250g.webp', 'Chings Secret Schezwan Chutney 250g bottle packshot'),
    ('chings-secret-soy-sauce-210g.webp', 'Chings Secret Dark Soy Sauce 210g bottle packshot'),
    ('chings-secret-green-chilli-sauce-200g.webp', 'Chings Secret Green Chilli Sauce 200g bottle packshot'),
    ('chings-secret-red-chilli-sauce-200g.webp', 'Chings Secret Red Chilli Sauce 200g bottle packshot'),
    ('weikfield-synthetic-vinegar-500ml.webp', 'Weikfield Synthetic White Vinegar 500ml bottle packshot'),
    ('funfoods-veg-mayonnaise-250g.webp', 'FunFoods Veg Mayonnaise Original 250g bottle packshot'),
    ('veeba-eggless-mayo-275g.webp', 'Veeba Truly Eggless Mayonnaise 275g bottle packshot'),

    # 10. Noodles & Instant Meals
    ('maggi-2-minute-noodles-70g.webp', 'Maggi 2-Minute Masala Instant Noodles 70g packshot single packet'),
    ('maggi-2-minute-noodles-multipack.webp', 'Maggi 2-Minute Masala Noodles 4 pack multipack packshot'),
    ('maggi-atta-noodles-72g.webp', 'Maggi Veg Atta Noodles 72g packshot'),
    ('yippee-magic-masala-single.webp', 'Sunfeast YiPPee Magic Masala Noodles 60g packshot single packet'),
    ('yippee-magic-masala-4pack.webp', 'Sunfeast YiPPee Magic Masala Noodles 4 in 1 multipack packshot'),
    ('top-ramen-curry-veg-70g.webp', 'Top Ramen Curry Veg Noodles 70g packshot'),
    ('chings-hakka-noodles-150g.webp', 'Chings Secret Hakka Noodles Just Soak 150g packshot'),
    ('bambino-macaroni-400g.webp', 'Bambino Macaroni 400g pouch packshot'),
    ('bambino-penne-pasta-400g.webp', 'Bambino Penne Pasta 400g pouch packshot'),
    ('kelloggs-corn-flakes-250g.webp', 'Kelloggs Original Corn Flakes 250g box packshot'),
    ('kelloggs-chocos-250g.webp', 'Kelloggs Chocos Cereal 250g box packshot'),
    ('quaker-rolled-oats-400g.webp', 'Quaker Rolled Oats 400g packshot'),
    ('saffola-masala-oats-400g.webp', 'Saffola Masala Oats Classic Masala 400g packshot'),
    ('mtr-idli-mix-500g.webp', 'MTR Instant Idli Mix 500g packshot'),
    ('gits-gulab-jamun-mix-200g.webp', 'Gits Gulab Jamun Mix 200g box packshot'),
    ('gits-khaman-dhokla-180g.webp', 'Gits Khaman Dhokla Mix 180g packshot'),
    ('weikfield-baking-powder-100g.webp', 'Weikfield Baking Powder 100g packshot'),
    ('weikfield-baking-soda-100g.webp', 'Weikfield Baking Soda 100g packshot'),
    ('weikfield-custard-powder-100g.webp', 'Weikfield Vanilla Custard Powder 100g packshot')
]

def fetch_and_process(item):
    filename, query = item
    out_path = os.path.join(PACKSHOTS_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        print(f"Skipping {filename} (already exists)")
        return True

    enc = urllib.parse.quote(query)
    url = f'https://www.bing.com/images/search?q={enc}&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
            html = res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Failed search for {filename}: {e}")
        return False

    murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
    if not murls:
        murls = re.findall(r'"murl":"(https?://[^"]+)"', html)

    for u in murls[:10]:
        try:
            ireq = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(ireq, context=ctx, timeout=10) as ires:
                raw_bytes = ires.read()
                im = Image.open(io.BytesIO(raw_bytes))
                w, h = im.size
                if w < 250 or h < 250:
                    continue

                scale = min(720 / w, 720 / h)
                nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
                res_im = im.resize((nw, nh), Image.Resampling.LANCZOS)
                canvas = Image.new('RGB', (800, 800), (255, 255, 255))
                if res_im.mode in ('RGBA', 'LA') or (res_im.mode == 'P' and 'transparency' in res_im.info):
                    res_im = res_im.convert('RGBA')
                    canvas.paste(res_im, ((800 - nw) // 2, (800 - nh) // 2), mask=res_im)
                else:
                    canvas.paste(res_im.convert('RGB'), ((800 - nw) // 2, (800 - nh) // 2))

                canvas.save(out_path, 'WEBP', quality=90)
                print(f"[OK] Saved {filename} from {u[:50]}...")
                return True
        except Exception:
            continue

    print(f"[FAIL] Could not download {filename}")
    return False

if __name__ == '__main__':
    print(f"Starting download pipeline for {len(ITEMS)} items with 4 worker threads...")
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(fetch_and_process, ITEMS))
    success_count = sum(1 for r in results if r)
    print(f"Completed! {success_count}/{len(ITEMS)} images downloaded successfully.")
