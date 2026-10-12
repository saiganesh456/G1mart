import urllib.request
import urllib.parse
import re
import ssl
import json
import os
import sys
from PIL import Image
from io import BytesIO

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def search_bing_images(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"Bing search error for '{query}':", e)
        return []

def download_and_format(url, output_path, target_size=(800, 800)):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
        content = res.read()
    
    img = Image.open(BytesIO(content))
    w, h = img.size
    if w < 100 or h < 100:
        raise Exception(f"Image too small: {w}x{h}")

    # Determine if transparent or has alpha
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2), mask=resized)
    else:
        img = img.convert('RGB')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2))
    
    canvas.save(output_path, 'WEBP', quality=92)
    return True

SWEETS_ITEMS = [
    {
        "id": "g1-p0011",
        "name": "Dairy Milk Chocolate",
        "queries": [
            "Cadbury Dairy Milk Chocolate bar packshot amazon india",
            "Cadbury Dairy Milk 10rs chocolate bar packshot"
        ]
    },
    {
        "id": "g1-p0110",
        "name": "Milky BAR",
        "queries": [
            "Nestle Milkybar white chocolate bar packshot amazon india",
            "Nestle Milkybar chocolate bar packshot"
        ]
    },
    {
        "id": "g1-p0118",
        "name": "Milky BAR BIG BOX",
        "queries": [
            "Nestle Milkybar chocolate pouch or box pack amazon india",
            "Nestle Milkybar share pack pouch packshot"
        ]
    },
    {
        "id": "g1-p0199",
        "name": "Nestle Munch Chocolate Wafer",
        "queries": [
            "Nestle Munch chocolate wafer packshot amazon india",
            "Nestle Munch chocolate bar packshot"
        ]
    },
    {
        "id": "g1-p0208",
        "name": "Lavian Brownie",
        "queries": [
            "Lavian brownie cake chocolate packshot amazon india",
            "Lavian exotic brownie cake packshot"
        ]
    },
    {
        "id": "g1-p0209",
        "name": "RAJ Peanut Chikki",
        "queries": [
            "Peanut Chikki packshot amazon india",
            "Chikki peanut jaggery bar packshot",
            "Raj peanut chikki pack"
        ]
    },
    {
        "id": "g1-p0246",
        "name": "Eclairs Choco",
        "queries": [
            "Cadbury Choclairs Gold chocolate candy pouch packshot",
            "Cadbury Choclairs pouch amazon india",
            "Choco Eclairs candy packet packshot"
        ]
    },
    {
        "id": "g1-p0248",
        "name": "Chocolate PKT",
        "queries": [
            "Cadbury Celebrations chocolate pack packshot amazon india",
            "Cadbury Celebrations gift box packshot"
        ]
    },
    {
        "id": "g1-p0256",
        "name": "Derby Eclairs Coconut",
        "queries": [
            "Derby Eclairs coconut candy pouch packshot",
            "Derby Eclairs candy pouch packshot",
            "coconut choco eclairs candy pack"
        ]
    },
    {
        "id": "g1-p0269",
        "name": "Dairy Milk Crackle",
        "queries": [
            "Cadbury Dairy Milk Crackle chocolate bar packshot amazon india",
            "Dairy Milk Crackle 36g chocolate bar"
        ]
    },
    {
        "id": "g1-p0270",
        "name": "Dairy Milk Fruit & Nut",
        "queries": [
            "Cadbury Dairy Milk Fruit & Nut chocolate bar packshot amazon india",
            "Dairy Milk Fruit and Nut 36g packshot"
        ]
    },
    {
        "id": "g1-p0571",
        "name": "HR Chocolate Soan Papdi",
        "queries": [
            "Haldirams Chocolate Soan Papdi box packshot",
            "Chocolate Soan Papdi box packshot amazon india"
        ]
    },
    {
        "id": "g1-p0676",
        "name": "Nice Peanut Chikki",
        "queries": [
            "Peanut Chikki bar packshot amazon india",
            "Kadalai Mittai peanut chikki bar packshot"
        ]
    },
    {
        "id": "g1-p0680",
        "name": "Fitday Millet Chikki",
        "queries": [
            "Fitday Millet Chikki bar packshot amazon india",
            "Fitday Chikki bar packshot"
        ]
    },
    {
        "id": "g1-p0683",
        "name": "Kamarkat Sweets 1rupe",
        "queries": [
            "Kamarkattu sweet candy jaggery coconut packshot",
            "Kamarkat sweet jaggery balls packshot",
            "traditional kamarkattu sweets"
        ]
    },
    {
        "id": "g1-p0692",
        "name": "Black Chikki",
        "queries": [
            "Black Til Chikki packshot amazon india",
            "Black Sesame chikki jaggery bar packshot",
            "Til Chikki sesame seeds chikki packshot"
        ]
    },
    {
        "id": "g1-p0700",
        "name": "Assorted Fruit Jelly",
        "queries": [
            "Assorted Fruit Jelly candy cups pouch packshot amazon india",
            "Fruit jelly candies pouch packshot"
        ]
    },
    {
        "id": "g1-p0746",
        "name": "5 Star Chaklet 510",
        "queries": [
            "Cadbury 5 Star chocolate bar packshot amazon india",
            "5 Star chocolate bar packshot"
        ]
    },
    {
        "id": "g1-p0747",
        "name": "5 Star 5RS",
        "queries": [
            "Cadbury 5 Star 5rs chocolate bar packshot amazon india",
            "Cadbury 5 Star 10g chocolate bar packshot"
        ]
    },
    {
        "id": "g1-p0749",
        "name": "5 Starfullbox",
        "queries": [
            "Cadbury 5 Star box pack packshot amazon india",
            "Cadbury 5 Star standee box packshot"
        ]
    },
    {
        "id": "g1-p0794",
        "name": "SP Chocolate",
        "queries": [
            "Amul Dark Chocolate bar packshot amazon india",
            "Amul Milk Chocolate bar packshot"
        ]
    },
    {
        "id": "g1-p0935",
        "name": "Kalkanda Candy",
        "queries": [
            "Kalkanda sugar candy rock candy mishri packshot amazon india",
            "White rock sugar candy mishri packshot"
        ]
    },
    {
        "id": "g1-p0966",
        "name": "Mix Fruit Jelly",
        "queries": [
            "Mixed Fruit Jelly candy pouch packshot amazon india",
            "Fruit jelly candies packet packshot"
        ]
    },
    {
        "id": "g1-p0968",
        "name": "Oringe Candy",
        "queries": [
            "Orange candy boiled sweets packet packshot amazon india",
            "Orange hard candy sweets pouch packshot"
        ]
    },
    {
        "id": "g1-p0972",
        "name": "Straberry Candyb",
        "queries": [
            "Strawberry candy boiled sweets packet packshot amazon india",
            "Strawberry candy pouch packshot"
        ]
    },
    {
        "id": "g1-p0975",
        "name": "Peanut Balls",
        "queries": [
            "Peanut Laddu Kadalai Urundai Palli Undalu packshot amazon india",
            "Peanut balls jaggery sweet packshot"
        ]
    },
    {
        "id": "g1-p1148",
        "name": "Dr. Oetker FunFoods Chocolate Topping",
        "queries": [
            "Dr. Oetker FunFoods Chocolate Fudge Topping bottle packshot",
            "FunFoods Chocolate Dessert Topping bottle packshot"
        ]
    },
    {
        "id": "g1-p1149",
        "name": "Morde Compound Chocolate",
        "queries": [
            "Morde Dark Compound chocolate slab packshot amazon india",
            "Morde compound chocolate slab 400g"
        ]
    },
    {
        "id": "g1-p1549",
        "name": "Hershey's Chocolate Syrup",
        "queries": [
            "Hersheys Chocolate Syrup 200g bottle packshot amazon india",
            "Hersheys chocolate syrup bottle packshot"
        ]
    },
    {
        "id": "g1-p1550",
        "name": "Hershey's Chocolate Syrup",
        "queries": [
            "Hersheys Chocolate Syrup 623g bottle packshot amazon india",
            "Hersheys chocolate syrup large bottle packshot"
        ]
    },
    {
        "id": "g1-p1552",
        "name": "Ferrero Rocher Chocolates",
        "queries": [
            "Ferrero Rocher 3 pack chocolate packshot amazon india",
            "Ferrero Rocher T3 packshot"
        ]
    },
    {
        "id": "g1-p1553",
        "name": "Ferrero Rocher Chocolates",
        "queries": [
            "Ferrero Rocher 16 pieces box packshot amazon india",
            "Ferrero Rocher 200g 16 pack box packshot"
        ]
    }
]

