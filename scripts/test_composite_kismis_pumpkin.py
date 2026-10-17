import os
from PIL import Image, ImageFilter, ImageDraw

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
    (560, 715),
    (500, 735),
    (300, 735),
    (240, 715),
    (200, 600),
    (205, 380)
]
draw.polygon(fill_poly, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

# 1. Kismis
tex_k = Image.open("scratch_texture_raisins.jpg").convert("RGBA")
kw, kh = tex_k.size
# crop central raisins pile only, strictly above the bowl rim
tex_k_crop = tex_k.crop((int(kw*0.1), int(kh*0.15), int(kw*0.9), int(kh*0.72)))
tex_k_res = tex_k_crop.resize((800, 800), Image.Resampling.LANCZOS)
comp_k = Image.composite(tex_k_res, base_sq, mask)
lbl_k = Image.open("scratch_dry_fruits_labels/label_kismis.png").convert("RGBA")
tw = 240
th = int(lbl_k.height * (tw / lbl_k.width))
lbl_k_res = lbl_k.resize((tw, th), Image.Resampling.LANCZOS)
comp_k.paste(lbl_k_res, ((800 - tw)//2, 285), lbl_k_res)
comp_k.convert("RGB").save("scratch_test_kismis_final.webp", "WEBP", quality=92)
print("Saved scratch_test_kismis_final.webp")

# 2. Pumpkin Seeds
tex_p = Image.open("scratch_texture_pumpkin_seeds.jpg").convert("RGBA")
pw, ph = tex_p.size
p_dim = min(pw, ph)
tex_p_crop = tex_p.crop(((pw - p_dim)//2, (ph - p_dim)//2, (pw + p_dim)//2, (ph + p_dim)//2))
tex_p_res = tex_p_crop.resize((800, 800), Image.Resampling.LANCZOS)
comp_p = Image.composite(tex_p_res, base_sq, mask)
lbl_p = Image.open("scratch_dry_fruits_labels/label_pumpkin_seeds.png").convert("RGBA")
th_p = int(lbl_p.height * (tw / lbl_p.width))
lbl_p_res = lbl_p.resize((tw, th_p), Image.Resampling.LANCZOS)
comp_p.paste(lbl_p_res, ((800 - tw)//2, 285), lbl_p_res)
comp_p.convert("RGB").save("scratch_test_pumpkin_seeds_final.webp", "WEBP", quality=92)
print("Saved scratch_test_pumpkin_seeds_final.webp")
