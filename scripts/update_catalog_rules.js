const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'generate_472_catalog.js');
let content = fs.readFileSync(targetFile, 'utf8');

const startIdx = content.indexOf('function detectCategory(name) {');
const endIdx = content.indexOf('// Ensure public/products/generated folder exists');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find boundaries');
  process.exit(1);
}

const replacement = `function detectCategory(name) {
  const u = name.toUpperCase();
  if (u.includes('OIL') || u.includes('OILE') || u.includes('GHEE')) return 'edible-oils';
  if (u.includes('5 STAR TEA') || u.includes('TEA') || u.includes('BRU') || u.includes('COFFEE') || u.includes('SPRITE') || u.includes('THUMS') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('COCA') || u.includes('MAAZA') || u.includes('SODA') || u.includes('DRINK') || u.includes('HORLICKS') || u.includes('BOOST')) return 'beverages';
  if (u.includes('50-50') || u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('CHIPS') || u.includes('NOODLES') || u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('MUNCH') || u.includes('5 STAR') || u.includes('5 MUCH') || u.includes('KITKAT') || u.includes('CHOCO') || u.includes('BINGO') || u.includes('CANDY') || u.includes('POPS') || u.includes('UNIBIC') || u.includes('FANTASY') || u.includes('ARUN') || u.includes('ICE CREAM') || u.includes('DONUT') || u.includes('BITES')) return 'snacks';
  if (u.includes('RICE') || u.includes('ATT') || u.includes('AASHIRVAAD') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('WHEAT') || u.includes('SUJI') || u.includes('VERMICELLI') || u.includes('VERMICILLI') || u.includes('SUGAR') || u.includes('JAGGERY') || u.includes('SAGGUBIYYAM') || u.includes('OATS') || u.includes('MILLET') || u.includes('FLATTENED')) return 'rice-dal-atta';
  if (u.includes('PAPPU') || u.includes('DAL') || u.includes('DALL') || u.includes('MINAPAPPU') || u.includes('KANDIPAPPU') || u.includes('LENTIL') || u.includes('BEAN')) return 'rice-dal-atta';
  if (u.includes('MASALA') || u.includes('POWDER') || u.includes('CHILLI') || u.includes('SALT') || u.includes('JEERA') || u.includes('GELAKARA') || u.includes('GILAKARA') || u.includes('AVALU') || u.includes('ELACHI') || u.includes('ELAICHI') || u.includes('PEPPER') || u.includes('MIRIYALU') || u.includes('MENTHULU') || u.includes('CORIANDER') || u.includes('TAMARIND') || u.includes('TURMERIC') || u.includes('PICKEL') || u.includes('PICKLE') || u.includes('APPALAM') || u.includes('PAPAD')) return 'rice-dal-atta';
  if (u.includes('MILK') || u.includes('CURD') || u.includes('AROKYA') || u.includes('HATSUN') || u.includes('EGGS') || u.includes('EGG')) return 'dairy-bakery';
  if (u.includes('BADAM') || u.includes('JEEDI') || u.includes('KISMIS') || u.includes('DATES') || u.includes('SEEDS') || u.includes('NUTS') || u.includes('CASHEW') || u.includes('MAKHANA') || u.includes('KOBBARI')) return 'snacks';
  if (u.includes('SOAP') || u.includes('SOP') || u.includes('DETERGENT') || u.includes('SURF') || u.includes('RIN') || u.includes('VIM') || u.includes('EXO') || u.includes('FAB') || u.includes('COMFORT') || u.includes('HARPIC') || u.includes('DOMEX') || u.includes('MOP') || u.includes('WIPER') || u.includes('SWEEPER') || u.includes('BRUSH') || u.includes('NIMYLE') || u.includes('BLEACH') || u.includes('ACID') || u.includes('MATCH') || u.includes('PINS') || u.includes('DUSTPAN') || u.includes('UJALA') || u.includes('PITAMBARI') || u.includes('ARIEL') || u.includes('SCOTCH') || u.includes('SPONGE')) return 'household';
  if (u.includes('SHAMPOO') || u.includes('CREAM') || u.includes('COLGATE') || u.includes('PASTE') || u.includes('DOVE') || u.includes('CINTHOL') || u.includes('LUX') || u.includes('SANTOOR') || u.includes('PEARS') || u.includes('LIRIL') || u.includes('MEDIMIX') || u.includes('MARGO') || u.includes('DABUR') || u.includes('SENSODYNE') || u.includes('SENSORA') || u.includes('LAKME') || u.includes('GARNIER') || u.includes('GLOW') || u.includes('FAIR') || u.includes('VASELINE') || u.includes('PONDS') || u.includes('SPINZ') || u.includes('NYCIL') || u.includes('FOGG') || u.includes('SAVLON') || u.includes('DETTAL') || u.includes('WHISPER') || u.includes('PARACHUTE') || u.includes('HAIR') || u.includes('SWABS') || u.includes('EAR')) return 'personal-care';
  if (u.includes('SAMBRANI') || u.includes('AGARBATHI') || u.includes('POOJA') || u.includes('CAMPHOR') || u.includes('CAMPHPR') || u.includes('GOPURAM') || u.includes('DEEPAM') || u.includes('VATHULU') || u.includes('GANDAM')) return 'household';
  if (u.includes('ONION') || u.includes('OIONES') || u.includes('COCONUT') || u.includes('MANGO') || u.includes('FRUIT')) return 'fruits-vegetables';

  return 'household';
}

function detectPhotoImage(name, brand, category) {
  const u = name.toUpperCase();

  // 1. Exact Retail FMCG Packshots
  // Aashirvaad Family (Atta, Salt, Rava, Vermicelli)
  if (u.includes('AASHIRVAAD') && (u.includes('SALT') || u.includes('CRYSTAL'))) {
    return '/products/packshots/aashirvaad-crystal-salt.jpg';
  }
  if (u.includes('AASHIRVAAD') && (u.includes('SUJI') || u.includes('RAVA') || u.includes('VERMICELLI'))) {
    return '/products/packshots/aashirvaad-suji-rava.jpg';
  }
  if (u.includes('AASHIRVAAD') && (u.includes('1KG') || u.includes('ATTA') || u.includes('WHEAT') || u.trim() === 'AASHIRVAAD 1KG')) {
    return '/products/packshots/aashirvaad-atta-1kg.jpg';
  }

  // Appalam & Papad
  if (u.includes('APPALAM') || u.includes('PAPAD')) {
    return '/products/photos/chips-namkeen.jpg';
  }

  // Chocolates & Biscuits
  if (u.includes('5 STAR') && !u.includes('TEA')) {
    return '/products/packshots/cadbury-5-star.jpg';
  }
  if (u.includes('5 MUCH') || u.includes('MUNCH')) {
    return '/products/packshots/nestle-munch.jpg';
  }
  if (u.includes('50-50') || u.includes('PARLE')) {
    return '/products/packshots/parle-g.jpg';
  }
  if (u.includes('BOURBON')) {
    return '/products/packshots/britannia-bourbon.jpg';
  }
  if (u.includes('GOOD DAY')) {
    return '/products/packshots/good-day.jpg';
  }

  // Arun Ice Cream
  if (u.includes('ARUN') && u.includes('BITE')) {
    return '/products/packshots/arun-bites.jpg';
  }
  if (u.includes('ARUN') && u.includes('DONUT')) {
    return '/products/packshots/arun-donut.jpg';
  }
  if (u.includes('ARUN') || u.includes('ICE CREAM')) {
    return '/products/packshots/arun-popitos.jpg';
  }

  // Tea & Beverages
  if (u.includes('5 STAR TEA') || u.includes('TEA') || u.includes('CHAI') || u.includes('RED LABEL')) {
    return '/products/packshots/red-label-tea.jpg';
  }
  if (u.includes('BRU') || u.includes('COFFEE') || u.includes('NESCAFE')) {
    return '/products/packshots/bru-instant.jpg';
  }
  if (u.includes('HORLICKS') || u.includes('BOOST')) {
    return '/products/packshots/horlicks.jpg';
  }
  if (u.includes('THUMS') || u.includes('COCA') || u.includes('SPRITE') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('MAAZA') || u.includes('SODA')) {
    return '/products/packshots/thums-up.jpg';
  }

  // Detergents & Cleaning
  if (u.includes('ARIEL')) {
    return '/products/packshots/ariel-front-liq.jpg';
  }
  if (u.includes('SURF EXCEL')) {
    return '/products/packshots/surf-excel.jpg';
  }
  if (u.includes('VIM')) {
    return '/products/packshots/vim-bar.jpg';
  }
  if (u.includes('EXO')) {
    return '/products/packshots/exo-scrubber.jpg';
  }
  if (u.includes('SCOTCH')) {
    return '/products/packshots/scotch-brite.jpg';
  }
  if (u.includes('GALA') || u.includes('SPONGE') || u.includes('WIPE')) {
    return '/products/packshots/gala-sponge.jpg';
  }

  // Personal Care & Soaps
  if (u.includes('COLGATE') || u.includes('PASTE') || u.includes('BRUSH') || u.includes('DABUR RED') || u.includes('SENSODYNE')) {
    return '/products/packshots/colgate-toothpaste.jpg';
  }
  if (u.includes('DETTOL') || u.includes('SOAP') || u.includes('CINTHOL') || u.includes('LUX') || u.includes('SANTOOR') || u.includes('PEARS') || u.includes('MEDIMIX')) {
    return '/products/packshots/dettol-soap.jpg';
  }

  // Salt & Dairy
  if (u.includes('TATA SALT') || u.includes('SALT')) {
    return '/products/packshots/tata-salt.jpg';
  }
  if (u.includes('CRYSTAL SALT')) {
    return '/products/packshots/aashirvaad-crystal-salt.jpg';
  }
  if (u.includes('MILK') || u.includes('AROKYA') || u.includes('HATSUN') || u.includes('CURD')) {
    return '/products/packshots/amul-milk.jpg';
  }
  if (u.includes('LAYS') || u.includes("LAY'S")) {
    return '/products/packshots/lays-chips.jpg';
  }
  if (u.includes('BINGO')) {
    return '/products/packshots/bingo-mad-angles.jpg';
  }
  if (u.includes('KURKURE')) {
    return '/products/packshots/kurkure.jpg';
  }
  if (u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('NOODLES')) {
    return '/products/packshots/maggi-noodles.jpg';
  }

  // Spices & Ingredients
  if (u.includes('TOOR') || u.includes('KANDIPAPPU')) return '/products/photos/toor-dal.jpg';
  if (u.includes('MINAPAPPU') || u.includes('URAD')) return '/products/photos/urad-dal.jpg';
  if (u.includes('MOONG') || u.includes('PESALU') || u.includes('PESARA')) return '/products/photos/moong-dal.jpg';
  if (u.includes('CHANA') || u.includes('SENAGALU') || u.includes('SENAGA') || u.includes('BENGAL GRAM')) return '/products/photos/chana-dal.jpg';
  if (u.includes('JEEDI') || u.includes('CASHEW')) return '/products/photos/cashews.jpg';
  if (u.includes('BADAM') || u.includes('ALMOND')) return '/products/photos/almonds.jpg';
  if (u.includes('KISMIS') || u.includes('RAISIN') || u.includes('DATES')) return '/products/photos/raisins.jpg';
  if (u.includes('CHILLY POWDER') || u.includes('MIRCHI POWDER') || u.includes('CHILLI POWDER')) return '/products/photos/chilli-powder.jpg';
  if (u.includes('TURMERIC') || u.includes('PASUPU') || u.includes('HALDI')) return '/products/photos/turmeric.jpg';
  if (u.includes('CORIANDER POWDER') || u.includes('CORIANDER SEEDS') || u.includes('DHANIYALU')) return '/products/photos/coriander-powder.jpg';
  if (u.includes('AVALU') || u.includes('MUSTARD') || u.includes('JEERA') || u.includes('GELAKARA') || u.includes('GILAKARA')) return '/products/photos/mustard-cumin.jpg';
  if (u.includes('MASALA') || u.includes('ELACHI') || u.includes('PEPPER') || u.includes('MIRIYALU') || u.includes('CLOVE') || u.includes('LAVANG')) return '/products/photos/spices-cloves.jpg';
  if (u.includes('SUGAR') || u.includes('BELLAM') || u.includes('JAGGERY')) return '/products/photos/sugar-jaggery.jpg';
  if (u.includes('SUJI') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('BANSI') || u.includes('MAIDA') || u.includes('BESAN')) return '/products/packshots/aashirvaad-suji-rava.jpg';
  if (u.includes('VERMICELLI') || u.includes('SEMIYA') || u.includes('BAMBINO')) return '/products/photos/vermicelli.jpg';
  if (u.includes('POHA') || u.includes('ATUKULU') || u.includes('SAGGUBIYYAM') || u.includes('SABUDANA')) return '/products/photos/poha.jpg';
  if (u.includes('GHEE')) return '/products/photos/ghee.jpg';
  if (u.includes('OIL') || u.includes('OILE')) return '/products/photos/cooking-oil.jpg';
  if (u.includes('CAMPHOR') || u.includes('AGARBATHI') || u.includes('POOJA') || u.includes('SAMBRANI') || u.includes('VATHULU') || u.includes('GANDAM')) return '/products/photos/pooja-camphor.jpg';

  if (category === 'rice-dal-atta') return '/products/packshots/aashirvaad-atta-1kg.jpg';
  if (category === 'edible-oils') return '/products/photos/cooking-oil.jpg';
  if (category === 'dairy-bakery') return '/products/packshots/amul-milk.jpg';
  if (category === 'snacks') return '/products/packshots/cadbury-5-star.jpg';
  if (category === 'beverages') return '/products/packshots/red-label-tea.jpg';
  if (category === 'household') return '/products/packshots/surf-excel.jpg';
  if (category === 'personal-care') return '/products/packshots/dettol-soap.jpg';
  if (category === 'fruits-vegetables') return '/products/photos/toor-dal.jpg';

  return '/products/packshots/aashirvaad-atta-1kg.jpg';
}

function detectSubCategory(name, category) {
  const u = name.toUpperCase();
  if (category === 'rice-dal-atta') {
    if (u.includes('ATT') || u.includes('WHEAT') || u.includes('MAIDA') || u.includes('BESAN') || u.includes('SUJI') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('BANSI')) return 'Atta & Flours';
    if (u.includes('RICE') || u.includes('BASMATI') || u.includes('POHA') || u.includes('ATUKULU') || u.includes('SAGGUBIYYAM') || u.includes('VERMICELLI') || u.includes('SEMIYA') || u.includes('BAMBINO')) return 'Rice & Grains';
    if (u.includes('PAPPU') || u.includes('DAL') || u.includes('DALL') || u.includes('MINAPAPPU') || u.includes('KANDIPAPPU') || u.includes('LENTIL') || u.includes('BEAN') || u.includes('MOONG') || u.includes('CHANA') || u.includes('RAJMA') || u.includes('BATANI')) return 'Dals & Pulses';
    if (u.includes('SALT') || u.includes('SUGAR') || u.includes('BELLAM') || u.includes('JAGGERY')) return 'Salt & Sugar';
    return 'Spices & Masalas';
  }
  if (category === 'edible-oils') {
    if (u.includes('SUNFLOWER') || u.includes('FORTUNE') || u.includes('FREEDOM') || u.includes('GOLD DROP')) return 'Sunflower Oil';
    if (u.includes('GHEE')) return 'Pure Ghee';
    if (u.includes('DEEPAM') || u.includes('POOJA')) return 'Deepam & Pooja Oil';
    return 'Groundnut & Other Oils';
  }
  if (category === 'dairy-bakery') {
    if (u.includes('BREAD') || u.includes('BUN') || u.includes('RUSK')) return 'Bread & Bakery';
    if (u.includes('EGG')) return 'Eggs';
    return 'Milk & Curd';
  }
  if (category === 'snacks') {
    if (u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('PARLE') || u.includes('GOOD DAY') || u.includes('OREO') || u.includes('BOURBON') || u.includes('50-50')) return 'Biscuits & Cookies';
    if (u.includes('CHIPS') || u.includes('BINGO') || u.includes('LAYS') || u.includes('KURKURE') || u.includes('MUNCHIES') || u.includes('PAPAD') || u.includes('APPALAM')) return 'Chips & Namkeen';
    if (u.includes('BADAM') || u.includes('JEEDI') || u.includes('KISMIS') || u.includes('CASHEW') || u.includes('ALMOND') || u.includes('NUTS') || u.includes('RAISIN') || u.includes('DATES')) return 'Dry Fruits & Nuts';
    if (u.includes('NOODLES') || u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('PASTA')) return 'Instant Noodles & Pasta';
    return 'Chocolates & Sweets';
  }
  if (category === 'beverages') {
    if (u.includes('COFFEE') || u.includes('BRU') || u.includes('NESCAFE')) return 'Instant Coffee';
    if (u.includes('SPRITE') || u.includes('THUMS') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('COCA') || u.includes('MAAZA') || u.includes('SODA') || u.includes('DRINK') || u.includes('JUICE')) return 'Cold Drinks & Soda';
    if (u.includes('HORLICKS') || u.includes('BOOST')) return 'Health Drinks';
    return 'Tea & Chai';
  }
  if (category === 'personal-care') {
    if (u.includes('COLGATE') || u.includes('PASTE') || u.includes('BRUSH') || u.includes('DABUR RED') || u.includes('SENSODYNE')) return 'Oral Care';
    if (u.includes('SHAMPOO') || u.includes('HAIR') || u.includes('PARACHUTE')) return 'Hair Care';
    if (u.includes('CREAM') || u.includes('VASELINE') || u.includes('PONDS') || u.includes('FAIR') || u.includes('GLOW') || u.includes('WHISPER') || u.includes('WIPES') || u.includes('EAR') || u.includes('SWABS')) return 'Skincare & Hygiene';
    return 'Bath Soaps';
  }
  if (category === 'household') {
    if (u.includes('VIM') || u.includes('EXO') || u.includes('DISHWASH') || u.includes('SCRUB') || u.includes('SCOTCH') || u.includes('SPONGE')) return 'Dishwash & Kitchen';
    if (u.includes('SURF') || u.includes('ARIEL') || u.includes('RIN') || u.includes('COMFORT') || u.includes('FAB') || u.includes('UJALA') || u.includes('DETERGENT')) return 'Detergent & Fabric Care';
    if (u.includes('HARPIC') || u.includes('LIZOL') || u.includes('NIMYLE') || u.includes('BLEACH') || u.includes('ACID') || u.includes('DOMEX')) return 'Floor & Cleaners';
    if (u.includes('CAMPHOR') || u.includes('AGARBATHI') || u.includes('SAMBRANI') || u.includes('POOJA') || u.includes('VATHULU') || u.includes('GANDAM')) return 'Pooja Needs';
    return 'Home Utilities';
  }
  if (category === 'fruits-vegetables') {
    if (u.includes('APPLE') || u.includes('FRUIT') || u.includes('COCONUT') || u.includes('MANGO')) return 'Fresh Produce & Fruits';
    return 'Daily Vegetables';
  }
  return 'General';
}

function cleanTitle(name) {
  let cleaned = name
    .replace(/\\b(\\d+(?:\\.\\d+)?)\\s*(KG|G|GR|GM|ML|L|LT|LITRE)\\b/gi, '')
    .replace(/\\b\\d+RS\\b/gi, '')
    .replace(/\\s+/g, ' ')
    .trim();
  cleaned = cleaned.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return cleaned || name;
}

const catalog = rawItems.map(item => {
  const unitPrice = Math.round((item.total / item.qty) * 100) / 100;
  const unit = extractUnit(item.name, item.unit);
  const brand = detectBrand(item.name);
  const category = detectCategory(item.name);
  const subCategory = detectSubCategory(item.name, category);
  const title = cleanTitle(item.name);
  const id = \`g1-\${item.id}\`;
  const image = detectPhotoImage(item.name, brand, category);

  return {
    id,
    itemNumber: item.id,
    rawName: item.name,
    name: \`\${title} (\${unit})\`,
    brand,
    category,
    subCategory,
    unit,
    price: unitPrice,
    originalPrice: unitPrice,
    discountPercentage: 0,
    inStock: true,
    stockCount: Math.max(10, Math.floor(item.qty * 3)),
    image,
    description: \`Authentic \${title} - \${unit} pack. Sourced, verified and quality-packed at G1 Mart Supermarket.\`,
    rating: 4.8,
    reviewsCount: 14 + (item.id % 27),
    isPopular: item.qty >= 5,
    isBestDeal: false
  };
});

console.log(\`Generated \${catalog.length} structured products with real authentic FMCG packshots.\`);
`;

const before = content.slice(0, startIdx);
const after = content.slice(endIdx);
content = before + replacement + after;

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated generate_472_catalog.js with complete packshot mapping logic.');
