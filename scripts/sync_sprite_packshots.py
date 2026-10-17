import os
import io
import json
import requests
from PIL import Image
import numpy as np

target_dir = r'public\products\verified'
scratch_dir = r'C:\Users\gumma\.gemini\antigravity\brain\97272b73-8869-4743-ba4d-dd618953a077\scratch'

def process_bottle(raw_img, target_height):
    canvas_size = 600
    if raw_img.mode in ('RGBA', 'LA') or (raw_img.mode == 'P' and 'transparency' in raw_img.info):
        rgba = raw_img.convert('RGBA')
        arr = np.array(rgba)
        alpha = arr[:, :, 3]
        non_empty = np.where(alpha > 10)
        if len(non_empty[0]) > 0:
            ymin, ymax = non_empty[0].min(), non_empty[0].max()
            xmin, xmax = non_empty[1].min(), non_empty[1].max()
            cropped = rgba.crop((xmin, ymin, xmax + 1, ymax + 1))
        else:
            cropped = rgba
        
        # Scale to target_height
        w, h = cropped.size
        scale = target_height / h
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        bg = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
        offset_x = (canvas_size - new_w) // 2
        offset_y = (canvas_size - new_h) // 2
        bg.paste(resized, (offset_x, offset_y), resized)
        return bg
    else:
        rgb = raw_img.convert('RGB')
        arr = np.array(rgb)
        mask = (arr[:, :, 0] < 245) | (arr[:, :, 1] < 245) | (arr[:, :, 2] < 245)
        non_empty = np.where(mask)
        if len(non_empty[0]) > 0:
            ymin, ymax = non_empty[0].min(), non_empty[0].max()
            xmin, xmax = non_empty[1].min(), non_empty[1].max()
            h_orig, w_orig = arr.shape[:2]
            ymin = max(0, ymin - 1)
            ymax = min(h_orig, ymax + 1)
            xmin = max(0, xmin - 1)
            xmax = min(w_orig, xmax + 1)
            cropped = rgb.crop((xmin, ymin, xmax + 1, ymax + 1))
        else:
            cropped = rgb
            
        w, h = cropped.size
        scale = target_height / h
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        bg = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
        offset_x = (canvas_size - new_w) // 2
        offset_y = (canvas_size - new_h) // 2
        bg.paste(resized, (offset_x, offset_y))
        return bg

print("1. Processing Sprite 250ml (target height 410px)...")
img_250 = Image.open(os.path.join(scratch_dir, 'sprite_bb_250ml.jpg'))
proc_250 = process_bottle(img_250, 410)
out_250 = os.path.join(target_dir, 'bev-sprite-250ml.webp')
proc_250.save(out_250, 'WEBP', quality=95)
print(f"Saved {out_250}")

print("2. Processing Sprite 750ml (target height 485px)...")
r_750 = requests.get('https://www.bbassets.com/media/uploads/p/xxl/251006_14-sprite-soft-drink-lime-flavoured.jpg', headers={'User-Agent': 'Mozilla/5.0'})
img_750 = Image.open(io.BytesIO(r_750.content))
proc_750 = process_bottle(img_750, 485)
out_750 = os.path.join(target_dir, 'bev-sprite-750ml.webp')
proc_750.save(out_750, 'WEBP', quality=95)
print(f"Saved {out_750}")

print("3. Processing Sprite 1L (target height 520px)...")
r_1l = requests.get('https://www.bbassets.com/media/uploads/p/xxl/40204143_1-sprite-sprite.jpg', headers={'User-Agent': 'Mozilla/5.0'})
img_1l = Image.open(io.BytesIO(r_1l.content))
proc_1l = process_bottle(img_1l, 520)
out_1l = os.path.join(target_dir, 'bev-sprite-1l.webp')
proc_1l.save(out_1l, 'WEBP', quality=95)
print(f"Saved {out_1l}")

print("4. Processing Sprite 2.25L Family Pack (target height 510px)...")
img_2l = Image.open(os.path.join(scratch_dir, 'sprite_bb_2l.jpg'))
proc_2l = process_bottle(img_2l, 510)
out_2l = os.path.join(target_dir, 'bev-sprite-2l.webp')
proc_2l.save(out_2l, 'WEBP', quality=95)
print(f"Saved {out_2l}")

# Now update data files
print("\nUpdating data/migrated_product_variants.json...")
var_path = 'data/migrated_product_variants.json'
with open(var_path, 'r', encoding='utf-8') as f:
    variants = json.load(f)

for v in variants:
    if v.get('product_id') == 'g1-bev003':
        label = (v.get('size_label') or '').lower()
        if '250' in label:
            v['image_url'] = '/products/verified/bev-sprite-250ml.webp'
        elif '750' in label:
            v['image_url'] = '/products/verified/bev-sprite-750ml.webp'
        elif '1' in label and '2.25' not in label and '2' not in label:
            v['image_url'] = '/products/verified/bev-sprite-1l.webp'
        elif '2.25' in label or '2' in label:
            v['image_url'] = '/products/verified/bev-sprite-2l.webp'

with open(var_path, 'w', encoding='utf-8') as f:
    json.dump(variants, f, indent=2)
print("Updated migrated_product_variants.json")

print("\nUpdating src/data/products-catalog.json...")
cat_path = 'src/data/products-catalog.json'
with open(cat_path, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

for p in catalog:
    if p.get('id') == 'g1-bev003':
        p['image_url'] = '/products/verified/bev-sprite-750ml.webp'
        p['imageUrl'] = '/products/verified/bev-sprite-750ml.webp'
        p['image'] = '/products/verified/bev-sprite-750ml.webp'
        p['image_path'] = '/products/verified/bev-sprite-750ml.webp'
        for v in p.get('variants', []):
            label = (v.get('name') or v.get('unit') or '').lower()
            if '250' in label:
                v['image'] = '/products/verified/bev-sprite-250ml.webp'
            elif '750' in label:
                v['image'] = '/products/verified/bev-sprite-750ml.webp'
            elif '1' in label and '2.25' not in label and '2' not in label:
                v['image'] = '/products/verified/bev-sprite-1l.webp'
            elif '2.25' in label or '2' in label:
                v['image'] = '/products/verified/bev-sprite-2l.webp'
    elif p.get('id') == 'g1-bev033':
        p['image_url'] = '/products/verified/bev-sprite-250ml.webp'
        p['imageUrl'] = '/products/verified/bev-sprite-250ml.webp'
        p['image'] = '/products/verified/bev-sprite-250ml.webp'
        if p.get('variants'):
            p['variants'][0]['image'] = '/products/verified/bev-sprite-250ml.webp'
    elif p.get('id') == 'g1-bev034':
        p['image_url'] = '/products/verified/bev-sprite-1l.webp'
        p['imageUrl'] = '/products/verified/bev-sprite-1l.webp'
        p['image'] = '/products/verified/bev-sprite-1l.webp'
        if p.get('variants'):
            p['variants'][0]['image'] = '/products/verified/bev-sprite-1l.webp'
    elif p.get('id') == 'g1-bev035':
        p['image_url'] = '/products/verified/bev-sprite-2l.webp'
        p['imageUrl'] = '/products/verified/bev-sprite-2l.webp'
        p['image'] = '/products/verified/bev-sprite-2l.webp'
        if p.get('variants'):
            p['variants'][0]['image'] = '/products/verified/bev-sprite-2l.webp'

with open(cat_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2)
print("Updated products-catalog.json")

print("\nALL SPRITE PACKSHOTS PROCESSED AND SYNCHRONIZED SUCCESSFULLY!")
