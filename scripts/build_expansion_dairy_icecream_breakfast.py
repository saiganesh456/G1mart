import os
import json
import urllib.request
import urllib.parse
import re
import ssl
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from io import BytesIO

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_IMG_DIR = os.path.join(ROOT, 'public', 'products', 'verified')
os.makedirs(PUBLIC_IMG_DIR, exist_ok=True)

# 1. NEW ITEMS LIST
NEW_ITEMS = [
    # --- DAIRY (Nellore / AP Staples) ---
    {
        "id": "g1-dry053",
        "name": "Arokya Toned Fresh Milk Pouch (500 ml)",
        "brand": "Arokya",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 30,
        "price": 30,
        "pack_size_desc": "500 ml",
        "rating": 4.8,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Arokya Toned Milk 500ml pouch transparent packshot",
        "img_filename": "dry-arokya-toned-milk.webp"
    },
    {
        "id": "g1-dry054",
        "name": "Arokya Standardized / Full Cream Milk Pouch (500 ml)",
        "brand": "Arokya",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 37,
        "price": 37,
        "pack_size_desc": "500 ml",
        "rating": 4.8,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Arokya Standardised Milk 500ml pouch packshot",
        "img_filename": "dry-arokya-full-cream-milk.webp"
    },
    {
        "id": "g1-dry055",
        "name": "Arokya Fresh Curd Pouch (450 g)",
        "brand": "Arokya",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 35,
        "price": 35,
        "pack_size_desc": "450 g",
        "rating": 4.7,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arokya Curd 450g pouch packshot",
        "img_filename": "dry-arokya-curd-450g.webp"
    },
    {
        "id": "g1-dry056",
        "name": "Arokya Spiced Buttermilk Pouch (200 ml)",
        "brand": "Arokya",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Chilled Beverages & Lassi",
        "mrp": 12,
        "price": 12,
        "pack_size_desc": "200 ml",
        "rating": 4.7,
        "stock": 60,
        "is_in_stock": True,
        "search_query": "Arokya Spiced Buttermilk pouch 200ml",
        "img_filename": "dry-arokya-buttermilk.webp"
    },
    {
        "id": "g1-dry057",
        "name": "Heritage Fresh Curd Pouch (200 g)",
        "brand": "Heritage",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 15,
        "price": 15,
        "pack_size_desc": "200 g",
        "rating": 4.8,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Heritage Fresh Curd 200g pouch packshot",
        "img_filename": "dry-heritage-curd-200g.webp"
    },
    {
        "id": "g1-dry058",
        "name": "Heritage Fresh Thick Curd Pouch (1 kg)",
        "brand": "Heritage",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 72,
        "price": 72,
        "pack_size_desc": "1 kg",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Heritage Fresh Curd 1kg pouch packshot",
        "img_filename": "dry-heritage-curd-1kg.webp"
    },
    {
        "id": "g1-dry059",
        "name": "Dodla Dairy Fresh Curd Pouch (450 g)",
        "brand": "Dodla",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 35,
        "price": 35,
        "pack_size_desc": "450 g",
        "rating": 4.7,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Dodla Fresh Curd 450g pouch packshot",
        "img_filename": "dry-dodla-curd-450g.webp"
    },
    {
        "id": "g1-dry060",
        "name": "Dodla Spiced Buttermilk (Majjiga) Pouch (200 ml)",
        "brand": "Dodla",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Chilled Beverages & Lassi",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "200 ml",
        "rating": 4.7,
        "stock": 60,
        "is_in_stock": True,
        "search_query": "Dodla Spiced Butter Milk 200ml pouch packshot",
        "img_filename": "dry-dodla-buttermilk.webp"
    },
    {
        "id": "g1-dry061",
        "name": "Amul Taaza Homogenised Toned Milk Pouch (500 ml)",
        "brand": "Amul",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 28,
        "price": 28,
        "pack_size_desc": "500 ml",
        "rating": 4.8,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Amul Taaza Toned Milk 500ml pouch packshot",
        "img_filename": "dry-amul-taaza-pouch.webp"
    },
    {
        "id": "g1-dry062",
        "name": "Amul Gold Full Cream Milk Pouch (500 ml)",
        "brand": "Amul",
        "category_id": "dairy-bread-eggs",
        "sub_category": "Fresh Milk & Curd",
        "mrp": 34,
        "price": 34,
        "pack_size_desc": "500 ml",
        "rating": 4.8,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Amul Gold Milk 500ml pouch packshot",
        "img_filename": "dry-amul-gold-pouch.webp"
    },

    # --- ARUN ICECREAMS (Expanded Range for Nellore / AP) ---
    {
        "id": "g1-ice001",
        "name": "Arun Icecreams Classic Vanilla Ice Cream Cone",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cones & Sundaes",
        "mrp": 30,
        "price": 30,
        "pack_size_desc": "110 ml",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Vanilla Cone packshot",
        "img_filename": "ice-arun-vanilla-cone.webp"
    },
    {
        "id": "g1-ice002",
        "name": "Arun Icecreams Rich Chocolate Ice Cream Cone",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cones & Sundaes",
        "mrp": 35,
        "price": 35,
        "pack_size_desc": "110 ml",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Chocolate Cone packshot",
        "img_filename": "ice-arun-chocolate-cone.webp"
    },
    {
        "id": "g1-ice003",
        "name": "Arun Icecreams Butterscotch Ice Cream Cone",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cones & Sundaes",
        "mrp": 35,
        "price": 35,
        "pack_size_desc": "110 ml",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Butterscotch Cone packshot",
        "img_filename": "ice-arun-butterscotch-cone.webp"
    },
    {
        "id": "g1-ice004",
        "name": "Arun Icecreams Blackcurrant Ice Cream Cone",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cones & Sundaes",
        "mrp": 40,
        "price": 40,
        "pack_size_desc": "110 ml",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Blackcurrant Cone packshot",
        "img_filename": "ice-arun-blackcurrant-cone.webp"
    },
    {
        "id": "g1-ice005",
        "name": "Arun Icecreams Jumbo Chocolate Ice Cream Cone",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cones & Sundaes",
        "mrp": 50,
        "price": 50,
        "pack_size_desc": "140 ml",
        "rating": 4.9,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Jumbo Cone packshot",
        "img_filename": "ice-arun-jumbo-cone.webp"
    },
    {
        "id": "g1-ice006",
        "name": "Arun Icecreams Creamy Vanilla Ice Cream Cup (100 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cups & Kulfi Treats",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "100 ml",
        "rating": 4.7,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Vanilla Cup 100ml packshot",
        "img_filename": "ice-arun-vanilla-cup.webp"
    },
    {
        "id": "g1-ice007",
        "name": "Arun Icecreams Strawberry Ice Cream Cup (100 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cups & Kulfi Treats",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "100 ml",
        "rating": 4.7,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Strawberry Cup 100ml packshot",
        "img_filename": "ice-arun-strawberry-cup.webp"
    },
    {
        "id": "g1-ice008",
        "name": "Arun Icecreams Rich Chocolate Ice Cream Cup (100 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cups & Kulfi Treats",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "100 ml",
        "rating": 4.8,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Chocolate Cup 100ml packshot",
        "img_filename": "ice-arun-chocolate-cup.webp"
    },
    {
        "id": "g1-ice009",
        "name": "Arun Icecreams Butterscotch Ice Cream Cup (100 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cups & Kulfi Treats",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "100 ml",
        "rating": 4.8,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Butterscotch Cup 100ml packshot",
        "img_filename": "ice-arun-butterscotch-cup.webp"
    },
    {
        "id": "g1-ice010",
        "name": "Arun Icecreams Mango Duet Ice Cream Cup (100 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cups & Kulfi Treats",
        "mrp": 25,
        "price": 25,
        "pack_size_desc": "100 ml",
        "rating": 4.7,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Mango Duo Cup packshot",
        "img_filename": "ice-arun-mango-cup.webp"
    },
    {
        "id": "g1-ice011",
        "name": "Arun Icecreams Big Chocobar Crunchy Ice Cream Bar",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Arun Icecreams Sticks & Bars",
        "mrp": 30,
        "price": 30,
        "pack_size_desc": "70 ml",
        "rating": 4.8,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Chocobar XL packshot",
        "img_filename": "ice-arun-big-chocobar.webp"
    },
    {
        "id": "g1-ice012",
        "name": "Arun Icecreams iBar Belgian Almond Crunch Stick",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Arun Icecreams Sticks & Bars",
        "mrp": 40,
        "price": 40,
        "pack_size_desc": "70 ml",
        "rating": 4.9,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams iBar Belgian Almond packshot",
        "img_filename": "ice-arun-ibar-almond.webp"
    },
    {
        "id": "g1-ice013",
        "name": "Arun Icecreams Spiral Twister Ice Cream Bar",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Arun Icecreams Sticks & Bars",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "60 ml",
        "rating": 4.7,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Spiral Bar packshot",
        "img_filename": "ice-arun-spiral-twister.webp"
    },
    {
        "id": "g1-ice014",
        "name": "Arun Icecreams Pista Kulfi Ice Cream Stick",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Cups & Kulfi Treats",
        "mrp": 30,
        "price": 30,
        "pack_size_desc": "60 ml",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Pista Kulfi stick packshot",
        "img_filename": "ice-arun-pista-kulfi.webp"
    },
    {
        "id": "g1-ice015",
        "name": "Arun Icecreams Creamy Vanilla 1 Litre Family Tub",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Family Tubs (750ml & 1L)",
        "mrp": 160,
        "price": 160,
        "pack_size_desc": "1 L",
        "rating": 4.8,
        "stock": 30,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Vanilla 1L Tub packshot",
        "img_filename": "ice-arun-vanilla-1l.webp"
    },
    {
        "id": "g1-ice016",
        "name": "Arun Icecreams Crunchy Butterscotch 1 Litre Family Tub",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Family Tubs (750ml & 1L)",
        "mrp": 180,
        "price": 180,
        "pack_size_desc": "1 L",
        "rating": 4.8,
        "stock": 30,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Butterscotch 1L Tub packshot",
        "img_filename": "ice-arun-butterscotch-1l.webp"
    },
    {
        "id": "g1-ice017",
        "name": "Arun Icecreams Rich Chocolate Family Tub (750 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Family Tubs (750ml & 1L)",
        "mrp": 180,
        "price": 180,
        "pack_size_desc": "750 ml",
        "rating": 4.8,
        "stock": 25,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Chocolate Tub 750ml packshot",
        "img_filename": "ice-arun-chocolate-tub.webp"
    },
    {
        "id": "g1-ice018",
        "name": "Arun Icecreams Kesar Pista Rajbhog Family Tub (750 ml)",
        "brand": "Arun Icecreams",
        "category_id": "ice-creams",
        "sub_category": "Family Tubs (750ml & 1L)",
        "mrp": 200,
        "price": 200,
        "pack_size_desc": "750 ml",
        "rating": 4.9,
        "stock": 25,
        "is_in_stock": True,
        "search_query": "Arun Icecreams Rajbhog Tub 750ml packshot",
        "img_filename": "ice-arun-rajbhog-tub.webp"
    },

    # --- INSTANT FOOD & BREAKFAST (Full Supermarket Range) ---
    {
        "id": "g1-ins010",
        "name": "Maggi 2-Minute Masala Instant Noodles (Single Pack 70 g)",
        "brand": "Nestle Maggi",
        "category_id": "instant-food",
        "sub_category": "Instant & Hakka Noodles",
        "mrp": 14,
        "price": 14,
        "pack_size_desc": "70 g",
        "rating": 4.9,
        "stock": 100,
        "is_in_stock": True,
        "search_query": "Maggi 2 Minute Masala Noodles 70g packshot",
        "img_filename": "ins-maggi-masala-70g.webp"
    },
    {
        "id": "g1-ins011",
        "name": "Maggi 2-Minute Special Masala Instant Noodles (73 g)",
        "brand": "Nestle Maggi",
        "category_id": "instant-food",
        "sub_category": "Instant & Hakka Noodles",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "73 g",
        "rating": 4.8,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Maggi Special Masala Noodles 73g packshot",
        "img_filename": "ins-maggi-special-masala.webp"
    },
    {
        "id": "g1-ins012",
        "name": "Maggi Veg Atta Instant Noodles (72.5 g)",
        "brand": "Nestle Maggi",
        "category_id": "instant-food",
        "sub_category": "Instant & Hakka Noodles",
        "mrp": 25,
        "price": 25,
        "pack_size_desc": "72.5 g",
        "rating": 4.7,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Maggi Nutri-Licious Veg Atta Noodles packshot",
        "img_filename": "ins-maggi-atta-noodles.webp"
    },
    {
        "id": "g1-ins013",
        "name": "Sunfeast YiPPee! Magic Masala Noodles (Single Pack 60 g)",
        "brand": "Sunfeast",
        "category_id": "instant-food",
        "sub_category": "Instant & Hakka Noodles",
        "mrp": 14,
        "price": 14,
        "pack_size_desc": "60 g",
        "rating": 4.8,
        "stock": 80,
        "is_in_stock": True,
        "search_query": "Sunfeast Yippee Magic Masala 60g packshot",
        "img_filename": "ins-yippee-noodles-single.webp"
    },
    {
        "id": "g1-ins014",
        "name": "Sunfeast YiPPee! Mood Masala Instant Noodles (70 g)",
        "brand": "Sunfeast",
        "category_id": "instant-food",
        "sub_category": "Instant & Hakka Noodles",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "70 g",
        "rating": 4.7,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Sunfeast Yippee Mood Masala Noodles 70g packshot",
        "img_filename": "ins-yippee-mood-masala.webp"
    },
    {
        "id": "g1-ins015",
        "name": "Bambino Roasted Short Cut Vermicelli (Semiya 200 g)",
        "brand": "Bambino",
        "category_id": "instant-food",
        "sub_category": "Vermicelli & Semiya",
        "mrp": 20,
        "price": 20,
        "pack_size_desc": "200 g",
        "rating": 4.8,
        "stock": 70,
        "is_in_stock": True,
        "search_query": "Bambino Roasted Vermicelli 200g pouch packshot",
        "img_filename": "ins-bambino-vermicelli-200g.webp"
    },
    {
        "id": "g1-ins016",
        "name": "Bambino Roasted Short Cut Vermicelli (Semiya 450 g)",
        "brand": "Bambino",
        "category_id": "instant-food",
        "sub_category": "Vermicelli & Semiya",
        "mrp": 45,
        "price": 45,
        "pack_size_desc": "450 g",
        "rating": 4.8,
        "stock": 60,
        "is_in_stock": True,
        "search_query": "Bambino Roasted Vermicelli 450g pouch packshot",
        "img_filename": "ins-bambino-vermicelli-450g.webp"
    },
    {
        "id": "g1-ins017",
        "name": "Bambino Macaroni Pasta (400 g)",
        "brand": "Bambino",
        "category_id": "instant-food",
        "sub_category": "Vermicelli & Semiya",
        "mrp": 35,
        "price": 35,
        "pack_size_desc": "400 g",
        "rating": 4.7,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Bambino Macaroni 400g pouch packshot",
        "img_filename": "ins-bambino-macaroni.webp"
    },
    {
        "id": "g1-ins018",
        "name": "MTR 3-Minute Instant Poha Cup / Pouch (60 g)",
        "brand": "MTR",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 25,
        "price": 25,
        "pack_size_desc": "60 g",
        "rating": 4.7,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "MTR 3 Minute Poha 60g packshot",
        "img_filename": "ins-mtr-poha.webp"
    },
    {
        "id": "g1-ins019",
        "name": "MTR 3-Minute Instant Upma Cup / Pouch (60 g)",
        "brand": "MTR",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 25,
        "price": 25,
        "pack_size_desc": "60 g",
        "rating": 4.7,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "MTR 3 Minute Upma 60g packshot",
        "img_filename": "ins-mtr-upma.webp"
    },
    {
        "id": "g1-ins020",
        "name": "MTR Rava Idli Breakfast Mix (500 g)",
        "brand": "MTR",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 85,
        "price": 85,
        "pack_size_desc": "500 g",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "MTR Rava Idli Mix 500g pouch packshot",
        "img_filename": "ins-mtr-rava-idli.webp"
    },
    {
        "id": "g1-ins021",
        "name": "MTR Dosa Breakfast Mix (500 g)",
        "brand": "MTR",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 90,
        "price": 90,
        "pack_size_desc": "500 g",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "MTR Dosa Mix 500g pouch packshot",
        "img_filename": "ins-mtr-dosa.webp"
    },
    {
        "id": "g1-ins022",
        "name": "Kellogg's Corn Flakes Original (250 g)",
        "brand": "Kellogg's",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 110,
        "price": 110,
        "pack_size_desc": "250 g",
        "rating": 4.8,
        "stock": 45,
        "is_in_stock": True,
        "search_query": "Kelloggs Corn Flakes 250g box packshot",
        "img_filename": "ins-kelloggs-corn-flakes-250g.webp"
    },
    {
        "id": "g1-ins023",
        "name": "Kellogg's Corn Flakes Original Family Pack (475 g)",
        "brand": "Kellogg's",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 195,
        "price": 195,
        "pack_size_desc": "475 g",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Kelloggs Corn Flakes 475g box packshot",
        "img_filename": "ins-kelloggs-corn-flakes-475g.webp"
    },
    {
        "id": "g1-ins024",
        "name": "Kellogg's Chocos Chocolate Moons & Stars (250 g)",
        "brand": "Kellogg's",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 115,
        "price": 115,
        "pack_size_desc": "250 g",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Kelloggs Chocos Moons and Stars 250g packshot",
        "img_filename": "ins-kelloggs-chocos-250g.webp"
    },
    {
        "id": "g1-ins025",
        "name": "Kellogg's Chocos Single Pocket Pack (26 g)",
        "brand": "Kellogg's",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "26 g",
        "rating": 4.7,
        "stock": 80,
        "is_in_stock": True,
        "search_query": "Kelloggs Chocos 10rs pouch packshot",
        "img_filename": "ins-kelloggs-chocos-10rs.webp"
    },
    {
        "id": "g1-ins026",
        "name": "Quaker Rolled Oats 100% Wholegrain (400 g)",
        "brand": "Quaker",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 99,
        "price": 99,
        "pack_size_desc": "400 g",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Quaker Oats 400g pouch packshot",
        "img_filename": "ins-quaker-oats-400g.webp"
    },
    {
        "id": "g1-ins027",
        "name": "Quaker Rolled Oats 100% Wholegrain (1 kg)",
        "brand": "Quaker",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 199,
        "price": 199,
        "pack_size_desc": "1 kg",
        "rating": 4.8,
        "stock": 30,
        "is_in_stock": True,
        "search_query": "Quaker Oats 1kg pouch packshot",
        "img_filename": "ins-quaker-oats-1kg.webp"
    },
    {
        "id": "g1-ins028",
        "name": "Saffola Classic Masala Oats (38 g Pocket)",
        "brand": "Saffola",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 15,
        "price": 15,
        "pack_size_desc": "38 g",
        "rating": 4.7,
        "stock": 60,
        "is_in_stock": True,
        "search_query": "Saffola Masala Oats 38g pouch packshot",
        "img_filename": "ins-saffola-oats-38g.webp"
    },
    {
        "id": "g1-ins029",
        "name": "Saffola Classic Masala Oats (400 g)",
        "brand": "Saffola",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 165,
        "price": 165,
        "pack_size_desc": "400 g",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Saffola Masala Oats Classic 400g pouch packshot",
        "img_filename": "ins-saffola-oats-classic-400g.webp"
    },
    {
        "id": "g1-ins030",
        "name": "Saffola Veggie Twist Masala Oats (400 g)",
        "brand": "Saffola",
        "category_id": "instant-food",
        "sub_category": "Breakfast Cereals & Instant Mixes",
        "mrp": 165,
        "price": 165,
        "pack_size_desc": "400 g",
        "rating": 4.7,
        "stock": 30,
        "is_in_stock": True,
        "search_query": "Saffola Veggie Twist Masala Oats 400g packshot",
        "img_filename": "ins-saffola-oats-veggie-400g.webp"
    },

    # --- BISCUITS & BAKERY (Essential Supermarket Sizes & Variants) ---
    {
        "id": "g1-bsc067",
        "name": "Parle-G Original Glucose Biscuits (Pocket Pack 65 g)",
        "brand": "Parle",
        "category_id": "biscuits-bakery",
        "sub_category": "Glucose & Marie Biscuits",
        "mrp": 5,
        "price": 5,
        "pack_size_desc": "65 g",
        "rating": 4.9,
        "stock": 100,
        "is_in_stock": True,
        "search_query": "Parle-G 5rs packet packshot",
        "img_filename": "bsc-parle-g-5rs.webp"
    },
    {
        "id": "g1-bsc068",
        "name": "Parle-G Original Glucose Biscuits (130 g)",
        "brand": "Parle",
        "category_id": "biscuits-bakery",
        "sub_category": "Glucose & Marie Biscuits",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "130 g",
        "rating": 4.9,
        "stock": 100,
        "is_in_stock": True,
        "search_query": "Parle-G 10rs packet packshot",
        "img_filename": "bsc-parle-g-10rs.webp"
    },
    {
        "id": "g1-bsc069",
        "name": "Parle-G Gold Biscuits (1 kg Mega Pack)",
        "brand": "Parle",
        "category_id": "biscuits-bakery",
        "sub_category": "Glucose & Marie Biscuits",
        "mrp": 120,
        "price": 120,
        "pack_size_desc": "1 kg",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Parle-G Gold 1kg mega pack packshot",
        "img_filename": "bsc-parle-g-1kg.webp"
    },
    {
        "id": "g1-bsc070",
        "name": "Britannia Good Day Cashew Cookies (Pocket Pack 42 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Cookies & Butter Biscuits",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "42 g",
        "rating": 4.8,
        "stock": 90,
        "is_in_stock": True,
        "search_query": "Britannia Good Day Cashew 10rs packshot",
        "img_filename": "bsc-good-day-cashew-10rs.webp"
    },
    {
        "id": "g1-bsc071",
        "name": "Britannia Good Day Butter Cookies (Pocket Pack 42 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Cookies & Butter Biscuits",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "42 g",
        "rating": 4.8,
        "stock": 90,
        "is_in_stock": True,
        "search_query": "Britannia Good Day Butter 10rs packshot",
        "img_filename": "bsc-good-day-butter-10rs.webp"
    },
    {
        "id": "g1-bsc072",
        "name": "Britannia Good Day Cashew Family Pack (600 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Cookies & Butter Biscuits",
        "mrp": 120,
        "price": 120,
        "pack_size_desc": "600 g",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Britannia Good Day Cashew 600g family pack packshot",
        "img_filename": "bsc-good-day-cashew-600g.webp"
    },
    {
        "id": "g1-bsc073",
        "name": "Britannia Marie Gold Biscuits (120 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Glucose & Marie Biscuits",
        "mrp": 15,
        "price": 15,
        "pack_size_desc": "120 g",
        "rating": 4.8,
        "stock": 80,
        "is_in_stock": True,
        "search_query": "Britannia Marie Gold 120g packshot",
        "img_filename": "bsc-marie-gold-120g.webp"
    },
    {
        "id": "g1-bsc074",
        "name": "Britannia Marie Gold Jumbo Family Pack (1 kg)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Glucose & Marie Biscuits",
        "mrp": 110,
        "price": 110,
        "pack_size_desc": "1 kg",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Britannia Marie Gold 1kg family pack packshot",
        "img_filename": "bsc-marie-gold-1kg.webp"
    },
    {
        "id": "g1-bsc075",
        "name": "Britannia Bourbon Chocolate (Pocket Pack 60 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "60 g",
        "rating": 4.8,
        "stock": 80,
        "is_in_stock": True,
        "search_query": "Britannia Bourbon 10rs packshot",
        "img_filename": "bsc-bourbon-10rs.webp"
    },
    {
        "id": "g1-bsc076",
        "name": "Britannia Treat Jim Jam (Pocket Pack 50 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "50 g",
        "rating": 4.8,
        "stock": 80,
        "is_in_stock": True,
        "search_query": "Britannia Jim Jam 10rs packshot",
        "img_filename": "bsc-jim-jam-10rs.webp"
    },
    {
        "id": "g1-bsc077",
        "name": "Britannia Milk Bikis (Pocket Pack 50 g)",
        "brand": "Britannia",
        "category_id": "biscuits-bakery",
        "sub_category": "Glucose & Marie Biscuits",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "50 g",
        "rating": 4.8,
        "stock": 80,
        "is_in_stock": True,
        "search_query": "Britannia Milk Bikis 10rs packshot",
        "img_filename": "bsc-milk-bikis-10rs.webp"
    },
    {
        "id": "g1-bsc078",
        "name": "Cadbury Oreo Vanilla Biscuits (Pocket Pack 43 g)",
        "brand": "Cadbury Oreo",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 10,
        "price": 10,
        "pack_size_desc": "43 g",
        "rating": 4.8,
        "stock": 90,
        "is_in_stock": True,
        "search_query": "Oreo Vanilla 10rs packshot",
        "img_filename": "bsc-oreo-vanilla-10rs.webp"
    },
    {
        "id": "g1-bsc079",
        "name": "Cadbury Oreo Double Stuf Vanilla Biscuits (130 g)",
        "brand": "Cadbury Oreo",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 60,
        "price": 60,
        "pack_size_desc": "130 g",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Cadbury Oreo Double Stuf 130g packshot",
        "img_filename": "bsc-oreo-double-stuf.webp"
    },
    {
        "id": "g1-bsc080",
        "name": "Cadbury Oreo Red Velvet Creme Biscuits (120 g)",
        "brand": "Cadbury Oreo",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 50,
        "price": 50,
        "pack_size_desc": "120 g",
        "rating": 4.8,
        "stock": 35,
        "is_in_stock": True,
        "search_query": "Cadbury Oreo Red Velvet Biscuits 120g packshot",
        "img_filename": "bsc-oreo-red-velvet.webp"
    },
    {
        "id": "g1-bsc081",
        "name": "Sunfeast Dark Fantasy Choco Fills (Pocket Pack 75 g)",
        "brand": "Sunfeast",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 30,
        "price": 30,
        "pack_size_desc": "75 g",
        "rating": 4.8,
        "stock": 60,
        "is_in_stock": True,
        "search_query": "Dark Fantasy Choco Fills 30rs packshot",
        "img_filename": "bsc-dark-fantasy-30rs.webp"
    },
    {
        "id": "g1-bsc082",
        "name": "Cadbury Chocobakes Choc Layered Cakes (6-Pack 126 g)",
        "brand": "Cadbury",
        "category_id": "biscuits-bakery",
        "sub_category": "Rusks & Bakery Cakes",
        "mrp": 60,
        "price": 60,
        "pack_size_desc": "126 g",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Cadbury Chocobakes Choc Layered Cakes 126g packshot",
        "img_filename": "bsc-cadbury-chocobakes-cake.webp"
    },
    {
        "id": "g1-bsc083",
        "name": "Cadbury Chocobakes Choc Filled Soft Cookies (75 g)",
        "brand": "Cadbury",
        "category_id": "biscuits-bakery",
        "sub_category": "Cookies & Butter Biscuits",
        "mrp": 40,
        "price": 40,
        "pack_size_desc": "75 g",
        "rating": 4.8,
        "stock": 40,
        "is_in_stock": True,
        "search_query": "Cadbury Chocobakes Cookies 75g packshot",
        "img_filename": "bsc-cadbury-chocobakes-cookies.webp"
    },
    {
        "id": "g1-bsc084",
        "name": "Parle Hide & Seek Black Bourbon Biscuits (100 g)",
        "brand": "Parle",
        "category_id": "biscuits-bakery",
        "sub_category": "Cream Biscuits & Choco Fills",
        "mrp": 30,
        "price": 30,
        "pack_size_desc": "100 g",
        "rating": 4.8,
        "stock": 50,
        "is_in_stock": True,
        "search_query": "Parle Hide Seek Black Bourbon 100g packshot",
        "img_filename": "bsc-hide-seek-bourbon.webp"
    }
]

