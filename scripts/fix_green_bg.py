from PIL import Image
import numpy as np

for fname in ['public/products/packshots/kelloggs-corn-flakes.webp', 'public/products/packshots/quaker-oats.webp']:
    im = Image.open(fname).convert('RGBA')
    arr = np.array(im)
    # The green color from bigbasket chroma is roughly around R: 0-60, G: 120-170, B: 0-60
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    mask = (g > 110) & (r < 70) & (b < 70)
    arr[mask] = [255, 255, 255, 255]
    res = Image.fromarray(arr).convert('RGB')
    res.save(fname, 'WEBP', quality=95)
    print(f"Fixed background for {fname}")
