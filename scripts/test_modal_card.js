const { chromium } = require('playwright');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/payment/demo...');
  await page.goto('http://localhost:3000/payment/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Clicking Pay button...');
  const payBtn = page.locator('button:has-text("Pay ₹10 with Razorpay")');
  await payBtn.click();
  await page.waitForTimeout(5000);

  const rzpFrame = page.frames().find(f => f.url().includes('razorpay.com'));
  if (!rzpFrame) {
    console.log('No razorpay frame found!');
    await browser.close();
    return;
  }

  console.log('Razorpay frame URL:', rzpFrame.url());

  // Click on Cards
  console.log('Clicking Cards option inside frame...');
  try {
    const cardOption = rzpFrame.locator('text=Cards').first();
    await cardOption.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Could not click Cards option:', e.message);
  }

  // Check card input fields
  const cardInput = rzpFrame.locator('input[name="card[number]"], input[placeholder*="Card Number"], input[autocomplete="cc-number"]').first();
  const count = await cardInput.count();
  console.log('Card input field count:', count);

  if (count > 0) {
    await cardInput.fill('4100280000001007');
    await page.waitForTimeout(500);

    const expiryInput = rzpFrame.locator('input[name="card[expiry]"], input[placeholder*="MM / YY"], input[autocomplete="cc-exp"]').first();
    if (await expiryInput.count() > 0) {
      await expiryInput.fill('12/28');
    }

    const cvvInput = rzpFrame.locator('input[name="card[cvv]"], input[placeholder*="CVV"], input[autocomplete="cc-csc"]').first();
    if (await cvvInput.count() > 0) {
      await cvvInput.fill('123');
    }

    const nameInput = rzpFrame.locator('input[placeholder*="Name on card"], input[name="card[name]"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
    }

    await page.waitForTimeout(1000);

    // Take screenshot of filled form
    await page.screenshot({ path: 'd:\\web-agency-projects\\G1mart\\public\\card_form_filled.png' });
    console.log('Screenshot saved to card_form_filled.png');

    // Inspect Continue / Pay button
    const continueBtn = rzpFrame.locator('button:has-text("Continue"), button:has-text("Pay")').last();
    console.log('Continue button text:', await continueBtn.innerText());
    console.log('Continue button isEnabled:', await continueBtn.isEnabled());
    console.log('Continue button isVisible:', await continueBtn.isVisible());

    // Click Continue button
    console.log('Clicking Continue button...');
    await continueBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'd:\\web-agency-projects\\G1mart\\public\\after_continue_click.png' });
    console.log('Screenshot saved to after_continue_click.png');
  }

  await browser.close();
}

run().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
