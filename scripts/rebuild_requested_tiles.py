import os
import sys
from PIL import Image, ImageFilter, ImageDraw

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"d:\web-agency-projects\G1mart"
COLLAGES_DIR = os.path.join(BASE_DIR, "public", "categories", "collages")
PACKSHOTS_DIR = os.path.join(BASE_DIR, "public", "products", "packshots")

def create_ground_shadow(width, height=14, opacity=55):
    shadow = Image.new('RGBA', (int(width * 1.25), height * 2 + 10), (0, 0, 0, 0))
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

def process_item(img_path, max_h=270, max_w=200):
    img = Image.open(img_path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    scale = min(max_h / cropped.height, max_w / cropped.width)
    new_w = max(10, int(cropped.width * scale))
    new_h = max(10, int(cropped.height * scale))
    return cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

def build_atta_rice_dal():
    print("Building refined atta-rice-dal collage...")
    # Basmati Rice Bag (left) + Aashirvaad Atta (right) with natural overlap
    rice_path = os.path.join(PACKSHOTS_DIR, "basmati-rice.png")
    atta_path = os.path.join(PACKSHOTS_DIR, "aashirvaad-atta-1kg.png")

    rice = process_item(rice_path, max_h=285, max_w=200)
    atta = process_item(atta_path, max_h=285, max_w=200)

    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 350
    overlap = 35
    total_w = rice.width + atta.width - overlap
    start_x = (400 - total_w) // 2

    x_rice = start_x
    y_rice = y_base - rice.height
    x_atta = x_rice + rice.width - overlap
    y_atta = y_base - atta.height

    s_rice = create_ground_shadow(rice.width, height=14, opacity=55)
    s_atta = create_ground_shadow(atta.width, height=14, opacity=60)

    canvas.paste(s_rice, (x_rice + (rice.width - s_rice.width) // 2, y_base - s_rice.height // 2), s_rice)
    canvas.paste(s_atta, (x_atta + (atta.width - s_atta.width) // 2, y_base - s_atta.height // 2), s_atta)

    canvas.paste(rice, (x_rice, y_rice), rice)
    canvas.paste(atta, (x_atta, y_atta), atta)

    canvas = center_canvas_vertically(canvas)
    out_path = os.path.join(COLLAGES_DIR, "atta-rice-dal.webp")
    canvas.save(out_path, "WEBP", quality=92)
    print(f"  [OK] Saved {out_path} (bbox: {canvas.getbbox()})")

def build_sugar_salt():
    print("Building sugar-salt-staples collage...")
    sugar_path = os.path.join(PACKSHOTS_DIR, "madhur-sugar-clean.png")
    salt_path = os.path.join(PACKSHOTS_DIR, "tata-salt.png")

    sugar = process_item(sugar_path, max_h=280, max_w=190)
    salt = process_item(salt_path, max_h=280, max_w=190)

    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 350
    overlap = 30
    total_w = sugar.width + salt.width - overlap
    start_x = (400 - total_w) // 2

    x_sugar = start_x
    y_sugar = y_base - sugar.height
    x_salt = x_sugar + sugar.width - overlap
    y_salt = y_base - salt.height

    s_sugar = create_ground_shadow(sugar.width, height=14, opacity=55)
    s_salt = create_ground_shadow(salt.width, height=14, opacity=55)

    canvas.paste(s_sugar, (x_sugar + (sugar.width - s_sugar.width) // 2, y_base - s_sugar.height // 2), s_sugar)
    canvas.paste(s_salt, (x_salt + (salt.width - s_salt.width) // 2, y_base - s_salt.height // 2), s_salt)

    canvas.paste(sugar, (x_sugar, y_sugar), sugar)
    canvas.paste(salt, (x_salt, y_salt), salt)

    canvas = center_canvas_vertically(canvas)
    out_path = os.path.join(COLLAGES_DIR, "sugar-salt-staples.webp")
    canvas.save(out_path, "WEBP", quality=92)
    print(f"  [OK] Saved {out_path} (bbox: {canvas.getbbox()})")

def build_soaps():
    print("Building tight clustered soaps-bath collage...")
    # Cinthol (left-back), Santoor (right-back), Dettol (center-front)
    cinthol_path = os.path.join(PACKSHOTS_DIR, "cinthol-clean.png")
    dettol_path = os.path.join(PACKSHOTS_DIR, "dettol-clean.png")
    santoor_path = os.path.join(PACKSHOTS_DIR, "santoor-soap-clean.png")

    cinthol = process_item(cinthol_path, max_h=170, max_w=180)
    santoor = process_item(santoor_path, max_h=175, max_w=180)
    dettol = process_item(dettol_path, max_h=195, max_w=200)

    canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
    y_base = 345

    # Stage positioning: Cinthol on left, Santoor on right, Dettol in center slightly overlapping both
    x_c = 30
    y_c = y_base - cinthol.height - 15  # slightly raised in back

    x_s = 400 - 30 - santoor.width
    y_s = y_base - santoor.height - 15  # slightly raised in back

    x_d = (400 - dettol.width) // 2
    y_d = y_base - dettol.height        # grounded in front

    # Shadows
    s_c = create_ground_shadow(cinthol.width, height=12, opacity=45)
    s_s = create_ground_shadow(santoor.width, height=12, opacity=45)
    s_d = create_ground_shadow(dettol.width, height=14, opacity=65)

    # Paste shadows
    canvas.paste(s_c, (x_c + (cinthol.width - s_c.width) // 2, y_base - 15 - s_c.height // 2), s_c)
    canvas.paste(s_s, (x_s + (santoor.width - s_s.width) // 2, y_base - 15 - s_s.height // 2), s_s)
    canvas.paste(s_d, (x_d + (dettol.width - s_d.width) // 2, y_base - s_d.height // 2), s_d)

    # Paste soaps: left and right in back, Dettol in front
    canvas.paste(cinthol, (x_c, y_c), cinthol)
    canvas.paste(santoor, (x_s, y_s), santoor)
    canvas.paste(dettol, (x_d, y_d), dettol)

    canvas = center_canvas_vertically(canvas)
    out_path = os.path.join(COLLAGES_DIR, "soaps-bath.webp")
    canvas.save(out_path, "WEBP", quality=92)
    print(f"  [OK] Saved {out_path} (bbox: {canvas.getbbox()})")

def main():
    build_atta_rice_dal()
    build_sugar_salt()
    build_soaps()
    print("Requested tiles successfully rebuilt!")

if __name__ == "__main__":
    main()
