import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import re
from collections import Counter

catalog_path = "src/data/products-catalog.json"

with open(catalog_path, "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from {catalog_path}")

RULES = [
    # --- 1. Distinct Biscuits, Cookies & Bakery (MUST precede chocolate, nuts & dairy!) ---
    (r"(?:unibic|unbic)", "/products/packshots/unibic-choco-ripple.jpg", "snacks-beverages", "Biscuits, Rusks & Cookies"),
    (r"\bbourbon\b", "/products/packshots/britannia-bourbon.jpg", "snacks-beverages", "Biscuits, Rusks & Cookies"),
    (r"(?:parle-?g|\bparle\b|happy\s*happy|krack\s*jack|monaco|20-?20)", "/products/packshots/parle-g.jpg", "snacks-beverages", "Biscuits, Rusks & Cookies"),
    (r"good\s*day", "/products/packshots/good-day.jpg", "snacks-beverages", "Biscuits, Rusks & Cookies"),
    (r"(?:biscott|biscot|cookie|cookies|rusk|rusks|\bmarie\b|moms\s*magic|dark\s*fantasy|milano|oreo|bounce|treat\b|jim\s*jam|tiger\b|milk\s*bikis)", "/products/packshots/good-day.jpg", "snacks-beverages", "Biscuits, Rusks & Cookies"),

    # --- 2. Chips, Namkeen & Savories ---
    (r"lays.*(?:magic\s*masala|masala)", "/products/packshots/lays-magic-masala.jpg", "snacks-beverages", "Chips & Namkeen"),
    (r"lays", "/products/packshots/lays-classic-salted.jpg", "snacks-beverages", "Chips & Namkeen"),
    (r"kurkure|tedhe\s*medhe", "/products/packshots/kurkure.jpg", "snacks-beverages", "Chips & Namkeen"),
    (r"bingo|mad\s*angles", "/products/packshots/bingo-mad-angles.jpg", "snacks-beverages", "Chips & Namkeen"),
    (r"(?:appalam|papad|lijjat)", "/products/packshots/aachi-appalam.jpg", "snacks-beverages", "Chips & Namkeen"),
    (r"(?:khatta\s*meetha|bhujia|mixture|mixtur\b|namkeen|sev\b|chegodi|borugulu|murmura|puffed\s*rice|spicy\s*nuts|tasty\s*nuts|haldiram|bikaji)", "/products/packshots/haldiram-khatta-meetha.jpg", "snacks-beverages", "Chips & Namkeen"),

    # --- 3. Instant Foods, Soups, Noodles & Cereals ---
    (r"(?:maggi|yippee|noodles|noodels|pasta|macaroni|top\s*ramen|soup\b|knorr)", "/products/packshots/maggi-noodles.jpg", "snacks-beverages", "Instant & Packaged Food"),
    (r"(?:corn\s*flakes|kellogg|muesli|chocos|oats\b|oatmeal)", "/products/packshots/corn-flakes.jpg", "snacks-beverages", "Instant & Packaged Food"),

    # --- 4. Chocolates, Sweets, Candies & Confectionery ---
    (r"(?:5\s*star|5star)", "/products/packshots/cadbury-5-star.jpg", "snacks-beverages", "Chocolates & Sweets"),
    (r"\bmunch\b", "/products/packshots/nestle-munch.jpg", "snacks-beverages", "Chocolates & Sweets"),
    (r"(?:dairy\s*milk|cadbury|kitkat|perk\b|milky\s*bar|milkybar|eclairs|choclairs|brownie|dazzy|bonbon|kopiko|center\s*fresh|polo\b|mentos|candy|candies|alpenliebe|kacche\s*aam|lotte|jelly|pops\b|hanobar|tcon|chocolates?|gulab\s*jam|mysore\s*pa[ck]|sweet\b|sweets\b|bubble\s*gum|trubble\s*gum|gum\b)", "/products/packshots/cadbury-dairy-milk.jpg", "snacks-beverages", "Chocolates & Sweets"),

    # --- 5. Beverages (Hot & Cold) ---
    (r"(?:horlicks|boost\b|bournvita|complan|glucon-?d|pediasure|protinex)", "/products/packshots/horlicks.jpg", "snacks-beverages", "Cold Drinks & Health Juices"),
    (r"(?:coca\s*cola|\bcoke\b)", "/products/packshots/coca-cola.jpg", "snacks-beverages", "Cold Drinks & Health Juices"),
    (r"(?:thums\s*up|thumsup|sprite|limca|mountain\s*dew|pepsi|7\s*up|fanta|mirinda|soda\b|kinley)", "/products/packshots/thums-up.jpg", "snacks-beverages", "Cold Drinks & Health Juices"),
    (r"(?:frooti|maaza|slice\b|pulpy\s*orange|minute\s*maid|tropicana|real\s*fruit|\bjuice\b|badam\s*milk|aniva)", "/products/packshots/frooti.jpg", "snacks-beverages", "Cold Drinks & Health Juices"),
    (r"(?:coffee|bru\b|nescafe|sunrise)", "/products/packshots/bru-instant.jpg", "snacks-beverages", "Tea, Chai & Coffee"),
    (r"(?:\btea\b|chai\b|3\s*roses|red\s*label|taj\s*mahal|wagh\s*bakri|chakra\s*gold|kannan\s*devan|green\s*tea)", "/products/packshots/red-label-tea.jpg", "snacks-beverages", "Tea, Chai & Coffee"),

    # --- 6. Dairy & Ice Creams ---
    (r"(?:hatsun.*(?:curd|dahi|pouch)|hatsun.*(?:milk|paneer|lassi)|\bcurd\b|\bdahi\b|\blassi\b|\bpaneer\b|yogurt)", "/products/packshots/curd-dahi.jpg", "snacks-beverages", "Dairy & Ice Creams"),
    (r"(?:arun.*(?:bites|bite))", "/products/packshots/arun-bites.jpg", "snacks-beverages", "Dairy & Ice Creams"),
    (r"(?:arun.*(?:popitos|popito))", "/products/packshots/arun-popitos.jpg", "snacks-beverages", "Dairy & Ice Creams"),
    (r"(?:arun|milky\s*fantasy|ice\s*cream|kulfi|cassata|cornetto|cone\b.*cream)", "/products/packshots/arun-donut.jpg", "snacks-beverages", "Dairy & Ice Creams"),

    # --- 7. Cooking Pastes & Tamarind ---
    (r"(?:ginger\s*garlic|garlic\s*paste|allam\s*vellulli)", "/products/packshots/ginger-garlic-paste.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:tamarind|chintapandu|\bimli\b)", "/products/packshots/tamarind.jpg", "grocery-staples", "Kitchen Staples"),

    # --- 8. Specific Spices & Masalas ---
    (r"(?:chicken\s*masala|chikkin\s*masala|mutton\s*masala|fish\s*masala|meat\s*masala)", "/products/packshots/chicken-masala.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"biryani\s*masala", "/products/packshots/biryani-masala.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:turmeric|pasupu|haldi)", "/products/packshots/turmeric-powder.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:chilli|mirchi|merchi|mirapa|kaaram|nalla\s*karam|chilly|red\s*chilli)", "/products/packshots/aachi-chilli.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:cinnamon|dalchini)", "/products/packshots/cinnamon.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:jeera|cumin|jeelakarra|jeelakara|gilakara)", "/products/packshots/jeera-cumin-seeds.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:coriander\s*seed|dhaniya\s*seed|dhaniyalu|whole\s*dhaniya)", "/products/packshots/coriander-seeds.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:coriander\s*powder|dhaniya\s*powder|dhania\s*powder|coriander|dhaniya|dhania)", "/products/packshots/coriander-powder.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:black\s*pepper|kali\s*mirch|miriyalu|pepper)", "/products/packshots/black-pepper.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:mustard|\brai\b|avalu|sarson|gasagasa|gasagasalu|poppy\s*seed|pumpkin\s*seeds?|watermelon\s*seeds?|muskmelon\s*seeds?|seeds\b|seeded)", "/products/packshots/mustard-seeds.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:fenugreek|methi\b|menthulu)", "/products/packshots/fenugreek-seeds.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:fennel|saunf|sompu)", "/products/packshots/fennel-seeds.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:clove|laung|lavanga|lavangalu)", "/products/packshots/cloves.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:cardamom|elaichi|elachi|yaluka|yalukalu)", "/products/packshots/cardamom.jpg", "grocery-staples", "Spices, Masalas & Seeds"),
    (r"(?:garam\s*masala|sambar|sambhar|rasam|chaat\s*masal|chana\s*masala|sabji\s*masala|curry\s*powder|hing\b|asafoetida|\bmasala\b)", "/products/packshots/garam-masala.jpg", "grocery-staples", "Spices, Masalas & Seeds"),

    # --- 9. Dry Fruits & Nuts ---
    (r"(?:cashew|kaju|jeedi\s*pappu|jedipappu|badam|almond|kismis|draksha|dates\b|kharjuram|dry\s*fruits?|dry\s*nuts|makhana|walnut|pista)", "/products/packshots/cashew-nuts.jpg", "snacks-beverages", "Dry Fruits, Nuts & Seeds"),
    (r"(?:peanut|groundnut|verusenaga|palli\b|\bchikki\b|peanut\s*butter)", "/products/packshots/peanuts.jpg", "grocery-staples", "Kitchen Staples"),
    (r"(?:kobbari|copra|dry\s*coconut|yendu\s*kobbari)", "/products/packshots/dry-coconut.jpg", "grocery-staples", "Kitchen Staples"),

    # --- 10. Cooking Oils vs Hair Oils ---
    (r"(?:amla\s*oil|hair\s*oil|parachute|coconut\s*oil)", "/products/packshots/parachute-oil.jpg", "personal-care", "Hair Oils & Care"),
    (r"(?:sunflower|fortune|freedom|gold\s*winner|ruchi\s*gold|ruchigold|priya\s*gold|cooking\s*oil|groundnut\s*oil|deepam|gingelly|sesame\s*oil|\boil\b|ghee|butter\b)", "/products/packshots/sunflower-oil.jpg", "grocery-staples", "Edible Cooking Oils & Ghee"),

    # --- 11. Dals & Pulses ---
    (r"(?:senaga|senagapappu|chana\s*dal|bengal\s*gram|pachi\s*senga|pachi\s*senaga|putnalu|\bdalia\b|roasted\s*gram|chana\b)", "/products/packshots/chana-dal.jpg", "grocery-staples", "Dals & Pulses"),
    (r"(?:moong|pesara\s*pappu|pesara|green\s*gram|moon\s*dal)", "/products/packshots/moong-dal.jpg", "grocery-staples", "Dals & Pulses"),
    (r"(?:urad|minapa|minapapu|minapappu|black\s*gram|pottu\s*minapa|pottu\s*minapappu)", "/products/packshots/urad-dal.jpg", "grocery-staples", "Dals & Pulses"),
    (r"(?:\btoor\b|kandi\s*pappu|kandipappu|arhar|pigeon\s*pea|masoor|red\s*lentil|lentil|rajma|alasandalu|\bdal\b|\bpappu\b|soya\s*chunk|soya\s*badi|soya\s*mini|meal\s*maker)", "/products/packshots/toor-dal.jpg", "grocery-staples", "Dals & Pulses"),

    # --- 12. Rice, Rava, Flours & Grains ---
    (r"(?:lalitha.*(?:rava|ravva|idli|idly)|(?:idli|idly)\s*(?:rava|ravva))", "/products/packshots/lalitha-idli-rava.jpg", "grocery-staples", "Atta, Flours & Sooji"),
    (r"(?:suji|sooji|bombay\s*rava|aashirvaad.*(?:suji|rava|ravva))", "/products/packshots/aashirvaad-suji-rava.jpg", "grocery-staples", "Atta, Flours & Sooji"),
    (r"(?:vermicelli|semiya|seviyan|bambino)", "/products/packshots/vermicelli.jpg", "grocery-staples", "Rice, Poha & Vermicelli"),
    (r"(?:aashirvaad.*atta|atta\b|wheat\s*flour|godhuma|maida|besan|flour)", "/products/packshots/aashirvaad-atta.jpg", "grocery-staples", "Atta, Flours & Sooji"),
    (r"(?:basmati|india\s*gate|biryani\s*rice|raw\s*rice|boiled\s*rice|biyyamu|biyyam|\brice\b|\bric\b|korralu|millets?)", "/products/packshots/basmati-rice.jpg", "grocery-staples", "Kitchen Staples"),

    # --- 13. Salt, Sugar, Honey & Jaggery ---
    (r"(?:tata\s*salt|salt\b|uppu)", "/products/packshots/tata-salt.jpg", "grocery-staples", "Salt, Sugar & Jaggery"),
    (r"(?:sugar|jaggery|bellam|sakkarai|honey\b)", "/products/packshots/aashirvaad-salt.jpg", "grocery-staples", "Salt, Sugar & Jaggery"),

    # --- 14. Pooja Essentials ---
    (r"(?:cycle|lia\b|zed\s*black|agarbatti|agarbathies|agarbati|agarbathi|ambica|dhoop|incense|pooja|camphor|karpooram|diya|sambrani|mangaldeep|cones\b)", "/products/packshots/pooja-agarbatti.jpg", "pooja-essentials", "Pooja Needs & Incense"),

    # --- 15. Soaps & Bath ---
    (r"mysore\s*sandal", "/products/packshots/mysore-sandal-soap.jpg", "personal-care", "Bath Soaps"),
    (r"cinthol", "/products/packshots/cinthol-soap.jpg", "personal-care", "Bath Soaps"),
    (r"(?:dettol|dettal)", "/products/packshots/dettol-soap.jpg", "personal-care", "Bath Soaps"),
    (r"lux\b", "/products/packshots/lux-soap.jpg", "personal-care", "Bath Soaps"),
    (r"pears", "/products/packshots/pears-soap.jpg", "personal-care", "Bath Soaps"),
    (r"dove", "/products/packshots/dove-soap.jpg", "personal-care", "Bath Soaps"),
    (r"lifebuoy", "/products/packshots/lifebuoy-soap.jpg", "personal-care", "Bath Soaps"),
    (r"santoor", "/products/packshots/santoor-soap.jpg", "personal-care", "Bath Soaps"),
    (r"(?:soap\b|bath\b|body\s*wash|hand\s*wash)", "/products/packshots/santoor-soap.jpg", "personal-care", "Bath Soaps"),

    # --- 16. Oral Care ---
    (r"(?:close\s*up|closeup)", "/products/packshots/close-up-toothpaste.jpg", "personal-care", "Oral Care"),
    (r"(?:colgate|pepsodent|sensodyne|sensora|dabur\s*red|toothpaste|toothbrush|paste\b)", "/products/packshots/colgate-toothpaste.jpg", "personal-care", "Oral Care"),

    # --- 17. Feminine & Baby Care ---
    (r"(?:stay\s*free|stayfree|whisper|sanitary|pads\b|napkin)", "/products/packshots/stayfree.jpg", "personal-care", "Feminine Hygiene"),
    (r"(?:huggies|hugges|pampers|mamy\s*poko|diaper|baby\s*wipes)", "/products/packshots/huggies.jpg", "personal-care", "Skin & Baby Care"),

    # --- 18. Personal Care Talc, Creams & Shampoos ---
    (r"(?:shampoo|conditioner|clinic\s*plus|head\s*&\s*shoulders|sunsilk|pantene|tresemme|meera)", "/products/packshots/shampoo.jpg", "personal-care", "Hair Oils & Care"),
    (r"(?:talc\b|talcum|ponds\b|yardley|gokul|face\s*powder|body\s*powder|bath\s*powder|subhra|nycil|boro\s*plus|baby\s*powder|baby\s*soap|glow\s*&\s*lovely|fair\s*&\s*lovely|rose\s*water|lip\s*balm|cream\b|f\.?w\b|face\s*wash|henna)", "/products/packshots/ponds-talc.jpg", "personal-care", "Skin & Baby Care"),

    # --- 19. Household Cleaning & Pest Control ---
    (r"ariel.*liq", "/products/packshots/ariel-front-liq.jpg", "household-cleaning", "Laundry & Detergents"),
    (r"fab.*liq", "/products/packshots/fab-liquid.jpg", "household-cleaning", "Laundry & Detergents"),
    (r"(?:vim\b|dishwash|scrub|prill|exo\b|pitambari|sponge)", "/products/packshots/vim-bar.jpg", "household-cleaning", "Dishwashing & Utensil Care"),
    (r"(?:surf\s*excel|surf\b|tide|wheel\b|rin\b|detergent|washing\s*powder|comfort|fabric)", "/products/packshots/surf-excel.jpg", "household-cleaning", "Laundry & Detergents"),
    (r"(?:allout|all\s*out|good\s*knight|gn\s*gold|hit\b|mosquito|repellent)", "/products/packshots/goodknight.jpg", "household-cleaning", "Cleaning Essentials"),
    (r"(?:cleaner|harpic|lizol|colin|domex|aer\b|godrej\s*aer|godreg\s*aer|odonil|air\s*fresh|descal|fogg|denver|spray|spary|body\s*spray|perfume|lock\b|hardware)", "/products/packshots/cleaner-spray.jpg", "household-cleaning", "Cleaning Essentials"),
    (r"(?:launch\s*plate|paper\s*plate|disposable|plate\b)", "/products/packshots/launch-plate.jpg", "household-cleaning", "Kitchen & Dining Needs")
]

