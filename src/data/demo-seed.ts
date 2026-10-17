import type { Category, Section } from '@/types';
import categoryTilesData from './categoryTiles.json';

const CATEGORY_TILES: Record<string, string> = categoryTilesData;
const getCategoryTile = (id: string): string => CATEGORY_TILES[id] || `/categories/collages/${id}.webp`;

// Load migrated products directly to determine category counts
import migratedProductsData from '../../data/migrated_products.json';
const MIGRATED_PROD_ROWS: Array<{ id: string; category_id?: string | null }> = migratedProductsData;

export const DEMO_SECTIONS: Section[] = [
  { id: 'grocery-kitchen', name: 'Grocery & Kitchen (కిరాణా & నిత్యావసరాలు)', sort_order: 1 },
  { id: 'dairy-breakfast', name: 'Dairy & Breakfast (డైరీ & బ్రేక్‌ఫాస్ట్)', sort_order: 2 },
  { id: 'snacks-drinks', name: 'Snacks & Drinks (స్నాక్స్ & పానీయాలు)', sort_order: 3 },
  { id: 'personal-care', name: 'Personal Care (వ్యక్తిగత సంరక్షణ)', sort_order: 4 },
  { id: 'household', name: 'Household & Pooja (ఇంటి శుభ్రత & పూజ)', sort_order: 5 },
];

