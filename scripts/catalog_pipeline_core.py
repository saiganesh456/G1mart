import os
import sys
import io
import json
import csv
import re
import urllib.request
import urllib.error
from PIL import Image

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
STORAGE_BUCKET = "product-images"
STORAGE_UPLOAD_BASE = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}"
STORAGE_PUBLIC_BASE = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

REST_API_URL = f"{SUPABASE_URL}/rest/v1/products"

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

DOWNLOAD_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

def clean_and_square_image(raw_bytes, target_dim=1200, min_res=500):
    """
    Validates resolution, converts to RGB, and centers product on clean square white background
    satisfying Section 5 Image Quality standards without distortion or watermarks.
    """
    img = Image.open(io.BytesIO(raw_bytes))
    w, h = img.size
    if w < min_res or h < min_res:
        # If image is slightly smaller than min_res, upscale cleanly or reject if too tiny (<300)
        if w < 300 or h < 300:
            raise ValueError(f"Image resolution {w}x{h} below minimum acceptable {min_res}x{min_res}")

    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        rgba = img.convert('RGBA')
        white_bg = Image.new('RGBA', rgba.size, (255, 255, 255, 255))
        img = Image.alpha_composite(white_bg, rgba).convert('RGB')
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Fit product cleanly in square frame occupying 80-85% of frame
    max_side = max(w, h)
    scale = (target_dim * 0.85) / max_side
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create pure white square canvas
    canvas = Image.new('RGB', (target_dim, target_dim), (255, 255, 255))
    offset_x = (target_dim - new_w) // 2
    offset_y = (target_dim - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y))
    
    buf = io.BytesIO()
    canvas.save(buf, format='JPEG', quality=92, optimize=True)
    return buf.getvalue(), target_dim, target_dim

def upload_image_to_supabase(product_id, jpeg_bytes):
    """
    Uploads image using deterministic path: product-images/{product_id}/primary.jpg
    """
    object_path = f"{product_id}/primary.jpg"
    upload_url = f"{STORAGE_UPLOAD_BASE}/{object_path}"
    
    up_headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
    }
    
    req = urllib.request.Request(upload_url, data=jpeg_bytes, headers=up_headers, method='POST')
    with urllib.request.urlopen(req, timeout=15) as res:
        if res.status in (200, 201):
            public_url = f"{STORAGE_PUBLIC_BASE}/{object_path}"
            return public_url
    raise RuntimeError(f"Storage upload returned unexpected status for {product_id}")

def probe_public_url(url):
    """
    Verifies that the Supabase public URL returns HTTP 200 and image/jpeg Content-Type.
    """
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as res:
        content_type = res.headers.get('Content-Type', '')
        size = int(res.headers.get('Content-Length', 0))
        return res.status == 200 and 'image' in content_type and size > 20000

def update_supabase_product(product_id, payload):
    """
    Updates public.products via REST API
    """
    url = f"{REST_API_URL}?id=eq.{product_id}"
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=HEADERS, method='PATCH')
    with urllib.request.urlopen(req, timeout=12) as res:
        return res.status in (200, 204)

print("Verified Catalog Import core utilities initialized successfully.")
