import requests
import io
import os
from PIL import Image
import numpy as np

scratch_dir = r'C:\Users\gumma\.gemini\antigravity\brain\97272b73-8869-4743-ba4d-dd618953a077\scratch'

def process_transparency_or_white(raw_img, padding_ratio=0.10):
    # If image has palette with transparency or RGBA
    if raw_img.mode in ('RGBA', 'LA') or (raw_img.mode == 'P' and 'transparency' in raw_img.info):
        rgba = raw_img.convert('RGBA')
        arr = np.array(rgba)
        # alpha mask
        alpha = arr[:, :, 3]
        # find bounding box of non-transparent pixels
        non_empty = np.where(alpha > 10)
        if len(non_empty[0]) > 0:
            ymin, ymax = non_empty[0].min(), non_empty[0].max()
            xmin, xmax = non_empty[1].min(), non_empty[1].max()
            cropped = rgba.crop((xmin, ymin, xmax + 1, ymax + 1))
        else:
            cropped = rgba
        
        # Now fit into 600x600 square on white background
        canvas_size = 600
        max_dim = int(canvas_size * (1 - 2 * padding_ratio))
        # Maintain aspect ratio
        w, h = cropped.size
        scale = max_dim / max(w, h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        bg = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
        offset_x = (canvas_size - new_w) // 2
        offset_y = (canvas_size - new_h) // 2
        bg.paste(resized, (offset_x, offset_y), resized)
        return bg
    else:
        # RGB image with white or near-white background
        rgb = raw_img.convert('RGB')
        arr = np.array(rgb)
        # Find object bounding box (pixels not pure white / light gray)
        # near white threshold
        mask = (arr[:, :, 0] < 245) | (arr[:, :, 1] < 245) | (arr[:, :, 2] < 245)
        non_empty = np.where(mask)
        if len(non_empty[0]) > 0:
            ymin, ymax = non_empty[0].min(), non_empty[0].max()
            xmin, xmax = non_empty[1].min(), non_empty[1].max()
            # slight margin
            h_orig, w_orig = arr.shape[:2]
            ymin = max(0, ymin - 2)
            ymax = min(h_orig, ymax + 2)
            xmin = max(0, xmin - 2)
            xmax = min(w_orig, xmax + 2)
            cropped = rgb.crop((xmin, ymin, xmax, ymax))
        else:
            cropped = rgb
            
        canvas_size = 600
        max_dim = int(canvas_size * (1 - 2 * padding_ratio))
        w, h = cropped.size
        scale = max_dim / max(w, h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        bg = Image.new('RGB', (canvas_size, canvas_size), (255, 255, 255))
        offset_x = (canvas_size - new_w) // 2
        offset_y = (canvas_size - new_h) // 2
        bg.paste(resized, (offset_x, offset_y))
        return bg

# 1. 250ml
img_250 = Image.open(os.path.join(scratch_dir, 'sprite_bb_250ml.jpg'))
proc_250 = process_transparency_or_white(img_250, padding_ratio=0.12)
proc_250.save(os.path.join(scratch_dir, 'proc_sprite_250ml.webp'), 'WEBP', quality=95)
print("Saved 250ml")

# 2. 750ml
# Let's fetch original 251006_14 with transparency
r_750 = requests.get('https://www.bbassets.com/media/uploads/p/xxl/251006_14-sprite-soft-drink-lime-flavoured.jpg', headers={'User-Agent': 'Mozilla/5.0'})
img_750 = Image.open(io.BytesIO(r_750.content))
proc_750 = process_transparency_or_white(img_750, padding_ratio=0.08)
proc_750.save(os.path.join(scratch_dir, 'proc_sprite_750ml.webp'), 'WEBP', quality=95)
print("Saved 750ml")

# 3. 1L
r_1l = requests.get('https://www.bbassets.com/media/uploads/p/xxl/40204143_1-sprite-sprite.jpg', headers={'User-Agent': 'Mozilla/5.0'})
img_1l = Image.open(io.BytesIO(r_1l.content))
proc_1l = process_transparency_or_white(img_1l, padding_ratio=0.06)
proc_1l.save(os.path.join(scratch_dir, 'proc_sprite_1l.webp'), 'WEBP', quality=95)
print("Saved 1L")

# 4. 2.25L
img_2l = Image.open(os.path.join(scratch_dir, 'sprite_bb_2l.jpg'))
proc_2l = process_transparency_or_white(img_2l, padding_ratio=0.08)
proc_2l.save(os.path.join(scratch_dir, 'proc_sprite_2l.webp'), 'WEBP', quality=95)
print("Saved 2.25L")
