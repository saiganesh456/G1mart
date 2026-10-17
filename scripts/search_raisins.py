import requests
import json

headers = {'User-Agent': 'G1Mart-Bot/1.0'}

def search_wikimedia(query):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': query,
        'gsrnamespace': 6,
        'gsrlimit': 10,
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
            title = page.get('title', '')
            if width > 1000 and ('jpg' in mime or 'png' in mime or 'jpeg' in mime):
                print(f"  [{title}] ({width}px): {url}")

print("=== SULTANAS / RAISINS ===")
search_wikimedia('sultanas pile')
search_wikimedia('raisins white background')
