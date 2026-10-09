import os
import sys
import json
from PIL import Image, ImageDraw, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))

# Soft tinted background colors (Blinkit / Flipkart Minutes palette)
CATEGORY_TINTS = {
    'vegetables-fruits': (240, 253, 244),      # soft emerald
    'atta-rice-dal': (254, 249, 195),          # soft amber/yellow
    'oil-ghee-masala': (254, 243, 199),        # soft warm amber
    'dairy-bread-eggs': (248, 250, 252),       # soft slate blue
    'dry-fruits-cereals': (255, 251, 235),     # warm cream
    'sugar-salt-staples': (241, 245, 249),     # cool neutral
    'chips-namkeen': (254, 243, 199),          # soft gold
    'biscuits-bakery': (254, 249, 195),        # soft honey
    'sweets-chocolates': (254, 243, 199),      # soft caramel
    'drinks-juices': (239, 246, 255),          # fresh sky blue
    'tea-coffee-milk-drinks': (254, 243, 199), # cafe warm
    'instant-food': (255, 251, 235),           # light golden
    'sauces-spreads': (254, 243, 199),         # light peach
    'laundry-detergents': (239, 246, 255),     # crisp sky blue
    'dishwash': (236, 253, 245),               # fresh mint
    'floor-surface-cleaners': (240, 249, 255), # fresh clean blue
    'pooja-needs': (255, 251, 235),            # warm sandalwood
    'kitchenware': (248, 250, 252),            # clean steel
    'soaps-bath': (240, 253, 244),             # bath green
    'oral-care': (239, 246, 255),              # mint blue
    'hair-care': (240, 253, 244),              # herbal green
    'skin-care': (255, 251, 235),              # glow cream
    'baby-care': (240, 253, 244),              # gentle mint
    'hygiene': (236, 253, 245),                # safe clean mint
}

# Clean modern SVG icons for categories with < 3 verified cutouts
CATEGORY_ICONS_SVG = {
    'vegetables-fruits': '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>',
    'atta-rice-dal': '<path d="M2 22 12 12"/><path d="m14 10 3-3a2 2 0 0 0-2.83-2.83L11.3 7.04"/><path d="m8.8 9.5 2.8-2.8"/><path d="m11.6 12.3 2.8-2.8"/><path d="m14.4 15.1 2.8-2.8"/>',
    'oil-ghee-masala': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    'dairy-bread-eggs': '<path d="M8 2h8"/><path d="M9 2v3a3 3 0 0 0 6 0V2"/><path d="M6 9h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"/>',
    'dry-fruits-cereals': '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z"/>',
    'sugar-salt-staples': '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M3 12h18"/>',
    'chips-namkeen': '<path d="M6 3h12l2 18H4L6 3Z"/><path d="M8 8h8"/><path d="M7 13h10"/>',
    'biscuits-bakery': '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
    'sweets-chocolates': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    'drinks-juices': '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
    'tea-coffee-milk-drinks': '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/>',
    'instant-food': '<path d="M3 12a9 9 0 0 0 18 0H3Z"/><path d="M12 3v3"/><path d="m8 4 1 2"/><path d="m16 4-1 2"/>',
    'sauces-spreads': '<path d="M7 2h10l1 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7l1-5Z"/><path d="M6 11h12"/>',
    'laundry-detergents': '<path d="m11 2-2 3h6l-2-3Z"/><rect width="14" height="15" x="5" y="7" rx="3"/><circle cx="12" cy="14" r="3"/>',
    'dishwash': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
    'floor-surface-cleaners': '<path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M12 12v5"/>',
    'pooja-needs': '<path d="M12 2c-4 4-6 8-6 12a6 6 0 0 0 12 0c0-4-2-8-6-12Z"/><path d="M12 18a2 2 0 0 0 2-2c0-1.5-2-4-2-4s-2 2.5-2 4a2 2 0 0 0 2 2Z"/>',
    'kitchenware': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    'soaps-bath': '<rect width="16" height="12" x="4" y="6" rx="4"/><path d="M8 2h8"/>',
    'oral-care': '<path d="m18 2 4 4-14 14H4v-4L18 2Z"/>',
    'hair-care': '<path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9s-9 4.03-9 9a9 9 0 0 0 9 9Z"/><path d="M12 7v10"/><path d="M7 12h10"/>',
    'skin-care': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'baby-care': '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    'hygiene': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
}

def generate_svg_icon_tile(category_id, output_path, tint_rgb):
    """
    Generate clean, modern SVG icon tile with soft tinted rounded square.
    Never shows a stock photo or single boxed product photo.
    """
    r, g, b = tint_rgb
    tint_hex = f"#{r:02x}{g:02x}{b:02x}"
    dark_tint = f"#{max(0, r-35):02x}{max(0, g-35):02x}{max(0, b-35):02x}"
    icon_svg = CATEGORY_ICONS_SVG.get(category_id, '<circle cx="12" cy="12" r="8"/>')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{tint_hex}"/>
      <stop offset="100%" stop-color="{dark_tint}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bgGrad)"/>
  <circle cx="100" cy="100" r="55" fill="#ffffff" opacity="0.6" filter="url(#shadow)"/>
  <g transform="translate(68, 68) scale(2.6)" fill="none" stroke="#2E7D32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    {icon_svg}
  </g>
