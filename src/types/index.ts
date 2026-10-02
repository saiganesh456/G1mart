export * from './deliveryZone';

export type UserRole = 'customer' | 'admin';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  unit: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  description: string;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isBestDeal?: boolean;
  sku?: string;
  slug?: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
  subcategories: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  mobileNumber: string;
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
}

export type DeliverySlot =
  | 'Standard Delivery'
  | 'Morning Delivery'
  | 'Evening Delivery';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI'
  | 'Debit / Credit Card'
  | 'Net Banking';

export type OrderStatus =
  | 'Order Placed'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cash_on_delivery';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
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
  timeline: {
    status: OrderStatus;
    time: string;
    completed: boolean;
  }[];
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  memberSince?: string;
}
