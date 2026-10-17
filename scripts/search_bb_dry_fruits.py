import requests
import re
from PIL import Image
from io import BytesIO

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

def search_bb(query):
    url = f"https://html.duckduckgo.com/html/?q=site:bigbasket.com+{requests.utils.quote(query)}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        # Find BB product urls
        links = re.findall(r'href="([^"]*bigbasket\.com/pd/[^"]*)"', r.text)
        print(f"Query: {query} -> Found {len(links)} BB product links")
        for l in links[:3]:
            # Clean DDG redirect if present
            if 'uddg=' in l:
                l = requests.utils.unquote(l.split('uddg=')[1].split('&')[0])
            print("  Visiting BB product:", l)
            pr = requests.get(l, headers=headers, timeout=10)
            # Find image in meta or html
            bb_imgs = re.findall(r'(https://[^\s"\'<>]*(?:bbassets|bigbasket)\.com/media/uploads/p/[^\s"\'<>]+\.(?:jpg|webp|jpeg))', pr.text)
            if bb_imgs:
                print("    Image found:", bb_imgs[0])
                return bb_imgs[0]
    except Exception as e:
        print("Error:", e)
    return None

queries = ['dry dates 500g', 'golden raisins kismis', 'raw pumpkin seeds', 'watermelon seeds 200g', 'muskmelon seeds 200g']
results = {}
for q in queries:
    img = search_bb(q)
    if img:
        results[q] = img

print("\nFinal Results:", results)
