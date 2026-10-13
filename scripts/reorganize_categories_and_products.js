const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data');

const PRODS_PATH = path.join(DATA_DIR, 'migrated_products.json');
const VARS_PATH = path.join(DATA_DIR, 'migrated_product_variants.json');
const CATS_PATH = path.join(DATA_DIR, 'migrated_categories.json');
const CATALOG_PATH = path.join(SRC_DATA_DIR, 'products-catalog.json');
const DEMO_SEED_PATH = path.join(SRC_DATA_DIR, 'demo-seed.ts');
const TILES_MAP_PATH = path.join(SRC_DATA_DIR, 'categoryTiles.json');

const prods = JSON.parse(fs.readFileSync(PRODS_PATH, 'utf8'));
const vars = JSON.parse(fs.readFileSync(VARS_PATH, 'utf8'));
const cats = JSON.parse(fs.readFileSync(CATS_PATH, 'utf8'));

console.log(`Loaded ${prods.length} products, ${vars.length} variants, ${cats.length} categories.`);

// 1. Separate Ice Creams from dairy-bread-eggs
const ICE_CREAM_IDS = new Set([
  // Arun Icecreams
  'g1-dry023', 'g1-dry024', 'g1-dry025', 'g1-dry026', 'g1-dry027', 'g1-dry028', 'g1-dry029', 'g1-dry030',
  'g1-dry034', 'g1-dry035', 'g1-dry036', 'g1-dry037', 'g1-dry038', 'g1-dry039', 'g1-dry040', 'g1-dry041',
  'g1-dry042', 'g1-dry043', 'g1-dry044',
  // Amul Ice Creams
  'g1-dry031', 'g1-dry045', 'g1-dry046', 'g1-dry047', 'g1-dry048',
  // Kwality Wall's Ice Creams
  'g1-dry032', 'g1-dry033', 'g1-dry049', 'g1-dry050', 'g1-dry051', 'g1-dry052'
]);

// 2. Add extra big bottles if missing:
// Add Frooti 2 L Big Bottle and Maaza 2 L Big Bottle explicitly
const extraBeverages = [
  {
    id: 'g1-bev048',
    category_id: 'drinks-juices',
    category: 'drinks-juices',
    sub_category: 'Maaza & Fruit Beverages',
    subCategory: 'Maaza & Fruit Beverages',
    brand: 'Maaza',
    brand_id: 'brand-maaza',
    name: 'Maaza Real Mango Pulp Beverage (2 L Big Bottle)',
    variant: 'Real Mango Pulp 2 L Big Bottle',
    weight: '2 L',
    pack_type: 'Large Bottle',
    mrp: 100,
    price: 100,
    storage: 'AMBIENT',
    shelf_life: '6 Months',
    image: '/products/verified/bev-maaza-1l.webp',
    image_url: '/products/verified/bev-maaza-1l.webp',
    imageUrl: '/products/verified/bev-maaza-1l.webp',
    image_status: 'verified',
    imageStatus: 'verified',
    image_source: 'verified_packshot',
    image_license: 'Brand Packshot',
    image_check_reason: '100% authentic supermarket packshot',
    barcode: '8901764032156',
    description: 'Maaza Real Mango Pulp Beverage (2 L Big Bottle). Large Family Pack. Net quantity: 2 L. Storage: AMBIENT. Shelf life: 6 Months.',
    rating: 4.8,
    reviewsCount: 75,
    isPopular: true,
    isBestDeal: true,
    inStock: true,
    is_active: true
  },
  {
    id: 'g1-bev049',
    category_id: 'drinks-juices',
    category: 'drinks-juices',
    sub_category: 'Maaza & Fruit Beverages',
    subCategory: 'Maaza & Fruit Beverages',
    brand: 'Frooti',
    brand_id: 'brand-frooti',
    name: 'Frooti Mango Fresh Juicy Mango Drink (2 L Big Bottle)',
    variant: 'Juicy Mango 2 L Big Bottle',
    weight: '2 L',
    pack_type: 'Large Bottle',
    mrp: 100,
    price: 100,
    storage: 'AMBIENT',
    shelf_life: '6 Months',
    image: '/products/verified/bev-frooti-1l.webp',
    image_url: '/products/verified/bev-frooti-1l.webp',
    imageUrl: '/products/verified/bev-frooti-1l.webp',
    image_status: 'verified',
    imageStatus: 'verified',
    image_source: 'verified_packshot',
    image_license: 'Brand Packshot',
    image_check_reason: '100% authentic supermarket packshot',
    barcode: '8901764032163',
    description: 'Frooti Mango Fresh Juicy Mango Drink (2 L Big Bottle). Large Family Pack. Net quantity: 2 L. Storage: AMBIENT. Shelf life: 6 Months.',
    rating: 4.8,
    reviewsCount: 82,
    isPopular: true,
    isBestDeal: true,
    inStock: true,
    is_active: true
  }
];

