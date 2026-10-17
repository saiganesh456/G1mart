import requests

headers = {'User-Agent': 'G1MartApp/1.0 (contact@g1mart.in) python-requests'}

def search(q):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={requests.utils.quote(q)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|width|mime&format=json"
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        pages = r.json().get('query', {}).get('pages', {})
        for pid, page in pages.items():
            info = page.get('imageinfo', [{}])[0]
            print(f"[{q}] {page.get('title')}: {info.get('url')} ({info.get('width')}px)")

search("dates market pile")
search("dry dates pile")
search("dried dates pile")
search("kurma dates")
