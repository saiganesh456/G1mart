import json
import os
from PIL import Image
import numpy as np

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

def is_green_placard(img_path):
    if not os.path.exists(img_path) or not img_path.endswith('.webp'):
        return False
    try:
        im = Image.open(img_path).convert('RGB')
        if im.size != (800, 800):
            return False
        arr = np.array(im)
        reg = arr[280:350, 320:480]
        r = float(reg[:,:,0].mean())
        g = float(reg[:,:,1].mean())
        b = float(reg[:,:,2].mean())
        return r < 80 and 35 < g < 120 and b < 80 and (g - r) > 15
    except:
        return False

placard_prods = []
for p in products:
    img_url = p.get('image_url') or ''
    local_path = os.path.join('public', img_url.lstrip('/'))
    if is_green_placard(local_path):
        placard_prods.append(p)

print(f"Total green placard products: {len(placard_prods)}")
with open('scratch_check/placard_products.json', 'w', encoding='utf-8') as out:
    json.dump(placard_prods, out, indent=2)

print("Saved to scratch_check/placard_products.json")
