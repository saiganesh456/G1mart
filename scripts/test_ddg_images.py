import urllib.request
import urllib.parse
import json
import re
import http.cookiejar

cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Referer': 'https://duckduckgo.com/'
}

def get_ddg_token(query):
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': headers['User-Agent']})
    with opener.open(req, timeout=10) as res:
        html = res.read().decode('utf-8')
        m = re.search(r'vqd=([\d-]+)', html)
        if m:
            return m.group(1)
        m2 = re.search(r'vqd="([\d-]+)"', html)
        if m2:
            return m2.group(1)
    return None

token = get_ddg_token("Mysore Sandal soap 75g")
print("DDG vqd token:", token)

if token:
    img_url = f"https://duckduckgo.com/i.js?l=wt-wt&o=json&q={urllib.parse.quote('Mysore Sandal soap 75g')}&vqd={token}"
    req2 = urllib.request.Request(img_url, headers=headers)
    try:
        with opener.open(req2, timeout=10) as res2:
            data = json.loads(res2.read().decode('utf-8'))
            results = data.get('results', [])
            print(f"Results found: {len(results)}")
            for r in results[:5]:
                print("Title:", r.get('title'))
                print("Image:", r.get('image'))
                print("Source:", r.get('url'))
                print("-" * 30)
    except Exception as e:
        print("Error fetching images:", e)
