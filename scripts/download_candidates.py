import requests

urls = {
    'corn-flakes': 'https://images.openfoodfacts.org/images/products/890/149/900/8183/front_en.14.400.jpg',
    'tamarind': 'https://images.openfoodfacts.org/images/products/890/615/966/0732/front_en.4.400.jpg'
}

for k, u in urls.items():
    r = requests.get(u, headers={'User-Agent': 'Mozilla/5.0'})
    if r.status_code == 200:
        with open(f'public/products/packshots/test-{k}.jpg', 'wb') as f:
            f.write(r.content)
        print(f"Downloaded test-{k}.jpg")
