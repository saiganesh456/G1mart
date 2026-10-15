const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve('C:/Users/Harsha vardhan/.gemini/antigravity/brain/5c246ed0-3273-47e7-9f78-52257cc5ecfc/test_screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 360, height: 800, name: '360w' },
  { width: 375, height: 812, name: '375w' },
  { width: 390, height: 844, name: '390w' },
  { width: 430, height: 932, name: '430w' },
];

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 404) {
        return true;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not respond within ${timeoutMs}ms`);
}

async function run() {
  console.log('Checking if Next.js dev server is running on port 3000...');
  let serverRunning = false;
  try {
    const res = await fetch('http://localhost:3000/api/orders');
    if (res.ok) serverRunning = true;
  } catch {}

  let serverProc = null;
  if (!serverRunning) {
    console.log('Starting Next.js dev server...');
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    serverProc = spawn(npmCmd, ['run', 'dev'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      shell: true,
    });

    serverProc.stdout.on('data', (d) => process.stdout.write(`[dev] ${d}`));
    serverProc.stderr.on('data', (d) => process.stderr.write(`[dev-err] ${d}`));

    console.log('Waiting for dev server on http://localhost:3000...');
    await waitForServer('http://localhost:3000/api/orders');
    console.log('Dev server is READY!');
  } else {
    console.log('Dev server already running.');
  }

  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('1. Testing My Orders list (/orders)...');
  await page.addInitScript(() => {
    localStorage.setItem('g1mart_location_prompt_dismissed_v1', 'true');
    localStorage.setItem('g1mart_delivery_location', JSON.stringify({
      formattedAddress: 'Shop #4, Main Bazaar, Stonehousepet, Nellore',
      street: 'Shop #4, Main Bazaar',
      area: 'Stonehousepet',
      city: 'Nellore',
      pincode: '524002',
      lat: 14.4426,
      lng: 79.9865,
      serviceable: true
    }));
  });
  await page.goto('http://localhost:3000/orders', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Order #', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(1000);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);
    const shotPath = path.join(OUT_DIR, `my_orders_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  // Test Filter Buttons
  console.log('Testing filter pills...');
  const deliveredBtn = page.locator('button:has-text("Delivered")').first();
  if (await deliveredBtn.count() > 0) {
    await deliveredBtn.click();
    await page.waitForTimeout(500);
    const deliveredShot = path.join(OUT_DIR, 'my_orders_filter_delivered.png');
    await page.screenshot({ path: deliveredShot, fullPage: false });
    console.log(`Saved filter delivered screenshot: ${deliveredShot}`);

    // Switch back to All Orders
    const allBtn = page.locator('button:has-text("All Orders")').first();
    await allBtn.click();
    await page.waitForTimeout(500);
  }

  // Test Refresh Button
  console.log('Testing refresh button...');
  const refreshBtn = page.locator('button[aria-label="Refresh orders"]').first();
  if (await refreshBtn.count() > 0) {
    await refreshBtn.click();
    await page.waitForTimeout(500);
    console.log('Refresh button clicked successfully');
  }

  // Click on Track Order or first order card
  console.log('2. Navigating to Order Details & Tracking...');
  let targetHref = '';
  const trackBtn = page.locator('a:has-text("Track Order")').first();
  if (await trackBtn.count() > 0) {
    targetHref = await trackBtn.getAttribute('href');
  } else {
    const firstOrderLink = page.locator('a[href^="/orders/"]').first();
    if (await firstOrderLink.count() > 0) {
      targetHref = await firstOrderLink.getAttribute('href');
    }
  }

  if (!targetHref) {
    targetHref = '/orders/SLIP-657078';
  }

  console.log('Target order URL:', targetHref);
  await page.goto(`http://localhost:3000${targetHref}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Current URL:', page.url());

  // Capture Order Details & Tracking across all viewports
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);
    const shotPath = path.join(OUT_DIR, `order_details_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  // Also capture scrolled view to verify items, bill summary, and support buttons
  await page.evaluate(() => window.scrollBy(0, 380));
  await page.waitForTimeout(400);
  const scrolledShot = path.join(OUT_DIR, 'order_details_scrolled_390w.png');
  await page.screenshot({ path: scrolledShot, fullPage: false });
  console.log(`Saved scrolled screenshot: ${scrolledShot}`);

  // Capture bottom view for bill summary and support buttons
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const bottomShot = path.join(OUT_DIR, 'order_details_bottom_390w.png');
  await page.screenshot({ path: bottomShot, fullPage: false });
  console.log(`Saved bottom screenshot: ${bottomShot}`);

  // Also capture a DELIVERED order details screen to verify delivered journey state
  console.log('3. Capturing Delivered Order Details & Tracking (/orders/SLIP-657078)...');
  await page.goto('http://localhost:3000/orders/SLIP-657078', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const deliveredDetailsShot = path.join(OUT_DIR, 'order_details_delivered_390w.png');
  await page.screenshot({ path: deliveredDetailsShot, fullPage: false });
  console.log(`Saved delivered details screenshot: ${deliveredDetailsShot}`);

  console.log('\nConsole Errors encountered:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }

  await browser.close();

  if (serverProc) {
    console.log('Shutting down dev server process...');
    serverProc.kill();
  }

  console.log('Verification finished successfully!');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
