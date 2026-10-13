import os
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PACKSHOTS_DIR = os.path.join(ROOT, 'public', 'products', 'packshots')
VERIFIED_DIR = os.path.join(ROOT, 'public', 'products', 'verified')
COLLAGES_DIR = os.path.join(ROOT, 'public', 'categories', 'collages')
os.makedirs(COLLAGES_DIR, exist_ok=True)

def remove_white_bg(img, threshold=245):
    """Convert solid white background into transparent alpha channel with soft anti-aliased edge."""
    img = img.convert('RGBA')
    datas = img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        # If near-white, make transparent
        if r >= threshold and g >= threshold and b >= threshold:
            new_data.append((255, 255, 255, 0))
        elif r >= threshold - 15 and g >= threshold - 15 and b >= threshold - 15:
            # Soft feathered edge
            fade = int(255 * (1.0 - (min(r, g, b) - (threshold - 15)) / 15.0))
            new_data.append((r, g, b, min(a, fade)))
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

def create_ground_shadow(width, height=14, opacity=55):
    shadow = Image.new('RGBA', (int(width * 1.3), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.44), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=5))

def load_clean_pack(filename, max_h=275, max_w=175):
    p_pack = os.path.join(PACKSHOTS_DIR, filename)
    p_ver = os.path.join(VERIFIED_DIR, filename)

    path = p_pack if os.path.exists(p_pack) else p_ver
    if not os.path.exists(path):
        print(f"File not found: {filename}")
        return None

    img = Image.open(path)
    if img.mode != 'RGBA' or filename.endswith('.jpg') or filename.endswith('.webp'):
        img = remove_white_bg(img)

    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    nw = max(10, int(cropped.width * scale))
    nh = max(10, int(cropped.height * scale))
    return cropped.resize((nw, nh), Image.Resampling.LANCZOS)

def build_collage_2or3(category_id, pack_files):
    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 355

    loaded = []
    for spec in pack_files:
        img = load_clean_pack(spec['file'], spec.get('max_h', 270), spec.get('max_w', 170))
        if img:
            loaded.append(img)

    if len(loaded) == 2:
        img1, img2 = loaded[0], loaded[1]
        overlap = min(30, int(min(img1.width, img2.width) * 0.22))
        total_w = img1.width + img2.width - overlap
        start_x = (400 - total_w) // 2

        x1 = start_x
        y1 = y_base - img1.height
        x2 = x1 + img1.width - overlap
        y2 = y_base - img2.height

        s1 = create_ground_shadow(img1.width, height=14, opacity=50)
        s2 = create_ground_shadow(img2.width, height=14, opacity=55)

        canvas.paste(s1, (x1 + (img1.width - s1.width) // 2, y_base - s1.height // 2), s1)
        canvas.paste(s2, (x2 + (img2.width - s2.width) // 2, y_base - s2.height // 2), s2)

        canvas.paste(img1, (x1, y1), img1)
        canvas.paste(img2, (x2, y2), img2)

    elif len(loaded) == 3:
        img_left, img_mid, img_right = loaded[0], loaded[1], loaded[2]
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

    out_file = os.path.join(COLLAGES_DIR, f"{category_id}.webp")
    canvas.save(out_file, "WEBP", quality=92)
    print(f"[OK] Generated {category_id}.webp (alpha transparency, no white boxes)")

# 1. Dairy, Bread & Eggs (Curd Dahi + Amul Milk + Butter)
build_collage_2or3('dairy-bread-eggs', [
    {'file': 'curd-dahi.png', 'max_h': 260, 'max_w': 160},
    {'file': 'amul-milk.png', 'max_h': 285, 'max_w': 170},
    {'file': 'dry-arokya-toned-milk.webp', 'max_h': 255, 'max_w': 155}
])

# 2. Ice Creams & Frozen Desserts (Arun Chocobar + Arun Ice Cream Tub + Arun Donut)
build_collage_2or3('ice-creams', [
    {'file': 'arun-donut.png', 'max_h': 240, 'max_w': 150},
    {'file': 'arun-icecream.png', 'max_h': 285, 'max_w': 175},
    {'file': 'dry-arun-chocobar.webp', 'max_h': 255, 'max_w': 150}
])

# 3. Instant Food (Maggi Noodles + Corn Flakes + Vermicelli)
build_collage_2or3('instant-food', [
    {'file': 'maggi-noodles.png', 'max_h': 265, 'max_w': 160},
    {'file': 'corn-flakes.png', 'max_h': 285, 'max_w': 175},
    {'file': 'vermicelli.png', 'max_h': 260, 'max_w': 155}
])

# 4. Biscuits & Bakery (Parle-G + Good Day + Britannia Bourbon)
build_collage_2or3('biscuits-bakery', [
    {'file': 'parle-g.png', 'max_h': 265, 'max_w': 160},
    {'file': 'good-day.png', 'max_h': 280, 'max_w': 175},
    {'file': 'britannia-bourbon.png', 'max_h': 260, 'max_w': 160}
])

print("All hero collages regenerated with full alpha transparency!")
