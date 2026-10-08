import requests
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = 'https://www.jiomart.com/catalogsearch/result?q=aashirvaad+atta'
r = requests.get(url, headers=headers, timeout=15)
text = r.text

print("Status:", r.status_code, "Length:", len(text))

scripts = re.findall(r'<script[^>]*>(.*?)</script>', text, re.DOTALL)
idx = text.find('window.APP_DATA = ')
if idx != -1:
    end_idx = text.find('</script>', idx)
    content = text[idx + len('window.APP_DATA = '):end_idx].strip()
    if content.endswith(';'):
        content = content[:-1]
    print("Around error:", repr(content[468580:468630]))
    try:
        app_data = json.loads(content)
    except Exception as e:
        print("Json error:", e)
        # Maybe undefined or NaN?
        fixed_content = content.replace(':undefined', ':null').replace(':NaN', ':null')
        app_data = json.loads(fixed_content)
        print("Successfully parsed with undefined/NaN fix!")
    catalog = app_data.get('reduxData', {}).get('catalog', {})
    print("Catalog keys:", list(catalog.keys()))
    # Search for aashirvaad occurrences
    matches = [m.start() for m in re.finditer(r'aashirvaad', text, re.IGNORECASE)]
    print(f"Total 'aashirvaad' matches in HTML: {len(matches)}")
    for pos in matches[:5]:
        snippet = text[max(0, pos-100):min(len(text), pos+300)]
        print("SNIPPET:", repr(snippet))
        print("---")
else:
    print("window.APP_DATA not found")


# Also search for img src in HTML
imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', text)
print(f"Total img tags: {len(imgs)}")
for u in imgs[:10]:
    print("IMG:", u)
