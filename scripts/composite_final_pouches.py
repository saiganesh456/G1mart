import os
import shutil
from PIL import Image

BRAIN_DIR = "C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894"

pouch_configs = [
    {
        "id": "yellow_moong",
        "base": os.path.join(BRAIN_DIR, "yellow_moong_dal_1791880584664.jpg"),
        "dest_pouch": "public/products/generated_pouches/g1_yellow_moong_dal_pouch.webp",
        "verified_id": "g1-p0412"
    },
    {
        "id": "masoor_dal",
        "base": os.path.join(BRAIN_DIR, "masoor_dal_pouch_1791880607447.jpg"),
        "dest_pouch": "public/products/generated_pouches/g1_masoor_dal_pouch.webp",
        "verified_id": "g1-p0405"
    },
    {
        "id": "green_moong",
        "base": os.path.join(BRAIN_DIR, "green_moong_pouch_1791881527282.jpg"),
        "dest_pouch": "public/products/generated_pouches/g1_green_moong_pouch.webp",
        "verified_id": "g1-p0408"
    },
    {
        "id": "alasandalu",
        "base": os.path.join(BRAIN_DIR, "alasandalu_clean_pouch_1791881804846.jpg"),
        "dest_pouch": "public/products/generated_pouches/g1_alasandalu_pouch.webp",
        "verified_id": "g1-p1011"
    },
    {
        "id": "tella_bataneelu",
        "base": os.path.join(BRAIN_DIR, "white_peas_clean_pouch_1791881828705.jpg"),
        "dest_pouch": "public/products/generated_pouches/g1_tella_bataneelu_pouch.webp",
        "verified_id": "g1-p0195"
    },
    {
        "id": "telagapindi",
        "base": os.path.join(BRAIN_DIR, "telagapindi_clean_pouch_1791881850266.jpg"),
        "dest_pouch": "public/products/generated_pouches/g1_telagapindi_pouch.webp",
        "verified_id": "g1-p0460"
    }
]

for item in pouch_configs:
    base = Image.open(item["base"]).convert("RGBA")
    if base.size != (800, 800):
        base = base.resize((800, 800), Image.Resampling.LANCZOS)
        
    label_path = f"scratch_label_{item['id']}.png"
    label = Image.open(label_path).convert("RGBA")
    label = label.resize((228, 294), Image.Resampling.LANCZOS)
    
    # lx = 286, ly = 286 (centers label at x=400, y=433 on 800x800)
    base.paste(label, (286, 286), label)
    
    final_rgb = base.convert("RGB")
    dest_p = item["dest_pouch"]
    os.makedirs(os.path.dirname(dest_p), exist_ok=True)
    final_rgb.save(dest_p, "WEBP", quality=95)
    print(f"Saved pouch: {dest_p}")
    
    if item["verified_id"]:
        v_dest = f"public/products/verified/{item['verified_id']}.webp"
        final_rgb.save(v_dest, "WEBP", quality=95)
        print(f"Saved verified: {v_dest}")

# Sync existing high quality pouches to verified fallbacks
shutil.copyfile("public/products/generated_pouches/g1_urad_dal_pouch.webp", "public/products/verified/g1-p0391.webp")
shutil.copyfile("public/products/generated_pouches/g1_urad_dal_pouch.webp", "public/products/verified/g1-p0081.webp")
shutil.copyfile("public/products/generated_pouches/g1_rajma_pouch.webp", "public/products/verified/g1-p1012.webp")
shutil.copyfile("public/products/generated_pouches/g1_rajma_pouch.webp", "public/products/verified/g1-p0082.webp")
shutil.copyfile("public/products/generated_pouches/g1_kabuli_chana_pouch.webp", "public/products/verified/g1-p0190.webp")
shutil.copyfile("public/products/generated_pouches/g1_kabuli_chana_pouch.webp", "public/products/verified/g1-p0191.webp")

print("All 6 final pouches composited with high-fidelity Telugu typography!")
