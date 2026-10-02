const fs = require('fs');
const path = require('path');

const staplePhotos = [
  { name: 'toor-dal.jpg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80' },
  { name: 'urad-dal.jpg', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80' },
  { name: 'moong-dal.jpg', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80' },
  { name: 'chana-dal.jpg', url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=500&q=80' },
  { name: 'cashews.jpg', url: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?auto=format&fit=crop&w=500&q=80' },
  { name: 'almonds.jpg', url: 'https://images.unsplash.com/photo-1508061252966-f720fb075908?auto=format&fit=crop&w=500&q=80' },
  { name: 'raisins.jpg', url: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?auto=format&fit=crop&w=500&q=80' },
  { name: 'chilli-powder.jpg', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80' },
  { name: 'turmeric.jpg', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80' },
  { name: 'coriander-powder.jpg', url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=500&q=80' },
  { name: 'mustard-cumin.jpg', url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=500&q=80' },
  { name: 'spices-cloves.jpg', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=500&q=80' },
  { name: 'crystal-salt.jpg', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80' },
  { name: 'sugar-jaggery.jpg', url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=500&q=80' },
  { name: 'suji-rava.jpg', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80' },
  { name: 'vermicelli.jpg', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80' },
  { name: 'poha.jpg', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80' },
  { name: 'ghee.jpg', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80' },
  { name: 'cooking-oil.jpg', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80' },
  { name: 'pooja-camphor.jpg', url: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=500&q=80' },
  { name: 'bath-soap.jpg', url: 'https://images.unsplash.com/photo-1607006314596-f3b1dbfa5f61?auto=format&fit=crop&w=500&q=80' },
  { name: 'cold-drink-bottle.jpg', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80' },
  { name: 'biscuits-pack.jpg', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80' },
  { name: 'cleaning-wash.jpg', url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=500&q=80' },
  { name: 'chips-namkeen.jpg', url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=500&q=80' },
];

const targetDir = path.join(__dirname, '..', 'public', 'products', 'photos');
fs.mkdirSync(targetDir, { recursive: true });

async function downloadStaplePhotos() {
  console.log('Downloading staple product photos...');
  for (const item of staplePhotos) {
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
  console.log('All staple photos ready!');
}

downloadStaplePhotos();
