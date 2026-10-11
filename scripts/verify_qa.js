const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'categories', path: '/categories' },
  { name: 'category_atta', path: '/category/atta-rice-dal' },
  { name: 'account', path: '/account' },
  { name: 'orders', path: '/orders' },
  { name: 'cart', path: '/cart' },
  { name: 'search', path: '/search' },
];

const WIDTHS = [360, 375, 390, 412];
const HEIGHT = 844;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const FORBIDDEN_STRINGS = [
  'Blinkit',
  '10-minute',
  'Guest & Local',
  'SLIP-',
  'Customer Application',
];

async function run() {
  console.log(`Starting QA verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const results = {
    overflow: {},
    deliveryBar: {},
    forbiddenStrings: {},
    screenshots: [],
    allPassed: true,
  };

  const outDirs = [
    path.join(__dirname, '..', 'reference', 'after'),
    path.join(__dirname, '..', '..', 'reference', 'after'),
  ];
  outDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Pre-warm routes so dev server compiles them before tests
  console.log('Warming up routes...');
  for (const route of ROUTES) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(500);
    } catch (e) {
      console.warn(`Warmup warning for ${route.name}: ${e.message}`);
    } finally {
      await page.close();
    }
  }
  console.log('Warmup complete. Running viewport audits...');

  for (const route of ROUTES) {
    results.overflow[route.name] = {};
    results.forbiddenStrings[route.name] = [];

    for (const width of WIDTHS) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: HEIGHT });

      try {
        await page.goto(`${BASE_URL}${route.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        await page.waitForTimeout(800);

        // 1. Overflow check
        const overflowData = await page.evaluate(() => {
          const innerW = window.innerWidth;
          const scrollW = document.documentElement.scrollWidth;
          const overflowingElements = [];

          document.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (
              rect.width > 0 &&
              rect.right > innerW + 1 &&
              window.getComputedStyle(el).display !== 'none'
            ) {
              overflowingElements.push({
                tag: el.tagName,
                className: el.className?.toString?.()?.slice(0, 50) || '',
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                text: el.textContent?.slice(0, 30) || '',
              });
            }
          });

          return {
            innerW,
            scrollW,
            isOverflowing: scrollW > innerW,
            overflowingElements: overflowingElements.slice(0, 5),
          };
        });

        results.overflow[route.name][width] = {
          scrollWidth: overflowData.scrollW,
          innerWidth: overflowData.innerW,
          passed: !overflowData.isOverflowing && overflowData.overflowingElements.length === 0,
          overflowCount: overflowData.overflowingElements.length,
          samples: overflowData.overflowingElements,
        };

        if (overflowData.isOverflowing || overflowData.overflowingElements.length > 0) {
          results.allPassed = false;
        }

        // At 390px, perform string checks and capture reference screenshot
        if (width === 390) {
          const hasDeliveryBar = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return /Delivery in ~|Venkatachalam, Nellore/i.test(bodyText);
          });

          const deliveryBarExpected = route.name === 'home';
          results.deliveryBar[route.name] = {
            found: hasDeliveryBar,
            expected: deliveryBarExpected,
            passed: hasDeliveryBar === deliveryBarExpected,
          };
          if (hasDeliveryBar !== deliveryBarExpected) {
            results.allPassed = false;
          }

          const pageText = await page.evaluate(() => document.body.innerText);
          for (const str of FORBIDDEN_STRINGS) {
            if (pageText.includes(str)) {
              results.forbiddenStrings[route.name].push(str);
              results.allPassed = false;
            }
          }

          const screenshotName = `${route.name}_390x844.png`;
          for (const dir of outDirs) {
            const dest = path.join(dir, screenshotName);
            await page.screenshot({ path: dest, fullPage: false });
          }
          results.screenshots.push(screenshotName);
        }
      } catch (err) {
        console.error(`Error testing ${route.name} at ${width}px:`, err.message);
        results.overflow[route.name][width] = { error: err.message, passed: false };
        results.allPassed = false;
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  // Print Report
  console.log('\n========================================');
  console.log('         QA VERIFICATION REPORT         ');
  console.log('========================================\n');

  console.log('1. OVERFLOW CHECKS (scrollWidth vs innerWidth):');
  for (const [rName, widths] of Object.entries(results.overflow)) {
    console.log(`  Route: ${rName}`);
    for (const [w, res] of Object.entries(widths)) {
      const status = res.passed ? 'PASS' : 'FAIL';
      console.log(`    ${w}px: [${status}] scrollWidth=${res.scrollWidth}, innerWidth=${res.innerWidth}, overflowElements=${res.overflowCount || 0}`);
      if (!res.passed && res.samples?.length) {
        console.log(`      Sample offenders:`, JSON.stringify(res.samples));
      }
    }
  }

  console.log('\n2. DELIVERY BAR CHECKS (Must be Home only):');
  for (const [rName, res] of Object.entries(results.deliveryBar)) {
    const status = res.passed ? 'PASS' : 'FAIL';
    console.log(`  Route ${rName}: [${status}] Found=${res.found}, Expected=${res.expected}`);
  }

  console.log('\n3. FORBIDDEN STRINGS CHECKS:');
  for (const [rName, forbidden] of Object.entries(results.forbiddenStrings)) {
    if (forbidden.length === 0) {
      console.log(`  Route ${rName}: [PASS] Clean`);
    } else {
      console.log(`  Route ${rName}: [FAIL] Found: ${forbidden.join(', ')}`);
    }
  }

  console.log('\n4. SCREENSHOTS GENERATED:');
  results.screenshots.forEach((s) => console.log(`  Saved: reference/after/${s}`));

  console.log(`\nOVERALL VERIFICATION: ${results.allPassed ? 'ALL CRITERIA PASSED' : 'SOME CHECKS FAILED'}\n`);
}

run().catch((e) => {
  console.error('Fatal error during QA run:', e);
  process.exit(1);
});
