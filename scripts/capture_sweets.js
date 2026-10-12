const { chromium } = require('playwright');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000/category/sweets-chocolates...');
  await page.goto('http://localhost:3000/category/sweets-chocolates', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(2000);

  // Close any modal if open (like location prompt)
  try {
    const closeBtn = await page.$('button[aria-label="Close"], button:has-text("✕"), button:has-text("×")');
    if (closeBtn) {
      await closeBtn.click();
      console.log('Closed modal popup.');
      await page.waitForTimeout(500);
    }
  } catch (e) {
    // ignore
  }

  // Scroll through the entire page to ensure all lazy images load
  console.log('Scrolling to trigger all lazy image loads...');
  await page.evaluate(async () => {
    const totalHeight = document.body.scrollHeight;
    for (let pos = 0; pos < totalHeight; pos += 250) {
      window.scrollTo(0, pos);
      await new Promise(r => setTimeout(r, 60));
    }
  });

  // Wait for all images to complete loading
  console.log('Waiting for images to finish loading...');
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise(resolve => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
          setTimeout(resolve, 3000);
        });
      })
    );
  });

  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  const screenshotPath = path.join(__dirname, '..', 'reference', 'after', 'sweets_chocolates_desktop.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to: ${screenshotPath}`);

  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing screenshot:', err);
  process.exit(1);
});
