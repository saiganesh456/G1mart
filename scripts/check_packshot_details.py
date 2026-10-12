import os
from PIL import Image

BASE_DIR = r"d:\web-agency-projects\G1mart"
PACKSHOTS_DIR = os.path.join(BASE_DIR, "public", "products", "packshots")

files = os.listdir(PACKSHOTS_DIR)
print(f"Total files in packshots: {len(files)}")
pngs = [f for f in files if f.endswith('.png')]
print(f"PNG files: {len(pngs)}")

for f in pngs[:25]:
    p = os.path.join(PACKSHOTS_DIR, f)
    try:
        im = Image.open(p)
        print(f"{f:<30} size={im.size} mode={im.mode}")
    except Exception as e:
        print(f"{f}: {e}")