out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "products", "verified")
os.makedirs(out_dir, exist_ok=True)

success_count = 0
failed_items = []

for item in SWEETS_ITEMS:
    pid = item["id"]
    name = item["name"]
    target_path = os.path.join(out_dir, f"{pid}.webp")
    print(f"\n==========================================")
    print(f"Processing [{pid}] {name}...")
    
    saved = False
    for q in item["queries"]:
        print(f"  Searching query: '{q}'...")
        urls = search_bing_images(q)
        print(f"  Found {len(urls)} candidate URLs.")
        
        for u in urls[:12]:
            # skip non-image extensions or banners
            if any(bad in u.lower() for bad in ['svg', 'gif', 'logo', 'icon', 'banner']):
                continue
            try:
                print(f"    Trying: {u[:90]}...")
                download_and_format(u, target_path)
                print(f"    [SUCCESS] Saved [{pid}] {name} -> {target_path}")
                saved = True
                break
            except Exception as e:
                print(f"    [FAILED] {e}")
        if saved:
            break
            
    if saved:
        success_count += 1
    else:
        print(f"  [ERROR] FAILED TO DOWNLOAD FOR [{pid}] {name}")
        failed_items.append(item)

print(f"\n==========================================")
print(f"FINISHED! Successfully saved: {success_count}/{len(SWEETS_ITEMS)}")
if failed_items:
    print(f"Failed items: {[it['id'] for it in failed_items]}")
