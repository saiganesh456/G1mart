import urllib.request

routes = ['/', '/search', '/cart', '/login', '/api/location/search']

for r in routes:
    try:
        url = f'http://localhost:3000{r}'
        with urllib.request.urlopen(url, timeout=5) as res:
            print(f"{r} -> {res.status}")
    except urllib.error.HTTPError as e:
        print(f"{r} -> HTTP {e.code}")
    except Exception as e:
        print(f"{r} -> {e}")
