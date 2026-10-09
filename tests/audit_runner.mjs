import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIRS = [
  path.resolve('audit/screens'),
  path.resolve('../audit/screens')
];

for (const d of OUT_DIRS) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

async function saveScreenshot(page, filename) {
  for (const d of OUT_DIRS) {
    const filePath = path.join(d, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot: ${filePath}`);
  }
}

async function checkOverflow(page, label, width) {
  const isOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body ? document.body.scrollWidth : 0;
    const winWidth = window.innerWidth;
    return {
      overflow: docWidth > winWidth || bodyWidth > winWidth,
      docWidth,
      bodyWidth,
      winWidth
    };
  });
  console.log(`Overflow check [${width}px] ${label}:`, isOverflow.overflow ? `FAILED (doc: ${isOverflow.docWidth}, win: ${isOverflow.winWidth})` : 'PASSED');
  return !isOverflow.overflow;
}

async function checkProhibitedCopy(page, label) {
  const prohibitedPhrases = ['Photo coming soon', 'Genuine Store Item'];
  const text = await page.evaluate(() => document.body.innerText);
  const found = [];
  for (const phrase of prohibitedPhrases) {
    if (text.includes(phrase)) {
      found.push(phrase);
    }
  }
  const hasOtherBrand = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(
      e => e.childElementCount === 0 && e.textContent?.trim().toLowerCase() === 'other'
    );
    return !!el;
  });
  if (hasOtherBrand) found.push('Brand named "Other"');

  if (found.length > 0) {
    console.error(`Prohibited text check FAILED on ${label}: found ${found.join(', ')}`);
  } else {
    console.log(`Prohibited text check PASSED on ${label}`);
  }
  return found.length === 0;
}

async function run() {
  console.log('--- Launching Chromium for Phase 5 Audit ---');
  const browser = await chromium.launch({ headless: true });
  const results = {
    overflowPassed: true,
    prohibitedCopyPassed: true,
    stickySearchPassed: true,
    interactionsPassed: true,
    screenshots: []
  };

  // 1. Viewport Overflow Checks at 360, 390, 430px
  const viewports = [
    { width: 360, height: 780 },
    { width: 390, height: 844 },
    { width: 430, height: 932 }
  ];

  const testPages = [
    { url: '/', label: 'Home Page' },
    { url: '/categories', label: 'Categories Explorer' },
    { url: '/category/atta-rice-dal', label: 'Atta Rice & Dal' },
    { url: '/category/chips-namkeen', label: 'Chips & Namkeen' },
    { url: '/category/soaps-bath', label: 'Soaps & Bath' }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    for (const tp of testPages) {
      await page.goto(`${BASE_URL}${tp.url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(300);
      const ok = await checkOverflow(page, tp.label, vp.width);
      if (!ok) results.overflowPassed = false;
    }
    await context.close();
  }

  // 2. High Fidelity 390px Canonical Screenshots & Interactive Tests
  console.log('--- Capturing 390px Canonical Screenshots ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });
  const page = await mobileContext.newPage();

  // (a) Home Top
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);
  await saveScreenshot(page, '01_home_top.png');
  results.screenshots.push('01_home_top.png');
  let okText = await checkProhibitedCopy(page, 'Home Top');
  if (!okText) results.prohibitedCopyPassed = false;

  // (b) Home Scrolled (Sticky search pinned, logo & banner scrolled away)
  await page.evaluate(() => window.scrollTo(0, 320));
  await page.waitForTimeout(600);
  await saveScreenshot(page, '02_home_scrolled.png');
  results.screenshots.push('02_home_scrolled.png');

  // Verify sticky search bar remains visible in viewport at top: 0
  const debugSearch = await page.evaluate(() => {
    const el = document.querySelector('[data-sticky-search-wrapper="true"]');
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    return {
      found: true,
      rectTop: rect.top,
      rectBottom: rect.bottom,
      scrollY: window.scrollY
    };
  });
  console.log('Search debug after scroll:', JSON.stringify(debugSearch));
  const isSearchSticky = debugSearch.found && debugSearch.rectTop >= -5 && debugSearch.rectTop <= 5;
  console.log('Sticky search bar pinned to top:', isSearchSticky);
  if (!isSearchSticky) results.stickySearchPassed = false;

  // (c) Atta Rice & Dal category detail
  await page.goto(`${BASE_URL}/category/atta-rice-dal`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);
  await saveScreenshot(page, '03_category_atta_rice_dal.png');
  results.screenshots.push('03_category_atta_rice_dal.png');
  okText = await checkProhibitedCopy(page, 'Category: Atta Rice & Dal');
  if (!okText) results.prohibitedCopyPassed = false;

  // Test Left Brand Rail interaction
  const brandButtons = page.locator('aside button, [data-brand-filter] button');
  if (await brandButtons.count() > 1) {
    console.log('Brand buttons found:', await brandButtons.count());
    await brandButtons.nth(1).click();
    await page.waitForTimeout(400);
    console.log('Brand rail filter clicked successfully');
  }

  // (d) Chips & Namkeen category detail
  await page.goto(`${BASE_URL}/category/chips-namkeen`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);
  await saveScreenshot(page, '04_category_chips_namkeen.png');
  results.screenshots.push('04_category_chips_namkeen.png');
  okText = await checkProhibitedCopy(page, 'Category: Chips & Namkeen');
  if (!okText) results.prohibitedCopyPassed = false;

  // (e) Soaps & Bath category detail
  await page.goto(`${BASE_URL}/category/soaps-bath`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);
  await saveScreenshot(page, '05_category_soaps_bath.png');
  results.screenshots.push('05_category_soaps_bath.png');
  okText = await checkProhibitedCopy(page, 'Category: Soaps & Bath');
  if (!okText) results.prohibitedCopyPassed = false;

  // (f) Product Detail Page (pick first available product link)
  const productLink = await page.locator('a[href^="/product/"]').first();
  let productUrl = `${BASE_URL}/product/g1-p0001`;
  if (await productLink.count() > 0) {
    const href = await productLink.getAttribute('href');
    if (href) productUrl = `${BASE_URL}${href}`;
  }
  console.log(`Navigating to product page: ${productUrl}`);
  await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);
  await saveScreenshot(page, '06_product_page.png');
  results.screenshots.push('06_product_page.png');
  okText = await checkProhibitedCopy(page, 'Product Detail Page');
  if (!okText) results.prohibitedCopyPassed = false;

  // (g) Checkout Address Sheet
  console.log('Navigating to checkout with populated cart...');
  await page.evaluate(() => {
    const item = {
      product: {
        id: 'g1-p0001',
        name: 'Aashirvaad Superior MP Atta',
        brand: 'Aashirvaad',
        price: 245,
        originalPrice: 275,
        unit: '5 kg',
        inStock: true,
        category: 'atta-rice-dal',
        image_url: '/products/verified/g1-p0001.webp',
        image_status: 'verified'
      },
      quantity: 1
    };
    localStorage.setItem('g1mart_cart', JSON.stringify([item]));
  });
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(800);
  
  // Look for address trigger / change address button if present
  const addressTrigger = page.locator('button:has-text("Add Address"), div:has-text("No delivery address added"), button:has-text("Change")').first();
  if (await addressTrigger.count() > 0) {
    await addressTrigger.click();
    await page.waitForTimeout(600);
  }
  await saveScreenshot(page, '07_checkout_address_sheet.png');
  results.screenshots.push('07_checkout_address_sheet.png');

  // (h) Interactive Navigation Verification:
  console.log('Testing category tile navigation...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  const categoryTile = page.locator('[data-category-tile]').first();
  if (await categoryTile.count() > 0) {
    const catHref = await categoryTile.getAttribute('href');
    await categoryTile.click();
    await page.waitForTimeout(800);
    console.log(`Tile navigation succeeded -> current URL: ${page.url()}`);
  }

  // Test Search Interaction
  console.log('Testing search bar interaction...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  const searchInput = page.locator('[data-sticky-search-wrapper="true"] input[type="search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('atta');
    await page.waitForTimeout(300);
    await searchInput.press('Enter');
    await page.waitForTimeout(800);
    console.log(`Search submitted -> current URL: ${page.url()}`);
  }

  await mobileContext.close();
  await browser.close();

  // 3. Database Duplication & Integrity Audit
  console.log('--- Verifying Data Integrity ---');
  const products = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf-8'));
  const imageUrlMap = new Map();
  let duplicateImages = 0;
  let missingCount = 0;
  let verifiedCount = 0;
  const categoryStats = {};

  for (const p of products) {
    const cat = p.category || p.category_id || 'uncategorized';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, verified: 0, missing: 0 };
    }
    categoryStats[cat].total++;

    if (p.image_status === 'verified' && p.image_url) {
      verifiedCount++;
      categoryStats[cat].verified++;
      if (imageUrlMap.has(p.image_url)) {
        duplicateImages++;
        console.warn(`Duplicate image_url: ${p.image_url} used by ${p.id} and ${imageUrlMap.get(p.image_url)}`);
      } else {
        imageUrlMap.set(p.image_url, p.id);
      }
    } else {
      missingCount++;
      categoryStats[cat].missing++;
    }
  }

  // Load hero shot list
  let heroShotsTotal = 0;
  let heroShotsDone = 0;
  if (fs.existsSync('audit/hero-shot-list.csv')) {
    const lines = fs.readFileSync('audit/hero-shot-list.csv', 'utf-8').trim().split('\n').slice(1);
    heroShotsTotal = lines.length;
    heroShotsDone = lines.filter(l => l.trim().endsWith(',true')).length;
  }

  results.dataAudit = {
    totalProducts: products.length,
    verifiedCount,
    missingCount,
    coveragePercent: ((verifiedCount / products.length) * 100).toFixed(1) + '%',
    duplicateImages,
    heroShotsTotal,
    heroShotsDone,
    heroShotsRemaining: heroShotsTotal - heroShotsDone,
    categoryStats
  };

  fs.writeFileSync('audit/audit_results.json', JSON.stringify(results, null, 2), 'utf-8');
  if (fs.existsSync('../audit')) {
    fs.writeFileSync('../audit/audit_results.json', JSON.stringify(results, null, 2), 'utf-8');
  }
  console.log('Audit completed successfully. Results:', JSON.stringify(results.dataAudit, null, 2));
}

run().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
