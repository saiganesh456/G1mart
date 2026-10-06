import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

url = env.get('NEXT_PUBLIC_SUPABASE_URL')
key = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

print("Connecting to:", url)
req = urllib.request.Request(
    f"{url}/rest/v1/products?select=id,name,source_item_no,image_url,image_status&limit=100",
    headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    }
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(f"Supabase returned {len(data)} products.")
        if data:
            print("Sample product:", data[0])
except Exception as e:
    print("Error querying Supabase:", e)
