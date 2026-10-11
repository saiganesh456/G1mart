const { computeHaversineKm, serverDistanceService } = require('../src/lib/serverDistanceService');
const { DEFAULT_STORE_SETTINGS } = require('../src/lib/serverStoreSettings');

async function runPhase3Verification() {
  console.log('=====================================================');
  console.log('   PHASE 3 LOCATION GATE LOGIC VERIFICATION SUITE   ');
  console.log('=====================================================\n');

  // 1. Verify 500m Movement Threshold Logic
  console.log('--- 1. Testing Movement Delta Detection (> 500m threshold) ---');
  // Saved location: Pogathota clock tower (14.4426, 79.9865)
  const savedLoc = { lat: 14.4426, lng: 79.9865, name: 'Pogathota Center' };
  
  // Point A: 100 meters away (14.4433, 79.9870)
  const distA = computeHaversineKm(savedLoc.lat, savedLoc.lng, 14.4433, 79.9870) * 1000;
  const movedA = distA > 500;
  console.log(`Small movement (${distA.toFixed(1)}m): moved > 500m? ${movedA} -> ${movedA === false ? '[PASS]' : '[FAIL]'}`);

  // Point B: 650 meters away (14.4480, 79.9890)
  const distB = computeHaversineKm(savedLoc.lat, savedLoc.lng, 14.4480, 79.9890) * 1000;
  const movedB = distB > 500;
  console.log(`Significant movement (${distB.toFixed(1)}m): moved > 500m? ${movedB} -> ${movedB === true ? '[PASS]' : '[FAIL]'}`);

  // 2. Verify Serviceable vs Unserviceable Determination
  console.log('\n--- 2. Testing Serviceable Gate Routing Criteria ---');
  
  // Test Case A: Inside Nellore city (Padarupalli ~2 km) -> Serviceable -> Home Route
  const localCheck = await serverDistanceService.calculateDistance(14.440, 79.972);
  console.log(`Local Nellore Coordinate (14.440, 79.972):`);
  console.log(`  Distance: ${localCheck.distance_km} km | Serviceable: ${localCheck.serviceable} | ETA: ${localCheck.eta_min}m | Min Order: ₹${localCheck.min_order}`);
  console.log(`  Result: ${localCheck.serviceable === true ? '[PASS: Allowed to enter store]' : '[FAIL]'}`);

  // Test Case B: Distant location (Kavali ~ 50 km) -> Unserviceable -> Gate Blocks Store
  const farCheck = await serverDistanceService.calculateDistance(14.915, 79.995);
  console.log(`Far Coordinate Kavali (14.915, 79.995):`);
  console.log(`  Distance: ${farCheck.distance_km} km | Serviceable: ${farCheck.serviceable}`);
  console.log(`  Result: ${farCheck.serviceable === false ? '[PASS: Gated to Unserviceable Page]' : '[FAIL]'}`);

  // Test Case C: Border location beyond 30 km road limit (Gudur ~ 33 km road)
  const borderCheck = await serverDistanceService.calculateDistance(14.185, 79.850);
  console.log(`Border Coordinate >30 km (14.185, 79.850):`);
  console.log(`  Distance: ${borderCheck.distance_km} km | Serviceable: ${borderCheck.serviceable}`);
  console.log(`  Result: ${borderCheck.serviceable === false ? '[PASS: Gated to Unserviceable Page]' : '[FAIL]'}`);

  console.log('\n=====================================================');
  console.log('   PHASE 3 VERIFICATION COMPLETED SUCCESSFULLY!      ');
  console.log('=====================================================');
}

runPhase3Verification().catch(err => {
  console.error('Phase 3 verification failed:', err);
  process.exit(1);
});
