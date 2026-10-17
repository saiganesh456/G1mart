import os
import shutil
from PIL import Image

BRAIN_DIR = r"C:/Users/Harsha vardhan/.gemini/antigravity/brain/bc58bde4-71ae-4fd8-ab49-b925daf43d41"
LABELS_DIR = "scratch_spice_labels"
OUT_DIR = "public/products/generated_pouches"
VERIFIED_DIR = "public/products/verified"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(VERIFIED_DIR, exist_ok=True)

SPICES = [
    {
        "id": "miriyalu",
        "packshot": "miriyalu_black_pepper_packshot_1792248835062.jpg",
        "label": "label_miriyalu.png",
        "out_files": ["g1_miriyalu_pouch.webp", "g1_black_pepper_pouch.webp"],
        "verified_ids": ["g1-spc051.webp", "g1-p0661.webp", "g1-p0342.webp", "g1-p0444.webp", "g1-p0872.webp"]
    },
    {
        "id": "dalchini",
        "packshot": "dalchini_cinnamon_packshot_1792248857330.jpg",
        "label": "label_dalchini.png",
        "out_files": ["g1_dalchina_pouch.webp", "g1_cinnamon_pouch.webp"],
        "verified_ids": ["g1-spc053.webp", "g1-p0163.webp"]
    },
    {
        "id": "nuvvulu",
        "packshot": "nuvvulu_sesame_packshot_1792248874567.jpg",
        "label": "label_nuvvulu.png",
        "out_files": ["g1_nuvvulu_pouch.webp", "g1_sesame_seeds_pouch.webp"],
        "verified_ids": ["g1-spc058.webp", "g1-p0184.webp"]
    },
    {
        "id": "lavangalu",
        "packshot": "lavangalu_cloves_packshot_1792248892945.jpg",
        "label": "label_lavangalu.png",
        "out_files": ["g1_lavangalu_pouch.webp", "g1_cloves_pouch.webp"],
        "verified_ids": ["g1-spc052.webp", "g1-p0280.webp", "g1-p0341.webp"]
    },
    {
        "id": "vamu",
        "packshot": "vamu_ajwain_packshot_1792248911516.jpg",
        "label": "label_vamu.png",
        "out_files": ["g1_vamu_pouch.webp", "g1_ajwain_pouch.webp"],
        "verified_ids": ["g1-p0286.webp"]
    },
    {
        "id": "nalla_karam",
        "packshot": "nalla_karam_packshot_1792248932028.jpg",
        "label": "label_nalla_karam.png",
        "out_files": ["g1_nalla_karam_pouch.webp"],
        "verified_ids": ["g1-p0707.webp", "g1-p0096.webp"]
    },
    {
        "id": "jeera",
        "packshot": "jeera_cumin_packshot_1792248952567.jpg",
        "label": "label_jeera.png",
        "out_files": ["g1_jeera_pouch.webp", "g1_cumin_seeds_pouch.webp"],
        "verified_ids": ["g1-p0333.webp", "g1-spc045.webp", "g1-spc047.webp", "g1-p0336.webp", "g1-p0396.webp", "g1-p0466.webp", "g1-p0539.webp", "g1-p0594.webp"]
    },
    {
        "id": "dry_mirchi",
        "packshot": "guntur_dry_mirchi_packshot_1792248981350.jpg",
        "label": "label_dry_mirchi.png",
        "out_files": ["g1_dry_mirchi_pouch.webp", "g1_guntur_mirchi_pouch.webp"],
        "verified_ids": ["g1-canon-mirchi-01.webp", "g1-spc043.webp", "g1-spc044.webp", "g1-p0088.webp", "g1-p0290.webp", "g1-p1006.webp"]
    }
]

print("Starting composite of 8 spice pouches...")

for item in SPICES:
    base_path = os.path.join(BRAIN_DIR, item["packshot"])
    label_path = os.path.join(LABELS_DIR, item["label"])
    
    if not os.path.exists(base_path):
        print(f"Error: Base packshot not found: {base_path}")
        continue
    if not os.path.exists(label_path):
        print(f"Error: Label not found: {label_path}")
        continue
        
    base = Image.open(base_path).convert("RGBA")
    w, h = base.size
    dim = min(w, h)
    # Center crop to square
    base_sq = base.crop(((w - dim)//2, (h - dim)//2, (w + dim)//2, (h + dim)//2)).resize((800, 800), Image.Resampling.LANCZOS)
    
    # Resize label
    lbl = Image.open(label_path).convert("RGBA")
    target_w = 240
    target_h = int(lbl.height * (target_w / lbl.width))
    lbl_resized = lbl.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Place label centered on the pouch
    pos_x = (800 - target_w) // 2
    pos_y = 285
    
    comp = base_sq.copy()
    comp.paste(lbl_resized, (pos_x, pos_y), lbl_resized)
    
    # Convert to RGB and save WebP
    final_rgb = comp.convert("RGB")
    
    # Save to generated_pouches
    for out_name in item["out_files"]:
        out_path = os.path.join(OUT_DIR, out_name)
        final_rgb.save(out_path, "WEBP", quality=92)
        print(f"  [SAVED] {out_path}")
        
    # Save to verified IDs
    for ver_name in item["verified_ids"]:
        ver_path = os.path.join(VERIFIED_DIR, ver_name)
        final_rgb.save(ver_path, "WEBP", quality=92)
        print(f"  [VERIFIED] {ver_path}")

print("\nAll 8 spices successfully composited and saved!")
