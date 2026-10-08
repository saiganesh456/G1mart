import requests
from PIL import Image
from io import BytesIO

urls = {
    'good_day_2': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/8c544e00-79ab-4805-a986-a8e5db26234e/Britannia-Good-Day-Cashew-Cookies.png',
    'good_day_3': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/6d3dac9a-dda9-41b2-840d-79cd3655b093/Britannia-Good-Day-Cashew-Cookies-Family-Pack-Combo.png',
    'good_day_blinkit': 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/8003702b-f268-4e4f-bb2c-e02d81602497.png',
    'kurkure_bb': 'https://www.bbassets.com/media/uploads/p/l/294305_15-kurkure-namkeen-masala-munch.jpg',
    'kurkure_zepto2': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/b62d0d1b-5d0a-4275-9efc-3cf21bebc6a3/Kurkure-Namkeen-Masala-Munch.jpg',
    'kurkure_blinkit': 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/dbc0f800-bf00-4293-9a93-aef67846776f.jpg'
}

for k, u in urls.items():
    try:
        r = requests.get(u, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200:
            img = Image.open(BytesIO(r.content))
            ext = 'png' if img.mode == 'RGBA' else 'jpg'
            img.save(f'public/products/packshots/test-{k}.{ext}')
            print(f'{k}: saved as {ext} ({img.size})')
        else:
            print(f'{k}: {r.status_code}')
    except Exception as e:
        print(f'{k}: error {e}')
