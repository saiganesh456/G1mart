const { chromium } = require('playwright');

async function captureBags() {
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
  await page.goto('http://localhost:3000/category/atta-rice-dal', { waitUntil: 'networkidle' });

  // Click on "Sri Lalitha (2)"
  const lalithaBtn = await page.$('button:has-text("Sri Lalitha")');
  if (lalithaBtn) {
    await lalithaBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scratch_live_sri_lalitha_cards.png' });
    console.log('Saved scratch_live_sri_lalitha_cards.png');
  }

  // Click on "Kurnool Special (1)"
  const kurnoolBtn = await page.$('button:has-text("Kurnool Special")');
  if (kurnoolBtn) {
    await kurnoolBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scratch_live_kurnool_cards.png' });
    console.log('Saved scratch_live_kurnool_cards.png');
  }

  await browser.close();
}

captureBags().catch(console.error);
