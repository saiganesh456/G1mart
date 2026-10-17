import os
from PIL import Image, ImageFilter, ImageDraw

OUT_DIR = "public/products/generated_pouches"
VER_DIR = "public/products/verified"
LBL_DIR = "scratch_dry_fruits_labels"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(VER_DIR, exist_ok=True)

# 1. Base Pouch for texture composition
base_pouch_path = r"C:/Users/Harsha vardhan/.gemini/antigravity/brain/bc58bde4-71ae-4fd8-ab49-b925daf43d41/nuvvulu_sesame_packshot_1792248874567.jpg"
base = Image.open(base_pouch_path).convert("RGBA")
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

def paste_label(comp, label_id):
    lbl = Image.open(os.path.join(LBL_DIR, f"label_{label_id}.png")).convert("RGBA")
    tw = 240
    th = int(lbl.height * (tw / lbl.width))
    lbl_res = lbl.resize((tw, th), Image.Resampling.LANCZOS)
    pos_x = (800 - tw) // 2
    pos_y = 283
    comp.paste(lbl_res, (pos_x, pos_y), lbl_res)
    return comp

# Products with existing transparent base pouch (just need sharp Edge label overlay)
EXISTING_POUCHES = [
    {
        "id": "badam",
        "existing_path": "public/products/generated_pouches/g1_almonds_pouch.webp",
        "out_files": ["g1_almonds_pouch.webp", "g1_badam_pouch.webp"],
        "ver_files": ["g1-p0295.webp", "g1-nut018.webp", "g1-p0583.webp", "g1-p0776.webp", "g1-p0984.webp", "g1-p0494.webp", "g1-nut019.webp"]
    },
    {
        "id": "cashews",
        "existing_path": "public/products/generated_pouches/g1_cashews_pouch.webp",
        "out_files": ["g1_cashews_pouch.webp", "g1_jeedipappu_pouch.webp"],
        "ver_files": ["g1-p0422.webp", "g1-p0238.webp", "g1-nut016.webp", "g1-nut017.webp"]
    },
    {
        "id": "pista",
        "existing_path": "public/products/generated_pouches/g1_pista_pouch.webp",
        "out_files": ["g1_pista_pouch.webp"],
        "ver_files": ["g1-nut021.webp", "g1-p0985.webp"]
    },
    {
        "id": "makhana",
        "existing_path": "public/products/generated_pouches/g1_makhana_pouch.webp",
        "out_files": ["g1_makhana_pouch.webp"],
        "ver_files": ["g1-p0979.webp", "g1-nut023.webp"]
    }
]

print("Processing existing pouches with sharp Edge labels...")
for p in EXISTING_POUCHES:
    img = Image.open(p["existing_path"]).convert("RGBA")
    if img.size != (800, 800):
        img = img.resize((800, 800), Image.Resampling.LANCZOS)
    comp = paste_label(img, p["id"])
    rgb = comp.convert("RGB")
    for f in p["out_files"]:
        out_p = os.path.join(OUT_DIR, f)
        rgb.save(out_p, "WEBP", quality=92)
        print(f"  [SAVED] {out_p}")
    for f in p["ver_files"]:
        ver_p = os.path.join(VER_DIR, f)
        rgb.save(ver_p, "WEBP", quality=92)
        print(f"  [VERIFIED] {ver_p}")

# Products requiring texture composition into standing transparent pouch
TEXTURE_POUCHES = [
    {
        "id": "dates",
        "texture": "scratch_pile_dates.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_dates_pouch.webp", "g1_endu_kharjuram_pouch.webp"],
        "ver_files": ["g1-p0077.webp", "g1-nut022.webp", "g1-p0394.webp", "g1-p0492.webp", "g1-p0909.webp", "g1-p0493.webp"]
    },
    {
        "id": "kismis",
        "texture": "scratch_texture_raisins.jpg",
        "crop": lambda img: img.crop((int(img.width*0.1), int(img.height*0.15), int(img.width*0.9), int(img.height*0.72))),
        "out_files": ["g1_kismis_pouch.webp", "g1_raisins_pouch.webp"],
        "ver_files": ["g1-nut020.webp", "g1-p0344.webp", "g1-p0423.webp", "g1-p0495.webp"]
    },
    {
        "id": "pumpkin_seeds",
        "texture": "scratch_texture_pumpkin_seeds.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_pumpkin_seeds_pouch.webp"],
        "ver_files": ["g1-p0893.webp"]
    },
    {
        "id": "sunflower_seeds",
        "texture": "scratch_sunflower_wiki.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_sunflower_seeds_pouch.webp"],
        "ver_files": ["g1-p0894.webp"]
    },
    {
        "id": "muskmelon_seeds",
        "texture": "scratch_texture_muskmelon_seeds.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_muskmelon_seeds_pouch.webp"],
        "ver_files": ["g1-p0895.webp"]
    },
    {
        "id": "watermelon_seeds",
        "texture": "scratch_texture_watermelon_seeds.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_watermelon_seeds_pouch.webp"],
        "ver_files": ["g1-p0898.webp"]
    },
    {
        "id": "corn_flakes",
        "texture": "scratch_texture_cornflakes.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_corn_flakes_pouch.webp"],
        "ver_files": ["g1-p0677.webp"]
    },
    {
        "id": "rolled_oats",
        "texture": "scratch_texture_oats.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_oats_pouch.webp", "g1_rolled_oats_pouch.webp"],
        "ver_files": ["g1-p1000.webp"]
    },
    {
        "id": "desert_king_dates",
        "texture": "scratch_texture_black_dates.jpg",
        "crop": lambda img: img.crop(((img.width - min(img.size))//2, (img.height - min(img.size))//2, (img.width + min(img.size))//2, (img.height + min(img.size))//2)),
        "out_files": ["g1_desert_king_dates_pouch.webp"],
        "ver_files": ["g1-lion-dates.webp"]
    }
]

print("\nProcessing texture composited transparent standing pouches...")
for p in TEXTURE_POUCHES:
    tex = Image.open(p["texture"]).convert("RGBA")
    cropped = p["crop"](tex)
    resized = cropped.resize((800, 800), Image.Resampling.LANCZOS)
    comp = Image.composite(resized, base_sq, mask)
    comp = paste_label(comp, p["id"])
    rgb = comp.convert("RGB")
    for f in p["out_files"]:
        out_p = os.path.join(OUT_DIR, f)
        rgb.save(out_p, "WEBP", quality=92)
        print(f"  [SAVED] {out_p}")
    for f in p["ver_files"]:
        ver_p = os.path.join(VER_DIR, f)
        rgb.save(ver_p, "WEBP", quality=92)
        print(f"  [VERIFIED] {ver_p}")

print("\nAll dry fruit & cereal transparent standing pouches successfully composited and saved!")
