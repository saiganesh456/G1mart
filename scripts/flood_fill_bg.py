from PIL import Image
import numpy as np
from collections import deque

for fname in ['public/products/packshots/kelloggs-corn-flakes.webp', 'public/products/packshots/quaker-oats.webp']:
    im = Image.open(fname).convert('RGB')
    w, h = im.size
    arr = np.array(im)
    
    # Flood fill from corners (0,0), (w-1,0), (0,h-1), (w-1,h-1)
    # The background is green-ish or non-white
    bg_color = arr[0, 0]
    visited = np.zeros((h, w), dtype=bool)
    q = deque([(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)])
    
    for x, y in q:
        visited[y, x] = True
        
    while q:
        cx, cy = q.popleft()
        arr[cy, cx] = [255, 255, 255]
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx]:
                px = arr[ny, nx]
                # If pixel is greenish background (g > r and g > b)
                if int(px[1]) > int(px[0]) + 15 and int(px[1]) > int(px[2]) + 15:
                    visited[ny, nx] = True
                    q.append((nx, ny))
                    
    res = Image.fromarray(arr)
    res.save(fname, 'WEBP', quality=95)
    print(f"Flood filled background for {fname}")
