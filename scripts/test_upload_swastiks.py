import urllib.request
import json
import ssl
import io
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

# 1. Test downloading Swastiks Roasted Vermicelli
url = "https://www.bbassets.com/media/uploads/p/l/40053896_5-swastiks-roasted-vermicelli.jpg"
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as res:
        raw = res.read()
        img = Image.open(io.BytesIO(raw))
        print("Swastiks image downloaded successfully:", img.size, img.format)
        
        # Save to JPEG buffer
        buf = io.BytesIO()
        img.convert('RGB').save(buf, format='JPEG', quality=90)
        jpeg_bytes = buf.getvalue()
        
        # Upload to Supabase Storage
        up_url = f"{SUPABASE_URL}/storage/v1/object/product-images/pdf1-007/primary.jpg"
        up_headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
        }
        up_req = urllib.request.Request(up_url, data=jpeg_bytes, headers=up_headers, method='POST')
        with urllib.request.urlopen(up_req, context=ctx) as up_res:
            print("Uploaded pdf1-007 to Supabase Storage:", up_res.status)
            
            # Verify public access
            pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/pdf1-007/primary.jpg"
            probe_req = urllib.request.Request(pub_url)
            with urllib.request.urlopen(probe_req, context=ctx) as probe_res:
                print("Public URL probe succeeded:", probe_res.status, len(probe_res.read()))
except Exception as e:
    print("Error:", e)
