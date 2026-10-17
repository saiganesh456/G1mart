import os
from PIL import Image, ImageFilter
from PIL import ImageDraw

base = Image.open(r"C:/Users/Harsha vardhan/.gemini/antigravity/brain/bc58bde4-71ae-4fd8-ab49-b925daf43d41/nuvvulu_sesame_packshot_1792248874567.jpg").convert("RGBA")
w, h = base.size
dim = min(w, h)
base_sq = base.crop(((w - dim)//2, (h - dim)//2, (w + dim)//2, (h + dim)//2)).resize((800, 800), Image.Resampling.LANCZOS)

mask = Image.new("L", (800, 800), 0)
draw = ImageDraw.Draw(mask)
fill_poly = [
    (230, 240),
    (570, 240),
    (595, 380),
    (600, 600),
    (560, 710),
    (500, 730),
    (300, 730),
    (240, 710),
    (200, 600),
    (205, 380)
]
draw.polygon(fill_poly, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

# Dates texture
tex = Image.open("scratch_texture_dates.jpg").convert("RGBA")
tw, th = tex.size
# crop central dense dates
tex_cropped = tex.crop((tw*0.1, th*0.1, tw*0.9, th*0.9))
tex_resized = tex_cropped.resize((800, 800), Image.Resampling.LANCZOS)

comp = Image.composite(tex_resized, base_sq, mask)

lbl = Image.open("scratch_dry_fruits_labels/label_dates.png").convert("RGBA")
target_w = 240
target_h = int(lbl.height * (target_w / lbl.width))
lbl_resized = lbl.resize((target_w, target_h), Image.Resampling.LANCZOS)
pos_x = (800 - target_w) // 2
pos_y = 285
comp.paste(lbl_resized, (pos_x, pos_y), lbl_resized)

comp.convert("RGB").save("scratch_test_dates_pouch.webp", "WEBP", quality=92)
print("Saved scratch_test_dates_pouch.webp successfully!")
