import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
url = 'https://www.jiomart.com/search/mysore%20sandal%20soap'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8', errors='ignore')
unescaped = html.replace('\\/', '/')

pixel_imgs = re.findall(r'https://cdn\.pixelbin\.io/[^\s"\'<>]+\.(?:jpg|jpeg|webp|png)', unescaped)
print('Pixelbin URLs found:', len(pixel_imgs))
for p in list(dict.fromkeys(pixel_imgs))[:10]:
    print(' ', p)
