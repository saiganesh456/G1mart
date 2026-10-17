const { productService } = require('../src/services/productService');

async function test() {
  const products = await productService.getProducts();
  const spiceProducts = products.filter(p => p.category_id === 'spices-masalas' || p.category === 'spices-masalas');
  
  console.log(`\n=== STOREFRONT ACTIVE SPICES: ${spiceProducts.length} items ===\n`);
  
  const keywords = ['miriyalu', 'dalchini', 'nuvvulu', 'lavangalu', 'vamu', 'nalla karam', 'jeelakarra', 'jeera', 'mirchi', 'something'];
  
  keywords.forEach(k => {
    const matched = spiceProducts.filter(p => p.name.toLowerCase().includes(k));
    console.log(`Keyword "${k}": ${matched.length} active products`);
    matched.forEach(p => {
      console.log(`  - [${p.id}] ${p.name}`);
      console.log(`    Brand: ${p.brand} | Unit: ${p.unit} | Price: ₹${p.price} | Image: ${p.image_url}`);
      console.log(`    Variants (${p.variants.length}): ${p.variants.map(v => `${v.size_label || v.name} (₹${v.price})`).join(', ')}`);
    });
  });

  // Verify junk item is completely gone
  const junk = spiceProducts.filter(p => p.id === 'g1-p0367' || p.name.toLowerCase().includes('something'));
  console.log(`\nJunk items remaining: ${junk.length}`);
  
  // Verify duplicates are completely gone
  const miriyaluCount = spiceProducts.filter(p => p.name.toLowerCase().includes('miriyalu') || p.name.toLowerCase().includes('pepper bols')).length;
  console.log(`Miriyalu product count: ${miriyaluCount} (Expected: 1 canonical G1 Mart product, plus Catch sprinkler)`);
}

test().catch(console.error);
