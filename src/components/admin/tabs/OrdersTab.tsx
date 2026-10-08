import React, { useState } from 'react';
import { Order } from '@/types';
import {
  Search,
  ChevronRight,
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
  Circle,
  ExternalLink,
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

export default function OrdersTab({
  orders,
  onViewOrder,
  onUpdateStatus,
  initialFilter = 'All',
}: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'paid'>('all');

  const filteredOrders = orders.filter((o) => {
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

  const getNextAction = (status: string) => {
    const s = status || 'Order Placed';
    if (s === 'Order Placed' || s === 'New')
      return { label: 'Confirm Order', next: 'Confirmed', icon: CheckCircle2, color: 'bg-blue-600 hover:bg-blue-700' };
    if (s === 'Confirmed')
      return { label: 'Start Packing', next: 'Packing', icon: Package, color: 'bg-amber-600 hover:bg-amber-700' };
    if (s === 'Packing')
      return { label: 'Mark Packed', next: 'Packed', icon: Sparkles, color: 'bg-indigo-600 hover:bg-indigo-700' };
    if (s === 'Packed')
      return { label: 'Assign Rider', next: 'Rider Assigned', icon: Bike, color: 'bg-purple-600 hover:bg-purple-700' };
    if (s === 'Rider Assigned')
      return { label: 'Handover to Rider', next: 'Out for Delivery', icon: Truck, color: 'bg-purple-700 hover:bg-purple-800' };
    if (s === 'Out for Delivery' || s === 'Order Dispatched')
      return { label: 'Mark Delivered', next: 'Delivered', icon: Check, color: 'bg-emerald-700 hover:bg-emerald-800' };
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full bg-[#F4F6F9] p-3 sm:p-6 pb-24">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Order Fulfillment Console
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              Showing {filteredOrders.length} of {orders.length} total orders
            </p>
          </div>

          {/* Payment filter pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                paymentFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Payments
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('cod')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                paymentFilter === 'cod'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              COD Only
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('paid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                paymentFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Paid Online
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, mobile number or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:bg-white transition-all"
          />
        </div>

        {/* Status Stepper Filters (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2">
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#1B5E20] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid (Mobile: 1-col, Tablet: 2-col, Desktop: 3-col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const isPaid =
            order.isPaid ||
            order.paymentStatus === 'completed' ||
            order.paymentStatus === 'manual_verified';
          const s = order.status || 'Order Placed';
          const action = getNextAction(s);
          const phone = order.address?.mobileNumber || order.address?.phone || '';
          const cleanPhone = phone.replace(/\D/g, '').slice(-10);

          let statusBg = 'bg-stone-100 text-stone-800 border-stone-200';
          if (s === 'Order Placed' || s === 'New')
            statusBg = 'bg-blue-100 text-blue-900 border-blue-300';
          else if (s === 'Confirmed')
            statusBg = 'bg-sky-100 text-sky-900 border-sky-300';
          else if (s === 'Packing')
            statusBg = 'bg-amber-100 text-amber-900 border-amber-300';
          else if (s === 'Packed')
            statusBg = 'bg-indigo-100 text-indigo-900 border-indigo-300';
          else if (s === 'Rider Assigned')
            statusBg = 'bg-purple-100 text-purple-900 border-purple-300';
          else if (s === 'Out for Delivery' || s === 'Order Dispatched')
            statusBg = 'bg-purple-100 text-purple-900 border-purple-300';
          else if (s === 'Delivered')
            statusBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              {/* Card Header: Order ID & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
                      Order ID
                    </span>
                    <span className="text-base font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
                      #{order.id}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusBg}`}
                  >
                    {s}
                  </span>
                </div>

                {/* Customer Details & Contact Actions */}
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/70 space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {order.address?.fullName || 'Customer'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {cleanPhone && (
                        <>
                          <a
                            href={`tel:${cleanPhone}`}
                            title="Call customer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-xl bg-white hover:bg-emerald-100 text-emerald-700 border border-stone-200 flex items-center justify-center transition-colors shadow-2xs"
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
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-xl bg-white hover:bg-emerald-100 text-emerald-700 border border-stone-200 flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>
                      {order.address?.houseFlat ? `${order.address.houseFlat}, ` : ''}
                      {order.address?.streetArea || order.address?.city || 'Nellore'}
                    </span>
                  </p>
                </div>

                {/* Product Items Breakdown preview */}
                <div className="space-y-2 mb-3">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                    Ordered Items ({order.items?.length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {order.items?.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 text-xs py-1 border-b border-stone-100 last:border-none"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.image || '/products/placeholder.svg'}
                            alt={it.productName}
                            className="w-7 h-7 object-contain rounded-md bg-white border border-stone-200 shrink-0 p-0.5"
                          />
                          <p className="text-stone-800 font-medium truncate">
                            <span className="font-bold text-stone-900">{it.quantity}×</span>{' '}
                            {it.productName}
                          </p>
                        </div>
                        <span className="font-bold text-stone-900 shrink-0">
                          ₹{(it.quantity * it.price) || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & Rider Info Row */}
                <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Total Bill:</span>
                    <span className="text-base font-black text-stone-900">₹{order.grandTotal}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Payment:</span>
                    <span
                      className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isPaid ? '✓ PAID ONLINE' : `COD: COLLECT ₹${order.grandTotal}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-500 font-medium">Rider:</span>
                    <span className="font-bold text-stone-800 flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{order.assignedRider?.name || 'Unassigned'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                {action && onUpdateStatus && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.id, action.next)}
                    className={`w-full py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs ${action.color}`}
                  >
                    <action.icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onViewOrder(order)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open Full Order &amp; Route</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-8">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-stone-800">No Orders Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search query or status filter to see other orders.
          </p>
        </div>
      )}
    </div>
  );
}
