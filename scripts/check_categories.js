const prods = require('../data/migrated_products.json');
const cats = require('../data/migrated_categories.json');
const catMap = new Map(cats.map(c => [c.id, c.name]));

const map = {};
prods.forEach(p => {
  const cat = p.category_id || p.category;
  const sub = p.sub_category || p.subCategory;
  if (!map[cat]) map[cat] = new Set();
  if (sub) map[cat].add(sub);
});

for (const [cat, subs] of Object.entries(map)) {
  console.log(`=== ${cat} (${catMap.get(cat) || 'unknown'}) ===`);
  console.log(Array.from(subs).join(', '));
}
