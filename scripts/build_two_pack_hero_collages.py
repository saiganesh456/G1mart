import os
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT, 'public')
PACKSHOTS_DIR = os.path.join(PUBLIC_DIR, 'products', 'packshots')
VERIFIED_DIR = os.path.join(PUBLIC_DIR, 'products', 'verified')
COLLAGES_DIR = os.path.join(PUBLIC_DIR, 'categories', 'collages')
os.makedirs(COLLAGES_DIR, exist_ok=True)

def remove_white_background_smart(img, threshold=238):
    """Accurately isolate product by removing white background with soft antialiased edges."""
    img = img.convert('RGBA')
    w, h = img.size
    pix = img.load()

    result = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    res_pix = result.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                res_pix[x, y] = (0, 0, 0, 0)
            elif r >= threshold and g >= threshold and b >= threshold:
                res_pix[x, y] = (255, 255, 255, 0)
            elif r >= threshold - 18 and g >= threshold - 18 and b >= threshold - 18:
                factor = (min(r, g, b) - (threshold - 18)) / 18.0
                alpha = int(a * (1.0 - factor))
                res_pix[x, y] = (r, g, b, max(0, min(255, alpha)))
            else:
                res_pix[x, y] = (r, g, b, a)

    return result

def create_ground_shadow(width, height=16, opacity=60):
    shadow = Image.new('RGBA', (int(width * 1.3), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.44), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=6))

def load_clean_pack(filename, max_h=315, max_w=240):
    p_pack = os.path.join(PACKSHOTS_DIR, filename)
    p_ver = os.path.join(VERIFIED_DIR, filename)
    path = p_pack if os.path.exists(p_pack) else p_ver

    if not os.path.exists(path):
        print(f"Error: {filename} not found!")
        return None

    img = Image.open(path)
    img = remove_white_background_smart(img)

    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    nw = max(10, int(cropped.width * scale))
    nh = max(10, int(cropped.height * scale))
    return cropped.resize((nw, nh), Image.Resampling.LANCZOS)

def build_two_pack_collage(category_id, left_file, right_file, left_h=300, left_w=220, right_h=320, right_w=230, overlap=36):
    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 360

    img_left = load_clean_pack(left_file, max_h=left_h, max_w=left_w)
    img_right = load_clean_pack(right_file, max_h=right_h, max_w=right_w)

    if not img_left or not img_right:
        print(f"Failed to load packs for {category_id}")
        return

    # Two big packs with natural overlap
    total_w = img_left.width + img_right.width - overlap
    start_x = (400 - total_w) // 2

    x_left = start_x
    y_left = y_base - img_left.height

    x_right = x_left + img_left.width - overlap
    y_right = y_base - img_right.height

    s_left = create_ground_shadow(img_left.width, height=15, opacity=50)
    s_right = create_ground_shadow(img_right.width, height=16, opacity=55)

    canvas.paste(s_left, (x_left + (img_left.width - s_left.width) // 2, y_base - s_left.height // 2), s_left)
    canvas.paste(s_right, (x_right + (img_right.width - s_right.width) // 2, y_base - s_right.height // 2), s_right)

    canvas.paste(img_left, (x_left, y_left), img_left)
    canvas.paste(img_right, (x_right, y_right), img_right)

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
    canvas.save(out_webp, "WEBP", quality=95)
    print(f"[OK] Generated: {category_id}.webp ({total_w}x{content_h})")

# 1. Dairy, Bread & Eggs -> ONLY TWO BIG PHOTOS: Curd Dahi Cup + Amul Milk Pouch
build_two_pack_collage(
    'dairy-bread-eggs',
    left_file='curd-dahi.png',
    right_file='amul-milk.png',
    left_h=290,
    left_w=220,
    right_h=320,
    right_w=235,
    overlap=40
)

# 2. Ice Creams & Frozen Desserts -> ONLY TWO BIG PHOTOS: Cornetto Cone + Arun Vanilla Tub
build_two_pack_collage(
    'ice-creams',
    left_file='dry-kwality-cornetto-chocolate.webp',
    right_file='dry-arun-vanilla-tub.webp',
    left_h=325,
    left_w=170,
    right_h=280,
    right_w=215,
    overlap=25
)

# 3. Noodles & Instant Food -> ONLY TWO BIG PHOTOS: Maggi 2-Minute Noodles + Kellogg's Corn Flakes Box
build_two_pack_collage(
    'instant-food',
    left_file='maggi-noodles.png',
    right_file='corn-flakes.png',
    left_h=300,
    left_w=200,
    right_h=325,
    right_w=200,
    overlap=30
)

# 4. Biscuits, Cookies & Rusks -> ONLY TWO BIG PHOTOS: Parle-G + Britannia Good Day
build_two_pack_collage(
    'biscuits-bakery',
    left_file='parle-g.png',
    right_file='good-day.png',
    left_h=300,
    left_w=205,
    right_h=315,
    right_w=225,
    overlap=35
)

print("\nSuccessfully updated all 4 collages to clean 2-pack big hero visuals!")
