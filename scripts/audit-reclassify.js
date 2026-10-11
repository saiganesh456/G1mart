const fs = require('fs');
const prods = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf8'));

// Audit misclassified products
const reclassifications = [
  { id: 'g1-p0382', to: 'atta-rice-dal', reason: 'White Urad DAL was misplaced in floor-surface-cleaners' },
  { id: 'g1-p0383', to: 'atta-rice-dal', reason: 'White Urad Dal 250g was misplaced in floor-surface-cleaners' },
  { id: 'g1-p0041', to: 'dry-fruits-cereals', reason: 'DRY Nuts BOL was misplaced in instant-food' },
  { id: 'g1-p0050', to: 'kitchenware', reason: 'Lock 35mm was misplaced in instant-food' },
  { id: 'g1-p0110', to: 'sweets-chocolates', reason: 'Milky BAR chocolate was misplaced in dairy-bread-eggs' },
  { id: 'g1-p0118', to: 'sweets-chocolates', reason: 'Milky BAR BIG BOX was misplaced in dairy-bread-eggs' },
  { id: 'g1-p0152', to: 'pooja-needs', reason: 'Pitambari Rooperi silver polish was misplaced in hygiene' },
  { id: 'g1-p0088', to: 'oil-ghee-masala', reason: 'Endu Mirchi (Dried Red Chillies) belongs to oil-ghee-masala' },
  { id: 'g1-p0080', to: 'atta-rice-dal', reason: 'Korralu (Foxtail Millet) belongs under Atta Rice & Dal' },
  { id: 'g1-p0063', to: 'atta-rice-dal', reason: 'Rice Flour belongs under Atta Rice & Dal' },
  { id: 'g1-p0206', to: 'atta-rice-dal', reason: 'Idli Rava belongs under Atta Rice & Dal' }
];

console.log('| Product ID | Product Name | Original Category | Corrected Category | Audit Reason |');
console.log('|---|---|---|---|---|');
for (const item of reclassifications) {
  const p = prods.find(x => x.id === item.id);
  if (p) {
    console.log(`| ${p.id} | ${p.name} | ${p.category_id} | ${item.to} | ${item.reason} |`);
    p.category_id = item.to;
  }
}

fs.writeFileSync('data/migrated_products.json', JSON.stringify(prods, null, 2), 'utf8');
console.log('\nAudit reclassifications applied successfully.');
