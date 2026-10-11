import json
import subprocess
from PIL import Image
import io

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

kandi_pids = [p['id'] for p in products if 'kandi_pappu' in (p.get('image_url') or '')]

for pid in kandi_pids[:10]:
    p = next(x for x in products if x['id'] == pid)
    res = subprocess.run(['git', 'show', f'7324d70:public/products/verified/{pid}.webp'], capture_output=True)
    if res.stdout:
        im = Image.open(io.BytesIO(res.stdout))
        print(f"{pid}: {p['name']} | size={im.size} bytes={len(res.stdout)}")
