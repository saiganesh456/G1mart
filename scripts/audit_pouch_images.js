const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('./data/migrated_products.json', 'utf8'));

const g1prods = prods.filter(p => {
  const b = (p.brand || '').toLowerCase();
  const n = (p.name || '').toLowerCase();
  return b.includes('g1') || b.includes('jeevan') || n.startsWith('g1 mart') || n.startsWith('jeevan mart');
});

console.log('Total G1 / Jeevan products:', g1prods.length);

const byCat = {};
g1prods.forEach(p => {
  const c = p.category_id || p.category;
  if (!byCat[c]) byCat[c] = [];
  byCat[c].push({ id: p.id, name: p.name, img: p.image_url });
});

for (const [cat, items] of Object.entries(byCat)) {
  console.log(`\n=== Category: ${cat} (${items.length} items) ===`);
  items.forEach(it => {
    console.log(`  ${it.id} | ${it.name} | ${it.img}`);
  });
}
