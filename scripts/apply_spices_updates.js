const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.resolve('data/migrated_products.json');
const VARIANTS_PATH = path.resolve('data/migrated_product_variants.json');
const CATEGORIES_PATH = path.resolve('data/migrated_categories.json');
const BRANDS_PATH = path.resolve('data/migrated_brands.json');

// 1. Load files
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VARIANTS_PATH, 'utf8'));
const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
const brands = JSON.parse(fs.readFileSync(BRANDS_PATH, 'utf8'));

console.log(`Loaded ${products.length} products, ${variants.length} variants, ${categories.length} categories, ${brands.length} brands.`);

// 2. Backup
fs.writeFileSync(`${PRODUCTS_PATH}.bak_${Date.now()}`, JSON.stringify(products, null, 2));
fs.writeFileSync(`${VARIANTS_PATH}.bak_${Date.now()}`, JSON.stringify(variants, null, 2));

// Helper maps
const prodMap = new Map(products.map(p => [p.id, p]));
const variantsByProd = new Map();
for (const v of variants) {
  if (!variantsByProd.has(v.product_id)) {
    variantsByProd.set(v.product_id, []);
  }
  variantsByProd.get(v.product_id).push(v);
}

// -------------------------------------------------------------
// A. Aachi Masalas: Revert to previous authentic retail packshots
// -------------------------------------------------------------
const aachiUpdates = {
  'g1-p0073': {
    name: 'Aachi Mutton Masala (మటన్ మసాలా)',
    image: '/products/verified/g1-p0073.webp',
    subcat: 'Masala Powders & Blends',
  },
  'g1-p0074': {
    name: 'Aachi Chicken Masala (చికెన్ మసాలా)',
    image: '/products/verified/g1-p0074.webp',
    subcat: 'Masala Powders & Blends',
  },
  'g1-p0072': {
    name: 'Aachi Fish Fry Masala (ఫిష్ ఫ్రై మసాలా)',
    image: '/products/verified/g1-p0072.webp',
    subcat: 'Masala Powders & Blends',
  },
  'g1-p0075': {
    name: 'Aachi Biryani Masala (బిర్యానీ మసాలా)',
    image: '/products/verified/g1-p0075.webp',
    subcat: 'Masala Powders & Blends',
  },
  'g1-p0076': {
    name: 'Aachi Garam Masala (గరం మసాలా)',
    image: '/products/verified/g1-p0076.webp',
    subcat: 'Masala Powders & Blends',
  },
};

for (const [id, info] of Object.entries(aachiUpdates)) {
  const p = prodMap.get(id);
  if (p) {
    p.name = info.name;
    p.brand = 'Aachi';
    p.brand_id = 'brand-aachi';
    p.category = 'spices-masalas';
    p.category_id = 'spices-masalas';
    p.sub_category = info.subcat;
    p.subCategory = info.subcat;
    p.subcategory = info.subcat;
    p.image_url = info.image;
    p.imageUrl = info.image;
    p.image = info.image;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.is_active = true;
    p.isActive = true;

    // Update variants
    const pVars = variantsByProd.get(id) || [];
    for (const v of pVars) {
      v.image_url = info.image;
      v.in_stock = true;
    }
    console.log(`Updated Aachi item ${id}: ${info.name} -> ${info.image}`);
  }
}

