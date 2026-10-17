import urllib.request, urllib.parse, re, ssl, io, os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

SPICE_TEXTURES = [
    ('scratch_cloves_tex.png', 'whole cloves spice close up texture'),
    ('scratch_cinnamon_tex.png', 'cinnamon sticks rolls spice texture close up'),
    ('scratch_fennel_tex.png', 'fennel seeds saunf texture close up macro'),
    ('scratch_poppy_tex.png', 'white poppy seeds khus khus texture close up'),
    ('scratch_tamarind_tex.png', 'cleaned seedless tamarind block pulp texture'),
    ('scratch_copra_tex.png', 'dry coconut copra pieces texture'),
    ('scratch_bay_leaves_tex.png', 'dried bay leaves tej patta spice texture'),
    ('scratch_sesame_tex.png', 'white sesame seeds til texture close up')
]

def fetch_texture(filename, query):
    if os.path.exists(filename) and os.path.getsize(filename) > 10000:
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

    for u in murls[:12]:
        try:
            ireq = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(ireq, context=ctx, timeout=10) as ires:
                raw_bytes = ires.read()
                im = Image.open(io.BytesIO(raw_bytes))
                w, h = im.size
                if w < 300 or h < 300:
                    continue
                # Make a square crop for texture
                md = min(w, h)
                cropped = im.crop(((w-md)//2, (h-md)//2, (w+md)//2, (h+md)//2)).resize((1024, 1024), Image.Resampling.LANCZOS)
                cropped.save(filename, 'PNG')
                print(f"[OK] Saved {filename} from {u[:60]}...")
                return True
        except Exception as e:
            continue

    print(f"[FAIL] Could not download {filename}")
    return False

for fn, q in SPICE_TEXTURES:
    fetch_texture(fn, q)
