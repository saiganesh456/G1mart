const fs = require('fs');
const path = require('path');

const categoryImages = [
  {
    name: 'atta-rice-dal.jpg',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', // Rice & grains
  },
  {
    name: 'masala-oil.jpg',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', // Spices & oils
  },
  {
    name: 'dairy-bread-eggs.jpg',
    url: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80', // Milk & dairy
  },
  {
    name: 'snacks-munchies.jpg',
    url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80', // Chips & snacks
  },
  {
    name: 'cold-drinks-juices.jpg',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80', // Cold drinks
  },
  {
    name: 'tea-coffee.jpg',
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', // Tea & coffee
  },
  {
    name: 'sweets-chocolates.jpg',
    url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80', // Chocolates & sweets
  },
  {
    name: 'bakery-biscuits.jpg',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', // Bread & bakery
  },
  {
    name: 'breakfast-instant.jpg',
    url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80', // Instant noodles / noodles bowl
  },
  {
    name: 'cleaning-essentials.jpg',
    url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80', // Cleaning essentials
  },
  {
    name: 'personal-care.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', // Soaps & skincare
  },
  {
    name: 'fruits-vegetables.jpg',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', // Fresh produce
  },
];

const targetDir = path.join(__dirname, '..', 'public', 'categories');
fs.mkdirSync(targetDir, { recursive: true });

async function downloadCategoryImages() {
  console.log('Downloading category showcase images...');
  for (const item of categoryImages) {
    const dest = path.join(targetDir, item.name);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
      console.log(`✓ Downloaded ${item.name} (${buf.byteLength} bytes)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('Category images complete!');
}

downloadCategoryImages();
