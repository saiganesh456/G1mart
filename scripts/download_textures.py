import requests
from PIL import Image
from io import BytesIO

headers = {'User-Agent': 'G1MartApp/1.0 (contact@g1mart.in) python-requests'}

downloads = {
    'raisins': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Raisins_01.jpg',
    'dates': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Dried_dates_-_1.jpg',
    'pumpkin_seeds': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Pepita_de_calabaza.jpg'
}

for name, url in downloads.items():
    print(f"Downloading {name}...")
    r = requests.get(url, headers=headers, timeout=20)
    if r.status_code == 200:
        img = Image.open(BytesIO(r.content))
        img.save(f"scratch_texture_{name}.jpg", "JPEG", quality=90)
        print(f"  Saved scratch_texture_{name}.jpg: {img.size}")
    else:
        print(f"  Failed {name}: {r.status_code}")
