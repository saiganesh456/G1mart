export * from './deliveryZone';

export type UserRole = 'customer' | 'admin' | 'delivery_partner' | 'rider';

export type ImageSource = 'own_photo' | 'openfoodfacts' | 'manufacturer' | 'placeholder';
export type ImageStatus = 'VERIFIED' | 'PENDING' | 'MISSING' | 'NEEDS_REVIEW' | 'pending' | 'approved' | 'placeholder';

export interface Section {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_label: string;
  price: number;
  mrp: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  brand_id?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  variants?: ProductVariant[];
  brand: string;
  category: string;
  subCategory?: string;
  variant?: string;
  unit: string;
  price: number;
  priceConfirmed?: boolean;
  originalPrice: number;
  discountPercentage: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  imageUrl?: string | null;
  image_path?: string;
  image_source?: ImageSource;
  image_license?: string | null;
  image_status?: ImageStatus;
  imageStatus?: ImageStatus;
  image_match_note?: string;
  description: string;
  rating: number;
  reviewsCount: number;
  itemNumber?: number | string;
  isActive?: boolean;
  source_item_no?: number;
  source_name?: string;
  isPopular?: boolean;
  isBestDeal?: boolean;
  sku?: string;
  slug?: string;
  rawName?: string;
  barcode?: string;
  is_ambiguous?: boolean;
  ambiguity_note?: string;
  is_verified?: boolean;
  family_id?: string | null;
  pack_size?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string | null;
  category_id?: string | null;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
  description: string;
  itemCount: number;
  subcategories: string[];
  group?: string;
  parent_id?: string | null;
  display_order?: number;
  section_id?: string | null;
  tile_image_url?: string;
  sort_order?: number;
}

export interface SearchSynonym {
  id: string;
  term: string;
  synonyms: string[];
}

export interface CustomerSavedList {
  id: string;
  phone: string;
  name: string;
  type: 'monthly_essentials' | 'saved_template';
  items: {
    productId: string;
    quantity: number;
    addedAt: string;
  }[];
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Active variant selected by the user (if the product has variants) */
  variant?: ProductVariant;
  /** Variant ID shortcut for storage/serialization */
  variantId?: string;
}

export interface Address {
  id: string;
  fullName: string;
  mobileNumber: string;
  phone?: string;
  houseFlat: string;
  streetArea: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
  deliveryInstructions?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export type DeliverySlot =
  | 'Standard Delivery'
  | 'Morning Delivery'
  | 'Evening Delivery';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI'
  | 'Debit / Credit Card'
  | 'Net Banking'
  | 'upi'
  | 'cod'
  | 'card'
  | 'store';

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Packing'
  | 'Packed'
  | 'Rider Assigned'
  | 'Order Dispatched'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cash_on_delivery'
  | 'manual_verified'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  sizeLabel?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: 'phonepe' | 'cash_on_delivery' | 'manual_staff' | string;
  providerOrderId?: string;
  transactionId?: string;
  amount: number; // In rupees
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  rawResponse?: any;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  items: OrderItem[];
  address: Address;
  slot: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
  isPaid?: boolean;
  paidAmount?: number;
  paidAt?: string;
  markedPaidBy?: string;
  providerOrderId?: string;
  transactionId?: string;
  userId?: string;
  userEmail?: string;
  assignedRider?: {
    id?: string;
    name: string;
    phone?: string;
    vehicleNumber?: string;
    assignedAt?: string;
  };
  timeline: {
    status: OrderStatus;
    time: string;
    completed: boolean;
  }[];
}

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  memberSince?: string;
  role?: UserRole;
}

export interface StaffMember {
  id: string;
  email: string;
  role: 'admin' | 'rider';
  name?: string;
  phone?: string;
  vehicleNumber?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

