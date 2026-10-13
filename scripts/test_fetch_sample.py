import urllib.request, urllib.parse, re, ssl, io, os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def fetch(query, filename):
    enc = urllib.parse.quote(query)
    url = f'https://www.bing.com/images/search?q={enc}&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Search failed for {query}: {e}")
        return False

    murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
    if not murls:
        murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
    for u in murls[:10]:
        try:
            ireq = urllib.request.Request(u, headers=HEADERS)
            with urllib.request.urlopen(ireq, context=ctx, timeout=8) as ires:
                im = Image.open(io.BytesIO(ires.read()))
                if im.size[0] >= 250 and im.size[1] >= 250:
                    w, h = im.size
                    scale = min(720 / w, 720 / h)
                    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
                    res_im = im.resize((nw, nh), Image.Resampling.LANCZOS)
                    canvas = Image.new('RGB', (800, 800), (255, 255, 255))
                    if res_im.mode in ('RGBA', 'LA') or (res_im.mode == 'P' and 'transparency' in res_im.info):
                        res_im = res_im.convert('RGBA')
                        canvas.paste(res_im, ((800 - nw) // 2, (800 - nh) // 2), mask=res_im)
                    else:
                        canvas.paste(res_im.convert('RGB'), ((800 - nw) // 2, (800 - nh) // 2))
                    out_path = os.path.join('public', 'products', 'packshots', filename)
                    canvas.save(out_path, 'WEBP', quality=90)
                    print(f'Successfully saved {filename} from {u[:60]}...')
                    return True
        except Exception:
            continue
    print(f'Failed {query}')
    return False

if __name__ == '__main__':
    fetch('India Gate Classic Basmati Rice 1kg packshot white background', 'test-india-gate-1kg.webp')
    fetch('Freedom Refined Sunflower Oil 1L pouch packshot', 'test-freedom-pouch.webp')
    fetch('Freedom Refined Sunflower Oil 1L bottle packshot', 'test-freedom-bottle.webp')
    fetch('Freedom Refined Sunflower Oil 5L can packshot', 'test-freedom-5l.webp')
    fetch('Tata Sampann Toor Dal 1kg packshot', 'test-tata-sampann-toor.webp')
    fetch('Happilo California Almonds 200g pouch packshot', 'test-happilo-almonds.webp')
