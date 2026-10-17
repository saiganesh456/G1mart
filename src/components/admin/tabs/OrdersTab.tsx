import React, { useState, useMemo } from 'react';
import { Order } from '@/types';
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Bike,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  Check,
  ExternalLink,
  X,
  CreditCard,
  Banknote,
  AlertCircle,
} from 'lucide-react';

interface Props {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
  initialFilter?: string;
}

const STATUS_FILTERS = [
  'All',
  'New / Placed',
  'Confirmed',
  'Packing',
  'Packed',
  'Rider Assigned',
  'Out for Delivery',
  'Delivered',
];

function getRelativeTime(dateStr?: string) {
  if (!dateStr) return { text: 'Just now', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  try {
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) {
      return { text: dateStr, badge: 'bg-stone-50 text-stone-600 border-stone-200' };
    }
    const diffMs = Date.now() - timestamp;
    if (diffMs < 0) return { text: 'Just now', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return { text: 'Just now', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (diffMin < 10) return { text: `${diffMin}m ago`, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (diffMin < 25) return { text: `${diffMin}m ago`, badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (diffMin < 60) return { text: `${diffMin}m ago`, badge: 'bg-rose-50 text-rose-700 border-rose-200' };
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return { text: `${diffHr}h ago`, badge: 'bg-rose-50 text-rose-700 border-rose-200' };
    const diffDay = Math.floor(diffHr / 24);
    return { text: `${diffDay}d ago`, badge: 'bg-stone-50 text-stone-600 border-stone-200' };
  } catch {
    return { text: dateStr || 'Recent', badge: 'bg-stone-50 text-stone-600 border-stone-200' };
  }
}

function getStatusBadge(status?: string) {
  const s = status || 'Order Placed';
  switch (s) {
    case 'Order Placed':
    case 'New':
      return { label: 'ORDER PLACED', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'Confirmed':
      return { label: 'CONFIRMED', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'Packing':
      return { label: 'PACKING', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'Packed':
      return { label: 'PACKED', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'Rider Assigned':
      return { label: 'RIDER ASSIGNED', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'Out for Delivery':
    case 'Order Dispatched':
      return { label: 'OUT FOR DELIVERY', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'Delivered':
      return { label: 'DELIVERED', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'Cancelled':
      return { label: 'CANCELLED', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: s.toUpperCase(), bg: 'bg-stone-50 text-stone-700 border-stone-200' };
  }
}

export default function OrdersTab({
  orders,
  onViewOrder,
  onUpdateStatus,
  initialFilter = 'All',
}: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'paid'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpand = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Dynamic live status counts
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    orders.forEach((o) => {
      const s = o.status || 'Order Placed';
      if (s === 'Order Placed' || s === 'New') c['New / Placed'] = (c['New / Placed'] || 0) + 1;
      else if (s === 'Confirmed') c['Confirmed'] = (c['Confirmed'] || 0) + 1;
      else if (s === 'Packing') c['Packing'] = (c['Packing'] || 0) + 1;
      else if (s === 'Packed') c['Packed'] = (c['Packed'] || 0) + 1;
      else if (s === 'Rider Assigned') c['Rider Assigned'] = (c['Rider Assigned'] || 0) + 1;
      else if (s === 'Out for Delivery' || s === 'Order Dispatched') c['Out for Delivery'] = (c['Out for Delivery'] || 0) + 1;
      else if (s === 'Delivered') c['Delivered'] = (c['Delivered'] || 0) + 1;
    });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchName = (o.address?.fullName || '').toLowerCase().includes(q);
        const matchPhone = (o.address?.mobileNumber || o.address?.phone || '').includes(q);
        const matchItem = o.items?.some((it: any) =>
          (it.productName || '').toLowerCase().includes(q)
        );
        if (!matchId && !matchName && !matchPhone && !matchItem) return false;
      }

      // 2. Payment Filter
      const isPaid =
        o.isPaid ||
        o.paymentStatus === 'completed' ||
        o.paymentStatus === 'manual_verified';
      if (paymentFilter === 'cod' && (isPaid || o.paymentMethod !== 'Cash on Delivery'))
        return false;
      if (paymentFilter === 'paid' && !isPaid) return false;

      // 3. Status Filter
      if (statusFilter !== 'All') {
        const s = o.status || 'Order Placed';
        if (statusFilter === 'New / Placed' && (s === 'Order Placed' || s === 'New')) return true;
        if (statusFilter === 'Confirmed' && s === 'Confirmed') return true;
        if (statusFilter === 'Packing' && s === 'Packing') return true;
        if (statusFilter === 'Packed' && s === 'Packed') return true;
        if (statusFilter === 'Rider Assigned' && s === 'Rider Assigned') return true;
        if (
          statusFilter === 'Out for Delivery' &&
          (s === 'Out for Delivery' || s === 'Order Dispatched')
        )
          return true;
        if (statusFilter === 'Delivered' && s === 'Delivered') return true;
        if (s !== statusFilter) return false;
      }

      return true;
    });
  }, [orders, search, paymentFilter, statusFilter]);

  const getNextAction = (status: string) => {
    const s = status || 'Order Placed';
    if (s === 'Order Placed' || s === 'New')
      return {
        label: 'Confirm Order',
        next: 'Confirmed',
        icon: CheckCircle2,
        color: 'bg-blue-600 hover:bg-blue-700 text-white',
      };
    if (s === 'Confirmed')
      return {
        label: 'Start Packing',
        next: 'Packing',
        icon: Package,
        color: 'bg-amber-600 hover:bg-amber-700 text-white',
      };
    if (s === 'Packing')
      return {
        label: 'Mark as Packed',
        next: 'Packed',
        icon: Sparkles,
        color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      };
    if (s === 'Packed')
      return {
        label: 'Assign Rider',
        next: 'Rider Assigned',
        icon: Bike,
        color: 'bg-purple-600 hover:bg-purple-700 text-white',
      };
    if (s === 'Rider Assigned')
      return {
        label: 'Dispatch to Rider',
        next: 'Out for Delivery',
        icon: Truck,
        color: 'bg-purple-700 hover:bg-purple-800 text-white',
      };
    if (s === 'Out for Delivery' || s === 'Order Dispatched')
      return {
        label: 'Verify OTP & Deliver',
        next: 'Delivered',
        icon: Check,
        color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      };
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full bg-[#F4F6F9] p-2.5 sm:p-6 pb-24">
      {/* 1. SLIM & UNIFIED CONTROL HEADER (Zero Wasted Space) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3 mb-3 sm:mb-5">
        {/* Top Control Bar: Title + Payment Pills + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                Live Orders
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {filteredOrders.length}
              </span>
            </div>

            {/* Payment Segmented Toggle */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaymentFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paymentFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('cod')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paymentFilter === 'cod'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                COD
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('paid')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paymentFilter === 'paid'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search order ID, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Scroller with Live Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide -mx-1 px-1">
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f;
            const count = statusCounts[f] || 0;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1B5E20] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <span>{f}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FLAT & CLEAN ORDER CARDS (Zero Clumsy Layers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredOrders.map((order) => {
          const isPaid =
            order.isPaid ||
            order.paymentStatus === 'completed' ||
            order.paymentStatus === 'manual_verified';
          const s = order.status || 'Order Placed';
          const action = getNextAction(s);
          const phone = order.address?.mobileNumber || order.address?.phone || '';
          const cleanPhone = phone.replace(/\D/g, '').slice(-10);
          const relativeTime = getRelativeTime(order.date);
          const statusBadge = getStatusBadge(s);
          const isExpanded = Boolean(expandedOrders[order.id]);

          const distance = (order as any).distance_km !== undefined ? (order as any).distance_km : 0.3;
          const eta = (order as any).eta_min !== undefined ? (order as any).eta_min : 20;

          // Item preview summary
          const itemCount = order.items?.length || 0;
          const previewNames = (order.items || [])
            .slice(0, 2)
            .map((it: any) => `${it.quantity}x ${it.productName}`)
            .join(', ');
          const remainingCount = itemCount > 2 ? itemCount - 2 : 0;

          return (
            <div
              key={order.id}
              onClick={() => onViewOrder(order)}
              className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 group cursor-pointer"
            >
              <div className="space-y-2.5">
                {/* Line 1: Order ID, Age Timer & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base font-black text-stone-900 group-hover:text-emerald-800 transition-colors truncate">
                      #{order.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${relativeTime.badge} shrink-0`}
                      title={`Placed at: ${order.date || 'Recently'}`}
                    >
                      ⏱️ {relativeTime.text}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${statusBadge.bg}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* Line 2: Customer Name, One-Tap Contact & Clean Location */}
                <div className="flex items-start justify-between gap-2 pt-0.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {order.address?.fullName || 'Customer'}
                      </p>
                    </div>
                    <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">
                        {order.address?.streetArea || order.address?.city || 'Nellore'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-600 font-semibold shrink-0">{distance} km</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-emerald-700 font-semibold shrink-0">~{eta}m ETA</span>
                    </p>
                  </div>

                  {/* One-Tap Quick Call / WhatsApp */}
                  {cleanPhone && (
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${cleanPhone}`}
                        title="Call customer"
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                          order.address?.fullName || 'Customer'
                        )},%20your%20G1%20MART%20order%20%23${order.id}%20is%20${s}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp customer"
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Line 3: Flat Items Summary & Collapsible Item List (No Scroll Traps!) */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">
                      📦 {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(order.id, e)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? 'Hide items' : 'View items'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {!isExpanded ? (
                    <p className="text-xs text-stone-500 truncate mt-0.5 font-medium">
                      {previewNames || 'Catalog Items'}
                      {remainingCount > 0 && (
                        <span className="text-stone-700 font-semibold"> + {remainingCount} more</span>
                      )}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1.5 pt-1.5 border-t border-stone-100">
                      {order.items?.map((it: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 text-xs py-0.5"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={it.image || '/products/placeholder.svg'}
                              alt={it.productName}
                              className="w-5 h-5 object-contain rounded bg-stone-50 border border-stone-200 shrink-0 p-0.5"
                            />
                            <span className="text-stone-800 truncate font-medium">
                              <span className="font-bold text-stone-900">{it.quantity}×</span>{' '}
                              {it.productName}
                            </span>
                          </div>
                          <span className="font-bold text-stone-900 shrink-0">
                            ₹{(it.quantity * it.price) || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Line 4: Clean Payment Badge & Rider Status */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-stone-900 text-sm">
                      ₹{order.grandTotal}
                    </span>
                    <span
                      className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isPaid ? '✓ PAID' : 'COD'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-600">
                    <Bike className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="truncate max-w-[120px]">
                      {order.assignedRider?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. ALWAYS-VISIBLE ACTION BUTTONS (Above the fold!) */}
              <div
                className="pt-2.5 border-t border-stone-100 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {action && onUpdateStatus ? (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.id, action.next)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] ${action.color}`}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    <span>{action.label}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onViewOrder(order)}
                    className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Order Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onViewOrder(order)}
                  title="Open full order details"
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 max-w-sm mx-auto my-8">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-black text-stone-800">No Orders Match Filter</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try switching the status tab or clearing your search term.
          </p>
        </div>
      )}
    </div>
  );
}
