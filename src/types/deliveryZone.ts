export type DeliveryZoneType = 'city' | 'rural_extended' | 'out_of_coverage';

export interface DeliveryZone {
  id: string;
  name: string;
  code: string;
  type: DeliveryZoneType;
  geographicCoverage: string;
  maxRadiusKm: number;
  estimatedMinDeliveryTime: number; // in minutes
  estimatedMaxDeliveryTime: number; // in minutes
  estimatedDeliveryTimeText: string; // e.g. "30 - 60 mins" or "Approx. 2 hours"
  deliveryFee: number; // in INR
  minOrderValue: number; // in INR
  freeDeliveryThreshold: number; // in INR
  isActive: boolean;
  pincodes: string[];
  supportedAreas: string[];
  description: string;
}

export interface DeliveryZoneResolutionResult {
  zone: DeliveryZone;
  isCovered: boolean;
  distanceKm?: number;
  deliveryFee: number;
  isEligibleForFreeDelivery: boolean;
  minOrderMet: boolean;
  estimatedTimeText: string;
  serviceNotice?: string;
}
