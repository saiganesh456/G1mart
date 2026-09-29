export type UserRole = 'customer' | 'admin' | 'delivery_partner';

export type ScreenName =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'otp'
  | 'home'
  | 'search'
  | 'category'
  | 'product_details'
  | 'cart'
  | 'address_list'
  | 'add_address'
  | 'checkout'
  | 'payment'
  | 'order_success'
  | 'my_orders'
  | 'order_tracking'
  | 'wishlist'
  | 'profile'
  | 'notifications'
  | 'help_support'
  | 'admin_dashboard'
  | 'delivery_dashboard';

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
}

export type DeliverySlot =
  | 'Express Delivery (15-30 mins)'
  | 'Today Evening (5 PM - 8 PM)'
  | 'Tomorrow Morning (7 AM - 10 AM)'
  | 'Tomorrow Evening (5 PM - 8 PM)';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI'
  | 'UPI (Google Pay, PhonePe, Paytm)'
  | 'Debit / Credit Card'
  | 'Net Banking'
  | 'G1 Mart Wallet';

export type OrderStatus =
  | 'Order Placed'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

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
  date: string;
  items: OrderItem[];
  address: Address;
  slot: DeliverySlot;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
  couponApplied?: string;
  deliveryBoy?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
    currentLocation?: string;
  };
  timeline: {
    status: OrderStatus;
    time: string;
    completed: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'offer' | 'info';
  orderId?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountAmount?: number;
  discountPercent?: number;
  minOrder: number;
  maxDiscount?: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  walletBalance: number;
  memberSince: string;
}
