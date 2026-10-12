const fs = require('fs');
const path = require('path');
const prods = require('../data/migrated_products.json');
const vars = require('../data/migrated_product_variants.json');

const varMap = new Map();
vars.forEach(v => {
  if (!varMap.has(v.product_id)) varMap.set(v.product_id, []);
  varMap.get(v.product_id).push(v);
});

const sweets = prods.filter(p => p.category_id === 'sweets-chocolates' || p.category === 'sweets-chocolates');

sweets.forEach((p, idx) => {
  const vs = varMap.get(p.id) || [];
  const imgPath = p.image_url ? path.join(__dirname, '..', 'public', p.image_url.replace(/^\//, '')) : null;
  const exists = imgPath && fs.existsSync(imgPath);
  const size = exists ? fs.statSync(imgPath).size : 0;
  console.log(`${idx + 1}. [${p.id}] "${p.name}" | Brand: ${p.brand || p.brand_id} | Sub: ${p.sub_category || p.subCategory} | Price: ₹${vs[0]?.price} (MRP: ₹${vs[0]?.mrp}) | Img: ${p.image_url} (${exists ? size + 'b' : 'MISSING'})`);
});
