'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  Users,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Store,
  ChevronRight,
  ShieldCheck,
  X,
  Settings,
  FileText,
  CheckSquare,
} from 'lucide-react';
import type { Category, Product, Order, StaffMember } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

// Tab components
import HomeTab from '@/components/admin/tabs/HomeTab';
import OrdersTab from '@/components/admin/tabs/OrdersTab';
import OrderDetailsPanel from '@/components/admin/tabs/OrderDetailsPanel';
import InventoryTab from '@/components/admin/tabs/InventoryTab';
import ProductDetailsPanel from '@/components/admin/tabs/ProductDetailsPanel';
import MobileBottomNav from '@/components/admin/tabs/MobileBottomNav';
import StaffManagementTab from '@/components/admin/StaffManagementTab';
import ShootListTab from '@/components/admin/tabs/ShootListTab';
import SettingsTab from '@/components/admin/tabs/SettingsTab';
import SlipOrdersTab from '@/components/admin/tabs/SlipOrdersTab';
import { Camera } from 'lucide-react';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';
import { formatToIST } from '@/lib/dateUtils';

const STATUS_RANK: Record<string, number> = {
  'Order Placed': 1,
  'New': 1,
  'Confirmed': 2,
  'Packing': 3,
  'Packed': 4,
  'Rider Assigned': 5,
  'Order Dispatched': 6,
  'Out for Delivery': 6,
  'Delivered': 7,
  'Cancelled': 8,
};

