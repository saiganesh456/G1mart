import os
import sys
import json
import argparse
from pathlib import Path
try:
    from photo_pipeline.image_processor import process_product_image
except ImportError:
    from image_processor import process_product_image

sys.stdout.reconfigure(encoding='utf-8')

def bulk_import(input_folder, output_dir="public/products/verified", catalog_path="data/migrated_products.json"):
    """
    Import a folder of phone photos named <product_id>.jpg or <barcode>.jpg.
    Processes with rembg, centers on transparent 800x800 canvas, exports as <product_id>.webp.
    Updates catalog with image_status='verified', image_source='store_camera', image_license='Proprietary'.
    """
    input_p = Path(input_folder)
    if not input_p.exists():
        print(f"Error: input folder does not exist: {input_folder}")
        return 0

    with open(catalog_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    prod_by_id = {p['id']: p for p in products}
    prod_by_barcode = {p['barcode']: p for p in products if p.get('barcode')}

    supported_exts = {'.jpg', '.jpeg', '.png', '.webp'}
    imported_count = 0

    for file_path in input_p.iterdir():
        if not file_path.is_file() or file_path.suffix.lower() not in supported_exts:
            continue

        stem = file_path.stem.strip()
        matched_product = None

        # Check by product_id
        if stem in prod_by_id:
            matched_product = prod_by_id[stem]
        # Check by barcode
        elif stem in prod_by_barcode:
            matched_product = prod_by_barcode[stem]

        if not matched_product:
            print(f"Skipping {file_path.name}: No matching product ID or barcode in catalog.")
            continue

        pid = matched_product['id']
        out_webp_path = os.path.join(output_dir, f"{pid}.webp")
        print(f"Processing photo for {pid} ({matched_product['name']})...")

        try:
            process_product_image(str(file_path), out_webp_path)
            
            # Update product in catalog
            matched_product['image_url'] = f"/products/verified/{pid}.webp"
            matched_product['image_status'] = 'verified'
            matched_product['image_source'] = 'store_camera'
            matched_product['image_license'] = 'Proprietary / G1 Mart'
            imported_count += 1
            print(f"  ✓ Published {out_webp_path}")
        except Exception as e:
            print(f"  ✗ Error processing {file_path.name}: {e}")

    # Save catalog updates
    if imported_count > 0:
        with open(catalog_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2)
        print(f"\nSuccessfully imported and updated {imported_count} products in {catalog_path}")
    else:
        print("\nNo matching photos processed.")

    return imported_count

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bulk import phone photos for G1 Mart catalog")
    parser.add_argument("--input-dir", required=True, help="Directory containing photos (<product_id>.jpg or <barcode>.jpg)")
    parser.add_argument("--output-dir", default="public/products/verified", help="Destination folder for 800x800 WebP cutouts")
    args = parser.parse_args()

    bulk_import(args.input_dir, args.output_dir)
