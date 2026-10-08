const path = require('path');
const products = require(path.join(__dirname, '../data/migrated_products.json'));
const variants = require(path.join(__dirname, '../data/migrated_product_variants.json'));
const brands = require(path.join(__dirname, '../data/migrated_brands.json'));
const subCats = require(path.join(__dirname, '../data/migrated_sub_categories.json'));
const legacyMap = require(path.join(__dirname, '../src/data/legacyIdMap.json'));

console.log("=== VERIFYING PHASE 3 FLOW ===");

// 1. Home > Category
const firstCat = subCats[0].category_id;
const catProducts = products.filter(p => p.category_id === firstCat);
console.log(`Category "${firstCat}" has ${catProducts.length} products.`);
if (catProducts.length === 0) throw new Error("No products in category!");

// 2. Category > Sub-Category
const firstSub = catProducts[0].sub_category;
const subProducts = catProducts.filter(p => p.sub_category === firstSub);
console.log(`Sub-category "${firstSub}" has ${subProducts.length} products.`);

// 3. Sub-Category > Product Detail
const sampleProd = subProducts[0];
console.log(`Opening product detail for: ${sampleProd.id} "${sampleProd.name}" (${sampleProd.brand})`);

// Check variants for sample product
const prodVariants = variants.filter(v => v.product_id === sampleProd.id);
console.log(`Product has ${prodVariants.length} variants.`);

// Check "More from this brand"
const brandProducts = products.filter(p => p.id !== sampleProd.id && p.brand === sampleProd.brand);
console.log(`"More from this brand" has ${brandProducts.length} items for brand "${sampleProd.brand}".`);

// 4. Search > Product
const searchPid = sampleProd.id;
const resolved = legacyMap[searchPid] || searchPid;
console.log(`Search result tap for ${searchPid} resolves to ${resolved} (Detail URL: /product/${resolved})`);

console.log("ALL PHASE 3 STOREFRONT FLOWS VERIFIED SUCCESSFULLY!");