const BLANK_NEW_PRODUCT: Product = {
  id: '',
  name: '',
  brand: 'G1 Mart',
  price: 0,
  originalPrice: 0,
  discountPercentage: 0,
  unit: '1 unit',
  inStock: true,
  stockCount: 15,
  category: 'grocery-staples',
  imageUrl: '/products/placeholder.svg',
  image: '/products/placeholder.svg',
  description: '',
  rating: 4.8,
  reviewsCount: 0,
} as any as Product;

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminDashboardClient({ initialProducts = [], categories = [] }: Props) {
  const { user } = useAuth();

  const getAdminHeaders = (): Record<string, string> => {
    let email = user?.email;
    if (!email && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('g1mart_user_session');
        if (stored) email = JSON.parse(stored).email;
      } catch {}
    }
    return {
      'x-user-email': (email || 'sureshdega466@gmail.com').toLowerCase().trim(),
      'x-admin-client': 'true',
    };
  };

  // Navigation & Active View state
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'slips' | 'packer' | 'inventory' | 'staff' | 'shoot-list' | 'settings'>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('All');
  const [activeSlipId, setActiveSlipId] = useState<string | null>(null);
  const [inventoryStockFilter, setInventoryStockFilter] = useState<string>('All');
  const [homeNotice, setHomeNotice] = useState<string | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const ordersRef = useRef<Order[]>(orders);
  ordersRef.current = orders;
  const productsRef = useRef<Product[]>(products);
  productsRef.current = products;

  const [staffMembers, setStaffMembers] = useState<{ admins: StaffMember[]; riders: StaffMember[] }>({
    admins: [],
    riders: [],
  });

  // Notifications & Quick-Commerce Alert Engine
  const {
    notifyWelcome,
    notifyApkDownloaded,
    notifyOrderStatus,
    requestPushPermission,
    isPermissionGranted,
  } = useNotification();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioEnabledRef = useRef(true);
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [testingPush, setTestingPush] = useState(false);

  const handleEnablePush = async () => {
    try {
      const ok = await requestPushPermission();
      if (ok) {
        setPushStatusMessage('Background alerts enabled! Your phone will alert you when orders arrive.');
        setTimeout(() => setPushStatusMessage(null), 5000);
      } else {
        alert('Notification permission was not granted. Please allow notifications in your browser settings.');
      }
    } catch (e: any) {
      alert('Error enabling notifications: ' + e.message);
    }
  };

  const handleTestBackgroundPush = async () => {
    try {
      setTestingPush(true);
      const res = await fetch('/api/notifications/test-admin-push', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPushStatusMessage(data.message || 'Sent test alert!');
        setTimeout(() => setPushStatusMessage(null), 6000);
      } else {
        alert(data.error || 'Failed to send test alert');
      }
    } catch (e: any) {
      alert('Error testing alert: ' + e.message);
    } finally {
      setTestingPush(false);
    }
  };


  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmLoopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmActiveRef = useRef<boolean>(false);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const seenSlipIdsRef = useRef<Set<string>>(new Set());
  const isInitialFetchDoneRef = useRef<boolean>(false);
  const isInitialSlipFetchDoneRef = useRef<boolean>(false);
  const pendingOrderIdRef = useRef<string | null>(null);

  // Initialize and unlock audio on first user touch/click
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        alarmAudioRef.current = new Audio('/new_order_voice.wav');
        alarmAudioRef.current.load();
      } catch {}

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = () => {
            try {
              window.speechSynthesis.getVoices();
            } catch {}
          };
        } catch {}
      }

      const unlockAudio = () => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new AudioCtx();
            }
            if (audioCtxRef.current.state === 'suspended') {
              audioCtxRef.current.resume();
            }
          }
          if (alarmAudioRef.current) {
            alarmAudioRef.current.load();
          }
        } catch {}
      };

      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
      return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
    }
  }, []);

  // Web Audio chime
  const playWebAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;

        // Tone 1: High crisp ding (B5 note / 987.77 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(987.77, now);
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Tone 2: Bright harmonic chime (E6 note / 1318.51 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);
        gain2.gain.setValueAtTime(0.55, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.85);
      }
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Repeating loud voice announcement ("New order! New order! New order!")
  // Strictly plays ONE clear, single voice without overlapping speech synthesis or chimes
  const playFemaleVoiceLoop = () => {
    if (!alarmActiveRef.current) return;

    try {
      if (!alarmAudioRef.current) {
        alarmAudioRef.current = new Audio('/new_order_voice.wav');
      }
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.volume = 1.0;
      const playPromise = alarmAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback only if the audio element failed to play (e.g. autoplay restriction)
          try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance('New order! New order! New order!');
              utterance.volume = 1.0;
              utterance.rate = 0.95;
              utterance.pitch = 1.1;

              const voices = window.speechSynthesis.getVoices();
              if (voices && voices.length > 0) {
                const femaleVoice =
                  voices.find((v) => {
                    const n = v.name.toLowerCase();
                    return (
                      n.includes('female') ||
                      n.includes('zira') ||
                      n.includes('samantha') ||
                      n.includes('karen') ||
                      (v.lang.startsWith('en') && (n.includes('woman') || n.includes('girl')))
                    );
                  }) ||
                  voices.find((v) => v.lang.startsWith('en')) ||
                  voices[0];
                if (femaleVoice) utterance.voice = femaleVoice;
              }

              window.speechSynthesis.speak(utterance);
            }
          } catch {}
        });
      }
    } catch {}

    // Repeat cleanly every 5.0 seconds (audio is ~4s, ensuring 1s pause and zero overlapping)
    if (alarmLoopTimerRef.current) {
      clearTimeout(alarmLoopTimerRef.current);
    }
    alarmLoopTimerRef.current = setTimeout(() => {
      if (alarmActiveRef.current) {
        playFemaleVoiceLoop();
      }
    }, 5000);
  };

  // Start the alarm
  const startAlarm = (order: Order) => {
    setNewOrderAlert(order);

    if (!audioEnabledRef.current) {
      return;
    }

    // Strict guard: if alarm is already ringing, avoid starting concurrent audio loops
    if (alarmActiveRef.current) {
      return;
    }

    alarmActiveRef.current = true;
    setIsAlarmRinging(true);

    if (alarmLoopTimerRef.current) {
      clearTimeout(alarmLoopTimerRef.current);
    }

    playFemaleVoiceLoop();

    // Trigger background native system notification if tab is backgrounded
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if (document.visibilityState !== 'visible' || !document.hasFocus()) {
          const shortId = order.id.startsWith('G1-') ? order.id : `#${order.id.slice(-6)}`;
          const notif = new Notification(`🚨 NEW ORDER: ${shortId}`, {
            body: `₹${order.grandTotal} • ${order.items?.length || 1} items • Tap to open order`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: `admin_new_order_${order.id}`,
          });
          notif.onclick = () => {
            window.focus();
            stopAlarm();
            setActiveTab('orders');
            setSelectedOrder(order);
            try {
              window.history.pushState(
                { view: 'order', orderId: order.id, tab: 'orders', adminBack: true },
                '',
                `/admin?tab=orders&orderId=${encodeURIComponent(order.id)}`
              );
            } catch {}
            notif.close();
          };
        }
      } catch {}
    }

    // Auto-stop alarm after 20 seconds so it never loops forever
    setTimeout(() => {
      if (alarmActiveRef.current) {
        stopAlarm();
      }
    }, 20000);
  };

  // Start the alarm for new slip orders
  const startSlipAlarm = (slip: any) => {
    const slipAlertObj = {
      id: slip.id,
      isSlip: true,
      customerName: slip.customer_name || slip.customerName || 'Customer',
      customerPhone: slip.customer_phone || slip.customerPhone || '',
      imagesCount: slip.images?.length || 1,
      address: slip.address || 'Nellore',
      grandTotal: slip.estimated_total || slip.final_total || 0,
      createdAt: slip.created_at || new Date().toISOString(),
    };
    setNewOrderAlert(slipAlertObj);

    if (!audioEnabledRef.current) {
      return;
    }

    if (alarmActiveRef.current) {
      return;
    }

    alarmActiveRef.current = true;
    setIsAlarmRinging(true);

    if (alarmLoopTimerRef.current) {
      clearTimeout(alarmLoopTimerRef.current);
    }

    playFemaleVoiceLoop();

    // Trigger background native system notification if tab is backgrounded
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if (document.visibilityState !== 'visible' || !document.hasFocus()) {
          const shortId = slip.id.startsWith('SLIP-') ? slip.id : `#${slip.id}`;
          const notif = new Notification(`📸 NEW GROCERY SLIP: ${shortId}`, {
            body: `${slipAlertObj.customerName} (${slipAlertObj.customerPhone}) • ${slipAlertObj.imagesCount} photo slip(s) • Tap to view & call`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: `admin_new_slip_${slip.id}`,
          });
          notif.onclick = () => {
            window.focus();
            stopAlarm();
            setActiveTab('slips');
            try {
              window.history.pushState(
                { view: 'slip', slipId: slip.id, tab: 'slips', adminBack: true },
                '',
                `/admin?tab=slips&slipId=${encodeURIComponent(slip.id)}`
              );
            } catch {}
            notif.close();
          };
        }
      } catch {}
    }

    setTimeout(() => {
      if (alarmActiveRef.current) {
        stopAlarm();
      }
    }, 20000);
  };

  // Stop the alarm instantly
  const stopAlarm = () => {
    alarmActiveRef.current = false;
    setIsAlarmRinging(false);

    if (alarmLoopTimerRef.current) {
      clearTimeout(alarmLoopTimerRef.current);
      alarmLoopTimerRef.current = null;
    }

    try {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    } catch {}

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  };

  // Test the loud female voice alert
  const handleTestVoiceAlert = () => {
    setAudioEnabled(true);
    const mockOrder: Order = {
      id: `G1-${Math.floor(100000 + Math.random() * 900000)}`,
      date: 'Just now',
      slot: 'Standard Delivery',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'pending',
      status: 'Order Placed',
      subtotal: 145,
      discount: 0,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 145,
      items: [
        {
          productId: 'p-test',
          productName: 'Ariel Matic Front Load Detergent',
          unit: '1 kg',
          price: 145,
          quantity: 1,
          image: '/products/placeholder.svg',
        },
      ],
      address: {
        id: 'a-test',
        fullName: 'Test Customer (Nellore)',
        mobileNumber: '9876543210',
        houseFlat: 'Flat 402',
        streetArea: 'Magunta Layout',
        landmark: 'Near Supermarket',
        city: 'Nellore',
        state: 'Andhra Pradesh',
        pincode: '524003',
        type: 'Home',
        isDefault: true,
      },
      timeline: [{ status: 'Order Placed', time: 'Just now', completed: true }],
    };
    startAlarm(mockOrder);
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (!next) {
      stopAlarm();
    }
  };

  // Helper to parse Supabase row
  const formatSupabaseRowToOrder = (row: any): Order => {
    const address =
      row.address ||
      row.delivery_address || {
        fullName: 'Customer',
        mobileNumber: '',
        houseFlat: '',
        streetArea: '',
        landmark: '',
        city: 'Nellore',
        state: 'Andhra Pradesh',
        pincode: '',
        type: 'Home',
        isDefault: true,
      };

    return {
      id: row.id,
      orderNumber: row.order_number || row.id,
      date: formatToIST(row.date || row.created_at),
      items: (() => {
        const raw = Array.isArray(row.order_items) && row.order_items.length > 0
          ? row.order_items
          : Array.isArray(row.items) && row.items.length > 0
          ? row.items
          : Array.isArray(row.address?._items)
          ? row.address._items
          : [];

        return raw.map((oi: any) => {
          const pid = (oi.product_id || oi.productId || oi.id || '').trim();
          const rawName = (oi.product_name || oi.productName || oi.name || '').trim();

          const match =
            MIGRATED_PRODUCT_LIST.find(
              (p) =>
                p.id === pid ||
                p.id === rawName ||
                p.sku === rawName ||
                p.slug === rawName ||
                p.sku === pid
            ) ||
            MIGRATED_PRODUCT_LIST.find(
              (p) => rawName && p.name.toLowerCase() === rawName.toLowerCase()
            ) ||
            (rawName && rawName.length > 3
              ? MIGRATED_PRODUCT_LIST.find(
                  (p) =>
                    p.name.toLowerCase().includes(rawName.toLowerCase()) ||
                    rawName.toLowerCase().includes(p.name.toLowerCase())
                )
              : null);

          const productName =
            match?.name ||
            (rawName.startsWith('g1-') ? `Grocery Item (${rawName})` : rawName) ||
            'Catalog Item';

          const image =
            oi.image_url ||
            oi.image ||
            match?.imageUrl ||
            match?.image ||
            (match as any)?.image_url ||
            '/products/placeholder.svg';

          const unit = oi.unit || match?.unit || '1 unit';

          return {
            productId: pid || match?.id || 'p-1',
            productName,
            unit,
            price: Number(oi.unit_price || oi.price || match?.price || 0),
            quantity: Number(oi.quantity || 1),
            image,
          };
        });
      })(),
      address,
      slot: row.slot || row.delivery_slot || 'Standard Delivery',
      paymentMethod: row.payment_method || 'Cash on Delivery',
      paymentStatus: row.payment_status || (row.is_paid ? 'completed' : 'pending'),
      status: (row.address?._status || row.status || 'Order Placed') as any,
      subtotal: (() => {
        const rawItems = Array.isArray(row.order_items) && row.order_items.length > 0
          ? row.order_items
          : Array.isArray(row.items) && row.items.length > 0
          ? row.items
          : Array.isArray(row.address?._items)
          ? row.address._items
          : [];
        const sum = rawItems.reduce((acc: number, oi: any) => acc + ((Number(oi.unit_price || oi.price) || 0) * (Number(oi.quantity) || 1)), 0);
        return sum > 0 ? sum : Number(row.subtotal || row.total_amount || 0);
      })(),
      discount: Number(row.discount || row.discount_amount || 0),
      deliveryFee: Number(row.delivery_fee || 0),
      taxes: Number(row.taxes || 0),
      grandTotal: (() => {
        const rawItems = Array.isArray(row.order_items) && row.order_items.length > 0
          ? row.order_items
          : Array.isArray(row.items) && row.items.length > 0
          ? row.items
          : Array.isArray(row.address?._items)
          ? row.address._items
          : [];
        const sum = rawItems.reduce((acc: number, oi: any) => acc + ((Number(oi.unit_price || oi.price) || 0) * (Number(oi.quantity) || 1)), 0);
        const codFee = Number(row.cod_fee || row.codFee || address?._codFee || address?.codFee || (row.payment_method === 'Cash on Delivery' && !String(row.slot || '').toLowerCase().includes('pickup') ? 50 : 0));
        if (sum > 0 && (Number(row.grand_total || 0) < sum || Math.abs(Number(row.grand_total || 0) - (sum + codFee)) > 5)) {
          return sum + Number(row.delivery_fee || 0) + codFee;
        }
        return Number(row.grand_total || row.total_amount || sum || 0);
      })(),
      isPaid: Boolean(row.is_paid),
      paidAmount: Number(row.paid_amount || 0),
      timeline: row.address?._timeline || [{ status: 'Order Placed', time: 'Just Now', completed: true }],
    };
  };

  // Fetch a specific order directly by ID (used for instant deep-linking from push notifications)
  const fetchSpecificOrder = async (orderId: string): Promise<Order | null> => {
    if (!orderId) return null;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success && data.order) {
        const row = data.order;
        const formatted: Order = {
          ...row,
          date: formatToIST(row.date || row.created_at),
        };
        setSelectedOrder(formatted);
        setActiveTab('orders');
        setOrders((prev) => {
          if (prev.some((o) => o.id === formatted.id)) return prev;
          return [formatted, ...prev];
        });
        return formatted;
      }
    } catch (err) {
      console.warn('[Admin] Failed to fetch specific order:', err);
    }
    return null;
  };

  // State interface for hierarchical step-by-step admin navigation
  type AdminTabType = 'home' | 'orders' | 'slips' | 'packer' | 'inventory' | 'staff' | 'shoot-list' | 'settings';

  interface AdminViewState {
    tab: AdminTabType;
    orderId?: string | null;
    productId?: string | null;
    slipId?: string | null;
    status?: string | null;
    stockFilter?: string | null;
  }

  const buildAdminUrl = (state: AdminViewState): string => {
    const params = new URLSearchParams();
    if (state.tab && state.tab !== 'home') {
      params.set('tab', state.tab);
    }
    if (state.orderId) {
      params.set('orderId', state.orderId);
    }
    if (state.productId) {
      params.set('productId', state.productId);
    }
    if (state.slipId) {
      params.set('slipId', state.slipId);
    }
    if (state.status && state.status !== 'All') {
      params.set('status', state.status);
    }
    if (state.stockFilter && state.stockFilter !== 'All') {
      params.set('stockFilter', state.stockFilter);
    }
    const qs = params.toString();
    return qs ? `/admin?${qs}` : '/admin';
  };

  const parseAdminUrl = (search: string): AdminViewState => {
    const params = new URLSearchParams(search);
    const rawTab = params.get('tab') || 'home';
    const validTabs: AdminTabType[] = [
      'home',
      'orders',
      'slips',
      'packer',
      'inventory',
      'staff',
      'shoot-list',
      'settings',
    ];
    const tab: AdminTabType = validTabs.includes(rawTab as any) ? (rawTab as AdminTabType) : 'home';
    const orderId = params.get('orderId') || params.get('order_id') || params.get('id') || null;
    const productId = params.get('productId') || params.get('product_id') || null;
    const slipId = params.get('slipId') || params.get('slip_id') || null;
    const status = params.get('status') || params.get('filter') || null;
    const stockFilter = params.get('stockFilter') || null;

    return {
      tab,
      orderId,
      productId,
      slipId,
      status,
      stockFilter,
    };
  };

  // Synchronize view state with URL parameters & history pop
  const applyAdminState = (state: AdminViewState, ordersList?: Order[], productsList?: Product[]) => {
    setActiveTab(state.tab);
    setIsCreatingProduct(false);

    if (state.status) {
      setOrdersStatusFilter(state.status);
    } else if (state.tab === 'home') {
      setOrdersStatusFilter('All');
    }

    if (state.stockFilter) {
      setInventoryStockFilter(state.stockFilter);
    } else if (state.tab === 'home') {
      setInventoryStockFilter('All');
    }

    setActiveSlipId(state.slipId || null);

    if (state.orderId) {
      pendingOrderIdRef.current = state.orderId;
      const listToCheck = ordersList || ordersRef.current || orders;
      const existing = listToCheck.find(
        (o) => o.id === state.orderId || (o as any).orderNumber === state.orderId
      );
      if (existing) {
        setSelectedOrder(existing);
      } else {
        fetchSpecificOrder(state.orderId);
      }
    } else {
      setSelectedOrder(null);
      pendingOrderIdRef.current = null;
    }

    if (state.productId) {
      const listToCheck = productsList || productsRef.current || products;
      const existing = listToCheck.find((p) => String(p.id) === String(state.productId));
      if (existing) {
        setSelectedProduct(existing);
      }
    } else {
      setSelectedProduct(null);
    }
  };

  // Push forward in browser history (step by step)
  const pushAdminState = (next: AdminViewState) => {
    stopAlarm();
    const url = buildAdminUrl(next);
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search;
      const currentStep = (window.history.state?.step as number) || 0;
      if (currentUrl !== url) {
        const nextStep = currentStep + 1;
        window.history.pushState(
          { adminApp: true, step: nextStep, ...next },
          '',
          url
        );
      }
    }
    applyAdminState(next);
  };

  // Step-out backward navigation
  const navigateBack = (fallbackTab: AdminTabType = 'home') => {
    stopAlarm();
    if (typeof window !== 'undefined') {
      const currentStep = (window.history.state?.step as number) || 0;
      if (currentStep > 0 && window.history.length > 1) {
        window.history.back();
        return;
      }
    }

    // Stepwise fallback if browser history stack was not initialized
    if (selectedOrder) {
      pushAdminState({ tab: 'orders', status: ordersStatusFilter });
    } else if (selectedProduct) {
      pushAdminState({ tab: 'inventory', stockFilter: inventoryStockFilter });
    } else if ((activeTab === 'slips' || activeTab === 'packer') && activeSlipId) {
      pushAdminState({ tab: activeTab });
    } else if (activeTab === 'orders' && ordersStatusFilter !== 'All') {
      pushAdminState({ tab: 'orders', status: 'All' });
    } else if (activeTab !== 'home') {
      pushAdminState({ tab: 'home' });
    }
  };

  // Fetch Orders from Server directly
  const fetchOrders = async (silent = false) => {
    try {
      const res = await fetch(`/api/admin/orders?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      const serverList: Order[] = data.success && Array.isArray(data.orders) ? data.orders : [];

      const merged = serverList.sort((a, b) => {
        const timeA = new Date((a as any).created_at || a.date || 0).getTime() || 0;
        const timeB = new Date((b as any).created_at || b.date || 0).getTime() || 0;
        return timeB - timeA;
      });

      // Strict deduplication & new order alert detection
      if (isInitialFetchDoneRef.current) {
        const newlyArrived = merged.filter((o) => {
          if (seenOrderIdsRef.current.has(o.id)) return false;
          // Strictly ring alarm ONLY for fresh new orders placed in the last 5 minutes
          const rawDate = (o as any).created_at || o.date;
          const orderTime = rawDate ? new Date(rawDate).getTime() : 0;
          const isFresh = isNaN(orderTime) || orderTime <= 0 || Date.now() - orderTime < 5 * 60 * 1000;
          const isPending = !o.status || o.status === 'Order Placed' || o.status === 'New';
          return isFresh && isPending;
        });

        merged.forEach((o) => seenOrderIdsRef.current.add(o.id));

        if (newlyArrived.length > 0) {
          startAlarm(newlyArrived[0]);
        }
      } else {
        // Initial load: mark historical orders as seen, do not ring alarm
        merged.forEach((o) => seenOrderIdsRef.current.add(o.id));
        isInitialFetchDoneRef.current = true;
      }

      // Prevent stale polling responses from demoting orders that were just updated
      setOrders((prevOrders) => {
        return merged.map((newOrder) => {
          const old = prevOrders.find((p) => p.id === newOrder.id);
          if (old) {
            const oldRank = STATUS_RANK[old.status] || 0;
            const newRank = STATUS_RANK[newOrder.status] || 0;
            if (oldRank > newRank) {
              return {
                ...newOrder,
                status: old.status,
                assignedRider: old.assignedRider || newOrder.assignedRider,
              };
            }
          }
          return newOrder;
        });
      });

      // Keep selected order in sync if currently viewed, with rank protection
      setSelectedOrder((prev) => {
        if (!prev) return null;
        const updatedSelected = merged.find((o) => o.id === prev.id);
        if (!updatedSelected) return prev;
        const prevRank = STATUS_RANK[prev.status] || 0;
        const newRank = STATUS_RANK[updatedSelected.status] || 0;
        if (prevRank > newRank) {
          return {
            ...updatedSelected,
            status: prev.status,
            assignedRider: prev.assignedRider || updatedSelected.assignedRider,
          };
        }
        return updatedSelected;
      });

      // If an order was deep-linked via URL or notification click, open it directly
      if (pendingOrderIdRef.current) {
        const targetId = pendingOrderIdRef.current;
        const matching = merged.find(
          (o) => o.id === targetId || (o as any).orderNumber === targetId
        );
        if (matching) {
          setSelectedOrder(matching);
          setActiveTab('orders');
        }
      }
    } catch (err) {
      console.warn('[Admin] Order sync notice:', err);
    }
  };

  // Fetch Staff & Fleet
  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff', {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStaffMembers({
          admins: data.admins || [],
          riders: data.riders || [],
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders(false);
    fetchStaff();

    // 1. Initial admin history setup and URL state hydration
    if (typeof window !== 'undefined') {
      const parsedInitial = parseAdminUrl(window.location.search);

      if (!window.history.state?.adminApp) {
        if (
          parsedInitial.tab === 'home' &&
          !parsedInitial.orderId &&
          !parsedInitial.slipId &&
          !parsedInitial.productId
        ) {
          window.history.replaceState(
            { adminApp: true, adminRoot: true, step: 0, tab: 'home' },
            '',
            '/admin'
          );
        } else {
          window.history.replaceState(
            { adminApp: true, adminRoot: true, step: 0, tab: 'home' },
            '',
            '/admin'
          );
          window.history.pushState(
            { adminApp: true, step: 1, ...parsedInitial },
            '',
            window.location.href
          );
        }
      }

      applyAdminState(parsedInitial);
    }

    const onPopState = (event: PopStateEvent) => {
      stopAlarm();
      if (typeof window !== 'undefined') {
        const parsed = parseAdminUrl(window.location.search);

        // Guard against exiting to customer storefront: stay within Admin Console Home
        if (
          !event.state ||
          !event.state.adminApp ||
          event.state.step === undefined ||
          event.state.step < 0
        ) {
          window.history.pushState(
            { adminApp: true, adminRoot: true, step: 0, tab: 'home' },
            '',
            '/admin'
          );
          applyAdminState({ tab: 'home' });
          setHomeNotice('You are on the Admin Console Home. Click "View Store" in the top bar to visit the customer store.');
          setTimeout(() => setHomeNotice(null), 4000);
          return;
        }

        applyAdminState(parsed);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onPopState);
    }

    // 1. Supabase Realtime Channel (Instant 0ms database push notifications)
    let supabaseChannel: any = null;
    let supabaseSlipChannel: any = null;
    if (isSupabaseConfigured()) {
      try {
        supabaseChannel = supabase
          .channel('g1mart_admin_orders_live')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
            },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                const row = payload.new;
                if (!row || !row.id) return;

                // Strict deduplication: never alert twice for the same order
                if (seenOrderIdsRef.current.has(row.id)) return;
                seenOrderIdsRef.current.add(row.id);

                const newOrder = formatSupabaseRowToOrder(row);
                setOrders((prev) => {
                  if (prev.some((o) => o.id === newOrder.id)) return prev;
                  return [newOrder, ...prev];
                });

                // Trigger loud female voice alarm immediately!
                startAlarm(newOrder);

                // Hydrate full items & relations in background
                fetchOrders(true);
              } else if (payload.eventType === 'UPDATE') {
                const row = payload.new;
                if (!row || !row.id) return;

                const rawAddr = row.address;
                const rowAddr = typeof rawAddr === 'string' ? (() => { try { return JSON.parse(rawAddr); } catch { return {}; } })() : (rawAddr || {});
                const actualStatus = (rowAddr._status || row.status || 'Order Placed') as any;
                const actualRider = rowAddr._assignedRider;

                setOrders((prev) =>
                  prev.map((o) => {
                    if (o.id !== row.id) return o;
                    const prevRank = STATUS_RANK[o.status] || 0;
                    const nextRank = STATUS_RANK[actualStatus] || 0;
                    const winningStatus = prevRank > nextRank ? o.status : actualStatus;
                    const winningRider = actualRider || o.assignedRider;
                    return {
                      ...o,
                      status: winningStatus,
                      paymentStatus: (row.payment_status as any) || o.paymentStatus,
                      isPaid: Boolean(row.is_paid ?? o.isPaid),
                      assignedRider: winningRider,
                      timeline: rowAddr._timeline || o.timeline,
                    };
                  })
                );

                if (selectedOrder?.id === row.id) {
                  setSelectedOrder((prev) => {
                    if (!prev) return null;
                    const prevRank = STATUS_RANK[prev.status] || 0;
                    const nextRank = STATUS_RANK[actualStatus] || 0;
                    const winningStatus = prevRank > nextRank ? prev.status : actualStatus;
                    const winningRider = actualRider || prev.assignedRider;
                    return {
                      ...prev,
                      status: winningStatus,
                      paymentStatus: (row.payment_status as any) || prev.paymentStatus,
                      isPaid: Boolean(row.is_paid ?? prev.isPaid),
                      assignedRider: winningRider,
                      timeline: rowAddr._timeline || prev.timeline,
                    };
                  });
                }
              }
            }
          )
          .subscribe((status: string) => {
            console.log('[Supabase Realtime] Orders channel status:', status);
          });

        supabaseSlipChannel = supabase
          .channel('g1mart_admin_slips_live')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'slip_orders',
            },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                const row = payload.new;
                if (!row || !row.id) return;
                if (seenSlipIdsRef.current.has(row.id)) return;
                seenSlipIdsRef.current.add(row.id);

                setSlipCounts((prev) => ({ ...prev, new: prev.new + 1 }));
                startSlipAlarm(row);
              } else if (payload.eventType === 'UPDATE') {
                const row = payload.new;
                if (row?.status === 'CONFIRMED') {
                  setSlipCounts((prev) => ({
                    new: Math.max(0, prev.new - 1),
                    confirmed: prev.confirmed + 1,
                  }));
                }
              }
            }
          )
          .subscribe((status: string) => {
            console.log('[Supabase Realtime] Slips channel status:', status);
          });
      } catch (err) {
        console.warn('[Supabase Realtime] Setup notice:', err);
      }
    }

    // 2. Cross-Tab Real-time Broadcast Channel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('g1mart_order_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data.order) {
          const newOrder = event.data.order;
          if (seenOrderIdsRef.current.has(newOrder.id)) return;
          seenOrderIdsRef.current.add(newOrder.id);

          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
          startAlarm(newOrder);
        } else if (event.data?.type === 'NEW_SLIP_ORDER' && event.data.slip) {
          const newSlip = event.data.slip;
          if (seenSlipIdsRef.current.has(newSlip.id)) return;
          seenSlipIdsRef.current.add(newSlip.id);

          setSlipCounts((prev) => ({ ...prev, new: prev.new + 1 }));
          startSlipAlarm(newSlip);
        } else if (event.data?.type === 'ORDER_UPDATED' && event.data.order) {
          setOrders((prev) =>
            prev.map((o) => (o.id === event.data.order.id ? { ...o, ...event.data.order } : o))
          );
          if (selectedOrder?.id === event.data.order.id) {
            setSelectedOrder((prev) => (prev ? { ...prev, ...event.data.order } : null));
          }
        } else if (event.data?.type === 'NOTIFICATION_ORDER_CLICKED' && event.data?.orderId) {
          const clickedOrderId = event.data.orderId;
          const isSlip = event.data?.tab === 'slips' || String(clickedOrderId).startsWith('SLIP');
          stopAlarm();
          if (isSlip) {
            setActiveTab('slips');
            if (clickedOrderId) {
              try {
                window.history.pushState(
                  { view: 'slip', slipId: clickedOrderId, tab: 'slips', adminBack: true },
                  '',
                  `/admin?tab=slips&slipId=${encodeURIComponent(clickedOrderId)}`
                );
              } catch {}
            }
          } else {
            setActiveTab('orders');
            pendingOrderIdRef.current = clickedOrderId;
            fetchSpecificOrder(clickedOrderId);
          }
        }
      };
    } catch {}

    // 3. 4-second safety net background sync (never misses orders if realtime is reconnecting)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);

    // 4. Service Worker Push Sync Listener (triggers if push arrived or notification was tapped)
    let handleSwMessage: ((event: MessageEvent) => void) | null = null;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NEW_ORDER_PUSH_RECEIVED') {
          fetchOrders(false);
          const isSlip = event.data?.data?.tab === 'slips' || event.data?.data?.tag?.includes('admin_new_slip') || String(event.data?.orderId).startsWith('SLIP');
          if (isSlip && event.data?.orderId) {
            startSlipAlarm({ id: event.data.orderId, customer_name: 'Customer' });
          }
        } else if (event.data?.type === 'NOTIFICATION_ORDER_CLICKED') {
          const clickedOrderId = event.data.orderId;
          const isSlip = event.data?.tab === 'slips' || String(clickedOrderId).startsWith('SLIP');
          stopAlarm();
          if (isSlip) {
            setActiveTab('slips');
            if (clickedOrderId) {
              try {
                window.history.pushState(
                  { view: 'slip', slipId: clickedOrderId, tab: 'slips', adminBack: true },
                  '',
                  `/admin?tab=slips&slipId=${encodeURIComponent(clickedOrderId)}`
                );
              } catch {}
            }
          } else {
            setActiveTab('orders');
            if (clickedOrderId) {
              pendingOrderIdRef.current = clickedOrderId;
              setOrders((prev) => {
                const found = prev.find(
                  (o) => o.id === clickedOrderId || (o as any).orderNumber === clickedOrderId
                );
                if (found) {
                  setSelectedOrder(found);
                } else {
                  fetchSpecificOrder(clickedOrderId);
                }
                return prev;
              });
              fetchOrders(false);
              try {
                window.history.pushState(
                  { view: 'order', orderId: clickedOrderId, tab: 'orders', adminBack: true },
                  '',
                  `/admin?tab=orders&orderId=${encodeURIComponent(clickedOrderId)}`
                );
              } catch {}
            }
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', onPopState);
      }
      if (bc) bc.close();
      if (handleSwMessage && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
      if (supabaseChannel) {
        try {
          supabase.removeChannel(supabaseChannel);
        } catch {}
      }
      if (supabaseSlipChannel) {
        try {
          supabase.removeChannel(supabaseSlipChannel);
        } catch {}
      }
      stopAlarm();
    };
  }, []);

  // Handle Order Status Update (Confirm, Packing, Packed, Rider Assigned, Out for Delivery, Delivered)
  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: string,
    assignedRider?: { id?: string; name: string; phone?: string; vehicleNumber?: string },
    providedOtp?: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    let otp = providedOtp;
    if (nextStatus === 'Delivered' && !otp) {
      const isPickup = Boolean(
        targetOrder?.orderType === 'pickup' ||
        targetOrder?.slot?.toLowerCase().includes('pickup') ||
        targetOrder?.address?.streetArea?.toLowerCase().includes('pickup') ||
        (targetOrder?.address as any)?.orderType === 'pickup'
      );
      const promptMsg = isPickup
        ? 'Customer Store Pickup Handover Verification:\n\nPlease enter the 4-digit Store Pickup PIN shown on the customer\'s screen to complete handover & confirm collection:'
        : 'Customer Delivery OTP Verification:\n\nPlease ask the customer for their 4-digit handover OTP to confirm delivery:';
      const input = window.prompt(promptMsg);
      if (!input || !input.trim()) {
        return; // Admin cancelled or did not provide OTP
      }
      otp = input.trim();
    }

    const effectiveRider = assignedRider || targetOrder?.assignedRider || (selectedOrder?.id === orderId ? selectedOrder?.assignedRider : undefined);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: nextStatus as any,
          assignedRider: effectiveRider || o.assignedRider,
        };
      })
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus as any,
              assignedRider: effectiveRider || prev.assignedRider,
            }
          : null
      );
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          status: nextStatus,
          otp,
          staffIdentifier: user?.name || user?.email || 'Store Admin',
          assignedRider: effectiveRider,
          orderFallback: targetOrder,
        }),
      });
      const data = await res.json();

      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));

        // Sync local storage for customer persistence
        try {
          const rawAcc = localStorage.getItem('g1mart_account_orders');
          if (rawAcc) {
            const list = JSON.parse(rawAcc);
            const nextList = list.map((item: any) =>
              item.id === orderId ? { ...item, ...data.order } : item
            );
            localStorage.setItem('g1mart_account_orders', JSON.stringify(nextList));
          }
          const rawRecent = localStorage.getItem('g1mart_recent_order');
          if (rawRecent) {
            const recent = JSON.parse(rawRecent);
            if (recent.id === orderId) {
              localStorage.setItem('g1mart_recent_order', JSON.stringify({ ...recent, ...data.order }));
            }
          }
        } catch {}

        // Broadcast real-time update to customer browser tab
        try {
          const bc = new BroadcastChannel('g1mart_order_channel');
          bc.postMessage({
            type: 'ORDER_UPDATED',
            orderId,
            order: data.order,
            status: nextStatus,
          });
          bc.close();
        } catch {}
      } else {
        alert('Could not update order status: ' + (data.error || 'Server error'));
        if (targetOrder) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? targetOrder : o)));
          if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(targetOrder);
        }
      }
    } catch (err: any) {
      alert('Error updating order: ' + err.message);
      if (targetOrder) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? targetOrder : o)));
        if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(targetOrder);
      }
    }
  };

  // Handle Mark as Paid (Manual COD Collection)
  const handleMarkPaid = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ staffIdentifier: user?.name || user?.email || 'Store Manager' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order, isPaid: true } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...data.order, isPaid: true } : null));
        }

        try {
          const bc = new BroadcastChannel('g1mart_order_channel');
          bc.postMessage({ type: 'ORDER_UPDATED', orderId, order: data.order });
          bc.close();
        } catch {}
      } else {
        alert('Could not mark order as paid: ' + (data?.error || `Server rejected request (${res.status})`));
      }
    } catch (err: any) {
      console.error('Failed to mark order paid', err);
      alert('Error marking order paid: ' + err.message);
    }
  };

  // Clear all test orders completely across the entire app
  const handleClearAllOrders = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete ALL orders across all accounts? This will permanently delete test orders from server, database, and client storage.'
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          localStorage.removeItem('g1mart_account_orders');
          localStorage.removeItem('g1mart_recent_order');
          sessionStorage.removeItem('g1mart_orders_list');
          sessionStorage.removeItem('g1mart_latest_order');
        } catch {}
        setOrders([]);
        seenOrderIdsRef.current.clear();
        stopAlarm();
        setSelectedOrder(null);
        alert('All orders have been permanently cleared from everywhere!');
      } else {
        alert(data.error || `Failed to clear orders (${res.status})`);
      }
    } catch (err: any) {
      alert('Error clearing orders: ' + err.message);
    }
  };

  // Quick In-Stock / Out-of-Stock Toggle on Product
  const handleQuickToggleStock = async (productId: string, inStock: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock, stockCount: inStock ? (p.stockCount > 0 ? p.stockCount : 15) : 0 } : p))
    );

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          id: productId,
          inStock,
          stockCount: inStock ? 15 : 0,
        }),
      });
    } catch (err) {
      console.error('Failed to update product stock:', err);
    }
  };

  // Active Orders count badge
  const activeOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        !o.status ||
        o.status === 'Order Placed' ||
        o.status === 'New' ||
        o.status === 'Confirmed' ||
        o.status === 'Packing' ||
        o.status === 'Packed' ||
        o.status === 'Rider Assigned' ||
        o.status === 'Out for Delivery' ||
        o.status === 'Order Dispatched'
    ).length;
  }, [orders]);

  const [slipCounts, setSlipCounts] = useState<{ new: number; confirmed: number }>({ new: 0, confirmed: 0 });

  useEffect(() => {
    const fetchSlipData = async () => {
      try {
        const res = await fetch('/api/admin/slip-orders');
        const data = await res.json();
        if (data.counts) {
          setSlipCounts({ new: data.counts.new || 0, confirmed: data.counts.confirmed || 0 });
        }
        if (Array.isArray(data.orders)) {
          if (isInitialSlipFetchDoneRef.current) {
            const newSlips = data.orders.filter(
              (o: any) => o.status === 'SLIP_RECEIVED' && !seenSlipIdsRef.current.has(o.id)
            );
            if (newSlips.length > 0) {
              newSlips.forEach((o: any) => seenSlipIdsRef.current.add(o.id));
              startSlipAlarm(newSlips[0]);
            }
          } else {
            data.orders.forEach((o: any) => seenSlipIdsRef.current.add(o.id));
            isInitialSlipFetchDoneRef.current = true;
          }
        }
      } catch {}
    };
    fetchSlipData();
    const iv = setInterval(fetchSlipData, 4000);
    return () => clearInterval(iv);
  }, []);

  const navMenuItems = [
    { id: 'home' as const, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'orders' as const,
      label: 'Live Orders',
      icon: Package,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'slips' as const,
      label: 'Slip Orders & Billing',
      icon: FileText,
      badge: slipCounts.new > 0 ? slipCounts.new : undefined,
    },
    {
      id: 'packer' as const,
      label: 'Packer Queue',
      icon: CheckSquare,
      badge: slipCounts.confirmed > 0 ? slipCounts.confirmed : undefined,
    },
    {
      id: 'inventory' as const,
      label: 'Inventory & Stock',
      icon: Layers,
      badge: products.length > 0 ? products.length : undefined,
    },
    { id: 'shoot-list' as const, label: 'Product Photos (Shoot List)', icon: Camera },
    { id: 'staff' as const, label: 'Staff & Role Access', icon: Users },
    { id: 'settings' as const, label: 'Store Settings & Zones', icon: Settings },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start min-h-screen">
      {/* 1. DESKTOP PERMANENT NAVIGATION SIDEBAR (Laptop/Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-5 space-y-6 sticky top-20">
        {/* Hub Info Banner */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              Supermarket Hub
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live &amp; Online
            </span>
          </div>
          <p className="text-xs font-black text-stone-900 truncate">G1mart Main Supermarket</p>
          <p className="text-[10px] text-stone-500 truncate">Nellore Hub • Padarupalli (524004)</p>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5 flex-1">
          <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider px-2 block mb-2">
            Store Management
          </span>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedOrder && !selectedProduct;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (activeTab === item.id && !selectedOrder && !selectedProduct) return;
                  pushAdminState({ tab: item.id });
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1B5E20] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Store Manager Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              GM
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">G1mart Admin</p>
              <p className="text-[10px] text-stone-500">Store Manager</p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
          >
            Storefront ↗
          </Link>
        </div>
      </aside>

      {/* Home Safe Notice Toast */}
      {homeNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top duration-200">
          <Store className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{homeNotice}</span>
        </div>
      )}

      {/* 2. REALTIME ORDER ARRIVAL FLOATING POPUP BANNER */}
      {newOrderAlert && (
        <div
          className={`fixed top-14 sm:top-6 right-3 sm:right-6 z-50 max-w-md w-full text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 transition-all ${
            isAlarmRinging
              ? 'bg-[#143d18] border-red-400 ring-4 ring-red-400/50 animate-pulse'
              : 'bg-[#1B5E20] border-emerald-400'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  isAlarmRinging ? 'bg-red-500 text-white animate-bounce' : 'bg-white/20 text-white'
                }`}
              >
                {newOrderAlert.isSlip ? '📸' : (isAlarmRinging ? '🚨' : '🔔')}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black tracking-wider uppercase text-emerald-200">
                    {newOrderAlert.isSlip ? 'New Grocery Slip Alert!' : (isAlarmRinging ? 'New Order Alert!' : 'Order Notification')}
                  </h4>
                  {isAlarmRinging && (
                    <span className="text-[10px] font-black uppercase bg-red-500/90 text-white px-2 py-0.5 rounded-full animate-pulse">
                      Voice Alarm Active
                    </span>
                  )}
                </div>
                <p className="text-base font-black truncate mt-0.5">
                  #{newOrderAlert.id} • {newOrderAlert.isSlip ? `${newOrderAlert.imagesCount || 1} photo slip(s)` : `₹${newOrderAlert.grandTotal}`}
                </p>
                <p className="text-xs text-emerald-100 truncate">
                  {newOrderAlert.isSlip
                    ? `${newOrderAlert.customerName || 'Customer'} (${newOrderAlert.customerPhone || ''}) • ${newOrderAlert.address || 'Nellore'}`
                    : `${newOrderAlert.address?.fullName || 'Customer'} • ${newOrderAlert.items?.length || 1} items • ${newOrderAlert.paymentMethod || 'COD'}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopAlarm();
                setNewOrderAlert(null);
              }}
              className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors"
              title="Close alert and stop voice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-end gap-2">
            {isAlarmRinging && (
              <button
                type="button"
                onClick={stopAlarm}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>⏹️ Stop Voice</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (newOrderAlert.isSlip) {
                  pushAdminState({ tab: 'slips', slipId: newOrderAlert.id });
                } else {
                  pushAdminState({ tab: 'orders', orderId: newOrderAlert.id });
                }
                setNewOrderAlert(null);
              }}
              className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{newOrderAlert.isSlip ? 'Open Slip & Call Customer' : 'Open & Acknowledge'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT WORKSPACE AREA */}
      <main className="flex-1 w-full min-w-0">
        {/* Notification Permission Prompt for Store Admins (Only visible if notifications not yet enabled) */}
        {!isPermissionGranted && (
          <div className="bg-gradient-to-r from-[#1B5E20] via-emerald-800 to-green-700 text-white rounded-2xl p-3.5 sm:p-4 mb-4 shadow-sm border border-emerald-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase text-emerald-200">
                  Enable New Order Voice &amp; Sound Alerts
                </h4>
                <p className="text-[11px] text-white/90 mt-0.5">
                  Get instant phone sound &amp; vibration alerts whenever a customer places an order.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnablePush}
              className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all shadow-sm active:scale-95 flex items-center justify-center"
            >
              <span>Enable Alerts on this Device</span>
            </button>
          </div>
        )}

        {pushStatusMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl mb-4 shadow-sm flex items-center justify-between">
            <span>{pushStatusMessage}</span>
            <button onClick={() => setPushStatusMessage(null)} className="text-white/80 hover:text-white ml-2">✕</button>
          </div>
        )}

        {selectedOrder ? (
          <OrderDetailsPanel
            order={selectedOrder}
            onBack={() => navigateBack()}
            onUpdateStatus={(id, status, assignedRider) => {
              handleUpdateOrderStatus(id, status, assignedRider);
            }}
            onMarkPaid={(id) => handleMarkPaid(id)}
            availableRiders={staffMembers.riders}
          />
        ) : isCreatingProduct ? (
          <ProductDetailsPanel
            key="create-new-product"
            isNew={true}
            product={BLANK_NEW_PRODUCT}
            onBack={() => setIsCreatingProduct(false)}
            categories={categories}
            onSaveProduct={async (newProduct) => {
              setProducts((prev) => [newProduct, ...prev]);
              productsRef.current = [newProduct, ...productsRef.current];
              setIsCreatingProduct(false);
              return true;
            }}
          />
        ) : selectedProduct ? (
          <ProductDetailsPanel
            key={`edit-product-${selectedProduct.id}`}
            product={selectedProduct}
            onBack={() => navigateBack()}
            categories={categories}
            onSaveProduct={async (updatedProduct) => {
              setProducts((prev) =>
                prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
              );
              setSelectedProduct(updatedProduct);
              productsRef.current = productsRef.current.map((p) =>
                p.id === updatedProduct.id ? updatedProduct : p
              );
              try {
                const res = await fetch('/api/admin/products', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    ...getAdminHeaders(),
                  },
                  body: JSON.stringify({
                    id: updatedProduct.id,
                    name: updatedProduct.name,
                    brand: updatedProduct.brand,
                    unit: updatedProduct.unit,
                    category: updatedProduct.category,
                    price: updatedProduct.price,
                    originalPrice: updatedProduct.originalPrice,
                    inStock: updatedProduct.inStock,
                    stockCount: updatedProduct.stockCount,
                    imageUrl: (updatedProduct as any).imageUrl || (updatedProduct as any).image_url || updatedProduct.image,
                    imageStatus: (updatedProduct as any).imageStatus || 'VERIFIED',
                    variants: updatedProduct.variants,
                  }),
                });
                const data = await res.json();
                return Boolean(data.success);
              } catch (err) {
                console.error('Failed to update product on server:', err);
                return false;
              }
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeTab
                orders={orders}
                products={products}
                onViewOrder={(order) => {
                  stopAlarm();
                  pushAdminState({ tab: 'orders', orderId: order.id, status: 'All' });
                }}
                onNavigateToOrders={(filter) => {
                  stopAlarm();
                  pushAdminState({ tab: 'orders', status: filter || 'All' });
                }}
                onNavigateToInventory={(stockFilter) => {
                  pushAdminState({ tab: 'inventory', stockFilter: stockFilter || 'All' });
                }}
                onNavigateToShootList={() => {
                  stopAlarm();
                  pushAdminState({ tab: 'shoot-list' });
                }}
                onNavigateToTab={(tab) => {
                  stopAlarm();
                  pushAdminState({ tab: tab as any });
                }}
                audioEnabled={audioEnabled}
                onToggleAudio={handleToggleAudio}
                onTestAudio={handleTestVoiceAlert}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                initialFilter={ordersStatusFilter}
                onFilterChange={(filter) => {
                  pushAdminState({ tab: 'orders', status: filter });
                }}
                onViewOrder={(order) => {
                  stopAlarm();
                  pushAdminState({
                    tab: 'orders',
                    orderId: order.id,
                    status: ordersStatusFilter,
                  });
                }}
                onBackToDashboard={() => navigateBack()}
                onUpdateStatus={(id, nextStatus, assignedRider) => {
                  handleUpdateOrderStatus(id, nextStatus, assignedRider);
                }}
                availableRiders={staffMembers.riders}
                onClearAllOrders={handleClearAllOrders}
              />
            )}

            {activeTab === 'slips' && (
              <SlipOrdersTab
                products={products}
                initialActiveSubTab="slips"
                activeSlipId={activeSlipId}
                onSelectSlip={(slip: any) => {
                  pushAdminState({ tab: 'slips', slipId: slip?.id || slip });
                }}
                onCloseSlip={() => navigateBack()}
                onBackToDashboard={() => navigateBack()}
              />
            )}

            {activeTab === 'packer' && (
              <SlipOrdersTab
                products={products}
                initialActiveSubTab="packer"
                activeSlipId={activeSlipId}
                onSelectSlip={(slip: any) => {
                  pushAdminState({ tab: 'packer', slipId: slip?.id || slip });
                }}
                onCloseSlip={() => navigateBack()}
                onBackToDashboard={() => navigateBack()}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab
                products={products}
                categories={categories}
                onAddNewProduct={() => setIsCreatingProduct(true)}
                initialStockFilter={inventoryStockFilter}
                onStockFilterChange={(stockFilter) => {
                  pushAdminState({ tab: 'inventory', stockFilter });
                }}
                onViewProduct={(product) => {
                  pushAdminState({
                    tab: 'inventory',
                    productId: product.id,
                    stockFilter: inventoryStockFilter,
                  });
                }}
                onBackToDashboard={() => navigateBack()}
                onQuickToggleStock={handleQuickToggleStock}
              />
            )}

            {activeTab === 'staff' && (
              <StaffManagementTab onBackToDashboard={() => navigateBack()} />
            )}

            {activeTab === 'shoot-list' && (
              <ShootListTab
                products={products}
                categories={categories}
                onProductUpdated={(updated) =>
                  setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                }
                onBackToDashboard={() => navigateBack()}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab onBackToDashboard={() => navigateBack()} />
            )}
          </>
        )}
      </main>

      {/* 4. PINNED MOBILE BOTTOM NAVIGATION (Mobile/Tablet only) */}
      <MobileBottomNav
        activeTab={
          selectedOrder
            ? 'orders'
            : selectedProduct
            ? 'inventory'
            : activeTab
        }
        onChangeTab={(tabId) => {
          pushAdminState({ tab: tabId as any });
        }}
        orderBadge={activeOrdersCount > 0 ? activeOrdersCount : undefined}
        slipsBadge={slipCounts.new > 0 ? slipCounts.new : undefined}
      />
    </div>
  );
}
