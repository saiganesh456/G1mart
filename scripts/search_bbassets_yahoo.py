import requests
import re
from urllib.parse import unquote

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

queries = [
    'tamarind bigbasket bbassets.com',
    'bb popular tamarind 500g',
    'nutrela soya chunks bigbasket bbassets',
    'stayfree secure bigbasket bbassets',
    'goodknight flash bigbasket bbassets'
]

for q in queries:
    url = f"https://search.yahoo.com/search?p={requests.utils.quote(q)}"
    r = requests.get(url, headers=headers, timeout=10)
    matches = re.findall(r'(https://www\.bbassets\.com/media/uploads/p/l/[a-zA-Z0-9_\-\.]+)', r.text)
    print(f"\nQuery: {q} -> Found {len(matches)} bbassets matches")
    for m in set(matches):
        print("  ->", m)
