const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testScreenshots() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to local-dals...');
  await page.goto('http://localhost:3000/category/local-dals', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scratch_live_local_dals.png', fullPage: false });
  console.log('Captured scratch_live_local_dals.png');

  console.log('Navigating to product/g1-p1572...');
  await page.goto('http://localhost:3000/product/g1-p1572', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scratch_live_aashirvaad.png', fullPage: false });
  console.log('Captured scratch_live_aashirvaad.png');

  console.log('Navigating to atta-rice-dal...');
  await page.goto('http://localhost:3000/category/atta-rice-dal', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scratch_live_atta_rice.png', fullPage: false });
  console.log('Captured scratch_live_atta_rice.png');

  await browser.close();
}

testScreenshots().catch(console.error);
