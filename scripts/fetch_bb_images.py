import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_bb_image(pd_id):
    url = f"https://www.bigbasket.com/pd/{pd_id}/"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for image URLs in html or json-ld
            matches = re.findall(r'https://[^\s"\']+(?:bbassets|bigbasket)\.com/media/uploads/p/[^"\']+\.jpg', html)
            if matches:
                # prefer /l/ (large)
                large = [m for m in matches if '/p/l/' in m]
                return large[0] if large else matches[0]
    except Exception as e:
        print(f"Error fetching {pd_id}: {e}")
    return None

test_ids = {
    'patanjali-ghee': '31717',
    'grb-ghee': '252429',
    'sunpure-oil': '274120',
    'priya-gold': '40161823',
    'ruchi-gold': '40018402',
    'aashirvaad-1kg': '30006887',
    'aashirvaad-10kg': '126906',
    'pillsbury-atta': '279434',
    'fortune-atta': '40108343',
    'patanjali-atta': '40099238'
}

for name, pid in test_ids.items():
    img_url = get_bb_image(pid)
    print(f"{name} ({pid}) -> {img_url}")
