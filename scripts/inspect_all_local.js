const fs = require('fs');
const products = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf8'));

const byCat = {};
products.forEach(p => {
  const cat = p.category_id || p.category || 'unknown';
  const isLocal = p.brand === 'Local / Unbranded' || p.brand === 'Local' || cat.startsWith('local-');
  if (isLocal) {
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(p);
  }
});

for (const [cat, list] of Object.entries(byCat)) {
  console.log('Category: ' + cat + ' (' + list.length + ' products)');
  list.forEach(p => {
    const isNewGen = p.image && p.image.includes('generated_pouches');
    console.log('  ' + p.id.padEnd(10) + ' | ' + (p.name || '').padEnd(35) + ' | ' + (isNewGen ? 'NEW POUCH' : p.image));
  });
}
