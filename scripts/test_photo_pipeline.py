import os
import sys
import json
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.join(os.path.dirname(__file__)))
sys.path.append(os.path.join(os.path.dirname(__file__), 'photo_pipeline'))

# 1. Create 3 test photos for 3 actual product IDs
test_folder = "test_photos"
os.makedirs(test_folder, exist_ok=True)

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Pick 3 missing products
test_products = [p for p in products if p.get('image_status') == 'missing'][:3]
print("Selected 3 test products:")
for p in test_products:
    print(f"  - {p['id']}: {p['name']} ({p['brand']})")

test_files = []
colors = [(220, 50, 50), (46, 125, 50), (30, 100, 220)]

for idx, p in enumerate(test_products):
    # Create a realistic test image with non-square size (e.g. 640x480) with a colored product bottle/box on a neutral background
    img = Image.new("RGB", (640, 480), (245, 245, 245))
    draw = ImageDraw.Draw(img)
    # Draw product box in center
    draw.rounded_rectangle([220, 90, 420, 390], radius=15, fill=colors[idx], outline=(30, 30, 30), width=3)
    # Add brand / label bar
    draw.rectangle([230, 200, 410, 280], fill=(255, 255, 255))
    
    file_path = os.path.join(test_folder, f"{p['id']}.jpg")
    img.save(file_path, "JPEG", quality=95)
    test_files.append((p['id'], file_path))

print(f"Created {len(test_files)} test phone photos in {test_folder}/")

# 2. Run bulk_import_photos
from photo_pipeline.bulk_import_photos import bulk_import

imported = bulk_import(test_folder, output_dir="public/products/verified")
print(f"Bulk import result: {imported} photos processed.")

# 3. Verify output files
assert imported == 3, f"Expected 3 imported photos, got {imported}"

for pid, _ in test_files:
    out_path = os.path.join("public", "products", "verified", f"{pid}.webp")
    assert os.path.exists(out_path), f"Output WebP not found at {out_path}"
    
    # Check image size and format
    out_img = Image.open(out_path)
    assert out_img.size == (800, 800), f"Expected 800x800, got {out_img.size}"
    assert out_img.format == "WEBP", f"Expected WEBP format, got {out_img.format}"
    print(f"✓ Verified {out_path}: {out_img.format} {out_img.size} {out_img.mode}")

# 4. Check catalog entry
with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    updated_catalog = json.load(f)

for pid, _ in test_files:
    item = next(x for x in updated_catalog if x['id'] == pid)
    assert item['image_status'] == 'verified', f"Expected verified, got {item['image_status']}"
    assert item['image_url'] == f"/products/verified/{pid}.webp"
    print(f"✓ Catalog verified for {pid}: image_url={item['image_url']}, status={item['image_status']}, source={item['image_source']}")

print("\nALL 3 TEST PHOTOS PROCESSED AND VERIFIED END-TO-END SUCCESSFULLY!")
