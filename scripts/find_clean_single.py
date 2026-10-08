import urllib.request, urllib.parse, re, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'Mozilla/5.0'}

def search_bing(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
    murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
    if not murls:
        murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
    return list(dict.fromkeys(murls))

targets = [
    "Cadbury 5 Star chocolate bar single white background",
    "Cadbury Dairy Milk single chocolate bar white background amazon",
    "Aashirvaad Shudh Chakki Atta packet white background amazon",
    "Fortune Arhar Dal Toor Dal packet white background"
]

for t in targets:
    res = search_bing(t)
    print(f"\n{t}:")
    for u in res[:4]:
        print(" ", u)
