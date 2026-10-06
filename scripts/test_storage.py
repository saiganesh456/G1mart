import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

# Minimal 1x1 JPEG bytes
jpeg_bytes = bytes.fromhex("ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffda0008010100003f00bf80ffd9")

upload_url = f"{SUPABASE_URL}/storage/v1/object/product-images/test_probe.jpg"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'image/jpeg',
    'x-upsert': 'true'
}

req = urllib.request.Request(upload_url, data=jpeg_bytes, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as res:
        print("Upload succeeded:", res.status, res.read().decode('utf-8'))
        
        # Test public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/test_probe.jpg"
        probe_req = urllib.request.Request(public_url)
        with urllib.request.urlopen(probe_req, context=ctx) as p_res:
            print("Public probe succeeded:", p_res.status, len(p_res.read()))
except urllib.error.HTTPError as e:
    print("Storage HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Storage Error:", e)
