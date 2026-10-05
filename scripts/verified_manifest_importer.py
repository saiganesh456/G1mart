"""
G1 MART — VERIFIED PRODUCT RESEARCH MANIFEST IMPORTER
=====================================================
Executes the strict 15-rule protocol for ingesting externally verified product research.
Processes ONLY rows marked VERIFIED.
"""

import os
import sys
import io
import json
import csv
import datetime
import urllib.request
import urllib.error
from PIL import Image

sys.path.append(os.path.abspath('scripts'))
from catalog_pipeline_core import (
    clean_and_square_image,
    upload_image_to_supabase,
    probe_public_url,
    update_supabase_product,
    DOWNLOAD_HEADERS,
    STORAGE_PUBLIC_BASE
)

IMPORT_LOG_JSON = os.path.abspath('data/import_log.json')
IMPORT_LOG_CSV = os.path.abspath('data/import_log.csv')
CATALOG_JSON_PATH = os.path.abspath('src/data/products-catalog.json')

def load_import_log():
    if os.path.exists(IMPORT_LOG_JSON):
        try:
            with open(IMPORT_LOG_JSON, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_import_log(log_entries):
    os.makedirs(os.path.dirname(IMPORT_LOG_JSON), exist_ok=True)
    with open(IMPORT_LOG_JSON, 'w', encoding='utf-8') as f:
        json.dump(log_entries, f, indent=2)

    if log_entries:
        fieldnames = ['product_id', 'source_item_no', 'image_source', 'imported_image_path', 'mrp_source', 'verification_status', 'timestamp', 'notes']
        with open(IMPORT_LOG_CSV, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(log_entries)

def import_verified_manifest(manifest_records):
    """
    Ingests verified records according to the 15-rule protocol.
    """
    print("=" * 60)
    print("G1 MART — VERIFIED RESEARCH MANIFEST INGESTION")
    print(f"Timestamp: {datetime.datetime.now(datetime.timezone.utc).isoformat()}")
    print("=" * 60)

    with open(CATALOG_JSON_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    catalog_map = {p.get('sourceItemNo') or p.get('itemNumber'): p for p in catalog}
    import_log = load_import_log()

    summary = {
        'total_submitted': len(manifest_records),
        'verified_processed': 0,
        'skipped_unverified': 0,
        'images_uploaded': 0,
        'rejected_images': 0,
        'db_updated': 0,
        'already_verified_kept': 0
    }

    for record in manifest_records:
        status = (record.get('verification_status') or record.get('image_match_status') or '').strip().upper()
        item_no = record.get('source_item_no') or record.get('item_no')
        if not item_no:
            print(f"[SKIP] Record missing source_item_no: {record}")
            continue

        item_no = int(item_no)
        product_id = record.get('product_id') or f"g1-prod-{item_no:03d}"

        # Only process VERIFIED rows
        if status != 'VERIFIED':
            summary['skipped_unverified'] += 1
            continue

        summary['verified_processed'] += 1
        cat_item = catalog_map.get(item_no)

        # Rule 14: Do not overwrite an existing verified product with another image unless explicitly flagged
        if cat_item and cat_item.get('imageStatus') == 'VERIFIED' and cat_item.get('imageUrl') and not record.get('force_overwrite'):
            print(f"[{item_no:03d}] [KEEP] Product {product_id} already has a verified real image. Skipping overwrite.")
            summary['already_verified_kept'] += 1
            continue

        # Rule 3 & 11: Use MRP only when source is explicitly provided
        mrp = record.get('mrp') or record.get('original_price')
        mrp_source = record.get('mrp_source') or record.get('source') or ''
        has_explicit_mrp_source = bool(mrp_source.strip()) if mrp is not None else False

        # Rule 12: Keep selling price separate; never guess from sales PDF
        selling_price = record.get('selling_price') or record.get('price')

        image_source_url = record.get('image_source_url') or record.get('image_source') or record.get('image_url')

        if not image_source_url:
            print(f"[{item_no:03d}] [REJECT] Missing image source URL for {product_id}")
            summary['rejected_images'] += 1
            continue

        # Rule 4 & 5: Download & validate image
        print(f"[{item_no:03d}] Ingesting {product_id} from {image_source_url[:60]}...")
        try:
            req = urllib.request.Request(image_source_url, headers=DOWNLOAD_HEADERS)
            with urllib.request.urlopen(req, timeout=15) as res:
                content_type = res.headers.get('Content-Type', '')
                raw_bytes = res.read()

            if len(raw_bytes) < 15000:
                raise ValueError(f"Image payload too small ({len(raw_bytes)} bytes). Possible placeholder/icon.")

            img = Image.open(io.BytesIO(raw_bytes))
            if img.width < 500 or img.height < 500:
                raise ValueError(f"Resolution {img.width}x{img.height} below minimum 500x500 standard.")

            # Rule 6: Optimize and square image
            squared_jpeg, tw, th = clean_and_square_image(raw_bytes, target_dim=1200)

            # Rule 7: Upload to Supabase Storage: product-images/{product_id}/primary.jpg
            public_url = upload_image_to_supabase(product_id, squared_jpeg)
            summary['images_uploaded'] += 1

            # Rule 8 & 9: Probe public URL
            if not probe_public_url(public_url):
                raise RuntimeError(f"Uploaded public URL failed HTTP 200 / image validation: {public_url}")

            # Rule 10: Update verified metadata only from manifest
            db_payload = {
                'image_url': public_url,
                'image_status': 'VERIFIED',
                'price': selling_price,
                'is_active': True,
                'active': True
            }

            if record.get('display_name') or record.get('name'):
                db_payload['name'] = record.get('display_name') or record.get('name')
            if record.get('brand'):
                db_payload['brand'] = record.get('brand')
            if record.get('variant'):
                db_payload['variant'] = record.get('variant')
            if record.get('unit'):
                db_payload['unit'] = record.get('unit')
            if record.get('category') or record.get('category_id'):
                db_payload['category_id'] = record.get('category') or record.get('category_id')
            if has_explicit_mrp_source and mrp is not None:
                db_payload['original_price'] = float(mrp)

            db_ok = update_supabase_product(product_id, db_payload)
            if db_ok:
                summary['db_updated'] += 1
                print(f"[{item_no:03d}] [SUCCESS] Database & storage updated for {product_id} (VERIFIED)")
            else:
                print(f"[{item_no:03d}] [WARN] DB update call failed for {product_id}")

            # Update local catalog cache
            if cat_item:
                for k, v in db_payload.items():
                    if k == 'image_url':
                        cat_item['imageUrl'] = v
                        cat_item['image'] = v
                    elif k == 'image_status':
                        cat_item['imageStatus'] = v
                    elif k == 'original_price':
                        cat_item['originalPrice'] = v
                    elif k == 'category_id':
                        cat_item['category'] = v
                    else:
                        cat_item[k] = v

            # Rule 15: Log entry
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            import_log.append({
                'product_id': product_id,
                'source_item_no': item_no,
                'image_source': image_source_url,
                'imported_image_path': f"product-images/{product_id}/primary.jpg",
                'mrp_source': mrp_source if has_explicit_mrp_source else 'AWAITING_EXPLICIT_SOURCE',
                'verification_status': 'VERIFIED',
                'timestamp': now_iso,
                'notes': record.get('notes', '')
            })

        except Exception as e:
            print(f"[{item_no:03d}] [FAIL] Image validation or upload failed for {product_id}: {e}")
            summary['rejected_images'] += 1

    # Save updated catalog and import log
    with open(CATALOG_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2)

    save_import_log(import_log)

    print("\n" + "=" * 60)
    print("INGESTION SUMMARY")
    print("=" * 60)
    for k, v in summary.items():
        print(f"{k:25s}: {v}")
    print("=" * 60)
    return summary

if __name__ == '__main__':
    if len(sys.argv) > 1:
        path = sys.argv[1]
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                if path.endswith('.json'):
                    records = json.load(f)
                else:
                    reader = csv.DictReader(f)
                    records = list(reader)
            import_verified_manifest(records)
        else:
            print(f"Manifest file not found: {path}")
    else:
        print("Ready. Pass a verified manifest path as an argument to ingest.")
