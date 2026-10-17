const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      } else {
        resolve(false);
      }
    }).on('error', reject);
  });
}

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  const targets = [
    { name: 'dates', query: 'dry dates transparent standing pouch white background' },
    { name: 'raisins', query: 'golden raisins transparent standing pouch white background' },
    { name: 'pumpkin_seeds', query: 'raw pumpkin seeds standing pouch white background' }
  ];

  for (const t of targets) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(t.query)}&first=1`;
    console.log(`Searching for ${t.name}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Find image srcs
    const imgUrls = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img.mimg'));
      return imgs.map(i => i.src).filter(s => s && s.startsWith('http'));
    });
    
    console.log(`Found ${imgUrls.length} images for ${t.name}`);
    if (imgUrls.length > 0) {
      const dest = path.resolve(`scratch_found_${t.name}.jpg`);
      await download(imgUrls[0], dest);
      console.log(`Downloaded ${t.name} to ${dest}`);
    }
  }

  await browser.close();
}

run().catch(console.error);
