const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/category/atta-rice-dal');
  const btn = await page.$('button:has-text("Kurnool Special")');
  if (btn) await btn.click();
  await page.waitForTimeout(500);
  const img = await page.$('img[alt*="Kurnool"]');
  if (img) {
    console.log('src:', await img.getAttribute('src'));
  }
  await browser.close();
})();
