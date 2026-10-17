const fs = require('fs');
const items = JSON.parse(fs.readFileSync('scratch_spices_audit.json', 'utf8'));
const keywords = ['miriya', 'pepper', 'dalch', 'cinnamon', 'nuvvul', 'sesame', 'lavang', 'clove', 'vamu', 'ajwain', 'nalla karam', 'karam', 'jeera', 'jeela', 'cumin', 'mirchi', 'chilli', 'something'];

items.forEach(p => {
  const match = keywords.some(k => p.name.toLowerCase().includes(k));
  if (match) {
    console.log(`[${p.id}] ${p.name} | brand: ${p.brand} | active: ${p.isActive} | img: ${p.image_url} | vars: [${p.variants}]`);
  }
});
