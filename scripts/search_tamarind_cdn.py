import requests
import re
from urllib.parse import unquote

headers = {'User-Agent': 'Mozilla/5.0'}

queries = [
    'tamarind site:cdn.zeptonow.com',
    'imli site:cdn.zeptonow.com',
    'tamarind site:cdn.grofers.com',
    'tamarind paste bigbasket'
]

for q in queries:
    url = f"https://search.yahoo.com/search?p={requests.utils.quote(q)}"
    r = requests.get(url, headers=headers)
    z_imgs = re.findall(r'(https://cdn\.zeptonow\.com/production/[^"\'\s&]+)', r.text)
    b_imgs = re.findall(r'(https://cdn\.grofers\.com/[^"\'\s&]+)', r.text)
    print(f"Query: {q} -> Zepto: {len(z_imgs)}, Blinkit: {len(b_imgs)}")
    for img in (z_imgs + b_imgs)[:3]:
        print("  ->", img)
