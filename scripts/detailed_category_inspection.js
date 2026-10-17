const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('./data/migrated_products.json', 'utf8'));

function inspectCategory(catId) {
  const catProds = prods.filter(p => (p.category_id === catId || p.category === catId));
  console.log(`\n========================================`);
  console.log(`INSPECTING CATEGORY: ${catId} (Total: ${catProds.length})`);
  console.log(`========================================`);

  const g1Items = [];
  catProds.forEach(p => {
    const b = (p.brand || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    const img = p.image_url || p.imageUrl || '';
    const isG1 = b.includes('g1') || b.includes('jeevan') || n.startsWith('g1 mart') || n.startsWith('jeevan mart') || img.includes('g1_');

    if (isG1) {
      const diskPath = './public' + (img.startsWith('/') ? img : '/' + img);
      const exists = fs.existsSync(diskPath);
      g1Items.push({
        id: p.id,
        name: p.name,
        brand: p.brand,
        subCategory: p.subCategory || p.sub_category,
        image_url: img,
        exists
      });
    }
  });

  console.log(`Total G1/Private Label items: ${g1Items.length}`);
  g1Items.forEach(it => {
    console.log(`- [${it.id}] ${it.name} | SubCat: ${it.subCategory} | Img: ${it.image_url} (exists: ${it.exists})`);
  });
}

inspectCategory('atta-rice-dal');
