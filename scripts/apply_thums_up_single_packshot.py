import os
import shutil
from PIL import Image, ImageFilter
import numpy as np
from collections import deque
import json

print("=== 1. PREPARING SINGLE PROFESSIONAL THUMS UP PACKSHOT ===")

# Paths
SOURCE_BOTTLE = r'C:\Users\Harsha vardhan\.gemini\antigravity\brain\eeb80955-76df-497f-b161-85037d551453\scratch\imimg_bottle.png'
TARGET_DIR = r'public\products\verified'
PACKSHOTS_DIR = r'public\products\packshots'
PACKSHOTS_FMCG_DIR = r'public\products\packshots_fmcg'
BACKUP_DIR = r'image_backups_pre_compress\thums_up_backup'

os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(TARGET_DIR, exist_ok=True)
os.makedirs(PACKSHOTS_DIR, exist_ok=True)
os.makedirs(PACKSHOTS_FMCG_DIR, exist_ok=True)

# Backup current verified files
files_to_backup = [
    'bev-thums-up-250ml.webp',
    'bev-thums-up-750ml.webp',
    'bev-thums-up-1l.webp',
    'bev-thums-up-2l.webp'
]
for fname in files_to_backup:
    src_f = os.path.join(TARGET_DIR, fname)
    if os.path.exists(src_f):
        shutil.copy2(src_f, os.path.join(BACKUP_DIR, fname))
        print(f"Backed up {fname} to {BACKUP_DIR}")

# 1. Process the high-res single Thums Up bottle cutout
im = Image.open(SOURCE_BOTTLE).convert('RGB')
arr = np.array(im)
h, w, _ = arr.shape

# BFS flood-fill background segmentation starting from corners
visited = np.zeros((h, w), dtype=bool)
queue = deque([(0, 0), (0, w-1), (h-1, 0), (h-1, w-1)])
for r, c in queue:
    visited[r, c] = True

while queue:
    r, c = queue.popleft()
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < h and 0 <= nc < w and not visited[nr, nc]:
            if np.all(arr[nr, nc] >= 238):
                visited[nr, nc] = True
                queue.append((nr, nc))

alpha = np.where(visited, 0, 255).astype(np.uint8)
alpha_img = Image.fromarray(alpha, 'L').filter(ImageFilter.GaussianBlur(radius=0.5))

rgba_bottle = Image.fromarray(arr, 'RGB')
rgba_bottle.putalpha(alpha_img)

# Crop exact foreground bounds
bbox = rgba_bottle.getbbox()
cropped_bottle = rgba_bottle.crop(bbox)
print(f"Isolated single bottle: {cropped_bottle.size}")

