import urllib.request
import json

cat = json.load(open('src/data/products-catalog.json', encoding='utf-8'))
exp = [p for p in cat if p['id'] >= 'g1-hh150' and p['id'] <= 'g1-hh184']

img_errors = []
prod_errors = []

for p in exp:
    img_url = 'http://localhost:3000' + p['image_url']
    try:
        res = urllib.request.urlopen(urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=5)
        if res.status != 200:
            img_errors.append((p['id'], img_url, res.status))
    except Exception as e:
        img_errors.append((p['id'], img_url, str(e)))

    prod_url = 'http://localhost:3000/product/' + p['id']
    try:
        res = urllib.request.urlopen(urllib.request.Request(prod_url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=5)
        if res.status != 200:
            prod_errors.append((p['id'], prod_url, res.status))
    except Exception as e:
        prod_errors.append((p['id'], prod_url, str(e)))

print(f"Tested {len(exp)} products on localhost:3000")
print(f"Image errors: {len(img_errors)}")
if img_errors:
    print("Image errors:", img_errors)
print(f"Product page errors: {len(prod_errors)}")
if prod_errors:
    print("Product page errors:", prod_errors)
