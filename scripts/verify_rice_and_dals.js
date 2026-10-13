const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyPages() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 950 },
    permissions: ['geolocation'],
    geolocation: { latitude: 14.4329, longitude: 79.9680 }
  });
  
  const page = await context.newPage();
  
  // Set localStorage location before navigating to pages
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    const loc = {
      formattedAddress: "Padarupalli, Nellore, Andhra Pradesh 524004",
      street: "Beside Padarupalli",
      area: "Padarupalli",
      city: "Nellore",
      pincode: "524004",
      state: "Andhra Pradesh",
      lat: 14.4329,
      lng: 79.9680,
      serviceable: true,
      distance_km: 1.5,
      eta_min: 15,
      isManual: true
    };
    localStorage.setItem('g1mart_delivery_location_v1', JSON.stringify(loc));
    localStorage.setItem('g1mart_saved_manual_location_v1', JSON.stringify(loc));
  });

  const testUrls = [
    { name: 'verify_kurnool_rice', url: 'http://localhost:3000/product/g1-ric037' },
    { name: 'verify_sri_lalitha_rice', url: 'http://localhost:3000/product/g1-ric051' },
    { name: 'verify_aashirvaad_atta', url: 'http://localhost:3000/product/g1-p1572' },
    { name: 'verify_local_dals', url: 'http://localhost:3000/category/local-dals' },
    { name: 'verify_atta_rice_dal', url: 'http://localhost:3000/category/atta-rice-dal' }
  ];

  for (const item of testUrls) {
    console.log(`Checking ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const shotPath = path.join(__dirname, '..', `${item.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot to ${shotPath}`);
  }

  await browser.close();
  console.log('All verification screenshots captured cleanly without popups!');
}

verifyPages().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