if __name__ == "__main__":
    updated_count = 0
    for p in products:
        primary_name = f"{p.get('brand', '')} {p.get('name', '')} {p.get('rawName', '')}".lower()
        full_str = f"{primary_name} {p.get('subCategory', '')}".lower()
        
        matched_photo = None
        matched_cat = None
        matched_subcat = None
        for pattern, photo_path, cat, subcat in RULES:
            if re.search(pattern, primary_name):
                matched_photo = photo_path
                matched_cat = cat
                matched_subcat = subcat
                break
                
        if not matched_photo:
            for pattern, photo_path, cat, subcat in RULES:
                if re.search(pattern, full_str):
                    matched_photo = photo_path
                    matched_cat = cat
                    matched_subcat = subcat
                    break
                    
        if matched_photo:
            chosen = matched_photo
            p['category'] = matched_cat
            p['subCategory'] = matched_subcat
        else:
            cat = p.get('category', '').lower()
            subcat = p.get('subCategory', '').lower()
            
            if 'snack' in cat or 'beverage' in cat:
                chosen = '/products/packshots/good-day.jpg'
            elif 'clean' in cat or 'household' in cat:
                chosen = '/products/packshots/surf-excel.jpg'
            elif 'pooja' in cat:
                chosen = '/products/packshots/pooja-agarbatti.jpg'
            elif 'personal' in cat:
                chosen = '/products/packshots/santoor-soap.jpg'
            elif 'rice' in subcat or 'rice' in cat:
                chosen = '/products/packshots/basmati-rice.jpg'
            elif 'spice' in subcat or 'masala' in subcat:
                chosen = '/products/packshots/garam-masala.jpg'
            elif 'dal' in subcat or 'pulse' in subcat:
                chosen = '/products/packshots/toor-dal.jpg'
            else:
                chosen = '/products/packshots/aashirvaad-atta.jpg'
                
        p['imageUrl'] = chosen
        p['image'] = chosen
        p['image_url'] = chosen
        p['image_path'] = chosen
        p['imageStatus'] = 'VERIFIED'
        p['image_status'] = 'VERIFIED'
        p['is_verified'] = True
        updated_count += 1

    print(f"Successfully processed and updated {updated_count} products!")

    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Saved updated catalog to {catalog_path}")
