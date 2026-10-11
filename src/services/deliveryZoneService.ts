import { DeliveryZone, DeliveryZoneResolutionResult } from '../types/deliveryZone';

/**
 * G1 MART Configurable Delivery Zone Catalog
 * Business Location: Nellore, Andhra Pradesh, India
 * 
 * Business Rules (Phase 1):
 * 1. Delivery is FREE across all zones. No delivery fee.
 * 2. Max delivery radius: 30 km road distance.
 * 3. Minimum order grows with distance:
 *    - 0–5 km: ₹500
 *    - 5–10 km: ₹1000
 *    - 10–15 km: ₹1000
 *    - 15–30 km: ₹2000
 *    - over 30 km: Not serviceable
 */
export const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-0-5',
    name: '0–5 km (Local)',
    code: 'ZONE_0_5',
    type: 'city',
    geographicCoverage: 'Nellore Urban Center (within 5 km)',
    maxRadiusKm: 5,
    min_km: 0,
    max_km: 5,
    min_order: 500,
    active: true,
    estimatedMinDeliveryTime: 15,
    estimatedMaxDeliveryTime: 30,
    estimatedDeliveryTimeText: '15–30 mins',
    deliveryFee: 0,
    minOrderValue: 500,
    freeDeliveryThreshold: 0,
    isActive: true,
    pincodes: ['524001', '524002', '524003', '524004'],
    supportedAreas: [
      'Padarupalli',
      'Pogathota',
      'Magunta Layout',
      'Stonehousepet',
      'Santhapet',
      'Balaji Nagar',
      'VRC Centre / Trunk Road',
      'Dargamitta',
      'Vedayapalem',
      'Haranathapuram',
      'Ramalingapuram',
      'Childrens Park Road',
      'BV Nagar',
      'Podalakur Road (City limits)',
      'Fathekhanpet',
    ],
    description: 'Local express delivery in 15–30 mins. Free delivery, min order ₹500.',
  },
  {
    id: 'zone-5-10',
    name: '5–10 km (City)',
    code: 'ZONE_5_10',
    type: 'city',
    geographicCoverage: 'Greater Nellore (5–10 km)',
    maxRadiusKm: 10,
    min_km: 5,
    max_km: 10,
    min_order: 1000,
    active: true,
    estimatedMinDeliveryTime: 30,
    estimatedMaxDeliveryTime: 45,
    estimatedDeliveryTimeText: '30–45 mins',
    deliveryFee: 0,
    minOrderValue: 1000,
    freeDeliveryThreshold: 0,
    isActive: true,
    pincodes: ['524004', '524137'],
    supportedAreas: ['Kovur', 'Kallurpalli', 'Chinthareddypalem'],
    description: 'City delivery in 30–45 mins. Free delivery, min order ₹1000.',
  },
  {
    id: 'zone-10-15',
    name: '10–15 km (Suburban)',
    code: 'ZONE_10_15',
    type: 'rural_extended',
    geographicCoverage: 'Suburban mandals within 15 km',
    maxRadiusKm: 15,
    min_km: 10,
    max_km: 15,
    min_order: 1000,
    active: true,
    estimatedMinDeliveryTime: 45,
    estimatedMaxDeliveryTime: 60,
    estimatedDeliveryTimeText: '45–60 mins',
    deliveryFee: 0,
    minOrderValue: 1000,
    freeDeliveryThreshold: 0,
    isActive: true,
    pincodes: ['524314', '524320'],
    supportedAreas: ['Venkatachalam', 'Indukurpet', 'Damaramadugu', 'Kakupalli'],
    description: 'Suburban delivery in 45–60 mins. Free delivery, min order ₹1000.',
  },
  {
    id: 'zone-15-30',
    name: '15–30 km (Extended)',
    code: 'ZONE_15_30',
    type: 'rural_extended',
    geographicCoverage: 'Extended surrounding mandals (up to 30 km)',
    maxRadiusKm: 30,
    min_km: 15,
    max_km: 30,
    min_order: 2000,
    active: true,
    estimatedMinDeliveryTime: 60,
    estimatedMaxDeliveryTime: 90,
    estimatedDeliveryTimeText: 'Approx. 1–1.5 hours',
    deliveryFee: 0,
    minOrderValue: 2000,
    freeDeliveryThreshold: 0,
    isActive: true,
    pincodes: ['524305', '524316', '524345', '524344', '524315'],
    supportedAreas: ['Buchireddypalem', 'Kodavalur', 'Podalakur', 'Muthukur', 'Allur'],
    description: 'Doorstep grocery delivery within 30 km in approx. 1–1.5 hours. Free delivery, min order ₹2000.',
  },
];

/**
 * Standard Nellore quick-select area list for customer location pickers
 */
export const NELLORE_AREAS: string[] = [
  'Padarupalli, Beside Govt Hospital, Nellore - 524004',
  'Magunta Layout, Nellore - 524003',
  'Pogathota, Nellore - 524001',
  'VRC Centre, Trunk Road, Nellore - 524001',
  'Balaji Nagar, Nellore - 524002',
  'Stonehousepet, Nellore - 524002',
  'Haranathapuram, Nellore - 524003',
  'Dargamitta, Nellore - 524003',
  'Vedayapalem, Nellore - 524004',
  'Santhapet, Nellore - 524001',
  'BV Nagar, Nellore - 524004',
  'Kovur (Within 10 km) - 524137',
  'Buchireddypalem (Within 30 km) - 524305',
  'Venkatachalam (Within 15 km) - 524320',
  'Indukurpet (Within 15 km) - 524314',
];

