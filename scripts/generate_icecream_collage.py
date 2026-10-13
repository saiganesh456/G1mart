import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT, 'public')
COLLAGES_DIR = os.path.join(PUBLIC_DIR, 'categories', 'collages')
os.makedirs(COLLAGES_DIR, exist_ok=True)

# Sources for composite tile
tringo_path = os.path.join(PUBLIC_DIR, 'products', 'verified', 'dry-arun-tringo.webp')
tub_path = os.path.join(PUBLIC_DIR, 'products', 'verified', 'dry-arun-vanilla-tub.webp')
tricone_path = os.path.join(PUBLIC_DIR, 'products', 'verified', 'dry-amul-tricone-chocolate.webp')
feast_path = os.path.join(PUBLIC_DIR, 'products', 'verified', 'dry-kw-cornetto-butterscotch.webp')

canvas = Image.new('RGB', (800, 800), (255, 245, 247))

sources = [tringo_path, tub_path, tricone_path, feast_path]
positions = [(40, 40), (420, 40), (40, 420), (420, 420)]

for src, pos in zip(sources, positions):
    if os.path.exists(src):
        try:
            im = Image.open(src).convert('RGBA')
            im.thumbnail((340, 340), Image.Resampling.LANCZOS)
            canvas.paste(im, pos, mask=im)
        except Exception as e:
            print("Error pasting:", e)

out_webp = os.path.join(COLLAGES_DIR, 'ice-creams.webp')
canvas.save(out_webp, 'WEBP', quality=90)
print(f"Saved {out_webp}")

# Also save SVG
svg_content = '''<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" rx="32" fill="#FFF1F2"/>
  <text x="200" y="210" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#BE123C" text-anchor="middle">Ice Creams</text>
  <text x="200" y="255" font-family="Arial, sans-serif" font-size="22" fill="#E11D48" text-anchor="middle">&amp; Frozen Desserts</text>
</svg>'''
with open(os.path.join(COLLAGES_DIR, 'ice-creams.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_content)
print("Saved ice-creams.svg")
