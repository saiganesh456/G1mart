const { chromium } = require('playwright');

async function testScreenshots() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Close geolocation popup by setting localStorage or clicking close
  await page.goto('http://localhost:3000/category/atta-rice-dal', { waitUntil: 'networkidle' });
  
  // Close modal if present
  try {
    const closeBtn = await page.$('button[aria-label="Close"], button:has-text("✕"), .close, button:has(svg)');
    // Or click Sri Lalitha brand button
    const sriLalithaBtn = await page.$('button:has-text("Sri Lalitha")');
    if (sriLalithaBtn) {
      await sriLalithaBtn.click();
      await page.waitForTimeout(500);
    }
  } catch(e) {}

  await page.screenshot({ path: 'scratch_live_sri_lalitha_view.png', fullPage: false });
  console.log('Captured scratch_live_sri_lalitha_view.png');

  // Also click Kurnool Special
  try {
    const kurnoolBtn = await page.$('button:has-text("Kurnool Special")');
    if (kurnoolBtn) {
      await kurnoolBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'scratch_live_kurnool_view.png', fullPage: false });
      console.log('Captured scratch_live_kurnool_view.png');
    }
  } catch(e) {}

  await browser.close();
}

testScreenshots().catch(console.error);
