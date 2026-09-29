import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  ScreenName,
  Product,
  CartItem,
  Address,
  Order,
  OrderStatus,
  NotificationItem,
  Coupon,
  UserProfile,
  DeliverySlot,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ADDRESSES,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
} from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  screen: ScreenName;
  navigate: (screen: ScreenName, params?: { productId?: string; categoryId?: string; orderId?: string }) => void;
  goBack: () => void;
  canGoBack: boolean;

  // View mode
  isMobileFrame: boolean;
  toggleMobileFrame: () => void;

  // Auth
  isLoggedIn: boolean;
  user: UserProfile;
  loginWithPhone: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => boolean;
  loginWithGoogle: () => void;
  logout: () => void;

  // Location
  currentLocation: string;
  setCurrentLocation: (loc: string) => void;

  // Products
  products: Product[];
  selectedProduct: Product | null;
  selectedCategoryId: string;
  setSelectedCategoryId: (catId: string) => void;
  adminUpdateProduct: (product: Product) => void;
  adminAddProduct: (product: Omit<Product, 'id'>) => void;

  // Cart
  cart: CartItem[];
  savedForLater: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveForLaterAction: (productId: string) => void;
  moveToCartFromSaved: (productId: string) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  deliveryFee: number;
  cartTaxes: number;
  cartGrandTotal: number;

  // Coupons
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Addresses
  addresses: Address[];
  selectedAddress: Address | null;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  selectAddress: (id: string) => void;

  // Checkout & Orders
  selectedSlot: DeliverySlot;
  setSelectedSlot: (slot: DeliverySlot) => void;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: () => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, deliveryNote?: string) => void;
  cancelOrder: (orderId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [screen, setScreenState] = useState<ScreenName>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['home']);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile>({
    name: 'Sai Ganesh',
    phone: '+91 98765 43210',
    email: 'gummasaiganesh57@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    walletBalance: 350,
    memberSince: 'August 2025',
  });

  // Location State
  const [currentLocation, setCurrentLocation] = useState<string>('Jubilee Hills, Hyderabad - 500033');

  // Product & Category State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('fruits-vegetables');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[3], quantity: 2 }, // Amul milk
    { product: INITIAL_PRODUCTS[4], quantity: 1 }, // Britannia bread
  ]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-2', 'prod-6']);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(INITIAL_ADDRESSES[0].id);

  // Checkout Options
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>('Express Delivery (15-30 mins)');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(INITIAL_ORDERS[0].id);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle Navigation
  const navigate = (
    newScreen: ScreenName,
    params?: { productId?: string; categoryId?: string; orderId?: string }
  ) => {
    if (params?.productId) setSelectedProductId(params.productId);
    if (params?.categoryId) setSelectedCategoryId(params.categoryId);
    if (params?.orderId) setSelectedOrderId(params.orderId);

    setScreenState(newScreen);
    setScreenHistory((prev) => [...prev, newScreen]);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setScreenState(previous);
    } else {
      setScreenState('home');
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'admin') {
      navigate('admin_dashboard');
    } else if (newRole === 'delivery_partner') {
      navigate('delivery_dashboard');
    } else {
      navigate('home');
    }
  };

  const toggleMobileFrame = () => {
    setIsMobileFrame((prev) => !prev);
  };

  // Auth Actions
  const loginWithPhone = async (phone: string): Promise<boolean> => {
    setUser((prev) => ({ ...prev, phone: `+91 ${phone}` }));
    return true;
  };

  const verifyOtp = (otp: string): boolean => {
    if (otp === '1234' || otp === '123456' || otp.length >= 4) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const loginWithGoogle = () => {
    setIsLoggedIn(true);
    setUser((prev) => ({
      ...prev,
      name: 'Sai Ganesh',
      email: 'gummasaiganesh57@gmail.com',
    }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    navigate('login');
  };

  // Cart Calculations
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount) {
      cartDiscount = appliedCoupon.discountAmount;
    } else if (appliedCoupon.discountPercent) {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    }
  }

  // Free delivery for orders above ₹499
  const deliveryFee = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 30;
  const cartTaxes = Math.round(cartSubtotal * 0.05); // 5% GST on groceries
  const cartGrandTotal = Math.max(0, cartSubtotal - cartDiscount + deliveryFee + cartTaxes);

  // Cart Actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const saveForLaterAction = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      setSavedForLater((prev) => [...prev, item]);
    }
  };

  const moveToCartFromSaved = (productId: string) => {
    const item = savedForLater.find((i) => i.product.id === productId);
    if (item) {
      setSavedForLater((prev) => prev.filter((i) => i.product.id !== productId));
      addToCart(item.product, item.quantity);
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon Actions
  const availableCoupons = INITIAL_COUPONS;

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = availableCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid promo code' };
    }
    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Min order value of ₹${found.minOrder} required for ${found.code}`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wishlist Actions
  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  // Address Actions
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;

  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const id = `addr-${Date.now()}`;
    const fullAddr: Address = { ...newAddr, id };
    if (fullAddr.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })).concat(fullAddr));
    } else {
      setAddresses((prev) => [...prev, fullAddr]);
    }
    setSelectedAddressId(id);
  };

  const updateAddress = (updated: Address) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === updated.id) return updated;
        if (updated.isDefault) return { ...a, isDefault: false };
        return a;
      })
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      if (remaining.length > 0) setSelectedAddressId(remaining[0].id);
    }
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    setSelectedAddressId(id);
  };

  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
  };

  // Product Selection
  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  // Admin Actions
  const adminUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const adminAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    setProducts((prev) => [
      {
        ...newProduct,
        id,
      },
      ...prev,
    ]);
  };

  // Order Actions
  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  const placeOrder = (): Order => {
    const newOrderId = `GM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    const newOrder: Order = {
      id: newOrderId,
      date: dateStr,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
      address: selectedAddress || addresses[0],
      slot: selectedSlot,
      paymentMethod: selectedPaymentMethod,
      isPaid: selectedPaymentMethod !== 'Cash on Delivery',
      status: 'Order Placed',
      subtotal: cartSubtotal,
      discount: cartDiscount,
      deliveryFee,
      taxes: cartTaxes,
      grandTotal: cartGrandTotal,
      couponApplied: appliedCoupon?.code,
      deliveryBoy: {
        name: 'Suresh Kumar',
        phone: '+91 98480 12345',
        vehicleNumber: 'TS 08 FA 9920 (Electric Scooter)',
        rating: 4.9,
        currentLocation: 'G1 Mart Hub, Madhapur, Hyderabad',
      },
      timeline: [
        { status: 'Order Placed', time: 'Just now', completed: true },
        { status: 'Packed', time: 'In 5-10 mins', completed: false },
        { status: 'Out for Delivery', time: 'In 15 mins', completed: false },
        { status: 'Delivered', time: 'Estimated in 25 mins', completed: false },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    clearCart();

    // Add confirmation notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Order Placed Successfully! 🛒',
        message: `Order #${newOrder.id} has been confirmed. Delivering to ${newOrder.address.houseFlat}, ${newOrder.address.city}.`,
        time: 'Just now',
        read: false,
        type: 'order',
        orderId: newOrder.id,
      },
      ...prev,
    ]);

    navigate('order_success', { orderId: newOrder.id });
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    deliveryNote?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedTimeline = order.timeline.map((step) => {
          if (step.status === newStatus) {
            return { ...step, completed: true, time: 'Just now' };
          }
          if (
            (newStatus === 'Packed' && step.status === 'Order Placed') ||
            (newStatus === 'Out for Delivery' &&
              (step.status === 'Order Placed' || step.status === 'Packed')) ||
            (newStatus === 'Delivered')
          ) {
            return { ...step, completed: true };
          }
          return step;
        });

        return {
          ...order,
          status: newStatus,
          isPaid: newStatus === 'Delivered' ? true : order.isPaid,
          timeline: updatedTimeline,
        };
      })
    );

    // Notify user of status update
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Order #${orderId} ${newStatus}!`,
        message: deliveryNote || `Your order status has been updated to ${newStatus}.`,
        time: 'Just now',
        read: false,
        type: 'order',
        orderId,
      },
      ...prev,
    ]);
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Cancelled',
              timeline: [
                ...order.timeline,
                { status: 'Cancelled', time: 'Just now', completed: true },
              ],
            }
          : order
      )
    );
  };

  // Notification Actions
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        screen,
        navigate,
        goBack,
        canGoBack: screenHistory.length > 1 && screen !== 'home',
        isMobileFrame,
        toggleMobileFrame,
        isLoggedIn,
        user,
        loginWithPhone,
        verifyOtp,
        loginWithGoogle,
        logout,
        currentLocation,
        setCurrentLocation,
        products,
        selectedProduct,
        selectedCategoryId,
        setSelectedCategoryId,
        adminUpdateProduct,
        adminAddProduct,
        cart,
        savedForLater,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        saveForLaterAction,
        moveToCartFromSaved,
        clearCart,
        cartItemCount,
        cartSubtotal,
        cartDiscount,
        deliveryFee,
        cartTaxes,
        cartGrandTotal,
        availableCoupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        addresses,
        selectedAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        selectAddress,
        selectedSlot,
        setSelectedSlot,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        orders,
        activeOrder,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