export const SUPERMARKET_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    "id": "atta-rice-dal",
    "name": "Rice, Atta & Flours",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/atta-rice-dal.webp",
    "image": "/categories/collages/atta-rice-dal.webp",
    "sort_order": 1,
    "icon": "Wheat",
    "description": "Chakki fresh atta, Sonamasuri & Basmati rice, idli rava, maida and millets",
    "subcategories": [
      "Atta & Wheat Flour",
      "Sonamasuri & Basmati Rice",
      "Idli & Bombay Rava",
      "Maida & Besan",
      "Millets & Poha"
    ]
  },
  {
    "id": "local-dals",
    "name": "Dals & Pulses",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/local-dals.webp",
    "image": "/categories/collages/local-dals.webp",
    "sort_order": 2,
    "icon": "Wheat",
    "description": "Kandi pappu (Toor dal), minapappu (Urad dal), pesara pappu (Moong), senagalu and peanuts",
    "subcategories": [
      "Kandi Pappu (Toor Dal)",
      "Minapappu (Urad Dal)",
      "Pesara Pappu (Moong)",
      "Senaga Pappu (Chana Dal)",
      "Peanuts & Fried Gram",
      "Specialty Dals & Pulses"
    ]
  },
  {
    "id": "oil-ghee-masala",
    "name": "Oils & Ghee",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/oil-ghee-masala.webp",
    "image": "/categories/collages/oil-ghee-masala.webp",
    "sort_order": 3,
    "icon": "Sparkles",
    "description": "Refined sunflower oils, groundnut oils, pure cow ghee (GRB, Amul, Aashirvaad), pooja & castor oils",
    "subcategories": [
      "Sunflower Oil",
      "Groundnut Oil",
      "Pure Cow Ghee",
      "Deepam & Pooja Oils"
    ]
  },
  {
    "id": "spices-masalas",
    "name": "Spices & Masalas",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/spices-masalas.webp",
    "image": "/categories/collages/spices-masalas.webp",
    "sort_order": 4,
    "icon": "Sparkles",
    "description": "Turmeric, chilli powder, whole jeera, mustard, chicken & mutton masalas, sambar and rasam powders",
    "subcategories": [
      "Chilli & Turmeric Powder",
      "Chicken & Meat Masalas",
      "Garam & Biryani Masalas",
      "Whole Spices & Jeera",
      "Sambar & Rasam Powders",
      "Ginger Garlic Paste"
    ]
  },
  {
    "id": "sugar-salt-staples",
    "name": "Salt, Sugar & Jaggery",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/sugar-salt-staples.webp",
    "image": "/categories/collages/sugar-salt-staples.webp",
    "sort_order": 5,
    "icon": "Wheat",
    "description": "Tata salt, crystal kallu uppu, sulphur-free sugar, country bellam (jaggery) and pure honey",
    "subcategories": [
      "Tata & Crystal Salt",
      "Sugar & Sulphur-Free",
      "Country Bellam (Jaggery)",
      "Pure Honey & Tamarind"
    ]
  },
  {
    "id": "dry-fruits-cereals",
    "name": "Dry Fruits & Nuts",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/dry-fruits-cereals.webp",
    "image": "/categories/collages/dry-fruits-cereals.webp",
    "sort_order": 6,
    "icon": "Cookie",
    "description": "Premium jeedi pappu (cashews), badam (almonds), kismis, pista and Lion dates",
    "subcategories": [
      "Cashews (Jeedi Pappu)",
      "Almonds (Badam)",
      "Kismis & Raisins",
      "Pistachios & Walnuts",
      "Lion Dates & Anjeer"
    ]
  },
  {
    "id": "vegetables-fruits",
    "name": "Fresh Vegetables & Produce",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/vegetables-fruits.webp",
    "image": "/categories/collages/vegetables-fruits.webp",
    "sort_order": 7,
    "icon": "Apple",
    "description": "Farm-fresh onions, potatoes, tomatoes, fresh chillies, garlic and fruits",
    "subcategories": [
      "Fresh Onions & Potatoes",
      "Fresh Tomatoes & Chillies",
      "Ginger & Garlic",
      "Fresh Farm Fruits"
    ]
  },
  {
    "id": "local-millets",
    "name": "Millets & Grains",
    "section_id": "grocery-kitchen",
    "tile_image_url": "/categories/collages/local-millets.webp",
    "image": "/categories/collages/local-millets.webp",
    "sort_order": 8,
    "icon": "Wheat",
    "description": "Nutritious foxtail millets (Korralu), pearl millet (Sajjalu), jowar, whole ragi, poha and suji rava",
    "subcategories": [
      "Millets (Korralu & Sajjalu)",
      "Jowar & Whole Ragi",
      "Poha & Sabudana",
      "Ragi Pindi & Health Flours",
      "Upma & Idli Rava"
    ]
  },
  {
    "id": "dairy-bread-eggs",
    "name": "Dairy, Bread & Eggs",
    "section_id": "dairy-breakfast",
    "tile_image_url": "/categories/collages/dairy-bread-eggs.webp",
    "image": "/categories/collages/dairy-bread-eggs.webp",
    "sort_order": 1,
    "icon": "Milk",
    "description": "Fresh milk (Arokya, Heritage, Dodla, Amul), curd pouches, buttermilk, paneer, butter and fresh bread",
    "subcategories": [
      "Fresh Milk & Curd",
      "Paneer, Butter & Cheese",
      "Chilled Buttermilk & Shakes",
      "Fresh Bread"
    ]
  },
  {
    "id": "ice-creams",
    "name": "Ice Creams & Frozen Desserts",
    "section_id": "dairy-breakfast",
    "tile_image_url": "/categories/collages/ice-creams.webp",
    "image": "/categories/collages/ice-creams.webp",
    "sort_order": 2,
    "icon": "Sparkles",
    "description": "Arun Icecreams cones, cups, chocobars, kulfi, family tubs and Amul ice creams",
    "subcategories": [
      "Arun Icecreams Sticks & Bars",
      "Cones & Sundaes",
      "Cups & Kulfi Treats",
      "Sandwiches & Bites",
      "Family Tubs (750ml & 1L)"
    ]
  },
  {
    "id": "instant-food",
    "name": "Noodles & Instant Food",
    "section_id": "dairy-breakfast",
    "tile_image_url": "/categories/collages/instant-food.webp",
    "image": "/categories/collages/instant-food.webp",
    "sort_order": 2,
    "icon": "Sparkles",
    "description": "Maggi 2-minute noodles, Yippee, Bambino semiya, pasta and MTR breakfast mixes",
    "subcategories": [
      "Maggi & Instant Noodles",
      "Bambino Semiya & Vermicelli",
      "Pasta & Macaroni",
      "MTR Breakfast Mixes",
      "Oats & Cornflakes"
    ]
  },
  {
    "id": "biscuits-bakery",
    "name": "Biscuits, Cookies & Rusks",
    "section_id": "dairy-breakfast",
    "tile_image_url": "/categories/collages/biscuits-bakery.webp",
    "image": "/categories/collages/biscuits-bakery.webp",
    "sort_order": 3,
    "icon": "Cookie",
    "description": "Parle-G, Good Day, Marie Gold, Oreo, Bourbon, tea rusks and bakery cakes",
    "subcategories": [
      "Parle-G & Glucose",
      "Good Day & Cookies",
      "Marie Gold & Rusks",
      "Oreo & Cream Biscuits",
      "Bakery Cakes"
    ]
  },
  {
    "id": "sauces-spreads",
    "name": "Sauces & Spreads",
    "section_id": "dairy-breakfast",
    "tile_image_url": "/categories/collages/sauces-spreads.webp",
    "image": "/categories/collages/sauces-spreads.webp",
    "sort_order": 4,
    "icon": "Sparkles",
    "description": "Tomato ketchup, mayonnaise, fruit jams, dips and peanut butter",
    "subcategories": [
      "Tomato Ketchup & Sauces",
      "Mayonnaise & Dips",
      "Fruit Jams",
      "Peanut Butter & Spreads"
    ]
  },
  {
    "id": "pickles",
    "name": "Pickles & Chutneys",
    "section_id": "dairy-breakfast",
    "tile_image_url": "/categories/collages/pickles.webp",
    "image": "/categories/collages/pickles.webp",
    "sort_order": 5,
    "icon": "Sparkles",
    "description": "Authentic Andhra avakaya, mango pickles, gongura pachadi, tomato and lemon pickles",
    "subcategories": [
      "Andhra Avakaya & Mango Pickles",
      "Gongura & Tomato Pachadi",
      "Lemon & Red Chilli Pickles",
      "Chutneys & Podis"
    ]
  },
  {
    "id": "chips-namkeen",
    "name": "Namkeen, Mixture & Chips",
    "section_id": "snacks-drinks",
    "tile_image_url": "/categories/collages/chips-namkeen.webp",
    "image": "/categories/collages/chips-namkeen.webp",
    "sort_order": 1,
    "icon": "Cookie",
    "description": "Haldiram's mixture, murukku, chekkalu, puffed rice (borugulu), Lays and Kurkure",
    "subcategories": [
      "Haldiram Mixture & Sev",
      "Murukku & Chekkalu",
      "Puffed Rice (Borugulu)",
      "Potato Chips (Lays, Kurkure)",
      "Pani Puri Papad & Fryums"
    ]
  },
  {
    "id": "sweets-chocolates",
    "name": "Chocolates, Candies & Sweets",
    "section_id": "snacks-drinks",
    "tile_image_url": "/categories/collages/sweets-chocolates.webp",
    "image": "/categories/collages/sweets-chocolates.webp",
    "sort_order": 2,
    "icon": "Heart",
    "description": "Cadbury Dairy Milk, 5 Star, KitKat, Choclairs, Center Fresh, peanut chikki and traditional sweets",
    "subcategories": [
      "Cadbury Dairy Milk & Silk",
      "5 Star, Perk & KitKat",
      "Choclairs, Candies & Gums",
      "Peanut Chikki & Soan Papdi"
    ]
  },
  {
    "id": "tea-coffee-milk-drinks",
    "name": "Tea, Coffee & Health Drinks",
    "section_id": "snacks-drinks",
    "tile_image_url": "/categories/collages/tea-coffee-milk-drinks.webp",
    "image": "/categories/collages/tea-coffee-milk-drinks.webp",
    "sort_order": 3,
    "icon": "Coffee",
    "description": "Gemini tea, Red Label, Bru coffee, Sunrise, Nescafe, Horlicks, Boost and Bournvita",
    "subcategories": [
      "Gemini Tea & Red Label",
      "Bru & Sunrise Coffee",
      "Filter Coffee & Nescafe",
      "Horlicks, Boost & Bournvita"
    ]
  },
  {
    "id": "drinks-juices",
    "name": "Cold Drinks, Juices & Soda",
    "section_id": "snacks-drinks",
    "tile_image_url": "/categories/collages/drinks-juices.webp",
    "image": "/categories/collages/drinks-juices.webp",
    "sort_order": 4,
    "icon": "Coffee",
    "description": "Thums Up, Sprite, Maaza, Slice, Real fruit juices, Kinley soda and drinking water",
    "subcategories": [
      "Thums Up, Sprite & Colas",
      "Maaza, Slice & Mango",
      "Real Fruit Juices",
      "Kinley Soda & Water",
      "Energy Drinks & Glucon-D"
    ]
  },
  {
    "id": "soaps-bath",
    "name": "Bathing Soaps & Handwash",
    "section_id": "personal-care",
    "tile_image_url": "/categories/collages/soaps-bath.webp",
    "image": "/categories/collages/soaps-bath.webp",
    "sort_order": 1,
    "icon": "Sparkles",
    "description": "Lifebuoy, Lux, Dove, Santoor, Mysore Sandal, Dettol, Cinthol, Medimix, Pears and Nivea body wash",
    "subcategories": [
      "Bathing Soaps",
      "Hand Wash & Body Wash"
    ]
  },
  {
    "id": "hair-care",
    "name": "Hair Oils & Shampoos",
    "section_id": "personal-care",
    "tile_image_url": "/categories/collages/hair-care.webp",
    "image": "/categories/collages/hair-care.webp",
    "sort_order": 2,
    "icon": "Sparkles",
    "description": "Clinic Plus, Dove, Head & Shoulders, Sunsilk, Pantene, Parachute, Dabur Amla and Indulekha",
    "subcategories": [
      "Shampoo & Conditioner",
      "Hair Oils",
      "Hair Serum"
    ]
  },
  {
    "id": "oral-care",
    "name": "Toothpaste & Oral Care",
    "section_id": "personal-care",
    "tile_image_url": "/categories/collages/oral-care.webp",
    "image": "/categories/collages/oral-care.webp",
    "sort_order": 3,
    "icon": "Sparkles",
    "description": "Colgate Strong Teeth, MaxFresh, Active Salt, Dabur Red, Closeup, Sensodyne and Listerine",
    "subcategories": [
      "Toothpaste",
      "Toothbrushes & Mouthwash"
    ]
  },
  {
    "id": "skin-care",
    "name": "Skin Care, Talc & Grooming",
    "section_id": "personal-care",
    "tile_image_url": "/categories/collages/skin-care.webp",
    "image": "/categories/collages/skin-care.webp",
    "sort_order": 4,
    "icon": "Heart",
    "description": "Himalaya neem face wash, Glow & Lovely, Ponds cream, Nivea soft, Lacto Calamine and Boroplus",
    "subcategories": [
      "Face Wash",
      "Face Creams & Lotions",
      "Rose Water & Face Packs",
      "Skin Gels"
    ]
  },
  {
    "id": "baby-care",
    "name": "Baby Care",
    "section_id": "personal-care",
    "tile_image_url": "/categories/collages/baby-care.webp",
    "image": "/categories/collages/baby-care.webp",
    "sort_order": 5,
    "icon": "Baby",
    "description": "Pampers and Huggies diaper pants, Johnson's and Himalaya baby powder, lotion and massage oil",
    "subcategories": [
      "Baby Diapers & Wipes",
      "Baby Bath, Lotion & Powders"
    ]
  },
  {
    "id": "hygiene",
    "name": "Hygiene & Grooming",
    "section_id": "personal-care",
    "tile_image_url": "/categories/collages/hygiene.webp",
    "image": "/categories/collages/hygiene.webp",
    "sort_order": 6,
    "icon": "ShieldCheck",
    "description": "Whisper Ultra, Stayfree Secure, Fogg, Engage, Wild Stone, Gillette shaving and Veet",
    "subcategories": [
      "Deodorants & Fragrances",
      "Shaving & Hair Removal",
      "Sanitary Pads & Napkins"
    ]
  },
  {
    "id": "laundry-detergents",
    "name": "Detergents & Laundry",
    "section_id": "household",
    "tile_image_url": "/categories/collages/laundry-detergents.webp",
    "image": "/categories/collages/laundry-detergents.webp",
    "sort_order": 1,
    "icon": "ShieldCheck",
    "description": "Surf Excel, Rin, Tide, Ariel, Wheel detergent bars, Comfort conditioner and Ala bleach",
    "subcategories": [
      "Surf Excel, Rin & Tide Powder",
      "Detergent Bars & Soaps",
      "Comfort Fabric Conditioner",
      "Ala Bleach & Ujala"
    ]
  },
  {
    "id": "dishwash",
    "name": "Dishwash & Scrubbers",
    "section_id": "household",
    "tile_image_url": "/categories/collages/dishwash.webp",
    "image": "/categories/collages/dishwash.webp",
    "sort_order": 2,
    "icon": "ShieldCheck",
    "description": "Vim bar, Vim liquid gel, Pril, Exo bar, Scotch-Brite scrub pads and steel scrubbers",
    "subcategories": [
      "Vim Bar & Dishwash Gel",
      "Pril & Exo Bar",
      "Scotch-Brite Scrub Pads",
      "Steel Scrubbers"
    ]
  },
  {
    "id": "floor-surface-cleaners",
    "name": "Cleaners & Pest Control",
    "section_id": "household",
    "tile_image_url": "/categories/collages/floor-surface-cleaners.webp",
    "image": "/categories/collages/floor-surface-cleaners.webp",
    "sort_order": 3,
    "icon": "Home",
    "description": "Lizol floor cleaner, Harpic, Colin, Good Knight, All Out, Hit spray, brooms and mops",
    "subcategories": [
      "Lizol Floor Cleaner",
      "Harpic Toilet Cleaner",
      "Good Knight & All Out Refills",
      "Hit Mosquito Spray",
      "Brooms, Wipers & Mops"
    ]
  },
  {
    "id": "pooja-needs",
    "name": "Pooja Essentials",
    "section_id": "household",
    "tile_image_url": "/categories/collages/pooja-needs.webp",
    "image": "/categories/collages/pooja-needs.webp",
    "sort_order": 4,
    "icon": "Flame",
    "description": "Cycle Pure agarbatti, Mangaldeep, camphor (karpooram), deepam oil, cotton wicks and sambrani",
    "subcategories": [
      "Cycle Pure & Agarbatti",
      "Mangaldeep Dhoop & Cones",
      "Camphor (Karpooram)",
      "Deepam Oil & Cotton Wicks",
      "Sambrani & Pooja Essentials"
    ]
  },
  {
    "id": "kitchenware",
    "name": "Kitchen Utility & Hardware",
    "section_id": "household",
    "tile_image_url": "/categories/collages/kitchenware.webp",
    "image": "/categories/collages/kitchenware.webp",
    "sort_order": 5,
    "icon": "Home",
    "description": "Matchboxes, Freshwrapp aluminium foil, containers, water bottles, stationery and pet food",
    "subcategories": [
      "Matchboxes & Lighters",
      "Freshwrapp Aluminium Foil",
      "Food Storage Containers",
      "Water Bottles & Lunch Boxes",
      "Stationery & Pet Food"
    ]
  }
];

// Helper to determine item count for categories
export const DEMO_CATEGORIES: Category[] = SUPERMARKET_CATEGORIES.map((cat) => ({
  ...cat,
  itemCount: MIGRATED_PROD_ROWS.filter((p) => p.category_id === cat.id && (p as any).is_active !== false).length,
}));

export function getDemoCategoryById(id: string): Category | undefined {
  return DEMO_CATEGORIES.find((c) => c.id === id);
}
