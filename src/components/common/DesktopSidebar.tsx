import React from 'react';
import {
  Tag,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../data/mockData';

export const DesktopSidebar: React.FC = () => {
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    navigate,
    products,
    currentLocation,
    currentDeliveryZone,
  } = useApp();

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    navigate('category', { categoryId: catId });
  };

  return (
    <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-5 select-none">
      {/* Categories Navigation Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Grocery Categories
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-stone-400">
            {INITIAL_CATEGORIES.length}
          </span>
        </div>

        <nav className="p-2 space-y-0.5">
          {INITIAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = products.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  isSelected
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-[#2E7D32]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">
                    {cat.id === 'fruits-vegetables' && '🥦'}
                    {cat.id === 'dairy-bakery' && '🥛'}
                    {cat.id === 'rice-dal-atta' && '🌾'}
                    {cat.id === 'snacks' && '🍪'}
                    {cat.id === 'beverages' && '☕'}
                    {cat.id === 'personal-care' && '✨'}
                    {cat.id === 'household' && '🏠'}
                    {cat.id === 'baby-care' && '👶'}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Express Delivery Guarantee Card */}
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#1b5e20] text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFB74D] block">
              NELLORE EXPRESS
            </span>
            <h4 className="text-sm font-black leading-tight">
              {currentDeliveryZone?.estimatedDeliveryTimeText || '30-60 Min Delivery'}
            </h4>
          </div>
        </div>

        <p className="text-xs text-white/90 leading-relaxed font-normal">
          Direct from local G1 Mart hubs to your doorstep across Nellore city &amp; villages within 30 km.
        </p>

        <div className="pt-2 border-t border-white/20 space-y-1.5 text-[11px] text-white/90">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB74D] shrink-0" />
            <span>Free delivery on orders &gt; ₹{currentDeliveryZone?.freeDeliveryThreshold || 499}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB74D] shrink-0" />
            <span>Cash on Delivery (COD) supported</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB74D] shrink-0" />
            <span>100% farm-fresh replacement guarantee</span>
          </div>
        </div>

        <div className="pt-1">
          <div className="bg-black/20 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
            <span className="text-white/80">Active Zone:</span>
            <span className="font-bold text-white truncate max-w-[130px]">
              {currentDeliveryZone?.name || currentLocation.split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Support Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
          <span>G1 Mart Assured</span>
        </h4>

        <div className="space-y-2 text-xs text-stone-600">
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-stone-800">Supermarket Hours</p>
              <p className="text-[11px] text-stone-500">6:00 AM - 11:00 PM Daily</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-stone-800">Easy Returns</p>
              <p className="text-[11px] text-stone-500">Instant refund or replacement</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-stone-800">Helpdesk</p>
              <p className="text-[11px] text-stone-500">+91 40 2345 6789</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
