'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCcw, ShoppingBag, ArrowRight, Check, AlertCircle, Bookmark, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';
import { resolveLegacyId } from '@/lib/legacyIdMap';
import ProductImage from '@/components/storefront/ProductImage';

const MONTHLY_LIST_KEY = 'g1mart_monthly_essentials';

export default function OrderAgainPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'monthly'>('orders');
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [monthlyList, setMonthlyList] = useState<any[]>([]);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    // Load recent order
    try {
      const rawOrder =
        sessionStorage.getItem('g1mart_latest_order') ||
        localStorage.getItem('g1mart_recent_order');
      if (rawOrder) {
        setRecentOrder(JSON.parse(rawOrder));
      }
    } catch {}

    // Load monthly essentials list
    try {
      const rawList = localStorage.getItem(MONTHLY_LIST_KEY);
      if (rawList) {
        setMonthlyList(JSON.parse(rawList));
      }
    } catch {}
  }, []);

  // Add all past order items to cart with validation review
  const handleAddAllPastOrder = () => {
    if (!recentOrder || !recentOrder.items) return;
    let addedCount = 0;
    let outOfStockCount = 0;

    recentOrder.items.forEach((item: any) => {
      const canonicalId = resolveLegacyId(item.productId) || item.productId;
      const prod = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId);
      if (prod && prod.inStock) {
        addToCart(prod, item.quantity || 1);
        addedCount++;
      } else {
        outOfStockCount++;
      }
    });

    if (outOfStockCount > 0) {
      setReviewNotice(`Added ${addedCount} items to cart. ${outOfStockCount} items were unavailable.`);
    } else {
      setReviewNotice(`Added all ${addedCount} items from your previous order to your cart!`);
    }

    setTimeout(() => {
      router.push('/cart');
    }, 1200);
  };

  // Add all monthly essentials to cart with validation review
  const handleAddAllMonthly = () => {
    if (monthlyList.length === 0) return;
    let addedCount = 0;
    let outOfStockCount = 0;

    monthlyList.forEach((item: any) => {
      const canonicalId = resolveLegacyId(item.productId) || item.productId;
      const prod = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId);
      if (prod && prod.inStock) {
        addToCart(prod, item.quantity || 1);
        addedCount++;
      } else {
        outOfStockCount++;
      }
    });

    if (outOfStockCount > 0) {
      setReviewNotice(`Added ${addedCount} essentials to cart. ${outOfStockCount} items are out of stock.`);
    } else {
      setReviewNotice(`Added all ${addedCount} essentials to your cart!`);
    }

    setTimeout(() => {
      router.push('/cart');
    }, 1200);
  };

  const removeMonthlyItem = (productId: string) => {
    const updated = monthlyList.filter((item) => item.productId !== productId);
    setMonthlyList(updated);
    try {
      localStorage.setItem(MONTHLY_LIST_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-2 px-1 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">
          Quick Repeat Ordering
        </h1>
        <p className="text-xs text-stone-500">
          Reorder past baskets or schedule monthly essentials in 1 tap.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-white text-[#2E7D32] shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Past Orders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'monthly'
              ? 'bg-white text-[#2E7D32] shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Monthly Essentials ({monthlyList.length})</span>
        </button>
      </div>

      {/* Review Feedback Notice */}
      {reviewNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>{reviewNotice}</span>
        </div>
      )}

      {/* Tab Content: Past Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {recentOrder ? (
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <span className="text-xs font-black text-[#212121]">Order #{recentOrder.id}</span>
                  <p className="text-[10px] text-stone-500">{recentOrder.date || 'Recent delivery'}</p>
                </div>
                <span className="text-xs font-black text-[#2E7D32]">
                  ₹{recentOrder.grandTotal || recentOrder.total}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {recentOrder.items?.map((item: any, idx: number) => {
                  const canonicalId = resolveLegacyId(item.productId) || item.productId;
                  const prod = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-stone-400 text-[10px]">{item.quantity}x</span>
                        <span className="font-semibold text-stone-800 truncate">{item.productName || prod?.name}</span>
                      </div>
                      <span className="font-bold text-stone-700 shrink-0 tabular-nums">
                        ₹{(item.price || prod?.price || 0) * (item.quantity || 1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <Link
                  href={`/orders/${recentOrder.id}`}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  View Details
                </Link>
                <button
                  type="button"
                  onClick={handleAddAllPastOrder}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Add All to Cart</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center space-y-3">
              <span className="text-3xl block">🛍️</span>
              <h3 className="text-sm font-bold text-stone-800">No Past Orders Found</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Once you place an order, it will appear here for instant 1-tap reordering.
              </p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1b5e20]"
              >
                Browse Storefront
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Monthly Essentials */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {monthlyList.length > 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <span className="text-xs font-black text-[#212121]">Monthly Grocery Essentials</span>
                  <p className="text-[10px] text-stone-500">{monthlyList.length} items configured</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAllMonthly}
                  className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add All to Cart</span>
                </button>
              </div>

              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto no-scrollbar">
                {monthlyList.map((item) => {
                  const canonicalId = resolveLegacyId(item.productId) || item.productId;
                  const prod = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId);
                  if (!prod) return null;
                  return (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-50 border border-stone-100 shrink-0">
                          <ProductImage imageUrl={prod.imageUrl} imageStatus={prod.imageStatus} alt={prod.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">{prod.name}</p>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {item.quantity}x {prod.unit} · ₹{(prod.price || prod.originalPrice) * item.quantity}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeMonthlyItem(item.productId)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-50 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center space-y-3">
              <span className="text-3xl block">📋</span>
              <h3 className="text-sm font-bold text-stone-800">Your Monthly List is Empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Add items to your cart, then tap <strong>&ldquo;Save as List&rdquo;</strong> to store your family&rsquo;s monthly grocery checklist here!
              </p>
              <Link
                href="/cart"
                className="inline-block px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1b5e20]"
              >
                Go to Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
