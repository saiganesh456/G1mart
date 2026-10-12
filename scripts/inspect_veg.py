import os
from PIL import Image

BASE_DIR = r"d:\web-agency-projects\G1mart"
veg_path = os.path.join(BASE_DIR, "public", "categories", "collages", "vegetables-fruits.webp")
if os.path.exists(veg_path):
    im = Image.open(veg_path)
    print(f"vegetables-fruits.webp size={im.size} mode={im.mode} bbox={im.getbbox()}")

# Let's search for any produce images in public
for root, dirs, files in os.walk(os.path.join(BASE_DIR, "public")):
    for f in files:
        low = f.lower()
        if any(w in low for w in ['veg', 'onion', 'tomato', 'potato', 'chilli', 'produce', 'fruit']):
            print("Found:", os.path.join(root, f))
