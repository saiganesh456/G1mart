import React, { useState } from 'react';
import {
  Package,
  Clock,
  ArrowRight,
  RotateCw,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MyOrdersScreen: React.FC = () => {
  const { orders, navigate, addToCart, products } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'active') {
      return order.status !== 'Delivered' && order.status !== 'Cancelled';
    }
    if (filterTab === 'completed') {
      return order.status === 'Delivered';
    }
    return true;
  });

  const handleReorder = (order: typeof orders[0]) => {
    order.items.forEach((item) => {
      const match = products.find((p) => p.id === item.productId);
      if (match) {
        addToCart(match, item.quantity);
      }
    });
    navigate('cart');
  };

  return (
    <div className="flex-1 pb-24 space-y-5 max-w-4xl mx-auto w-full">
      {/* Top Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filterTab === 'all'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('active')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filterTab === 'active'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filterTab === 'completed'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isActive = order.status !== 'Delivered' && order.status !== 'Cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3"
              >
                {/* Header: ID, Date, Status */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#212121]">
                        #{order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 mt-0.5 block">
                      {order.date}
                    </span>
                  </div>

                  <span className="text-sm font-black text-[#212121] tabular-nums">
                    ₹{order.grandTotal}
                  </span>
                </div>

                {/* Items Thumbnails and Summary */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {order.items.map((it) => (
                    <div
                      key={it.productId}
                      className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-lg border border-stone-200/60 shrink-0"
                    >
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="w-7 h-7 rounded object-cover"
                      />
                      <span className="text-[10px] text-stone-600 font-semibold max-w-[80px] truncate">
                        {it.productName}
                      </span>
                      <span className="text-[9px] text-stone-400 font-bold">
                        x{it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-stone-500">
                    {order.paymentMethod}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-700 font-bold flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Reorder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('order_tracking', { orderId: order.id })}
                      className="px-3 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold flex items-center gap-1 text-[11px] shadow-2xs active:scale-95 transition-all"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200/80">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#212121]">No orders yet</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
            Place your first grocery order from G1 Mart with fresh fruits, milk and daily staples.
          </p>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="mt-4 px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};
