import os
import requests
from PIL import Image
from io import BytesIO

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

test_downloads = {
    'cadbury-5-star': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/ac3f68dc-cf78-4448-801c-b5e21cc2d458/Cadbury-5-Star-Chocolatey-Bar.jpg',
    'cadbury-dairy-milk': 'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1100-1100,pr-true,f-auto,q-40,dpr-2/cms/product_variant/7ebd0461-c4a2-40fa-8736-3568f830051c/Cadbury-Dairy-Milk-Chocolate-Bar-Pack.jpg',
    'aashirvaad-atta': 'https://www.bigbasket.com/media/uploads/p/l/40127506_7-aashirvaad-shudh-chakki-atta.jpg',
    'turmeric-powder': 'https://www.bbassets.com/media/uploads/p/l/40095122_18-tata-sampann-turmeric-powder.jpg',
    'toor-dal': 'https://www.bbassets.com/media/uploads/p/l/40293855_1-fortune-arhartoor-dal-unpolished-sortex-cleaned.jpg'
}

for name, url in test_downloads.items():
    try:
        r = requests.get(url, headers=headers, timeout=8)
        if r.status_code == 200:
            img = Image.open(BytesIO(r.content)).convert('RGB')
            # Fit onto 600x600 white canvas
            w, h = img.size
            scale = min(520 / w, 520 / h)
            new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            canvas = Image.new('RGB', (600, 600), (255, 255, 255))
            canvas.paste(resized, ((600 - new_w) // 2, (600 - new_h) // 2))
            
            # Save JPG
            canvas.save(f"public/products/packshots/{name}.jpg", "JPEG", quality=95)
            # Save PNG
            canvas.save(f"public/products/packshots/{name}.png", "PNG")
            print(f"Saved {name}: {canvas.size}")
        else:
            print(f"Failed {name}: {r.status_code}")
    except Exception as e:
        print(f"Error {name}: {e}")
