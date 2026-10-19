import React from 'react';
import { Order, Product } from '@/types';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Banknote,
  Volume2,
  VolumeX,
  ArrowRight,
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
}: Props) {
  // Real database-derived status counts
  const ordersToConfirm = orders.filter(
    (o) => !o.status || o.status === 'Order Placed' || o.status === 'New'
  ).length;

  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const packingCount = orders.filter((o) => o.status === 'Packing').length;
  const ordersToPack = confirmedCount + packingCount;

  const packedCount = orders.filter((o) => o.status === 'Packed').length;
  const riderAssignedCount = orders.filter((o) => o.status === 'Rider Assigned').length;
  const outForDeliveryCount = orders.filter(
    (o) => o.status === 'Out for Delivery' || o.status === 'Order Dispatched'
  ).length;
  const ordersToDeliver = packedCount + riderAssignedCount + outForDeliveryCount;

  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Actionable orders needing immediate store staff attention
  const needsAttentionCount = ordersToConfirm + ordersToPack;

  // Inventory restocking alerts
  const lowStockProducts = products.filter(
    (p) => p.inStock && p.stockCount > 0 && p.stockCount <= 5
  );
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stockCount === 0);
  const stockAlertsCount = lowStockProducts.length + outOfStockProducts.length;

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
    <div className="space-y-4 max-w-4xl mx-auto p-3 sm:p-6 pb-28 text-stone-900">
      {/* 1. MINIMAL HEADER — G1 Mart Branding & Store Status */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              G1 Mart
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Store open</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-0.5">Store operations</p>
        </div>

        {/* Unobtrusive Sound Alert Toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
            audioEnabled
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
          }`}
          title="Toggle audible alerts for incoming orders"
        >
          {audioEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-stone-400" />
          )}
          <span className="text-[11px] font-semibold hidden sm:inline">
            {audioEnabled ? 'Sound: ON' : 'Sound: OFF'}
          </span>
        </button>
      </div>

      {/* 2. PRIORITY SECTION — "NEEDS ATTENTION" CARD */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Needs attention
          </span>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            {needsAttentionCount} {needsAttentionCount === 1 ? 'order' : 'orders'}
          </p>
          <p className="text-xs text-stone-600 font-medium mt-1">
            {needsAttentionCount === 0
              ? 'All orders are on track'
              : `${ordersToConfirm} to confirm • ${ordersToPack} to pack`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToOrders('Needs action')}
          className="w-full py-3 px-4 bg-[#087F5B] hover:bg-[#066c4d] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <span>View pending orders</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. SECONDARY METRICS — COMPACT OPERATIONAL QUEUES */}
      <div className="grid grid-cols-2 gap-3">
        {/* To Pack */}
        <div
          onClick={() => onNavigateToOrders('Packing')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-amber-400 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">{ordersToPack}</p>
          <span className="text-xs font-semibold text-stone-600 block mt-0.5">To pack</span>
        </div>

        {/* To Deliver */}
        <div
          onClick={() => onNavigateToOrders('Ready for delivery')}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-teal-500 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">{ordersToDeliver}</p>
          <span className="text-xs font-semibold text-stone-600 block mt-0.5">To deliver</span>
        </div>
      </div>

      {/* 4. STOCK ALERTS CARD */}
      <div
        onClick={() => onNavigateToInventory('Low Stock')}
        className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-rose-300 cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-stone-700" />
            <span className="text-sm font-bold text-stone-900">Stock alerts</span>
          </div>
          <span className="text-base font-black text-stone-900">{stockAlertsCount}</span>
        </div>
        <p className="text-xs text-stone-500 font-medium mt-1">
          {stockAlertsCount === 0
            ? 'No items need restocking'
            : `${stockAlertsCount} items need restocking`}
        </p>
      </div>

      {/* 5. FINANCIAL & STORE VOLUME SUMMARIES (Secondary, lower down) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* COD cash to collect */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              COD Cash to Collect
            </span>
            <p className="text-xl font-black text-amber-800 mt-0.5">₹{pendingCodTotal}</p>
            <span className="text-[11px] font-medium text-stone-500">
              {pendingCodOrders.length} pending cash deliveries
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
        </div>

        {/* Completed volume */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
              Completed Orders
            </span>
            <p className="text-xl font-black text-emerald-800 mt-0.5">₹{completedRevenue}</p>
            <span className="text-[11px] font-medium text-stone-500">
              {deliveredCount} delivered orders
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 6. STORE OPERATIONS & HUB TOOLS (Quick Navigation) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase text-stone-400 tracking-wider">
          Store Operations &amp; Hub Tools
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Slip Orders & Billing */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('slips')}
            className="p-3 rounded-xl border border-stone-200/90 hover:border-emerald-600 bg-stone-50/60 hover:bg-emerald-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block group-hover:text-emerald-800">
                Slips &amp; Billing
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Customer lists
              </span>
            </div>
          </button>

          {/* Stock / Inventory */}
          <button
            type="button"
            onClick={() => onNavigateToInventory('All')}
            className="p-3 rounded-xl border border-stone-200/90 hover:border-emerald-600 bg-stone-50/60 hover:bg-emerald-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center mb-2">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block group-hover:text-emerald-800">
                Stock &amp; Catalog
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                {products.length} products
              </span>
            </div>
          </button>

          {/* Photo Studio */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToShootList) onNavigateToShootList();
              else onNavigateToTab?.('shoot-list');
            }}
            className="p-3 rounded-xl border border-stone-200/90 hover:border-emerald-600 bg-stone-50/60 hover:bg-emerald-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block group-hover:text-purple-800">
                Photo Studio
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Shelf packshots
              </span>
            </div>
          </button>

          {/* Staff & Fleet */}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('staff')}
            className="p-3 rounded-xl border border-stone-200/90 hover:border-emerald-600 bg-stone-50/60 hover:bg-emerald-50/30 transition-all text-left flex flex-col justify-between group active:scale-[0.98] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block group-hover:text-blue-800">
                Staff &amp; Fleet
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                Riders &amp; admins
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 7. RECENT ORDERS (Clean Compact Cards) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
          <h2 className="text-sm font-bold text-stone-900">Recent orders</h2>
          <button
            type="button"
            onClick={() => onNavigateToOrders('All')}
            className="text-xs font-bold text-[#087F5B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-stone-100">
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
                className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">#{order.id}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-stone-100 text-stone-700">
                      {status}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        isPaid ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'
                      }`}
                    >
                      {isPaid ? 'Paid' : 'COD'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 truncate mt-0.5">
                    {order.address?.fullName || 'Customer'} • {order.items?.length || 0} items • ₹{order.grandTotal}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewOrder(order);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  View
                </button>
              </div>
            );
          })}

          {recentOrders.length === 0 && (
            <div className="py-6 text-center text-stone-400 text-xs">
              No orders received yet. Live orders will appear here automatically.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
