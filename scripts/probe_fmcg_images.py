import urllib.request
import urllib.parse
import re
import ssl
import io
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def probe_and_validate(url, min_size=5000):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=7) as res:
            if res.status == 200:
                data = res.read()
                if len(data) >= min_size:
                    img = Image.open(io.BytesIO(data))
                    return True, img.size, len(data)
    except Exception as e:
        pass
    return False, None, 0

# Test some potential candidate URLs for national FMCG products
test_candidates = {
    'medimix_classic_75g': [
        'https://www.medimixayurveda.com/cdn/shop/products/18-Herbs-75g-Front.jpg',
        'https://m.media-amazon.com/images/I/61yR4OQjDUL._SL1500_.jpg'
    ],
    'ujala_supreme_75ml': [
        'https://m.media-amazon.com/images/I/61m1hD+BvYL._SL1500_.jpg'
    ],
    'exo_bar_125g': [
        'https://m.media-amazon.com/images/I/61u+J6c0X5L._SL1500_.jpg'
    ]
}

for name, urls in test_candidates.items():
    print(f"Testing {name}:")
    for u in urls:
        ok, dims, size = probe_and_validate(u)
        print(f"  {u} -> ok={ok}, dims={dims}, bytes={size}")
