/**
 * G1 Mart — Store Configuration
 *
 * TODO (Phase 0 – Owner sign-off required before launch):
 * Replace every TODO_* value with answers from the store owner.
 * See SPEC.md Section 17 for the full list of open decisions.
 * Do NOT invent values — ask the owner.
 */
export const STORE_CONFIG = {
  /** Exact trading name as it appears on the shop front / GST registration */
  name: 'TODO_STORE_NAME',

  /** One-line tagline shown in the site header / meta description */
  tagline: 'TODO_TAGLINE',

  /** Full physical address of the store hub */
  address: {
    line1: 'TODO_ADDRESS_LINE1',
    area: 'TODO_AREA',
    city: 'TODO_CITY',
    state: 'TODO_STATE',
    pincode: 'TODO_PINCODE',
    country: 'India',
  },

  /** Customer-facing contact details */
  contact: {
    phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+91 98765 43210',
    email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'support@g1mart.com',
    whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '919876543210',
  },

  /** UPI Payment Configuration */
  payment: {
    upiId: process.env.NEXT_PUBLIC_STORE_UPI_ID || '9346389857-3@ybl',
    upiPayeeName: 'G1 Mart',
  },

  /** Store operating hours (displayed to customers) */
  hours: {
    open: 'TODO_OPEN_TIME',   // e.g. "6:00 AM"
    close: 'TODO_CLOSE_TIME', // e.g. "11:00 PM"
    daysOpen: 'TODO_DAYS',    // e.g. "Monday – Sunday"
  },

  /** Delivery configuration — confirmed by owner before launch */
  delivery: {
    /**
     * Minimum order value (INR) required to place an order.
     * TODO: Confirm with owner.
     */
    minOrderValue: 0, // TODO_MIN_ORDER_VALUE

    /**
     * Flat delivery fee (INR) for city zone.
     * TODO: Confirm with owner.
     */
    cityDeliveryFee: 0, // TODO_CITY_DELIVERY_FEE

    /**
     * Order value above which city-zone delivery is free.
     * TODO: Confirm with owner.
     */
    cityFreeDeliveryAbove: 0, // TODO_FREE_DELIVERY_THRESHOLD

    /**
     * Flat delivery fee (INR) for extended/rural zone.
     * TODO: Confirm with owner.
     */
    extendedDeliveryFee: 0, // TODO_EXTENDED_DELIVERY_FEE

    /**
     * Human-readable estimated delivery window for city zone.
     * TODO: Confirm with owner — do NOT promise faster than you can deliver.
     */
    cityEtaText: 'TODO_CITY_ETA', // e.g. "30 mins – 1 hour"

    /**
     * Human-readable estimated delivery window for extended zone.
     * TODO: Confirm with owner.
     */
    extendedEtaText: 'TODO_EXTENDED_ETA', // e.g. "Approx. 2 hours"
  },
} as const;

export type StoreConfig = typeof STORE_CONFIG;
