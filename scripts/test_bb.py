import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def get_bb_img(pid):
    url = f"https://www.bigbasket.com/pd/{pid}/"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            m = re.findall(r'https://www\.bbassets\.com/media/uploads/p/[^"\'\s]+\.jpg', html)
            return list(dict.fromkeys(m))
    except Exception as e:
        return [str(e)]

pids = {
    'Tata Salt 1kg': 241600,
    'Aashirvaad Salt 1kg': 236834,
    'Madhur Sugar 1kg': 244096,
    'Parrys Sugar 1kg': 40004538,
    'Catch Table Salt 200g': 10000404,
    'Dabur Honey 500g': 10000207,
    'Sugar Free Gold 100 pellets': 10000414,
    '24 Mantra Jaggery 500g': 40018532,
    'Tata Salt Lite 1kg': 100263622,
    'Tata Rock Salt 1kg': 40169971,
    'Lion Honey 500g': 274145,
    'Patanjali Honey 500g': 40016666,
    'Puro Salt 1kg': 40182432,
    'Trust Classic Sugar 1kg': 40122233
}

for name, pid in pids.items():
    imgs = get_bb_img(pid)
    print(f"{name} ({pid}): {len(imgs)} images")
    if imgs and imgs[0].startswith('http'):
        print(f"   --> {imgs[0]}")
