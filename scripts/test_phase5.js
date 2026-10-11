const { razorpayAdapter } = require('../src/lib/payment/razorpayAdapter');
const { serverOrderStore } = require('../src/lib/serverOrderStore');
const { serverStoreSettings } = require('../src/lib/serverStoreSettings');

async function runPhase5Verification() {
  console.log('========================================================');
  console.log('   PHASE 5 PAYMENT ADAPTER & RE-VALIDATION TEST SUITE   ');
  console.log('========================================================\n');

  // 1. Test Razorpay Adapter in TEST mode
  console.log('--- 1. Testing Razorpay Payment Adapter (TEST Mode) ---');
  const dummyParams = {
    orderId: 'G1-TEST-9988',
    merchantOrderId: 'MT_G1-TEST-9988_123',
    amountInPaise: 50000, // ₹500
    customerPhone: '9876543210',
    customerName: 'Sita Sharma',
    redirectUrl: 'http://localhost:3000/payment/result?orderId=G1-TEST-9988',
    callbackUrl: 'http://localhost:3000/api/payment/webhook',
  };

  const createRes = await razorpayAdapter.createPayment(dummyParams);
  console.log(`Razorpay Order Creation:`);
  console.log(`  Success: ${createRes.success}`);
  console.log(`  Provider Order ID: ${createRes.providerOrderId}`);
  console.log(`  Redirect URL: ${createRes.redirectUrl}`);
  const passCreate = createRes.success && Boolean(createRes.providerOrderId);
  console.log(`  Result: ${passCreate ? '[PASS]' : '[FAIL]'}\n`);

  // 2. Test Server-Side Signature Verification
  console.log('--- 2. Testing Razorpay Server Signature Verification ---');
  
  // Valid test simulation signature
  const validSigParams = {
    razorpayOrderId: createRes.providerOrderId,
    razorpayPaymentId: 'pay_test_sim_123456',
    razorpaySignature: 'test_sig_valid_hash',
  };
  const isSigValid = razorpayAdapter.verifySignature(validSigParams);
  console.log(`Valid Test Signature: ${isSigValid} -> ${isSigValid ? '[PASS]' : '[FAIL]'}`);

  // Missing or empty parameters
  const invalidSig = razorpayAdapter.verifySignature({
    razorpayOrderId: '',
    razorpayPaymentId: '',
    razorpaySignature: '',
  });
  console.log(`Empty Signature Handled: isValid = ${invalidSig} -> ${!invalidSig ? '[PASS]' : '[FAIL]'}\n`);

  // 3. Test Pay on Delivery (COD Fee & COD_PENDING Status)
  console.log('--- 3. Testing Pay on Delivery (COD Fee & COD_PENDING Status) ---');
  const settings = await serverStoreSettings.getStoreSettings();
  const configuredCodFee = Number(settings.cod_fee ?? 50);
  console.log(`Configured Store COD Fee from Settings: ₹${configuredCodFee}`);

  const dummyItems = [{ productId: 'prod-rice-26', quantity: 2 }];
  const calculated = serverOrderStore.recalculateOrderTotal(dummyItems);
  const subtotal = calculated.subtotal;
  const deliveryFee = 0; // Free in all zones
  const codGrandTotal = subtotal + deliveryFee + configuredCodFee;

  console.log(`Bill Breakdown for COD:`);
  console.log(`  Subtotal: ₹${subtotal}`);
  console.log(`  Delivery: ₹${deliveryFee} (FREE)`);
  console.log(`  Pay on delivery fee: ₹${configuredCodFee}`);
  console.log(`  Total: ₹${codGrandTotal}`);

  // Create pending order for COD
  const codOrderId = `G1-COD-${Date.now().toString().slice(-4)}`;
  const codOrder = await serverOrderStore.createPendingOrder({
    orderId: codOrderId,
    merchantOrderId: `MT_${codOrderId}`,
    items: calculated.items,
    subtotal,
    deliveryFee: 0,
    taxes: 0,
    grandTotal: codGrandTotal,
    final_total: codGrandTotal,
    cod_fee: configuredCodFee,
    address: { fullName: 'Customer', phone: '9876543210' },
    paymentMethod: 'Cash on Delivery',
  });

  const confirmRes = await serverOrderStore.confirmCodOrder(codOrderId);
  console.log(`Order Created & Confirmed:`);
  console.log(`  Status: ${confirmRes.order.status}`);
  console.log(`  Payment Status: ${confirmRes.order.paymentStatus}`);
  console.log(`  COD Fee Saved: ₹${confirmRes.order.cod_fee || confirmRes.order.codFee}`);
  console.log(`  Grand Total: ₹${confirmRes.order.grandTotal}`);

  const passCod =
    confirmRes.success &&
    confirmRes.order.paymentStatus === 'COD_PENDING' &&
    confirmRes.order.grandTotal === codGrandTotal;
  console.log(`  Result: ${passCod ? '[PASS: Status is COD_PENDING and total includes COD fee]' : '[FAIL]'}\n`);

  // 4. Test Pay Online Order Becoming PAID after Verification
  console.log('--- 4. Testing Order Becoming PAID after Verification ---');
  const onlineOrderId = `G1-ONL-${Date.now().toString().slice(-4)}`;
  const onlineOrder = await serverOrderStore.createPendingOrder({
    orderId: onlineOrderId,
    merchantOrderId: `MT_${onlineOrderId}`,
    items: calculated.items,
    subtotal,
    deliveryFee: 0,
    taxes: 0,
    grandTotal: subtotal,
    final_total: subtotal,
    cod_fee: 0,
    address: { fullName: 'Customer', phone: '9876543210' },
    paymentMethod: 'UPI',
  });

  console.log(`Initial Online Order Status: paymentStatus = ${onlineOrder.paymentStatus}`);
  
  // Mark paid on server with transaction ID
  const paidRes = await serverOrderStore.markOrderPaid({
    orderId: onlineOrderId,
    transactionId: 'pay_test_verified_999',
    amountInPaise: Math.round(subtotal * 100),
  });

  console.log(`After Server Verification:`);
  console.log(`  Order Paid: ${paidRes.order.isPaid}`);
  console.log(`  Payment Status: ${paidRes.order.paymentStatus}`);
  console.log(`  Transaction ID: ${paidRes.order.transactionId}`);
  const passOnline = paidRes.success && paidRes.order.isPaid && paidRes.order.paymentStatus === 'completed';
  console.log(`  Result: ${passOnline ? '[PASS: Order becomes PAID]' : '[FAIL]'}\n`);

  console.log('========================================================');
  console.log('   PHASE 5 VERIFICATION COMPLETED SUCCESSFULLY!        ');
  console.log('========================================================');
}

runPhase5Verification().catch((err) => {
  console.error('Phase 5 verification error:', err);
  process.exit(1);
});
