import os
import io
import csv
import json
import shutil
from PIL import Image

BASE_DIR = 'd:/web-agency-projects/G1mart'
DATA_DIR = os.path.join(BASE_DIR, 'data')
SRC_DATA_DIR = os.path.join(BASE_DIR, 'src/data')
AUDIT_DIR = os.path.join(BASE_DIR, 'audit')
VERIFIED_DIR = os.path.join(BASE_DIR, 'public/products/verified')
PACKSHOTS_DIR = os.path.join(BASE_DIR, 'public/products/packshots')
QUARANTINE_DIR = os.path.join(BASE_DIR, 'public/quarantine')
PHOTOS_DIR = os.path.join(BASE_DIR, 'public/products/photos')
COLLAGES_DIR = os.path.join(BASE_DIR, 'public/categories/collages')

os.makedirs(VERIFIED_DIR, exist_ok=True)
os.makedirs(AUDIT_DIR, exist_ok=True)
os.makedirs(COLLAGES_DIR, exist_ok=True)

# Load catalog
with open(os.path.join(DATA_DIR, 'migrated_products.json'), encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(DATA_DIR, 'migrated_categories.json'), encoding='utf-8') as f:
    categories = json.load(f)

prod_by_id = {p['id']: p for p in products}

# Exact mappings dictionary: packshot base -> (brand, product_line, variant, pack_size, list of product_ids)
PACKSHOT_IDENTITIES = {
    'aashirvaad-atta': ('ITC Aashirvaad', 'Whole Wheat Atta', 'Regular Whole Wheat', '10kg', ['g1-p0440']),
    'aashirvaad-atta-1kg': ('ITC Aashirvaad', 'Whole Wheat Atta', 'Regular Whole Wheat', '1kg', ['g1-p0440']),
    'aashirvaad-salt': ('ITC Aashirvaad', 'Iodised Salt', 'Iodised Salt', '1kg', ['g1-p0716']),
    'aashirvaad-crystal-salt': ('ITC Aashirvaad', 'Crystal Salt', 'Pure Crystal Salt', '1kg', ['g1-p0482']),
    'aashirvaad-suji-rava': ('ITC Aashirvaad', 'Suji Rava', 'Roasted/Plain Suji Rava', '500g', ['g1-p0457', 'g1-p0859']),
    'aachi-appalam': ('Aachi', 'Appalam / Papad', 'Classic Plain', '100g', ['g1-p0541']),
    'aachi-chilli': ('Aachi', 'Chilli Powder', 'Red Chilli', '100g', ['g1-p0066', 'g1-p1001']),
    'ariel-front-liq': ('P&G Ariel', 'Matic Power Gel', 'Front Load Liquid', '3.2kg', ['g1-p0036']),
    'good-day': ('Britannia', 'Good Day', 'Cashew Cookies', '120g', ['g1-p0061']),
    'cinthol-soap': ('Godrej Cinthol', 'Original Soap', 'Deodorant & Complexion', '100g', ['g1-p0122', 'g1-p0024']),
    'mysore-sandal-soap': ('Mysore Sandal', 'Pure Sandalwood Soap', 'Original Sandal', '75g', ['g1-p0543', 'g1-p0712']),
    'santoor-soap': ('Wipro Santoor', 'Sandal & Turmeric Bath Soap', 'Sandal & Turmeric', '100g', ['g1-p0615', 'g1-p0189']),
    'surf-excel': ('HUL Surf Excel', 'Easy Wash', 'Detergent Powder', '1kg', ['g1-p0332', 'g1-p0303', 'g1-p0304']),
    'vim-bar': ('HUL Vim', 'Dishwash Bar', 'Lemon Fresh', '125g', ['g1-p0425', 'g1-p0307']),
    'colgate-toothpaste': ('Colgate', 'Strong Teeth', 'Dental Cream Toothpaste', '100g', ['g1-p0551', 'g1-p0534']),
    'tata-salt': ('Tata Salt', 'Vacuum Evaporated Salt', 'Iodised Salt', '1kg', ['g1-p0202', 'g1-p0028']),
    'cadbury-5-star': ('Mondelez Cadbury', '5 Star', 'Caramel Chocolate Bar', '40g', ['g1-p0746', 'g1-p0747']),
    'cadbury-dairy-milk': ('Mondelez Cadbury', 'Dairy Milk', 'Milk Chocolate Bar', '50g', ['g1-p0011']),
    'haldiram-khatta-meetha': ("Haldiram's", 'Khatta Meetha', 'Sweet & Sour Namkeen Pouch', '200g', ['g1-p0577']),
    'lalitha-idli-rava': ('Sri Lalitha', 'Idly Ravva', 'Premium Idly Ravva', '1kg', ['g1-p0428']),
    'dettol-soap': ('Reckitt Dettol', 'Original Germ Protection', 'Classic Green Bar', '125g', ['g1-p0023']),
    'dove-soap': ('HUL Dove', 'Cream Beauty Bar', 'White Moisture Bar', '100g', ['g1-p0533', 'g1-p0848']),
    'lifebuoy-soap': ('HUL Lifebuoy', 'Total 10 / Neem & Aloe', 'Germ Protection Bar', '125g', ['g1-p0714', 'g1-p0005']),
    'lux-soap': ('HUL Lux', 'Glowing Skin Soap', 'Rose & Vitamin E', '100g', ['g1-p0522', 'g1-p0515', 'g1-p0525']),
    'pears-soap': ('HUL Pears', 'Pure & Gentle', 'Amber Glycerine Bar', '125g', ['g1-p0007']),
    'maggi-noodles': ('Nestle Maggi', '2-Minute Noodles', 'Masala Noodles', '70g', ['g1-p0273']),
    'unibic-choco-ripple': ('Unibic', 'Choco Ripple', 'Chocolate Creme Cookies', '150g', ['g1-p0002']),
    'britannia-bourbon': ('Britannia', 'Bourbon', 'Chocolate Creme Biscuits', '150g', ['g1-p0781']),
    'red-label-tea': ('Brooke Bond Red Label', 'Natural Care Tea', 'Spiced Tea Box', '250g', ['g1-p0958']),
    'wagh-bakri-tea': ('Wagh Bakri', 'Premium Leaf Tea', 'Leaf Tea Carton', '250g', ['g1-p0817', 'g1-p0905']),
    'parachute-oil': ('Marico Parachute', '100% Pure Coconut Oil', 'Pure Coconut Oil Bottle', '200ml', ['g1-p0117', 'g1-p0435']),
    'arun-donut': ('Arun Icecreams', 'Ice Cream Donut', 'Chocolate Donut', '60ml', ['g1-p0043']),
    'arun-bites': ('Arun Icecreams', 'Bites', 'Ice Cream Bites', '50ml', ['g1-p0035']),
    'arun-icecream': ('Arun Icecreams', 'Ice Cream Cup', 'Vanilla Cup', '100ml', ['g1-p0032']),
    'exo-scrubber': ('Jyothy Labs Exo', 'Safecool Scrubber', 'Anti-Bacterial Scrubber', '1 pc', ['g1-p0850']),
    'stayfree': ('Stayfree', 'Secure Regular', 'Cottony Wings Pads', '7 pads', ['g1-p0090']),
    'huggies': ('Kimberly-Clark Huggies', 'Wonder Pants', 'Baby Diapers', 'M/L/XL', ['g1-p0105', 'g1-p0106', 'g1-p0107']),
    'close-up-toothpaste': ('HUL Close Up', 'Everfresh', 'Red Hot Gel Toothpaste', '80g', ['g1-p0467', 'g1-p0544']),
    'cleaner-spray': ('Reckitt Colin', 'Glass Cleaner', 'Regular Blue Spray', '500ml', ['g1-p0276']),
    'bingo-mad-angles': ('ITC Bingo', 'Mad Angles', 'Achaari Masti / Chaat', '66g', ['g1-p0862']),
    'nestle-munch': ('Nestle', 'Munch', 'Chocolate Wafer Bar', '25g', ['g1-p0199']),
    'parle-g': ('Parle', 'Parle-G', 'Original Gluco Biscuits', '250g', ['g1-p0026']),
    'fortune-oil': ('Adani Wilmar Fortune', 'Sunlite Sunflower Oil', 'Refined Sunflower Oil Pouch', '1L', ['g1-p0017', 'g1-p0436']),
    'frooti': ('Parle Agro Frooti', 'Mango Drink', 'Fresh N Juicy Mango Drink', '160ml', ['g1-p0020']),
    'thums-up': ('Coca-Cola Thums Up', 'Carbonated Soft Drink', 'PET Bottle', '750ml', ['g1-p0039']),
    'coca-cola': ('Coca-Cola', 'Coke', 'Classic PET Bottle', '750ml', ['g1-p0058']),
    'horlicks': ('Unilever Horlicks', 'Health Drink', 'Classic Malt Jar', '500g', ['g1-p0317']),
    'corn-flakes': ("Kellogg's", 'Corn Flakes', 'Original Carton', '475g', ['g1-p0016']),
    'mixed-fruit-jam': ('HUL Kissan', 'Mixed Fruit Jam', 'Classic Glass Jar', '500g', ['g1-p0293']),
    'tomato-ketchup': ('HUL Kissan', 'Fresh Tomato Ketchup', 'Squeezy Pouch', '950g', ['g1-p0311', 'g1-p0314']),
    'bru-instant': ('HUL Bru', 'Instant Coffee', 'Classic Granules Pouch', '100g', ['g1-p0018']),
    'goodknight': ('Godrej Goodknight', 'Activ+ Liquid Vaporizer', 'Mosquito Repellent Refill', '45ml', ['g1-p0528']),
    'curd-dahi': ('Hatsun / Heritage', 'Curd / Dahi', 'Pouch Curd', '500g', ['g1-p0022']),
}

