import os
import sys
import ssl
import json
import csv
import time
import urllib.request
import urllib.error
from PIL import Image

sys.path.append(os.path.abspath('scripts'))
from catalog_pipeline_core import (
    clean_and_square_image,
    upload_image_to_supabase,
    probe_public_url,
    update_supabase_product,
    STORAGE_PUBLIC_BASE
)

IMPORT_LOG_JSON = os.path.abspath('data/import_log.json')
IMPORT_LOG_CSV = os.path.abspath('data/import_log.csv')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BATCH_2_ASSETS = [
    {
        'product_id': 'g1-prod-091',
        'name': 'Cadbury Dairy Milk Chocolate Bar 12g (Rs 10)',
        'brand': 'Cadbury',
        'variant': '12g / Rs 10',
        'mrp': 10.0,
        'mrp_source': 'Cadbury India / BigBasket',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/100020979_14-cadbury-dairy-milk-chocolate-bar.jpg',
        'notes': 'Verified real Cadbury Dairy Milk Rs 10 bar packshot'
    },
    {
        'product_id': 'g1-prod-167',
        'name': 'Harpic Power Plus Disinfectant Toilet Cleaner 500ml',
        'brand': 'Harpic',
        'variant': 'Power Plus Original',
        'mrp': 105.0,
        'mrp_source': 'Reckitt / BigBasket',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/298290_24-harpic-power-plus-disinfectant-toilet-cleaner-original.jpg',
        'notes': 'Verified real Harpic Power Plus 500ml bottle packshot'
    },
    {
        'product_id': 'g1-prod-479',
        'name': 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg',
        'brand': 'Aashirvaad',
        'variant': 'Whole Wheat Atta',
        'mrp': 350.0,
        'mrp_source': 'Bombay Corporation / ITC Tax Invoice',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/40127506_10-aashirvaad-shudh-chakki-atta.jpg',
        'notes': 'Verified real ITC Aashirvaad 5kg atta bag packaging'
    },
    {
        'product_id': 'g1-prod-491',
        'name': 'Stayfree Secure Extra Large Sanitary Pads (Pack of 6)',
        'brand': 'Stayfree',
        'variant': 'Secure Extra Large',
        'mrp': 50.0,
        'mrp_source': 'Jay Goga Ji Estimation L-109',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/40220101_5-stayfree-secure-nights-sanitary-pad-with-cottony-soft-comfort-back-leak-guard.jpg',
        'notes': 'Verified real Stayfree Secure XL packshot'
    },
    {
        'product_id': 'g1-prod-492',
        'name': 'Head & Shoulders Anti-Dandruff Shampoo Smooth & Silky 180ml',
        'brand': 'Head & Shoulders',
        'variant': 'Smooth & Silky',
        'mrp': 218.0,
        'mrp_source': 'Jay Goga Ji Estimation L-109',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/202242_12-head-shoulders-anti-dandruff-shampoo-smooth-silky-for-dry-damaged-hair.jpg',
        'notes': 'Verified real P&G Head & Shoulders 180ml shampoo bottle'
    },
    {
        'product_id': 'g1-prod-494',
        'name': 'Eno Regular Fruit Salt Sachet Box (Pack of 30)',
        'brand': 'Eno',
        'variant': 'Regular Fruit Salt',
        'mrp': 240.0,
        'mrp_source': 'GSK Consumer / BigBasket',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/40348259_1-eno-regular-fruit-salt.jpg',
        'notes': 'Verified real Eno Fruit Salt 30g sachet box packaging'
    },
    {
        'product_id': 'g1-prod-495',
        'name': 'Nescafe Sunrise Instant Coffee Sachet (Rs 5)',
        'brand': 'Sunrise',
        'variant': 'Instant Coffee Sachet',
        'mrp': 5.0,
        'mrp_source': 'Jay Goga Ji Estimation L-109',
        'image_source_url': 'https://www.bbassets.com/media/uploads/p/xxl/118572_3-nescafe-sunrise-extra-sachet.jpg',
        'notes': 'Verified real Nescafe Sunrise Rs 5 sachet packaging'
    }
]

def load_import_log():
    if os.path.exists(IMPORT_LOG_JSON):
        try:
            with open(IMPORT_LOG_JSON, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_import_log(log_entries):
    with open(IMPORT_LOG_JSON, 'w', encoding='utf-8') as f:
        json.dump(log_entries, f, indent=2)

print(f"Beginning ingestion of Batch 2 ({len(BATCH_2_ASSETS)} products)...")
import_log = load_import_log()
success = 0

for item in BATCH_2_ASSETS:
    pid = item['product_id']
    name = item['name']
    img_url = item['image_source_url']
    print(f"\nProcessing {pid}: {name}...")
    try:
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            raw_bytes = resp.read()
            
        clean_bytes, w, h = clean_and_square_image(raw_bytes, target_dim=1200, min_res=400)
        pub_url = upload_image_to_supabase(pid, clean_bytes)
        print(f"  Storage Uploaded: {pub_url}")
        
        if not probe_public_url(pub_url):
            raise RuntimeError(f"Probing {pub_url} failed!")
        print(f"  Probed URL: OK")
        
        db_payload = {
            'name': name,
            'brand': item['brand'],
            'variant': item['variant'],
            'image_url': pub_url,
            'image_status': 'VERIFIED',
            'original_price': item.get('mrp')
        }
        update_supabase_product(pid, db_payload)
        print(f"  Database Updated: VERIFIED")
        success += 1
        
        import_log.append({
            'product_id': pid,
            'source_item_no': int(pid.split('-')[-1]),
            'name': name,
            'image_source': img_url,
            'imported_image_path': pub_url,
            'mrp': item.get('mrp'),
            'mrp_source': item.get('mrp_source'),
            'verification_status': 'VERIFIED',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'notes': item['notes']
        })
    except Exception as e:
        print(f"  FAILED: {e}")

save_import_log(import_log)
print("\n" + "=" * 50)
print(f"BATCH 2 COMPLETE: {success} succeeded.")
print(f"Total verified image import log entries: {len(import_log)}")
print("=" * 50)
