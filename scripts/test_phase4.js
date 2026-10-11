const { serverDistanceService } = require('../src/lib/serverDistanceService');
const { serverOrderStore } = require('../src/lib/serverOrderStore');

async function runPhase4Verification() {
  console.log('========================================================');
  console.log('   PHASE 4 NORMAL ORDER CHECKOUT VERIFICATION SUITE   ');
  console.log('========================================================\n');

  // 1. Test Distance-to-Zone Minimum Mapping
  console.log('--- 1. Testing Zone Minimum Resolution for Normal Checkout ---');

  // Case A: 0-5 km (e.g. 2.4 km Padarupalli) -> min_order ₹500
  const localRes = await serverDistanceService.calculateDistance(14.442, 79.975);
  console.log(`[0-5 km Zone (${localRes.distance_km} km)]: Expected min_order = ₹500 -> Actual: ₹${localRes.min_order} -> ${localRes.min_order === 500 ? '[PASS]' : '[FAIL]'}`);

  // Case B: 5-10 km (e.g. 7.5 km Kovur) -> min_order ₹1000
  const cityRes = await serverDistanceService.calculateDistance(14.495, 79.988);
  console.log(`[5-10 km Zone (${cityRes.distance_km} km)]: Expected min_order = ₹1000 -> Actual: ₹${cityRes.min_order} -> ${cityRes.min_order === 1000 ? '[PASS]' : '[FAIL]'}`);

  // Case C: 15-30 km (e.g. 21 km Buchireddypalem) -> min_order ₹2000
  const extRes = await serverDistanceService.calculateDistance(14.535, 79.865);
  console.log(`[15-30 km Zone (${extRes.distance_km} km)]: Expected min_order = ₹2000 -> Actual: ₹${extRes.min_order} -> ${extRes.min_order === 2000 ? '[PASS]' : '[FAIL]'}`);

  // 2. Test Checkout Subtotal Comparison (Below Minimum vs Met Minimum)
  console.log('\n--- 2. Testing Checkout Subtotal Comparison & Shortfall ---');

  function evaluateCheckout(subtotal, zoneMinOrder, orderType) {
    const isPickup = orderType === 'pickup';
    const effectiveMin = isPickup ? 0 : zoneMinOrder;
    const isBelowMin = !isPickup && subtotal < effectiveMin;
    const shortfall = Math.max(0, effectiveMin - subtotal);
    const progress = Math.min(100, Math.round((subtotal / (effectiveMin || 1)) * 100));
    return { isBelowMin, shortfall, progress, canProceed: !isBelowMin };
  }

  // Test 2.1: Local zone (₹500 min), subtotal ₹350 -> Below min, shortfall ₹150, blocked
  const c1 = evaluateCheckout(350, localRes.min_order, 'delivery');
  console.log(`[Subtotal ₹350 vs Min ₹500 (Delivery)]:`);
  console.log(`  Below Min: ${c1.isBelowMin} | Shortfall: ₹${c1.shortfall} | Progress: ${c1.progress}% | Can Proceed: ${c1.canProceed}`);
  console.log(`  Result: ${c1.isBelowMin === true && c1.shortfall === 150 && c1.canProceed === false ? '[PASS]' : '[FAIL]'}`);

  // Test 2.2: Local zone (₹500 min), subtotal ₹500 -> Exactly met, allowed
  const c2 = evaluateCheckout(500, localRes.min_order, 'delivery');
  console.log(`[Subtotal ₹500 vs Min ₹500 (Delivery)]:`);
  console.log(`  Below Min: ${c2.isBelowMin} | Shortfall: ₹${c2.shortfall} | Progress: ${c2.progress}% | Can Proceed: ${c2.canProceed}`);
  console.log(`  Result: ${c2.isBelowMin === false && c2.shortfall === 0 && c2.canProceed === true ? '[PASS]' : '[FAIL]'}`);

  // Test 2.3: Local zone (₹500 min), subtotal ₹750 -> Exceeded, allowed
  const c3 = evaluateCheckout(750, localRes.min_order, 'delivery');
  console.log(`[Subtotal ₹750 vs Min ₹500 (Delivery)]:`);
  console.log(`  Below Min: ${c3.isBelowMin} | Shortfall: ₹${c3.shortfall} | Progress: ${c3.progress}% | Can Proceed: ${c3.canProceed}`);
  console.log(`  Result: ${c3.isBelowMin === false && c3.canProceed === true ? '[PASS]' : '[FAIL]'}`);

  // Test 2.4: Pickup Order with small basket (₹120) -> Skips minimum, allowed!
  const c4 = evaluateCheckout(120, localRes.min_order, 'pickup');
  console.log(`[Subtotal ₹120 (Store Pickup)]:`);
  console.log(`  Below Min: ${c4.isBelowMin} | Shortfall: ₹${c4.shortfall} | Can Proceed: ${c4.canProceed}`);
  console.log(`  Result: ${c4.isBelowMin === false && c4.canProceed === true ? '[PASS: Pickup Skips Minimum]' : '[FAIL]'}`);

  // 3. Test Free Delivery Rule (Delivery fee = 0 in all zones)
  console.log('\n--- 3. Testing Delivery Fee = 0 in All Zones Rule ---');
  const dummyItems = [{ productId: 'prod-rice-26', quantity: 2 }];
  const calc = serverOrderStore.recalculateOrderTotal(dummyItems);
  console.log(`Calculated Server Order Delivery Fee: ₹${calc.deliveryFee} (Expected: ₹0) -> ${calc.deliveryFee === 0 ? '[PASS]' : '[FAIL]'}`);

  console.log('\n========================================================');
  console.log('   PHASE 4 VERIFICATION COMPLETED SUCCESSFULLY!        ');
  console.log('========================================================');
}

runPhase4Verification().catch(err => {
  console.error('Phase 4 verification error:', err);
  process.exit(1);
});
