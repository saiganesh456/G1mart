import requests
import re
from urllib.parse import unquote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

queries = [
    "Kurkure Masala Munch 85g site:blinkit.com/prn/",
    "Kurkure Masala Munch 75g site:blinkit.com/prn/",
    "Kurkure Namkeen Masala Munch site:zeptonow.com/pn/"
]

for q in queries:
    url = f"https://search.yahoo.com/search?p={requests.utils.quote(q)}"
    r = requests.get(url, headers=headers, timeout=10)
    links = re.findall(r'RU=(https?%3a%2f%2f[^/&]*blinkit\.com[^/&]*)/RK', r.text)
    links += re.findall(r'RU=(https?%3a%2f%2f[^/&]*zeptonow\.com[^/&]*)/RK', r.text)
    print(f"Query: {q}")
    for l in [unquote(x) for x in links][:3]:
        print(" ", l)
