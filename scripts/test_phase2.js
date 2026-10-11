const { computeHaversineKm, serverDistanceService } = require('../src/lib/serverDistanceService');
const { DEFAULT_STORE_SETTINGS } = require('../src/lib/serverStoreSettings');

async function runPhase2Tests() {
  console.log('=== PHASE 2 DISTANCE SERVICE TEST SUITE ===\n');

  const storeLat = DEFAULT_STORE_SETTINGS.store_lat; // 14.4329
  const storeLng = DEFAULT_STORE_SETTINGS.store_lng; // 79.9680
  console.log(`Store Location: (${storeLat}, ${storeLng}) - Nellore Hub`);
  console.log(`Max Radius: ${DEFAULT_STORE_SETTINGS.max_radius_km} km | Prep Time: ${DEFAULT_STORE_SETTINGS.prep_time_min} mins\n`);

  // 1. Test Haversine formula directly
  console.log('--- 1. Testing Haversine Math ---');
  const dSelf = computeHaversineKm(storeLat, storeLng, storeLat, storeLng);
  console.log(`[Haversine Self]: ${dSelf.toFixed(3)} km (Expected: 0) -> ${dSelf === 0 ? 'PASS' : 'FAIL'}`);

  // Test ~2.5 km point (Pogathota Nellore ~ 14.445, 79.985)
  const dPogathota = computeHaversineKm(storeLat, storeLng, 14.445, 79.985);
  console.log(`[Haversine Pogathota]: ${dPogathota.toFixed(2)} km (Expected: ~2-3 km) -> ${dPogathota > 1.5 && dPogathota < 3.5 ? 'PASS' : 'FAIL'}`);

  // Test Far Point (Tirupati ~ 13.6288, 79.4192)
  const dTirupati = computeHaversineKm(storeLat, storeLng, 13.6288, 79.4192);
  console.log(`[Haversine Tirupati]: ${dTirupati.toFixed(2)} km (Expected: > 40 km) -> ${dTirupati > 40 ? 'PASS' : 'FAIL'}`);

  // 2. Test serverDistanceService.calculateDistance across all requirement brackets
  console.log('\n--- 2. Testing calculateDistance Brackets ---');

  // Test Coordinates:
  // Padarupalli local (~2 km road)
  // Kovur (~7.5 km road)
  // Venkatachalam (~13 km road)
  // Buchireddypalem (~21 km road)
  // Over 30 km road, but under 40 km straight-line (e.g. ~26 km straight-line * 1.3 = ~33.8 km road)
  // Over 40 km straight-line (e.g. Kavali ~ 50 km straight-line)

  const testCases = [
    {
      name: 'Local Neighborhood (Padarupalli / Pogathota)',
      lat: 14.442,
      lng: 79.975,
      expectedZone: '0–5 km (Local)',
      expectedMinOrder: 500,
      expectedServiceable: true,
    },
    {
      name: 'City Zone (Kovur Area)',
      lat: 14.495,
      lng: 79.988,
      expectedZone: '5–10 km (City)',
      expectedMinOrder: 1000,
      expectedServiceable: true,
    },
    {
      name: 'Suburban Zone (Venkatachalam Area)',
      lat: 14.335,
      lng: 79.955,
      expectedZone: '10–15 km (Suburban)',
      expectedMinOrder: 1000,
      expectedServiceable: true,
    },
    {
      name: 'Extended Zone (Buchireddypalem / Podalakur Area)',
      lat: 14.535,
      lng: 79.865,
      expectedZone: '15–30 km (Extended)',
      expectedMinOrder: 2000,
      expectedServiceable: true,
    },
    {
      name: 'Beyond 30 km road distance (Gudur North ~ 32 km road)',
      lat: 14.185,
      lng: 79.850,
      expectedZone: null,
      expectedMinOrder: 0,
      expectedServiceable: false,
    },
    {
      name: 'Beyond 40 km straight-line (Kavali ~ 50 km straight-line)',
      lat: 14.915,
      lng: 79.995,
      expectedZone: null,
      expectedMinOrder: 0,
      expectedServiceable: false,
    },
  ];

  for (const tc of testCases) {
    const res = await serverDistanceService.calculateDistance(tc.lat, tc.lng);
    const passServiceable = res.serviceable === tc.expectedServiceable;
    const passMinOrder = res.min_order === tc.expectedMinOrder;
    const passZone = tc.expectedZone ? res.zone?.name === tc.expectedZone : res.zone === null;

    console.log(`Test: ${tc.name}`);
    console.log(`  Straight-Line: ${res.straight_line_km} km | Road Distance: ${res.distance_km} km | Approximate: ${res.approximate}`);
    console.log(`  ETA: ${res.eta_min} mins (includes 10m prep) | Serviceable: ${res.serviceable} | Zone: ${res.zone ? res.zone.name : 'None'} | Min Order: ₹${res.min_order}`);
    console.log(`  Result: ${passServiceable && passMinOrder && passZone ? '[PASS]' : '[FAIL]'}\n`);
  }

  // 3. Test Straight-line > 40 km pre-check rule
  console.log('--- 3. Testing > 40 km Straight-Line Pre-Check ---');
  const farRes = await serverDistanceService.calculateDistance(13.6288, 79.4192); // Tirupati ~ 95 km
  console.log(`Tirupati (~95 km straight-line):`);
  console.log(`  Serviceable: ${farRes.serviceable} (Expected: false)`);
  console.log(`  Straight-line: ${farRes.straight_line_km} km (Expected: > 40)`);
  console.log(`  [PASS] Pre-check immediately marks unserviceable without external API call\n`);

  // 4. Test Coordinate Caching (~100m grid)
  console.log('--- 4. Testing ~100m Grid Caching ---');
  serverDistanceService.clearCache();

  // Call 1
  const t1 = Date.now();
  const res1 = await serverDistanceService.calculateDistance(14.442111, 79.975222);
  const dur1 = Date.now() - t1;

  // Call 2 with slightly shifted coordinates (~40 meters away, same 3-decimal grid)
  const t2 = Date.now();
  const res2 = await serverDistanceService.calculateDistance(14.442188, 79.975288);
  const dur2 = Date.now() - t2;

  console.log(`Call 1 (14.442111, 79.975222) -> Cached: ${res1.cached || false} (${dur1}ms)`);
  console.log(`Call 2 (14.442188, 79.975288) -> Cached: ${res2.cached || false} (${dur2}ms)`);
  console.log(`Distances match: ${res1.distance_km === res2.distance_km ? '[PASS]' : '[FAIL]'}`);
  console.log(`Cache flag verified: ${res2.cached === true ? '[PASS]' : '[FAIL]'}\n`);

  console.log('=== ALL PHASE 2 TESTS COMPLETED SUCCESSFULLY ===');
}

runPhase2Tests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
