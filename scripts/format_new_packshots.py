import os
from PIL import Image

def format_image(src, dst_base):
    if not os.path.exists(src):
        print(f"File not found: {src}")
        return
    img = Image.open(src).convert('RGB')
    w, h = img.size
    
    canvas_size = (600, 600)
    target_dim = 540
    scale = min(target_dim / w, target_dim / h)
    nw, nh = int(w * scale), int(h * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGB', canvas_size, (255, 255, 255))
    ox = (canvas_size[0] - nw) // 2
    oy = (canvas_size[1] - nh) // 2
    canvas.paste(resized, (ox, oy))
    
    canvas.save(f"{dst_base}.jpg", 'JPEG', quality=95)
    canvas.save(f"{dst_base}.png", 'PNG')
    print(f"Saved {dst_base}.jpg and .png")

items = [
    ('public/products/packshots/test-corn-flakes.jpg', 'public/products/packshots/corn-flakes'),
    ('public/products/packshots/test-stayfree.jpg', 'public/products/packshots/stayfree'),
    ('public/products/packshots/test-goodknight.jpg', 'public/products/packshots/goodknight'),
    ('public/products/packshots/test-huggies.jpg', 'public/products/packshots/huggies'),
    ('public/products/packshots/test-tamarind.jpg', 'public/products/packshots/tamarind')
]

for src, dst in items:
    format_image(src, dst)
