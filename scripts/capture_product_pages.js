const { chromium } = require('playwright');

async function testProducts() {
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

  // 1. Kurnool Rice Bag product page
  await page.goto('http://localhost:3000/product/g1-ric037', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch_live_kurnool_prod.png' });
  console.log('Saved scratch_live_kurnool_prod.png');

  // 2. Sri Lalitha Rice Bag product page
  await page.goto('http://localhost:3000/product/g1-ric034', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch_live_lalitha_prod.png' });
  console.log('Saved scratch_live_lalitha_prod.png');

  await browser.close();
}

testProducts().catch(console.error);
