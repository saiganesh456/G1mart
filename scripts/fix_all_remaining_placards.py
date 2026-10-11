import json
import os
import shutil
from PIL import Image
import numpy as np

MIGRATED_PATH = "data/migrated_products.json"
with open(MIGRATED_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

# Catalog of our clean transparent pouches
POUCH_MAP = {
    'rice': 'g1_rice_pouch.webp',
    'basmati': 'g1_basmati_rice_pouch.webp',
    'poha': 'g1_poha_pouch.webp',
    'flattened rice': 'g1_poha_pouch.webp',
    'atukulu': 'g1_poha_pouch.webp',
    'wheat': 'g1_wheat_grains_pouch.webp',
    'godhumalu': 'g1_wheat_grains_pouch.webp',
    'atta': 'g1_atta_pouch.webp',
    'bansi': 'g1_bansi_rava_pouch.webp',
    'dansi': 'g1_bansi_rava_pouch.webp',
    'javva': 'g1_bansi_rava_pouch.webp',
    'ravva': 'g1_bansi_rava_pouch.webp',
    'idli rava': 'g1_idli_rava_pouch.webp',
    'idil rava': 'g1_idli_rava_pouch.webp',
    'upma': 'g1_idli_rava_pouch.webp',
    'rice flour': 'g1_rice_flour_pouch.webp',
    'maida': 'g1_maida_pouch.webp',
    'corn flour': 'g1_corn_flour_pouch.webp',
    'ragi': 'g1_ragi_pouch.webp',
    'millet': 'g1_korralu_pouch.webp',
    'korralu': 'g1_korralu_pouch.webp',
    'kandi pappu': 'g1_kandi_pappu_pouch.webp',
    'kandipappu': 'g1_kandi_pappu_pouch.webp',
    'sai pappu': 'g1_kandi_pappu_pouch.webp',
    'toor dal': 'g1_kandi_pappu_pouch.webp',
    'pachisenga': 'g1_chana_dal_pouch.webp',
    'pachisenaga': 'g1_chana_dal_pouch.webp',
    'senaga': 'g1_chana_dal_pouch.webp',
    'chana dal': 'g1_chana_dal_pouch.webp',
    'chenaga': 'g1_chana_dal_pouch.webp',
    'urad': 'g1_urad_dal_pouch.webp',
    'minapappu': 'g1_urad_dal_pouch.webp',
    'rajma': 'g1_rajma_pouch.webp',
    'moon dal': 'g1_yellow_moong_dal_pouch.webp',
    'moong': 'g1_yellow_moong_dal_pouch.webp',
    'pesalu': 'g1_moong_dal_pouch.webp',
    'groundnut': 'g1_groundnuts_pouch.webp',
    'peanut': 'g1_groundnuts_pouch.webp',
    'palli': 'g1_groundnuts_pouch.webp',
    'verusenaga': 'g1_groundnuts_pouch.webp',
    'almond': 'g1_almonds_pouch.webp',
    'badam': 'g1_almonds_pouch.webp',
    'cashew': 'g1_cashews_pouch.webp',
    'jeedi': 'g1_cashews_pouch.webp',
    'kaju': 'g1_cashews_pouch.webp',
    'pista': 'g1_pista_pouch.webp',
    'kismis': 'g1_kismis_pouch.webp',
    'raisin': 'g1_kismis_pouch.webp',
    'alasandalu': 'g1_alasandalu_pouch.webp',
    'telagapindi': 'g1_telagapindi_pouch.webp',
}

def is_green_placard(img_path):
    if not os.path.exists(img_path) or not img_path.endswith('.webp'):
        return False
    try:
        im = Image.open(img_path).convert('RGB')
        if im.size != (800, 800):
            return False
        arr = np.array(im)
        reg = arr[260:360, 300:500]
        r = float(reg[:,:,0].mean())
        g = float(reg[:,:,1].mean())
        b = float(reg[:,:,2].mean())
        # Dark emerald green placard condition:
        if r < 75 and 35 < g < 115 and b < 75 and (g - r) > 15:
            return True
    except:
        pass
    return False

def find_best_pouch(name):
    low = name.lower()
    for kw, pouch_file in POUCH_MAP.items():
        if kw in low:
            return pouch_file
    return None

fixed_count = 0
explicit_mappings = {
    'g1-p0183': 'g1_bansi_rava_pouch.webp',      # Javva Wheat Ravva
    'g1-p0196': 'g1_bansi_rava_pouch.webp',      # Bansi Ravva
    'g1-p0197': 'g1_corn_flour_pouch.webp',      # Dharani Corn Flour
    'g1-p0198': 'g1_atta_pouch.webp',            # Dharani Atta
    'g1-p0219': 'g1_rice_pouch.webp',            # Rice
    'g1-p0386': 'g1_chana_dal_pouch.webp',       # Pachisenga Pappu 50kgs Bag
    'g1-p0387': 'g1_chana_dal_pouch.webp',       # Pachisenagapappu
    'g1-p0406': 'g1_wheat_grains_pouch.webp',    # Wheat
    'g1-p0409': 'g1_ragi_pouch.webp',            # Finger Millet
    'g1-p0411': 'g1_basmati_rice_pouch.webp',    # Basmati Rice
    'g1-p0412': 'g1_yellow_moong_dal_pouch.webp',# Moon DAL
    'g1-p0417': 'g1_poha_pouch.webp',            # Flattened Rice
    'g1-p0427': 'g1_idli_rava_pouch.webp',       # Dharani Upma Ravva
    'g1-p0460': 'g1_telagapindi_pouch.webp',     # Telagapindi
    'g1-p0495': 'g1_kismis_pouch.webp',          # Kismis
    'g1-p0584': 'g1_kismis_pouch.webp',          # Kismis
    'g1-p0704': 'g1_ragi_pouch.webp',            # Ragi Powder
    'g1-p0736': 'g1_bansi_rava_pouch.webp',      # Bansi Wheat Rava
    'g1-p0737': 'g1_rice_pouch.webp',            # Kurnool RIC BAG
    'g1-p0744': 'g1_corn_flour_pouch.webp',      # Corn Flour Powdar1kg
    'g1-p0860': 'g1_bansi_rava_pouch.webp',      # Dansi Rava
    'g1-p0867': 'g1_bansi_rava_pouch.webp',      # SAI Bansi Ravva
    'g1-p0985': 'g1_pista_pouch.webp',           # Pistachio
    'g1-p1008': 'g1_pista_pouch.webp',           # Salt Pista
    'g1-p1011': 'g1_alasandalu_pouch.webp',      # Alasandalu
    'g1-p1012': 'g1_rajma_pouch.webp',           # RED Alasandalu
    'g1-p1028': 'g1_chana_dal_pouch.webp',       # Chenaga Pindi
    'g1-p1030': 'g1_maida_pouch.webp',           # Maida Pindi
}

for p in products:
    pid = p['id']
    name = p.get('name', '')
    img = p.get('image') or p.get('image_url') or f"/products/verified/{pid}.webp"
    local_path = os.path.join("public", img.lstrip("/"))
    
    assigned_pouch = explicit_mappings.get(pid)
    if not assigned_pouch and is_green_placard(local_path):
        assigned_pouch = find_best_pouch(name)
        if not assigned_pouch:
            assigned_pouch = 'g1_kandi_pappu_pouch.webp'
            
    if assigned_pouch:
        src_pouch_path = os.path.join("public/products/generated_pouches", assigned_pouch)
        if os.path.exists(src_pouch_path):
            # 1. Update verified webp file on disk
            dest_verified = f"public/products/verified/{pid}.webp"
            shutil.copyfile(src_pouch_path, dest_verified)
            
            # 2. Update product data attributes
            new_url = f"/products/generated_pouches/{assigned_pouch}"
            p['image'] = new_url
            p['imageUrl'] = new_url
            p['image_url'] = new_url
            p['image_status'] = 'verified'
            p['imageStatus'] = 'verified'
            
            fixed_count += 1
            print(f"[{fixed_count}] Fixed {pid} | {name} -> {assigned_pouch}")

print(f"\nTotal fixed products: {fixed_count}")

# Save data/migrated_products.json
with open(MIGRATED_PATH, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

print("Saved updated data/migrated_products.json successfully!")
