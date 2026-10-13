const { chromium } = require('playwright');

async function testScreenshots() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['geolocation'],
    geolocation: { latitude: 14.4329, longitude: 79.9680 },
  });

  await context.addInitScript(() => {
    localStorage.setItem('g1_user_location', JSON.stringify({
      address: 'Beside Padarupalli, Nellore, Andhra Pradesh - 524004',
      lat: 14.4329,
      lng: 79.9680
    }));
    localStorage.setItem('g1_location_prompt_dismissed', 'true');
    localStorage.setItem('g1_notifications_dismissed', 'true');
  });

  const page = await context.newPage();

  // 1. Local Dals page
  console.log('1. Capturing local dals clean...');
  await page.goto('http://localhost:3000/category/local-dals', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch_clean_local_dals.png', fullPage: false });

  // 2. Kolam & Sona Masuri Subcategory (Where Rice Bags are)
  console.log('2. Capturing rice bags...');
  await page.goto('http://localhost:3000/category/atta-rice-dal?subCategory=Kolam%2C+Sona+Masuri+%26+Boiled+Rice', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch_clean_rice_bags.png', fullPage: false });

  // 3. Aashirvaad Atta Product Page
  console.log('3. Capturing Aashirvaad page...');
  await page.goto('http://localhost:3000/product/g1-p1572', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch_clean_aashirvaad.png', fullPage: false });

  await browser.close();
  console.log('All 3 clean screenshots captured!');
}

testScreenshots().catch(console.error);
