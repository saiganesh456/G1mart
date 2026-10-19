import React, { useState, useMemo } from 'react';
import { Order, StaffMember } from '@/types';
import {
  Search,
  Bike,
  Check,
  Truck,
  Trash2,
  X,
  Package,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import RiderAssignmentModal from '@/components/admin/RiderAssignmentModal';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';

function resolveOrderItemName(it: any): { name: string; image: string } {
  const pid = (it.productId || it.product_id || it.id || '').trim();
  const rawName = (it.productName || it.name || '').trim();

  let match = MIGRATED_PRODUCT_LIST.find(
    (p) =>
      p.id === pid ||
      p.id === rawName ||
      p.slug === rawName ||
      p.sku === rawName ||
      p.sku === pid
  );

  if (!match && rawName) {
    match = MIGRATED_PRODUCT_LIST.find(
      (p) => p.name.toLowerCase() === rawName.toLowerCase()
    );
  }

  const name =
    match?.name ||
    (rawName.startsWith('g1-') ? `Grocery Item (${rawName})` : rawName) ||
    'Grocery Item';
  const image = it.image || match?.imageUrl || match?.image || '/products/placeholder.svg';

  return { name, image };
}

interface Props {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus?: (
    orderId: string,
    status: string,
    assignedRider?: { id?: string; email?: string; name: string; phone?: string; vehicleNumber?: string }
  ) => void;
  onClearTestOrders?: () => void;
  availableRiders?: StaffMember[];
  onClearAllOrders?: () => void;
  initialFilter?: string;
}

export type QueueFilter = 'All' | 'Needs action' | 'Packing' | 'Ready for delivery' | 'Completed';

const QUEUE_FILTERS: QueueFilter[] = [
  'All',
  'Needs action',
  'Packing',
  'Ready for delivery',
  'Completed',
];

function getStatusBadge(status?: string) {
  const s = status || 'Order Placed';
  switch (s) {
    case 'Order Placed':
    case 'New':
      return { label: 'Order placed', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'Confirmed':
      return { label: 'Confirmed', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'Packing':
      return { label: 'Packing', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'Packed':
      return { label: 'Packed', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'Rider Assigned':
      return { label: 'Rider assigned', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'Out for Delivery':
    case 'Order Dispatched':
      return { label: 'Out for delivery', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'Delivered':
      return { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'Cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: s, bg: 'bg-stone-50 text-stone-700 border-stone-200' };
  }
}

export default function OrdersTab({
  orders,
  onViewOrder,
  onUpdateStatus,
  onClearTestOrders,
  availableRiders = [],
  onClearAllOrders,
  initialFilter = 'All',
}: Props) {
  const [search, setSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>(
    (initialFilter as QueueFilter) || 'All'
  );
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'paid'>('all');
  const [riderModalOrder, setRiderModalOrder] = useState<Order | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpand = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Live filter counts based on real database records
  const counts = useMemo(() => {
    let needsAction = 0;
    let packing = 0;
    let readyForDelivery = 0;
    let completed = 0;

    orders.forEach((o) => {
      const s = o.status || 'Order Placed';
      if (s === 'Order Placed' || s === 'New' || s === 'Confirmed') {
        needsAction++;
      } else if (s === 'Packing') {
        packing++;
      } else if (s === 'Packed' || s === 'Rider Assigned' || s === 'Out for Delivery' || s === 'Order Dispatched') {
        readyForDelivery++;
      } else if (s === 'Delivered') {
        completed++;
      }
    });

    return {
      All: orders.length,
      'Needs action': needsAction,
      Packing: packing,
      'Ready for delivery': readyForDelivery,
      Completed: completed,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = o.status || 'Order Placed';

      // 1. Queue Filter
      if (queueFilter === 'Needs action') {
        if (s !== 'Order Placed' && s !== 'New' && s !== 'Confirmed') return false;
      } else if (queueFilter === 'Packing') {
        if (s !== 'Packing') return false;
      } else if (queueFilter === 'Ready for delivery') {
        if (s !== 'Packed' && s !== 'Rider Assigned' && s !== 'Out for Delivery' && s !== 'Order Dispatched')
          return false;
      } else if (queueFilter === 'Completed') {
        if (s !== 'Delivered') return false;
      }

      // 2. Payment filter
      const isPaid =
        o.isPaid ||
        o.paymentStatus === 'completed' ||
        o.paymentStatus === 'manual_verified';
      if (paymentFilter === 'cod' && (isPaid || o.paymentMethod !== 'Cash on Delivery'))
        return false;
      if (paymentFilter === 'paid' && !isPaid) return false;

      // 3. Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchName = (o.address?.fullName || '').toLowerCase().includes(q);
        const matchPhone = (o.address?.mobileNumber || o.address?.phone || '').includes(q);
        const matchStreet = (o.address?.streetArea || o.address?.city || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchStreet) return false;
      }

      return true;
    });
  }, [orders, queueFilter, paymentFilter, search]);

  // Determine stage-appropriate primary action
  const getStageAction = (order: Order) => {
    const s = order.status || 'Order Placed';
    if (s === 'Order Placed' || s === 'New') {
      return {
        label: 'Confirm order →',
        next: 'Confirmed',
        requiresRiderModal: false,
      };
    }
    if (s === 'Confirmed') {
      return {
        label: 'Start packing →',
        next: 'Packing',
        requiresRiderModal: false,
      };
    }
    if (s === 'Packing') {
      return {
        label: 'Mark packed →',
        next: 'Packed',
        requiresRiderModal: false,
      };
    }
    if (s === 'Packed') {
      return {
        label: 'Appoint rider →',
        next: 'Rider Assigned',
        requiresRiderModal: true,
      };
    }
    if (s === 'Rider Assigned') {
      return {
        label: 'Dispatch order →',
        next: 'Out for Delivery',
        requiresRiderModal: false,
      };
    }
    if (s === 'Out for Delivery' || s === 'Order Dispatched') {
      return {
        label: 'Complete delivery →',
        next: 'Delivered',
        requiresRiderModal: false,
      };
    }
    if (s === 'Delivered') {
      return {
        label: 'View receipt →',
        next: null,
        requiresRiderModal: false,
      };
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-3 sm:p-6 pb-28 text-stone-900">
      {/* 1. COMPACT HEADER — Title & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Orders</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {filteredOrders.length}
            </span>
          </div>

          {/* Optional Test Order Cleanup */}
          {onClearAllOrders && (
            <button
              type="button"
              onClick={onClearAllOrders}
              className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              title="Clear test orders"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span className="hidden sm:inline">Clear Test Orders</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, customer name, phone, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#087F5B] transition-all shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. SIMPLE QUEUE FILTERS (Matches Reference Specification) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUEUE_FILTERS.map((filter) => {
            const isSelected = queueFilter === filter;
            const count = counts[filter] || 0;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setQueueFilter(filter)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#087F5B] text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200/90'
                }`}
              >
                <span>{filter}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
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

      {/* 3. COMPACT ORDER CARDS (Matches Reference Screenshot) */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const isPaid =
            order.isPaid ||
            order.paymentStatus === 'completed' ||
            order.paymentStatus === 'manual_verified';
          const status = order.status || 'Order Placed';
          const badge = getStatusBadge(status);
          const stageAction = getStageAction(order);
          const itemCount = order.items?.length || 0;
          const phone = order.address?.mobileNumber || order.address?.phone || '';
          const isExpanded = Boolean(expandedOrders[order.id]);

          return (
            <div
              key={order.id}
              onClick={() => onViewOrder(order)}
              className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs hover:shadow-xs transition-all space-y-2.5 cursor-pointer"
            >
              {/* Row 1: Order ID & Restrained Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-black text-stone-900 tracking-tight">
                  #{order.id}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Row 2: Customer Name */}
              <p className="text-sm font-semibold text-stone-900">
                {order.address?.fullName || 'Customer'}
              </p>

              {/* Row 3: Items Count, Total, and Payment Method Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-800">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} • ₹{order.grandTotal}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isPaid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-orange-50 text-orange-800 border-orange-200'
                  }`}
                >
                  {isPaid ? '✓ Paid' : 'COD'}
                </span>
              </div>

              {/* Row 4: Delivery Slot & Location Summary */}
              <p className="text-xs text-stone-500 font-medium truncate">
                {order.slot || 'Standard delivery'} •{' '}
                {order.address?.streetArea || order.address?.city || 'Nellore'}
              </p>

              {/* Expandable item checklist preview */}
              {itemCount > 0 && (
                <div className="pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(order.id, e)}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide items preview' : `View ${itemCount} items`}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1.5 pt-1.5 border-t border-stone-100">
                      {order.items?.map((it: any, idx: number) => {
                        const resolved = resolveOrderItemName(it);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={resolved.image}
                                alt={resolved.name}
                                className="w-6 h-6 object-contain rounded bg-stone-50 border border-stone-200 shrink-0 p-0.5"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                                }}
                              />
                              <span className="text-stone-800 truncate font-medium">
                                <span className="font-bold text-stone-900">{it.quantity}×</span>{' '}
                                {resolved.name}
                              </span>
                            </div>
                            <span className="font-bold text-stone-900 shrink-0">
                              ₹{(it.quantity * it.price) || 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Row 5: One Primary Action Button (Matches Reference: deep grocery green) */}
              <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                {stageAction && onUpdateStatus && stageAction.next ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (stageAction.requiresRiderModal) {
                        setRiderModalOrder(order);
                      } else {
                        onUpdateStatus(order.id, stageAction.next);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-[#087F5B] hover:bg-[#066c4d] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <span>{stageAction.label}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onViewOrder(order)}
                    className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{stageAction ? stageAction.label : 'View order details →'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/90 max-w-sm mx-auto my-6 space-y-2">
            <Package className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No orders match this filter</h3>
            <p className="text-xs text-stone-500">
              Try switching the queue filter or clearing your search query.
            </p>
          </div>
        )}
      </div>

      {/* Appoint Rider Modal */}
      <RiderAssignmentModal
        isOpen={Boolean(riderModalOrder)}
        onClose={() => setRiderModalOrder(null)}
        order={riderModalOrder}
        availableRiders={availableRiders}
        onAssignRider={(orderId, riderInfo) => {
          if (onUpdateStatus) {
            onUpdateStatus(orderId, 'Rider Assigned', riderInfo);
          }
          setRiderModalOrder(null);
        }}
      />
    </div>
  );
}
