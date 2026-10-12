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

def prepare_item(img_path, max_h=340, max_w=240):
    img = Image.open(img_path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    new_w = max(10, int(cropped.width * scale))
    new_h = max(10, int(cropped.height * scale))
    return cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

def compose_tight_pair(left_file, right_file, out_name, max_h=340, max_w=235, overlap_px=55, left_in_front=False):
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
    canvas_w = 600
    canvas_h = 600
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    y_base = 480

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

    # 3. Uniform target scale: fill ~345px height or ~355px width of 400x400 canvas
    target_max_h = 345
    target_max_w = 355
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
    print(f"  [TIGHT LOGO] {out_name:24s} -> bbox={final_bbox} size={final_bbox[2]-final_bbox[0]}x{final_bbox[3]-final_bbox[1]}")
    return True

# Complete, verified catalog with tight logo pairing (45-65px overlap) and NO white background artifacts
TILES_CONFIG = [
    # GROCERY & KITCHEN
    # 1. Atta, Rice & Flours -> India Gate Basmati + Aashirvaad Shudh Chakki Atta
    ("basmati-rice.png", "aashirvaad-atta-1kg.png", "atta-rice-dal", 340, 240, 60, False),

    # 2. Dals & Pulses -> Tata Sampann Toor Dal + Tata Sampann Chana Dal
    ("tata_sampann_toor_dal.png", "tata_sampann_chana_dal.png", "local-dals", 340, 230, 55, False),

    # 3. Cooking Oils & Ghee -> Fortune Sunlite Sunflower Oil + Amul Pure Ghee Tin
    ("fortune_sunlite_oil.png", "amul_pure_ghee.png", "oil-ghee-masala", 340, 230, 60, False),

    # 4. Spices, Masalas & Pickles -> Real Everest Tikhalal Red Chilli + Priya Mango Pickle (NO brown bread!)
    ("real_everest_tikhalal.png", "priya_mango_pickle.png", "spices-masalas", 340, 240, 50, False),

    # 5. Salt, Sugar & Jaggery -> Madhur Sugar + Tata Salt (Desh Ka Namak)
    ("madhur-sugar-clean.png", "tata-salt.png", "sugar-salt-staples", 340, 230, 55, False),

    # 6. Dry Fruits & Nuts -> Happilo Almonds + Happilo Cashews
    ("happilo_almonds.png", "happilo_cashews.png", "dry-fruits-cereals", 340, 230, 55, False),

    # SNACKS & DRINKS
    # 7. Namkeen, Mixture & Chips -> Haldiram's Aloo Bhujia + Lay's India's Magic Masala
    ("haldirams_aloo_bhujia.png", "lays-magic-masala.png", "chips-namkeen", 340, 230, 55, False),

    # 8. Chocolates, Candies & Sweets -> Real KitKat Standing Bar + Cadbury Dairy Milk Silk
    ("real_kitkat_vertical.png", "cadbury_silk.png", "sweets-chocolates", 340, 230, 55, False),

    # 9. Tea, Coffee & Health Drinks -> Brooke Bond Red Label + Cadbury Bournvita
    ("red-label-tea.png", "cadbury_bournvita.png", "tea-coffee-milk-drinks", 340, 230, 55, False),

    # 10. Cold Drinks, Juices & Soda -> Real Fruit Power Juice + Thums Up
    ("real_fruit_juice.png", "thums-up.png", "drinks-juices", 340, 230, 50, False),

    # HOUSEHOLD ESSENTIALS
    # 11. Detergents & Laundry -> Ariel Matic Detergent + Clean Surf Excel (NO white card!)
    ("ariel_matic_detergent.png", "clean_surf-excel.png", "laundry-detergents", 340, 230, 55, False),

    # 12. Dishwash & Scrubbers -> Vim Dishwash Gel Lemon + Scotch-Brite Scrub Sponge
    ("vim_dishwash_gel.png", "scotch_brite_sponge.png", "dishwash", 340, 230, 50, False),

    # 13. Cleaners & Pest Control -> Lizol Floor Cleaner + Real Harpic Power Plus 10X (NO biscuit box!)
    ("lizol_floor_cleaner.png", "real_harpic_power_plus.png", "floor-surface-cleaners", 340, 230, 55, False),

    # 14. Pooja Essentials -> Cycle Three in One Agarbatti + Mangalam Pure Camphor
    ("cycle_three_in_one.png", "mangalam_camphor.png", "pooja-needs", 340, 230, 50, False),

    # 15. Kitchen Utility & Hardware -> Prestige Pressure Cooker + Milton Thermosteel Bottle
    ("prestige_pressure_cooker.png", "milton_steel_bottle.png", "kitchenware", 340, 230, 55, False),

    # BEAUTY & PERSONAL CARE
    # 16. Bathing Soaps & Handwash -> Dettol Handwash Pump + Clean Dettol Soap Bar (NO white box!)
    ("dettol_handwash_pump.png", "clean_dettol-soap.png", "soaps-bath", 340, 230, 55, False),

    # 17. Hair Oils & Shampoos -> Clean Parachute Pure Coconut Oil (NO white box!) + Head & Shoulders Shampoo
    ("clean_parachute-oil.png", "head_and_shoulders.png", "hair-care", 345, 240, 18, False),

    # 18. Toothpaste & Oral Care -> Colgate Strong Teeth + Listerine Cool Mint
    ("pc-colgate-strong-teeth.png", "listerine_bottle.png", "oral-care", 340, 230, 55, False),

    # 19. Skin Care, Talc & Grooming -> Vaseline Deep Moisture + Nivea Soft Cream
    ("vaseline_body_lotion.png", "nivea_soft_cream.png", "skin-care", 340, 230, 55, False),

    # 20. Baby Care -> Pampers All-round Diaper Pants + Johnson's Baby Lotion
    ("pampers_diaper_pants.png", "johnsons_baby_lotion.png", "baby-care", 340, 230, 55, False),

    # 21. Feminine Hygiene -> Whisper Ultra Clean XL + V-Wash Plus Intimate Wash
    ("whisper_vertical_pack.png", "vwash_plus_bottle.png", "hygiene", 340, 230, 55, False),

    # PANTRY & BREAKFAST
    # 22. Dairy, Bread & Ice Cream -> Amul Taaza Milk + Britannia White Bread
    ("amul_taaza_milk.png", "britannia_white_bread.png", "dairy-bread-eggs", 340, 230, 55, False),

    # 23. Biscuits, Cookies & Rusks -> Parle-G + Britannia Good Day
    ("parle-g.png", "good-day.png", "biscuits-bakery", 340, 230, 55, False),

    # 24. Sauces & Spreads -> Kissan Tomato Ketchup + Nutella Hazelnut Spread
    ("tomato-ketchup.png", "nutella_hazelnut_jar.png", "sauces-spreads", 340, 230, 55, False),

    # 25. Noodles & Instant Food -> Maggi 2-Minute Noodles + Kellogg's Corn Flakes
    ("maggi-noodles.png", "kelloggs_corn_flakes.png", "instant-food", 340, 230, 55, False),
]

def main():
    print("=== Composing All Category Tiles with Tight Logo Layout & Uniform Size ===")
    count = 0
    for cfg in TILES_CONFIG:
        left, right, name, mh, mw, ov, l_front = cfg
        if compose_tight_pair(left, right, name, max_h=mh, max_w=mw, overlap_px=ov, left_in_front=l_front):
            count += 1
    print(f"\nSuccessfully generated {count}/{len(TILES_CONFIG)} tight, uniform category logo tiles!")

if __name__ == "__main__":
    main()
