import os
import sys
from PIL import Image, ImageDraw, ImageFilter

def make_local_collage(cutouts, out_path, tint_rgb, canvas_size=(400, 400)):
    w, h = canvas_size
    # Soft rounded rectangle with Blinkit-style tint
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle([0, 0, w, h], radius=64, fill=tint_rgb + (255,))
    
    # 3 photos overlapping layout
    imgs = [Image.open(p).convert("RGBA") for p in cutouts]
    
    # Pouch cutouts layout:
    # Left back (smaller), Right back (smaller), Center front (prominent, largest)
    slots = [
        {'size': 210, 'pos': (25, 60)},   # left back
        {'size': 210, 'pos': (170, 50)},  # right back
        {'size': 250, 'pos': (75, 110)},  # center front
    ]
    
    for idx, img in enumerate(imgs[:3]):
        slot = slots[idx]
        sz = slot['size']
        img_copy = img.copy()
        img_copy.thumbnail((sz, sz), Image.Resampling.LANCZOS)
        
        pos = slot['pos']
        # Soft shadow
        shadow = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
        # Mask from alpha
        shadow_mask = img_copy.split()[3].point(lambda a: int(a * 0.18))
        shadow.paste((0, 0, 0, 140), (pos[0], pos[1] + 12), shadow_mask)
        shadow = shadow.filter(ImageFilter.GaussianBlur(8))
        
        canvas.alpha_composite(shadow)
        canvas.paste(img_copy, pos, img_copy)
        
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path, "WEBP", quality=95, method=6)
    print(f"Generated collage: {out_path} ({os.path.getsize(out_path)} bytes)")

# 1. Local Dals & Pulses
make_local_collage(
    [
        'public/products/generated_pouches/g1_chana_dal_pouch.webp',
        'public/products/generated_pouches/g1_urad_dal_pouch.webp',
        'public/products/generated_pouches/g1_kandi_pappu_pouch.webp',
    ],
    'public/categories/collages/local-dals.webp',
    (254, 243, 199) # soft warm amber
)

# 2. Local Flours & Rava
make_local_collage(
    [
        'public/products/generated_pouches/g1_idli_rava_pouch.webp',
        'public/products/generated_pouches/g1_rice_flour_pouch.webp',
        'public/products/generated_pouches/g1_bansi_rava_pouch.webp',
    ],
    'public/categories/collages/local-flours.webp',
    (254, 249, 195) # soft honey amber
)

# 3. Local Dry Fruits & Nuts
make_local_collage(
    [
        'public/products/generated_pouches/g1_cashews_pouch.webp',
        'public/products/generated_pouches/g1_pista_pouch.webp',
        'public/products/generated_pouches/g1_almonds_pouch.webp',
    ],
    'public/categories/collages/local-dry-fruits.webp',
    (255, 251, 235) # warm cream
)

# 4. Local Millets & Grains
make_local_collage(
    [
        'public/products/generated_pouches/g1_rajma_pouch.webp',
        'public/products/generated_pouches/g1_wheat_grains_pouch.webp',
        'public/products/generated_pouches/g1_korralu_pouch.webp',
    ],
    'public/categories/collages/local-millets.webp',
    (254, 243, 199) # soft amber
)

print("All 4 Local Specials collages generated successfully!")