// Append extra beverages if not already present
for (const eb of extraBeverages) {
  if (!prods.some(p => p.id === eb.id)) {
    prods.push(eb);
    vars.push({
      id: `var-${eb.id}-1`,
      product_id: eb.id,
      size_label: `${eb.weight} (${eb.pack_type})`,
      price: eb.mrp,
      mrp: eb.mrp,
      stock: 50,
      image_url: eb.image
    });
  }
}

// Subcategory mapping for Ice Creams
const ICE_CREAM_SUB_MAP = {
  // Sticks & Bars
  'g1-dry023': 'Arun Icecreams Sticks & Bars', // Tringo
  'g1-dry024': 'Arun Icecreams Sticks & Bars', // Classic Chocobar
  'g1-dry034': 'Arun Icecreams Sticks & Bars', // Double Blast
  'g1-dry035': 'Arun Icecreams Sticks & Bars', // iBar
  'g1-dry036': 'Arun Icecreams Sticks & Bars', // Milky Fantasy
  'g1-dry037': 'Arun Icecreams Sticks & Bars', // Sunny Silver
  'g1-dry030': 'Arun Icecreams Sticks & Bars', // Popitos
  // Cones & Sundaes
  'g1-dry038': 'Cones & Sundaes', // Arun Toffee Cone
  'g1-dry031': 'Cones & Sundaes', // Amul Tricone Butterscotch
  'g1-dry045': 'Cones & Sundaes', // Amul Tricone Chocolate
  'g1-dry032': 'Cones & Sundaes', // Kwality Wall's Cornetto Double Choc
  'g1-dry049': 'Cones & Sundaes', // Kwality Wall's Cornetto Butterscotch
  // Sandwiches & Bites
  'g1-dry025': 'Sandwiches & Bites', // Arun Vanilla Sandwich
  'g1-dry040': 'Sandwiches & Bites', // Arun Choco Sandwich
  'g1-dry029': 'Sandwiches & Bites', // Arun Bites
  'g1-dry039': 'Sandwiches & Bites', // Arun Donut
  'g1-dry050': 'Sandwiches & Bites', // Kwality Wall's Sandwich
  // Kulfi & Traditional Treats
  'g1-dry028': 'Kulfi & Traditional Treats', // Arun Matka Kulfi
  'g1-dry041': 'Kulfi & Traditional Treats', // Arun Malai Kulfi
  'g1-dry046': 'Kulfi & Traditional Treats', // Amul Frostik Chocobar
  'g1-dry033': 'Kulfi & Traditional Treats', // Kwality Wall's Feast Bar
  'g1-dry044': 'Kulfi & Traditional Treats', // Arun Cassata Slice
  'g1-dry051': 'Kulfi & Traditional Treats', // Kwality Wall's Cassata Slice
  // Family Tubs (750ml & 1L)
  'g1-dry026': 'Family Tubs (750ml & 1L)', // Arun Vanilla Tub
  'g1-dry027': 'Family Tubs (750ml & 1L)', // Arun Butterscotch Tub
  'g1-dry042': 'Family Tubs (750ml & 1L)', // Arun Blackcurrant Tub
  'g1-dry043': 'Family Tubs (750ml & 1L)', // Arun Strawberry Tub
  'g1-dry047': 'Family Tubs (750ml & 1L)', // Amul Vanilla 1L Tub
  'g1-dry048': 'Family Tubs (750ml & 1L)', // Amul Butterscotch 1L Tub
  'g1-dry052': 'Family Tubs (750ml & 1L)'  // Kwality Wall's Vanilla 700ml Tub
};

