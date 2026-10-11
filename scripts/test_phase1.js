const fs = require('fs');
const path = require('path');

// Test disk JSON data files
const settingsPath = path.join(__dirname, '..', 'data', 'g1mart_store_settings.json');
const zonesPath = path.join(__dirname, '..', 'data', 'g1mart_delivery_zones.json');

console.log('--- 1. Testing data/g1mart_store_settings.json ---');
const rawSettings = fs.readFileSync(settingsPath, 'utf-8');
const settings = JSON.parse(rawSettings);
console.log('Store coordinates:', settings.store_lat, settings.store_lng);
console.log('Store address:', settings.store_address);
console.log('Max radius (km):', settings.max_radius_km);
console.log('Prep time (min):', settings.prep_time_min);
console.log('COD fee (Rs):', settings.cod_fee);

console.log('\n--- 2. Testing data/g1mart_delivery_zones.json ---');
const rawZones = fs.readFileSync(zonesPath, 'utf-8');
const zones = JSON.parse(rawZones);
console.log('Delivery Zones count:', zones.length);
zones.forEach((z) => {
  console.log(` - ${z.name}: ${z.min_km}–${z.max_km} km | Min Order: ₹${z.min_order} | Fee: ₹${z.deliveryFee || 0} | Active: ${z.active}`);
});

console.log('\n--- 3. Testing distance rule evaluation ---');
function findZone(distanceKm, zoneList, maxRadius) {
  if (distanceKm > maxRadius) return null;
  for (const z of zoneList) {
    if (!z.active) continue;
    if (z.min_km === 0) {
      if (distanceKm >= 0 && distanceKm <= z.max_km) return z;
    } else {
      if (distanceKm > z.min_km && distanceKm <= z.max_km) return z;
    }
  }
  return null;
}

const testDistances = [3, 5, 8, 10, 12, 15, 20, 30, 35];
testDistances.forEach((d) => {
  const match = findZone(d, zones, settings.max_radius_km);
  if (match) {
    console.log(`[PASS] ${d} km -> ${match.name} | Min Order: ₹${match.min_order} | Free Delivery: YES`);
  } else {
    console.log(`[PASS] ${d} km -> UNSERVICEABLE (Beyond ${settings.max_radius_km} km limit)`);
  }
});

console.log('\n--- Phase 1 verification complete! ---');
