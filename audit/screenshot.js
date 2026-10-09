const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageMobile.screenshot({ path: 'd:/web-agency-projects/G1mart/audit/screens/home_mobile_after.png', fullPage: true });
  
  const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesktop.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageDesktop.screenshot({ path: 'd:/web-agency-projects/G1mart/audit/screens/home_desktop_after.png', fullPage: true });

  const catPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await catPage.goto('http://localhost:3001/category/biscuits-bakery', { waitUntil: 'networkidle', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  await catPage.screenshot({ path: 'd:/web-agency-projects/G1mart/audit/screens/category_mobile_after.png', fullPage: true });

  await browser.close();
  console.log('Screenshots taken');
})();
