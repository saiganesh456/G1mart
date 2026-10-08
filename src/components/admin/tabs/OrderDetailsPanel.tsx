import React from 'react';
import { Order } from '@/types';
import { ArrowLeft, CheckCircle2, MapPin, Phone } from 'lucide-react';

interface Props {
  order: Order;
  onBack: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function OrderDetailsPanel({ order, onBack, onUpdateStatus }: Props) {
  const isPaid = order.isPaid || order.paymentStatus === 'completed' || order.paymentStatus === 'manual_verified';
  
  // Current Order Status
  const s = order.status || 'Order Placed';
  
  // Pipeline logic based on strict backend enum
  const determinePrimaryAction = () => {
    if (s === 'Order Placed' || s === 'New') return { label: 'MARK AS PACKED', next: 'Packed' };
    if (s === 'Packed') return { label: 'DISPATCH RIDER', next: 'Order Dispatched' };
    if (s === 'Order Dispatched') return { label: 'MARK OUT FOR DELIVERY', next: 'Out for Delivery' };
    if (s === 'Out for Delivery') return { label: 'MARK DELIVERED', next: 'Delivered' };
    return null;
  };

  const primaryAction = determinePrimaryAction();

  const statuses = [
    'Order Placed', 'Packed', 'Order Dispatched', 'Out for Delivery', 'Delivered'
  ];
  const currentIndex = statuses.indexOf(s) >= 0 ? statuses.indexOf(s) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 overflow-y-auto flex flex-col sm:relative sm:z-auto sm:h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-800" />
        </button>
        <span className="font-black text-lg text-stone-900">#{order.id}</span>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4 pb-32">
        
        {/* CUSTOMER SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Customer</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-stone-900">{order.address?.fullName || 'Guest Customer'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <p className="text-sm font-semibold text-stone-600">{order.address?.mobileNumber || order.address?.phone || 'No phone'}</p>
              </div>
            </div>
            {(order.address?.mobileNumber || order.address?.phone) && (
              <a href={`tel:${order.address.mobileNumber || order.address.phone}`} className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <Phone className="w-4 h-4 fill-current" />
              </a>
            )}
          </div>
        </div>

        {/* DELIVERY SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Delivery</h3>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-800 leading-relaxed">
                {order.address?.houseFlat ? `${order.address.houseFlat}, ` : ''}
                {order.address?.streetArea}<br/>
                {order.address?.city || 'Nellore'} - {order.address?.pincode}
              </p>
              {order.address?.landmark && (
                <p className="text-xs text-stone-500 mt-1 italic">Near {order.address.landmark}</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-xs font-bold text-stone-500">Delivery Slot: <span className="text-stone-900">{order.slot || 'ASAP'}</span></p>
          </div>
        </div>

        {/* ORDER ITEMS SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Order Items ({order.items?.length || 0})</h3>
          <div className="space-y-4">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image || '/products/placeholder.svg'} 
                  alt={item.productName} 
                  className="w-14 h-14 object-contain bg-stone-50 border border-stone-200 rounded-xl p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-stone-900 leading-tight">{item.productName}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{item.quantity} × ₹{item.price}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-stone-900">₹{(item.quantity * item.price) || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Payment</h3>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-stone-600">Total Amount</span>
            <span className="text-xl font-black text-stone-900">₹{order.grandTotal}</span>
          </div>
          <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
            <span className="text-sm font-bold text-stone-900">{isPaid ? 'UPI / Online' : 'Cash on Delivery'}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {isPaid ? '🟢 PAID' : '🟠 COD'}
            </span>
          </div>
          {!isPaid && (
            <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-200 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-900">Amount to Collect</span>
              <span className="text-base font-black text-amber-900">₹{order.grandTotal}</span>
            </div>
          )}
        </div>

        {/* ORDER STATUS WORKFLOW */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Order Status Progression</h3>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
            {statuses.map((status, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <div key={status} className="relative flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white z-10 ${
                    isCompleted ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-stone-300 text-stone-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" /> : <div className="w-2 h-2 rounded-full bg-stone-300" />}
                  </div>
                  <span className={`text-sm font-bold ${isCurrent ? 'text-stone-900' : isCompleted ? 'text-stone-600' : 'text-stone-400'}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* PRIMARY ACTION BUTTON (FIXED BOTTOM) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 shadow-2xl sm:absolute sm:bottom-0 sm:mt-auto sm:border-none sm:shadow-none sm:bg-transparent sm:pt-4">
        {primaryAction ? (
          <button
            onClick={() => onUpdateStatus(order.id, primaryAction.next)}
            className="w-full max-w-2xl mx-auto block py-3.5 bg-[#2E7D32] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg active:scale-95 transition-transform"
          >
            {primaryAction.label}
          </button>
        ) : (
          <div className="w-full max-w-2xl mx-auto py-3.5 bg-stone-100 text-stone-500 rounded-2xl font-black text-sm tracking-widest uppercase text-center border border-stone-200">
            {s === 'Delivered' ? 'ORDER COMPLETED' : 'STATUS: ' + s.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