</svg>'''

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    return output_path

def generate_collage_tile(category_id, verified_cutout_paths, output_path, tint_rgb, canvas_size=(400, 400)):
    """
    Composite verified cut-outs on a soft tinted rounded square:
    - 1 photo: centered & enlarged (~260px)
    - 2 photos: two prominent cutouts side-by-side / overlapping
    - 3+ photos: Blinkit collage (overlapping, largest centre, soft shadow)
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    w, h = canvas_size

    # Create tinted rounded canvas
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle([0, 0, w, h], radius=64, fill=tint_rgb + (255,))

    count = len(verified_cutout_paths)
    if count == 1:
        img = Image.open(verified_cutout_paths[0]).convert("RGBA")
        img.thumbnail((260, 260), Image.Resampling.LANCZOS)
        # Center position
        pos = ((w - img.width) // 2, (h - img.height) // 2)
        # Soft shadow
        shadow = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
        shadow_mask = img.split()[3].point(lambda a: int(a * 0.18))
        shadow.paste((0, 0, 0, 160), (pos[0], pos[1] + 10), shadow_mask)
        shadow = shadow.filter(ImageFilter.GaussianBlur(8))
        canvas.alpha_composite(shadow)
        canvas.paste(img, pos, img)

    elif count == 2:
        imgs = [Image.open(p).convert("RGBA") for p in verified_cutout_paths[:2]]
        slots = [
            {'size': 210, 'pos': (40, 95)},
            {'size': 220, 'pos': (160, 90)},
        ]
        for idx, img in enumerate(imgs):
            slot = slots[idx]
            img.thumbnail((slot['size'], slot['size']), Image.Resampling.LANCZOS)
            pos = slot['pos']
            shadow = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
            shadow_mask = img.split()[3].point(lambda a: int(a * 0.16))
            shadow.paste((0, 0, 0, 150), (pos[0], pos[1] + 8), shadow_mask)
            shadow = shadow.filter(ImageFilter.GaussianBlur(7))
            canvas.alpha_composite(shadow)
            canvas.paste(img, pos, img)

    else:
        # 3 or 4 photos
        imgs = [Image.open(p).convert("RGBA") for p in verified_cutout_paths[:min(4, count)]]
        slots = [
            {'size': 180, 'pos': (30, 55)},
            {'size': 180, 'pos': (190, 45)},
            {'size': 230, 'pos': (85, 125)},
        ]
        if len(imgs) >= 4:
            slots.append({'size': 150, 'pos': (210, 170)})

        for idx, img in enumerate(imgs):
            slot = slots[idx]
            img.thumbnail((slot['size'], slot['size']), Image.Resampling.LANCZOS)
            pos = slot['pos']
            shadow = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
            shadow_mask = img.split()[3].point(lambda a: int(a * 0.15))
            shadow.paste((0, 0, 0, 150), (pos[0], pos[1] + 8), shadow_mask)
            shadow = shadow.filter(ImageFilter.GaussianBlur(6))
            canvas.alpha_composite(shadow)
            canvas.paste(img, pos, img)

    canvas.save(output_path, "WEBP", quality=92, method=6)
    return output_path

def generate_all_category_tiles():
    catalog_path = os.path.join(PROJECT_ROOT, 'data', 'migrated_products.json')
    with open(catalog_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Find verified products per category
    from collections import defaultdict
    verified_by_cat = defaultdict(list)
    for p in products:
        if p.get('image_status') == 'verified' and p.get('image_url'):
            url = p['image_url']
            if url.startswith('/'):
                local_path = os.path.join(PROJECT_ROOT, 'public', url.lstrip('/'))
                if os.path.exists(local_path):
                    c_id = p.get('category') or p.get('category_id')
                    verified_by_cat[c_id].append(local_path)

    out_dir = os.path.join(PROJECT_ROOT, 'public', 'categories', 'collages')
    os.makedirs(out_dir, exist_ok=True)

    summary = []
    all_categories = sorted(CATEGORY_TINTS.keys())

    for cat_id in all_categories:
        verified_imgs = verified_by_cat.get(cat_id, [])
        tint = CATEGORY_TINTS.get(cat_id, (245, 245, 245))

        if len(verified_imgs) >= 1:
            # Composite verified cut-outs
            out_file = os.path.join(out_dir, f"{cat_id}.webp")
            generate_collage_tile(cat_id, verified_imgs, out_file, tint)
            tile_url = f"/categories/collages/{cat_id}.webp"
            tile_type = f"Collage ({len(verified_imgs)} verified photos)"
        else:
            # Clean SVG icon tile (zero photos)
            out_file = os.path.join(out_dir, f"{cat_id}.svg")
            generate_svg_icon_tile(cat_id, out_file, tint)
            tile_url = f"/categories/collages/{cat_id}.svg"
            tile_type = "Clean Icon Tile (0 verified photos)"

        summary.append({
            'category_id': cat_id,
            'tile_url': tile_url,
            'tile_type': tile_type,
            'verified_photos_count': len(verified_imgs)
        })
        print(f"[{cat_id}] -> {tile_url} ({tile_type})")

    # Also export src/data/categoryTiles.json for TypeScript consumption
    json_path = os.path.join(PROJECT_ROOT, 'src', 'data', 'categoryTiles.json')
    tile_map = {item['category_id']: item['tile_url'] for item in summary}
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(tile_map, f, indent=2)

    return summary

if __name__ == "__main__":
    results = generate_all_category_tiles()
    print(f"\nSuccessfully generated {len(results)} category tiles!")
