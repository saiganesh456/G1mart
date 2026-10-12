const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR_WORKSPACE = path.join('d:', 'web-agency-projects', 'screenshots');
const OUT_DIR_ARTIFACTS = path.join('C:', 'Users', 'Harsha vardhan', '.gemini', 'antigravity', 'brain', 'de8303b7-ccde-4c4f-b340-150040deeebd');

fs.mkdirSync(OUT_DIR_WORKSPACE, { recursive: true });

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });

  const tasks = [
    {
      name: 'home_390px',
      url: 'http://localhost:3000/',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    },
    {
      name: 'home_390px_full',
      url: 'http://localhost:3000/',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      fullPage: true,
    },
    {
      name: 'home_1280px',
      url: 'http://localhost:3000/',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
    },
    {
      name: 'home_1280px_full',
      url: 'http://localhost:3000/',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      fullPage: true,
    },
    {
      name: 'categories_390px',
      url: 'http://localhost:3000/categories',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    },
    {
      name: 'categories_390px_full',
      url: 'http://localhost:3000/categories',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      fullPage: true,
    },
    {
      name: 'categories_1280px',
      url: 'http://localhost:3000/categories',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
    },
    {
      name: 'categories_1280px_full',
      url: 'http://localhost:3000/categories',
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
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
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Dismiss any modal if open
    try {
      const closeButtons = await page.$$('button:has(svg.lucide-x), button[aria-label="Close"]');
      for (const btn of closeButtons) {
        if (await btn.isVisible()) await btn.click();
      }
    } catch {}

    await page.waitForTimeout(500);

    const wsPath = path.join(OUT_DIR_WORKSPACE, `${t.name}.png`);
    const artPath = path.join(OUT_DIR_ARTIFACTS, `${t.name}.png`);

    await page.screenshot({ path: wsPath, fullPage: !!t.fullPage });
    await page.screenshot({ path: artPath, fullPage: !!t.fullPage });
    console.log(`Saved screenshot: ${wsPath}`);
    await page.close();
    await context.close();
  }

  await browser.close();
  console.log('All screenshots completed successfully!');
}

takeScreenshots().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