// -------------------------------------------------------------
// B. Aashirvaad Chilli & MDH Deggi Mirch
// -------------------------------------------------------------
// Aashirvaad Red Chilli
const aashirvaadChilli = prodMap.get('g1-p1001');
if (aashirvaadChilli) {
  aashirvaadChilli.name = 'Aashirvaad Red Chilli Powder (కారం పొడి)';
  aashirvaadChilli.brand = 'Aashirvaad';
  aashirvaadChilli.brand_id = 'brand-aashirvaad';
  aashirvaadChilli.category = 'spices-masalas';
  aashirvaadChilli.category_id = 'spices-masalas';
  aashirvaadChilli.sub_category = 'Chilli, Turmeric & Coriander';
  aashirvaadChilli.subCategory = 'Chilli, Turmeric & Coriander';
  aashirvaadChilli.subcategory = 'Chilli, Turmeric & Coriander';
  aashirvaadChilli.image_url = '/products/packshots/aashirvaad-chilli-powder.webp';
  aashirvaadChilli.imageUrl = '/products/packshots/aashirvaad-chilli-powder.webp';
  aashirvaadChilli.image = '/products/packshots/aashirvaad-chilli-powder.webp';
  aashirvaadChilli.image_status = 'verified';
  aashirvaadChilli.imageStatus = 'verified';
  aashirvaadChilli.is_active = true;
  aashirvaadChilli.isActive = true;

  const aashirvaadVars = variantsByProd.get('g1-p1001') || [];
  for (const v of aashirvaadVars) {
    v.image_url = '/products/packshots/aashirvaad-chilli-powder.webp';
    v.in_stock = true;
  }
  console.log(`Updated Aashirvaad Chilli g1-p1001: set verified packshot and updated ${aashirvaadVars.length} variants.`);
}

// MDH Deggi Mirch
const mdhDeggi = prodMap.get('g1-mdh-deggi-mirch');
if (mdhDeggi) {
  mdhDeggi.name = 'MDH Deggi Mirch (Natural Red Pepper Powder)';
  mdhDeggi.brand = 'MDH';
  mdhDeggi.brand_id = 'brand-mdh';
  mdhDeggi.category = 'spices-masalas';
  mdhDeggi.category_id = 'spices-masalas';
  mdhDeggi.sub_category = 'Chilli, Turmeric & Coriander';
  mdhDeggi.subCategory = 'Chilli, Turmeric & Coriander';
  mdhDeggi.subcategory = 'Chilli, Turmeric & Coriander';
  mdhDeggi.image_url = '/products/packshots/mdh-deggi-mirch.webp';
  mdhDeggi.imageUrl = '/products/packshots/mdh-deggi-mirch.webp';
  mdhDeggi.image = '/products/packshots/mdh-deggi-mirch.webp';
  mdhDeggi.image_status = 'verified';
  mdhDeggi.imageStatus = 'verified';
  mdhDeggi.is_active = true;
  mdhDeggi.isActive = true;

  const mdhVars = variantsByProd.get('g1-mdh-deggi-mirch') || [];
  for (const v of mdhVars) {
    v.image_url = '/products/packshots/mdh-deggi-mirch.webp';
    v.in_stock = true;
  }
  console.log(`Updated MDH Deggi Mirch: set verified packshot.`);
}

// Deactivate unbranded chilly powder duplicate
const unbrandedChilli = prodMap.get('g1-p0951');
if (unbrandedChilli) {
  unbrandedChilli.is_active = false;
  unbrandedChilli.isActive = false;
  console.log(`Deactivated unbranded duplicate g1-p0951.`);
}

