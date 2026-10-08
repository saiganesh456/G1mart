import urllib.request
import urllib.parse
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

query = 'Aashirvaad Whole Wheat Atta 1kg pack Bigbasket'
req = urllib.request.Request(f'https://duckduckgo.com/?q={urllib.parse.quote(query)}', headers=headers)
try:
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    vqd_match = re.search(r'vqd=([\d-]+)', html) or re.search(r'vqd=["\']([^"\']+)["\']', html)
    vqd = vqd_match.group(1) if vqd_match else None
    print("Found vqd:", vqd)
    if vqd:
        api_url = f"https://duckduckgo.com/i.js?l=in-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}"
        api_req = urllib.request.Request(api_url, headers=headers)
        res = urllib.request.urlopen(api_req, timeout=10).read().decode('utf-8')
        data = json.loads(res)
        results = data.get('results', [])
        print(f"Got {len(results)} images:")
        for r in results[:5]:
            print("URL:", r.get('image'))
            print("TITLE:", r.get('title'))
            print("SOURCE:", r.get('source'))
            print("---")
except Exception as e:
    print("Error:", e)
