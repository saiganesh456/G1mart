import os
import sys
from PIL import Image, ImageFilter, ImageDraw

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKSHOTS_FMCG = os.path.join(BASE_DIR, "public", "products", "packshots_fmcg")
PACKSHOTS_LEGACY = os.path.join(BASE_DIR, "public", "products", "packshots")
OUT_DIR = os.path.join(BASE_DIR, "public", "categories", "collages")
BACKUP_DIR = os.path.join(BASE_DIR, "public", "categories", "collages_backup_brand")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

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

def prepare_item(img_path, max_h=370, max_w=250):
    img = Image.open(img_path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    new_w = max(10, int(cropped.width * scale))
    new_h = max(10, int(cropped.height * scale))
    return cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

def compose_tight_pair(left_file, right_file, out_name, max_h=370, max_w=250, overlap_px=60, left_in_front=False):
    left_path = find_asset(left_file)
    right_path = find_asset(right_file)

    if not left_path or not right_path:
        print(f"[MISSING ASSET] for {out_name}: left={left_path}, right={right_path}")
        return False

    item_left = prepare_item(left_path, max_h=max_h, max_w=max_w)
    item_right = prepare_item(right_path, max_h=max_h, max_w=max_w)

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

    # 3. Maximum box-fitting scale: fill 375px height or 380px width of 400x400 canvas
    target_max_h = 375
    target_max_w = 380
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
    print(f"  [BOX-FITTED LOGO] {out_name:24s} -> bbox={final_bbox} size={final_bbox[2]-final_bbox[0]}x{final_bbox[3]-final_bbox[1]}")
    return True

# Upgraded configurations with ultra-bright assets, snug logo overlap, and box-filling scales
TILES_CONFIG = [
    # GROCERY & KITCHEN
    # 1. Atta, Rice & Flours -> India Gate Basmati + Ultra-HD Bright Aashirvaad Shudh Chakki Atta (Official BB Packshot)
    ("basmati-rice.png", "hd_aashirvaad_atta.png", "atta-rice-dal", 370, 250, 65, False),

    # 2. Dals & Pulses -> Tata Sampann Toor Dal + Tata Sampann Chana Dal
    ("tata_sampann_toor_dal.png", "tata_sampann_chana_dal.png", "local-dals", 370, 250, 60, False),

    # 3. Cooking Oils & Ghee -> Fortune Sunlite Sunflower Oil + Amul Pure Ghee Tin
    ("fortune_sunlite_oil.png", "amul_pure_ghee.png", "oil-ghee-masala", 370, 250, 65, False),

    # 4. Spices, Masalas & Pickles -> Ultra-HD Bright Red Everest Tikhalal Box + Priya Mango Pickle
    ("hd_everest_tikhalal_box.png", "priya_mango_pickle.png", "spices-masalas", 370, 250, 55, False),

    # 5. Salt, Sugar & Jaggery -> Madhur Sugar + Ultra-HD Tata Salt (Desh Ka Namak)
    ("madhur-sugar-clean.png", "hd_tata_salt_bright.png", "sugar-salt-staples", 370, 250, 60, False),

    # 6. Dry Fruits & Nuts -> Happilo Almonds + Happilo Cashews
    ("happilo_almonds.png", "happilo_cashews.png", "dry-fruits-cereals", 370, 250, 60, False),

    # SNACKS & DRINKS
    # 7. Namkeen, Mixture & Chips -> Haldiram's Aloo Bhujia + Lay's India's Magic Masala
    ("haldirams_aloo_bhujia.png", "lays-magic-masala.png", "chips-namkeen", 370, 250, 60, False),

    # 8. Chocolates, Candies & Sweets -> Amul Ice Cream Tub + Cadbury Dairy Milk Silk (Blinkit style!)
    ("hd_amul_icecream_tub.png", "cadbury_silk.png", "sweets-chocolates", 370, 250, 60, False),

    # 9. Tea, Coffee & Health Drinks -> Brooke Bond Red Label + Cadbury Bournvita
    ("red-label-tea.png", "cadbury_bournvita.png", "tea-coffee-milk-drinks", 370, 250, 60, False),

    # 10. Cold Drinks, Juices & Soda -> Frooti Mango Drink + Tall Thums Up Bottle
    ("frooti.png", "hd_thums_up_bottle.png", "drinks-juices", 370, 250, 50, False),

    # HOUSEHOLD ESSENTIALS
    # 11. Detergents & Laundry -> Ariel Matic Detergent + Clean Surf Excel Matic
    ("ariel_matic_detergent.png", "clean_surf-excel.png", "laundry-detergents", 370, 250, 60, False),

    # 12. Dishwash & Scrubbers -> Vim Dishwash Gel Lemon + Scotch-Brite Scrub Sponge
    ("vim_dishwash_gel.png", "scotch_brite_sponge.png", "dishwash", 370, 250, 55, False),

    # 13. Cleaners & Pest Control -> Lizol Floor Cleaner + Real Harpic Power Plus 10X
    ("lizol_floor_cleaner.png", "real_harpic_power_plus.png", "floor-surface-cleaners", 370, 250, 60, False),

    # 14. Pooja Essentials -> Cycle Three in One Agarbatti + Mangalam Pure Camphor
    ("cycle_three_in_one.png", "mangalam_camphor.png", "pooja-needs", 370, 250, 55, False),

    # 15. Kitchen Utility & Hardware -> Prestige Pressure Cooker + Milton Thermosteel Bottle
    ("prestige_pressure_cooker.png", "milton_steel_bottle.png", "kitchenware", 370, 250, 55, False),

    # BEAUTY & PERSONAL CARE
    # 16. Bathing Soaps & Handwash -> Dettol Handwash Pump + 3D Green Dettol Soap Bar
    ("dettol_handwash_pump.png", "hd_dettol_soap_bar.png", "soaps-bath", 370, 250, 60, False),

    # 17. Hair Oils & Shampoos -> Clean Parachute Pure Coconut Oil + Head & Shoulders Shampoo
    ("clean_parachute-oil.png", "head_and_shoulders.png", "hair-care", 370, 250, 25, False),

    # 18. Toothpaste & Oral Care -> Colgate Strong Teeth + Listerine Cool Mint
    ("pc-colgate-strong-teeth.png", "listerine_bottle.png", "oral-care", 370, 250, 60, False),

    # 19. Skin Care, Talc & Grooming -> Vaseline Deep Moisture + Nivea Soft Cream
    ("vaseline_body_lotion.png", "nivea_soft_cream.png", "skin-care", 370, 250, 60, False),

    # 20. Baby Care -> Pampers All-round Diaper Pants + Johnson's Baby Lotion
    ("pampers_diaper_pants.png", "johnsons_baby_lotion.png", "baby-care", 370, 250, 60, False),

    # 21. Feminine Hygiene -> Whisper Ultra Clean XL + V-Wash Plus Intimate Wash
    ("whisper_vertical_pack.png", "vwash_plus_bottle.png", "hygiene", 370, 250, 60, False),

    # PANTRY & BREAKFAST
    # 22. Dairy, Bread & Ice Cream -> Amul Taaza Milk + Britannia White Bread
    ("amul_taaza_milk.png", "britannia_white_bread.png", "dairy-bread-eggs", 370, 250, 60, False),

    # 23. Biscuits, Cookies & Rusks -> Parle-G + Britannia Good Day
    ("parle-g.png", "good-day.png", "biscuits-bakery", 370, 250, 60, False),

    # 24. Sauces & Spreads -> Kissan Tomato Ketchup + Nutella Hazelnut Spread
    ("tomato-ketchup.png", "nutella_hazelnut_jar.png", "sauces-spreads", 370, 250, 60, False),

    # 25. Noodles & Instant Food -> Maggi 2-Minute Noodles + Kellogg's Corn Flakes
    ("maggi-noodles.png", "kelloggs_corn_flakes.png", "instant-food", 370, 250, 60, False),
]

def main():
    print("=== Composing All Category Tiles Fitted to Box with Ultra Clarity ===")
    count = 0
    for cfg in TILES_CONFIG:
        left, right, name, mh, mw, ov, l_front = cfg
        if compose_tight_pair(left, right, name, max_h=mh, max_w=mw, overlap_px=ov, left_in_front=l_front):
            count += 1
    print(f"\nSuccessfully generated {count}/{len(TILES_CONFIG)} box-fitted logo tiles!")

if __name__ == "__main__":
    main()