# Helper: Build 800x800 square canvas with pure white background
def create_packshot_canvas(bottle_img, canvas_size=800, target_height=670):
    cw, ch = bottle_img.size
    scale = target_height / ch
    tw = int(cw * scale)
    resized = bottle_img.resize((tw, target_height), Image.Resampling.LANCZOS)
    canvas = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
    offset = ((canvas_size - tw) // 2, (canvas_size - target_height) // 2)
    canvas.paste(resized, offset, resized)
    return canvas

# 2. Build 2.25L family pack bottle cutout
orig_2l_path = os.path.join(BACKUP_DIR, 'bev-thums-up-2l.webp')
if os.path.exists(orig_2l_path):
    im_2l = Image.open(orig_2l_path)
    left_2l = im_2l.crop((0, 0, 560, 800))
    arr_2l = np.array(left_2l.convert('RGB'))
    mask_2l = (arr_2l[:, :, 0] < 245) | (arr_2l[:, :, 1] < 245) | (arr_2l[:, :, 2] < 245)
    coords_2l = np.argwhere(mask_2l)
    ymin_2l, xmin_2l = coords_2l.min(axis=0)
    ymax_2l, xmax_2l = coords_2l.max(axis=0)
    cropped_2l = left_2l.crop((xmin_2l, ymin_2l, xmax_2l + 1, ymax_2l + 1))
    
    # Create smooth alpha for 2.25L
    arr_c2l = np.array(cropped_2l.convert('RGB'))
    h2, w2, _ = arr_c2l.shape
    vis_2l = np.zeros((h2, w2), dtype=bool)
    q2 = deque([(0, 0), (0, w2-1), (h2-1, 0), (h2-1, w2-1)])
    for r, c in q2:
        vis_2l[r, c] = True
    while q2:
        r, c = q2.popleft()
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < h2 and 0 <= nc < w2 and not vis_2l[nr, nc]:
                if np.all(arr_c2l[nr, nc] >= 240):
                    vis_2l[nr, nc] = True
                    q2.append((nr, nc))
    alpha_2l = np.where(vis_2l, 0, 255).astype(np.uint8)
    alpha_2l_img = Image.fromarray(alpha_2l, 'L').filter(ImageFilter.GaussianBlur(radius=0.5))
    rgba_2l = Image.fromarray(arr_c2l, 'RGB')
    rgba_2l.putalpha(alpha_2l_img)
    cropped_2l_clean = rgba_2l.crop(rgba_2l.getbbox())
else:
    cropped_2l_clean = cropped_bottle

print("=== 2. GENERATING VERIFIED WEBP IMAGES ===")

# 250 ml (Single Pet Bottle): target height 590px
pack_250ml = create_packshot_canvas(cropped_bottle, canvas_size=800, target_height=590)
pack_250ml.save(os.path.join(TARGET_DIR, 'bev-thums-up-250ml.webp'), 'WEBP', quality=95)
print(f"[OK] Generated {os.path.join(TARGET_DIR, 'bev-thums-up-250ml.webp')}")

# 750 ml (Standard Bottle): target height 670px
pack_750ml = create_packshot_canvas(cropped_bottle, canvas_size=800, target_height=670)
pack_750ml.save(os.path.join(TARGET_DIR, 'bev-thums-up-750ml.webp'), 'WEBP', quality=95)
print(f"[OK] Generated {os.path.join(TARGET_DIR, 'bev-thums-up-750ml.webp')}")

# 1.25 L (Medium Bottle): target height 700px
pack_1l = create_packshot_canvas(cropped_bottle, canvas_size=800, target_height=700)
pack_1l.save(os.path.join(TARGET_DIR, 'bev-thums-up-1l.webp'), 'WEBP', quality=95)
print(f"[OK] Generated {os.path.join(TARGET_DIR, 'bev-thums-up-1l.webp')}")

# 2.25 L (Family Pack): target height 710px using clean 2.25L bottle
pack_2l = create_packshot_canvas(cropped_2l_clean, canvas_size=800, target_height=710)
pack_2l.save(os.path.join(TARGET_DIR, 'bev-thums-up-2l.webp'), 'WEBP', quality=95)
print(f"[OK] Generated {os.path.join(TARGET_DIR, 'bev-thums-up-2l.webp')}")

# Packshots for hero collages / banners (600x600 transparent PNG & JPG)
cw, ch = cropped_bottle.size
scale = 520 / ch
tw = int(cw * scale)
resized_600 = cropped_bottle.resize((tw, 520), Image.Resampling.LANCZOS)

# PNG (transparent)
canvas_png = Image.new('RGBA', (600, 600), (255, 255, 255, 0))
offset_600 = ((600 - tw) // 2, (600 - 520) // 2)
canvas_png.paste(resized_600, offset_600, resized_600)
canvas_png.save(os.path.join(PACKSHOTS_DIR, 'thums-up.png'), 'PNG', optimize=True)

# JPG (white background)
canvas_jpg = Image.new('RGB', (600, 600), (255, 255, 255))
canvas_jpg.paste(resized_600, offset_600, resized_600)
canvas_jpg.save(os.path.join(PACKSHOTS_DIR, 'thums-up.jpg'), 'JPEG', quality=95, optimize=True)

# FMCG packshot updates
canvas_png.save(os.path.join(PACKSHOTS_FMCG_DIR, 'rembg_thums-up.png'), 'PNG', optimize=True)
canvas_png.save(os.path.join(PACKSHOTS_FMCG_DIR, 'hd_thums_up_bottle.png'), 'PNG', optimize=True)
print("[OK] Updated packshots PNG, JPG and FMCG copies")

print("=== 3. SYNCHRONIZING CATALOG DATA ===")

# Sync src/data/products-catalog.json
cat_path = 'src/data/products-catalog.json'
with open(cat_path, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

for p in catalog:
    if p.get('id') == 'g1-bev001':
        p['image_url'] = '/products/verified/bev-thums-up-250ml.webp'
        p['imageUrl'] = '/products/verified/bev-thums-up-250ml.webp'
        p['image'] = '/products/verified/bev-thums-up-250ml.webp'
        p['image_path'] = '/products/verified/bev-thums-up-250ml.webp'
        p['image_status'] = 'verified'
        p['imageStatus'] = 'verified'
        for v in p.get('variants', []):
            label = (v.get('name') or v.get('unit') or '').lower()
            if '250' in label:
                v['image'] = '/products/verified/bev-thums-up-250ml.webp'
            elif '750' in label:
                v['image'] = '/products/verified/bev-thums-up-750ml.webp'
            elif '1.25' in label or ('1' in label and '2.25' not in label and '2' not in label):
                v['image'] = '/products/verified/bev-thums-up-1l.webp'
            elif '2.25' in label or '2' in label:
                v['image'] = '/products/verified/bev-thums-up-2l.webp'

with open(cat_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)
print("Updated src/data/products-catalog.json")

# Sync data/migrated_products.json
mig_prods_path = 'data/migrated_products.json'
with open(mig_prods_path, 'r', encoding='utf-8') as f:
    mig_prods = json.load(f)

for p in mig_prods:
    if p.get('id') == 'g1-bev001':
        p['image_url'] = '/products/verified/bev-thums-up-250ml.webp'
        p['imageUrl'] = '/products/verified/bev-thums-up-250ml.webp'
        p['image'] = '/products/verified/bev-thums-up-250ml.webp'
        p['image_path'] = '/products/verified/bev-thums-up-250ml.webp'

with open(mig_prods_path, 'w', encoding='utf-8') as f:
    json.dump(mig_prods, f, indent=2, ensure_ascii=False)
print("Updated data/migrated_products.json")

# Sync data/migrated_product_variants.json
mig_vars_path = 'data/migrated_product_variants.json'
with open(mig_vars_path, 'r', encoding='utf-8') as f:
    mig_vars = json.load(f)

for v in mig_vars:
    if v.get('product_id') == 'g1-bev001':
        label = (v.get('size_label') or '').lower()
        if '250' in label:
            v['image_url'] = '/products/verified/bev-thums-up-250ml.webp'
        elif '750' in label:
            v['image_url'] = '/products/verified/bev-thums-up-750ml.webp'
        elif '1.25' in label or ('1' in label and '2.25' not in label and '2' not in label):
            v['image_url'] = '/products/verified/bev-thums-up-1l.webp'
        elif '2.25' in label or '2' in label:
            v['image_url'] = '/products/verified/bev-thums-up-2l.webp'

with open(mig_vars_path, 'w', encoding='utf-8') as f:
    json.dump(mig_vars, f, indent=2, ensure_ascii=False)
print("Updated data/migrated_product_variants.json")

print("\n=== SUCCESS: ALL THUMS UP IMAGES AND DATA FULLY UPDATED! ===")
