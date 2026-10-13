import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

# Let's inspect yellow_moong_dal
base_pouch = Image.open("C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg").convert("RGBA")
w, h = base_pouch.size

# The pouch belly where product sits:
# Let's create an accurate polygon for the pouch window:
# Top line: curve from (285, 350) through (512, 320) to (740, 350)
# Right curve: (740, 350) down to (710, 780), then rounding inward to (550, 920)
# Bottom gusset curve: (550, 920) to (474, 920)
# Left curve: (474, 920) rounding up to (314, 780), up to (285, 350)

mask = Image.new("L", (1024, 1024), 0)
draw = ImageDraw.Draw(mask)

# Generate smooth curved polygon
points = [
    (285, 345),
    (340, 330),
    (420, 320),
    (512, 318),
    (604, 320),
    (684, 330),
    (738, 345),
    (740, 420),
    (738, 550),
    (732, 680),
    (710, 780),
    (660, 860),
    (590, 915),
    (512, 925),
    (434, 915),
    (364, 860),
    (314, 780),
    (292, 680),
    (286, 550),
    (284, 420),
]
draw.polygon(points, fill=255)
# Smooth edges with 3px Gaussian blur
mask = mask.filter(ImageFilter.GaussianBlur(3))
mask.save("scratch_pouch_mask.png")
print("Saved scratch_pouch_mask.png")
