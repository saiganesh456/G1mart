const products = require('../data/migrated_products.json');
const variants = require('../data/migrated_product_variants.json');

const activeSpices = products.filter(p => 
  (p.category_id === 'spices-masalas' || p.category === 'spices-masalas') &&
  p.is_active !== false && p.isActive !== false
);

console.log(`\n=== ACTIVE SPICES ON STOREFRONT: ${activeSpices.length} items ===\n`);

const canonicalIds = ['g1-spc051', 'g1-spc053', 'g1-spc058', 'g1-spc052', 'g1-p0286', 'g1-p0707', 'g1-p0333', 'g1-canon-mirchi-01'];

console.log('--- 8 CANONICAL G1 MART PRODUCTS ---');
canonicalIds.forEach(id => {
  const p = activeSpices.find(item => item.id === id);
  if (!p) {
    console.error(`ERROR: Canonical product ${id} not found in active spices!`);
    return;
  }
  const pVars = variants.filter(v => v.product_id === p.id);
  console.log(`[${p.id}] ${p.name}`);
  console.log(`  Brand: ${p.brand} (brand_id: ${p.brand_id})`);
  console.log(`  SubCategory: ${p.sub_category || p.subCategory}`);
  console.log(`  Image: ${p.image_url}`);
  console.log(`  Variants (${pVars.length}): ${pVars.map(v => `${v.size_label} -> ₹${v.price} (MRP: ₹${v.mrp})`).join(' | ')}`);
});

console.log('\n--- VERIFYING NO DUPLICATES IN ACTIVE CATALOG ---');
const checkKeywords = [
  { name: 'Miriyalu / Pepper', kw: ['miriyalu', 'pepper bols'] },
  { name: 'Dalchini', kw: ['dalchini'] },
  { name: 'Nuvvulu', kw: ['nuvvulu'] },
  { name: 'Lavangalu', kw: ['lavangalu'] },
  { name: 'Vamu', kw: ['vamu'] },
  { name: 'Nalla Karam', kw: ['nalla karam'] },
  { name: 'Jeera / Jeelakarra', kw: ['jeera', 'jeelakarra', 'jilakara', 'gelakara', 'gilakara'] },
  { name: 'Guntur Dry Mirchi', kw: ['guntur dry red mirchi', 'endu mirchi', 'endu marchi', 'endu merchi'] }
];

checkKeywords.forEach(({ name, kw }) => {
  const matched = activeSpices.filter(p => kw.some(k => p.name.toLowerCase().includes(k)));
  console.log(`${name}: ${matched.length} items -> ${matched.map(m => `[${m.id}] ${m.name} (${m.brand})`).join(', ')}`);
});

console.log('\n--- VERIFYING JUNK ITEMS ---');
const junk = activeSpices.filter(p => p.id === 'g1-p0367' || p.name.toLowerCase().includes('something'));
console.log(`Junk items active: ${junk.length}`);
