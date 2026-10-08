'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ScanBarcode, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SlipScannerModal from '@/components/storefront/SlipScannerModal';

interface MonthlyItem {
  id: string;
  name: string;
  brand: string;
  unit: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  category: string;
  selected: boolean;
}

const INITIAL_MONTHLY_BASKET: MonthlyItem[] = [
  {
    id: 'staple-atta',
    name: 'Aashirvaad Superior MP Shudh Chakki Atta',
    brand: 'Aashirvaad',
    unit: '5kg',
    price: 245,
    originalPrice: 275,
    quantity: 1,
    image: '/products/packshots/aashirvaad-atta.jpg',
    category: 'Staples',
    selected: true,
  },
  {
    id: 'staple-oil',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    unit: '1L',
    price: 135,
    originalPrice: 155,
    quantity: 2,
    image: '/products/packshots/sunflower-oil.jpg',
    category: 'Oils & Ghee',
    selected: true,
  },
  {
    id: 'staple-dal',
    name: 'Tata Sampann Unpolished Toor Dal',
    brand: 'Tata Sampann',
    unit: '1kg',
    price: 165,
    originalPrice: 185,
    quantity: 2,
    image: '/products/packshots/toor-dal.jpg',
    category: 'Dals & Pulses',
    selected: true,
  },
  {
    id: 'staple-salt',
    name: 'Tata Salt Vacuum Evaporated Iodised Salt',
    brand: 'Tata Salt',
    unit: '1kg',
    price: 28,
    originalPrice: 30,
    quantity: 1,
    image: '/products/packshots/tata-salt.jpg',
    category: 'Spices & Salt',
    selected: true,
  },
  {
    id: 'staple-milk',
    name: 'Amul Taaza Fresh Toned Milk',
    brand: 'Amul',
    unit: '500ml',
    price: 27,
    originalPrice: 27,
    quantity: 4,
    image: '/products/packshots/amul-milk.jpg',
    category: 'Dairy',
    selected: true,
  },
  {
    id: 'staple-tea',
    name: 'Wagh Bakri Premium Leaf Tea',
    brand: 'Wagh Bakri',
    unit: '250g',
    price: 130,
    originalPrice: 145,
    quantity: 1,
    image: '/products/packshots/wagh-bakri-tea.jpg',
    category: 'Beverages',
    selected: true,
  },
  {
    id: 'staple-maggi',
    name: 'Maggi 2-Minute Masala Instant Noodles (4-Pack)',
    brand: 'Nestle Maggi',
    unit: '280g',
    price: 56,
    originalPrice: 60,
    quantity: 2,
    image: '/products/packshots/maggi-noodles.jpg',
    category: 'Snacks & Quick Meals',
    selected: true,
  },
  {
    id: 'staple-mysore',
    name: 'Mysore Sandal Pure Sandalwood Soap',
    brand: 'Mysore Sandal',
    unit: '75g',
    price: 42,
    originalPrice: 45,
    quantity: 3,
    image: '/products/packshots/mysore-sandal-soap.jpg',
    category: 'Personal Care',
    selected: true,
  },
  {
    id: 'staple-colgate',
    name: 'Colgate Strong Teeth Dental Cream Toothpaste',
    brand: 'Colgate',
    unit: '100g',
    price: 65,
    originalPrice: 70,
    quantity: 1,
    image: '/products/packshots/colgate-toothpaste.jpg',
    category: 'Personal Care',
    selected: true,
  },
  {
    id: 'staple-surf',
    name: 'Surf Excel Easy Wash Detergent Powder',
    brand: 'Surf Excel',
    unit: '1kg',
    price: 140,
    originalPrice: 155,
    quantity: 2,
    image: '/products/packshots/surf-excel.jpg',
    category: 'Household Care',
    selected: true,
  },
  {
    id: 'staple-vim',
    name: 'Vim Dishwash Bar with Lemon',
    brand: 'Vim',
    unit: '300g',
    price: 30,
    originalPrice: 35,
    quantity: 2,
    image: '/products/packshots/vim-bar.jpg',
    category: 'Household Care',
    selected: true,
  },
  {
    id: 'staple-goodday',
    name: 'Britannia Good Day Butter Cookies',
    brand: 'Britannia',
    unit: '120g',
    price: 30,
    originalPrice: 35,
    quantity: 2,
    image: '/products/packshots/good-day.jpg',
    category: 'Snacks & Biscuits',
    selected: true,
  },
  {
    id: 'staple-dettol',
    name: 'Dettol Original Germ Protection Soap',
    brand: 'Dettol',
    unit: '75g',
    price: 40,
    originalPrice: 45,
    quantity: 2,
    image: '/products/packshots/dettol-soap.jpg',
    category: 'Personal Care',
    selected: true,
  },
  {
    id: 'staple-rava',
    name: 'Aashirvaad Superior Suji / Rava',
    brand: 'Aashirvaad',
    unit: '500g',
    price: 38,
    originalPrice: 42,
    quantity: 1,
    image: '/products/packshots/aashirvaad-suji-rava.jpg',
    category: 'Staples',
    selected: true,
  },
  {
    id: 'staple-kurkure',
    name: 'Kurkure Masala Munch Crunchy Snacks',
    brand: 'Kurkure',
    unit: '82g',
    price: 20,
    originalPrice: 20,
    quantity: 2,
    image: '/products/packshots/kurkure.jpg',
    category: 'Snacks',
    selected: true,
  },
];

