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

// Tab components
import HomeTab from '@/components/admin/tabs/HomeTab';
import OrdersTab from '@/components/admin/tabs/OrdersTab';
import OrderDetailsPanel from '@/components/admin/tabs/OrderDetailsPanel';
import InventoryTab from '@/components/admin/tabs/InventoryTab';
import ProductDetailsPanel from '@/components/admin/tabs/ProductDetailsPanel';
import MobileBottomNav from '@/components/admin/tabs/MobileBottomNav';
import StaffManagementTab from '@/components/admin/StaffManagementTab';

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminDashboardClient({ initialProducts = [], categories = [] }: Props) {
  // Navigation & Active View state
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'inventory' | 'staff'>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffMembers, setStaffMembers] = useState<{ admins: StaffMember[]; riders: StaffMember[] }>({
    admins: [],
    riders: [],
  });

  // Notifications & Sound State
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [previousOrderCount, setPreviousOrderCount] = useState<number>(0);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize audio and unlock Web Audio Context on first user touch/click
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/ting.mp3');

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

  const playNotificationSound = () => {
    // 1. Play /ting.mp3
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {}

    // 2. Play ultra-crisp synthesized order notification chime via Web Audio API
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
        gain1.gain.setValueAtTime(0.4, now);
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
        gain2.gain.setValueAtTime(0.45, now + 0.08);
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

  const handleTestAudio = () => {
    setAudioEnabled(true);
    playNotificationSound();
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) playNotificationSound();
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

      // Sound notification on new order count detection
      if (previousOrderCount > 0 && merged.length > previousOrderCount) {
        if (audioEnabled) playNotificationSound();
        const latest = merged[0];
        if (latest) setNewOrderAlert(latest);
      }
      setPreviousOrderCount(merged.length);
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

    // 0ms Cross-Tab Real-time Broadcast Channel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('g1mart_order_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data.order) {
          const newOrder = event.data.order;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
          if (audioEnabled) playNotificationSound();
          setNewOrderAlert(newOrder);
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

    // 2-second background sync polling
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 2000);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
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
          <p className="text-[10px] text-stone-500 truncate">Nellore A1 Hub • Magunta Layout</p>
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
            onClick={handleTestAudio}
            className="w-full py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-bold transition-colors"
          >
            🔔 Test Ting Sound
          </button>
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
        <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#1B5E20] text-white p-4 rounded-3xl shadow-2xl border-2 border-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black animate-bounce">
              🔔
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wider uppercase text-emerald-200">
                New Order Received!
              </h4>
              <p className="text-sm font-bold truncate">
                #{newOrderAlert.id} • ₹{newOrderAlert.grandTotal}
              </p>
              <p className="text-[11px] text-emerald-100 truncate">
                {newOrderAlert.address?.fullName || 'Customer'} ({newOrderAlert.items?.length || 0} items)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedOrder(newOrderAlert);
                setNewOrderAlert(null);
              }}
              className="px-3 py-1.5 bg-white text-emerald-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-emerald-50 transition-colors"
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              className="p-1 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
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
                onViewOrder={(order) => setSelectedOrder(order)}
                onNavigateToOrders={(filter) => {
                  setActiveTab('orders');
                }}
                onNavigateToInventory={(stockFilter) => {
                  setActiveTab('inventory');
                }}
                audioEnabled={audioEnabled}
                onToggleAudio={handleToggleAudio}
                onTestAudio={handleTestAudio}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                onViewOrder={(order) => setSelectedOrder(order)}
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
