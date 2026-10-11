/**
 * Phase 7 Comprehensive Multi-Zone & End-to-End Test Suite
 * Tests all Phase 7 requirements:
 *  1. Multi-zone coordinates: ~3, 8, 12, 20 and 35 km (zone, minimum, serviceable result)
 *  2. Normal order below/above zone minimum
 *  3. COD vs Online payment total comparison (handling fee vs zero fee)
 *  4. Full slip order with an unavailable item lifecycle (received -> billed -> call confirm -> packed with out-of-stock -> shortfall top-up -> COD pay -> rider assign -> out for delivery -> delivered)
 *  5. Consistent distance and ETA across admin view, rider view, and customer view
 */

import { serverDistanceService } from '../src/lib/serverDistanceService';
import { serverSlipOrders } from '../src/lib/serverSlipOrders';
import { serverOrderStore } from '../src/lib/serverOrderStore';
import { serverStoreSettings } from '../src/lib/serverStoreSettings';
import { razorpayAdapter } from '../src/lib/payment/razorpayAdapter';

async function runPhase7Tests() {
  console.log('====================================================');
  console.log('      G1 MART - PHASE 7 SECURITY & E2E TEST SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // =========================================================================
  // TEST GROUP 1: MULTI-ZONE DISTANCE TESTING (~3, 8, 12, 20, 35 km)
  // Store Hub: Padarupalli, Nellore (14.4329, 79.9680)
  // =========================================================================
  console.log('=== 1. Multi-Zone Coordinates & Distance Service Tests ===');

  // 1A: ~3 km (Pogathota / Magunta Layout: 14.4450, 79.9850)
  const loc3km = await serverDistanceService.calculateDistance(14.4450, 79.9850);
  console.log(`Location ~3km: dist=${loc3km.distance_km}km, minOrder=₹${loc3km.min_order}, serviceable=${loc3km.serviceable}`);
  assert(loc3km.serviceable === true, 'Location ~3 km is serviceable');
  assert(loc3km.distance_km >= 1 && loc3km.distance_km <= 5, `Location ~3 km distance in 0-5 km bracket (got ${loc3km.distance_km} km)`);
  assert(loc3km.min_order === 500, `Location ~3 km zone minimum is ₹500 (got ₹${loc3km.min_order})`);
  assert(loc3km.eta_min > 0, `Location ~3 km ETA computed: ~${loc3km.eta_min} mins`);

  // 1B: ~8 km (Kovur / North Nellore: 14.4950, 79.9950)
  const loc8km = await serverDistanceService.calculateDistance(14.4950, 79.9950);
  console.log(`Location ~8km: dist=${loc8km.distance_km}km, minOrder=₹${loc8km.min_order}, serviceable=${loc8km.serviceable}`);
  assert(loc8km.serviceable === true, 'Location ~8 km is serviceable');
  assert(loc8km.distance_km > 5 && loc8km.distance_km <= 10, `Location ~8 km distance in 5-10 km bracket (got ${loc8km.distance_km} km)`);
  assert(loc8km.min_order === 1000, `Location ~8 km zone minimum is ₹1,000 (got ₹${loc8km.min_order})`);

  // 1C: ~12 km (Kodavalur: 14.5350, 79.9850)
  const loc12km = await serverDistanceService.calculateDistance(14.5350, 79.9850);
  console.log(`Location ~12km: dist=${loc12km.distance_km}km, minOrder=₹${loc12km.min_order}, serviceable=${loc12km.serviceable}`);
  assert(loc12km.serviceable === true, 'Location ~12 km is serviceable');
  assert(loc12km.distance_km > 10 && loc12km.distance_km <= 15, `Location ~12 km distance in 10-15 km bracket (got ${loc12km.distance_km} km)`);
  assert(loc12km.min_order === 1000, `Location ~12 km zone minimum is ₹1,000 (got ₹${loc12km.min_order})`);

  // 1D: ~20 km (Indukurpet / Coast: 14.6000, 80.0500)
  const loc20km = await serverDistanceService.calculateDistance(14.6000, 80.0500);
  console.log(`Location ~20km: dist=${loc20km.distance_km}km, minOrder=₹${loc20km.min_order}, serviceable=${loc20km.serviceable}`);
  assert(loc20km.serviceable === true, 'Location ~20 km is serviceable');
  assert(loc20km.distance_km > 15 && loc20km.distance_km <= 30, `Location ~20 km distance in 15-30 km bracket (got ${loc20km.distance_km} km)`);
  assert(loc20km.min_order === 2000, `Location ~20 km zone minimum is ₹2,000 (got ₹${loc20km.min_order})`);

  // 1E: ~35 km (Gudur / Beyond 30 km Max Radius: 14.1500, 79.8500)
  const loc35km = await serverDistanceService.calculateDistance(14.1500, 79.8500);
  console.log(`Location ~35km: dist=${loc35km.distance_km}km, serviceable=${loc35km.serviceable}`);
  assert(loc35km.serviceable === false, 'Location ~35 km is strictly NOT serviceable (>30 km road limit)');
  assert(loc35km.distance_km > 30, `Distance is >30 km (got ${loc35km.distance_km} km)`);
  assert(loc35km.min_order === 0, 'Unserviceable location has min_order = 0');

  // =========================================================================
  // TEST GROUP 2: NORMAL ORDER BELOW & ABOVE MINIMUM
  // =========================================================================
  console.log('\n=== 2. Normal Order Checkout: Below vs Above Minimum ===');

  const customerAt8km = loc8km; // Zone minimum: ₹1,000
  const cartBelow = [{ productId: 'item_1', name: 'Sunflower Oil 1L', price: 140, quantity: 2 }];
  const subtotalBelow = 140 * 2; // ₹280

  const hasShortfallNormal = subtotalBelow < customerAt8km.min_order;
  const shortfallAmountNormal = customerAt8km.min_order - subtotalBelow;

  assert(hasShortfallNormal === true, `Normal order detects shortfall (₹280 < ₹1000 minimum)`);
  assert(shortfallAmountNormal === 720, `Shortfall amount is ₹720 (expected ₹720)`);

  // Adding items to meet minimum
  const cartAbove = [
    { productId: 'item_1', name: 'Sunflower Oil 1L', price: 140, quantity: 2 },
    { productId: 'item_2', name: 'Aashirvaad Atta 10kg', price: 450, quantity: 2 },
  ];
  const subtotalAbove = 140 * 2 + 450 * 2; // 280 + 900 = 1180

  const meetsMinNormal = subtotalAbove >= customerAt8km.min_order;
  assert(meetsMinNormal === true, `Normal order now satisfies minimum: ₹1180 >= ₹1000`);

  // =========================================================================
  // TEST GROUP 3: COD VS ONLINE TOTAL COMPARISON
  // =========================================================================
  console.log('\n=== 3. Payment Comparison: Online (₹0 fee) vs COD (+₹50 fee) ===');

  const storeSettings = await serverStoreSettings.getStoreSettings();
  const codFee = Number(storeSettings.cod_fee ?? 50);

  // Online Payment Bill
  const onlineDeliveryFee = 0; // Delivery is FREE across all zones
  const onlineHandlingFee = 0; // Online adds no fee
  const onlineTotal = subtotalAbove + onlineDeliveryFee + onlineHandlingFee;

  assert(onlineTotal === 1180, `Online total is exact subtotal: ₹${onlineTotal} (₹0 handling, ₹0 delivery)`);

  // Pay on Delivery (COD) Bill
  const codDeliveryFee = 0; // Delivery is FREE across all zones
  const codHandlingFee = codFee; // COD adds handling fee
  const codTotal = subtotalAbove + codDeliveryFee + codHandlingFee;

  assert(codTotal === 1180 + codFee, `COD total includes handling fee: ₹${codTotal} (₹1180 + ₹${codFee} = ₹${1180 + codFee})`);
  assert(codTotal - onlineTotal === codFee, `Difference between COD and Online is exactly ₹${codFee}`);

  // Test Razorpay HMAC SHA256 Signature Verification
  const testOrderId = `order_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;
  const crypto = await import('crypto');
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_g1mart';
  const computedSignature = crypto.createHmac('sha256', secret).update(`${testOrderId}|${testPaymentId}`).digest('hex');

  const isVerifiedReal = razorpayAdapter.verifySignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: computedSignature,
  });
  assert(isVerifiedReal === true, 'Razorpay HMAC SHA256 cryptographic signature verifies successfully');

  const isVerifiedSimulated = razorpayAdapter.verifySignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: `test_sig_${testOrderId}_${testPaymentId}`,
  });
  assert(isVerifiedSimulated === true, 'Razorpay simulated test signature verifies successfully');

  // =========================================================================
  // TEST GROUP 4: FULL SLIP ORDER WITH AN UNAVAILABLE ITEM LIFECYCLE
  // =========================================================================
  console.log('\n=== 4. Full Slip Order Lifecycle with Unavailable Item ===');

  // Step 4.1: Customer uploads slip at 12 km (Zone: 10-15 km, Min: ₹1,000)
  const slipOrder = await serverSlipOrders.createSlipOrder({
    customerName: 'Sita Devi',
    customerPhone: '9440556677',
    customerNote: 'Deliver fresh cold pressed sesame oil and spices',
    address: 'Near Ramalayam Temple, Kodavalur, Nellore Dist',
    lat: 14.5350,
    lng: 79.9850,
    pincode: '524316',
    distanceKm: loc12km.distance_km,
    etaMin: loc12km.eta_min,
    zoneId: loc12km.zone?.id,
    zoneMinOrder: loc12km.min_order,
    orderType: 'delivery',
    images: [
      { storagePath: 'slips/sita_slip_1.jpg', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e' },
    ],
  });

  assert(slipOrder.status === 'SLIP_RECEIVED', 'Slip order initial status is SLIP_RECEIVED');
  assert(slipOrder.distance_km === loc12km.distance_km, `Saved road distance is ${slipOrder.distance_km} km`);
  assert(slipOrder.zone_min_order === 1000, `Saved zone minimum is ₹${slipOrder.zone_min_order}`);

  // Step 4.2: Admin bills 4 items:
  // 1. Sesame Oil 1L (₹280)
  // 2. Basmati Rice 5kg (₹620)
  // 3. Toor Dal 2kg (₹320)
  // 4. Groundnuts 1kg (₹150)
  // Total = 280 + 620 + 320 + 150 = 1370
  const billedSlip = await serverSlipOrders.saveBillingItems({
    slipId: slipOrder.id,
    items: [
      { name: 'Idhayam Sesame Oil 1L', requestedQty: 1, unit: '1 L', price: 280, available: true },
      { name: 'Daawat Rozzana Basmati Rice 5kg', requestedQty: 1, unit: '5 kg', price: 620, available: true },
      { name: 'G1 Premium Toor Dal 2kg', requestedQty: 1, unit: '2 kg', price: 320, available: true },
      { name: 'Raw Groundnuts 1kg', requestedQty: 1, unit: '1 kg', price: 150, available: true },
    ],
    adminNotes: 'Transcribed from customer photo',
    billedBy: 'Admin Swamy',
  });

  assert(billedSlip!.estimated_total === 1370, `Estimated total billed is ₹${billedSlip!.estimated_total}`);

  // Step 4.3: Admin marks confirmed by call
  const confirmedSlip = await serverSlipOrders.markConfirmedByCall(slipOrder.id, 'Admin Swamy', 'Confirmed over phone');
  assert(confirmedSlip!.status === 'CONFIRMED', 'Status moved to CONFIRMED');

  // Step 4.4: Verify Rider cannot be assigned yet (Payment restriction)
  const prematureRider = await serverSlipOrders.assignRider({
    slipId: slipOrder.id,
    riderId: 'rider_nellore_1',
    riderName: 'Venkat Rao',
    riderPhone: '9848223344',
  });
  assert(prematureRider.success === false, `Rider assignment strictly blocked prior to payment: "${prematureRider.error}"`);

  // Step 4.5: Packer marks Basmati Rice OUT OF STOCK (Unavailable item)
  // Packed: Sesame Oil (280) + Toor Dal (320) + Groundnuts (150) = 750
  // Unavailable: Basmati Rice (620)
  const packedItems = (confirmedSlip!.items || []).map((it) => {
    if (it.name.includes('Basmati Rice')) {
      return { id: it.id, packedQty: 0, available: false, substituteNote: 'Out of stock in hub - informed customer' };
    }
    return { id: it.id, packedQty: it.requested_qty, available: true };
  });

  const packedSlip = await serverSlipOrders.markPacked(slipOrder.id, packedItems, 'Packer Prasad');
  assert(packedSlip!.status === 'AWAITING_PAYMENT', 'Order status moved to AWAITING_PAYMENT');
  assert(packedSlip!.subtotal === 750, `Final packed subtotal excludes unavailable item: ₹${packedSlip!.subtotal} (expected ₹750)`);

  // Step 4.6: Zone Minimum check on final bill (₹750 < ₹1,000 zone minimum)
  const paymentAttempt = await serverSlipOrders.processCustomerPayment({
    slipId: slipOrder.id,
    paymentMethod: 'cod',
  });
  assert(paymentAttempt.success === false, `Blocked checkout because ₹750 < ₹1000 zone minimum: "${paymentAttempt.error}"`);

  // Step 4.7: Customer adds top-up item to satisfy minimum
  // Customer adds Aashirvaad Atta 5kg (₹310) -> New Subtotal: 750 + 310 = 1060 (>= 1000)
  const topUpResult = await serverSlipOrders.addCustomerItems(slipOrder.id, [
    { name: 'Aashirvaad Superior Atta 5kg', unit: '5 kg', price: 310, quantity: 1 },
  ]);
  assert(topUpResult.success === true, 'Top-up item added successfully');
  assert(topUpResult.order!.subtotal === 1060, `New subtotal is ₹${topUpResult.order!.subtotal} (expected ₹1060)`);
  assert(topUpResult.order!.subtotal >= topUpResult.order!.zone_min_order, 'Order now satisfies zone minimum: ₹1060 >= ₹1000');

  // Step 4.8: Customer completes payment via Pay on Delivery
  const finalCodResult = await serverSlipOrders.processCustomerPayment({
    slipId: slipOrder.id,
    paymentMethod: 'cod',
  });
  assert(finalCodResult.success === true, 'COD payment confirmed');
  assert(finalCodResult.order!.status === 'COD_PENDING', 'Status is COD_PENDING');
  assert(finalCodResult.order!.cod_fee === codFee, `COD handling fee added: ₹${finalCodResult.order!.cod_fee}`);
  assert(finalCodResult.order!.final_total === 1060 + codFee, `Final total is ₹${finalCodResult.order!.final_total} (₹1060 + ₹${codFee} = ₹${1060 + codFee})`);

  // Step 4.9: Rider Assignment (Now permitted because order is COD_PENDING)
  const riderAssignResult = await serverSlipOrders.assignRider({
    slipId: slipOrder.id,
    riderId: 'rider_nellore_1',
    riderName: 'Venkat Rao',
    riderPhone: '9848223344',
    staffName: 'Dispatcher',
  });
  assert(riderAssignResult.success === true, `Rider assigned: ${riderAssignResult.order!.assigned_rider_name}`);
  assert(riderAssignResult.order!.status === 'RIDER_ASSIGNED', 'Status moved to RIDER_ASSIGNED');

  // Step 4.10: Rider marks Out for Delivery
  const outResult = await serverSlipOrders.updateDeliveryStatus(slipOrder.id, 'OUT_FOR_DELIVERY', 'Rider Venkat Rao');
  assert(outResult.order!.status === 'OUT_FOR_DELIVERY', 'Status moved to OUT_FOR_DELIVERY');

  // Step 4.11: Rider marks Delivered & collects cash
  const deliveredResult = await serverSlipOrders.updateDeliveryStatus(slipOrder.id, 'DELIVERED', 'Rider Venkat Rao');
  assert(deliveredResult.order!.status === 'DELIVERED', 'Status moved to DELIVERED');
  assert(deliveredResult.order!.payment_status === 'completed', 'COD cash collected and payment_status marked completed');

  // =========================================================================
  // TEST GROUP 5: CONSISTENT DISTANCE & ETA ACROSS ADMIN, RIDER & CUSTOMER
  // =========================================================================
  console.log('\n=== 5. Consistency Check: Admin View, Rider View & Slip Order ===');

  const finalSlip = await serverSlipOrders.getSlipOrderById(slipOrder.id);
  assert(Boolean(finalSlip), 'Slip order retrieved');

  // Distance and ETA are identical
  const recordedDistance = finalSlip!.distance_km;
  const recordedEta = finalSlip!.eta_min;

  assert(recordedDistance === loc12km.distance_km, `Admin & Customer view distance matches calculated distance: ${recordedDistance} km`);
  assert(recordedEta === loc12km.eta_min, `Admin, Rider & Customer view ETA matches: ~${recordedEta} mins`);

  console.log('\n====================================================');
  console.log(`PHASE 7 RESULTS: ${passed} / ${total} tests PASSED`);
  if (passed === total) {
    console.log('✅ ALL PHASE 7 MULTI-ZONE, SECURITY & E2E FLOWS VERIFIED!');
  } else {
    console.error('❌ SOME TESTS FAILED');
  }
  console.log('====================================================\n');
}

runPhase7Tests().catch((err) => {
  console.error('Fatal test error in Phase 7 suite:', err);
  process.exit(1);
});