export default function MonthlyListPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [basket, setBasket] = useState<MonthlyItem[]>(INITIAL_MONTHLY_BASKET);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const toggleSelect = (id: string) => {
    setBasket((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setBasket((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  };

  const selectedItems = basket.filter((item) => item.selected);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMrp = selectedItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - totalAmount);

  const handleAddAllToCart = () => {
    selectedItems.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercentage: item.originalPrice > item.price ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0,
        unit: item.unit,
        image: item.image,
        category: 'grocery-staples',
        brand: item.brand,
        description: item.name,
        rating: 4.8,
        reviewsCount: 15,
        inStock: true,
        stockCount: 50,
      }, item.quantity);
    });

    setAddedNotice(true);
    setTimeout(() => {
      router.push('/cart');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 pt-2">
      {/* Header Bar */}
      <div className="bg-white border-b border-stone-200/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 text-stone-700" />
          </Link>
          <div>
            <h1 className="text-base font-black text-[#212121] leading-tight">Monthly Grocery List</h1>
            <p className="text-[11px] text-stone-500">₹2,000–₹3,000 Curated Family Basket</p>
          </div>
        </div>

        {/* Scanner Shortcut Button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] border border-emerald-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <ScanBarcode className="w-4 h-4 stroke-[2.2]" />
          <span>Scan Slip</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 space-y-3">
        {/* Top Scanner Hero Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-[#1b5e20] text-white p-4 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold tracking-wide uppercase mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Zero Typing Needed</span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold leading-tight">
                Have a Handwritten Slip or Paper List?
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Scan your paper slip or upload an image. Our store will pack all items for you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="shrink-0 bg-white text-[#1b5e20] hover:bg-emerald-50 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <ScanBarcode className="w-4 h-4 stroke-[2.2]" />
              <span>Scan Paper Slip</span>
            </button>
          </div>
        </div>

        {/* Verification Summary Banner */}
        <div className="bg-white rounded-xl border border-stone-200/80 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold text-[#212121]">
              Pre-Packaged Family Essentials ({basket.length} items)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">
            Check or uncheck items below
          </span>
        </div>

        {/* Item Cards List */}
        <div className="space-y-2">
          {basket.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all p-3 flex items-center gap-3 ${
                item.selected
                  ? 'border-stone-200/90 shadow-2xs'
                  : 'border-stone-100 opacity-60 bg-stone-50/50'
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleSelect(item.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  item.selected
                    ? 'bg-[#2E7D32] text-white shadow-2xs'
                    : 'border-2 border-stone-300 bg-white'
                }`}
                aria-label={`Toggle ${item.name}`}
              >
                {item.selected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              {/* Product Packshot */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-stone-100 p-1 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider leading-none">
                  {item.brand}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#212121] leading-snug line-clamp-2 mt-0.5">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-[#212121] tabular-nums">
                    ₹{item.price * item.quantity}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-[10px] text-stone-400 line-through tabular-nums">
                      ₹{item.originalPrice * item.quantity}
                    </span>
                  )}
                  <span className="text-[10px] text-stone-500 font-medium">
                    ({item.unit} • ₹{item.price} ea)
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Remove */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                {item.selected && (
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 text-stone-700 active:bg-stone-200 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="w-7 text-center text-xs font-black tabular-nums text-[#212121]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 text-stone-700 active:bg-stone-200 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove from list"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-stone-500">
              {selectedItems.length} items selected
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-[#212121] tabular-nums">
                ₹{totalAmount}
              </span>
              {totalSavings > 0 && (
                <span className="text-xs font-bold text-[#2E7D32]">
                  Save ₹{totalSavings}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddAllToCart}
            disabled={selectedItems.length === 0}
            className="flex-1 max-w-xs h-12 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All to Cart (₹{totalAmount})</span>
          </button>
        </div>
      </div>

      {/* Slip Scanner Modal */}
      <SlipScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
