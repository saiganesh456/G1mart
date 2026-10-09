import os
import json
from PIL import Image, ImageFilter, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COLLAGES_DIR = os.path.join(BASE_DIR, 'public/categories/collages')
VERIFIED_DIR = os.path.join(BASE_DIR, 'public/products/verified')

os.makedirs(COLLAGES_DIR, exist_ok=True)

def create_ground_shadow(width, height=14, opacity=65):
    shadow = Image.new('RGBA', (int(width * 1.3), height * 2 + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    cx, cy = shadow.width // 2, shadow.height // 2
    rx, ry = int(width * 0.42), height // 2
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(15, 20, 25, opacity))
    return shadow.filter(ImageFilter.GaussianBlur(radius=5))

def process_product(pid, max_h=285, max_w=250):
    path = os.path.join(VERIFIED_DIR, f'{pid}.webp')
    if not os.path.exists(path):
        return None
    img = Image.open(path).convert('RGBA')
    bbox = img.getbbox()
    if not bbox:
        return None
    cropped = img.crop(bbox)
    
    # Calculate scale factor
    scale = min(max_h / cropped.height, max_w / cropped.width)
    new_w = max(10, int(cropped.width * scale))
    new_h = max(10, int(cropped.height * scale))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    return resized

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

CATEGORY_CONFIGS = {
    'atta-rice-dal': ['g1-p0440', 'g1-p0428'], # Aashirvaad Atta + Sri Lalitha Idly Rava
    'dairy-bread-eggs': ['g1-p0022', 'g1-p0043'], # Hatsun Curd + Arun Donut
    'biscuits-bakery': ['g1-p0061', 'g1-p0026'], # Good Day + Parle-G
    'sweets-chocolates': ['g1-p0011', 'g1-p0199'], # Cadbury Dairy Milk + Nestle Munch
    'soaps-bath': ['g1-p0122', 'g1-p0023', 'g1-p0007'], # Cinthol + Dettol + Pears
    'sugar-salt-staples': ['g1-p0202', 'g1-p0028'], # Tata Salt + Tata RA Salt
    'drinks-juices': ['g1-p0039', 'g1-p0317'], # Thums Up + Horlicks
    'sauces-spreads': ['g1-p0293', 'g1-p0311'], # Kissan Mixed Fruit Jam + Kissan Fresh Tomato Ketchup
    'laundry-detergents': ['g1-p0036', 'g1-p0332'], # Ariel Power Gel + Surf Excel Easy Wash
    'dishwash': ['g1-p0425', 'g1-p0850'], # Vim Dishwash Bar + Exo Scrubber
    'chips-namkeen': ['g1-p0862'], # Bingo Mad Angles Tomato
    'tea-coffee-milk-drinks': ['g1-p0817'], # Wagh Bakri Tea
    'instant-food': ['g1-p0273'], # Maggi 2-Minute Noodles
    'oil-ghee-masala': ['g1-p0541'], # Aachi Appalam
    'oral-care': ['g1-p0551'], # Colgate Strong Teeth
    'hair-care': ['g1-p0117'], # Parachute Coconut Oil
    'baby-care': ['g1-p0105'], # Huggies Wonder Pants
    'hygiene': ['g1-p0090'], # Stayfree Secure Regular
}

def main():
    print('Generating premium grounded category collages with vertical auto-centering...')
    y_base = 350 # Initial Baseline on a 400x400 canvas

    for cid, pids in CATEGORY_CONFIGS.items():
        canvas = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
        out_path = os.path.join(COLLAGES_DIR, f'{cid}.webp')

        if len(pids) == 1:
            p_img = process_product(pids[0], max_h=300, max_w=320)
            if p_img:
                w, h = p_img.size
                start_x = (400 - w) // 2
                start_y = y_base - h
                shadow = create_ground_shadow(w, height=14, opacity=60)
                sh_x = start_x + (w - shadow.width) // 2
                sh_y = y_base - shadow.height // 2
                canvas.paste(shadow, (sh_x, sh_y), shadow)
                canvas.paste(p_img, (start_x, start_y), p_img)
                canvas = center_canvas_vertically(canvas)
                canvas.save(out_path, 'WEBP', quality=92)
                print(f'  [1 PACK] {cid} -> {out_path}')

        elif len(pids) == 2:
            img1 = process_product(pids[0], max_h=285, max_w=220)
            img2 = process_product(pids[1], max_h=285, max_w=220)
            if img1 and img2:
                w1, h1 = img1.size
                w2, h2 = img2.size
                overlap = min(35, int(min(w1, w2) * 0.25))
                total_w = w1 + w2 - overlap
                start_x = (400 - total_w) // 2

                y1 = y_base - h1
                x1 = start_x
                s1 = create_ground_shadow(w1, height=14, opacity=60)
                sh1_x = x1 + (w1 - s1.width) // 2
                sh1_y = y_base - s1.height // 2

                y2 = y_base - h2
                x2 = start_x + w1 - overlap
                s2 = create_ground_shadow(w2, height=14, opacity=60)
                sh2_x = x2 + (w2 - s2.width) // 2
                sh2_y = y_base - s2.height // 2

                canvas.paste(s1, (sh1_x, sh1_y), s1)
                canvas.paste(s2, (sh2_x, sh2_y), s2)

                canvas.paste(img1, (x1, y1), img1)
                canvas.paste(img2, (x2, y2), img2)

                canvas = center_canvas_vertically(canvas)
                canvas.save(out_path, 'WEBP', quality=92)
                print(f'  [2 PACKS] {cid} -> {out_path}')

        elif len(pids) == 3:
            # For 3 packs like soaps or biscuits, allow slightly wider footprint
            img1 = process_product(pids[0], max_h=250, max_w=150)
            img2 = process_product(pids[1], max_h=265, max_w=160)
            img3 = process_product(pids[2], max_h=250, max_w=150)
            if img1 and img2 and img3:
                w1, h1 = img1.size
                w2, h2 = img2.size
                w3, h3 = img3.size
                overlap = 22
                total_w = w1 + w2 + w3 - (overlap * 2)
                start_x = (400 - total_w) // 2

                x1 = start_x
                y1 = y_base - h1
                s1 = create_ground_shadow(w1, height=12, opacity=55)

                x2 = start_x + w1 - overlap
                y2 = y_base - h2
                s2 = create_ground_shadow(w2, height=14, opacity=65)

                x3 = x2 + w2 - overlap
                y3 = y_base - h3
                s3 = create_ground_shadow(w3, height=12, opacity=55)

                canvas.paste(s1, (x1 + (w1 - s1.width) // 2, y_base - s1.height // 2), s1)
                canvas.paste(s3, (x3 + (w3 - s3.width) // 2, y_base - s3.height // 2), s3)
                canvas.paste(s2, (x2 + (w2 - s2.width) // 2, y_base - s2.height // 2), s2)

                canvas.paste(img1, (x1, y1), img1)
                canvas.paste(img3, (x3, y3), img3)
                canvas.paste(img2, (x2, y2), img2)

                canvas = center_canvas_vertically(canvas)
                canvas.save(out_path, 'WEBP', quality=92)
                print(f'  [3 PACKS] {cid} -> {out_path}')

    print('Collage regeneration finished successfully.')

if __name__ == '__main__':
    main()