// Subcategory mapping for Chips & Namkeen
function getChipsSubCategory(p) {
  const name = p.name.toLowerCase();
  if (name.includes('bingo') && (name.includes('mad angles') || name.includes('tedhe medhe') || name.includes('hashtags'))) {
    return 'Bingo! Mad Angles & Tedhe Medhe';
  }
  if (name.includes('kurkure') || name.includes('crax') || name.includes('too yumm')) {
    return 'Kurkure & Extruded Snacks';
  }
  if (name.includes('doritos') || name.includes('act ii') || name.includes('popcorn')) {
    return 'Nachos & Popcorn';
  }
  if (name.includes('lay\'s') || name.includes('lays') || name.includes('uncle chipps') || name.includes('pringles') || (name.includes('bingo') && name.includes('chips'))) {
    return 'Lay\'s & Potato Chips';
  }
  if (name.includes('lijjat') || name.includes('aachi') || name.includes('papad') || name.includes('makhana')) {
    return 'Papads & Makhana';
  }
  return 'Haldiram\'s & Namkeen';
}

// Subcategory mapping for Cold Drinks
function getDrinksSubCategory(p) {
  const name = p.name.toLowerCase();
  if (name.includes('maaza') || name.includes('frooti') || name.includes('slice')) {
    return 'Maaza & Fruit Beverages';
  }
  if (name.includes('water') || name.includes('bisleri') || name.includes('kinley') || name.includes('aquafina') || name.includes('soda')) {
    return 'Packaged Drinking Water & Soda';
  }
  if (name.includes('sting') || name.includes('red bull') || name.includes('real') || name.includes('tropicana') || name.includes('b natural') || name.includes('paper boat')) {
    return 'Energy Drinks & Juices';
  }
  return 'Thums Up, Coca-Cola & Soft Drinks';
}

// Subcategory mapping for Dairy
function getDairySubCategory(p) {
  const name = p.name.toLowerCase();
  if (name.includes('milk') && !name.includes('shake') && !name.includes('flavoured')) {
    return 'Fresh Milk & Curd';
  }
  if (name.includes('curd') || name.includes('dahi')) {
    return 'Fresh Milk & Curd';
  }
  if (name.includes('paneer') || name.includes('butter') || name.includes('cheese') || name.includes('cream')) {
    return 'Paneer, Butter & Cheese';
  }
  if (name.includes('bread')) {
    return 'Fresh Bread';
  }
  return 'Chilled Buttermilk & Shakes';
}

// 3. Update products and variants
let iceCreamCount = 0;
for (const p of prods) {
  // Move ice creams
  if (ICE_CREAM_IDS.has(p.id)) {
    p.category_id = 'ice-creams';
    p.category = 'ice-creams';
    p.sub_category = ICE_CREAM_SUB_MAP[p.id] || 'Ice Creams & Frozen Desserts';
    p.subCategory = p.sub_category;
    iceCreamCount++;
  } else if (p.category_id === 'chips-namkeen') {
    p.sub_category = getChipsSubCategory(p);
    p.subCategory = p.sub_category;
  } else if (p.category_id === 'drinks-juices') {
    p.sub_category = getDrinksSubCategory(p);
    p.subCategory = p.sub_category;
  } else if (p.category_id === 'dairy-bread-eggs') {
    p.sub_category = getDairySubCategory(p);
    p.subCategory = p.sub_category;
  }
}
console.log(`Updated products: moved ${iceCreamCount} ice cream products into category 'ice-creams'.`);

// 4. Update categories list in data/migrated_categories.json
// Check if ice-creams category exists, if not create it
let iceCat = cats.find(c => c.id === 'ice-creams');
if (!iceCat) {
  iceCat = {
    id: 'ice-creams',
    name: 'Ice Creams & Frozen Desserts',
    section_id: 'dairy-breakfast',
    tile_image_url: '/categories/collages/ice-creams.webp',
    image: '/categories/collages/ice-creams.webp',
    sort_order: 1,
    icon: 'Sparkles',
    description: 'Arun ice cream cones, chocobars, family tubs, kulfi, Amul Tricone and Kwality Wall\'s',
    subcategories: [
      'Arun Icecreams Sticks & Bars',
      'Cones & Sundaes',
      'Sandwiches & Bites',
      'Kulfi & Traditional Treats',
      'Family Tubs (750ml & 1L)'
    ]
  };
  cats.push(iceCat);
}

