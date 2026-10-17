import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'G1Mart-Bot/1.0'}

def search_wikimedia(query):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': query,
        'gsrnamespace': 6, # file namespace
        'gsrlimit': 5,
        'prop': 'imageinfo',
        'iiprop': 'url|mime|size',
        'format': 'json'
    }
    r = requests.get(url, params=params, headers=headers, timeout=10)
    if r.status_code == 200:
        pages = r.json().get('query', {}).get('pages', {})
        for pid, page in pages.items():
            info = page.get('imageinfo', [{}])[0]
            url = info.get('url')
            mime = info.get('mime')
            width = info.get('width', 0)
            if width > 800 and ('jpg' in mime or 'png' in mime or 'jpeg' in mime):
                print(f"  [{query}] ({width}px): {url}")
                return url
    return None

queries = ['golden raisins', 'dry dates', 'pumpkin seeds', 'watermelon seeds', 'muskmelon seeds']

for q in queries:
    search_wikimedia(q)
