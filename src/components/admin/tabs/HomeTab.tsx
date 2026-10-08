import React from 'react';
import { Order } from '@/types';
import { Package, Truck, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onNavigateToOrders: (status?: string) => void;
}

export default function HomeTab({ orders, onViewOrder, onNavigateToOrders }: Props) {
  const newOrdersCount = orders.filter(o => !o.status || o.status === 'Order Placed' || o.status === 'New').length;
  const packingCount = orders.filter(o => o.status === 'Packing' || o.status === 'Confirmed').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Order Dispatched').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="G1 MART Logo" className="w-12 h-12 rounded-xl object-contain shadow-sm border border-stone-100" />
        <div>
          <h1 className="text-xl font-bold text-stone-900">Good Evening 👋</h1>
          <p className="text-sm font-black text-[#2E7D32] tracking-wide">G1 MART ADMIN</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div onClick={() => onNavigateToOrders('New')} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm cursor-pointer hover:border-[#2E7D32] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">New Orders</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Circle className="w-4 h-4 fill-current" />
            </div>
          </div>
          <p className="text-3xl font-black text-stone-900 mt-2">{newOrdersCount}</p>
        </div>

        <div onClick={() => onNavigateToOrders('Packing')} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm cursor-pointer hover:border-[#2E7D32] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Packing</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-stone-900 mt-2">{packingCount}</p>
        </div>

        <div onClick={() => onNavigateToOrders('Out for Delivery')} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm cursor-pointer hover:border-[#2E7D32] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider leading-tight">Out for<br/>Delivery</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-stone-900 mt-2">{outForDeliveryCount}</p>
        </div>

        <div onClick={() => onNavigateToOrders('Delivered')} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm cursor-pointer hover:border-[#2E7D32] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-stone-900 mt-2">{deliveredCount}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900">RECENT ORDERS</h2>
          <button onClick={() => onNavigateToOrders()} className="text-sm font-bold text-[#2E7D32]">View All</button>
        </div>
        <div className="space-y-3">
          {recentOrders.map(order => (
            <div key={order.id} onClick={() => onViewOrder(order)} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between cursor-pointer active:bg-stone-50 transition-colors">
              <div>
                <p className="font-bold text-stone-900">#{order.id}</p>
                <p className="text-xs text-stone-500 mt-0.5">{order.items?.length || 0} items • ₹{order.grandTotal}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  {order.status || 'New'}
                </span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="text-center py-6 text-stone-500 text-sm">No recent orders</div>
          )}
        </div>
      </div>
    </div>
  );
}