// Update dairy-bread-eggs category
const dairyCat = cats.find(c => c.id === 'dairy-bread-eggs');
if (dairyCat) {
  dairyCat.name = 'Dairy, Bread & Eggs';
  dairyCat.description = 'Fresh milk pouches, curd, paneer, butter, cheese slices, buttermilk, lassi and fresh bread';
  dairyCat.subcategories = [
    'Fresh Milk & Curd',
    'Paneer, Butter & Cheese',
    'Chilled Buttermilk & Shakes',
    'Fresh Bread'
  ];
  dairyCat.sort_order = 2;
}

// Update instant-food category
const instantCat = cats.find(c => c.id === 'instant-food');
if (instantCat) {
  instantCat.sort_order = 3;
}

// Update biscuits-bakery category
const bisCat = cats.find(c => c.id === 'biscuits-bakery');
if (bisCat) {
  bisCat.sort_order = 4;
}

// Synchronize subcategories in cats from actual products
const catSubMap = {};
prods.forEach(p => {
  const cid = p.category_id || p.category;
  if (!catSubMap[cid]) catSubMap[cid] = new Set();
  const sub = p.subCategory || p.sub_category;
  if (sub) catSubMap[cid].add(sub);
});

cats.forEach(c => {
  if (catSubMap[c.id]) {
    c.subcategories = Array.from(catSubMap[c.id]);
  }
});

fs.writeFileSync(CATS_PATH, JSON.stringify(cats, null, 2));
console.log('Saved data/migrated_categories.json');

// 5. Update src/data/categoryTiles.json
const tilesMap = JSON.parse(fs.readFileSync(TILES_MAP_PATH, 'utf8'));
tilesMap['ice-creams'] = '/categories/collages/ice-creams.webp';
fs.writeFileSync(TILES_MAP_PATH, JSON.stringify(tilesMap, null, 2));
console.log('Saved src/data/categoryTiles.json');

// 6. Update demo-seed.ts SUPERMARKET_CATEGORIES to include ice-creams
let demoSeedContent = fs.readFileSync(DEMO_SEED_PATH, 'utf8');
if (!demoSeedContent.includes('"id": "ice-creams"')) {
  const insertIndex = demoSeedContent.indexOf('{\n    "id": "dairy-bread-eggs"');
  if (insertIndex !== -1) {
    const iceCategorySeed = JSON.stringify(iceCat, null, 4) + ',\n  ';
    demoSeedContent = demoSeedContent.slice(0, insertIndex) + iceCategorySeed + demoSeedContent.slice(insertIndex);
    fs.writeFileSync(DEMO_SEED_PATH, demoSeedContent);
    console.log('Added ice-creams to src/data/demo-seed.ts');
  }
}

// 7. Save migrated_products.json, migrated_product_variants.json, and products-catalog.json
fs.writeFileSync(PRODS_PATH, JSON.stringify(prods, null, 2));
fs.writeFileSync(VARS_PATH, JSON.stringify(vars, null, 2));

const varMap = {};
for (const v of vars) {
  if (!varMap[v.product_id]) varMap[v.product_id] = [];
  varMap[v.product_id].push(v);
}

const finalCatalog = prods.map(p => {
  const pVars = varMap[p.id] || [];
  const primaryVar = pVars[0] || {};
  return {
    ...p,
    price: primaryVar.price || 0,
    mrp: primaryVar.mrp || 0,
    discount: 0,
    in_stock: true,
    variants: pVars.map(v => ({
      id: v.id,
      name: v.size_label || p.unit || 'Standard',
      unit: v.size_label || p.unit || 'Standard',
      price: v.price,
      mrp: v.mrp,
      in_stock: (v.stock || 0) > 0,
      image: v.image_url || p.image_url
    }))
  };
});

fs.writeFileSync(CATALOG_PATH, JSON.stringify(finalCatalog, null, 2));
console.log(`Saved products-catalog.json with ${finalCatalog.length} products.`);

console.log('================================================================');
console.log('CATEGORY REORGANIZATION COMPLETE:');
console.log(`- Total products: ${prods.length}`);
console.log(`- Ice Creams products: ${prods.filter(p => p.category_id === 'ice-creams').length}`);
console.log(`- Dairy products: ${prods.filter(p => p.category_id === 'dairy-bread-eggs').length}`);
console.log(`- Chips products: ${prods.filter(p => p.category_id === 'chips-namkeen').length}`);
console.log(`- Drinks products: ${prods.filter(p => p.category_id === 'drinks-juices').length}`);
console.log('================================================================');
