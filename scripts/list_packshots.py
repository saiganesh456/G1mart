import os

packshot_dir = "public/products/packshots"
files = sorted(os.listdir(packshot_dir))
print(f"Total files in {packshot_dir}: {len(files)}")
jpgs = [f for f in files if f.endswith('.jpg')]
pngs = [f for f in files if f.endswith('.png')]
print(f"JPGs: {len(jpgs)}, PNGs: {len(pngs)}")

print("\nAll unique base names in packshots:")
base_names = sorted(set(os.path.splitext(f)[0] for f in files if f.endswith(('.jpg', '.png'))))
for i, b in enumerate(base_names, 1):
    has_jpg = f"{b}.jpg" in files
    has_png = f"{b}.png" in files
    print(f"{i:2d}. {b:<30} (jpg: {has_jpg}, png: {has_png})")
