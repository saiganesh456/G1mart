/**
 * Phase 6 Comprehensive Automated Test Suite
 * Tests all Phase 6 rules:
 *  - Slip order upload and initial status SLIP_RECEIVED
 *  - Admin Bill Builder, line prices, catalog items, substitute notes
 *  - Zone minimum shortfall detection on estimated total
 *  - Admin "Mark confirmed by call" -> CONFIRMED
 *  - Packer checklist with actual packed quantities and out-of-stock items
 *  - Recalculation of final subtotal -> PACKED -> AWAITING_PAYMENT
 *  - Customer final bill zone minimum enforcement (block payment if below minimum)
 *  - Customer adds top-up items to meet minimum
 *  - Customer payment options: Pay Online vs Pay on Delivery (with configurable fee)
 *  - Rider assignment restriction (only after payment)
 *  - Rider dispatch -> Out for Delivery -> Delivered (with COD cash collection)
 *  - Store pickup exemption from minimum order
 */

const path = require('path');

async function runPhase6Tests() {
  console.log('====================================================');
  console.log('       G1 MART - PHASE 6 COMPREHENSIVE TEST SUITE   ');
  console.log('====================================================\n');

  // Load server modules
  // Use ts-node or compiled require via Next.js aliases or direct relative paths
  const { serverSlipOrders } = require('../src/lib/serverSlipOrders');
  const { serverStoreSettings } = require('../src/lib/serverStoreSettings');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Customer uploads a new slip order at 7.5 km (Zone: 5-10 km, Min: ₹1,000)
  console.log('--- Test 1: Customer Slip Upload ---');
  const slip1 = await serverSlipOrders.createSlipOrder({
    customerName: 'Kavitha Reddy',
    customerPhone: '9848022334',
    customerNote: 'Please deliver fresh sunflower oil and wheat flour before 6 PM',
    address: 'Flat 302, Sri Krishna Apts, Magunta Layout, Nellore',
    lat: 14.4426,
    lng: 79.9865,
    pincode: '524003',
    distanceKm: 7.5,
    etaMin: 25,
    zoneId: 'zone_5_10',
    zoneMinOrder: 1000,
    orderType: 'delivery',
    images: [
      { storagePath: 'slips/slip1_p1.jpg', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e' },
      { storagePath: 'slips/slip1_p2.jpg', imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58' },
    ],
  });

  assert(slip1 && slip1.id.startsWith('SLIP-'), `Created slip order with ID: ${slip1.id}`);
  assert(slip1.status === 'SLIP_RECEIVED', `Initial status is SLIP_RECEIVED (got: ${slip1.status})`);
  assert(slip1.images.length === 2, `Images saved: ${slip1.images.length}`);
  assert(slip1.zone_min_order === 1000, `Zone min order copied: ₹${slip1.zone_min_order}`);
  assert(slip1.distance_km === 7.5, `Distance recorded: ${slip1.distance_km} km`);

  // TEST 2: Admin Bill Builder with initial shortfall
  console.log('\n--- Test 2: Admin Bill Builder & Shortfall Detection ---');
  const billedSlip1 = await serverSlipOrders.saveBillingItems({
    slipId: slip1.id,
    items: [
      { name: 'Aashirvaad Superior MP Sharbati Atta 5kg', requestedQty: 1, unit: '5 kg', price: 320, available: true },
      { name: 'Freedom Refined Sunflower Oil 1L', requestedQty: 1, unit: '1 L', price: 140, available: true },
      { name: 'Tata Salt 1kg', requestedQty: 2, unit: '1 kg', price: 28, available: true },
    ],
    adminNotes: 'Transcribed from customer image page 1',
    billedBy: 'Hub Admin Ramesh',
    moveStatus: 'BILLING',
  });

  // 320 + 140 + (28 * 2 = 56) = 516
  assert(billedSlip1.estimated_total === 516, `Estimated total calculated: ₹${billedSlip1.estimated_total} (expected ₹516)`);
  assert(billedSlip1.estimated_total < billedSlip1.zone_min_order, `Correctly detects shortfall: ₹516 < ₹${billedSlip1.zone_min_order}`);
  const shortfall1 = billedSlip1.zone_min_order - billedSlip1.estimated_total;
  assert(shortfall1 === 484, `Shortfall amount is ₹${shortfall1} (expected ₹484)`);

  // Admin calls customer and adds Basmati Rice (₹550) to satisfy minimum order
  const updatedBillSlip1 = await serverSlipOrders.saveBillingItems({
    slipId: slip1.id,
    items: [
      { name: 'Aashirvaad Superior MP Sharbati Atta 5kg', requestedQty: 1, unit: '5 kg', price: 320, available: true },
      { name: 'Freedom Refined Sunflower Oil 1L', requestedQty: 1, unit: '1 L', price: 140, available: true },
      { name: 'Tata Salt 1kg', requestedQty: 2, unit: '1 kg', price: 28, available: true },
      { name: 'India Gate Basmati Rice Feast Rozzana 5kg', requestedQty: 1, unit: '5 kg', price: 550, available: true },
    ],
    adminNotes: 'Added Basmati Rice per customer phone confirmation',
    billedBy: 'Hub Admin Ramesh',
    moveStatus: 'AWAITING_CUSTOMER_CONFIRMATION',
  });

  // 516 + 550 = 1066
  assert(updatedBillSlip1.estimated_total === 1066, `New estimated total is ₹${updatedBillSlip1.estimated_total} (expected ₹1066)`);
  assert(updatedBillSlip1.estimated_total >= updatedBillSlip1.zone_min_order, `Bill now satisfies zone minimum: ₹1066 >= ₹${updatedBillSlip1.zone_min_order}`);

  // TEST 3: Admin "Mark Confirmed by Call"
  console.log('\n--- Test 3: Admin Confirms Order by Call ---');
  const confirmedSlip1 = await serverSlipOrders.markConfirmedByCall(slip1.id, 'Hub Admin Ramesh', 'Customer confirmed items');
  assert(confirmedSlip1.status === 'CONFIRMED', `Status transitioned to CONFIRMED (got: ${confirmedSlip1.status})`);
  const hasConfirmedHistory = confirmedSlip1.status_history.some((h) => h.status === 'CONFIRMED');
  assert(hasConfirmedHistory, 'Order status history recorded CONFIRMED with timestamp');

  // TEST 4: Rider Assignment restriction (cannot assign before payment)
  console.log('\n--- Test 4: Rider Assignment Restriction ---');
  const prematureRider = await serverSlipOrders.assignRider({
    slipId: slip1.id,
    riderId: 'rider_01',
    riderName: 'Suresh Kumar',
    riderPhone: '9848112233',
  });
  assert(prematureRider.success === false, `Blocked rider assignment on unpaid CONFIRMED order: "${prematureRider.error}"`);

  // TEST 5: Packer Checklist with Actual Quantities & Unavailable Item
  console.log('\n--- Test 5: Packer Checklist & Out-of-Stock Reporting ---');
  // Packer reports Sunflower Oil out of stock, packs Atta, Tata Salt, and Basmati Rice
  const packedItems = confirmedSlip1.items.map((it) => {
    if (it.name.includes('Sunflower Oil')) {
      return { id: it.id, packedQty: 0, available: false, substituteNote: 'Out of stock - suggested Fortune Oil to customer' };
    }
    return { id: it.id, packedQty: it.requested_qty, available: true };
  });

  const packedSlip1 = await serverSlipOrders.markPacked(slip1.id, packedItems, 'Packer Venkatesh');
  assert(packedSlip1.status === 'AWAITING_PAYMENT', `Order status moved to PACKED -> AWAITING_PAYMENT (got: ${packedSlip1.status})`);
  // Subtotal without Sunflower Oil: 320 + 56 + 550 = 926
  assert(packedSlip1.subtotal === 926, `Actual packed subtotal is ₹${packedSlip1.subtotal} (expected ₹926)`);

  // TEST 6: Zone Minimum Enforcement on Customer Final Bill
  console.log('\n--- Test 6: Customer Final Bill Zone Minimum Enforcement ---');
  // Attempt to pay when final subtotal (₹926) is below zone minimum (₹1,000)
  const prematurePayment = await serverSlipOrders.processCustomerPayment({
    slipId: slip1.id,
    paymentMethod: 'cod',
  });
  assert(prematurePayment.success === false, `Blocked payment when final subtotal < zone minimum: "${prematurePayment.error}"`);

  // Customer adds top-up item to satisfy minimum (Phase 6 Rule 5)
  console.log('\n--- Test 7: Customer Top-Up Items to Meet Zone Minimum ---');
  const topUpResult = await serverSlipOrders.addCustomerItems(slip1.id, [
    { name: 'Amul Salted Butter 500g', unit: '500 g', price: 275, quantity: 1 },
  ]);
  assert(topUpResult.success === true, 'Customer added Amul Butter to meet minimum');
  // New subtotal: 926 + 275 = 1201
  assert(topUpResult.order.subtotal === 1201, `New subtotal is ₹${topUpResult.order.subtotal} (expected ₹1201)`);
  assert(topUpResult.order.subtotal >= topUpResult.order.zone_min_order, `Now satisfies zone minimum: ₹1201 >= ₹1000`);

  // TEST 8: Customer Completes Payment: Pay on Delivery (COD)
  console.log('\n--- Test 8: Pay on Delivery (COD) with Handling Fee ---');
  const storeSettings = await serverStoreSettings.getStoreSettings();
  const codFee = Number(storeSettings.cod_fee ?? 50);

  const codPayResult = await serverSlipOrders.processCustomerPayment({
    slipId: slip1.id,
    paymentMethod: 'cod',
  });
  assert(codPayResult.success === true, 'COD payment confirmed successfully');
  assert(codPayResult.order.status === 'COD_PENDING', `Status is COD_PENDING (got: ${codPayResult.order.status})`);
  assert(codPayResult.order.payment_method === 'Cash on Delivery', `Payment method recorded: ${codPayResult.order.payment_method}`);
  assert(codPayResult.order.cod_fee === codFee, `COD handling fee added: ₹${codPayResult.order.cod_fee}`);
  assert(codPayResult.order.delivery_fee === 0, `Delivery fee is ₹0 (Free Delivery in all zones)`);
  assert(codPayResult.order.final_total === 1201 + codFee, `Final total is ₹${codPayResult.order.final_total} (₹1201 + ₹${codFee} = ₹${1201 + codFee})`);

  // TEST 9: Rider Assignment (Allowed after COD_PENDING / PAID)
  console.log('\n--- Test 9: Rider Assignment & Delivery Lifecycle ---');
  const riderAssignResult = await serverSlipOrders.assignRider({
    slipId: slip1.id,
    riderId: 'rider_01',
    riderName: 'Suresh Kumar',
    riderPhone: '9848112233',
    staffName: 'Store Dispatcher',
  });
  assert(riderAssignResult.success === true, `Rider successfully assigned: ${riderAssignResult.order.assigned_rider_name}`);
  assert(riderAssignResult.order.status === 'RIDER_ASSIGNED', `Status updated to RIDER_ASSIGNED (got: ${riderAssignResult.order.status})`);

  // Rider marks Out for Delivery
  const outResult = await serverSlipOrders.updateDeliveryStatus(slip1.id, 'OUT_FOR_DELIVERY', 'Rider Suresh Kumar');
  assert(outResult.success === true && outResult.order.status === 'OUT_FOR_DELIVERY', 'Status updated to OUT_FOR_DELIVERY');

  // Rider marks Delivered and collects cash
  const deliveredResult = await serverSlipOrders.updateDeliveryStatus(slip1.id, 'DELIVERED', 'Rider Suresh Kumar');
  assert(deliveredResult.success === true && deliveredResult.order.status === 'DELIVERED', 'Status updated to DELIVERED');
  assert(deliveredResult.order.payment_status === 'completed', `COD payment status marked completed upon delivery (got: ${deliveredResult.order.payment_status})`);

  // TEST 10: Online Payment Flow via Razorpay (Slip 2)
  console.log('\n--- Test 10: Online Payment Flow (Slip 2) ---');
  const slip2 = await serverSlipOrders.createSlipOrder({
    customerName: 'Mahesh Babu',
    customerPhone: '9440123456',
    address: 'Near Gandhi Statue, Stonehousepet, Nellore',
    distanceKm: 3.2,
    etaMin: 18,
    zoneId: 'zone_0_5',
    zoneMinOrder: 500,
    orderType: 'delivery',
    images: [{ storagePath: 'slips/s2.jpg', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e' }],
  });

  await serverSlipOrders.saveBillingItems({
    slipId: slip2.id,
    items: [{ name: 'Sona Masoori Rice 10kg', requestedQty: 1, unit: '10 kg', price: 650, available: true }],
    moveStatus: 'AWAITING_CUSTOMER_CONFIRMATION',
  });

  await serverSlipOrders.markConfirmedByCall(slip2.id, 'Admin');
  await serverSlipOrders.markPacked(
    slip2.id,
    [{ id: (await serverSlipOrders.getSlipOrderById(slip2.id)).items[0].id, packedQty: 1, available: true }],
    'Packer'
  );

  const onlinePayResult = await serverSlipOrders.processCustomerPayment({
    slipId: slip2.id,
    paymentMethod: 'online',
    transactionId: 'pay_test_rzp_987654',
  });

  assert(onlinePayResult.success === true, 'Online payment processed successfully');
  assert(onlinePayResult.order.status === 'PAID', `Status updated to PAID (got: ${onlinePayResult.order.status})`);
  assert(onlinePayResult.order.cod_fee === 0, 'Online payment has ₹0 COD fee');
  assert(onlinePayResult.order.final_total === 650, `Online total equals subtotal: ₹${onlinePayResult.order.final_total}`);
  assert(onlinePayResult.order.transaction_id === 'pay_test_rzp_987654', 'Transaction ID stored correctly');

  // TEST 11: Store Pickup Exemption (Slip 3)
  console.log('\n--- Test 11: Store Pickup Exemption ---');
  const slip3 = await serverSlipOrders.createSlipOrder({
    customerName: 'Anil Kumar',
    customerPhone: '9000112233',
    address: 'In-Store Pickup, Padarupalli Hub',
    distanceKm: 0,
    etaMin: 10,
    zoneMinOrder: 500,
    orderType: 'pickup',
    images: [{ storagePath: 'slips/s3.jpg', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e' }],
  });

  await serverSlipOrders.saveBillingItems({
    slipId: slip3.id,
    items: [{ name: 'Toothpaste 100g', requestedQty: 1, unit: '100 g', price: 65, available: true }],
  });
  await serverSlipOrders.markConfirmedByCall(slip3.id);
  await serverSlipOrders.markPacked(
    slip3.id,
    [{ id: (await serverSlipOrders.getSlipOrderById(slip3.id)).items[0].id, packedQty: 1, available: true }]
  );

  // Subtotal is only ₹65 (way below ₹500 minimum), but pickup order skips minimum
  const pickupPayResult = await serverSlipOrders.processCustomerPayment({
    slipId: slip3.id,
    paymentMethod: 'online',
    transactionId: 'pay_pickup_123',
  });
  assert(pickupPayResult.success === true, `Pickup slip order allowed payment of ₹65 without minimum restriction`);
  assert(pickupPayResult.order.status === 'PAID', 'Pickup slip order marked PAID');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} tests PASSED`);
  if (passed === total) {
    console.log('✅ ALL PHASE 6 SLIP ORDERS & WORKFLOW RULES VERIFIED!');
  } else {
    console.error('❌ SOME TESTS FAILED');
  }
  console.log('====================================================\n');
}

runPhase6Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
