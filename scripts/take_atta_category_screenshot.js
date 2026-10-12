const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR_WORKSPACE = path.join('d:', 'web-agency-projects', 'screenshots');
fs.mkdirSync(OUT_DIR_WORKSPACE, { recursive: true });

async function takeCategoryScreenshots() {
  const browser = await chromium.launch({ headless: true });

  const tasks = [
    {
      name: 'category_atta_1280px',
      url: 'http://localhost:3000/category/atta-rice-dal',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      fullPage: true,
    },
    {
      name: 'category_atta_1280px_view',
      url: 'http://localhost:3000/category/atta-rice-dal',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      fullPage: false,
    },
    {
      name: 'category_atta_390px',
      url: 'http://localhost:3000/category/atta-rice-dal',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      fullPage: false,
    },
    {
      name: 'category_atta_390px_full',
      url: 'http://localhost:3000/category/atta-rice-dal',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      fullPage: true,
    },
  ];

  for (const t of tasks) {
    const context = await browser.newContext({
      viewport: t.viewport,
      deviceScaleFactor: t.deviceScaleFactor || 1,
      permissions: ['geolocation'],
      geolocation: { latitude: 14.4329, longitude: 79.9680 },
    });

    await context.addInitScript(() => {
      const loc = {
        formattedAddress: 'Padarupalli, Nellore',
        street: 'Govt Hospital Road',
        area: 'Padarupalli',
        city: 'Nellore',
        pincode: '524004',
        state: 'Andhra Pradesh',
        lat: 14.4329,
        lng: 79.9680,
        serviceable: true,
        distance_km: 1.2,
        eta_min: 15,
        isManual: true,
      };
      localStorage.setItem('g1mart_delivery_location_v1', JSON.stringify(loc));
      localStorage.setItem('g1mart_saved_manual_location_v1', JSON.stringify(loc));
    });

    const page = await context.newPage();

    console.log(`Navigating to ${t.url} (${t.name})...`);
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Dismiss any modal if open
    try {
      const closeButtons = await page.$$('button:has(svg.lucide-x), button[aria-label="Close"]');
      for (const btn of closeButtons) {
        if (await btn.isVisible()) await btn.click();
      }
    } catch {}

    await page.waitForTimeout(500);

    const wsPath = path.join(OUT_DIR_WORKSPACE, `${t.name}.png`);
    await page.screenshot({ path: wsPath, fullPage: !!t.fullPage });
    console.log(`Saved screenshot: ${wsPath}`);
    await page.close();
    await context.close();
  }

  await browser.close();
  console.log('Category screenshots completed successfully!');
}

takeCategoryScreenshots().catch((err) => {
  console.error('Error taking category screenshots:', err);
  process.exit(1);
});
