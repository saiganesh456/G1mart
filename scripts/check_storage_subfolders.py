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

with urllib.request.urlopen(req, context=ctx) as res:
    root_items = json.loads(res.read().decode('utf-8'))

print(f"Total root items: {len(root_items)}")

found_images = {}
for item in root_items:
    name = item.get('name')
    if name.startswith('g1-prod-'):
        # Check inside this folder
        sub_req = urllib.request.Request(list_url, data=json.dumps({"prefix": f"{name}/", "limit": 10}).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(sub_req, context=ctx) as sub_res:
                sub_items = json.loads(sub_res.read().decode('utf-8'))
                for sub in sub_items:
                    pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{name}/{sub.get('name')}"
                    found_images[name] = pub_url
        except Exception as e:
            pass

print(f"Found images for {len(found_images)} products:")
for pid, url in sorted(found_images.items())[:20]:
    print(f"  {pid} -> {url}")
