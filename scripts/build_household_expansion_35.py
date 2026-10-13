import json
import os

products = [
    # 1. Pooja Essentials (pooja-needs)
    {
        "id": "g1-hh150",
        "name": "Ambica Darbar Bathi Agarbatti",
        "brand_id": "brand-ambica",
        "brand": "Ambica",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Agarbatti & Dhoop",
        "subCategory": "Agarbatti & Dhoop",
        "image_url": "/products/verified/hh-150-ambica-darbar-bathi.webp",
        "description": "Authentic Ambica Darbar Bathi incense sticks known for their iconic, traditional spiritual fragrance that creates an uplifting and peaceful pooja ambience.",
        "queries": [
            "Ambica Darbar Bathi Agarbatti pack",
            "Ambica Darbar Bathi incense sticks",
            "Ambica Darbar Bathi packshot"
        ],
        "variants": [
            {"size_label": "1 Pack (85 Sticks)", "mrp": 40, "price": 40, "stock": 50}
        ]
    },
    {
        "id": "g1-hh151",
        "name": "Gopuram Pasupu Pure Puja Turmeric Powder",
        "brand_id": "brand-gopuram",
        "brand": "Gopuram",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-151-gopuram-pasupu-turmeric.webp",
        "description": "Pure auspicious turmeric powder (Pasupu) specially formulated for traditional deity worship, abhishek, and home rituals from Andhra's iconic Gopuram brand.",
        "queries": [
            "Gopuram Pasupu puja turmeric powder pack",
            "Gopuram turmeric powder pooja",
            "Gopuram Pasupu 100g packshot"
        ],
        "variants": [
            {"size_label": "50 g", "mrp": 20, "price": 20, "stock": 50},
            {"size_label": "100 g", "mrp": 38, "price": 38, "stock": 50}
        ]
    },
    {
        "id": "g1-hh152",
        "name": "Gopuram Roli Kumkum",
        "brand_id": "brand-gopuram",
        "brand": "Gopuram",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-152-gopuram-kumkum.webp",
        "description": "Sacred pure red vermilion (Kumkum) crafted from auspicious natural ingredients, skin-friendly and ideal for daily deity tilak and traditional ceremonies.",
        "queries": [
            "Gopuram Kumkum puja pack",
            "Gopuram Roli Kumkum packet",
            "Gopuram Kumkum 100g packshot"
        ],
        "variants": [
            {"size_label": "50 g", "mrp": 20, "price": 20, "stock": 50},
            {"size_label": "100 g", "mrp": 38, "price": 38, "stock": 50}
        ]
    },
    {
        "id": "g1-hh153",
        "name": "Gopuram Chandanam Sandal Paste Powder",
        "brand_id": "brand-gopuram",
        "brand": "Gopuram",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-153-gopuram-chandanam.webp",
        "description": "Fragrant sandal paste powder (Chandanam) for applying divine tilak and deity alankaram during puja and holy occasions.",
        "queries": [
            "Gopuram Chandanam powder tub",
            "Gopuram sandal paste powder pack",
            "Gopuram Chandanam 40g packshot"
        ],
        "variants": [
            {"size_label": "40 g", "mrp": 35, "price": 35, "stock": 50}
        ]
    },
    {
        "id": "g1-hh154",
        "name": "Mysore Sandal Pure Agarbatti (KSDL)",
        "brand_id": "brand-mysore-sandal",
        "brand": "Mysore Sandal",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Agarbatti & Dhoop",
        "subCategory": "Agarbatti & Dhoop",
        "image_url": "/products/verified/hh-154-mysore-sandal-agarbatti.webp",
        "description": "Premium sandalwood incense sticks manufactured by Karnataka Soaps and Detergents Limited (KSDL) infused with natural sandalwood oil.",
        "queries": [
            "Mysore Sandal Dhoop Agarbatti KSDL pack",
            "Mysore Sandal Agarbatti incense sticks box",
            "KSDL Mysore Sandal Agarbatti packshot"
        ],
        "variants": [
            {"size_label": "1 Pack (20 Sticks)", "mrp": 65, "price": 65, "stock": 40}
        ]
    },
    {
        "id": "g1-hh155",
        "name": "Cycle Lia Dhoop Cones",
        "brand_id": "brand-cycle-pure",
        "brand": "Cycle Pure",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Agarbatti & Dhoop",
        "subCategory": "Agarbatti & Dhoop",
        "image_url": "/products/verified/hh-155-cycle-lia-dhoop-cones.webp",
        "description": "Charcoal-free fragrant dhoop cones with burner plate, emitting a soothing and long-lasting floral aroma for daily meditation and puja.",
        "queries": [
            "Cycle Lia Dhoop Cones Jasmine Sandal pack",
            "Cycle Lia Dhoop Cones box",
            "Cycle Lia Dhoop packshot"
        ],
        "variants": [
            {"size_label": "Pack of 20 Cones", "mrp": 40, "price": 40, "stock": 40}
        ]
    },
    {
        "id": "g1-hh156",
        "name": "Pachi Karpooram Pure Edible Green Camphor",
        "brand_id": "brand-mangalam",
        "brand": "Mangalam",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-156-pachi-karpooram.webp",
        "description": "100% pure authentic edible green camphor (Pachi Karpooram) essential for sweet prasadam, Tirupati laddu aroma, deity abhishek, and holy theertham.",
        "queries": [
            "Pachi Karpooram green edible camphor box",
            "Pachai Karpooram edible camphor pack",
            "Mangalam Bhimseni Pachi Karpooram"
        ],
        "variants": [
            {"size_label": "20 g", "mrp": 50, "price": 50, "stock": 40}
        ]
    },
    {
        "id": "g1-hh157",
        "name": "White Rangoli Powder (Muggulu Pindi)",
        "brand_id": "brand-g1",
        "brand": "G1 Mart Puja Essentials",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-157-rangoli-powder.webp",
        "description": "Finely ground bright white stone rangoli flour (Muggulu Pindi) perfect for creating daily auspicious threshold designs and festival floor patterns.",
        "queries": [
            "White rangoli powder muggulu pindi packet",
            "White Rangoli powder pack",
            "Rangoli powder 1kg packet"
        ],
        "variants": [
            {"size_label": "500 g", "mrp": 30, "price": 30, "stock": 50},
            {"size_label": "1 kg", "mrp": 55, "price": 55, "stock": 50}
        ]
    },
    {
        "id": "g1-hh158",
        "name": "Ready-to-Use Ghee Diya Wicks",
        "brand_id": "brand-deepam",
        "brand": "Deepam",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-158-ghee-diya-wicks.webp",
        "description": "Pre-soaked ready pure ghee cotton diya wicks (Ghee Batti) for effortless, mess-free daily evening aarti and temple worship.",
        "queries": [
            "Ready to use ghee diya wicks box",
            "Ghee batti ready wicks pack",
            "Ghee Diya Wicks 30 wicks packshot"
        ],
        "variants": [
            {"size_label": "Box of 30 Wicks", "mrp": 99, "price": 99, "stock": 40}
        ]
    },
    {
        "id": "g1-hh159",
        "name": "Moli Kalava Sacred Cotton Pooja Thread",
        "brand_id": "brand-g1",
        "brand": "G1 Mart Puja Essentials",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Puja Essentials",
        "subCategory": "Puja Essentials",
        "image_url": "/products/verified/hh-159-moli-kalava-thread.webp",
        "description": "Auspicious red and yellow cotton wrist protection thread (Mauli Raksha Sutra / Kalava) for sacred tying during religious pujas and havan.",
        "queries": [
            "Moli Kalava sacred cotton pooja thread roll",
            "Mauli kalava cotton thread roll",
            "Puja Kalava roll packshot"
        ],
        "variants": [
            {"size_label": "1 Roll", "mrp": 20, "price": 20, "stock": 50}
        ]
    },

    # 2. Kitchen Hardware & Quick Fixes (kitchenware)
    {
        "id": "g1-hh160",
        "name": "Pigeon Stainless Steel Gas Lighter",
        "brand_id": "brand-pigeon",
        "brand": "Pigeon",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-160-pigeon-gas-lighter.webp",
        "description": "Durable stainless steel spark ignition gas stove lighter with comfortable ergonomic grip, engineered for thousands of reliable sparks.",
        "queries": [
            "Pigeon stainless steel gas lighter pack",
            "Pigeon gas lighter packshot",
            "Pigeon kitchen gas lighter single"
        ],
        "variants": [
            {"size_label": "1 Piece", "mrp": 99, "price": 99, "stock": 40}
        ]
    },
    {
        "id": "g1-hh161",
        "name": "Pressure Cooker Universal Rubber Gasket",
        "brand_id": "brand-prestige",
        "brand": "Prestige",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-161-pressure-cooker-gasket.webp",
        "description": "Food-grade high elasticity sealing ring gasket for pressure cookers, ensuring airtight safety and optimal steam retention.",
        "queries": [
            "Pressure cooker gasket sealing ring 3L 5L pack",
            "Prestige pressure cooker rubber gasket packshot",
            "Cooker gasket ring 5 litre"
        ],
        "variants": [
            {"size_label": "3 Litre", "mrp": 40, "price": 40, "stock": 40},
            {"size_label": "5 Litre", "mrp": 50, "price": 50, "stock": 40}
        ]
    },
    {
        "id": "g1-hh162",
        "name": "Fevikwik Instant Adhesive Super Glue",
        "brand_id": "brand-fevikwik",
        "brand": "Fevikwik",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-162-fevikwik-instant-adhesive.webp",
        "description": "One-drop instant cyanoacrylate super glue that bonds plastic, rubber, wood, metal, and ceramics in just seconds.",
        "queries": [
            "Fevikwik instant adhesive tube pack",
            "Fevikwik 1 drop super glue packshot",
            "Fevikwik 1g tube"
        ],
        "variants": [
            {"size_label": "0.5 g", "mrp": 5, "price": 5, "stock": 100},
            {"size_label": "1 g", "mrp": 10, "price": 10, "stock": 100}
        ]
    },
    {
        "id": "g1-hh163",
        "name": "Fevicol MR General Purpose Craft Glue",
        "brand_id": "brand-fevicol",
        "brand": "Fevicol",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-163-fevicol-mr-glue.webp",
        "description": "Non-staining synthetic white adhesive with precision squeeze nozzle for paper, cardboard, craft, and everyday household fixes.",
        "queries": [
            "Fevicol MR squeezy bottle pack",
            "Fevicol MR craft glue bottle",
            "Fevicol MR 100g packshot"
        ],
        "variants": [
            {"size_label": "50 g", "mrp": 25, "price": 25, "stock": 50},
            {"size_label": "100 g", "mrp": 45, "price": 45, "stock": 50}
        ]
    },
    {
        "id": "g1-hh164",
        "name": "Scotch-Brite Cellulose Sponge Wipes",
        "brand_id": "brand-scotch-brite",
        "brand": "Scotch-Brite",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-164-scotch-brite-sponge-wipes.webp",
        "description": "Natural biodegradable cellulose sponge wipes that absorb up to 10 times their weight in water for scratch-free, lint-free kitchen countertops.",
        "queries": [
            "Scotch-Brite Cellulose Sponge Wipes 3 pack",
            "Scotch Brite sponge wipe 3 piece packshot",
            "Scotch-Brite kitchen wipe pack"
        ],
        "variants": [
            {"size_label": "Pack of 3 Wipes", "mrp": 125, "price": 125, "stock": 40}
        ]
    },
    {
        "id": "g1-hh165",
        "name": "Stainless Steel Vegetable Peeler & Knife Set",
        "brand_id": "brand-g1",
        "brand": "G1 Mart Kitchenware",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-165-peeler-knife-set.webp",
        "description": "Razor-sharp stainless steel fruit and vegetable peeler paired with an all-purpose utility kitchen knife for quick daily chopping.",
        "queries": [
            "Stainless steel vegetable peeler and kitchen knife set",
            "Kitchen peeler and knife set pack",
            "Stainless steel fruit peeler knife blister pack"
        ],
        "variants": [
            {"size_label": "1 Set (Peeler + Knife)", "mrp": 75, "price": 75, "stock": 40}
        ]
    },
    {
        "id": "g1-hh166",
        "name": "Multi-Purpose Stainless Steel Kitchen Scissors",
        "brand_id": "brand-g1",
        "brand": "G1 Mart Kitchenware",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Bathroom & Home Accessories",
        "subCategory": "Bathroom & Home Accessories",
        "image_url": "/products/verified/hh-166-kitchen-scissors.webp",
        "description": "Heavy-duty rust-resistant kitchen shears with integrated bottle opener and nutcracker for cutting milk pouches, vegetables, and packaging.",
        "queries": [
            "Stainless steel kitchen scissors multi purpose",
            "Heavy duty kitchen shears scissors pack",
            "Kitchen utility scissors packshot"
        ],
        "variants": [
            {"size_label": "1 Piece", "mrp": 99, "price": 99, "stock": 40}
        ]
    },
    {
        "id": "g1-hh167",
        "name": "Disposable Paper Tea Cups & Meal Plates Set",
        "brand_id": "brand-origami",
        "brand": "Origami",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Disposables & Paper Products",
        "subCategory": "Disposables & Paper Products",
        "image_url": "/products/verified/hh-167-paper-cups-plates.webp",
        "description": "Hygienic eco-friendly disposable paper tea cups and sturdy meal plates suitable for pujas, parties, catering, and outdoor picnics.",
        "queries": [
            "Disposable paper cups and plates pack",
            "Paper tea cups 100ml pack of 50",
            "Disposable paper plates 10 inch pack"
        ],
        "variants": [
            {"size_label": "Pack of 50 Cups (100 ml)", "mrp": 45, "price": 45, "stock": 50},
            {"size_label": "Pack of 25 Plates (10 inch)", "mrp": 65, "price": 65, "stock": 50}
        ]
    },
    {
        "id": "g1-hh168",
        "name": "Disposable Aluminium Foil Food Containers with Lids",
        "brand_id": "brand-freshwrapp",
        "brand": "Freshwrapp",
        "category_id": "kitchenware",
        "category": "Kitchen Utility & Hardware",
        "sub_category": "Disposables & Paper Products",
        "subCategory": "Disposables & Paper Products",
        "image_url": "/products/verified/hh-168-foil-containers.webp",
        "description": "Oven and freezer safe heavy aluminium foil containers with matching card lids to preserve freshness, warmth, and aroma for meals.",
        "queries": [
            "Aluminium foil food container with lid 450ml pack 10",
            "Disposable aluminium food box with lid pack",
            "Aluminium foil meal container packshot"
        ],
        "variants": [
            {"size_label": "Pack of 10 Containers (450 ml)", "mrp": 75, "price": 75, "stock": 50}
        ]
    },

    # 3. Pest Control & Specialty Cleaners (floor-surface-cleaners)
    {
        "id": "g1-hh169",
        "name": "Laxman Rekha Cockroach & Ant Killer Chalk",
        "brand_id": "brand-laxman-rekha",
        "brand": "Laxman Rekha",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Mosquito & Pest Repellents",
        "subCategory": "Mosquito & Pest Repellents",
        "image_url": "/products/verified/hh-169-laxman-rekha-chalk.webp",
        "description": "India's legendary insecticide chalk that forms an invisible lethal barrier against crawling cockroaches and ants along kitchen borders.",
        "queries": [
            "Laxman Rekha cockroach ant chalk pack",
            "Laxman Rekha chalk box packshot",
            "Laxman Rekha insect killer chalk"
        ],
        "variants": [
            {"size_label": "1 Chalk Stick (15 g)", "mrp": 15, "price": 15, "stock": 80}
        ]
    },
    {
        "id": "g1-hh170",
        "name": "HIT Anti-Roach Gel Syringe",
        "brand_id": "brand-hit",
        "brand": "HIT",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Mosquito & Pest Repellents",
        "subCategory": "Mosquito & Pest Repellents",
        "image_url": "/products/verified/hh-170-hit-anti-roach-gel.webp",
        "description": "Odorless kitchen-safe cockroach bait gel with targeted syringe applicator, killing roaches and their entire nest for up to 45 days.",
        "queries": [
            "HIT Anti Roach Gel syringe pack",
            "Godrej HIT cockroach gel syringe 20g packshot",
            "HIT cockroach gel blister pack"
        ],
        "variants": [
            {"size_label": "20 g Syringe", "mrp": 199, "price": 199, "stock": 40}
        ]
    },
    {
        "id": "g1-hh171",
        "name": "Odomos Mosquito Repellent Cream",
        "brand_id": "brand-odomos",
        "brand": "Odomos",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Mosquito & Pest Repellents",
        "subCategory": "Mosquito & Pest Repellents",
        "image_url": "/products/verified/hh-171-odomos-repellent-cream.webp",
        "description": "Dermatologically tested skin-safe mosquito repellent cream with Vitamin E and Almond Oil providing up to 8 hours protection from dengue & malaria mosquitoes.",
        "queries": [
            "Odomos Mosquito Repellent Cream tube pack",
            "Odomos cream 100g tube packshot",
            "Dabur Odomos non sticky mosquito repellent cream"
        ],
        "variants": [
            {"size_label": "50 g", "mrp": 60, "price": 60, "stock": 50},
            {"size_label": "100 g", "mrp": 110, "price": 110, "stock": 50}
        ]
    },
    {
        "id": "g1-hh172",
        "name": "Goodknight Fabric Roll-On Mosquito Repellent",
        "brand_id": "brand-goodknight",
        "brand": "Goodknight",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Mosquito & Pest Repellents",
        "subCategory": "Mosquito & Pest Repellents",
        "image_url": "/products/verified/hh-172-goodknight-fabric-rollon.webp",
        "description": "100% natural citronella and eucalyptus oil fabric roll-on; apply 4 easy coin-sized dots on clothes for 8 hours outdoor mosquito protection.",
        "queries": [
            "Goodknight Fabric Roll-On 8ml bottle pack",
            "Good knight fabric roll on packshot",
            "Goodknight fabric roll on citrus"
        ],
        "variants": [
            {"size_label": "8 ml Bottle", "mrp": 75, "price": 75, "stock": 50}
        ]
    },
    {
        "id": "g1-hh173",
        "name": "Harpic Flushmatic In-Cistern Toilet Block",
        "brand_id": "brand-harpic",
        "brand": "Harpic",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Toilet & Bathroom Cleaners",
        "subCategory": "Toilet & Bathroom Cleaners",
        "image_url": "/products/verified/hh-173-harpic-flushmatic-block.webp",
        "description": "Automatic in-cistern drop-in toilet block that produces continuous rich blue foam with pine fragrance to clean and prevent limescale build-up.",
        "queries": [
            "Harpic Flushmatic In-Cistern Toilet Block twin pack",
            "Harpic Flushmatic Aquamarine packshot",
            "Harpic flushmatic 2 x 50g pack"
        ],
        "variants": [
            {"size_label": "Twin Pack (2 x 50 g)", "mrp": 140, "price": 140, "stock": 40}
        ]
    },
    {
        "id": "g1-hh174",
        "name": "Harpic White & Shine Bleach Toilet Cleaner",
        "brand_id": "brand-harpic",
        "brand": "Harpic",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Toilet & Bathroom Cleaners",
        "subCategory": "Toilet & Bathroom Cleaners",
        "image_url": "/products/verified/hh-174-harpic-white-and-shine.webp",
        "description": "Thick active bleach toilet cleaning liquid engineered specifically to restore dazzling shine and eradicate dull yellow stains on ceramic toilet bowls.",
        "queries": [
            "Harpic White and Shine Bleach Toilet Cleaner 750ml bottle",
            "Harpic White & Shine bottle packshot",
            "Harpic White & Shine Bleach 750ml"
        ],
        "variants": [
            {"size_label": "750 ml", "mrp": 165, "price": 165, "stock": 40}
        ]
    },
    {
        "id": "g1-hh175",
        "name": "Mangalam CamPure Camphor Cone Air Freshener",
        "brand_id": "brand-mangalam",
        "brand": "Mangalam",
        "category_id": "floor-surface-cleaners",
        "category": "Cleaners & Pest Control",
        "sub_category": "Air Fresheners",
        "subCategory": "Air Fresheners",
        "image_url": "/products/verified/hh-175-mangalam-campure-cone.webp",
        "description": "Natural pure camphor hanging cone air freshener with mosquito repelling properties; ideal for wardrobes, closets, bathrooms, and car interiors.",
        "queries": [
            "Mangalam CamPure Camphor Cone air freshener 60g pack",
            "Mangalam Campure camphor cone packshot",
            "CamPure Camphor Cone hanging"
        ],
        "variants": [
            {"size_label": "60 g Hanging Cone", "mrp": 149, "price": 149, "stock": 40}
        ]
    },

    # 4. Laundry & Fabric Care (laundry-detergents)
    {
        "id": "g1-hh176",
        "name": "Henko Stain Care Detergent Powder",
        "brand_id": "brand-henko",
        "brand": "Henko",
        "category_id": "laundry-detergents",
        "category": "Detergents & Laundry",
        "sub_category": "Detergent Powders",
        "subCategory": "Detergent Powders",
        "image_url": "/products/verified/hh-176-henko-stain-care-powder.webp",
        "description": "Advanced lint-reduction and oxygen stain-buster washing powder formulated to remove stubborn food stains while preserving fabric fiber smoothness.",
        "queries": [
            "Henko Stain Care Detergent Powder 1kg pack",
            "Henko Stain Care washing powder pouch packshot",
            "Henko Stain Care 500g pouch"
        ],
        "variants": [
            {"size_label": "500 g", "mrp": 65, "price": 65, "stock": 50},
            {"size_label": "1 kg", "mrp": 125, "price": 125, "stock": 50}
        ]
    },
    {
        "id": "g1-hh177",
        "name": "Comfort Fabric Conditioner Lily Fresh (Pink)",
        "brand_id": "brand-comfort",
        "brand": "Comfort",
        "category_id": "laundry-detergents",
        "category": "Detergents & Laundry",
        "sub_category": "Fabric Care & Additives",
        "subCategory": "Fabric Care & Additives",
        "image_url": "/products/verified/hh-177-comfort-lily-fresh-pink.webp",
        "description": "After-wash fabric conditioner with delicate Lily fragrance pearls that untangles cloth fibers, prevents dullness, and imparts 14-day floral freshness.",
        "queries": [
            "Comfort Fabric Conditioner Lily Fresh pink bottle pack",
            "Comfort Lily Fresh pink bottle packshot",
            "Comfort fabric conditioner pink 860ml"
        ],
        "variants": [
            {"size_label": "220 ml", "mrp": 62, "price": 62, "stock": 40},
            {"size_label": "860 ml", "mrp": 235, "price": 235, "stock": 40}
        ]
    },
    {
        "id": "g1-hh178",
        "name": "Robin Liquid Blue Fabric Whitener",
        "brand_id": "brand-robin",
        "brand": "Robin",
        "category_id": "laundry-detergents",
        "category": "Detergents & Laundry",
        "sub_category": "Fabric Care & Additives",
        "subCategory": "Fabric Care & Additives",
        "image_url": "/products/verified/hh-178-robin-liquid-blue.webp",
        "description": "Classic post-wash liquid blue whitener with ultra-fine blue suspension for radiant brightness on white school shirts, dhotis, and bed linens.",
        "queries": [
            "Robin Liquid Blue fabric whitener bottle pack",
            "Robin Blue liquid bottle packshot",
            "Robin Liquid Blue 100ml bottle"
        ],
        "variants": [
            {"size_label": "100 ml", "mrp": 25, "price": 25, "stock": 50},
            {"size_label": "200 ml", "mrp": 48, "price": 48, "stock": 50}
        ]
    },
    {
        "id": "g1-hh179",
        "name": "Vanish All-in-One Liquid Stain Remover",
        "brand_id": "brand-vanish",
        "brand": "Vanish",
        "category_id": "laundry-detergents",
        "category": "Detergents & Laundry",
        "sub_category": "Fabric Care & Additives",
        "subCategory": "Fabric Care & Additives",
        "image_url": "/products/verified/hh-179-vanish-liquid-stain-remover.webp",
        "description": "Chlorine-free Oxi Action liquid booster safe for both colored and white garments; easily removes cuff stains, tea, ink, and curry marks.",
        "queries": [
            "Vanish All in One Liquid Stain Remover 800ml bottle pack",
            "Vanish Oxi Action liquid bottle packshot",
            "Vanish liquid fabric stain remover"
        ],
        "variants": [
            {"size_label": "800 ml", "mrp": 215, "price": 215, "stock": 40}
        ]
    },

    # 5. Dishwash & Batteries (dishwash & pooja-needs / Home Utilities)
    {
        "id": "g1-hh180",
        "name": "Vim Dishwash Bar with Waterproof Polycoat",
        "brand_id": "brand-vim",
        "brand": "Vim",
        "category_id": "dishwash",
        "category": "Dishwash & Scrubbers",
        "sub_category": "Dishwash Bars",
        "subCategory": "Dishwash Bars",
        "image_url": "/products/verified/hh-180-vim-polycoat-bar.webp",
        "description": "Vim lemon power dishwash bar featuring an innovative waterproof plastic undercoat that prevents the bar from dissolving or turning soggy in soap holders.",
        "queries": [
            "Vim Dishwash Bar with Polycoat waterproof pack",
            "Vim polycoat dishwash bar packshot",
            "Vim bar polycoat 200g 300g"
        ],
        "variants": [
            {"size_label": "200 g", "mrp": 20, "price": 20, "stock": 60},
            {"size_label": "300 g", "mrp": 30, "price": 30, "stock": 60}
        ]
    },
    {
        "id": "g1-hh181",
        "name": "Pril Tamarind Active Shine Dishwash Liquid",
        "brand_id": "brand-pril",
        "brand": "Pril",
        "category_id": "dishwash",
        "category": "Dishwash & Scrubbers",
        "sub_category": "Dishwash Liquids",
        "subCategory": "Dishwash Liquids",
        "image_url": "/products/verified/hh-181-pril-tamarind-liquid.webp",
        "description": "Formulated with real natural tamarind extract and grease-cutting molecules for deep stain removal and dazzling mirror shine on steel and glassware.",
        "queries": [
            "Pril Tamarind dishwash liquid bottle pack",
            "Pril Tamarind Active Shine liquid packshot",
            "Pril Tamarind 425ml bottle"
        ],
        "variants": [
            {"size_label": "225 ml", "mrp": 60, "price": 60, "stock": 40},
            {"size_label": "425 ml", "mrp": 110, "price": 110, "stock": 40}
        ]
    },
    {
        "id": "g1-hh182",
        "name": "Scotch-Brite Bottle Cleaning Brush",
        "brand_id": "brand-scotch-brite",
        "brand": "Scotch-Brite",
        "category_id": "dishwash",
        "category": "Dishwash & Scrubbers",
        "sub_category": "Scrubbers & Sponges",
        "subCategory": "Scrubbers & Sponges",
        "image_url": "/products/verified/hh-182-scotch-brite-bottle-brush.webp",
        "description": "Specialized flexible long-handle bottle brush with durable sponge tip designed to clean narrow neck water bottles, thermos flasks, and feeding bottles.",
        "queries": [
            "Scotch-Brite Bottle Cleaning Brush pack",
            "Scotch Brite bottle cleaner brush packshot",
            "Scotch-Brite bottle cleaner brush"
        ],
        "variants": [
            {"size_label": "1 Piece", "mrp": 110, "price": 110, "stock": 40}
        ]
    },
    {
        "id": "g1-hh183",
        "name": "Nippo Gold Heavy Duty AA Batteries",
        "brand_id": "brand-nippo",
        "brand": "Nippo",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Home Utilities",
        "subCategory": "Home Utilities",
        "image_url": "/products/verified/hh-183-nippo-gold-aa-batteries.webp",
        "description": "India's trusted red-and-gold zinc carbon AA pencil batteries offering dependable performance for wall clocks, remote controls, toys, and flashlights.",
        "queries": [
            "Nippo Gold Heavy Duty AA batteries pack",
            "Nippo Gold AA pencil battery blister packshot",
            "Nippo Gold AA pack of 4"
        ],
        "variants": [
            {"size_label": "Pack of 2", "mrp": 30, "price": 30, "stock": 50},
            {"size_label": "Pack of 4", "mrp": 60, "price": 60, "stock": 50}
        ]
    },
    {
        "id": "g1-hh184",
        "name": "Nippo Gold Heavy Duty AAA Batteries",
        "brand_id": "brand-nippo",
        "brand": "Nippo",
        "category_id": "pooja-needs",
        "category": "Pooja Essentials",
        "sub_category": "Home Utilities",
        "subCategory": "Home Utilities",
        "image_url": "/products/verified/hh-184-nippo-gold-aaa-batteries.webp",
        "description": "Long-life zinc chloride AAA small pencil batteries providing leakage-resistant power for TV remotes, AC remotes, wireless mice, and electronic gadgets.",
        "queries": [
            "Nippo Gold Heavy Duty AAA batteries pack",
            "Nippo Gold AAA battery blister packshot",
            "Nippo Gold AAA pack of 4"
        ],
        "variants": [
            {"size_label": "Pack of 2", "mrp": 30, "price": 30, "stock": 50},
            {"size_label": "Pack of 4", "mrp": 60, "price": 60, "stock": 50}
        ]
    }
]

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = os.path.join(ROOT, 'data', 'verified_household_expansion_35.json')

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(products)} products in {DATA_PATH}")
