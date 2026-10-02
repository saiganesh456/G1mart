import { DeliveryZone, DeliveryZoneResolutionResult } from '../types/deliveryZone';

/**
 * G1 MART Configurable Delivery Zone Catalog
 * Business Location: Nellore, Andhra Pradesh, India
 * 
 * Rules:
 * 1. Nellore City: Expected delivery 30 minutes to 1 hour.
 * 2. Areas/villages outside Nellore City (within ~30 km): Expected delivery approx. 2 hours.
 * 
 * Note: Configurable values below are not hardcoded in UI components;
 * UI screens dynamically consume delivery parameters through this service.
 */
export const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-nellore-city',
    name: 'Nellore City',
    code: 'NELLORE_CITY',
    type: 'city',
    geographicCoverage: 'Nellore Municipal Corporation & Urban Center',
    maxRadiusKm: 10,
    estimatedMinDeliveryTime: 30,
    estimatedMaxDeliveryTime: 60,
    estimatedDeliveryTimeText: '30 mins - 1 hour',
    deliveryFee: 30,
    minOrderValue: 149,
    freeDeliveryThreshold: 499,
    isActive: true,
    pincodes: ['524001', '524002', '524003', '524004'],
    supportedAreas: [
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
    description: 'Superfast doorstep delivery across Nellore City in 30 minutes to 1 hour.',
  },
  {
    id: 'zone-nellore-extended-30km',
    name: 'Nellore Extended (Within 30 km)',
    code: 'NELLORE_RURAL_30KM',
    type: 'rural_extended',
    geographicCoverage: 'Surrounding mandals & villages within ~30 km radius of Nellore',
    maxRadiusKm: 30,
    estimatedMinDeliveryTime: 90,
    estimatedMaxDeliveryTime: 120,
    estimatedDeliveryTimeText: 'Approx. 2 hours',
    deliveryFee: 50,
    minOrderValue: 249,
    freeDeliveryThreshold: 799,
    isActive: true,
    pincodes: [
      '524137', // Kovur
      '524305', // Buchireddypalem
      '524314', // Indukurpet
      '524320', // Venkatachalam
      '524316', // Kodavalur
      '524345', // Podalakur
      '524344', // Muthukur
      '524315', // Allur
    ],
    supportedAreas: [
      'Kovur',
      'Buchireddypalem',
      'Indukurpet',
      'Venkatachalam',
      'Kodavalur',
      'Podalakur (Rural)',
      'Muthukur',
      'Allur',
      'Damaramadugu',
      'Kakupalli',
      'Kanuparthipadu',
    ],
    description: 'Doorstep grocery delivery to villages and surrounding areas within 30 km of Nellore in approx. 2 hours.',
  },
];

/**
 * Standard Nellore quick-select area list for customer location pickers
 */
export const NELLORE_AREAS: string[] = [
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
  'Kovur (Within 30 km) - 524137',
  'Buchireddypalem (Within 30 km) - 524305',
  'Venkatachalam (Within 30 km) - 524320',
  'Indukurpet (Within 30 km) - 524314',
];

export const NELLORE_POPULAR_HUBS = [
  { name: 'Pogathota Central Hub', area: 'Pogathota, Nellore', zone: 'Nellore City' },
  { name: 'Magunta Layout Hub', area: 'Magunta Layout, Nellore', zone: 'Nellore City' },
  { name: 'Stonehousepet Hub', area: 'Stonehousepet, Nellore', zone: 'Nellore City' },
  { name: 'Vedayapalem Express', area: 'Vedayapalem, Nellore', zone: 'Nellore City' },
  { name: 'Kovur Rural Hub', area: 'Kovur (Rural/Outskirts)', zone: 'Within 30 km' },
  { name: 'Buchireddypalem Hub', area: 'Buchireddypalem', zone: 'Within 30 km' },
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
   * Return active delivery zones
   */
  public getActiveZones(): DeliveryZone[] {
    return this.zones.filter((z) => z.isActive);
  }

  /**
   * Get default delivery zone (Nellore City)
   */
  public getDefaultZone(): DeliveryZone {
    const defaultZone = this.zones.find((z) => z.code === 'NELLORE_CITY' && z.isActive);
    return defaultZone || this.zones[0];
  }

  /**
   * Get delivery zone by ID
   */
  public getZoneById(id: string): DeliveryZone | undefined {
    return this.zones.find((z) => z.id === id);
  }

  /**
   * Resolve appropriate delivery zone based on an address, city, area or pincode string
   */
  public resolveZone(locationQuery: string | undefined): DeliveryZone {
    if (!locationQuery || !locationQuery.trim()) {
      return this.getDefaultZone();
    }

    const query = locationQuery.toLowerCase();

    // 1. Check for extended zone pincodes first
    const extendedZone = this.zones.find((z) => z.code === 'NELLORE_RURAL_30KM');
    if (extendedZone) {
      const matchesExtendedPincode = extendedZone.pincodes.some((pin) => query.includes(pin));
      const matchesExtendedArea = extendedZone.supportedAreas.some((area) =>
        query.includes(area.toLowerCase())
      );
      if (matchesExtendedPincode || matchesExtendedArea) {
        return extendedZone;
      }
    }

    // 2. Check for city zone pincodes & areas
    const cityZone = this.zones.find((z) => z.code === 'NELLORE_CITY');
    if (cityZone) {
      const matchesCityPincode = cityZone.pincodes.some((pin) => query.includes(pin));
      const matchesCityArea = cityZone.supportedAreas.some((area) =>
        query.includes(area.toLowerCase())
      );
      if (matchesCityPincode || matchesCityArea || query.includes('nellore')) {
        return cityZone;
      }
    }

    // Default fallback to City Zone
    return this.getDefaultZone();
  }

  /**
   * Evaluate full delivery resolution (fee, min order, eligibility) for a given cart subtotal and location
   */
  public evaluateDelivery(
    subtotal: number,
    locationQuery?: string,
    zoneOverride?: DeliveryZone
  ): DeliveryZoneResolutionResult {
    const zone = zoneOverride || this.resolveZone(locationQuery);
    const isCovered = zone.isActive;
    const isEligibleForFreeDelivery = subtotal >= zone.freeDeliveryThreshold;
    const deliveryFee = subtotal === 0 || isEligibleForFreeDelivery ? 0 : zone.deliveryFee;
    const minOrderMet = subtotal >= zone.minOrderValue;

    return {
      zone,
      isCovered,
      deliveryFee,
      isEligibleForFreeDelivery,
      minOrderMet,
      estimatedTimeText: zone.estimatedDeliveryTimeText,
      serviceNotice: !isCovered ? 'Service currently unavailable in this zone' : undefined,
    };
  }

  /**
   * Calculate delivery fee based on cart subtotal and zone
   */
  public calculateDeliveryFee(subtotal: number, zone?: DeliveryZone): number {
    const targetZone = zone || this.getDefaultZone();
    if (subtotal === 0) return 0;
    if (subtotal >= targetZone.freeDeliveryThreshold) return 0;
    return targetZone.deliveryFee;
  }

  /**
   * Admin configuration update (in-memory for Phase 1)
   */
  public updateZoneConfig(zoneId: string, updates: Partial<DeliveryZone>): void {
    this.zones = this.zones.map((zone) =>
      zone.id === zoneId ? { ...zone, ...updates } : zone
    );
  }
}

export const deliveryZoneService = new DeliveryZoneService();
