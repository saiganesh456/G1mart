import urllib.request
import urllib.parse
import re
import ssl
from PIL import Image
import io
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_and_save(query, filename):
    encoded = urllib.parse.quote(query)
    url = f'https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            for u in murls[:8]:
                try:
                    img_req = urllib.request.Request(u, headers=HEADERS)
                    with urllib.request.urlopen(img_req, context=ctx, timeout=8) as ires:
                        data = ires.read()
                        im = Image.open(io.BytesIO(data))
                        if im.size[0] >= 300 and im.size[1] >= 300:
                            out_path = os.path.join('public', 'products', 'packshots', filename)
                            im.convert('RGB').save(out_path, 'JPEG', quality=90)
                            print(f'Successfully saved {filename} ({im.size})')
                            return True
                except Exception:
                    continue
    except Exception as e:
        print(f'Error fetching {query}: {e}')
    return False

items = [
    ('Fanta Orange bottle packshot isolated', 'fanta.jpg'),
    ('Maaza Mango Drink bottle packshot isolated', 'maaza.jpg'),
    ('Sting Energy Drink bottle packshot isolated', 'sting.jpg'),
    ('Bisleri Mineral Water 1L bottle isolated', 'bisleri.jpg'),
    ('Kinley packaged drinking water bottle isolated', 'kinley.jpg'),
    ('Aquafina packaged drinking water bottle isolated', 'aquafina.jpg'),
    ('Harpic Power Plus toilet cleaner bottle isolated', 'harpic.jpg'),
    ('Lizol disinfectant floor cleaner citrus bottle isolated', 'lizol.jpg'),
    ('Vim dishwash liquid gel bottle yellow isolated', 'vim-liquid.jpg'),
    ('Head and Shoulders cool menthol shampoo bottle isolated', 'head-shoulders-shampoo.jpg'),
    ('Clinic Plus strong and long shampoo bottle isolated', 'clinic-plus-shampoo.jpg'),
    ('Sunsilk black shine shampoo bottle isolated', 'sunsilk-shampoo.jpg'),
    ('Ponds bright beauty face wash tube isolated', 'ponds-face-wash.jpg'),
    ('Good Knight gold flash liquid refill isolated', 'good-knight.jpg'),
    ('All Out ultra mosquito liquid refill isolated', 'all-out.jpg'),
    ('Comfort fabric conditioner bottle morning fresh isolated', 'comfort.jpg'),
    ('Ujala supreme fabric whitener bottle isolated', 'ujala.jpg'),
    ('Saffola Oats pouch packshot isolated', 'saffola-oats.jpg'),
    ('MTR Dosa Mix packshot isolated', 'mtr-dosa-mix.jpg'),
    ('MTR Rava Idli Mix packshot isolated', 'mtr-rava-idli-mix.jpg'),
    ('MTR Vada Mix packshot isolated', 'mtr-vada-mix.jpg'),
    ('Kelloggs Chocos packshot isolated', 'kelloggs-chocos.jpg'),
    ('Tata Salt packet isolated', 'tata-salt.jpg'),
    ('Dettol liquid antiseptic bottle isolated', 'dettol-antiseptic.jpg'),
    ('Bambino Roasted Vermicelli packet isolated', 'bambino-vermicelli.jpg'),
    ('Rooh Afza bottle isolated', 'rooh-afza.jpg'),
    ('Glucon-D Orange box packshot isolated', 'glucon-d.jpg'),
]

os.makedirs('public/products/packshots', exist_ok=True)
success = 0
for q, f in items:
    if fetch_and_save(q, f):
        success += 1

print(f'Done! Successfully saved {success} / {len(items)} packshots.')
