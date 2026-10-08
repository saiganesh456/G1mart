import requests
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

urls = [
    'https://www.bigbasket.com/pd/248215/parachute-100-pure-coconut-oil-1-l-pet-jar/',
    'https://www.bigbasket.com/pd/241604/fortune-sunlite-refined-sunflower-oil-840-g/'
]

for u in urls:
    try:
        r = requests.get(u, headers=headers, timeout=10)
        print(f"\n{u} -> Status: {r.status_code}")
        imgs = re.findall(r'(https://[^\s"\'<>]+bbassets\.com/media/uploads/p/[^\s"\'<>]+)', r.text)
        clean_imgs = list(dict.fromkeys(imgs))
        print(f"Images ({len(clean_imgs)}):")
        for img in clean_imgs[:5]:
            print("  ", img)
    except Exception as e:
        print(f"Error {u}: {e}")
