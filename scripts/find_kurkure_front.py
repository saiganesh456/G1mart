import requests
import json
from PIL import Image
from io import BytesIO

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Search OpenFoodFacts for barcodes of Kurkure
# Barcode for Kurkure Masala Munch 85g / 90g is often 8901491101905 or similar
queries = [
    'https://world.openfoodfacts.org/api/v2/search?categories_tags_en=chips-and-fries&brands_tags=kurkure&fields=code,product_name,image_front_url,image_url,selected_images',
    'https://in.openfoodfacts.org/api/v2/search?search_terms=Kurkure+Masala+Munch&fields=code,product_name,image_front_url,image_url,selected_images'
]

for url in queries:
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            print(f"URL: {url} -> {len(prods)} products")
            for p in prods:
                code = p.get('code')
                name = p.get('product_name')
                front = p.get('image_front_url')
                img = p.get('image_url')
                print(f"  [{code}] {name}: front={front} img={img}")
                sel = p.get('selected_images', {}).get('front', {}).get('display', {})
                if sel:
                    print(f"    display images: {sel}")
    except Exception as e:
        print("Error:", e)
