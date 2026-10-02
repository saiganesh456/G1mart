const fs = require('fs');
const path = require('path');

const packshotDir = path.join(__dirname, '..', 'public', 'products', 'packshots');
fs.mkdirSync(packshotDir, { recursive: true });

// Direct exact CDN & Open Food Facts URLs for authentic Indian retail packages
const exactPacks = [
  {
    name: 'aashirvaad-atta.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/501/6838/front_en.7.400.jpg'
  },
  {
    name: 'aashirvaad-salt.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/512/3123/front_en.13.400.jpg'
  },
  {
    name: 'tata-salt.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/404/390/1015/front_en.34.400.jpg'
  },
  {
    name: 'parle-g.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/171/913/4845/front_en.11.400.jpg'
  },
  {
    name: 'surf-excel.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/103/086/5169/front_en.9.400.jpg'
  },
  {
    name: 'bru-instant.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/103/053/5895/front_en.3.400.jpg'
  },
  {
    name: 'horlicks.jpg',
    url: 'https://images.openfoodfacts.org/images/products/506/011/391/9359/front_en.27.400.jpg'
  },
  {
    name: 'vim-bar.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/910/600/7123/front_en.3.400.jpg'
  },
  {
    name: 'bingo-mad-angles.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/501/3684/front_en.24.400.jpg'
  }
];

async function downloadPackshots() {
  for (const item of exactPacks) {
    const dest = path.join(packshotDir, item.name);
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'G1Mart-App/1.0 (contact@g1mart.com)' }
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buf));
        console.log(`✓ Saved ${item.name} (${buf.byteLength} bytes)`);
      } else {
        console.log(`✗ HTTP ${res.status} for ${item.name}`);
      }
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
}

downloadPackshots();
