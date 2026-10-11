export type DeliveryZoneType = 'city' | 'rural_extended' | 'out_of_coverage';

/**
 * Phase 1: Store Global Settings
 * Single row in database and runtime store
 */
export interface StoreSettings {
  id?: string;
  store_lat: number;
  store_lng: number;
  store_address: string;
  max_radius_km: number;
  prep_time_min: number;
  cod_fee: number;
  updated_at?: string;
}

/**
 * Phase 1: Distance-Based Delivery Zone
 * Delivery is FREE in all zones.
 * Initial business zones:
 * 0–5 km: ₹500
 * 5–10 km: ₹1000
 * 10–15 km: ₹1000
 * 15–30 km: ₹2000
 * over 30 km: not serviceable
 */
export interface DeliveryZone {
  id: string;
  min_km: number;
  max_km: number;
  min_order: number;
  active: boolean;
  name?: string;
  description?: string;
  // Compatibility fields for legacy references:
  code?: string;
  type?: DeliveryZoneType;
  geographicCoverage?: string;
  maxRadiusKm?: number;
  minOrderValue?: number;
  isActive?: boolean;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  estimatedMinDeliveryTime?: number;
  estimatedMaxDeliveryTime?: number;
  estimatedDeliveryTimeText?: string;
  pincodes?: string[];
  supportedAreas?: string[];
}

/**
 * Phase 1: Customer Location with Distance & Serviceability
 */
export interface CustomerLocationData {
  lat: number;
  lng: number;
  address: string;
  pincode: string;
  distance_km?: number;
  eta_min?: number;
  zone_id?: string;
  approximate?: boolean;
  calculated_at?: string;
  serviceable?: boolean;
  min_order?: number;
}

export interface DeliveryZoneResolutionResult {
  zone: DeliveryZone;
  isCovered: boolean;
  distanceKm?: number;
  deliveryFee: number; // Always 0 (Delivery is free in all zones)
  isEligibleForFreeDelivery: boolean;
  minOrderMet: boolean;
  estimatedTimeText: string;
  serviceNotice?: string;
}

/**
 * Phase 2: Server Distance Service Result
 * output: { serviceable, distance_km, eta_min, zone, min_order, approximate }
 */
export interface DistanceServiceResult {
  serviceable: boolean;
  distance_km: number;
  eta_min: number;
  zone: DeliveryZone | null;
  min_order: number;
  approximate: boolean;
  straight_line_km?: number;
  driving_duration_min?: number;
  prep_time_min?: number;
  cached?: boolean;
}

