import os
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT, 'public')
VERIFIED_DIR = os.path.join(PUBLIC_DIR, 'products', 'verified')
COLLAGES_DIR = os.path.join(PUBLIC_DIR, 'categories', 'collages')
os.makedirs(COLLAGES_DIR, exist_ok=True)

def create_ground_shadow(width, height=14, opacity=50):
    shadow = Image.new('RGBA', (int(width * 1.3), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.44), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=5))

def load_and_prep_pack(filename, max_h=270, max_w=170):
    path = os.path.join(VERIFIED_DIR, filename)
    if not os.path.exists(path):
        print(f"Warning: {filename} not found at {path}")
        return None
    img = Image.open(path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    nw = max(10, int(cropped.width * scale))
    nh = max(10, int(cropped.height * scale))
    return cropped.resize((nw, nh), Image.Resampling.LANCZOS)

def build_three_pack_collage(category_id, left_file, mid_file, right_file):
    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 355

    img_left = load_and_prep_pack(left_file, max_h=250, max_w=150)
    img_mid = load_and_prep_pack(mid_file, max_h=285, max_w=175)
    img_right = load_and_prep_pack(right_file, max_h=255, max_w=150)

    if not img_left or not img_mid or not img_right:
        print(f"Failed to load packs for {category_id}")
        return

    overlap = 28
    total_w = img_left.width + img_mid.width + img_right.width - (2 * overlap)
    start_x = (400 - total_w) // 2

    x_left = start_x
    y_left = y_base - img_left.height

    x_mid = x_left + img_left.width - overlap
    y_mid = y_base - img_mid.height

    x_right = x_mid + img_mid.width - overlap
    y_right = y_base - img_right.height

    s_left = create_ground_shadow(img_left.width, height=12, opacity=45)
    s_mid = create_ground_shadow(img_mid.width, height=15, opacity=55)
    s_right = create_ground_shadow(img_right.width, height=12, opacity=45)

    canvas.paste(s_left, (x_left + (img_left.width - s_left.width) // 2, y_base - s_left.height // 2), s_left)
    canvas.paste(s_right, (x_right + (img_right.width - s_right.width) // 2, y_base - s_right.height // 2), s_right)
    canvas.paste(s_mid, (x_mid + (img_mid.width - s_mid.width) // 2, y_base - s_mid.height // 2), s_mid)

    canvas.paste(img_left, (x_left, y_left), img_left)
    canvas.paste(img_right, (x_right, y_right), img_right)
    canvas.paste(img_mid, (x_mid, y_mid), img_mid)

    # Center vertically
    bbox = canvas.getbbox()
    if bbox:
        content_h = bbox[3] - bbox[1]
        target_y = (400 - content_h) // 2
        shift_y = target_y - bbox[1]
        centered = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
        centered.paste(canvas, (0, shift_y), canvas)
        canvas = centered

    out_webp = os.path.join(COLLAGES_DIR, f"{category_id}.webp")
    canvas.save(out_webp, 'WEBP', quality=92)
    print(f"[OK] Generated {out_webp}")

# 1. Dairy, Bread & Eggs (Arokya Milk + Heritage Curd + Amul Butter)
build_three_pack_collage(
    'dairy-bread-eggs',
    'dry-heritage-curd-450g.webp',
    'dry-arokya-toned-milk.webp',
    'dry-amul-butter-100g.webp'
)

# 2. Instant Food & Breakfast (Maggi Noodles + Kellogg's Corn Flakes + Bambino Semiya)
build_three_pack_collage(
    'instant-food',
    'ins-maggi-masala-4pack.webp',
    'ins-kelloggs-corn-flakes-250g.webp',
    'ins-bambino-vermicelli.webp'
)

# 3. Ice Creams & Frozen Desserts (Arun Chocobar + Arun Vanilla Tub + Arun Toffee Cone)
build_three_pack_collage(
    'ice-creams',
    'dry-arun-chocobar.webp',
    'dry-arun-vanilla-tub.webp',
    'dry-arun-toffee-cone.webp'
)

# 4. Biscuits & Bakery (Parle-G + Britannia Good Day Cashew + Sunfeast Dark Fantasy)
build_three_pack_collage(
    'biscuits-bakery',
    'bsc-parle-g.webp',
    'bsc-britannia-good-day-cashew.webp',
    'bsc-sunfeast-dark-fantasy.webp'
)

print("All hero collages generated successfully!")
