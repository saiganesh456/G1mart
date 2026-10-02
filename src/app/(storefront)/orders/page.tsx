'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, ArrowRight, Phone } from 'lucide-react';
import { formatIndianPhoneDisplay } from '@/lib/phone';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('g1mart_orders_list');
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch {}
    setLoaded(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      <h1 className="text-base sm:text-lg font-black text-[#212121]">My Orders</h1>

      {loaded && orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#212121]">No orders yet</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              When you place an order, you can track its live status, mobile confirmation, and receipts here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs hover:shadow-md transition-all space-y-2 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-extrabold text-xs text-[#212121] group-hover:text-[#2E7D32] transition-colors">
                    #{order.id}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">{order.date}</p>
                  {order.address?.phone && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {formatIndianPhoneDisplay(order.address.phone)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#2E7D32] block">
                    {order.status || 'Order Placed'}
                  </span>
                  {order.total > 0 && (
                    <span className="text-xs font-black text-stone-800">
                      ₹{order.total}
                    </span>
                  )}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <p className="text-[11px] text-stone-600 border-t border-stone-100 pt-2 line-clamp-1">
                  {order.items.map((i: any) => `${i.productName} (${i.quantity})`).join(', ')}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
