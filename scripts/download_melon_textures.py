import requests
from PIL import Image
from io import BytesIO

headers = {'User-Agent': 'G1MartApp/1.0 (contact@g1mart.in) python-requests'}

downloads = {
    'watermelon_seeds': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Roasted_watermelon_seeds_1.jpg',
    'muskmelon_seeds': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Muskmelon_Seeds.jpg'
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