// -------------------------------------------------------------
// C. Jeevan Mart / G1 Mart Loose Spices (Upgraded cork/white stand-up zipper pouches with transparent windows & G1 Mart banner logo)
// -------------------------------------------------------------
const loosePouches = {
  'g1-spc043': {
    name: 'G1 Mart Guntur Endu Mirchi (Dried Red Chillies / ఎండుమిర్చి)',
    image: '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc046': {
    name: 'G1 Mart Dhaniyalu (Coriander Seeds / ధనియాలు)',
    image: '/products/generated_pouches/g1_coriander_seeds_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc047': {
    name: 'G1 Mart Jeelakarra (Whole Cumin Seeds / జీలకర్ర)',
    image: '/products/generated_pouches/g1_jeera_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc048': {
    name: 'G1 Mart Avalu (Mustard Seeds / ఆవాలు)',
    image: '/products/generated_pouches/g1_avalu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc049': {
    name: 'G1 Mart Menthulu (Fenugreek Seeds / మెంతులు)',
    image: '/products/generated_pouches/g1_menthulu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc050': {
    name: 'G1 Mart Sompu (Sweet Fennel Seeds / సోంపు)',
    image: '/products/generated_pouches/g1_sompu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc051': {
    name: 'G1 Mart Lavangalu (Whole Cloves / లవంగాలు)',
    image: '/products/generated_pouches/g1_lavangalu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc053': {
    name: 'G1 Mart Dalchinachekka (Cinnamon Sticks / దాల్చిన చెక్క)',
    image: '/products/generated_pouches/g1_dalchina_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc054': {
    name: 'G1 Mart Elakulu (Green Cardamom / యాలకులు)',
    image: '/products/generated_pouches/g1_elaichi_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc055': {
    name: 'G1 Mart Biryani Aaku (Bay Leaves / బిర్యానీ ఆకు)',
    image: '/products/generated_pouches/g1_biryani_aaku_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc056': {
    name: 'G1 Mart Chintapandu (Pure Cleaned Tamarind / చింతపండు)',
    image: '/products/generated_pouches/g1_chintapandu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc057': {
    name: 'G1 Mart Endu Kobbari (Dry Coconut / ఎండు కొబ్బరి)',
    image: '/products/generated_pouches/g1_kobbari_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc058': {
    name: 'G1 Mart Tella Nuvvulu (White Sesame Seeds / తెల్ల నువ్వులు)',
    image: '/products/generated_pouches/g1_nuvvulu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-spc059': {
    name: 'G1 Mart Gasagasalu (Poppy Seeds / గసగసాలు)',
    image: '/products/generated_pouches/g1_gasagasalu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-p0342': {
    name: 'G1 Mart Miriyalu (Whole Black Pepper / మిరియాలు)',
    image: '/products/generated_pouches/g1_miriyalu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-p0286': {
    name: 'G1 Mart Vamu (Ajwain Seeds / వాము)',
    image: '/products/generated_pouches/g1_vamu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-p0337': {
    name: 'G1 Mart Anasa Puvvu (Star Anise / అనాస పువ్వు)',
    image: '/products/generated_pouches/g1_anasa_puvvu_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-p0338': {
    name: 'G1 Mart Japathri (Mace / జాపత్రి)',
    image: '/products/generated_pouches/g1_japathri_pouch.webp',
    subcat: 'Whole Spices & Staples',
  },
  'g1-p0706': {
    name: 'G1 Mart Pappula Podi (Gunpowder / పప్పుల పొడి)',
    image: '/products/generated_pouches/g1_pappula_podi_pouch.webp',
    subcat: 'Sambar, Rasam & Podis',
  },
  'g1-p0709': {
    name: 'G1 Mart Kobbari Karam Podi (కొబ్బరి కారం పొడి)',
    image: '/products/generated_pouches/g1_kobbari_karam_podi_pouch.webp',
    subcat: 'Sambar, Rasam & Podis',
  },
  'g1-p0990': {
    name: 'G1 Mart Dhaniyala Podi (Coriander Powder / ధనియాల పొడి)',
    image: '/products/generated_pouches/g1_coriander_powder_pouch.webp',
    subcat: 'Chilli, Turmeric & Coriander',
  },
};

for (const [id, info] of Object.entries(loosePouches)) {
  const p = prodMap.get(id);
  if (p) {
    p.name = info.name;
    p.brand = 'G1 Mart Loose Staples';
    p.brand_id = 'brand-g1mart-loose';
    p.category = 'spices-masalas';
    p.category_id = 'spices-masalas';
    p.sub_category = info.subcat;
    p.subCategory = info.subcat;
    p.subcategory = info.subcat;
    p.image_url = info.image;
    p.imageUrl = info.image;
    p.image = info.image;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.is_active = true;
    p.isActive = true;

    // Update variants
    const pVars = variantsByProd.get(id) || [];
    for (const v of pVars) {
      v.image_url = info.image;
      v.in_stock = true;
    }
    console.log(`Updated loose spice ${id}: ${info.name} -> ${info.image} (${pVars.length} variants synced)`);
  }
}

// Deactivate redundant loose duplicates
['g1-p0333', 'g1-p0042', 'g1-p0184', 'g1-canon-mirchi-01', 'g1-spc037'].forEach(id => {
  const p = prodMap.get(id);
  if (p) {
    p.is_active = false;
    p.isActive = false;
    console.log(`Deactivated redundant duplicate: ${id} (${p.name})`);
  }
});

// -------------------------------------------------------------
// D. Gopuram Turmeric & Sri Durga Pickles
// -------------------------------------------------------------
// Gopuram Turmeric Powder
const gopuramTurmeric = prodMap.get('g1-p0502');
if (gopuramTurmeric) {
  gopuramTurmeric.name = 'Gopuram Turmeric Powder (గోపురం పసుపు)';
  gopuramTurmeric.brand = 'Gopuram';
  gopuramTurmeric.brand_id = 'brand-gopuram';
  gopuramTurmeric.category = 'spices-masalas';
  gopuramTurmeric.category_id = 'spices-masalas';
  gopuramTurmeric.sub_category = 'Chilli, Turmeric & Coriander';
  gopuramTurmeric.subCategory = 'Chilli, Turmeric & Coriander';
  gopuramTurmeric.subcategory = 'Chilli, Turmeric & Coriander';
  gopuramTurmeric.image_url = '/products/verified/hh-151-gopuram-pasupu-turmeric.webp';
  gopuramTurmeric.imageUrl = '/products/verified/hh-151-gopuram-pasupu-turmeric.webp';
  gopuramTurmeric.image = '/products/verified/hh-151-gopuram-pasupu-turmeric.webp';
  gopuramTurmeric.image_status = 'verified';
  gopuramTurmeric.imageStatus = 'verified';
  gopuramTurmeric.is_active = true;
  gopuramTurmeric.isActive = true;

  // Variants for Gopuram
  let gopVars = variantsByProd.get('g1-p0502') || [];
  if (gopVars.length === 0) {
    gopVars = [{
      id: 'g1-p0502-v1',
      product_id: 'g1-p0502',
      size_label: '50 g',
      price: 28,
      mrp: 30,
      stock: 50,
      in_stock: true,
      image_url: '/products/verified/hh-151-gopuram-pasupu-turmeric.webp'
    }];
    variants.push(gopVars[0]);
  } else {
    gopVars[0].size_label = '50 g';
    gopVars[0].price = 28;
    gopVars[0].mrp = 30;
    gopVars[0].image_url = '/products/verified/hh-151-gopuram-pasupu-turmeric.webp';
    gopVars[0].in_stock = true;
  }

  // Deactivate redundant g1-p0503 and g1-p0778
  ['g1-p0503', 'g1-p0778'].forEach(dupId => {
    const dup = prodMap.get(dupId);
    if (dup) {
      dup.is_active = false;
      dup.isActive = false;
      console.log(`Deactivated Gopuram duplicate: ${dupId}`);
    }
  });
  console.log(`Updated Gopuram Turmeric Powder: verified packshot linked.`);
}

// Sri Durga Pickles & Pastes
const sriDurgaItems = [
  { id: 'g1-p0641', name: 'Sri Durga Lemon Pickle (నిమ్మకాయ పచ్చడి)', img: '/products/verified/g1-p0641.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0643', name: 'Sri Durga Pulihora Paste (పులిహోర పేస్ట్)', img: '/products/verified/g1-p0643.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0644', name: 'Sri Durga Green Tamarind Pickle (చింతకాయ తొక్కు)', img: '/products/verified/g1-p0644.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0645', name: 'Sri Durga Ginger Pickle (అల్లం పచ్చడి)', img: '/products/verified/g1-p0645.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0648', name: 'Sri Durga Ginger Garlic Paste (అల్లం వెల్లుల్లి పేస్ట్)', img: '/products/verified/g1-p0648.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0650', name: 'Sri Durga Mango Cut Pickle (మామిడి ముక్కల పచ్చడి)', img: '/products/verified/g1-p0650.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0651', name: 'Sri Durga Tomato Pickle (టమాటో పచ్చడి)', img: '/products/verified/g1-p0651.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0653', name: 'Sri Durga Gongura Pickle (గోంగూర పచ్చడి)', img: '/products/verified/g1-p0653.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0654', name: 'Sri Durga Amla Pickle (ఉసిరికాయ పచ్చడి)', img: '/products/verified/g1-p0654.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0656', name: 'Sri Durga Red Chilli Pickle (పండుమిరప పచ్చడి)', img: '/products/verified/g1-p0656.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0657', name: 'Sri Durga Mango Avakai Pickle (ఆవకాయ పచ్చడి)', img: '/products/verified/g1-p0657.webp', subcat: 'Andhra Pickles & Pastes' },
  { id: 'g1-p0658', name: 'Sri Durga Mango Thokku Pickle (మామిడి తురుము)', img: '/products/verified/g1-p0658.webp', subcat: 'Andhra Pickles & Pastes' },
];

for (const sd of sriDurgaItems) {
  const p = prodMap.get(sd.id);
  if (p) {
    p.name = sd.name;
    p.brand = 'Sri Durga';
    p.brand_id = 'brand-sri-durga';
    p.category = 'spices-masalas';
    p.category_id = 'spices-masalas';
    p.sub_category = sd.subcat;
    p.subCategory = sd.subcat;
    p.subcategory = sd.subcat;
    p.image_url = sd.img;
    p.imageUrl = sd.img;
    p.image = sd.img;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.is_active = true;
    p.isActive = true;

    const pVars = variantsByProd.get(sd.id) || [];
    for (const v of pVars) {
      v.image_url = sd.img;
      v.in_stock = true;
    }
    console.log(`Updated Sri Durga pickle: ${sd.id} -> ${sd.name}`);
  }
}

// Deactivate duplicate Sri Durga lemon
const sdDup = prodMap.get('g1-p0649');
if (sdDup) {
  sdDup.is_active = false;
  sdDup.isActive = false;
}

// -------------------------------------------------------------
// E. Comprehensive Subcategory Normalization in spices-masalas
// -------------------------------------------------------------
const VALID_SUBCATS = [
  'Whole Spices & Staples',
  'Chilli, Turmeric & Coriander',
  'Masala Powders & Blends',
  'Sambar, Rasam & Podis',
  'Andhra Pickles & Pastes'
];

for (const p of products) {
  if (p.category !== 'spices-masalas' && p.category_id !== 'spices-masalas') continue;
  if (p.is_active === false || p.isActive === false) continue;

  const n = (p.name || '').toLowerCase();
  let targetSubcat = p.subcategory || p.sub_category || p.subCategory;

  if (targetSubcat === 'Soft Drinks, Juices & Soda') {
    p.category = 'drinks-juices';
    p.category_id = 'drinks-juices';
    continue;
  }

  // Determine standard subcategory
  if (
    n.includes('pickle') || n.includes('avakaya') || n.includes('gongura') ||
    n.includes('pachadi') || n.includes('paste') || n.includes('thokku')
  ) {
    targetSubcat = 'Andhra Pickles & Pastes';
  } else if (
    n.includes('sambar') || n.includes('rasam') || n.includes('podi') ||
    n.includes('gunpowder') || n.includes('bath powder') || n.includes('puliyogare')
  ) {
    targetSubcat = 'Sambar, Rasam & Podis';
  } else if (
    n.includes('chilli') || n.includes('turmeric') || n.includes('mirch') ||
    n.includes('haldi') || n.includes('pasupu') || n.includes('dhaniyala podi') ||
    n.includes('coriander powder') || n.includes('dhaniya powder') || n.includes('tikhalal') ||
    n.includes('kashmirilal')
  ) {
    targetSubcat = 'Chilli, Turmeric & Coriander';
  } else if (
    n.includes('masala') || n.includes('chicken') || n.includes('mutton') ||
    n.includes('fish fry') || n.includes('biryani') || n.includes('garam') ||
    n.includes('kitchen king') || n.includes('pav bhaji') || n.includes('meat masala') ||
    n.includes('chhole') || n.includes('chaat') || n.includes('chat')
  ) {
    targetSubcat = 'Masala Powders & Blends';
  } else if (
    n.includes('jeera') || n.includes('cumin') || n.includes('mustard') ||
    n.includes('avalu') || n.includes('menthulu') || n.includes('fenugreek') ||
    n.includes('sompu') || n.includes('fennel') || n.includes('clove') ||
    n.includes('lavanga') || n.includes('cinnamon') || n.includes('dalchina') ||
    n.includes('cardamom') || n.includes('elakulu') || n.includes('elaichi') ||
    n.includes('bay leave') || n.includes('biryani aaku') || n.includes('tamarind') ||
    n.includes('chintapandu') || n.includes('kobbari') || n.includes('sesame') ||
    n.includes('nuvvulu') || n.includes('poppy') || n.includes('gasagasalu') ||
    n.includes('pepper') || n.includes('miriyalu') || n.includes('ajwain') ||
    n.includes('vamu') || n.includes('star anise') || n.includes('anasa puvvu') ||
    n.includes('mace') || n.includes('japathri') || n.includes('dhaniyalu') ||
    n.includes('coriander seeds') || n.includes('endu mirchi') || n.includes('asafoetida') ||
    n.includes('hing') || n.includes('kasuri methi')
  ) {
    targetSubcat = 'Whole Spices & Staples';
  }

  // Fallback if not matched
  if (!VALID_SUBCATS.includes(targetSubcat)) {
    if (targetSubcat.includes('Pickle') || targetSubcat.includes('Chutney')) {
      targetSubcat = 'Andhra Pickles & Pastes';
    } else if (targetSubcat.includes('Sambar') || targetSubcat.includes('Rasam')) {
      targetSubcat = 'Sambar, Rasam & Podis';
    } else if (targetSubcat.includes('Chilli') || targetSubcat.includes('Turmeric')) {
      targetSubcat = 'Chilli, Turmeric & Coriander';
    } else if (targetSubcat.includes('Masala')) {
      targetSubcat = 'Masala Powders & Blends';
    } else {
      targetSubcat = 'Whole Spices & Staples';
    }
  }

  p.sub_category = targetSubcat;
  p.subCategory = targetSubcat;
  p.subcategory = targetSubcat;
}

// -------------------------------------------------------------
// F. Update categories in migrated_categories.json
// -------------------------------------------------------------
const spicesCat = categories.find(c => c.id === 'spices-masalas' || c.slug === 'spices-masalas');
if (spicesCat) {
  spicesCat.subcategories = VALID_SUBCATS;
  console.log('Updated spices-masalas subcategories in migrated_categories.json:', VALID_SUBCATS);
}

// -------------------------------------------------------------
// G. Update Brand Logos in migrated_brands.json
// -------------------------------------------------------------
const brandLogoUpdates = {
  'brand-catch': { name: 'Catch', logo_url: '/brands/catch.png' },
  'brand-gopuram': { name: 'Gopuram', logo_url: '/brands/gopuram.png' },
  'brand-g1mart': { name: 'G1Mart', logo_url: '/brands/g1-mart.png' },
  'brand-g1mart-loose': { name: 'G1 Mart Loose Staples', logo_url: '/brands/g1mart-loose.png' },
  'brand-mdh': { name: 'MDH', logo_url: '/brands/mdh.png' },
  'brand-everest': { name: 'Everest', logo_url: '/brands/everest.png' },
  'brand-sakthi': { name: 'Sakthi', logo_url: '/brands/sakthi.png' },
  'brand-aashirvaad': { name: 'Aashirvaad', logo_url: '/brands/aashirvaad.png' },
  'brand-aachi': { name: 'Aachi', logo_url: '/brands/aachi.png' },
  'brand-sri-durga': { name: 'Sri Durga', logo_url: '/brands/sri-durga.png' },
};

for (const [bId, bInfo] of Object.entries(brandLogoUpdates)) {
  let b = brands.find(item => item.id === bId || item.name.toLowerCase() === bInfo.name.toLowerCase());
  if (b) {
    b.logo_url = bInfo.logo_url;
    console.log(`Updated brand logo for ${b.name}: ${bInfo.logo_url}`);
  } else {
    brands.push({
      id: bId,
      name: bInfo.name,
      logo_url: bInfo.logo_url,
      product_count: 5,
    });
    console.log(`Added brand with logo: ${bInfo.name}`);
  }
}

// -------------------------------------------------------------
// H. Save All Changes
// -------------------------------------------------------------
fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(VARIANTS_PATH, JSON.stringify(variants, null, 2), 'utf8');
fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2), 'utf8');
fs.writeFileSync(BRANDS_PATH, JSON.stringify(brands, null, 2), 'utf8');

console.log('Successfully written updated catalog, variants, categories, and brands!');
