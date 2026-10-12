import urllib.request
import urllib.parse
import re
import ssl
import os
import sys
from io import BytesIO
from PIL import Image
import rembg

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "products", "packshots_fmcg")
os.makedirs(OUT_DIR, exist_ok=True)

ITEMS_TO_FETCH = {
    "harpic_power_plus": [
        "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=480,h=480/app/images/products/full_screen/pro_11175.jpg",
        "harpic power plus 10x toilet cleaner blue bottle white background",
        "harpic 10x toilet cleaner bottle white background"
    ],
    "lizol_floor_cleaner": [
        "lizol disinfectant floor cleaner citrus bottle white background",
        "lizol floor cleaner bottle white background bigbasket",
        "lizol yellow bottle white background"
    ],
    "whisper_ultra_clean": [
        "whisper ultra clean sanitary pads pack xl white background",
        "whisper ultra clean pads pack green white background",
        "whisper ultra sanitary pads white background bigbasket"
    ],
    "head_and_shoulders": [
        "head and shoulders anti dandruff shampoo bottle white background",
        "head & shoulders shampoo bottle white background bigbasket",
        "head and shoulders shampoo bottle packshot white background"
    ],
    "everest_tikhalal": [
        "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=85,metadata=none,w=480,h=480/app/images/products/full_screen/pro_24194.jpg",
        "everest tikhalal chilli powder packet white background",
        "everest tikhalal red chilli powder box white background"
    ],
    "priya_mango_pickle": [
        "priya mango pickle bottle jar white background",
        "priya mango pickle jar white background bigbasket",
        "priya avakaya mango pickle bottle"
    ],
    "tata_sampann_toor_dal": [
        "tata sampann unpolished toor dal packet white background",
        "tata sampann toor dal packshot white background",
        "tata sampann arhar dal packet white background"
    ],
    "tata_sampann_chana_dal": [
        "tata sampann unpolished chana dal packet white background",
        "tata sampann chana dal packshot white background",
        "tata sampann moong dal packet white background"
    ],
    "amul_pure_ghee": [
        "amul pure ghee tin 1l white background",
        "amul pure ghee carton packshot white background",
        "amul pure ghee tin packshot bigbasket"
    ],
    "fortune_sunlite_oil": [
        "fortune sunlite refined sunflower oil bottle white background",
        "fortune sunflower oil 1l bottle white background",
        "fortune sunlite oil pouch white background"
    ],
    "vim_dishwash_gel": [
        "vim dishwash gel lemon bottle yellow white background",
        "vim gel dishwash bottle white background bigbasket",
        "vim lemon dishwash liquid bottle white background"
    ],
    "scotch_brite_sponge": [
        "scotch brite scrub pad green white background",
        "scotch brite scrub sponge yellow green white background",
        "scotch brite scrubber sponge white background"
    ],
    "happilo_almonds": [
        "happilo 100 natural premium california almonds pouch white background",
        "happilo california almonds pack white background",
        "happilo almonds packet white background bigbasket"
    ],
    "happilo_cashews": [
        "happilo 100 natural premium whole cashews pouch white background",
        "happilo cashews pack white background",
        "happilo whole cashew nuts packet white background"
    ],
    "haldirams_aloo_bhujia": [
        "haldiram aloo bhujia packet yellow white background",
        "haldiram nagpur aloo bhujia pack white background",
        "haldirams aloo bhujia pouch packshot"
    ],
    "cadbury_silk": [
        "cadbury dairy milk silk chocolate bar packshot white background",
        "cadbury dairy milk silk bar white background",
        "cadbury silk chocolate bar purple packshot"
    ],
    "nestle_kitkat": [
        "nestle kitkat 4 finger chocolate bar white background",
        "nestle kitkat packshot white background bigbasket",
        "kitkat chocolate pack white background"
    ],
    "cadbury_bournvita": [
        "cadbury bournvita jar white background bigbasket",
        "bournvita chocolate health drink jar packshot white background",
        "bournvita jar white background"
    ],
    "real_fruit_juice": [
        "real fruit power mixed fruit juice 1l tetra pack white background",
        "real fruit juice mixed fruit pack white background bigbasket",
        "real mixed fruit juice packshot white background"
    ],
    "ariel_matic_detergent": [
        "ariel matic liquid detergent pouch white background",
        "ariel matic washing powder packet white background",
        "ariel matic detergent packshot white background bigbasket"
    ],
    "cycle_three_in_one": [
        "cycle three in one agarbatti packet white background",
        "cycle pure agarbathi 3 in 1 box white background",
        "cycle agarbatti box packshot white background"
    ],
    "mangalam_camphor": [
        "mangalam bhimseni camphor jar white background",
        "mangalam pure camphor jar white background",
        "pure bhimseni camphor jar packshot"
    ],
    "prestige_pressure_cooker": [
        "prestige popular aluminium pressure cooker 3l white background",
        "prestige pressure cooker white background packshot",
        "hawkins pressure cooker classic white background"
    ],
    "milton_steel_bottle": [
        "milton thermosteel water bottle flask white background",
        "milton stainless steel water bottle white background",
        "milton thermosteel duo deluxe bottle white background"
    ],
    "dettol_handwash_pump": [
        "dettol liquid handwash original pump bottle white background",
        "dettol handwash bottle green pump white background",
        "dettol original handwash packshot bigbasket"
    ],
    "nivea_soft_cream": [
        "nivea soft light moisturiser cream tub white background",
        "nivea soft cream jar white background bigbasket",
        "nivea soft light moisturising cream white background"
    ],
    "pampers_diaper_pants": [
        "pampers all round protection pants diaper packet white background",
        "pampers baby dry pants diaper pack white background",
        "pampers diaper pants packet packshot"
    ],
    "johnsons_baby_soap": [
        "johnsons baby soap bar white background",
        "johnsons baby powder bottle white background",
        "johnsons baby lotion bottle white background bigbasket"
    ],
    "amul_taaza_milk": [
        "amul taaza toned milk pouch white background",
        "amul taaza milk tetra pack white background",
        "amul taaza milk packet packshot"
    ],
    "britannia_white_bread": [
        "britannia white bread packet loaf white background",
        "britannia regular bread packet white background",
        "modern bread packet white background"
    ]
}

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
            valid = []
            for u in murls:
                u_clean = u.split('?')[0].lower()
                if any(u_clean.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']) or any(kw in u for kw in ['grofers', 'bbassets', 'bigbasket', 'jiomart', 'amazon', 'media', 'catalog']):
                    valid.append(u)
            return list(dict.fromkeys(valid if valid else murls))
    except Exception as e:
        print(f"  [ERROR] Bing search for '{query}':", e)
        return []

def download_image(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
        data = res.read()
    im = Image.open(BytesIO(data))
    return im

def main():
    print(f"=== Initializing Rembg Session ===")
    session = rembg.new_session("u2net")
    print("Session ready.\n")

    for key, queries_or_urls in ITEMS_TO_FETCH.items():
        out_file = os.path.join(OUT_DIR, f"{key}.png")
        if os.path.exists(out_file):
            print(f"[EXISTS] {key}.png already present, skipping.")
            continue

        print(f"--- Fetching {key} ---")
        candidate_urls = []
        for q in queries_or_urls:
            if q.startswith("http://") or q.startswith("https://"):
                candidate_urls.append(q)
            else:
                found = search_bing(q)
                candidate_urls.extend(found[:4])

        success = False
        for u in candidate_urls[:10]:
            try:
                raw = download_image(u)
                if raw.width < 120 or raw.height < 120:
                    continue
                # Background removal
                rgb = raw.convert("RGB")
                cutout = rembg.remove(rgb, session=session)
                bbox = cutout.getbbox()
                if not bbox:
                    continue
                bw = bbox[2] - bbox[0]
                bh = bbox[3] - bbox[1]
                if bw < 80 or bh < 80:
                    continue
                
                cropped = cutout.crop(bbox)
                # Save as transparent PNG
                cropped.save(out_file, "PNG")
                print(f"  [SUCCESS] Saved {key}.png ({cropped.size[0]}x{cropped.size[1]}) from {u[:50]}...")
                success = True
                break
            except Exception as e:
                # try next
                continue

        if not success:
            print(f"  [FAILED] Could not get cutout for {key}")

if __name__ == "__main__":
    main()
