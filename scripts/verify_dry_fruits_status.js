const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('./src/data/products-catalog.json', 'utf8'));

const dryFruits = catalog.filter(p => p.category_id === 'dry-fruits-cereals' || p.category === 'dry-fruits-cereals');
console.log('Total dry fruits in catalog:', dryFruits.length);
const active = dryFruits.filter(p => p.is_active !== false && p.status !== 'inactive');
console.log('Active dry fruits:', active.length);

console.log('\n--- ACTIVE DRY FRUITS & CEREALS ---');
active.forEach(p => {
  const vCount = (p.variants || []).length;
  console.log(`[${p.id}] ${p.name} | Brand: ${p.brand} | Variants: ${vCount} | Img: ${p.image_url || p.image}`);
});

const inactive = dryFruits.filter(p => p.is_active === false || p.status === 'inactive');
console.log(`\n--- DEACTIVATED DUPLICATES / JUNK (${inactive.length}) ---`);
inactive.forEach(p => {
  console.log(`[DEACTIVATED] ${p.id} : ${p.name}`);
});
