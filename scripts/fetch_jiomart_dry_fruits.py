import requests
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

r = requests.get('https://www.jiomart.com/catalogsearch/result?q=kismis', headers=headers, timeout=12)
imgs = re.findall(r'(https://[^\s"\'<>]+\.(?:jpg|png|webp|jpeg))', r.text)
print("Total image links in JioMart search:", len(imgs))
for u in list(set(imgs))[:15]:
    if 'product' in u or 'item' in u or 'catalog' in u:
        print("  PROD:", u)
    else:
        print("  OTHER:", u)
