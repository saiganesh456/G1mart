const fs = require('fs');
const path = require('path');

const packshotDir = path.join(__dirname, '..', 'public', 'products', 'packshots');
fs.mkdirSync(packshotDir, { recursive: true });

const packshots = [
  // 1. Aashirvaad Atta
  {
    file: 'aashirvaad-atta-1kg.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/501/6838/front_en.7.400.jpg'
  },
  // 2. Aashirvaad Crystal Salt
  {
    file: 'aashirvaad-crystal-salt.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/512/3123/front_en.13.400.jpg'
  },
  // 3. Aashirvaad Suji Rava
  {
    file: 'aashirvaad-suji-rava.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/500/1070/front_en.3.400.jpg'
  },
  // 4. Cadbury 5 Star Chocolate
  {
    file: 'cadbury-5-star.jpg',
    url: 'https://images.openfoodfacts.org/images/products/762/220/231/8078/front_en.14.400.jpg'
  },
  // 5. 5 Much / Nestle Munch
  {
    file: 'nestle-munch.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/105/800/5080/front_en.7.400.jpg'
  },
  // 6. Ariel Front Liquid Detergent
  {
    file: 'ariel-front-liq.jpg',
    url: 'https://images.openfoodfacts.org/images/products/498/717/612/6634/front_en.3.400.jpg'
  },
  // 7. Arun Bites Ice Cream
  {
    file: 'arun-bites.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/405/730/1566/front_en.4.400.jpg'
  },
  // 8. Arun Donut Ice Cream
  {
    file: 'arun-donut.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/405/730/2570/front_en.7.400.jpg'
  },
  // 9. Arun Popitos Ice Cream
  {
    file: 'arun-popitos.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/405/730/7865/front_en.3.400.jpg'
  },
  // 10. Tata Salt
  {
    file: 'tata-salt.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/404/390/1015/front_en.34.400.jpg'
  },
  // 11. Parle-G Biscuit
  {
    file: 'parle-g.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/171/913/4845/front_en.11.400.jpg'
  },
  // 12. Britannia Bourbon
  {
    file: 'britannia-bourbon.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/106/313/9329/front_en.14.400.jpg'
  },
  // 13. Maggi 2-Minute Masala Noodles
  {
    file: 'maggi-noodles.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/105/802/3787/front_en.6.400.jpg'
  },
  // 14. Surf Excel Matic
  {
    file: 'surf-excel.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/103/086/5169/front_en.9.400.jpg'
  },
  // 15. Bru Instant Coffee
  {
    file: 'bru-instant.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/103/053/5895/front_en.3.400.jpg'
  },
  // 16. Horlicks Health Drink
  {
    file: 'horlicks.jpg',
    url: 'https://images.openfoodfacts.org/images/products/506/011/391/9359/front_en.27.400.jpg'
  },
  // 17. Vim Dishwash Bar
  {
    file: 'vim-bar.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/910/600/7123/front_en.3.400.jpg'
  },
  // 18. Bingo Mad Angles
  {
    file: 'bingo-mad-angles.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/172/501/3684/front_en.24.400.jpg'
  },
  // 19. Kurkure Masala Munch
  {
    file: 'kurkure.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/149/136/1026/front_en.51.400.jpg'
  },
  // 20. Thums Up
  {
    file: 'thums-up.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/176/404/2911/front_en.41.400.jpg'
  },
  // 21. Dettol Original Soap
  {
    file: 'dettol-soap.jpg',
    url: 'https://images.openfoodfacts.org/images/products/629/512/001/0150/front_en.3.400.jpg'
  },
  // 22. 5 Star Tea / Tea Powder
  {
    file: 'tea-powder.jpg',
    url: 'https://images.openfoodfacts.org/images/products/890/103/082/6122/front_en.11.400.jpg'
  }
];

async function downloadAll() {
  console.log('Downloading exact retail packshots...');
  for (const item of packshots) {
    const dest = path.join(packshotDir, item.file);
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'G1Mart-QuickCommerce/2.0' }
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buf));
        console.log(`✓ [SUCCESS] ${item.file} (${buf.byteLength} bytes)`);
      } else {
        console.log(`✗ HTTP ${res.status} for ${item.file}`);
      }
      await new Promise(r => setTimeout(r, 600)); // friendly pacing
    } catch (e) {
      console.error(`✗ Error on ${item.file}:`, e.message);
    }
  }
  console.log('Finished downloading exact retail packshots!');
}

downloadAll();
