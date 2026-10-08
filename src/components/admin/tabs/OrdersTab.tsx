import React, { useState } from 'react';
import { Order } from '@/types';
import { Search, ChevronRight } from 'lucide-react';

interface Props {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  initialFilter?: string;
}

const STATUS_FILTERS = ['All', 'New', 'Packing', 'Ready', 'Out for Delivery', 'Delivered'];

export default function OrdersTab({ orders, onViewOrder, initialFilter = 'All' }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const filteredOrders = orders.filter(o => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      const matchId = o.id?.toLowerCase().includes(q);
      const matchName = o.address?.fullName?.toLowerCase().includes(q);
      const matchPhone = (o.address?.mobileNumber || o.address?.phone || '').includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    // Status Filter
    if (filter !== 'All') {
      const status = o.status || 'New';
      if (filter === 'New' && (status === 'Order Placed' || status === 'New')) return true;
      if (filter === 'Packing' && (status === 'Confirmed' || status === 'Packing')) return true;
      if (filter === 'Ready' && (status === 'Packed' || status === 'Ready')) return true;
      if (filter === 'Out for Delivery' && (status === 'Out for Delivery' || status === 'Order Dispatched' || status === 'Assigned' || status === 'Picked Up')) return true;
      if (filter === 'Delivered' && status === 'Delivered') return true;
      if (status !== filter) return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full bg-stone-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 sm:px-6">
        <h1 className="text-xl font-bold text-stone-900 mb-3">Orders</h1>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search order or customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#2E7D32]"
          />
        </div>

        {/* Scrollable Filters */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                filter === f 
                  ? 'bg-[#1B5E20] text-white' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 sm:p-6 space-y-3 pb-24 lg:pb-6 overflow-y-auto flex-1">
        {filteredOrders.map(order => {
          const isPaid = order.isPaid || order.paymentStatus === 'completed' || order.paymentStatus === 'manual_verified';
          const statusStr = order.status || 'New';
          
          let statusColor = 'bg-stone-100 text-stone-800';
          let statusIndicator = '⚪';
          if (statusStr.includes('New') || statusStr.includes('Placed')) {
            statusColor = 'bg-blue-100 text-blue-800';
            statusIndicator = '🔵';
          } else if (statusStr.includes('Packing') || statusStr.includes('Confirmed') || statusStr.includes('Packed')) {
            statusColor = 'bg-amber-100 text-amber-800';
            statusIndicator = '🟡';
          } else if (statusStr.includes('Delivered')) {
            statusColor = 'bg-green-100 text-green-800';
            statusIndicator = '🟢';
          } else if (statusStr.includes('Out') || statusStr.includes('Dispatch')) {
            statusColor = 'bg-purple-100 text-purple-800';
            statusIndicator = '🟣';
          }

          return (
            <div 
              key={order.id} 
              onClick={() => onViewOrder(order)}
              className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-stone-900 text-lg">#{order.id}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusColor}`}>
                  <span>{statusIndicator}</span> {statusStr.toUpperCase()}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="font-bold text-stone-800">{order.address?.fullName || 'Customer'}</p>
                <p className="text-sm text-stone-500 mt-1">
                  {order.items?.slice(0, 2).map((it: any) => `${it.quantity}x ${it.productName}`).join(', ')}
                  {order.items && order.items.length > 2 ? ` + ${order.items.length - 2} more` : ''}
                </p>
                <p className="text-xs font-black text-stone-900 mt-1.5 bg-stone-100 inline-block px-2 py-0.5 rounded-md">
                  {order.items?.length || 0} items • ₹{order.grandTotal}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-stone-500 border-t border-stone-100 pt-3">
                <span className="flex items-center gap-1">
                  {isPaid ? <span className="text-green-600">✓ PAID</span> : <span className="text-amber-600">COD</span>}
                  <span className="text-stone-300">•</span>
                  <span>{order.slot || 'ASAP'}</span>
                </span>
                
                <span className="text-[#2E7D32] flex items-center gap-0.5">
                  View Order <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-medium">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
