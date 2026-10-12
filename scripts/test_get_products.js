const { productService } = require('./src/services/productService.ts');

async function test() {
  const products = await productService.getProducts();
  const oils = products.filter(p => p.category_id === 'oil-ghee-masala' || p.category === 'oil-ghee-masala');
  console.log('Total oils returned:', oils.length);
  for (const o of oils) {
    console.log(o.id, o.name, o.brand, o.image_url);
  }
}

test();
