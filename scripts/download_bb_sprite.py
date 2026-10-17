import requests
from PIL import Image
import io
import os

urls = {
    '250ml': [
        'https://www.bbassets.com/media/uploads/p/xxl/412110_1-sprite-soft-drink.jpg',
        'https://www.bbassets.com/media/uploads/p/l/412110_1-sprite-soft-drink.jpg'
    ],
    '750ml': [
        'https://www.bbassets.com/media/uploads/p/xxl/251006_17-sprite-soft-drink-lime-flavoured.jpg',
        'https://www.bbassets.com/media/uploads/p/l/251006_17-sprite-soft-drink-lime-flavoured.jpg'
    ],
    '1l': [
        'https://www.bbassets.com/media/uploads/p/xxl/40204143_1-sprite-sprite.jpg',
        'https://www.bbassets.com/media/uploads/p/xl/40204143_1-sprite-sprite.jpg'
    ],
    '2l': [
        'https://www.bbassets.com/media/uploads/p/xxl/412137_1-sprite-soft-drink.jpg',
        'https://www.bbassets.com/media/uploads/p/l/412137_1-sprite-soft-drink.jpg'
    ]
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
scratch_dir = r'C:\Users\gumma\.gemini\antigravity\brain\97272b73-8869-4743-ba4d-dd618953a077\scratch'

for key, url_list in urls.items():
    success = False
    for u in url_list:
        try:
            r = requests.get(u, headers=headers, timeout=10)
            if r.status_code == 200 and len(r.content) > 1000:
                img = Image.open(io.BytesIO(r.content)).convert('RGB')
                out_path = os.path.join(scratch_dir, f'sprite_bb_{key}.jpg')
                img.save(out_path)
                print(f"Downloaded {key} successfully from {u}: size {img.size}")
                success = True
                break
        except Exception as e:
            print(f"Failed {u}: {e}")
    if not success:
        print(f"FAILED to download {key}")
