import json
import os
import shutil
import subprocess
from PIL import Image

BRAIN_DIR = r"C:\Users\Harsha vardhan\.gemini\antigravity\brain\2cf2e6a3-4f61-45ba-b955-780669c36f53"

# 1. Process and save newly generated high-res images to public/products/verified/ and public/products/generated_pouches/
def convert_to_webp(src_path, dest_path, size=(800, 800)):
    im = Image.open(src_path).convert('RGB')
    if im.size != size:
        im = im.resize(size, Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    im.save(dest_path, 'WEBP', quality=92)
    print(f"Saved WebP: {dest_path}")

generated_assets = {
    # Key products from user feedback
    'dry_nuts_bowl': (os.path.join(BRAIN_DIR, "dry_nuts_bowl_1791739064534.jpg"), "public/products/generated_pouches/g1_dry_nuts_bowl.webp"),
    'pepper_powder': (os.path.join(BRAIN_DIR, "pepper_powder_1791739087380.jpg"), "public/products/generated_pouches/g1_pepper_powder_pouch.webp"),
    'green_elaichi': (os.path.join(BRAIN_DIR, "green_elaichi_1791739110108.jpg"), "public/products/generated_pouches/g1_elaichi_pouch.webp"),
    'cloves_lavangalu': (os.path.join(BRAIN_DIR, "cloves_lavangalu_1791739132993.jpg"), "public/products/generated_pouches/g1_lavangalu_pouch.webp"),
    'cumin_jeera': (os.path.join(BRAIN_DIR, "cumin_jeera_1791739158152.jpg"), "public/products/generated_pouches/g1_jeera_pouch.webp"),
    'coriander_seeds': (os.path.join(BRAIN_DIR, "coriander_seeds_1791739180470.jpg"), "public/products/generated_pouches/g1_coriander_seeds_pouch.webp"),
    'turmeric_powder': (os.path.join(BRAIN_DIR, "turmeric_powder_1791739216516.jpg"), "public/products/generated_pouches/g1_turmeric_powder_pouch.webp"),
    'fresh_red_onions': (os.path.join(BRAIN_DIR, "fresh_red_onions_1791739240132.jpg"), "public/products/verified/g1-p0236.webp"),
    'fresh_mango_fruit': (os.path.join(BRAIN_DIR, "fresh_mango_fruit_1791739266885.jpg"), "public/products/verified/g1-p0703.webp"),
    'borugulu_puffed_rice': (os.path.join(BRAIN_DIR, "borugulu_puffed_rice_1791739292807.jpg"), "public/products/generated_pouches/g1_borugulu_pouch.webp"),
    'unibic_wafers': (os.path.join(BRAIN_DIR, "unibic_wafers_1791739320129.jpg"), "public/products/verified/g1-p0026.webp"),
    'chocolate_bar_snack': (os.path.join(BRAIN_DIR, "chocolate_bar_snack_1791739346139.jpg"), "public/products/verified/g1-p0114.webp"),
    'snack_pops': (os.path.join(BRAIN_DIR, "snack_pops_1791739371862.jpg"), "public/products/verified/g1-p0157.webp"),
}

for name, (src, dest) in generated_assets.items():
    if os.path.exists(src):
        convert_to_webp(src, dest)
    else:
        print(f"Warning: {src} not found!")

# Also copy unibic wafers to g1-p0213
shutil.copyfile("public/products/verified/g1-p0026.webp", "public/products/verified/g1-p0213.webp")
# Also copy chocolate bar to g1-p0162 (Hanobar Dark)
shutil.copyfile("public/products/verified/g1-p0114.webp", "public/products/verified/g1-p0162.webp")

# 2. Freedom Oil Bottle formatting (place on white 800x800 canvas with soft shadow)
freedom_bottle_src = "scratch_check/freedom_bottle_official.webp"
if os.path.exists(freedom_bottle_src):
    bot_img = Image.open(freedom_bottle_src).convert('RGBA')
    # Fit into 700h x 450w
    bw, bh = bot_img.size
    ratio = min(460 / bw, 700 / bh)
    nbw, nbh = int(bw * ratio), int(bh * ratio)
    bot_img = bot_img.resize((nbw, nbh), Image.Resampling.LANCZOS)
    
    bot_canvas = Image.new('RGBA', (800, 800), (255, 255, 255, 255))
    # Soft shadow
    from PIL import ImageFilter, ImageDraw
    shadow = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    d_sh = ImageDraw.Draw(shadow)
    cx = 400
    by = 400 + (nbh // 2) - 10
    d_sh.ellipse([cx - (nbw // 3), by - 15, cx + (nbw // 3), by + 20], fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    bot_canvas.alpha_composite(shadow)
    
    bot_canvas.alpha_composite(bot_img, (400 - (nbw // 2), 400 - (nbh // 2)))
    bot_canvas.convert('RGB').save("public/products/verified/g1-p0418.webp", "WEBP", quality=92)
    print("Saved Freedom Oil Bottle: public/products/verified/g1-p0418.webp")

# 3. Freedom Rice Bran Oil formatting
freedom_rice_src = "scratch_check/freedom_rice_bran.webp"
if os.path.exists(freedom_rice_src):
    rice_img = Image.open(freedom_rice_src).convert('RGBA')
    # Crop out the right green column if present (it's in right ~25%)
    rw, rh = rice_img.size
    rice_cropped = rice_img.crop((0, 0, int(rw * 0.72), rh))
    # Fit into 700h x 450w
    rcw, rch = rice_cropped.size
    ratio = min(480 / rcw, 700 / rch)
    nrcw, nrch = int(rcw * ratio), int(rch * ratio)
    rice_cropped = rice_cropped.resize((nrcw, nrch), Image.Resampling.LANCZOS)
    
    rice_canvas = Image.new('RGBA', (800, 800), (255, 255, 255, 255))
    shadow = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    d_sh = ImageDraw.Draw(shadow)
    cx = 400
    by = 400 + (nrch // 2) - 10
    d_sh.ellipse([cx - (nrcw // 3), by - 15, cx + (nrcw // 3), by + 20], fill=(0, 0, 0, 50))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    rice_canvas.alpha_composite(shadow)
    
    rice_canvas.alpha_composite(rice_cropped, (400 - (nrcw // 2), 400 - (nrch // 2)))
    rice_canvas.convert('RGB').save("public/products/verified/g1-p0952.webp", "WEBP", quality=92)
    print("Saved Freedom Rice Bran Oil: public/products/verified/g1-p0952.webp")

# 4. Load products
with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# Identify non-toor products falsely assigned to kandi pappu
real_toor_dal_ids = {'g1-p0327', 'g1-p0330', 'g1-p0380', 'g1-p0381'} # actual Toor Dal / Sai Pappu 50kg bag

# Specific product overrides based on user request & high-quality packshots
specific_images = {
    # Dry fruits
    'g1-p0041': '/products/generated_pouches/g1_dry_nuts_bowl.webp', # DRY Nuts BOL
    'g1-p0422': '/products/generated_pouches/g1_cashews_pouch.webp',   # VT Jedipappu (Cashews)
    
    # Pepper & Spices
    'g1-p0003': '/products/generated_pouches/g1_pepper_powder_pouch.webp', # Pepper Powder
    'g1-p0444': '/products/generated_pouches/g1_pepper_powder_pouch.webp', # Pepper
    'g1-p0872': '/products/generated_pouches/g1_pepper_powder_pouch.webp', # Pepper Bols
    'g1-p0042': '/products/generated_pouches/g1_elaichi_pouch.webp',      # Elachi
    'g1-p0587': '/products/generated_pouches/g1_elaichi_pouch.webp',      # Elachi
    'g1-p0906': '/products/generated_pouches/g1_elaichi_pouch.webp',      # Elachi
    'g1-p0014': '/products/generated_pouches/g1_turmeric_powder_pouch.webp', # Turmeric Powder
    'g1-p0455': '/products/generated_pouches/g1_turmeric_powder_pouch.webp', # Turmeric Powder
    'g1-p0502': '/products/generated_pouches/g1_turmeric_powder_pouch.webp', # Gopuram Turmeric Powder
    'g1-p0503': '/products/generated_pouches/g1_turmeric_powder_pouch.webp', # Turmeric Powder
    'g1-p0778': '/products/generated_pouches/g1_turmeric_powder_pouch.webp', # Turmeric Powder
    'g1-p1014': '/products/generated_pouches/g1_turmeric_powder_pouch.webp', # Turmeric Powder
    
    'g1-p0280': '/products/generated_pouches/g1_lavangalu_pouch.webp',    # Lavangalu10g
    'g1-p0341': '/products/generated_pouches/g1_lavangalu_pouch.webp',    # Lavangalu 10rupees
    
    'g1-p0396': '/products/generated_pouches/g1_jeera_pouch.webp',        # Jeera (cumin Seeds)
    'g1-p0539': '/products/generated_pouches/g1_jeera_pouch.webp',        # Jeera
    'g1-p0955': '/products/generated_pouches/g1_jeera_pouch.webp',        # Jeera
    
    'g1-p0413': '/products/generated_pouches/g1_coriander_seeds_pouch.webp', # Coriander Seeds
    'g1-p0414': '/products/generated_pouches/g1_coriander_seeds_pouch.webp', # Coriander
    'g1-p0990': '/products/generated_pouches/g1_coriander_seeds_pouch.webp', # Coriander Powder
    'g1-p1022': '/products/generated_pouches/g1_coriander_seeds_pouch.webp', # Coriander Powder
    
    # Freedom Oils
    'g1-p0418': '/products/verified/g1-p0418.webp', # Freedom OIL Botel (real bottle!)
    'g1-p0459': '/products/verified/g1-p0459.webp', # Freedom 1LT (real packet!)
    'g1-p0847': '/products/verified/g1-p0459.webp', # Freedom OIL (packet)
    'g1-p0950': '/products/verified/g1-p0459.webp', # Freedom (packet)
    'g1-p0952': '/products/verified/g1-p0952.webp', # Freedom Rice Bran Oil
    
    # Vegetables & Fruits
    'g1-p0236': '/products/verified/g1-p0236.webp', # Onions
    'g1-p0703': '/products/verified/g1-p0703.webp', # Mango Fruit
    
    # Instant food / Snacks
    'g1-p0093': '/products/generated_pouches/g1_borugulu_pouch.webp', # Borugulu (Puffed rice)
    'g1-p0114': '/products/verified/g1-p0114.webp', # Hanobar
    'g1-p0162': '/products/verified/g1-p0162.webp', # Hanobar Dark
    'g1-p0157': '/products/verified/g1-p0157.webp', # Tcon Pops
    
    # Biscuits
    'g1-p0026': '/products/verified/g1-p0026.webp', # Unibic Wafer
    'g1-p0213': '/products/verified/g1-p0213.webp', # Unbic Wafer
}

# Category reclassifications
category_moves = {
    # Move hair oils mistakenly in cooking oils
    'g1-p0008': 'hair-care', # Kesh King Oil 100ml
    'g1-p0449': 'hair-care', # Kesh King Oil
    'g1-p0766': 'hair-care', # Navaratna OIL
    'g1-p0655': 'hair-care', # Castor OIL
    
    # Move cookies in dry-fruits-cereals into biscuits-bakery
    'g1-p0306': 'biscuits-bakery', # Unibic Cashew
    'g1-p0307': 'biscuits-bakery', # Unibic Pista Badam
    'g1-p0308': 'biscuits-bakery', # Unibic Cashew Badam
}

# Restore 2a9995d git images for other non-toor products that were overwritten
restored_count = 0
for p in products:
    pid = p['id']
    name = p.get('name', '')
    curr_img = p.get('image_url') or ''
    
    # 1. Category correction
    if pid in category_moves:
        p['category_id'] = category_moves[pid]
        p['category'] = category_moves[pid]
        print(f"Moved {pid} ({name}) to category: {category_moves[pid]}")
        
    # 2. Specific override
    if pid in specific_images:
        p['image_url'] = specific_images[pid]
        p['imageUrl'] = specific_images[pid]
        p['image'] = specific_images[pid]
        p['image_status'] = 'verified'
        p['imageStatus'] = 'verified'
        # Also copy verified if pouch
        if 'generated_pouches' in specific_images[pid]:
            src_p = os.path.join("public", specific_images[pid].lstrip("/"))
            dst_p = f"public/products/verified/{pid}.webp"
            if os.path.exists(src_p):
                shutil.copyfile(src_p, dst_p)
        print(f"Applied specific packshot for {pid} ({name}) -> {specific_images[pid]}")
        continue
        
    # 3. If currently kandi_pappu but NOT real toor dal, restore original image from 2a9995d
    if 'kandi_pappu' in curr_img and pid not in real_toor_dal_ids:
        # Extract from git 2a9995d:public/products/verified/{pid}.webp
        res = subprocess.run(['git', 'show', f'2a9995d:public/products/verified/{pid}.webp'], capture_output=True)
        if res.stdout and len(res.stdout) > 500:
            dest_file = f"public/products/verified/{pid}.webp"
            with open(dest_file, "wb") as out_f:
                out_f.write(res.stdout)
            p['image_url'] = f"/products/verified/{pid}.webp"
            p['imageUrl'] = f"/products/verified/{pid}.webp"
            p['image'] = f"/products/verified/{pid}.webp"
            p['image_status'] = 'verified'
            p['imageStatus'] = 'verified'
            restored_count += 1

print(f"\nRestored {restored_count} products from commit 2a9995d!")

# Also ensure actual Toor Dal products have the Toor Dal pouch
for pid in real_toor_dal_ids:
    p = next((x for x in products if x['id'] == pid), None)
    if p:
        p['image_url'] = '/products/generated_pouches/g1_kandi_pappu_pouch.webp'
        p['imageUrl'] = '/products/generated_pouches/g1_kandi_pappu_pouch.webp'
        p['image'] = '/products/generated_pouches/g1_kandi_pappu_pouch.webp'
        shutil.copyfile('public/products/generated_pouches/g1_kandi_pappu_pouch.webp', f'public/products/verified/{pid}.webp')

# Save data/migrated_products.json
with open("data/migrated_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

print("Saved updated data/migrated_products.json")

# Sync into src/data/products-catalog.json
catalog_path = "src/data/products-catalog.json"
if os.path.exists(catalog_path):
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    for p in products:
        cat_item = next((x for x in catalog if x['id'] == p['id']), None)
        if cat_item:
            cat_item['image_url'] = p['image_url']
            cat_item['imageUrl'] = p['image_url']
            cat_item['image'] = p['image_url']
            cat_item['category_id'] = p['category_id']
            cat_item['category'] = p['category_id']
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
    print("Synchronized src/data/products-catalog.json successfully!")
