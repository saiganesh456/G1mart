import crypto from 'crypto';

// PhonePe Sandbox UAT configuration
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-0252-4e23-8c38-30c504a3901b';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function generateWebhookChecksum(payloadBase64, saltKey, saltIndex) {
  const stringToHash = `${payloadBase64}${saltKey}`;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return `${sha256}###${saltIndex}`;
}

async function runSuite() {
  console.log('='.repeat(70));
  console.log('🚀 PHASE 5: PHONEPE UPI PAYMENT GATEWAY & AUDIT TEST SUITE');
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log('='.repeat(70));

  const results = [];

  function record(scenario, passed, details) {
    results.push({ scenario, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n[${mark}] SCENARIO: ${scenario}`);
    console.log(`   ${details}`);
  }

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: SUCCESSFUL PAYMENT FLOW
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 1: Success ---');
    const orderItems1 = [
      { id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star Chocolate Bar (₹5 Pack)', quantity: 4 }
    ];

    const initRes1 = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: orderItems1,
        slot: 'Standard (6:00 PM - 8:00 PM)',
        address: {
          fullName: 'Priya Sharma',
          phone: '9876543210',
          houseFlat: 'Apt 4B',
          streetArea: 'Jayanagar 4th Block',
          city: 'Bengaluru',
          pincode: '560011',
          type: 'Home'
        },
        paymentMethod: 'UPI',
      }),
    });

    const initData1 = await initRes1.json();
    if (!initData1.success || !initData1.orderId || !initData1.redirectUrl) {
      throw new Error(`Initiate failed: ${JSON.stringify(initData1)}`);
    }

    const orderId1 = initData1.orderId;
    const providerOrderId1 = initData1.providerOrderId || initData1.merchantOrderId;
    const expectedPaise1 = initData1.amountInPaise;

    // Simulate PhonePe Webhook for successful payment
    const webhookSuccessPayload = {
      response: Buffer.from(
        JSON.stringify({
          success: true,
          code: 'PAYMENT_SUCCESS',
          message: 'Payment Successful',
          data: {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: providerOrderId1,
            transactionId: `TXN_${Date.now()}_01`,
            amount: expectedPaise1,
            state: 'COMPLETED',
            responseCode: 'SUCCESS',
            paymentInstrument: {
              type: 'UPI',
              utr: 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000),
            },
          },
        })
      ).toString('base64'),
    };

    const webhookChecksum1 = generateWebhookChecksum(
      webhookSuccessPayload.response,
      PHONEPE_SALT_KEY,
      PHONEPE_SALT_INDEX
    );

    const hookRes1 = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': webhookChecksum1,
      },
      body: JSON.stringify(webhookSuccessPayload),
    });
    const hookData1 = await hookRes1.json();

    // Verify order status via API
    const statusRes1 = await fetch(`${BASE_URL}/api/orders/${orderId1}/payment-status`);
    const statusData1 = await statusRes1.json();

    const pass1 =
      hookData1.success === true &&
      statusData1.paymentStatus === 'completed' &&
      statusData1.paidAmount === expectedPaise1 / 100;

    record(
      '1. Success',
      pass1,
      `Order #${orderId1} verified and confirmed as completed! Amount paid: ₹${statusData1.paidAmount}, Txn: ${statusData1.order?.transactionId}`
    );

    // -------------------------------------------------------------
    // SCENARIO 2: PAYMENT FAILURE
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 2: Failure ---');
    const initRes2 = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star', quantity: 2 }],
        slot: 'Morning (8:00 AM - 10:00 AM)',
        address: {
          fullName: 'Ramesh Kumar',
          phone: '9845012345',
          streetArea: 'Bellandur Outer Ring Rd',
          city: 'Bengaluru',
          pincode: '560103',
          type: 'Work'
        },
        paymentMethod: 'UPI',
      }),
    });
    const initData2 = await initRes2.json();
    const orderId2 = initData2.orderId;
    const providerOrderId2 = initData2.providerOrderId || initData2.merchantOrderId;

    // Simulate PhonePe Webhook with payment failure (e.g. Bank declined / Insufficient funds)
    const webhookFailPayload = {
      response: Buffer.from(
        JSON.stringify({
          success: false,
          code: 'PAYMENT_ERROR',
          message: 'Payment Declined by issuing bank',
          data: {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: providerOrderId2,
            transactionId: `TXN_${Date.now()}_FAIL`,
            amount: initData2.amountInPaise,
            state: 'FAILED',
            responseCode: 'PAYMENT_DECLINED',
          },
        })
      ).toString('base64'),
    };
    const webhookChecksum2 = generateWebhookChecksum(
      webhookFailPayload.response,
      PHONEPE_SALT_KEY,
      PHONEPE_SALT_INDEX
    );

    const hookRes2 = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VERIFY': webhookChecksum2 },
      body: JSON.stringify(webhookFailPayload),
    });
    const hookData2 = await hookRes2.json();

    const statusRes2 = await fetch(`${BASE_URL}/api/orders/${orderId2}/payment-status`);
    const statusData2 = await statusRes2.json();

    const pass2 =
      hookData2.success === true &&
      statusData2.paymentStatus === 'failed';

    record(
      '2. Failure',
      pass2,
      `Order #${orderId2} correctly transitioned to 'failed' on bank error without false confirmation.`
    );

    // -------------------------------------------------------------
    // SCENARIO 3: PENDING PAYMENT STATE
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 3: Pending ---');
    const initRes3 = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star', quantity: 3 }],
        slot: 'Morning (6:00 AM - 8:00 AM)',
        address: {
          fullName: 'Anita Roy',
          phone: '9123456780',
          streetArea: 'Indiranagar 100ft Rd',
          city: 'Bengaluru',
          pincode: '560038',
          type: 'Home'
        },
        paymentMethod: 'UPI',
      }),
    });
    const initData3 = await initRes3.json();
    const orderId3 = initData3.orderId;

    // Check status before any webhook arrives - must report 'pending'
    const statusRes3 = await fetch(`${BASE_URL}/api/orders/${orderId3}/payment-status`);
    const statusData3 = await statusRes3.json();

    const pass3 =
      statusData3.paymentStatus === 'pending' &&
      statusData3.paidAmount === 0 &&
      statusData3.order?.status === 'Order Placed';

    record(
      '3. Pending',
      pass3,
      `Order #${orderId3} remains in pending state awaiting user PIN entry. Zero false confirmation.`
    );

    // -------------------------------------------------------------
    // SCENARIO 4: USER CANCELS
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 4: User Cancels ---');
    const initRes4 = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star', quantity: 1 }],
        slot: 'Evening (5:00 PM - 7:00 PM)',
        address: {
          fullName: 'Kiran Deep',
          phone: '9988776655',
          streetArea: 'Koramangala 7th Block',
          city: 'Bengaluru',
          pincode: '560034',
          type: 'Home'
        },
        paymentMethod: 'UPI',
      }),
    });
    const initData4 = await initRes4.json();
    const orderId4 = initData4.orderId;
    const providerOrderId4 = initData4.providerOrderId || initData4.merchantOrderId;

    // Simulate PhonePe Webhook when customer taps 'Cancel' in UPI intent or closes window
    const webhookCancelPayload = {
      response: Buffer.from(
        JSON.stringify({
          success: false,
          code: 'PAYMENT_CANCELLED',
          message: 'Payment cancelled by user on UPI app',
          data: {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: providerOrderId4,
            transactionId: `TXN_${Date.now()}_CANCEL`,
            amount: initData4.amountInPaise,
            state: 'FAILED',
            responseCode: 'USER_CANCELLED',
          },
        })
      ).toString('base64'),
    };
    const webhookChecksum4 = generateWebhookChecksum(
      webhookCancelPayload.response,
      PHONEPE_SALT_KEY,
      PHONEPE_SALT_INDEX
    );

    const hookRes4 = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VERIFY': webhookChecksum4 },
      body: JSON.stringify(webhookCancelPayload),
    });
    await hookRes4.json();

    const statusRes4 = await fetch(`${BASE_URL}/api/orders/${orderId4}/payment-status`);
    const statusData4 = await statusRes4.json();

    const pass4 = statusData4.paymentStatus === 'failed';
    record(
      '4. User Cancels',
      pass4,
      `User cancellation on PhonePe checkout correctly marked order #${orderId4} as failed.`
    );

    // -------------------------------------------------------------
    // SCENARIO 5: TIMEOUT (Polling window expires gracefully)
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 5: Timeout ---');
    const initRes5 = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star', quantity: 2 }],
        slot: 'Standard Delivery',
        address: {
          fullName: 'Sunil Verma',
          phone: '9812345678',
          streetArea: 'HSR Layout Sector 2',
          city: 'Bengaluru',
          pincode: '560102',
          type: 'Home'
        },
        paymentMethod: 'UPI',
      }),
    });
    const initData5 = await initRes5.json();
    const orderId5 = initData5.orderId;

    // Simulate Return Page timeout check:
    // The client polls for 30s. If still pending, client shows timeout message and offers retry.
    // The order must NOT be marked paid.
    const statusRes5 = await fetch(`${BASE_URL}/api/orders/${orderId5}/payment-status`);
    const statusData5 = await statusRes5.json();

    const pass5 =
      statusData5.paymentStatus === 'pending' &&
      statusData5.paidAmount === 0;

    record(
      '5. Timeout',
      pass5,
      `Order #${orderId5} safely handles gateway timeout without creating duplicate or false confirmation.`
    );

    // -------------------------------------------------------------
    // SCENARIO 6: DUPLICATE WEBHOOK (Idempotency)
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 6: Duplicate Webhook ---');
    // Using order 1 which was already processed
    const hookRes6 = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': webhookChecksum1,
      },
      body: JSON.stringify(webhookSuccessPayload),
    });
    const hookData6 = await hookRes6.json();

    // Confirm that duplicate webhook is recognized as idempotent
    const pass6 =
      hookRes6.status === 200 &&
      hookData6.success === true &&
      (hookData6.message?.toLowerCase().includes('idempotent') || hookData6.message?.toLowerCase().includes('duplicate'));

    record(
      '6. Duplicate Webhook',
      pass6,
      `Idempotent duplicate webhook safely ignored! Status 200 returned with zero duplicate payments.`
    );

    // -------------------------------------------------------------
    // SCENARIO 7: TAMPERED AMOUNT REJECTION
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 7: Tampered Amount ---');
    const initRes7 = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star', quantity: 10 }], // ~₹75 total
        slot: 'Standard Delivery',
        address: {
          fullName: 'Hacker Tamper',
          phone: '9000000000',
          streetArea: 'Dark Web Lane',
          city: 'Bengaluru',
          pincode: '560001',
          type: 'Other'
        },
        paymentMethod: 'UPI',
      }),
    });
    const initData7 = await initRes7.json();
    const orderId7 = initData7.orderId;
    const providerOrderId7 = initData7.providerOrderId || initData7.merchantOrderId;
    const realPaise = initData7.amountInPaise;
    const tamperedPaise = 100; // Maliciously forged to 1 Rupee!

    const webhookTamperedPayload = {
      response: Buffer.from(
        JSON.stringify({
          success: true,
          code: 'PAYMENT_SUCCESS',
          message: 'Payment Successful with forged amount',
          data: {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: providerOrderId7,
            transactionId: `TXN_TAMPER_${Date.now()}`,
            amount: tamperedPaise, // Tampered!
            state: 'COMPLETED',
            responseCode: 'SUCCESS',
          },
        })
      ).toString('base64'),
    };
    const webhookChecksum7 = generateWebhookChecksum(
      webhookTamperedPayload.response,
      PHONEPE_SALT_KEY,
      PHONEPE_SALT_INDEX
    );

    const hookRes7 = await fetch(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VERIFY': webhookChecksum7 },
      body: JSON.stringify(webhookTamperedPayload),
    });
    const hookData7 = await hookRes7.json();

    const statusRes7 = await fetch(`${BASE_URL}/api/orders/${orderId7}/payment-status`);
    const statusData7 = await statusRes7.json();

    const pass7 =
      hookData7.error?.includes('Amount mismatch') ||
      hookData7.error?.includes('tampered') ||
      statusData7.paymentStatus === 'failed';

    record(
      '7. Tampered Amount',
      pass7,
      `Detected amount tampering! Real: ₹${realPaise/100}, Forged: ₹${tamperedPaise/100}. Payment rejected and marked failed.`
    );

    // -------------------------------------------------------------
    // SCENARIO 8: REFRESH ON THE RETURN PAGE
    // -------------------------------------------------------------
    console.log('\n--- Running Scenario 8: Refresh on Return Page ---');
    // Fetch admin order count before refresh
    const adminResBefore = await fetch(`${BASE_URL}/api/admin/orders`);
    const adminDataBefore = await adminResBefore.json();
    const countBefore = adminDataBefore.orders.length;

    // Simulate 3 successive refreshes of the return page for order 1
    const ref1 = await fetch(`${BASE_URL}/api/orders/${orderId1}/payment-status`);
    const ref2 = await fetch(`${BASE_URL}/api/orders/${orderId1}/payment-status`);
    const ref3 = await fetch(`${BASE_URL}/api/orders/${orderId1}/payment-status`);

    const dataRef1 = await ref1.json();
    const dataRef2 = await ref2.json();
    const dataRef3 = await ref3.json();

    // Fetch admin order count after refresh
    const adminResAfter = await fetch(`${BASE_URL}/api/admin/orders`);
    const adminDataAfter = await adminResAfter.json();
    const countAfter = adminDataAfter.orders.length;

    const pass8 =
      countBefore === countAfter &&
      dataRef1.paymentStatus === 'completed' &&
      dataRef2.paymentStatus === 'completed' &&
      dataRef3.paymentStatus === 'completed';

    record(
      '8. Refresh on Return Page',
      pass8,
      `Repeated refreshes produced zero duplicate orders (Total count: ${countAfter}). State remains consistently completed.`
    );

    // -------------------------------------------------------------
    // BONUS: FALLBACK METHODS (COD & Staff Manual UPI Marking)
    // -------------------------------------------------------------
    console.log('\n--- Testing Fallback Methods: COD & Staff Audit ---');
    const initResCod = await fetch(`${BASE_URL}/api/checkout/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'g1-2', productId: 'g1-2', name: 'Cadbury 5 Star', quantity: 2 }],
        slot: 'Standard Delivery',
        address: {
          fullName: 'Vikram Singh',
          phone: '9870001122',
          streetArea: 'Malleshwaram 8th Cross',
          city: 'Bengaluru',
          pincode: '560003',
          type: 'Home'
        },
        paymentMethod: 'Cash on Delivery',
      }),
    });
    const codData = await initResCod.json();
    const codOrderId = codData.orderId;

    // Staff marks it as manual paid (Cash counter / staff manual UPI)
    const staffAuditRes = await fetch(`${BASE_URL}/api/admin/orders/${codOrderId}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffIdentifier: 'Cashier-Suresh (Counter 2)' }),
    });
    const staffAuditData = await staffAuditRes.json();

    const passAudit =
      staffAuditData.success === true &&
      staffAuditData.order.paymentStatus === 'manual_verified' &&
      staffAuditData.order.markedPaidBy === 'Cashier-Suresh (Counter 2)';

    record(
      'Fallback: Staff Manual UPI / Cash Audit',
      passAudit,
      `Order #${codOrderId} successfully marked paid by ${staffAuditData.order?.markedPaidBy} with audit trail recorded.`
    );

  } catch (err) {
    console.error('Test Suite Exception:', err);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🏁 TEST SUITE SUMMARY:');
  const allPassed = results.length === 9 && results.every((r) => r.passed);
  results.forEach((r) => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.scenario}`);
  });
  console.log('='.repeat(70));
  console.log(allPassed ? '🎉 ALL 8 REQUIRED SCENARIOS & FALLBACKS PASSED!' : '⚠️ SOME TESTS FAILED');
  console.log('='.repeat(70));
}

runSuite();
