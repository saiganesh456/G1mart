import os
import sys
import urllib.request
import urllib.parse
import re
import ssl
import io
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

def test_fetch(name, query):
    url = f'https://www.bing.com/images/search?q={urllib.parse.quote(query)}&first=1'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            print(f'{name}: found {len(murls)} urls')
            for u in murls[:8]:
                try:
                    img_req = urllib.request.Request(u, headers=HEADERS)
                    with urllib.request.urlopen(img_req, context=ctx, timeout=8) as ir:
                        im = Image.open(io.BytesIO(ir.read()))
                        if im.size[0] >= 400 and im.size[1] >= 400:
                            out_p = f'scratch_tex_{name}.jpg'
                            im.convert('RGB').save(out_p, 'JPEG', quality=95)
                            print(f'  -> Downloaded {name} from {u[:50]}... size: {im.size}')
                            return True
                except Exception as ex:
                    continue
    except Exception as e:
        print(f'{name} error: {e}')
    return False

queries = [
    ('sugar', 'white granulated sugar crystals macro texture'),
    ('crystal_salt', 'coarse sea salt crystals macro texture'),
    ('table_salt', 'fine white table salt texture powder macro'),
    ('country_bellam', 'indian jaggery blocks bellam gur pieces texture'),
    ('thati_bellam', 'palm jaggery karupatti black pieces texture'),
    ('patika_bellam', 'mishri rock sugar crystals macro white'),
    ('jaggery_powder', 'pure jaggery powder shakkar golden texture'),
]

for name, q in queries:
    res = test_fetch(name, q)
    print(f'Result for {name}: {res}')
