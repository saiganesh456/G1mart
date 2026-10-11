import { serverStoreSettings } from './serverStoreSettings';
import type { DistanceServiceResult, DeliveryZone } from '@/types/deliveryZone';

/**
 * Haversine formula: Computes great-circle (straight-line) distance in kilometers
 * between two lat/lng points on Earth.
 */
export function computeHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cache entry with expiration
 */
interface CacheEntry {
  data: DistanceServiceResult;
  expiresAt: number;
}

// In-memory global cache: persists across requests & dev HMR
declare global {
  // eslint-disable-next-line no-var
  var __g1DistanceCache: Map<string, CacheEntry> | undefined;
}

if (!global.__g1DistanceCache) {
  global.__g1DistanceCache = new Map<string, CacheEntry>();
}

const distanceCache = global.__g1DistanceCache;

/**
 * Round coordinate to ~100 meters precision (3 decimal places is ~111m)
 */
function roundTo100m(val: number): string {
  return Number(val).toFixed(3);
}

export const serverDistanceService = {
  /**
   * Main server-side distance calculation engine.
   *
   * Business Rules:
   * 1. Straight-line (Haversine) pre-check: If > 40 km, immediately return not serviceable
   *    without invoking Google Distance Matrix API.
   * 2. If <= 40 km, invoke Google Distance Matrix API (driving) for accurate road distance & duration.
   *    ETA = driving duration + prep_time_min.
   * 3. On Google failure/timeout or missing key, fallback to Haversine * 1.3 and set approximate = true.
   * 4. Session cache keyed by coordinates rounded to ~100m.
   * 5. Server-side only: Secret Google key remains protected on server.
   */
  async calculateDistance(
    customerLat: number,
    customerLng: number
  ): Promise<DistanceServiceResult> {
    const lat = Number(customerLat);
    const lng = Number(customerLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Invalid coordinates provided.');
    }

    // 1. Fetch current store settings and delivery zones
    const storeSettings = await serverStoreSettings.getStoreSettings();
    const zones = await serverStoreSettings.getDeliveryZones();

    const storeLat = Number(storeSettings.store_lat);
    const storeLng = Number(storeSettings.store_lng);
    const maxRadiusKm = Number(storeSettings.max_radius_km ?? 30);
    const prepTimeMin = Number(storeSettings.prep_time_min ?? 10);

    // 2. Cache lookup (coordinates rounded to ~100 m)
    const cacheKey = `${storeLat.toFixed(3)}_${storeLng.toFixed(3)}_${roundTo100m(lat)}_${roundTo100m(lng)}`;
    const cachedEntry = distanceCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return {
        ...cachedEntry.data,
        cached: true,
      };
    }

    // 3. Straight-line (Haversine) calculation
    const straightLineKm = computeHaversineKm(storeLat, storeLng, lat, lng);
    const roundedStraightKm = Math.round(straightLineKm * 10) / 10;

    // Rule 2: If straight-line is over 40 km, return unserviceable immediately without calling Google
    if (straightLineKm > 40) {
      const result: DistanceServiceResult = {
        serviceable: false,
        distance_km: roundedStraightKm,
        eta_min: 0,
        zone: null,
        min_order: 0,
        approximate: false,
        straight_line_km: roundedStraightKm,
        prep_time_min: prepTimeMin,
      };

      // Cache unserviceable result for 1 hour
      distanceCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });

      return result;
    }

    // 4. Try Google Distance Matrix API (driving mode)
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    let roadDistanceKm: number | null = null;
    let drivingDurationMin: number | null = null;
    let isApproximate = false;

    if (
      googleApiKey &&
      !googleApiKey.includes('your-google-maps-api-key') &&
      googleApiKey.trim().length > 5
    ) {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${storeLat},${storeLng}&destinations=${lat},${lng}&mode=driving&units=metric&key=${googleApiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const json = await res.json();
          if (
            json.status === 'OK' &&
            json.rows?.[0]?.elements?.[0]?.status === 'OK'
          ) {
            const element = json.rows[0].elements[0];
            const distanceMeters = element.distance.value;
            const durationSeconds = element.duration.value;

            roadDistanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
            drivingDurationMin = Math.ceil(durationSeconds / 60);
            isApproximate = false;
          } else {
            console.warn(
              '[DistanceService] Google Distance Matrix returned non-OK status:',
              json.status,
              json.rows?.[0]?.elements?.[0]?.status
            );
          }
        }
      } catch (err) {
        console.warn('[DistanceService] Google Distance Matrix request failed:', err);
      }
    }

    // 5. Fallback on Google failure: Haversine * 1.3
    if (roadDistanceKm === null || drivingDurationMin === null) {
      roadDistanceKm = Math.round(straightLineKm * 1.3 * 10) / 10;
      // Estimate driving duration assuming ~30 km/h average speed in town/countryside
      drivingDurationMin = Math.max(5, Math.ceil((roadDistanceKm / 30) * 60));
      isApproximate = true;
    }

    // 6. Compute ETA: duration + prep_time_min
    const etaMin = drivingDurationMin + prepTimeMin;

    // 7. Check serviceability against max_radius_km (30 km road distance)
    const isWithinRadius = roadDistanceKm <= maxRadiusKm;
    let matchedZone: DeliveryZone | null = null;
    let minOrder = 0;

    if (isWithinRadius) {
      matchedZone = serverStoreSettings.findZoneForDistance(roadDistanceKm, zones, maxRadiusKm);
      if (matchedZone) {
        minOrder = Number(matchedZone.min_order ?? matchedZone.minOrderValue ?? 500);
      }
    }

    const serviceable = Boolean(isWithinRadius && matchedZone);

    const result: DistanceServiceResult = {
      serviceable,
      distance_km: roadDistanceKm,
      eta_min: serviceable ? etaMin : 0,
      zone: matchedZone,
      min_order: serviceable ? minOrder : 0,
      approximate: isApproximate,
      straight_line_km: roundedStraightKm,
      driving_duration_min: drivingDurationMin,
      prep_time_min: prepTimeMin,
    };

    // 8. Cache result for 30 minutes
    distanceCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    return result;
  },

  /**
   * Clear in-memory distance cache (used by admin or tests)
   */
  clearCache(): void {
    distanceCache.clear();
  },
};
