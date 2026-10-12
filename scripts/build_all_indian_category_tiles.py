import os
import sys
from PIL import Image, ImageFilter, ImageDraw

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKSHOTS_FMCG = os.path.join(BASE_DIR, "public", "products", "packshots_fmcg")
PACKSHOTS_LEGACY = os.path.join(BASE_DIR, "public", "products", "packshots")
OUT_DIR = os.path.join(BASE_DIR, "public", "categories", "collages")

os.makedirs(OUT_DIR, exist_ok=True)

def find_asset(filename):
    for d in [PACKSHOTS_FMCG, PACKSHOTS_LEGACY]:
        p = os.path.join(d, filename)
        if os.path.exists(p):
            return p
    return None

def create_ground_shadow(width, height=14, opacity=50):
    sw = int(width * 1.25)
    sh = height * 2 + 10
    shadow = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = sw // 2, sh // 2
    rx, ry = int(width * 0.44), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=6))

def prepare_item(img_path, max_h=370, max_w=260):
    img = Image.open(img_path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    new_w = max(10, int(cropped.width * scale))
    new_h = max(10, int(cropped.height * scale))
    return cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

def compose_tight_pair(left_file, right_file, out_name, max_h_left=370, max_w_left=260, max_h_right=370, max_w_right=260, overlap_px=65, left_in_front=False):
    left_path = find_asset(left_file)
    right_path = find_asset(right_file)

    if not left_path or not right_path:
        print(f"[MISSING ASSET] for {out_name}: left={left_path}, right={right_path}")
        return False

    item_left = prepare_item(left_path, max_h=max_h_left, max_w=max_w_left)
    item_right = prepare_item(right_path, max_h=max_h_right, max_w=max_w_right)

    if not item_left or not item_right:
        print(f"[EMPTY IMAGE] for {out_name}")
        return False

    # 1. Arrange on initial canvas
    canvas_w = 700
    canvas_h = 700
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    y_base = 560

    total_w = item_left.width + item_right.width - overlap_px
    start_x = (canvas_w - total_w) // 2

    x_left = start_x
    y_left = y_base - item_left.height

    x_right = x_left + item_left.width - overlap_px
    y_right = y_base - item_right.height

    # Shadows
    s_left = create_ground_shadow(item_left.width, height=13, opacity=45)
    s_right = create_ground_shadow(item_right.width, height=13, opacity=50)

    canvas.paste(s_left, (x_left + (item_left.width - s_left.width) // 2, y_base - s_left.height // 2), s_left)
    canvas.paste(s_right, (x_right + (item_right.width - s_right.width) // 2, y_base - s_right.height // 2), s_right)

    if left_in_front:
        canvas.paste(item_right, (x_right, y_right), item_right)
        canvas.paste(item_left, (x_left, y_left), item_left)
    else:
        canvas.paste(item_left, (x_left, y_left), item_left)
        canvas.paste(item_right, (x_right, y_right), item_right)

    # 2. Crop to tight bbox
    bbox = canvas.getbbox()
    if not bbox:
        return False
    cropped_composite = canvas.crop(bbox)
    cw, ch = cropped_composite.size

    # 3. Maximum box-fitting scale: fill 375px height or 382px width of 400x400 canvas
    target_max_h = 376
    target_max_w = 382
    scale = min(target_max_h / ch, target_max_w / cw)
    final_w = max(10, int(cw * scale))
    final_h = max(10, int(ch * scale))
    resized_composite = cropped_composite.resize((final_w, final_h), Image.Resampling.LANCZOS)

    # 4. Center perfectly on 400x400 canvas
    final_canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    place_x = (400 - final_w) // 2
    place_y = (400 - final_h) // 2
    final_canvas.paste(resized_composite, (place_x, place_y), resized_composite)

    out_path = os.path.join(OUT_DIR, f"{out_name}.webp")
    final_canvas.save(out_path, "WEBP", quality=95)
    final_bbox = final_canvas.getbbox()
    print(f"  [REFINED] {out_name:24s} -> bbox={final_bbox} size={final_bbox[2]-final_bbox[0]}x{final_bbox[3]-final_bbox[1]}")
    return True

def compose_soaps_trio():
    # Dettol Handwash Pump (background) + Santoor Soap (front left) + Mysore Sandal Soap (front right)
    hw_path = find_asset("dettol_handwash_pump.png")
    san_path = find_asset("rembg_santoor-soap.png")
    mys_path = find_asset("rembg_mysore-sandal-soap.png")

    hw = Image.open(hw_path).convert('RGBA')
    san = Image.open(san_path).convert('RGBA')
    mys = Image.open(mys_path).convert('RGBA')

    # Pre-scale
    hw = hw.crop(hw.getbbox()).resize((190, 360), Image.Resampling.LANCZOS)
    san = san.crop(san.getbbox()).resize((195, 134), Image.Resampling.LANCZOS)
    mys = mys.crop(mys.getbbox()).resize((210, 145), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (700, 700), (0, 0, 0, 0))
    y_base = 560

    # Handwash in center background
    s_hw = create_ground_shadow(hw.width, 12, 40)
    canvas.paste(s_hw, (250, y_base - 10), s_hw)
    canvas.paste(hw, (255, y_base - hw.height), hw)

    # Santoor soap in front left
    s_san = create_ground_shadow(san.width, 10, 45)
    canvas.paste(s_san, (155, y_base - 5), s_san)
    canvas.paste(san, (155, y_base - san.height + 5), san)

    # Mysore Sandal in front right
    s_mys = create_ground_shadow(mys.width, 10, 45)
    canvas.paste(s_mys, (325, y_base - 5), s_mys)
    canvas.paste(mys, (325, y_base - mys.height + 5), mys)

    bbox = canvas.getbbox()
    cropped = canvas.crop(bbox)
    cw, ch = cropped.size

    scale = min(375 / ch, 380 / cw)
    final_w = int(cw * scale)
    final_h = int(ch * scale)
    resized = cropped.resize((final_w, final_h), Image.Resampling.LANCZOS)

    final_canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    final_canvas.paste(resized, ((400 - final_w) // 2, (400 - final_h) // 2), resized)

    out_path = os.path.join(OUT_DIR, "soaps-bath.webp")
    final_canvas.save(out_path, "WEBP", quality=95)
    fb = final_canvas.getbbox()
    print(f"  [REFINED TRIO] soaps-bath           -> bbox={fb} size={fb[2]-fb[0]}x{fb[3]-fb[1]}")

def compose_drinks_pair():
    # Frooti Bottle (left) + Thums Up Bottle (right) with bold width and snug overlap
    f_path = find_asset("rembg_frooti.png")
    t_path = find_asset("rembg_thums-up.png")

    f = Image.open(f_path).convert('RGBA')
    t = Image.open(t_path).convert('RGBA')

    f = f.crop(f.getbbox()).resize((190, 440), Image.Resampling.LANCZOS)
    t = t.crop(t.getbbox()).resize((195, 450), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (700, 700), (0, 0, 0, 0))
    y_base = 580

    s_f = create_ground_shadow(f.width, 14, 45)
    s_t = create_ground_shadow(t.width, 14, 50)

    canvas.paste(s_f, (175, y_base - 10), s_f)
    canvas.paste(s_t, (310, y_base - 10), s_t)

    canvas.paste(f, (180, y_base - f.height), f)
    canvas.paste(t, (180 + f.width - 45, y_base - t.height), t)

    bbox = canvas.getbbox()
    cropped = canvas.crop(bbox)
    cw, ch = cropped.size

    scale = min(375 / ch, 375 / cw)
    final_w = int(cw * scale)
    final_h = int(ch * scale)
    resized = cropped.resize((final_w, final_h), Image.Resampling.LANCZOS)

    final_canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    final_canvas.paste(resized, ((400 - final_w) // 2, (400 - final_h) // 2), resized)

    out_path = os.path.join(OUT_DIR, "drinks-juices.webp")
    final_canvas.save(out_path, "WEBP", quality=95)
    fb = final_canvas.getbbox()
    print(f"  [REFINED PAIR] drinks-juices        -> bbox={fb} size={fb[2]-fb[0]}x{fb[3]-fb[1]}")

def compose_oral_care():
    # Oral-B Toothbrush (tall in bg) + Single bold Colgate Strong Teeth Carton in front
    tb_path = find_asset("oral_b_toothbrush_vert.png")
    cg_path = find_asset("single_colgate_strong_teeth.png")

    tb = Image.open(tb_path).convert('RGBA')
    cg = Image.open(cg_path).convert('RGBA')

    tb = tb.crop(tb.getbbox())
    cg = cg.crop(cg.getbbox())

    tb = tb.resize((int(tb.width * (370 / tb.height)), 370), Image.Resampling.LANCZOS)
    cg = cg.resize((int(cg.width * (180 / cg.height)), 180), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (700, 700), (0, 0, 0, 0))
    y_base = 560

    s_tb = create_ground_shadow(tb.width, 12, 35)
    s_cg = create_ground_shadow(cg.width, 12, 45)

    canvas.paste(s_tb, (150, y_base - 10), s_tb)
    canvas.paste(tb, (150, y_base - tb.height), tb)

    canvas.paste(s_cg, (230, y_base - 5), s_cg)
    canvas.paste(cg, (230, y_base - cg.height), cg)

    bbox = canvas.getbbox()
    cropped = canvas.crop(bbox)
    cw, ch = cropped.size

    scale = min(375 / ch, 380 / cw)
    final_w = int(cw * scale)
    final_h = int(ch * scale)
    resized = cropped.resize((final_w, final_h), Image.Resampling.LANCZOS)

    final_canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    final_canvas.paste(resized, ((400 - final_w) // 2, (400 - final_h) // 2), resized)

    out_path = os.path.join(OUT_DIR, "oral-care.webp")
    final_canvas.save(out_path, "WEBP", quality=95)
    fb = final_canvas.getbbox()
    print(f"  [REFINED PAIR] oral-care            -> bbox={fb} size={fb[2]-fb[0]}x{fb[3]-fb[1]}")

TILES_CONFIG = [
    # 1. Atta, Rice & Flours -> India Gate Basmati + LARGE, TALL, BRIGHT Aashirvaad Atta in front (Pure clean packshot, no sidebars!)
    ("basmati-rice.png", "pure_hd_aashirvaad_clean.png", "atta-rice-dal", 325, 220, 370, 280, 75, False),

    # 2. Dals & Pulses -> Tata Sampann Toor Dal + Tata Sampann Chana Dal (Snug tight overlap)
    ("tata_sampann_toor_dal.png", "tata_sampann_chana_dal.png", "local-dals", 370, 250, 370, 250, 70, False),

    # 3. Cooking Oils & Ghee -> Fortune Sunlite Sunflower Oil + Amul Pure Ghee Tin
    ("fortune_sunlite_oil.png", "amul_pure_ghee.png", "oil-ghee-masala", 370, 250, 370, 250, 70, False),

    # 4. Spices, Masalas & Pickles -> Aachi Masala Chilli Powder + Priya Mango Pickle Jar (User requested Aachi Masala!)
    ("rembg_aachi-chilli.png", "priya_mango_pickle.png", "spices-masalas", 370, 260, 370, 250, 70, False),

    # 5. Salt, Sugar & Jaggery -> Madhur Sugar + Ultra-HD Tata Salt
    ("madhur-sugar-clean.png", "hd_tata_salt_bright.png", "sugar-salt-staples", 370, 250, 370, 250, 70, False),

    # 6. Dry Fruits & Nuts -> Happilo Almonds + Happilo Cashews
    ("happilo_almonds.png", "happilo_cashews.png", "dry-fruits-cereals", 370, 250, 370, 250, 70, False),

    # 7. Namkeen, Mixture & Chips -> Haldiram's Aloo Bhujia + Lay's India's Magic Masala
    ("haldirams_aloo_bhujia.png", "lays-magic-masala.png", "chips-namkeen", 370, 250, 370, 250, 70, False),

    # 8. Chocolates, Candies & Sweets -> Amul Ice Cream Tub + Cadbury Dairy Milk Silk (Blinkit Sweet Tooth style!)
    ("hd_amul_icecream_tub.png", "cadbury_silk.png", "sweets-chocolates", 370, 250, 370, 250, 65, False),

    # 9. Tea, Coffee & Health Drinks -> Brooke Bond Red Label + Cadbury Bournvita
    ("red-label-tea.png", "cadbury_bournvita.png", "tea-coffee-milk-drinks", 370, 250, 370, 250, 70, False),

    # 11. Detergents & Laundry -> Ariel Matic Detergent + Clean Surf Excel Matic
    ("ariel_matic_detergent.png", "clean_surf-excel.png", "laundry-detergents", 370, 250, 370, 250, 70, False),

    # 12. Dishwash & Scrubbers -> Vim Dishwash Gel Lemon + Scotch-Brite Scrub Sponge
    ("vim_dishwash_gel.png", "scotch_brite_sponge.png", "dishwash", 370, 250, 370, 250, 60, False),

    # 13. Cleaners & Pest Control -> Lizol Floor Cleaner + Real Harpic Power Plus 10X (Tight, snug overlap!)
    ("lizol_floor_cleaner.png", "real_harpic_power_plus.png", "floor-surface-cleaners", 370, 250, 380, 250, 75, False),

    # 14. Pooja Essentials -> Cycle Three in One Agarbatti + Mangalam Pure Camphor
    ("cycle_three_in_one.png", "mangalam_camphor.png", "pooja-needs", 370, 250, 370, 250, 65, False),

    # 15. Kitchen Utility & Hardware -> Prestige Pressure Cooker + Milton Thermosteel Bottle
    ("prestige_pressure_cooker.png", "milton_steel_bottle.png", "kitchenware", 370, 250, 370, 250, 65, False),

    # 17. Hair Oils & Shampoos -> Clean Parachute Pure Coconut Oil + Head & Shoulders Shampoo (Tight & clean!)
    ("clean_parachute-oil.png", "head_and_shoulders.png", "hair-care", 370, 250, 375, 250, 25, False),

    # 19. Skin Care, Talc & Grooming -> Vaseline Deep Moisture + Nivea Soft Cream
    ("vaseline_body_lotion.png", "nivea_soft_cream.png", "skin-care", 370, 250, 370, 250, 65, False),

    # 20. Baby Care -> Pampers All-round Diaper Pants + Johnson's Baby Lotion (Tight & big!)
    ("pampers_diaper_pants.png", "johnsons_baby_lotion.png", "baby-care", 370, 250, 370, 250, 65, False),

    # 21. Feminine Hygiene -> Whisper Ultra Clean XL + V-Wash Plus Intimate Wash (Tightly overlapping!)
    ("whisper_vertical_pack.png", "vwash_plus_bottle.png", "hygiene", 370, 250, 370, 250, 72, False),

    # 22. Dairy, Bread & Ice Cream -> Amul Taaza Milk + Britannia White Bread
    ("amul_taaza_milk.png", "britannia_white_bread.png", "dairy-bread-eggs", 370, 250, 370, 250, 65, False),

    # 23. Biscuits, Cookies & Rusks -> Parle-G + Britannia Good Day
    ("parle-g.png", "good-day.png", "biscuits-bakery", 370, 250, 370, 250, 65, False),

    # 24. Sauces & Spreads -> Kissan Tomato Ketchup + Nutella Hazelnut Spread
    ("tomato-ketchup.png", "nutella_hazelnut_jar.png", "sauces-spreads", 370, 250, 370, 250, 65, False),

    # 25. Noodles & Instant Food -> Maggi 2-Minute Noodles + Kellogg's Corn Flakes
    ("maggi-noodles.png", "kelloggs_corn_flakes.png", "instant-food", 370, 250, 370, 250, 65, False),
]

def main():
    print("=== Composing All Category Tiles: Aachi Masala, Santoor+Mysore Sandal, Big Aashirvaad, Clean Thums Up+Frooti ===")
    count = 0
    for cfg in TILES_CONFIG:
        left, right, name, mhl, mwl, mhr, mwr, ov, l_front = cfg
        if compose_tight_pair(left, right, name, max_h_left=mhl, max_w_left=mwl, max_h_right=mhr, max_w_right=mwr, overlap_px=ov, left_in_front=l_front):
            count += 1
    compose_soaps_trio()
    count += 1
    compose_drinks_pair()
    count += 1
    compose_oral_care()
    count += 1
    print(f"\nSuccessfully generated {count} tight, box-fitted category logo tiles!")

if __name__ == "__main__":
    main()