class DeliveryZoneService {
  private zones: DeliveryZone[] = [...DEFAULT_DELIVERY_ZONES];

  /**
   * Return all configured delivery zones
   */
  public getAllZones(): DeliveryZone[] {
    return [...this.zones];
  }

  /**
   * Set zones from server
   */
  public setZones(newZones: DeliveryZone[]): void {
    if (Array.isArray(newZones) && newZones.length > 0) {
      this.zones = newZones.map((z) => ({
        ...z,
        deliveryFee: 0,
        minOrderValue: Number(z.min_order ?? z.minOrderValue ?? 500),
        isActive: z.active !== undefined ? Boolean(z.active) : Boolean(z.isActive ?? true),
      }));
    }
  }

  /**
   * Return active delivery zones
   */
  public getActiveZones(): DeliveryZone[] {
    return this.zones.filter((z) => (z.active !== undefined ? z.active : z.isActive ?? true));
  }

  /**
   * Get default delivery zone (0–5 km)
   */
  public getDefaultZone(): DeliveryZone {
    const defaultZone = this.zones.find((z) => (z.min_km === 0 || z.code === 'ZONE_0_5') && (z.active ?? z.isActive));
    return defaultZone || this.zones[0];
  }

  /**
   * Get delivery zone by ID
   */
  public getZoneById(id: string): DeliveryZone | undefined {
    return this.zones.find((z) => z.id === id);
  }

  /**
   * Resolve zone by road distance in km
   */
  public resolveZoneByDistance(distanceKm: number, maxRadiusKm = 30): DeliveryZone | null {
    if (distanceKm > maxRadiusKm) {
      return null;
    }
    const activeZones = this.getActiveZones();
    for (const z of activeZones) {
      const min = Number(z.min_km ?? 0);
      const max = Number(z.max_km ?? 30);
      if (min === 0) {
        if (distanceKm >= 0 && distanceKm <= max) return z;
      } else {
        if (distanceKm > min && distanceKm <= max) return z;
      }
    }
    const upper = activeZones.find((z) => Number(z.max_km) >= distanceKm);
    return upper || null;
  }

  /**
   * Fallback resolve zone based on text query (e.g. area name)
   */
  public resolveZone(locationQuery: string | undefined): DeliveryZone {
    if (!locationQuery || !locationQuery.trim()) {
      return this.getDefaultZone();
    }

    const query = locationQuery.toLowerCase();

    // 15–30 km check
    const z15to30 = this.zones.find((z) => z.id === 'zone-15-30' || z.code === 'ZONE_15_30');
    if (z15to30) {
      const matchPin = z15to30.pincodes?.some((pin) => query.includes(pin));
      const matchArea = z15to30.supportedAreas?.some((a) => query.includes(a.toLowerCase()));
      if (matchPin || matchArea) return z15to30;
    }

    // 10–15 km check
    const z10to15 = this.zones.find((z) => z.id === 'zone-10-15' || z.code === 'ZONE_10_15');
    if (z10to15) {
      const matchPin = z10to15.pincodes?.some((pin) => query.includes(pin));
      const matchArea = z10to15.supportedAreas?.some((a) => query.includes(a.toLowerCase()));
      if (matchPin || matchArea) return z10to15;
    }

    // 5–10 km check
    const z5to10 = this.zones.find((z) => z.id === 'zone-5-10' || z.code === 'ZONE_5_10');
    if (z5to10) {
      const matchPin = z5to10.pincodes?.some((pin) => query.includes(pin));
      const matchArea = z5to10.supportedAreas?.some((a) => query.includes(a.toLowerCase()));
      if (matchPin || matchArea) return z5to10;
    }

    // 0–5 km Local check
    return this.getDefaultZone();
  }

  /**
   * Evaluate full delivery resolution (fee is always 0, min order is checked against subtotal)
   */
  public evaluateDelivery(
    subtotal: number,
    locationQuery?: string,
    zoneOverride?: DeliveryZone,
    distanceKm?: number
  ): DeliveryZoneResolutionResult {
    let zone: DeliveryZone | null = zoneOverride || null;

    if (!zone && distanceKm !== undefined) {
      zone = this.resolveZoneByDistance(distanceKm);
    }
    if (!zone) {
      zone = this.resolveZone(locationQuery);
    }

    const isCovered = Boolean(zone && (zone.active ?? zone.isActive));
    const minOrder = Number(zone?.min_order ?? zone?.minOrderValue ?? 0);
    const minOrderMet = subtotal >= minOrder;

    return {
      zone,
      isCovered,
      deliveryFee: 0, // Always FREE delivery in all zones
      isEligibleForFreeDelivery: true,
      minOrderMet,
      estimatedTimeText: zone?.estimatedDeliveryTimeText || '15–30 mins',
      serviceNotice: !isCovered ? 'Service currently unavailable in this zone (>30 km)' : undefined,
    };
  }

  /**
   * Delivery fee is always 0 in all zones
   */
  public calculateDeliveryFee(_subtotal: number, _zone?: DeliveryZone): number {
    return 0;
  }

  /**
   * Admin configuration update (in-memory)
   */
  public updateZoneConfig(zoneId: string, updates: Partial<DeliveryZone>): void {
    this.zones = this.zones.map((zone) =>
      zone.id === zoneId ? { ...zone, ...updates } : zone
    );
  }
}

export const deliveryZoneService = new DeliveryZoneService();
