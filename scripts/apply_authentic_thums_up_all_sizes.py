import os
from PIL import Image, ImageFilter
import numpy as np
from collections import deque
import json

scratch_cands = r'C:\Users\Harsha vardhan\.gemini\antigravity\brain\eeb80955-76df-497f-b161-85037d551453\scratch\cands'
target_dir = r'public\products\verified'
packshots_dir = r'public\products\packshots'
packshots_fmcg_dir = r'public\products\packshots_fmcg'

sources = {
    '250ml': {
        'path': os.path.join(scratch_cands, 'd2j_250.webp'),
        'target_h': 600,
        'dest': os.path.join(target_dir, 'bev-thums-up-250ml.webp')
    },
    '750ml': {
        'path': os.path.join(scratch_cands, 'cand_750_amz.jpg'),
        'target_h': 670,
        'dest': os.path.join(target_dir, 'bev-thums-up-750ml.webp')
    },
    '1l': {
        'path': os.path.join(scratch_cands, 'amz_125.jpg'),
        'target_h': 700,
        'dest': os.path.join(target_dir, 'bev-thums-up-1l.webp')
    },
    '2l': {
        'path': os.path.join(scratch_cands, 'amz_225_ti.jpg'),
        'target_h': 710,
        'dest': os.path.join(target_dir, 'bev-thums-up-2l.webp')
    }
}

def process_packshot(src_path, target_height, canvas_size=800):
    im = Image.open(src_path).convert('RGB')
    arr = np.array(im)
    h, w, _ = arr.shape

    # Flood fill from 4 corners to find white background
    visited = np.zeros((h, w), dtype=bool)
    queue = deque([(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)])
    for r, c in queue:
        visited[r, c] = True

    while queue:
        r, c = queue.popleft()
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < h and 0 <= nc < w and not visited[nr, nc]:
                # If near white
                if np.all(arr[nr, nc] >= 240):
                    visited[nr, nc] = True
                    queue.append((nr, nc))

    alpha = np.where(visited, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, 'L').filter(ImageFilter.GaussianBlur(radius=0.5))

    rgba = Image.fromarray(arr, 'RGB')
    rgba.putalpha(alpha_img)

    bbox = rgba.getbbox()
    cropped = rgba.crop(bbox)

    cw, ch = cropped.size
    scale = target_height / ch
    tw = int(cw * scale)
    resized = cropped.resize((tw, target_height), Image.Resampling.LANCZOS)

    canvas = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
    offset = ((canvas_size - tw) // 2, (canvas_size - target_height) // 2)
    canvas.paste(resized, offset, resized)
    return canvas, cropped

print("=== PROCESSING ALL 4 INDIVIDUAL THUMS UP SIZES ===")

cropped_750 = None

for key, cfg in sources.items():
    print(f"Processing {key} from {cfg['path']}...")
    canvas, cropped = process_packshot(cfg['path'], cfg['target_h'])
    canvas.save(cfg['dest'], 'WEBP', quality=95)
    print(f"  [OK] Saved {cfg['dest']}")
    if key == '750ml':
        cropped_750 = cropped

# Also generate 600x600 transparent packshots
if cropped_750:
    cw, ch = cropped_750.size
    scale = 520 / ch
    tw = int(cw * scale)
    resized_600 = cropped_750.resize((tw, 520), Image.Resampling.LANCZOS)

    canvas_png = Image.new('RGBA', (600, 600), (255, 255, 255, 0))
    offset_600 = ((600 - tw) // 2, (600 - 520) // 2)
    canvas_png.paste(resized_600, offset_600, resized_600)
    canvas_png.save(os.path.join(packshots_dir, 'thums-up.png'), 'PNG', optimize=True)

    canvas_jpg = Image.new('RGB', (600, 600), (255, 255, 255))
    canvas_jpg.paste(resized_600, offset_600, resized_600)
    canvas_jpg.save(os.path.join(packshots_dir, 'thums-up.jpg'), 'JPEG', quality=95, optimize=True)

    canvas_png.save(os.path.join(packshots_fmcg_dir, 'rembg_thums-up.png'), 'PNG', optimize=True)
    canvas_png.save(os.path.join(packshots_fmcg_dir, 'hd_thums_up_bottle.png'), 'PNG', optimize=True)
    print("  [OK] Saved packshots PNG & JPG")

# Verify catalog data
print("\n=== VERIFYING CATALOG DATA ===")
for path in ['src/data/products-catalog.json', 'data/migrated_products.json', 'data/migrated_product_variants.json']:
    data = json.load(open(path, encoding='utf-8'))
    print(f"{path}: valid JSON ({len(data)} items)")

print("\n=== COMPLETE! ===")
