import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

# Test PostgREST insert
test_product = {
    "id": "test-prod-001",
    "name": "Test Product",
    "brand": "Test Brand",
    "unit": "1 unit",
    "source_item_no": 9999,
    "source_name": "Test Product",
    "in_stock": True,
    "is_active": True,
    "image_status": "NEEDS_REVIEW"
}

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

url = f"{SUPABASE_URL}/rest/v1/products"

req = urllib.request.Request(url, data=json.dumps([test_product]).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as res:
        print("Insert succeeded:", res.status, res.read().decode('utf-8'))
        
        # Now delete test product
        del_req = urllib.request.Request(f"{url}?id=eq.test-prod-001", headers=headers, method='DELETE')
        with urllib.request.urlopen(del_req, context=ctx) as del_res:
            print("Delete succeeded:", del_res.status)
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
