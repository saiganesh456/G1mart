import urllib.request
import re

req = urllib.request.Request('http://localhost:3000/category/oil-ghee-masala', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Total img tags rendered: {len(imgs)}")
for src in imgs:
    if any(k in src for k in ['saffola', 'dhara', 'gemini', 'sunpure', 'fortune', 'freedom', 'gold-drop', 'amul', 'patanjali', 'ruchi', 'priya', 'grb']):
        print('  ->', src)