print(f"Total new SKUs to add: {len(NEW_ITEMS)}")

def search_bing_images(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception:
        return []

def format_image_canvas(img, output_path, target_size=(800, 800)):
    w, h = img.size
    if w < 60 or h < 60:
        raise Exception(f"Image too small: {w}x{h}")

    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2), mask=resized)
    else:
        img = img.convert('RGB')
        canvas = Image.new('RGB', target_size, (255, 255, 255))
        scale = min(720 / w, 720 / h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((target_size[0] - nw) // 2, (target_size[1] - nh) // 2))

    canvas.save(output_path, 'WEBP', quality=90)

def download_and_save(item):
    out_path = os.path.join(PUBLIC_IMG_DIR, item['img_filename'])
    if os.path.exists(out_path) and os.path.getsize(out_path) > 5000:
        return f"[EXISTS] {item['id']} {item['img_filename']}"

    urls = search_bing_images(item['search_query'])
    for url in urls[:6]:
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=6) as res:
                raw = res.read()
            if len(raw) < 4000:
                continue
            im = Image.open(BytesIO(raw))
            format_image_canvas(im, out_path)
            return f"[SUCCESS] {item['id']} {item['img_filename']} ({os.path.getsize(out_path)} B)"
        except Exception:
            continue

    # Fallback to white canvas if download fails
    blank = Image.new('RGB', (800, 800), (255, 255, 255))
    blank.save(out_path, 'WEBP', quality=85)
    return f"[FALLBACK] {item['id']} {item['img_filename']}"

print("Downloading images using ThreadPoolExecutor...")
with ThreadPoolExecutor(max_workers=6) as executor:
    futures = [executor.submit(download_and_save, item) for item in NEW_ITEMS]
    for fut in as_completed(futures):
        print(fut.result())

print("Image download step completed.")
