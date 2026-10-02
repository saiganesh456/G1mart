const fs = require('fs');
const path = require('path');

let code = fs.readFileSync(path.join(__dirname, 'generate_472_catalog.js'), 'utf8');

const functionsCode = `
function detectPhotoImage(name, brand, category) {
  const u = name.toUpperCase();
  if (u.includes('AASHIRVAAD') && (u.includes('1KG') || u.includes('ATTA') || u.includes('WHEAT'))) return '/products/prod-2.jpg';
  if (u.includes('CRYSTAL SALT')) return '/products/photos/crystal-salt.jpg';
  if (u.includes('SALT') || u.includes('TATA SALT')) return '/products/prod-1.jpg';
  if (u.includes('FORTUNE') || (u.includes('SUNFLOWER') && u.includes('OIL'))) return '/products/prod-3.jpg';
  if (u.includes('MILK') || u.includes('AROKYA') || u.includes('HATSUN')) return '/products/prod-4.jpg';
  if (u.includes('BREAD') || u.includes('BUN')) return '/products/prod-5.jpg';
  if (u.includes('BASMATI') || u.includes('INDIA GATE')) return '/products/prod-6.jpg';
  if (u.includes('LAYS') || u.includes("LAY'S")) return '/products/prod-7.jpg';
  if (u.includes('COCA') || u.includes('COLA')) return '/products/prod-8.jpg';
  if (u.includes('SURF EXCEL')) return '/products/prod-9.jpg';
  if (u.includes('COLGATE')) return '/products/prod-10.jpg';
  if (u.includes('APPLE')) return '/products/prod-11.jpg';
  if (u.includes('TOMATO') || u.includes('TEMATO')) return '/products/prod-12.jpg';
  if (u.includes('ONION') || u.includes('OIONES')) return '/products/prod-13.jpg';
  if (u.includes('POTATO') || u.includes('ALOO')) return '/products/prod-14.jpg';
  if (u.includes('GINGER') || u.includes('ALLAM')) return '/products/prod-15.jpg';
  if (u.includes('GARLIC') || u.includes('VELLULLI')) return '/products/prod-16.jpg';
  if (u.includes('CHILLIES') || (u.includes('CHILLI') && !u.includes('POWDER'))) return '/products/prod-17.jpg';
  if (u.includes('LEMON') || u.includes('NIMMA')) return '/products/prod-18.jpg';
  if (u.includes('CORIANDER') && !u.includes('POWDER') && !u.includes('SEEDS')) return '/products/prod-19.jpg';
  if (u.includes('CURRY LEAF') || u.includes('CURRY LEAVES')) return '/products/prod-20.jpg';
  if (u.includes('JAM') || u.includes('KISSAN')) return '/products/prod-21.jpg';
  if (u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('NOODLES')) return '/products/prod-22.jpg';
  if (u.includes('PARLE')) return '/products/prod-23.jpg';
  if (u.includes('GOOD DAY')) return '/products/prod-24.jpg';
  if (u.includes('OREO')) return '/products/prod-25.jpg';
  if (u.includes('RED LABEL') || u.includes('3 ROSES') || (u.includes('TEA') && !u.includes('TATA') && !u.includes('5 STAR'))) return '/products/prod-26.jpg';
  if (u.includes('TATA TEA')) return '/products/prod-27.jpg';
  if (u.includes('BRU')) return '/products/prod-28.jpg';
  if (u.includes('NESCAFE') || u.includes('COFFEE')) return '/products/prod-29.jpg';
  if (u.includes('HORLICKS') || u.includes('BOOST')) return '/products/prod-30.jpg';
  if (u.includes('DETTOL')) return '/products/prod-31.jpg';
  if (u.includes('LIFEBUOY')) return '/products/prod-32.jpg';
  if (u.includes('DOVE')) return '/products/prod-33.jpg';
  if (u.includes('HEAD & SHOULDERS') || u.includes('CLEAR ANTI')) return '/products/prod-34.jpg';
  if (u.includes('CLINIC PLUS')) return '/products/prod-35.jpg';
  if (u.includes('PARACHUTE') || u.includes('COCONUT OIL')) return '/products/prod-36.jpg';
  if (u.includes('VIM') || u.includes('EXO')) return '/products/prod-37.jpg';
  if (u.includes('HARPIC')) return '/products/prod-38.jpg';
  if (u.includes('LIZOL')) return '/products/prod-39.jpg';
  if (u.includes('COMFORT')) return '/products/prod-40.jpg';
  if (u.includes('DAIRY MILK') || u.includes('CADBURY')) return '/products/prod-41.jpg';
  if (u.includes('KITKAT') || u.includes('5 STAR') || u.includes('MUNCH') || u.includes('5 MUCH')) return '/products/prod-42.jpg';
  if (u.includes('WHISPER') || u.includes('HIMALAYA') || u.includes('WIPES')) return '/products/prod-43.jpg';

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
  if (u.includes('SUJI') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('BANSI') || u.includes('MAIDA') || u.includes('BESAN') || u.includes('ATTA') || u.includes('WHEAT')) return '/products/photos/suji-rava.jpg';
  if (u.includes('VERMICELLI') || u.includes('SEMIYA') || u.includes('BAMBINO')) return '/products/photos/vermicelli.jpg';
  if (u.includes('POHA') || u.includes('ATUKULU') || u.includes('SAGGUBIYYAM') || u.includes('SABUDANA')) return '/products/photos/poha.jpg';
  if (u.includes('GHEE')) return '/products/photos/ghee.jpg';
  if (u.includes('OIL') || u.includes('OILE')) return '/products/photos/cooking-oil.jpg';
  if (u.includes('CAMPHOR') || u.includes('AGARBATHI') || u.includes('POOJA') || u.includes('SAMBRANI') || u.includes('VATHULU') || u.includes('GANDAM')) return '/products/photos/pooja-camphor.jpg';
  if (u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('BOURBON') || u.includes('50-50')) return '/products/photos/biscuits-pack.jpg';
  if (u.includes('CHIPS') || u.includes('BINGO') || u.includes('PAPAD') || u.includes('APPALAM') || u.includes('STIX') || u.includes('POPS')) return '/products/photos/chips-namkeen.jpg';
  if (u.includes('SPRITE') || u.includes('THUMS') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('MAAZA') || u.includes('SODA') || u.includes('DRINK')) return '/products/photos/cold-drink-bottle.jpg';
  if (u.includes('ARIEL') || u.includes('RIN') || u.includes('FAB') || u.includes('DETERGENT') || u.includes('BLEACH') || u.includes('ACID') || u.includes('UJALA') || u.includes('WIPER') || u.includes('MOP')) return '/products/photos/cleaning-wash.jpg';
  if (u.includes('SOAP') || u.includes('CINTHOL') || u.includes('LUX') || u.includes('SANTOOR') || u.includes('PEARS') || u.includes('MEDIMIX') || u.includes('MARGO')) return '/products/prod-31.jpg';
  if (u.includes('PASTE') || u.includes('DABUR RED') || u.includes('SENSODYNE') || u.includes('BRUSH')) return '/products/prod-10.jpg';
  if (u.includes('SHAMPOO')) return '/products/prod-35.jpg';
  if (u.includes('HAIR OIL')) return '/products/prod-36.jpg';
  if (u.includes('TEA')) return '/products/prod-26.jpg';

  if (category === 'rice-dal-atta') return '/products/photos/test-rice.jpg';
  if (category === 'edible-oils') return '/products/photos/cooking-oil.jpg';
  if (category === 'dairy-bakery') return '/products/prod-4.jpg';
  if (category === 'snacks') return '/products/photos/chips-namkeen.jpg';
  if (category === 'beverages') return '/products/prod-26.jpg';
  if (category === 'household') return '/products/photos/cleaning-wash.jpg';
  if (category === 'personal-care') return '/products/prod-31.jpg';
  if (category === 'fruits-vegetables') return '/products/prod-11.jpg';

  return '/products/photos/test-rice.jpg';
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
    if (u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('PARLE') || u.includes('GOOD DAY') || u.includes('OREO') || u.includes('BOURBON')) return 'Biscuits & Cookies';
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
    if (u.includes('VIM') || u.includes('EXO') || u.includes('DISHWASH') || u.includes('SCRUB')) return 'Dishwash & Kitchen';
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
`;

const cleanTitleCode = `
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

console.log(\`Generated \${catalog.length} structured products with real photographic imagery.\`);
`;

const cleanTitleIdx = code.indexOf('function cleanTitle(name)');
const genDirIdx = code.indexOf('// Ensure public/products/generated folder exists');

if (cleanTitleIdx !== -1 && genDirIdx !== -1) {
  const before = code.slice(0, cleanTitleIdx);
  const after = code.slice(genDirIdx);
  code = before + functionsCode + cleanTitleCode + after;
  fs.writeFileSync(path.join(__dirname, 'generate_472_catalog.js'), code, 'utf8');
  console.log('Successfully updated generate_472_catalog.js');
} else {
  console.error('Could not find split points');
}
