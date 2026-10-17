import os
from PIL import Image
import numpy as np

pouch_dir = r"D:\web-agency-projects\G1mart\public\products\generated_pouches"
files = [f for f in os.listdir(pouch_dir) if f.endswith(('.webp', '.png', '.jpg'))]

block_packs = []
standup_pouches = []

# In the blocky pack:
# The top edge is flat with stepped lines around y=120..180, and at (x=400, y=140) there are horizontal lines (accordion fold lines).
# Also at bottom, y=850 has black bar or shadow like "tterstock".
# In standup pouch:
# Top has a zipper line and a handle slot (oval cutout at x=400, y=140).

for f in sorted(files):
    p = os.path.join(pouch_dir, f)
    try:
        im = Image.open(p).convert("RGB").resize((800, 800))
        arr = np.array(im)
        # In block pack, y=100..120 at x=400 has texture (R,G,B < 250) because top of box starts at y=100
        # In stand-up pouch, top of pouch starts at y=80 with white cutout or clear plastic, and (100, 100) is pure white
        # Let's check pixel (400, 115) and (300, 115):
        # In block pack, (400, 115) is dark or textured (< 240)
        # Also in block pack, the left slanted side at (190, 400) is white (255), while in stand-up pouch, (210, 400) is white and pouch reaches x=220
        # Let's test (400, 115):
        val_top = arr[115, 400]
        # In block pack, (400, 115) is inside the accordion fold lines: val_top < 240
        # In standup pouch, (400, 115) is white background: val_top >= 250
        if np.mean(val_top) < 230:
            block_packs.append(f)
        else:
            standup_pouches.append(f)
    except Exception as e:
        print(f"Error {f}: {e}")

print("Block packs detected:", block_packs)
print("Standup pouches count:", len(standup_pouches))

