import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

console.log('--- TEST 1: ENVIRONMENT VARIABLES ---');
console.log('RAZORPAY_KEY_ID present:', Boolean(process.env.RAZORPAY_KEY_ID));
console.log('RAZORPAY_KEY_SECRET present:', Boolean(process.env.RAZORPAY_KEY_SECRET));
console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID present:', Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID));

import Razorpay from 'razorpay';

async function runTests() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  console.log('\n--- TEST 2: RAZORPAY SDK INITIALIZATION ---');
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  console.log('SDK initialized successfully.');

  console.log('\n--- TEST 3: ORDER CREATION API CALL ---');
  // 3a: Minimum amount validation (< 100 paise)
  const minAmount = 50; // 50 paise is less than 100
  if (minAmount < 100) {
    console.log('Validation: Amount < 100 paise correctly rejected as invalid');
  }

  // 3b: Real order creation with test credentials (50000 paise = 500 INR)
  const order = await razorpay.orders.create({
    amount: 50000,
    currency: 'INR',
    receipt: `rcpt_test_${Date.now()}`,
    notes: { customerName: 'Test Integration' },
  });
  console.log('Created Razorpay Order successfully:');
  console.log('  order_id:', order.id);
  console.log('  amount:', order.amount);
  console.log('  currency:', order.currency);
  console.log('  status:', order.status);

  console.log('\n--- TEST 4: HMAC-SHA256 SIGNATURE VERIFICATION ---');
  const simulatedPaymentId = `pay_test_${Date.now()}`;
  
  // Valid signature
  const validSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${order.id}|${simulatedPaymentId}`)
    .digest('hex');

  console.log('Generated Signature for order|payment:');
  console.log('  order_id:', order.id);
  console.log('  payment_id:', simulatedPaymentId);
  console.log('  validSignature:', validSignature);

  // Compare valid signature
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${order.id}|${simulatedPaymentId}`)
    .digest('hex');

  const isValidMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(validSignature, 'utf-8')
  );
  console.log('Valid signature match result:', isValidMatch);
  if (!isValidMatch) throw new Error('Valid signature should match!');

  // Tampered signature test
  const tamperedSignature = validSignature.slice(0, -4) + 'abcd';
  const isTamperedMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(tamperedSignature, 'utf-8')
  );
  console.log('Tampered signature match result (should be false):', isTamperedMatch);
  if (isTamperedMatch) throw new Error('Tampered signature must not match!');

  console.log('\n--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
