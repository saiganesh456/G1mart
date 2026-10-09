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
  name: 'G1 Mart Supermarket',

  /** One-line tagline shown in the site header / meta description */
  tagline: 'Fresh Groceries & Essentials Delivered in 15–30 Mins',

  /** Full physical address of the store hub */
  address: {
    line1: 'Govt Hospital, Beside Padarupalli',
    area: 'Padarupalli',
    city: 'Nellore',
    state: 'Andhra Pradesh',
    pincode: '524004',
    country: 'India',
  },

  /** Customer-facing contact details */
  contact: {
    phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+91 91107 59629',
    email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'support@g1mart.com',
    whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '919110759629',
  },

  /** UPI Payment Configuration */
  payment: {
    upiId: process.env.NEXT_PUBLIC_STORE_UPI_ID || '9110759629@ybl',
    upiPayeeName: 'G1 Mart',
  },

  /** Store operating hours (displayed to customers) */
  hours: {
    open: '10:00 AM',
    close: '5:00 PM',
    daysOpen: 'Monday – Sunday',
  },

  /** Delivery configuration — confirmed for Nellore hub */
  delivery: {
    /** Minimum order value (INR) required to place an order */
    minOrderValue: 0,

    /** Flat delivery fee (INR) for city zone */
    cityDeliveryFee: 25,

    /** Order value above which city-zone delivery is free */
    cityFreeDeliveryAbove: 499,

    /** Flat delivery fee (INR) for extended/rural zone */
    extendedDeliveryFee: 45,

    /** Human-readable estimated delivery window for city zone */
    cityEtaText: '15 – 30 mins',

    /** Human-readable estimated delivery window for extended zone */
    extendedEtaText: '45 – 60 mins',
  },
} as const;

export type StoreConfig = typeof STORE_CONFIG;
