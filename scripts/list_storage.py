import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SUPABASE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co"
SUPABASE_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

list_url = f"{SUPABASE_URL}/storage/v1/object/list/product-images"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

req = urllib.request.Request(list_url, data=json.dumps({"prefix": "", "limit": 100}).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as res:
        data = json.loads(res.read().decode('utf-8'))
        print(f"Total objects in product-images root: {len(data)}")
        for obj in data[:20]:
            print(" ", obj.get('name'))
except Exception as e:
    print("Error listing storage objects:", e)
