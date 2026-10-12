import os
import sys
import json
from PIL import Image, ImageFilter, ImageDraw

BASE_DIR = r"d:\web-agency-projects\G1mart"
COLLAGES_DIR = os.path.join(BASE_DIR, "public", "categories", "collages")
PACKSHOTS_DIR = os.path.join(BASE_DIR, "public", "products", "packshots")
VERIFIED_DIR = os.path.join(BASE_DIR, "public", "products", "verified")

os.makedirs(COLLAGES_DIR, exist_ok=True)

def create_ground_shadow(width, height=14, opacity=55):
    shadow = Image.new('RGBA', (int(width * 1.3), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.44), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=5))

def center_canvas_vertically(canvas):
    bbox = canvas.getbbox()
    if not bbox:
        return canvas
    content_h = bbox[3] - bbox[1]
    target_y = (400 - content_h) // 2
    shift_y = target_y - bbox[1]
    centered = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    centered.paste(canvas, (0, shift_y), canvas)
    return centered

def load_and_prep_image(src_rel, max_h=280, max_w=200):
    if not src_rel:
        return None
    # Try packshots first, then verified, then general public
    paths_to_try = [
        os.path.join(PACKSHOTS_DIR, src_rel),
        os.path.join(VERIFIED_DIR, src_rel),
        os.path.join(BASE_DIR, "public", src_rel.lstrip('/')),
        os.path.join(BASE_DIR, src_rel.lstrip('/')),
    ]
    found_path = None
    for p in paths_to_try:
        if os.path.exists(p):
            found_path = p
            break
    if not found_path:
        print(f"  [WARN] Image not found: {src_rel}")
        return None

    img = Image.open(found_path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    nw = max(10, int(cropped.width * scale))
    nh = max(10, int(cropped.height * scale))
    return cropped.resize((nw, nh), Image.Resampling.LANCZOS)

def build_tile_collage(category_id, pack_specs):
    """
    pack_specs: list of image relative paths or filenames.
    Rule: 2-3 packs max, tallest pack in the middle, slight overlap.
    """
    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 355

    loaded = []
    for spec in pack_specs:
        img = load_and_prep_image(spec.get('file'), max_h=spec.get('max_h', 275), max_w=spec.get('max_w', 190))
        if img:
            loaded.append({'img': img, 'spec': spec})

    if not loaded:
        print(f"  [ERR] No images loaded for {category_id}")
        return

    if len(loaded) == 1:
        item = loaded[0]['img']
        start_x = (400 - item.width) // 2
        start_y = y_base - item.height
        s = create_ground_shadow(item.width, height=14, opacity=60)
        canvas.paste(s, (start_x + (item.width - s.width) // 2, y_base - s.height // 2), s)
        canvas.paste(item, (start_x, start_y), item)

    elif len(loaded) == 2:
        img1 = loaded[0]['img']
        img2 = loaded[1]['img']
        overlap = min(30, int(min(img1.width, img2.width) * 0.22))
        total_w = img1.width + img2.width - overlap
        start_x = (400 - total_w) // 2

        x1 = start_x
        y1 = y_base - img1.height
        x2 = x1 + img1.width - overlap
        y2 = y_base - img2.height

        s1 = create_ground_shadow(img1.width, height=14, opacity=55)
        s2 = create_ground_shadow(img2.width, height=14, opacity=60)

        canvas.paste(s1, (x1 + (img1.width - s1.width) // 2, y_base - s1.height // 2), s1)
        canvas.paste(s2, (x2 + (img2.width - s2.width) // 2, y_base - s2.height // 2), s2)

        canvas.paste(img1, (x1, y1), img1)
        canvas.paste(img2, (x2, y2), img2)

    elif len(loaded) >= 3:
        # Rule: Tallest pack in the middle!
        # loaded[0] = left, loaded[1] = middle (tallest), loaded[2] = right
        img_left = loaded[0]['img']
        img_mid = loaded[1]['img']
        img_right = loaded[2]['img']

        overlap_left = min(28, int(img_left.width * 0.22))
        overlap_right = min(28, int(img_right.width * 0.22))

        total_w = img_left.width + img_mid.width + img_right.width - overlap_left - overlap_right
        # If total_w exceeds 380, rescale
        if total_w > 380:
            scale_factor = 370.0 / total_w
            img_left = img_left.resize((int(img_left.width * scale_factor), int(img_left.height * scale_factor)), Image.Resampling.LANCZOS)
            img_mid = img_mid.resize((int(img_mid.width * scale_factor), int(img_mid.height * scale_factor)), Image.Resampling.LANCZOS)
            img_right = img_right.resize((int(img_right.width * scale_factor), int(img_right.height * scale_factor)), Image.Resampling.LANCZOS)
            overlap_left = int(overlap_left * scale_factor)
            overlap_right = int(overlap_right * scale_factor)
            total_w = img_left.width + img_mid.width + img_right.width - overlap_left - overlap_right

        start_x = (400 - total_w) // 2

        x_left = start_x
        y_left = y_base - img_left.height

        x_mid = x_left + img_left.width - overlap_left
        y_mid = y_base - img_mid.height

        x_right = x_mid + img_mid.width - overlap_right
        y_right = y_base - img_right.height

        # Shadows
        s_left = create_ground_shadow(img_left.width, height=13, opacity=50)
        s_right = create_ground_shadow(img_right.width, height=13, opacity=50)
        s_mid = create_ground_shadow(img_mid.width, height=15, opacity=65)

        canvas.paste(s_left, (x_left + (img_left.width - s_left.width) // 2, y_base - s_left.height // 2), s_left)
        canvas.paste(s_right, (x_right + (img_right.width - s_right.width) // 2, y_base - s_right.height // 2), s_right)
        canvas.paste(s_mid, (x_mid + (img_mid.width - s_mid.width) // 2, y_base - s_mid.height // 2), s_mid)

        # Paste left and right first, middle on top (tallest pack in middle)
        canvas.paste(img_left, (x_left, y_left), img_left)
        canvas.paste(img_right, (x_right, y_right), img_right)
        canvas.paste(img_mid, (x_mid, y_mid), img_mid)

    canvas = center_canvas_vertically(canvas)
    out_file = os.path.join(COLLAGES_DIR, f"{category_id}.webp")
    canvas.save(out_file, "WEBP", quality=92)
    print(f"[OK] Generated {category_id}.webp ({len(loaded)} packs) -> bbox: {canvas.getbbox()}")

# Full specification of every single tile
TILE_SPECS = {
    # 1. GROCERY & KITCHEN
    'atta-rice-dal': [
        {'file': 'aashirvaad-atta-1kg.png', 'max_h': 265, 'max_w': 160},
        {'file': 'basmati-rice.png', 'max_h': 285, 'max_w': 180},
        {'file': 'lalitha-idli-rava.png', 'max_h': 260, 'max_w': 155},
    ],
    'local-dals': [
        {'file': 'chana-dal.png', 'max_h': 265, 'max_w': 160},
        {'file': 'toor-dal.png', 'max_h': 285, 'max_w': 180},
        {'file': 'moong-dal.png', 'max_h': 265, 'max_w': 160},
    ],
    'oil-ghee-masala': [
        {'file': 'freedom-oil-1l.png', 'max_h': 270, 'max_w': 160},
        {'file': 'fortune-sunlite-clean.png', 'max_h': 285, 'max_w': 160},
        {'file': 'amul-ghee.png', 'max_h': 255, 'max_w': 160},
    ],
    'spices-masalas': [
        {'file': 'aachi-chilli.png', 'max_h': 265, 'max_w': 160},
        {'file': 'garam-masala.png', 'max_h': 280, 'max_w': 175},
        {'file': 'turmeric-powder.png', 'max_h': 265, 'max_w': 160},
    ],
    'sauces-spreads': [
        {'file': 'mixed-fruit-jam.png', 'max_h': 255, 'max_w': 150},
        {'file': 'tomato-ketchup.png', 'max_h': 285, 'max_w': 170},
        {'file': 'mango-pickle.png', 'max_h': 260, 'max_w': 150},
    ],
    'sugar-salt-staples': [
        {'file': 'tata-salt.png', 'max_h': 270, 'max_w': 165},
        {'file': 'madhur-sugar-clean.png', 'max_h': 285, 'max_w': 175},
        {'file': 'g1-p0185.webp', 'max_h': 250, 'max_w': 150}, # Thati Bellam / Jaggery block
    ],
    'dry-fruits-cereals': [
        {'file': 'g1-p0077.webp', 'max_h': 255, 'max_w': 155}, # Dates / Dried Fruit
        {'file': 'cashew-nuts.png', 'max_h': 280, 'max_w': 175},
        {'file': 'g1-p0210.webp', 'max_h': 255, 'max_w': 155}, # Unibic Cashew Badam
    ],
    'vegetables-fruits': [
        {'file': 'fresh-onion.png', 'max_h': 240, 'max_w': 150},
        {'file': 'fresh-tomato.png', 'max_h': 275, 'max_w': 170},
        {'file': 'fresh-potato.png', 'max_h': 250, 'max_w': 150},
    ],

    # 2. DAIRY & BREAKFAST
    'dairy-bread-eggs': [
        {'file': 'curd-dahi.png', 'max_h': 265, 'max_w': 160},
        {'file': 'amul-milk.png', 'max_h': 285, 'max_w': 170},
        {'file': 'arun-donut.png', 'max_h': 250, 'max_w': 155},
    ],
    'breakfast-cereals': [
        {'file': 'maggi-noodles.png', 'max_h': 265, 'max_w': 160},
        {'file': 'corn-flakes.png', 'max_h': 285, 'max_w': 175},
        {'file': 'g1-p0660.webp', 'max_h': 260, 'max_w': 155}, # Bambino Vermicelli
    ],
    'biscuits-bakery': [
        {'file': 'parle-g.png', 'max_h': 265, 'max_w': 160},
        {'file': 'good-day.png', 'max_h': 280, 'max_w': 175},
        {'file': 'g1-p0175.webp', 'max_h': 260, 'max_w': 160}, # Oreo
    ],
    'instant-food': [
        {'file': 'g1-p0599.webp', 'max_h': 265, 'max_w': 160}, # Yippee Noodles
        {'file': 'maggi-noodles.png', 'max_h': 285, 'max_w': 175},
        {'file': 'g1-p0204.webp', 'max_h': 260, 'max_w': 155}, # Pasta
    ],

    # 3. SNACKS & DRINKS
    'chips-namkeen': [
        {'file': 'haldiram-khatta-meetha.png', 'max_h': 270, 'max_w': 160},
        {'file': 'kurkure.png', 'max_h': 285, 'max_w': 175},
        {'file': 'lays-chips.png', 'max_h': 270, 'max_w': 160},
    ],
    'sweets-chocolates': [
        {'file': 'kitkat.png', 'max_h': 260, 'max_w': 155}, # KitKat bar
        {'file': 'cadbury-dairy-milk.png', 'max_h': 285, 'max_w': 165},
        {'file': 'cadbury-5-star.png', 'max_h': 255, 'max_w': 155},
    ],
    'tea-coffee-milk-drinks': [
        {'file': 'red-label-tea.png', 'max_h': 270, 'max_w': 160},
        {'file': 'horlicks.png', 'max_h': 290, 'max_w': 165},
        {'file': 'bru-instant.png', 'max_h': 270, 'max_w': 160},
    ],
    'drinks-juices': [
        {'file': 'coca-cola.png', 'max_h': 275, 'max_w': 160},
        {'file': 'thums-up.png', 'max_h': 285, 'max_w': 165},
        {'file': 'frooti.png', 'max_h': 265, 'max_w': 155},
    ],

    # 4. HOUSEHOLD ESSENTIALS
    'laundry-detergents': [
        {'file': 'ariel-front-liq.png', 'max_h': 275, 'max_w': 160},
        {'file': 'surf-excel.png', 'max_h': 285, 'max_w': 175},
        {'file': 'g1-p0113.webp', 'max_h': 265, 'max_w': 155}, # Tide
    ],
    'dishwash': [
        {'file': 'g1-p0307.webp', 'max_h': 270, 'max_w': 155}, # Vim Liquid
        {'file': 'vim-bar.png', 'max_h': 280, 'max_w': 180},
        {'file': 'g1-p0850.webp', 'max_h': 255, 'max_w': 155}, # Exo Scrubber
    ],
    'floor-surface-cleaners': [
        {'file': 'g1-p0220.webp', 'max_h': 275, 'max_w': 160}, # Lizol
        {'file': 'g1-p0212.webp', 'max_h': 285, 'max_w': 170}, # Harpic
        {'file': 'g1-p0018.webp', 'max_h': 250, 'max_w': 150}, # HIT
    ],
    'pooja-needs': [
        {'file': 'g1-p0450.webp', 'max_h': 275, 'max_w': 160}, # Cycle Pure
        {'file': 'pooja-agarbatti.png', 'max_h': 285, 'max_w': 175},
        {'file': 'g1-p0451.webp', 'max_h': 265, 'max_w': 160}, # Mangaldeep
    ],
    'kitchenware': [
        {'file': 'g1-p0049.webp', 'max_h': 255, 'max_w': 150}, # Hardware lock
        {'file': 'launch-plate.png', 'max_h': 285, 'max_w': 180}, # Flask & Pan
        {'file': 'g1-p0770.webp', 'max_h': 250, 'max_w': 150}, # Utility Battery
    ],

    # 5. BEAUTY & PERSONAL CARE
    'soaps-bath': [
        {'file': 'cinthol-clean.png', 'max_h': 265, 'max_w': 160},
        {'file': 'santoor-soap-clean.png', 'max_h': 280, 'max_w': 175},
        {'file': 'lux-soap.png', 'max_h': 265, 'max_w': 160},
    ],
    'hair-care': [
        {'file': 'g1-p0101.webp', 'max_h': 270, 'max_w': 160}, # Dabur Amla
        {'file': 'parachute-oil.png', 'max_h': 285, 'max_w': 170},
        {'file': 'g1-p0588.webp', 'max_h': 265, 'max_w': 155}, # Parachute Advansed
    ],
    'hair-shampoos': [
        {'file': 'g1-p0617.webp', 'max_h': 270, 'max_w': 160}, # Sunsilk
        {'file': 'g1-p0201.webp', 'max_h': 285, 'max_w': 170}, # Clinic Plus
        {'file': 'g1-p1026.webp', 'max_h': 265, 'max_w': 155}, # Dove Shampoo
    ],
    'oral-care': [
        {'file': 'close-up-toothpaste.png', 'max_h': 270, 'max_w': 160},
        {'file': 'colgate-toothpaste.png', 'max_h': 285, 'max_w': 170},
        {'file': 'g1-p0547.webp', 'max_h': 265, 'max_w': 155}, # Pepsodent
    ],
    'skin-care': [
        {'file': 'g1-p0193.webp', 'max_h': 270, 'max_w': 160}, # Vaseline
        {'file': 'ponds-talc.png', 'max_h': 285, 'max_w': 170},
        {'file': 'g1-p0006.webp', 'max_h': 260, 'max_w': 155}, # Glow & Lovely
    ],
    'baby-care': [
        {'file': 'g1-p0128.webp', 'max_h': 260, 'max_w': 155}, # Himalaya Baby Soap
        {'file': 'huggies.png', 'max_h': 285, 'max_w': 175},   # Huggies Diapers
        {'file': 'g1-p0908.webp', 'max_h': 260, 'max_w': 155}, # Mysore Sandal Baby Soap
    ],
    'hygiene': [
        {'file': 'g1-p0438.webp', 'max_h': 270, 'max_w': 160}, # Whisper Choice XL
        {'file': 'stayfree.png', 'max_h': 285, 'max_w': 175},
        {'file': 'g1-p0222.webp', 'max_h': 270, 'max_w': 160}, # Whisper XL
    ],
    'shaving-grooming': [
        {'file': 'body-spray.png', 'max_h': 275, 'max_w': 155}, # Fogg / Body spray
        {'file': 'g1-p1041.webp', 'max_h': 285, 'max_w': 170}, # Gillette Shave Foam
        {'file': 'g1-p0321.webp', 'max_h': 265, 'max_w': 155}, # Rexona Men Deodorant
    ],
}

print("Starting Hero Collage generation for all supermarket tiles...")
for cid, specs in TILE_SPECS.items():
    build_tile_collage(cid, specs)
print("\nAll hero collages built successfully!")
