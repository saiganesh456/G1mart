const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODS_PATH = path.join(ROOT, 'data', 'migrated_products.json');
const VARS_PATH = path.join(ROOT, 'data', 'migrated_product_variants.json');
const MAP_PATH = path.join(ROOT, 'src', 'data', 'legacyIdMap.json');

const prods = JSON.parse(fs.readFileSync(PRODS_PATH, 'utf8'));
const vars = JSON.parse(fs.readFileSync(VARS_PATH, 'utf8'));
const legacyMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));

console.log('Original products:', prods.length);
console.log('Original variants:', vars.length);

// Make backups
fs.writeFileSync(path.join(ROOT, 'data', 'migrated_products.backup_pre_group.json'), JSON.stringify(prods, null, 2));
fs.writeFileSync(path.join(ROOT, 'data', 'migrated_product_variants.backup_pre_group.json'), JSON.stringify(vars, null, 2));

// Helper: normalize base name
function extractBaseName(name) {
  let clean = name.trim();
  // Remove sizes at the end or middle
  clean = clean.replace(/\b\d+(\.\d+)?\s*(kg|g|gm|gms|l|lt|ltr|litre|litres|ml|pcs|pieces|pc|units?|standard)\b/gi, '');
  clean = clean.replace(/\b(pack\s+of\s+\d+|set\s+of\s+\d+)\b/gi, '');
  clean = clean.replace(/\b\d+\s*x\s*\d+\s*(g|gm|ml|kg)\b/gi, '');
  clean = clean.replace(/\b(pouch|pet|bottle|botel|can|tin|jar|box|bar|packet)\b/gi, '');
  clean = clean.replace(/[\(\)\-\,\/]+/g, ' ');
  clean = clean.replace(/\s{2,}/g, ' ').trim();
  return clean || name.trim();
}

// Map of variant list by product id
const varsByPid = new Map();
for (const v of vars) {
  if (!varsByPid.has(v.product_id)) varsByPid.set(v.product_id, []);
  varsByPid.get(v.product_id).push(v);
}

// 1. Specific Handcrafted Grouping for Freedom Refined Sunflower Oil
const freedomSunflowerIds = prods.filter(p => {
  const name = (p.name || '').toLowerCase();
  const brand = (p.brand || '').toLowerCase();
  return (brand.includes('freedom') || name.includes('freedom')) && name.includes('sunflower');
}).map(p => p.id);

console.log('Found Freedom Sunflower Oil product IDs to consolidate:', freedomSunflowerIds);

// Primary Freedom Sunflower Product
const primaryFreedomId = 'g1-p1701';
const freedomProduct = prods.find(p => p.id === primaryFreedomId) || prods.find(p => freedomSunflowerIds.includes(p.id));

if (freedomProduct) {
  freedomProduct.id = primaryFreedomId;
  freedomProduct.name = 'Freedom Refined Sunflower Oil';
  freedomProduct.brand = 'Freedom';
  freedomProduct.brand_id = 'brand-freedom';
  freedomProduct.category_id = 'oil-ghee-masala';
  freedomProduct.category = 'oil-ghee-masala';
  freedomProduct.sub_category = 'Edible Oils & Pure Cow Ghee';
  freedomProduct.subCategory = 'Edible Oils & Pure Cow Ghee';
  freedomProduct.image_url = '/products/packshots/freedom-oil-1l.jpg';
  freedomProduct.imageUrl = '/products/packshots/freedom-oil-1l.jpg';
  freedomProduct.image = '/products/packshots/freedom-oil-1l.jpg';
  freedomProduct.image_status = 'verified';
  freedomProduct.imageStatus = 'verified';

  // Standard clean variants for Freedom Sunflower Oil
  const freedomVariants = [
    { id: `${primaryFreedomId}-v1`, product_id: primaryFreedomId, size_label: '500 ml', price: 75, mrp: 75, stock: 25, image_url: '/products/packshots/freedom-oil-1l.jpg' },
    { id: `${primaryFreedomId}-v2`, product_id: primaryFreedomId, size_label: '1 L', price: 145, mrp: 145, stock: 25, image_url: '/products/packshots/freedom-oil-1l.jpg' },
    { id: `${primaryFreedomId}-v3`, product_id: primaryFreedomId, size_label: '2 L', price: 305, mrp: 305, stock: 20, image_url: '/products/packshots/freedom-oil-1l.jpg' },
    { id: `${primaryFreedomId}-v4`, product_id: primaryFreedomId, size_label: '5 L', price: 745, mrp: 745, stock: 15, image_url: '/products/packshots/freedom-oil-5l.jpg' },
    { id: `${primaryFreedomId}-v5`, product_id: primaryFreedomId, size_label: '15 L', price: 2250, mrp: 2250, stock: 10, image_url: '/products/packshots/freedom-oil-5l.jpg' },
    { id: `${primaryFreedomId}-v6`, product_id: primaryFreedomId, size_label: '15 kg', price: 2450, mrp: 2450, stock: 8, image_url: '/products/packshots/freedom-oil-5l.jpg' }
  ];

  varsByPid.set(primaryFreedomId, freedomVariants);

  // Map all other freedom IDs to primaryFreedomId
  for (const fid of freedomSunflowerIds) {
    if (fid !== primaryFreedomId) {
      legacyMap[fid] = primaryFreedomId;
      varsByPid.delete(fid);
    }
  }
}

