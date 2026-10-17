import os
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

# Load transparent pouch base (miriyalu or nuvvulu or groundnuts)
base = Image.open(r"C:/Users/Harsha vardhan/.gemini/antigravity/brain/bc58bde4-71ae-4fd8-ab49-b925daf43d41/nuvvulu_sesame_packshot_1792248874567.jpg").convert("RGBA")
w, h = base.size
dim = min(w, h)
base_sq = base.crop(((w - dim)//2, (h - dim)//2, (w + dim)//2, (h + dim)//2)).resize((800, 800), Image.Resampling.LANCZOS)

# Create product fill mask
# In nuvvulu pouch, the sesame seeds are inside the pouch from y=240 to y=720, x=220 to x=580
# Let's inspect the alpha / color of nuvvulu
# Create an elliptical / rounded mask for the inside pouch
mask = Image.new("L", (800, 800), 0)
from PIL import ImageDraw
draw = ImageDraw.Draw(mask)
# Pouch fill polygon matching the natural curve of the standing pouch
fill_poly = [
    (230, 240),
    (570, 240),
    (595, 380),
    (600, 600),
    (560, 715),
    (500, 735),
    (300, 735),
    (240, 715),
    (200, 600),
    (205, 380)
]
draw.polygon(fill_poly, fill=255)
# Smooth mask edges
mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

# Test with raisins texture
tex = Image.open("scratch_texture_raisins.jpg").convert("RGBA")
tw, th = tex.size
min_dim = min(tw, th)
tex_cropped = tex.crop(((tw - min_dim)//2, (th - min_dim)//2, (tw + min_dim)//2, (th + min_dim)//2))
tex_resized = tex_cropped.resize((800, 800), Image.Resampling.LANCZOS)

# Composite texture over base
comp = Image.composite(tex_resized, base_sq, mask)

# Paste label
lbl = Image.open("scratch_dry_fruits_labels/label_kismis.png").convert("RGBA")
target_w = 240
target_h = int(lbl.height * (target_w / lbl.width))
lbl_resized = lbl.resize((target_w, target_h), Image.Resampling.LANCZOS)
pos_x = (800 - target_w) // 2
pos_y = 285
comp.paste(lbl_resized, (pos_x, pos_y), lbl_resized)

comp.convert("RGB").save("scratch_test_kismis_pouch.webp", "WEBP", quality=92)
print("Saved scratch_test_kismis_pouch.webp successfully!")
