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
  Sparkles,
} from 'lucide-react';
import type { Category, Product, Order, StaffMember } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useNotification } from '@/context/NotificationContext';

// Tab components
import HomeTab from '@/components/admin/tabs/HomeTab';
import OrdersTab from '@/components/admin/tabs/OrdersTab';
import OrderDetailsPanel from '@/components/admin/tabs/OrderDetailsPanel';
import InventoryTab from '@/components/admin/tabs/InventoryTab';
import ProductDetailsPanel from '@/components/admin/tabs/ProductDetailsPanel';
import MobileBottomNav from '@/components/admin/tabs/MobileBottomNav';
import StaffManagementTab from '@/components/admin/StaffManagementTab';
import ShootListTab from '@/components/admin/tabs/ShootListTab';
import { Camera } from 'lucide-react';

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminDashboardClient({ initialProducts = [], categories = [] }: Props) {
  // Navigation & Active View state
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'inventory' | 'staff' | 'shoot-list'>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffMembers, setStaffMembers] = useState<{ admins: StaffMember[]; riders: StaffMember[] }>({
    admins: [],
    riders: [],
  });

  // Notifications & Quick-Commerce Alert Engine
  const { notifyWelcome, notifyApkDownloaded, notifyOrderStatus } = useNotification();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmLoopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmActiveRef = useRef<boolean>(false);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialFetchDoneRef = useRef<boolean>(false);

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

  // Repeating loud female voice iteration ("New order! New order!")
  const playFemaleVoiceLoop = () => {
    if (!alarmActiveRef.current) return;

    // 1. Play recorded female voice audio file (/new_order_voice.wav)
    try {
      if (!alarmAudioRef.current) {
        alarmAudioRef.current = new Audio('/new_order_voice.wav');
      }
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.volume = 1.0;
      const playPromise = alarmAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } catch {}

    // 2. Play Web Speech API loud female voice alongside
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('New order! New order!');
        utterance.volume = 1.0;
        utterance.rate = 1.0;
        utterance.pitch = 1.25;

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
                n.includes('victoria') ||
                n.includes('moira') ||
                n.includes('veena') ||
                n.includes('google uk english female') ||
                n.includes('google us english') ||
                n.includes('microsoft zira') ||
                (v.lang.startsWith('en') && (n.includes('woman') || n.includes('girl') || n.includes('lady')))
              );
            }) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          if (femaleVoice) utterance.voice = femaleVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch {}

    // 3. Play chime
    playWebAudioChime();

    // 4. Repeat every 2.6 seconds while alarmActiveRef.current is true
    if (alarmLoopTimerRef.current) {
      clearTimeout(alarmLoopTimerRef.current);
    }
    alarmLoopTimerRef.current = setTimeout(() => {
      if (alarmActiveRef.current) {
        playFemaleVoiceLoop();
      }
    }, 2600);
  };

  // Start the alarm
  const startAlarm = (order: Order) => {
    if (!audioEnabled) {
      setNewOrderAlert(order);
      return;
    }
    alarmActiveRef.current = true;
    setIsAlarmRinging(true);
    setNewOrderAlert(order);

    if (alarmLoopTimerRef.current) {
      clearTimeout(alarmLoopTimerRef.current);
    }

    playFemaleVoiceLoop();
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
      date: row.date || new Date(row.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: Array.isArray(row.order_items)
        ? row.order_items.map((oi: any) => ({
            productId: oi.product_id || oi.productId || 'p-1',
            productName: oi.product_name || oi.productName || 'Catalog Item',
            unit: oi.unit || '1 unit',
            price: Number(oi.unit_price || oi.price || 0),
            quantity: Number(oi.quantity || 1),
            image: oi.image_url || oi.image || '/products/placeholder.svg',
          }))
        : Array.isArray(row.items)
        ? row.items
        : [],
      address,
      slot: row.slot || row.delivery_slot || 'Standard Delivery',
      paymentMethod: row.payment_method || 'Cash on Delivery',
      paymentStatus: row.payment_status || (row.is_paid ? 'completed' : 'pending'),
      status: (row.status as any) || 'Order Placed',
      subtotal: Number(row.subtotal || row.total_amount || 0),
      discount: Number(row.discount || row.discount_amount || 0),
      deliveryFee: Number(row.delivery_fee || 0),
      taxes: Number(row.taxes || 0),
      grandTotal: Number(row.grand_total || row.total_amount || 0),
      isPaid: Boolean(row.is_paid),
      paidAmount: Number(row.paid_amount || 0),
      timeline: [{ status: 'Order Placed', time: 'Just Now', completed: true }],
    };
  };

  // Fetch Orders from Server & Local Storage
  const fetchOrders = async (silent = false) => {
    try {
      // Collect local storage orders
      let localOrders: any[] = [];
      try {
        const rawAcc = localStorage.getItem('g1mart_account_orders');
        const rawRecent = localStorage.getItem('g1mart_recent_order');
        const rawList = sessionStorage.getItem('g1mart_orders_list');
        const listA = rawAcc ? JSON.parse(rawAcc) : [];
        const listB = rawList ? JSON.parse(rawList) : [];
        const single = rawRecent ? [JSON.parse(rawRecent)] : [];
        const combined = [...listA, ...listB, ...single];
        const uniqueMap = new Map<string, any>();
        combined.forEach((o) => {
          if (o && o.id) uniqueMap.set(o.id, o);
        });
        localOrders = Array.from(uniqueMap.values());
      } catch {}

      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      const serverList: Order[] = data.success && Array.isArray(data.orders) ? data.orders : [];

      // Forward any local-only orders to server
      for (const lo of localOrders) {
        if (!serverList.some((s) => s.id === lo.id)) {
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lo),
          }).catch(() => {});
        }
      }

      // Merge server orders with local data
      const mergedMap = new Map<string, Order>();
      localOrders.forEach((o) => mergedMap.set(o.id, o));
      serverList.forEach((s) => {
        const local = mergedMap.get(s.id);
        mergedMap.set(s.id, { ...local, ...s });
      });

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );

      // Strict deduplication & new order alert detection
      if (isInitialFetchDoneRef.current) {
        const newlyArrived = merged.filter((o) => !seenOrderIdsRef.current.has(o.id));
        if (newlyArrived.length > 0) {
          newlyArrived.forEach((o) => seenOrderIdsRef.current.add(o.id));
          startAlarm(newlyArrived[0]);
        }
      } else {
        // Initial load: mark historical orders as seen, do not ring alarm
        merged.forEach((o) => seenOrderIdsRef.current.add(o.id));
        isInitialFetchDoneRef.current = true;
      }

      setOrders(merged);

      // Keep selected order in sync if currently viewed
      if (selectedOrder) {
        const updatedSelected = merged.find((o) => o.id === selectedOrder.id);
        if (updatedSelected) setSelectedOrder(updatedSelected);
      }
    } catch (err) {
      console.warn('[Admin] Order sync notice:', err);
    }
  };

  // Fetch Staff & Fleet
  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff');
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

    // 1. Supabase Realtime Channel (Instant 0ms database push notifications)
    let supabaseChannel: any = null;
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

                setOrders((prev) =>
                  prev.map((o) => {
                    if (o.id !== row.id) return o;
                    return {
                      ...o,
                      status: (row.status as any) || o.status,
                      paymentStatus: (row.payment_status as any) || o.paymentStatus,
                      isPaid: Boolean(row.is_paid ?? o.isPaid),
                    };
                  })
                );

                if (selectedOrder?.id === row.id) {
                  setSelectedOrder((prev) =>
                    prev
                      ? {
                          ...prev,
                          status: (row.status as any) || prev.status,
                          paymentStatus: (row.payment_status as any) || prev.paymentStatus,
                          isPaid: Boolean(row.is_paid ?? prev.isPaid),
                        }
                      : null
                  );
                }
              }
            }
          )
          .subscribe((status: string) => {
            console.log('[Supabase Realtime] Orders channel status:', status);
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
        } else if (event.data?.type === 'ORDER_UPDATED' && event.data.order) {
          setOrders((prev) =>
            prev.map((o) => (o.id === event.data.order.id ? { ...o, ...event.data.order } : o))
          );
          if (selectedOrder?.id === event.data.order.id) {
            setSelectedOrder((prev) => (prev ? { ...prev, ...event.data.order } : null));
          }
        }
      };
    } catch {}

    // 3. 4-second safety net background sync (never misses orders if realtime is reconnecting)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      if (supabaseChannel) {
        try {
          supabase.removeChannel(supabaseChannel);
        } catch {}
      }
      stopAlarm();
    };
  }, [audioEnabled, selectedOrder?.id]);

  // Handle Order Status Update (Confirm, Packing, Packed, Rider Assigned, Out for Delivery, Delivered)
  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: string,
    assignedRider?: { id?: string; name: string; phone?: string; vehicleNumber?: string }
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: nextStatus as any,
          assignedRider: assignedRider || o.assignedRider,
        };
      })
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus as any,
              assignedRider: assignedRider || prev.assignedRider,
            }
          : null
      );
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          staffIdentifier: 'Store Admin',
          assignedRider,
          orderFallback: targetOrder,
        }),
      });
      const data = await res.json();

      if (data.success && data.order) {
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
        }
      }
    } catch (err: any) {
      alert('Error updating order: ' + err.message);
      if (targetOrder) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? targetOrder : o)));
      }
    }
  };

  // Handle Mark as Paid (Manual COD Collection)
  const handleMarkPaid = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIdentifier: 'Store Manager' }),
      });
      const data = await res.json();
      if (data.success && data.order) {
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
      }
    } catch (err) {
      console.error('Failed to mark order paid', err);
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
        headers: { 'Content-Type': 'application/json' },
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

  const navMenuItems = [
    { id: 'home' as const, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'orders' as const,
      label: 'Live Orders',
      icon: Package,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'inventory' as const,
      label: 'Inventory & Stock',
      icon: Layers,
      badge: products.length > 0 ? products.length : undefined,
    },
    { id: 'shoot-list' as const, label: 'Shoot List', icon: Camera },
    { id: 'staff' as const, label: 'Staff & Fleet', icon: Users },
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
          <p className="text-xs font-black text-stone-900 truncate">G1 Mart Main Supermarket</p>
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
                  setActiveTab(item.id);
                  setSelectedOrder(null);
                  setSelectedProduct(null);
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

        {/* Audio Alerts & Sound Test in Sidebar */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-700" />
              <span>Order Sound</span>
            </span>
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                audioEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {audioEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleTestVoiceAlert}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>📢 Test Voice Alert</span>
          </button>

          {/* Customer Push Notification Simulator */}
          <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
              Customer Notification Test
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => notifyWelcome('Customer')}
                className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold text-center transition-all truncate cursor-pointer"
              >
                Welcome Alert
              </button>
              <button
                type="button"
                onClick={() => notifyApkDownloaded()}
                className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold text-center transition-all truncate cursor-pointer"
              >
                APK Download
              </button>
              <button
                type="button"
                onClick={() => notifyOrderStatus('G1-82914', 'Packed', { userId: 'admin' })}
                className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold text-center transition-all truncate cursor-pointer"
              >
                Order Packed
              </button>
              <button
                type="button"
                onClick={() => notifyOrderStatus('G1-82914', 'Out for Delivery', { userId: 'admin' })}
                className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold text-center transition-all truncate cursor-pointer"
              >
                Out for Delivery
              </button>
              <button
                type="button"
                onClick={() => notifyOrderStatus('G1-82914', 'Delivered', { userId: 'admin' })}
                className="col-span-2 px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] border border-emerald-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
              >
                Order Delivered
              </button>
            </div>
          </div>
        </div>

        {/* Store Manager Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              GM
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">G1 MART Admin</p>
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
                {isAlarmRinging ? '🚨' : '🔔'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black tracking-wider uppercase text-emerald-200">
                    {isAlarmRinging ? 'New Order Alert!' : 'Order Notification'}
                  </h4>
                  {isAlarmRinging && (
                    <span className="text-[10px] font-black uppercase bg-red-500/90 text-white px-2 py-0.5 rounded-full animate-pulse">
                      Voice Alarm Active
                    </span>
                  )}
                </div>
                <p className="text-base font-black truncate mt-0.5">
                  #{newOrderAlert.id} • ₹{newOrderAlert.grandTotal}
                </p>
                <p className="text-xs text-emerald-100 truncate">
                  {newOrderAlert.address?.fullName || 'Customer'} • {newOrderAlert.items?.length || 1} items • {newOrderAlert.paymentMethod || 'COD'}
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
                stopAlarm();
                setSelectedOrder(newOrderAlert);
                setNewOrderAlert(null);
              }}
              className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Open &amp; Acknowledge</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT WORKSPACE AREA */}
      <main className="flex-1 w-full min-w-0">
        {selectedOrder ? (
          <OrderDetailsPanel
            order={selectedOrder}
            onBack={() => setSelectedOrder(null)}
            onUpdateStatus={(id, status, assignedRider) => {
              handleUpdateOrderStatus(id, status, assignedRider);
            }}
            onMarkPaid={(id) => handleMarkPaid(id)}
            availableRiders={staffMembers.riders}
          />
        ) : selectedProduct ? (
          <ProductDetailsPanel
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            categories={categories}
            onSaveProduct={async (updatedProduct) => {
              setProducts((prev) =>
                prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
              );
              return true;
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
                  setSelectedOrder(order);
                }}
                onNavigateToOrders={(filter) => {
                  stopAlarm();
                  setActiveTab('orders');
                }}
                onNavigateToInventory={(stockFilter) => {
                  setActiveTab('inventory');
                }}
                audioEnabled={audioEnabled}
                onToggleAudio={handleToggleAudio}
                onTestAudio={handleTestVoiceAlert}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                onViewOrder={(order) => {
                  stopAlarm();
                  setSelectedOrder(order);
                }}
                onUpdateStatus={(id, nextStatus) => {
                  handleUpdateOrderStatus(id, nextStatus);
                }}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab
                products={products}
                categories={categories}
                onViewProduct={(product) => setSelectedProduct(product)}
                onQuickToggleStock={handleQuickToggleStock}
              />
            )}

            {activeTab === 'staff' && <StaffManagementTab />}

            {activeTab === 'shoot-list' && (
              <ShootListTab
                products={products}
                categories={categories}
                onProductUpdated={(updated) =>
                  setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                }
              />
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
          setActiveTab(tabId as any);
          setSelectedOrder(null);
          setSelectedProduct(null);
        }}
        orderBadge={activeOrdersCount > 0 ? activeOrdersCount : undefined}
      />
    </div>
  );
}
