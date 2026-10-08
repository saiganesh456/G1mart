import requests

url = "https://images.openfoodfacts.org/images/products/890/149/136/1026/front_en.51.400.jpg"
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
if r.status_code == 200:
    with open('public/products/packshots/test-kurkure-off.jpg', 'wb') as f:
        f.write(r.content)
    print("Saved test-kurkure-off.jpg")
else:
    print("Failed to download:", r.status_code)
