import React from 'react';
import { Order, Product } from '@/types';
import {
  Package,
  Truck,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Layers,
  Banknote,
  Volume2,
  VolumeX,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
  Camera,
  FileText,
  CheckSquare,
  Settings,
} from 'lucide-react';

interface Props {
  orders: Order[];
  products: Product[];
  onViewOrder: (order: Order) => void;
  onNavigateToOrders: (status?: string) => void;
  onNavigateToInventory: (filter?: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToShootList?: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onTestAudio?: () => void;
}

export default function HomeTab({
  orders,
  products,
  onViewOrder,
  onNavigateToOrders,
  onNavigateToInventory,
  onNavigateToTab,
  onNavigateToShootList,
  audioEnabled,
  onToggleAudio,
  onTestAudio,
}: Props) {
  // Order counts
  const newOrdersCount = orders.filter(
    (o) => !o.status || o.status === 'Order Placed' || o.status === 'New'
  ).length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const packingCount = orders.filter((o) => o.status === 'Packing').length;
  const readyPackedCount = orders.filter(
    (o) => o.status === 'Packed' || o.status === 'Rider Assigned'
  ).length;
  const outForDeliveryCount = orders.filter(
    (o) => o.status === 'Out for Delivery' || o.status === 'Order Dispatched'
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Inventory counts
  const lowStockProducts = products.filter(
    (p) => p.inStock && p.stockCount > 0 && p.stockCount <= 5
  );
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stockCount === 0);

  // Financial calculations
  const pendingCodOrders = orders.filter(
    (o) =>
      o.paymentMethod === 'Cash on Delivery' &&
      !o.isPaid &&
      o.status !== 'Cancelled' &&
      o.status !== 'Delivered'
  );
  const pendingCodTotal = pendingCodOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const completedRevenue = orders
    .filter(
      (o) =>
        o.isPaid ||
        o.paymentStatus === 'completed' ||
        o.paymentStatus === 'manual_verified' ||
        o.status === 'Delivered'
    )
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-5 max-w-6xl mx-auto p-3 sm:p-6 pb-32">
      {/* Header Banner - Compact Quick-Commerce Brand Ribbon */}
      <div className="bg-gradient-to-r from-[#1A2E1C] via-[#1B5E20] to-[#2E7D32] text-white rounded-3xl p-4 sm:p-6 border border-emerald-800/40 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="G1mart"
            className="w-10 h-10 sm:w-14 sm:h-14 object-contain shrink-0 hidden sm:block"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-emerald-200 bg-emerald-500/25 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Live Store Hub
              </span>
              <span className="text-xs text-emerald-100/70 font-semibold truncate hidden sm:inline">
                Nellore Main Supermarket
              </span>
            </div>
            <h1 className="text-base sm:text-2xl font-black text-white mt-1 tracking-tight truncate">
              G1mart Operations Dashboard
            </h1>
            <p className="text-xs text-emerald-100/90 font-medium hidden sm:block">
              Real-time supermarket order dispatch, inventory &amp; cash management
            </p>
          </div>
        </div>

        {/* Audio Alert Status Toggle */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 sm:p-2 rounded-2xl border border-white/10 backdrop-blur-xs shrink-0">
          <button
            type="button"
            onClick={onToggleAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              audioEnabled
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white/15 text-white/90 hover:bg-white/25'
            }`}
            title="Toggle audible voice alert for incoming orders"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="text-[11px] sm:text-xs">{audioEnabled ? 'Sound: ON' : 'Sound: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Status Columns) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase text-stone-400 tracking-wider">
            Live Order Fulfillment Pipeline
          </h2>
          <button
            type="button"
            onClick={() => onNavigateToOrders('All')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. New Orders */}
          <div
            onClick={() => onNavigateToOrders('New')}
            className={`bg-white p-4 rounded-2xl border transition-all active:scale-[0.98] group cursor-pointer ${
              newOrdersCount > 0
                ? 'border-blue-500 shadow-md ring-2 ring-blue-400/20'
                : 'border-blue-200/80 shadow-2xs hover:shadow-md hover:border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">
                New Orders
              </span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                {newOrdersCount > 0 ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-blue-300 stroke-[2]" />
                )}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">{newOrdersCount}</p>
            <span className={`text-[10px] block mt-1 ${newOrdersCount > 0 ? 'text-blue-700 font-black animate-pulse' : 'text-stone-400 font-semibold'}`}>
              {newOrdersCount > 0 ? 'Requires confirmation' : 'No new orders'}
            </span>
          </div>

          {/* 2. Packing */}
          <div
            onClick={() => onNavigateToOrders('Packing')}
            className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-md hover:border-amber-500 cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                Packing
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">{packingCount + confirmedCount}</p>
            <span className="text-[10px] font-bold text-amber-700 block mt-1">At packing table</span>
          </div>

          {/* 3. Packed / Ready (Teal / Cyan theme) */}
          <div
            onClick={() => onNavigateToOrders('Ready')}
            className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-2xs hover:shadow-md hover:border-teal-500 cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-teal-700 uppercase tracking-wider">
                Ready / Packed
              </span>
              <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">{readyPackedCount}</p>
            <span className="text-[10px] font-bold text-teal-600 block mt-1">Assign delivery rider</span>
          </div>

          {/* 4. Out for Delivery (Purple / Violet theme) */}
          <div
            onClick={() => onNavigateToOrders('Out for Delivery')}
            className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs hover:shadow-md hover:border-purple-500 cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider leading-tight">
                Out for Delivery
              </span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">{outForDeliveryCount}</p>
            <span className="text-[10px] font-bold text-purple-600 block mt-1">With rider on road</span>
          </div>

          {/* 5. Delivered */}
          <div
            onClick={() => onNavigateToOrders('Delivered')}
            className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                Delivered
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">{deliveredCount}</p>
            <span className="text-[10px] font-bold text-emerald-700 block mt-1">Completed orders</span>
          </div>

          {/* 6. Low Stock Alert */}
          <div
            onClick={() => onNavigateToInventory('Low Stock')}
            className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-2xs hover:shadow-md hover:border-rose-500 cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">
                Low Stock
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">
              {lowStockProducts.length + outOfStockProducts.length}
            </p>
            <span className="text-[10px] font-bold text-rose-600 block mt-1">Items need re-stock</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Cash & Catalog Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* COD to collect */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              COD Cash to Collect
            </span>
            <p className="text-xl font-black text-amber-700 mt-0.5">₹{pendingCodTotal}</p>
            <span className="text-[10px] font-bold text-stone-500">
              {pendingCodOrders.length} pending cash deliveries
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* Total revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              Total Order Volume
            </span>
            <p className="text-xl font-black text-emerald-800 mt-0.5">₹{completedRevenue}</p>
            <span className="text-[10px] font-bold text-stone-500">All recorded orders</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Catalog Products */}
        <div
          onClick={() => onNavigateToInventory('All')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#1B5E20] transition-colors"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              Catalog Products
            </span>
            <p className="text-xl font-black text-stone-900 mt-0.5">{products.length}</p>
            <span className="text-[10px] font-bold text-emerald-700">{products.length} Active Catalog Items</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock Items */}
        <div
          onClick={() => onNavigateToInventory('Out of Stock')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              Out of Stock
            </span>
            <p className="text-xl font-black text-stone-900 mt-0.5">{outOfStockProducts.length}</p>
            <span className="text-[10px] font-bold text-rose-600">Zero inventory items</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Store Operations & Category Navigation (Quick Access for Mobile & Desktop) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              Store Operations &amp; Hub Tools
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">Quick 1-tap access to all store categories</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* 1. Staff & Role Access */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('staff')}
            className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-emerald-600 bg-stone-50/60 hover:bg-emerald-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 transition-colors" />
            </div>
            <div className="mt-2.5">
              <span className="text-xs font-black text-stone-900 block group-hover:text-emerald-800">
                Staff &amp; Role Access
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Admins &amp; Delivery Fleet
              </span>
            </div>
          </button>

          {/* 2. Slip Orders & Billing */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('slips')}
            className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-blue-600 bg-stone-50/60 hover:bg-blue-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-700 transition-colors" />
            </div>
            <div className="mt-2.5">
              <span className="text-xs font-black text-stone-900 block group-hover:text-blue-800">
                Slip Orders &amp; Billing
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Handwritten lists &amp; bills
              </span>
            </div>
          </button>

          {/* 3. Packer Queue */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('packer')}
            className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-amber-600 bg-stone-50/60 hover:bg-amber-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckSquare className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 transition-colors" />
            </div>
            <div className="mt-2.5">
              <span className="text-xs font-black text-stone-900 block group-hover:text-amber-800">
                Packer Queue
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Packing table &amp; checklist
              </span>
            </div>
          </button>

          {/* 4. Product Photos (Shoot List) */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('shoot-list')}
            className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-purple-600 bg-stone-50/60 hover:bg-purple-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-purple-700 transition-colors" />
            </div>
            <div className="mt-2.5">
              <span className="text-xs font-black text-stone-900 block group-hover:text-purple-800">
                Product Shoot List
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Photo uploads &amp; catalog
              </span>
            </div>
          </button>

          {/* 5. Store Settings & Zones */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('settings')}
            className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-stone-800 bg-stone-50/60 hover:bg-stone-100 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
            </div>
            <div className="mt-2.5">
              <span className="text-xs font-black text-stone-900 block group-hover:text-stone-900">
                Store Settings
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                GPS, zones &amp; timings
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Product Photo Studio Quick Shortcut Banner */}
      {(onNavigateToShootList || onNavigateToTab) && (
        <div
          onClick={() => {
            if (onNavigateToShootList) onNavigateToShootList();
            else onNavigateToTab?.('shoot-list');
          }}
          className="bg-gradient-to-r from-[#14532D] via-[#1B5E20] to-[#2E7D32] p-4 sm:p-5 rounded-3xl text-white shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] border border-emerald-700/40"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Camera className="w-6 h-6 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight">Product Photo Studio</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-emerald-100">
                  Shelf Packshots
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium truncate mt-0.5">
                {products.filter((p) => p.image_status !== 'verified').length} items need photos · Tap to open studio &amp; snap with phone camera
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-950 px-3.5 py-1.5 rounded-xl shadow-xs">
              Open Studio
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders Live Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-base font-black text-stone-900">Recent Customer Orders</h2>
            <p className="text-xs text-stone-500 font-medium">Real-time orders received at G1mart Hub</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToOrders('All')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <span>See All Orders ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => {
            const isPaid =
              order.isPaid ||
              order.paymentStatus === 'completed' ||
              order.paymentStatus === 'manual_verified';
            const status = order.status || 'Order Placed';

            return (
              <div
                key={order.id}
                onClick={() => onViewOrder(order)}
                className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 bg-stone-50/50 hover:bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-stone-900 text-sm">#{order.id}</span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : status === 'Out for Delivery' || status === 'Order Dispatched'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : status === 'Packed' || status === 'Rider Assigned'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : status === 'Packing' || status === 'Confirmed'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                      }`}
                    >
                      {status}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isPaid ? '✓ Paid' : 'COD'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-800">
                    {order.address?.fullName || 'Customer'} •{' '}
                    <span className="text-stone-500 font-medium">
                      {order.address?.streetArea || order.address?.city || 'Nellore'}
                    </span>
                  </p>
                  <p className="text-xs text-stone-500">
                    {order.items?.length || 0} items • ₹{order.grandTotal} • Slot: {order.slot || 'Express ASAP'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder(order);
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <span>View &amp; Fulfill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {recentOrders.length === 0 && (
            <div className="p-8 text-center text-stone-400 font-medium text-xs">
              No orders have arrived yet. When customers order, they will appear here in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
