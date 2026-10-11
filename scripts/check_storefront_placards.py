import json
import os
import numpy as np
from PIL import Image

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    prods = json.load(f)

print(f"Total products in storefront: {len(prods)}")
green_count = 0
green_items = []

for p in prods:
    url = p.get('imageUrl') or p.get('image_url') or p.get('image') or ''
    if not url.startswith('/'):
        continue
    path = os.path.join('public', url.lstrip('/'))
    if not os.path.exists(path) or not path.endswith('.webp'):
        continue
    try:
        im = Image.open(path).convert('RGB')
        if im.size != (800, 800):
            continue
        arr = np.array(im)
        reg = arr[280:350, 320:480]
        r = float(reg[:,:,0].mean())
        g = float(reg[:,:,1].mean())
        b = float(reg[:,:,2].mean())
        if r < 80 and 35 < g < 120 and b < 80 and (g - r) > 15:
            green_count += 1
            green_items.append((p.get('id'), p.get('name'), path))
    except Exception as e:
        pass

print(f"Total green placards in storefront catalog: {green_count}")
for item in green_items[:10]:
    print(f"  {item[0]}: {item[1]} -> {item[2]}")
