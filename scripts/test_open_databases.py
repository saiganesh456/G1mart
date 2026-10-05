import urllib.request
import urllib.parse
import json
import time

products_to_test = [
    ("Parle-G", "food"),
    ("Maggi Masala", "food"),
    ("Sunfeast Dark Fantasy", "food"),
    ("Good Day Butter", "food"),
    ("Colgate Strong Teeth", "beauty"),
    ("Dettol Original Soap", "beauty"),
    ("Clinic Plus Shampoo", "beauty"),
    ("Cinthol Soap", "beauty"),
    ("Lifebuoy Total", "beauty"),
    ("Tata Salt", "food"),
    ("Red Label Tea", "food"),
    ("Taj Mahal Tea", "food"),
    ("Surf Excel Easy Wash", "products"),
    ("Vim Dishwash Bar", "products"),
    ("Harpic Power Plus", "products"),
    ("Kurkure Masala Munch", "food"),
    ("Lay's India's Magic Masala", "food"),
    ("Bambino Vermicelli", "food"),
    ("Arokya Milk", "food"),
    ("Amul Taaza", "food")
]

for name, cat_type in products_to_test:
    domain = "world.openfoodfacts.org" if cat_type == "food" else ("world.openbeautyfacts.org" if cat_type == "beauty" else "world.openproductsfacts.org")
    url = f"https://{domain}/cgi/search.pl?search_terms={urllib.parse.quote(name)}&search_simple=1&action=process&json=1&page_size=3"
    req = urllib.request.Request(url, headers={'User-Agent': 'G1MartResearch/1.0 (dev@g1mart.in)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('products', [])
            matching = [p for p in items if p.get('image_front_url')]
            if matching:
                top = matching[0]
                img_url = top.get('image_front_url')
                full_img = img_url.replace('.400.jpg', '.full.jpg') if '.400.jpg' in img_url else img_url
                print(f"[FOUND] {name} ({domain}) -> {top.get('product_name')} | Brand: {top.get('brands')} | Img: {full_img}")
            else:
                print(f"[NO IMG] {name} ({domain}) -> Found {len(items)} items without image")
    except Exception as e:
        print(f"[ERR] {name}: {e}")
    time.sleep(1.0)
