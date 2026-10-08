import requests
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = 'https://html.duckduckgo.com/html/?q=Aashirvaad+Whole+Wheat+Atta+1kg+pack'
r = requests.get(url, headers=headers, timeout=10)
print("Status:", r.status_code, "Length:", len(r.text))

links = re.findall(r'<a class="result__url"[^>]*href="([^"]+)"', r.text)
print("Result links:", len(links))
for l in links[:5]:
    print("Link:", l)
