import requests
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

r = requests.get('https://www.jiomart.com/p/groceries/aashirvaad-superior-mp-atta-1-kg/490000038', headers=headers, timeout=10)
print("Status:", r.status_code, "Length:", len(r.text))

# Search for images
images = re.findall(r'https://www\.jiomart\.com/images/product/original/[^\s"\'<>]+\.(?:jpg|png|webp|jpeg)', r.text)
print("JioMart original images:", len(images))
for img in images[:5]:
    print("IMG:", img)

images2 = re.findall(r'https://[^\s"\'<>]+\.jiomartjcp\.com/[^\s"\'<>]+\.(?:jpg|png|webp|jpeg)', r.text)
print("Jiomartjcp images:", len(images2))
for img in images2[:5]:
    print("JCP IMG:", img)

meta_img = re.findall(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', r.text)
print("og:image:", meta_img)
meta_img2 = re.findall(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', r.text)
print("og:image 2:", meta_img2)