// 2. Specific Handcrafted Grouping for Fortune Sunflower Oil
const fortuneSunflowerIds = prods.filter(p => {
  const name = (p.name || '').toLowerCase();
  const brand = (p.brand || '').toLowerCase();
  return (brand.includes('fortune') || name.includes('fortune')) && name.includes('sunflower');
}).map(p => p.id);

console.log('Found Fortune Sunflower Oil product IDs to consolidate:', fortuneSunflowerIds);

const primaryFortuneId = fortuneSunflowerIds[0] || 'g1-p1627';
const fortuneProduct = prods.find(p => p.id === primaryFortuneId);
if (fortuneProduct) {
  fortuneProduct.name = 'Fortune Sunlite Refined Sunflower Oil';
  fortuneProduct.brand = 'Fortune';
  fortuneProduct.brand_id = 'brand-fortune';
  fortuneProduct.category_id = 'oil-ghee-masala';
  fortuneProduct.category = 'oil-ghee-masala';
  fortuneProduct.image_url = '/products/packshots/fortune-sunlite-clean.jpg';
  fortuneProduct.imageUrl = '/products/packshots/fortune-sunlite-clean.jpg';
  fortuneProduct.image = '/products/packshots/fortune-sunlite-clean.jpg';
  fortuneProduct.image_status = 'verified';

  const fortuneVariants = [
    { id: `${primaryFortuneId}-v1`, product_id: primaryFortuneId, size_label: '1 L', price: 145, mrp: 150, stock: 25, image_url: '/products/packshots/fortune-sunlite-clean.jpg' },
    { id: `${primaryFortuneId}-v2`, product_id: primaryFortuneId, size_label: '5 L', price: 745, mrp: 780, stock: 15, image_url: '/products/packshots/fortune-sunlite-clean.jpg' }
  ];
  varsByPid.set(primaryFortuneId, fortuneVariants);

  for (const fid of fortuneSunflowerIds) {
    if (fid !== primaryFortuneId) {
      legacyMap[fid] = primaryFortuneId;
      varsByPid.delete(fid);
    }
  }
}

// 3. Fix Atta items incorrectly placed in oil-ghee-masala
const attaWrongCat = prods.filter(p => p.category_id === 'oil-ghee-masala' && (p.name || '').toLowerCase().includes('atta'));
for (const ap of attaWrongCat) {
  console.log('Reclassifying misplaced atta product:', ap.id, ap.name);
  ap.category_id = 'atta-rice-dal';
  ap.category = 'atta-rice-dal';
  ap.sub_category = 'Atta & Flours';
  ap.subCategory = 'Atta & Flours';
  if ((ap.image_url || '').includes('bigbasket.com')) {
    ap.image_url = '/products/packshots/aashirvaad-atta.jpg';
    ap.imageUrl = '/products/packshots/aashirvaad-atta.jpg';
    ap.image = '/products/packshots/aashirvaad-atta.jpg';
    ap.image_status = 'verified';
  }
}

// 4. Fix Saffola, Idhayam, Amul Ghee
for (const p of prods) {
  const n = (p.name || '').toLowerCase();
  if (n.includes('saffola') && n.includes('gold')) {
    p.image_url = '/products/packshots/saffola-gold-oil.jpg';
    p.imageUrl = '/products/packshots/saffola-gold-oil.jpg';
    p.image = '/products/packshots/saffola-gold-oil.jpg';
    p.image_status = 'verified';
  } else if (n.includes('idhayam')) {
    p.image_url = '/products/packshots/idhayam-oil.jpg';
    p.imageUrl = '/products/packshots/idhayam-oil.jpg';
    p.image = '/products/packshots/idhayam-oil.jpg';
    p.image_status = 'verified';
  } else if (n.includes('amul') && n.includes('ghee')) {
    p.image_url = '/products/packshots/amul-ghee.jpg';
    p.imageUrl = '/products/packshots/amul-ghee.jpg';
    p.image = '/products/packshots/amul-ghee.jpg';
    p.image_status = 'verified';
  }
}

// Exclude merged non-primary products from final list
const excludedIds = new Set();
for (const fid of freedomSunflowerIds) {
  if (fid !== primaryFreedomId) excludedIds.add(fid);
}
for (const fid of fortuneSunflowerIds) {
  if (fid !== primaryFortuneId) excludedIds.add(fid);
}

const finalProds = prods.filter(p => !excludedIds.has(p.id));
const finalVars = [];
for (const [pid, vList] of varsByPid.entries()) {
  if (!excludedIds.has(pid)) {
    finalVars.push(...vList);
  }
}

console.log('Consolidated products count:', finalProds.length);
console.log('Consolidated variants count:', finalVars.length);

fs.writeFileSync(PRODS_PATH, JSON.stringify(finalProds, null, 2));
fs.writeFileSync(VARS_PATH, JSON.stringify(finalVars, null, 2));
fs.writeFileSync(MAP_PATH, JSON.stringify(legacyMap, null, 2));
console.log('Successfully saved updated migrated_products.json, migrated_product_variants.json, and legacyIdMap.json!');
