from catalog_pipeline_core import (
    clean_and_square_image,
    upload_image_to_supabase,
    probe_public_url,
    update_supabase_product,
    DOWNLOAD_HEADERS
)
import urllib.request, io
from PIL import Image

test_items = [
    {
        'id': 'g1-prod-071',
        'item_no': 71,
        'url': 'https://pxmshare.colgatepalmolive.com/JPEG_1500/9a9eXWnwNideZ9eOYnTZY.jpg',
        'name': 'Colgate Strong Teeth Dental Paste 100g',
        'mrp': 65.0
    },
    {
        'id': 'g1-prod-101',
        'item_no': 101,
        'url': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/cb58dd86-c522-4a67-8bcb-16d11920115b/Dettol-Antiseptic-Liquid-for-First-Aid-Surface-Disinfection-and-Personal-Hygiene.jpeg',
        'name': 'Dettol Antiseptic Liquid Disinfectant 250ml',
        'mrp': 155.0
    },
    {
        'id': 'g1-prod-460',
        'item_no': 460,
        'url': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/39b0811e-4354-4109-88b7-227d351b971c/Wagh-Bakri-Premium-Leaf-Tea.jpeg',
        'name': 'Wagh Bakri Tea 250g',
        'mrp': 160.0
    }
]

for it in test_items:
    pid = it['id']
    print(f"Testing {pid}...")
    req = urllib.request.Request(it['url'], headers=DOWNLOAD_HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        raw = r.read()
    jpeg_bytes, _, _ = clean_and_square_image(raw, 1200)
    public_url = upload_image_to_supabase(pid, jpeg_bytes)
    print('Uploaded:', public_url)
    ok = probe_public_url(public_url)
    print(f"Probe: ok={ok}")
    if ok:
        db_ok = update_supabase_product(pid, {
            'image_url': public_url,
            'image_status': 'VERIFIED',
            'original_price': it['mrp'],
            'price': None
        })
        print(f"DB update: {db_ok}")
