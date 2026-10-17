import requests
from PIL import Image
from io import BytesIO

headers = {'User-Agent': 'G1MartApp/1.0 (contact@g1mart.in) python-requests'}
url = 'https://upload.wikimedia.org/wikipedia/commons/1/13/Pile_of_Dried_Dates_at_Barkin_Dogo_Market%2C_Kaduna_North_01.jpg'
r = requests.get(url, headers=headers, timeout=15)
if r.status_code == 200:
    img = Image.open(BytesIO(r.content))
    img.save('scratch_pile_dates.jpg', 'JPEG', quality=90)
    print("Saved scratch_pile_dates.jpg:", img.size)
else:
    print("Failed:", r.status_code)
