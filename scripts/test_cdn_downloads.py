import urllib.request

test_urls = [
    ('Colgate Media', 'https://pxmshare.colgatepalmolive.com/JPEG_1500/9a9eXWnwNideZ9eOYnTZY.jpg'),
    ('Zepto Maggi', 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/54dd2be1-d576-4d20-b4fe-e3f6d7ce7e6c/Maggi-2-Minute-Masala-Instant-Noodles.jpeg'),
    ('BigBasket Parle-G', 'https://www.bbassets.com/media/uploads/p/l/102737_10-parle-g-gluco-biscuits.jpg')
]

for name, u in test_urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            print(f"{name}: SUCCESS! Read {len(data)} bytes, Content-Type: {resp.headers.get('Content-Type')}")
    except Exception as e:
        print(f"{name}: FAILED - {e}")
