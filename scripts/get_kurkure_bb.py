import requests
import re
from urllib.parse import unquote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

q = "Kurkure Namkeen Masala Munch bigbasket"
url = f"https://search.yahoo.com/search?p={requests.utils.quote(q)}"
r = requests.get(url, headers=headers, timeout=10)
matches = re.findall(r'RU=(https?%3a%2f%2f[^/&]*bigbasket\.com[^/&]*)/RK', r.text)
cleaned = [unquote(m) for m in matches if '/pd/' in unquote(m)]
print("BB links:", cleaned)

if cleaned:
    bb_url = cleaned[0]
    print("Fetching BB page:", bb_url)
    r2 = requests.get(bb_url, headers=headers, timeout=10)
    print("Page status:", r2.status_code)
    # Find bbassets images in html
    imgs = re.findall(r'https://www\.bbassets\.com/media/uploads/p/l/[^"\']+', r2.text)
    print("Found images:", len(imgs))
    for img in sorted(set(imgs)):
        print("  ->", img)
