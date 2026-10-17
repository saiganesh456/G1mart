/**
 * G1 Mart Supermarket — Category Tile Merchandising Configuration
 *
 * Each category maps to an ordered list of hero product IDs stocked in the store catalog.
 * A helper selects the first 2-3 products that have verified non-retailer packshots.
 * Tile compositions strictly enforce category exclusivity (no out-of-category items).
 */

const TILE_MAP = {
  // GROCERY & KITCHEN
  'atta-rice-dal': ['g1-p0457', 'g1-p0411', 'g1-p0428', 'g1-p0859'],
  'local-dals': ['g1-p0190', 'g1-p0081', 'g1-p0082', 'g1-p0195'],
  'oil-ghee-masala': ['g1-p0418', 'g1-p1627', 'g1-p0279', 'g1-p0459'],
  'spices-masalas': ['g1-p0074', 'g1-p0076', 'g1-p0739', 'g1-p0064'],
  'sauces-spreads': ['g1-p0311', 'g1-p0293', 'g1-p0314', 'g1-p0315'],
  'sugar-salt-staples': ['g1-p0202', 'g1-p1150', 'g1-p0185', 'g1-p0028'],
  'dry-fruits-cereals': ['g1-p0238', 'g1-p0077', 'g1-p0210', 'g1-p0323'],
  'vegetables-fruits': ['g1-p0236', 'g1-p0703', 'g1-p0748'],
  'local-millets': ['g1-ric050', 'g1-ric048', 'g1-ric049', 'g1-ric047'],

  // DAIRY & BREAKFAST
  'dairy-bread-eggs': ['g1-p0048', 'g1-p0022', 'g1-p1096', 'g1-p0032'],
  'breakfast-cereals': ['g1-p1112', 'g1-p0660', 'g1-p0273'],
  'biscuits-bakery': ['g1-bsc031', 'g1-bsc041', 'g1-bsc011', 'g1-bsc001'],
  'instant-food': ['g1-ins001', 'g1-ins004', 'g1-ins002', 'g1-ins005'],
  'pickles': ['g1-spc037', 'g1-spc038', 'g1-spc039', 'g1-p0650'],

  // SNACKS & DRINKS
  'chips-namkeen': ['g1-p0862', 'g1-p0861', 'g1-p1517', 'g1-p0541'],
  'sweets-chocolates': ['g1-p0746', 'g1-p0211', 'g1-p0747', 'g1-p0240'],
  'tea-coffee-milk-drinks': ['g1-p0317', 'g1-p0958', 'g1-p0585', 'g1-p0603'],
  'drinks-juices': ['g1-p0039', 'g1-p0058', 'g1-p0182', 'g1-p0944'],

  // HOUSEHOLD ESSENTIALS
  'laundry-detergents': ['g1-p0332', 'g1-p0036', 'g1-p0113', 'g1-p0053'],
  'dishwash': ['g1-p0425', 'g1-p0850', 'g1-p0307', 'g1-p0218'],
  'floor-surface-cleaners': ['g1-p0212', 'g1-p0220', 'g1-p0018', 'g1-p0441'],
  'pooja-needs': ['g1-p0450', 'g1-p0451', 'g1-p0282', 'g1-p0462'],
  'kitchenware': ['g1-p0029', 'g1-p0049', 'g1-p0770', 'g1-p0050'],

  // BEAUTY & PERSONAL CARE
  'soaps-bath': ['g1-p0189', 'g1-p0122', 'g1-p0515', 'g1-p0023'],
  'hair-care': ['g1-p0117', 'g1-p0101', 'g1-p0588', 'g1-p0435'],
  'hair-shampoos': ['g1-p0201', 'g1-p0617', 'g1-p1026', 'g1-p0424'],
  'oral-care': ['g1-p0551', 'g1-p0544', 'g1-p0547', 'g1-p0033'],
  'skin-care': ['g1-p0485', 'g1-p0193', 'g1-p0006', 'g1-p0140'],
  'baby-care': ['g1-p0020', 'g1-p0128', 'g1-p0105', 'g1-p0021'],
  'hygiene': ['g1-p0438', 'g1-p0090', 'g1-p0222', 'g1-p0099'],
  'shaving-grooming': ['g1-p1041', 'g1-p0321', 'g1-p0116', 'g1-p0131'],
};

/**
 * Shortened labels strictly fitting 2 lines without ellipsis truncation
 */
const TILE_LABELS = {
  'atta-rice-dal': 'Rice, Atta & Flours',
  'local-dals': 'Dals & Pulses',
  'oil-ghee-masala': 'Cooking Oils & Ghee',
  'spices-masalas': 'Spices & Masalas',
  'sauces-spreads': 'Sauces & Spreads',
  'sugar-salt-staples': 'Salt, Sugar & Jaggery',
  'dry-fruits-cereals': 'Dry Fruits & Nuts',
  'vegetables-fruits': 'Fresh Vegetables',
  'local-millets': 'Millets & Grains',

  'dairy-bread-eggs': 'Dairy, Bread & Eggs',
  'breakfast-cereals': 'Breakfast & Cereals',
  'biscuits-bakery': 'Biscuits & Cookies',
  'instant-food': 'Noodles & Pasta',
  'pickles': 'Pickles & Chutneys',

  'chips-namkeen': 'Namkeen & Chips',
  'sweets-chocolates': 'Chocolates & Sweets',
  'tea-coffee-milk-drinks': 'Tea, Coffee & Health',
  'drinks-juices': 'Cold Drinks & Juices',

  'laundry-detergents': 'Detergents & Laundry',
  'dishwash': 'Dishwash',
  'floor-surface-cleaners': 'Cleaners & Pest Control',
  'pooja-needs': 'Pooja Essentials',
  'kitchenware': 'Kitchen Utility',

  'soaps-bath': 'Soaps & Bodywash',
  'hair-care': 'Hair Oils',
  'hair-shampoos': 'Shampoos',
  'oral-care': 'Toothpaste & Oral Care',
  'skin-care': 'Skin & Talc',
  'baby-care': 'Baby Care',
  'hygiene': 'Feminine Hygiene',
  'shaving-grooming': 'Shaving & Grooming',
};

/**
 * Helper to pick the first 2-3 hero products with valid non-competitor images
 */
function getHeroProductsForTile(categoryId, products = []) {
  const heroIds = TILE_MAP[categoryId] || [];
  if (!products || products.length === 0) return heroIds.slice(0, 3);

  const prodById = new Map(products.map((p) => [p.id, p]));
  const picked = [];

  for (const pid of heroIds) {
    const prod = prodById.get(pid);
    if (!prod) continue;
    const img = prod.image_url || prod.image || '';
    // Must be a valid local image (no placeholder, no external competitor url)
    if (img && !img.includes('placeholder') && !img.startsWith('http') && !img.includes('bigbasket')) {
      picked.push(prod);
      if (picked.length >= 3) break;
    }
  }

  // Fallback to any valid product in category if fewer than 2 found
  if (picked.length < 2) {
    for (const prod of products) {
      if (prod.category_id !== categoryId && prod.category !== categoryId) continue;
      if (picked.some((p) => p.id === prod.id)) continue;
      const img = prod.image_url || prod.image || '';
      if (img && !img.includes('placeholder') && !img.startsWith('http') && !img.includes('bigbasket')) {
        picked.push(prod);
        if (picked.length >= 3) break;
      }
    }
  }

  return picked;
}

module.exports = {
  TILE_MAP,
  TILE_LABELS,
  getHeroProductsForTile,
};