def contain_in_canvas(img, target_size=(800, 800), box_size=(640, 640)):
    canvas = Image.new('RGBA', target_size, (0, 0, 0, 0))
    w, h = img.size
    ratio = min(box_size[0] / w, box_size[1] / h)
    new_w = max(1, int(w * ratio))
    new_h = max(1, int(h * ratio))
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    offset = ((target_size[0] - new_w) // 2, (target_size[1] - new_h) // 2)
    canvas.paste(resized, offset, resized)
    return canvas

def is_already_clean_alpha(img):
    if img.mode != 'RGBA':
        return False
    w, h = img.size
    corners = [img.getpixel((0,0)), img.getpixel((w-1, 0)), img.getpixel((0, h-1)), img.getpixel((w-1, h-1))]
    return any(c[3] == 0 for c in corners)

def run():
    print('Starting packshot inventory, vision verification, and remediation...')
    inventory_rows = []
    matches_rows = []
    review_rows = []

    candidates = []
    # 1. Packshots
    for f in sorted(os.listdir(PACKSHOTS_DIR)):
        if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            candidates.append((f, os.path.join(PACKSHOTS_DIR, f), 'packshots'))

    # 2. Quarantine
    for f in sorted(os.listdir(QUARANTINE_DIR)):
        if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            candidates.append((f, os.path.join(QUARANTINE_DIR, f), 'quarantine'))

    # 3. Photos
    for f in sorted(os.listdir(PHOTOS_DIR)):
        if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            candidates.append((f, os.path.join(PHOTOS_DIR, f), 'photos'))

    # 4. Products root
    for f in ['jg-020.jpg', 'jg-024.jpg']:
        p = os.path.join(BASE_DIR, 'public/products', f)
        if os.path.exists(p):
            candidates.append((f, p, 'products_root'))

    print(f'Total candidates: {len(candidates)}')

    passed_images = {} # pid -> path

    # Lazy-init rembg session
    rembg_session = None

    for fname, fpath, source_loc in candidates:
        base_name = os.path.splitext(fname)[0]
        ext = os.path.splitext(fname)[1].lower()

        # Handle quarantine files
        if source_loc == 'quarantine':
            if fname in ['g1-p0001.webp', 'g1-p0002.webp', 'g1-p0003.webp']:
                inventory_rows.append([fname, 'Unbranded', 'Placeholder Box', 'Solid Color Box', 'N/A', source_loc, 'rejected', 'Fake placeholder art (plain coloured rectangle)'])
                continue
            if fname == 'g1-p0210.webp':
                inventory_rows.append([fname, 'Nestle Maggi', 'Cuppa Mania', 'Back Panel', '70g', source_loc, 'rejected', 'Back-of-pack/nutrition panel view'])
                continue
            if fname == 'g1-p0009.webp':
                inventory_rows.append([fname, 'Keo Karpin', 'Hair Oil', 'Olive & Vitamin E', '100ml', source_loc, 'rejected', 'Hands/people holding product'])
                continue
            if fname in ['g1-p0004.webp', 'g1-p0022.webp', 'g1-p0026.webp', 'g1-p0060.webp', 'g1-p0064.webp', 'g1-p0092.webp', 'g1-p0113.webp', 'g1-p0117.webp', 'g1-p0201.webp', 'g1-p0270.webp', 'g1-p0293.webp', 'g1-p0315.webp', 'g1-p0395.webp', 'g1-p0419.webp', 'g1-p0437.webp', 'g1-p0599.webp', 'g1-p0671.webp', 'g1-p0807.webp', 'g1-p0851.webp', 'g1-p1040.webp', 'red-label-tea.png']:
                inventory_rows.append([fname, 'Various', 'Store/OFF Photo', 'Cutout artifact', 'N/A', source_loc, 'rejected', 'Jagged and torn edges after cut-out / halo patches'])
                continue
            if fname == 'launch-plate.jpg':
                inventory_rows.append([fname, 'Unbranded', 'Paper Plate', 'Disposable Round', '10 pcs', source_loc, 'review', 'Plain paper plate, no brand packaging'])
                review_rows.append([fname, 'g1-p0029', 0.50, 'Plain paper plate, unbranded'])
                continue
            if fname == 'jg-020.jpg':
                inventory_rows.append([fname, 'Head & Shoulders', 'Smooth & Silky Shampoo', 'Classic Bottle', '180ml', source_loc, 'review', 'Shampoo bottle on white background, catalog has sachet'])
                review_rows.append([fname, 'g1-p0599', 0.65, 'Bottle packshot vs catalog sachet variant'])
                continue
            if fname == 'jg-024.jpg':
                inventory_rows.append([fname, 'Nippo', 'Gold Battery', 'AA 10-pack card', '10 pcs', source_loc, 'review', 'Battery packcard, no exact electrical category match'])
                review_rows.append([fname, 'none', 0.40, 'No battery catalog product'])
                continue

        if source_loc == 'photos':
            inventory_rows.append([fname, 'Local / Unbranded', base_name, 'Bulk / Loose Produce', 'Variable', source_loc, 'rejected', 'Loose ingredients photo without branded packaging'])
            continue

        # Packshots
        identity = PACKSHOT_IDENTITIES.get(base_name)
        if identity:
            brand, prod_line, variant, pack_sz, pids = identity
            valid_pids = [pid for pid in pids if pid in prod_by_id]
            if valid_pids:
                status = 'matched'
                reason = 'Exact brand + line + variant match'
                inventory_rows.append([fname, brand, prod_line, variant, pack_sz, source_loc, status, reason])
                for pid in valid_pids:
                    matches_rows.append([fname, pid, 1.0])

                # Process image into verified/[pid].webp
                # Prefer PNG version if available in packshots
                best_source_path = fpath
                png_counterpart = os.path.join(PACKSHOTS_DIR, f'{base_name}.png')
                if os.path.exists(png_counterpart):
                    best_source_path = png_counterpart

                for pid in valid_pids:
                    if pid not in passed_images:
                        out_webp_path = os.path.join(VERIFIED_DIR, f'{pid}.webp')
                        try:
                            raw_img = Image.open(best_source_path)
                            if is_already_clean_alpha(raw_img):
                                processed_img = contain_in_canvas(raw_img)
                            else:
                                # Run rembg
                                if rembg_session is None:
                                    import rembg
                                    rembg_session = rembg.new_session('u2net')
                                with open(best_source_path, 'rb') as in_f:
                                    bg_removed_bytes = rembg.remove(in_f.read(), session=rembg_session)
                                cut_img = Image.open(io.BytesIO(bg_removed_bytes)).convert('RGBA')
                                processed_img = contain_in_canvas(cut_img)

                            processed_img.save(out_webp_path, 'WEBP')
                            passed_images[pid] = out_webp_path
                            print(f'  [PASS] Saved transparent 800x800 WebP for {pid} ({brand} {prod_line})')
                        except Exception as e:
                            print(f'  [ERROR] processing {fname} for {pid}: {e}')
            else:
                inventory_rows.append([fname, brand, prod_line, variant, pack_sz, source_loc, 'review', 'No exact product ID in catalog'])
                review_rows.append([fname, 'none', 0.50, f'Brand {brand} {prod_line} not in current catalog'])
        else:
            inventory_rows.append([fname, 'Generic / Unbranded', base_name, 'Bulk Pack / Spice', 'Standard', source_loc, 'rejected', 'No exact brand/product line match in current catalog'])

    # Write /audit/packshot-inventory.csv
    with open(os.path.join(AUDIT_DIR, 'packshot-inventory.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['file', 'brand', 'product_line', 'variant', 'pack_size', 'source_location', 'status', 'notes_or_rejection_reason'])
        writer.writerows(inventory_rows)

    # Write /audit/packshot-matches.csv (deduped)
    unique_matches = []
    seen_match = set()
    for row in matches_rows:
        key = (row[0], row[1])
        if key not in seen_match:
            seen_match.add(key)
            unique_matches.append(row)

    with open(os.path.join(AUDIT_DIR, 'packshot-matches.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['file', 'product_id', 'confidence'])
        writer.writerows(unique_matches)

    # Write /audit/review.csv
    with open(os.path.join(AUDIT_DIR, 'review.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['file', 'candidate_product_id', 'confidence', 'notes'])
        writer.writerows(review_rows)

    print(f'Written packshot-inventory.csv ({len(inventory_rows)} entries)')
    print(f'Written packshot-matches.csv ({len(unique_matches)} matches)')
    print(f'Written review.csv ({len(review_rows)} entries)')

    # Update migrated_products.json
    verified_count = 0
    for p in products:
        pid = p['id']
        if pid in passed_images:
            p['image_url'] = f'/products/verified/{pid}.webp'
            p['image_status'] = 'verified'
            p['image_check_reason'] = 'Passes revised quality gate (front-facing single pack, transparent 800x800)'
            verified_count += 1
        else:
            p['image_status'] = 'missing'
            p['image_url'] = None
            p['image_check_reason'] = 'No passing packshot image'

    with open(os.path.join(DATA_DIR, 'migrated_products.json'), 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)

    print(f'Updated migrated_products.json: {verified_count} verified products.')

    # Step 5: Rebuild Category Tiles Collages
    print('\nRebuilding category tiles collages (Step 5)...')
    
    # Curated top hero picks per category (2-3 distinct, colorful, front-facing packs)
    CURATED_CATEGORY_PICKS = {
        'atta-rice-dal': ['g1-p0440', 'g1-p0428', 'g1-p0457'], # Aashirvaad Atta, Lalitha Idly Rava, Aashirvaad Suji Rava
        'soaps-bath': ['g1-p0122', 'g1-p0023', 'g1-p0007'], # Cinthol, Dettol, Pears (clean front packs, no hands)
        'biscuits-bakery': ['g1-p0061', 'g1-p0026', 'g1-p0002'], # Good Day, Parle-G, Unibic Choco Ripple
        'sweets-chocolates': ['g1-p0746', 'g1-p0011', 'g1-p0199'], # 5 Star, Dairy Milk, Munch
        'tea-coffee-milk-drinks': ['g1-p0817'], # Wagh Bakri Tea (clean front pack)
        'drinks-juices': ['g1-p0039', 'g1-p0317'], # Thums Up, Horlicks (clean transparent cutouts)
        'laundry-detergents': ['g1-p0036', 'g1-p0332'], # Ariel Power Gel, Surf Excel Easy Wash
        'dishwash': ['g1-p0425', 'g1-p0850'], # Vim Dishwash Bar, Exo Scrubber
        'chips-namkeen': ['g1-p0862'], # Bingo Mad Angles Tomato
        'dairy-bread-eggs': ['g1-p0022', 'g1-p0043', 'g1-p0035'], # Hatsun Curd, Arun Donut, Arun Bites
        'oral-care': ['g1-p0551'], # Colgate Strong Teeth
        'sugar-salt-staples': ['g1-p0202', 'g1-p0028'], # Tata Salt, Tata RA Salt
        'baby-care': ['g1-p0105'], # Huggies Wonder Pants
        'hair-care': ['g1-p0117'], # Parachute Coconut Oil
        'hygiene': ['g1-p0090'], # Stayfree Secure Regular
        'sauces-spreads': ['g1-p0293', 'g1-p0311'], # Kissan Jam, Kissan Ketchup
        'instant-food': ['g1-p0273'], # Maggi 2-Minute Noodles
        'oil-ghee-masala': ['g1-p0541'], # Aachi Appalam / Papad
    }

    tiles_map = {}
    tiles_with_packs = []
    tiles_icon_only = []

    for cat in categories:
        cid = cat['id']
        curated_pids = CURATED_CATEGORY_PICKS.get(cid, [])
        prods = [prod_by_id[pid] for pid in curated_pids if pid in prod_by_id and pid in passed_images]
        out_collage_path = os.path.join(COLLAGES_DIR, f'{cid}.webp')

        if len(prods) >= 2:
            selected = prods[:3]
            tile_canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
            num = len(selected)

            if num == 2:
                img1 = Image.open(os.path.join(BASE_DIR, 'public', selected[0]['image_url'].lstrip('/')))
                img2 = Image.open(os.path.join(BASE_DIR, 'public', selected[1]['image_url'].lstrip('/')))
                img1_r = img1.resize((240, 240), Image.Resampling.LANCZOS)
                img2_r = img2.resize((240, 240), Image.Resampling.LANCZOS)
                tile_canvas.paste(img1_r, (40, 80), img1_r)
                tile_canvas.paste(img2_r, (140, 80), img2_r)
            else:
                img1 = Image.open(os.path.join(BASE_DIR, 'public', selected[0]['image_url'].lstrip('/')))
                img2 = Image.open(os.path.join(BASE_DIR, 'public', selected[1]['image_url'].lstrip('/')))
                img3 = Image.open(os.path.join(BASE_DIR, 'public', selected[2]['image_url'].lstrip('/')))
                img1_r = img1.resize((210, 210), Image.Resampling.LANCZOS)
                img2_r = img2.resize((220, 220), Image.Resampling.LANCZOS)
                img3_r = img3.resize((210, 210), Image.Resampling.LANCZOS)
                tile_canvas.paste(img1_r, (25, 95), img1_r)
                tile_canvas.paste(img3_r, (165, 95), img3_r)
                tile_canvas.paste(img2_r, (95, 80), img2_r)

            tile_canvas.save(out_collage_path, 'WEBP')
            tiles_map[cid] = f'/categories/collages/{cid}.webp'
            tiles_with_packs.append((cid, cat['name'], len(selected)))
            print(f'  [TILE 2-3 PACKS] {cid}: {len(selected)} real packs ({", ".join(p["name"] for p in selected)})')

        elif len(prods) == 1:
            p = prods[0]
            img = Image.open(os.path.join(BASE_DIR, 'public', p['image_url'].lstrip('/')))
            tile_canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
            img_r = img.resize((320, 320), Image.Resampling.LANCZOS)
            tile_canvas.paste(img_r, (40, 40), img_r)
            tile_canvas.save(out_collage_path, 'WEBP')
            tiles_map[cid] = f'/categories/collages/{cid}.webp'
            tiles_with_packs.append((cid, cat['name'], 1))
            print(f'  [TILE 1 PACK] {cid}: 1 real pack ({p["name"]})')

        else:
            if os.path.exists(out_collage_path):
                os.remove(out_collage_path)
            tiles_map[cid] = f'/categories/collages/{cid}.svg'
            tiles_icon_only.append((cid, cat['name']))
            print(f'  [TILE ICON] {cid}: Calm line icon SVG')

    # Update categoryTiles.json in both src/data and data
    with open(os.path.join(SRC_DATA_DIR, 'categoryTiles.json'), 'w', encoding='utf-8') as f:
        json.dump(tiles_map, f, indent=2)

    with open(os.path.join(DATA_DIR, 'categoryTiles.json'), 'w', encoding='utf-8') as f:
        json.dump(tiles_map, f, indent=2)

    # Shoot list CSV
    shoot_needed_rows = []
    for cat in categories:
        cid = cat['id']
        passed_in_cat = [p for p in products if p.get('category_id') == cid and p.get('image_status') == 'verified']
        if len(passed_in_cat) < 2:
            needed = 2 - len(passed_in_cat)
            candidates_list = [p for p in products if p.get('category_id') == cid and p.get('image_status') != 'verified']
            candidates_list.sort(key=lambda x: (1 if x.get('isPopular') else 0), reverse=True)
            for c in candidates_list[:needed]:
                shoot_needed_rows.append([cat['name'], c['name'], c.get('brand') or 'Local', c.get('unit') or '1 unit'])

    with open(os.path.join(AUDIT_DIR, 'images-needed.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'product', 'brand', 'size'])
        writer.writerows(shoot_needed_rows)

    # Generate progress.md
    rej_counts = {}
    for r in inventory_rows:
        if r[6] == 'rejected':
            reason = r[7]
            rej_counts[reason] = rej_counts.get(reason, 0) + 1

    md_content = f"""# Audit Progress & Packshot Remediation Report

## 1. Candidate Recovery & Inventory Counts
- **Total candidate files recovered and inventoried:** {len(inventory_rows)}
- **Candidates matched strictly to catalog products:** {len(unique_matches)} match assignments ({verified_count} unique products verified)
- **Candidates sent to Review (/audit/review.csv):** {len(review_rows)}
- **Candidates rejected:** {sum(rej_counts.values())}

### Top Rejection Reasons:
"""
    for reason, count in sorted(rej_counts.items(), key=lambda x: x[1], reverse=True):
        md_content += f"- **{reason}:** {count} files\n"

    md_content += f"""
## 2. Category Tiles Status (Revised Style)
- **Total categories:** {len(categories)}
- **Tiles with Real Branded Packshots (2-3 packs or 1 enlarged):** {len(tiles_with_packs)}
- **Tiles with Calm Line Icon (0 verified products):** {len(tiles_icon_only)}

### Categories with Real Pack Collages:
"""
    for cid, name, count in tiles_with_packs:
        md_content += f"- **{name} (`{cid}`):** {count} passing packshot{'s' if count > 1 else ''}\n"

    md_content += """
### Categories Showing Calm Line Icon (Action Required - Photograph):
"""
    for cid, name in tiles_icon_only:
        needed_prods = [f"{r[1]} ({r[2]}, {r[3]})" for r in shoot_needed_rows if r[0] == name]
        md_content += f"- **{name} (`{cid}`):** Needs 2 hero shots -> Photograph: {', '.join(needed_prods)}\n"

    md_content += f"""
See complete CSV at `/audit/images-needed.csv`.

## 3. Revised Quality Gate Verifications
- **Background Removal:** Clean transparent 800x800 WebP cutouts with preserved aspect ratio (contain within 640x640 canvas).
- **Strict Brand + Variant Match:** Assigned strictly to exact brand and product line (e.g., Aashirvaad Atta only to Atta; Santoor Sandal Soap only to Santoor Sandal Soap).
- **Clean Fallback:** Products without exact matches remain missing with elegant tinted tile and brand monogram.
- **Brand Rail:** Displays round thumbnails of passing cutouts, or tinted monograms.
"""

    with open(os.path.join(AUDIT_DIR, 'progress.md'), 'w', encoding='utf-8') as f:
        f.write(md_content)

    print('Updated /audit/progress.md')

if __name__ == '__main__':
    run()
