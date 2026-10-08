import React, { useState } from 'react';
import { Product, Category } from '@/types';
import { Search, Filter, X, Package } from 'lucide-react';
import ProductImage from '@/components/storefront/ProductImage';

interface Props {
  products: Product[];
  categories: Category[];
  onViewProduct: (product: Product) => void;
}

export default function InventoryTab({ products, categories, onViewProduct }: Props) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProducts = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
    if (stockFilter === 'In Stock' && !p.inStock) return false;
    if (stockFilter === 'Out of Stock' && p.inStock) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full bg-stone-50">
      {/* Header & Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 sm:px-6">
        <h1 className="text-xl font-bold text-stone-900 mb-3">Inventory</h1>
        <p className="text-xs text-stone-500 font-bold mb-3">{filteredProducts.length} Products</p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>
          <button 
            onClick={() => setShowFilters(true)}
            className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition-colors shrink-0"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 sm:p-6 space-y-3 pb-24 lg:pb-6 overflow-y-auto flex-1">
        {filteredProducts.map(p => (
          <div 
            key={p.id}
            onClick={() => onViewProduct(p)}
            className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-16 h-16 rounded-xl border border-stone-100 overflow-hidden bg-white p-1 shrink-0">
              <ProductImage imageUrl={p.image_url || p.imageUrl || p.image} alt={p.name} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-stone-900 leading-tight mb-0.5">{p.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{p.unit}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="font-black text-stone-900">₹{p.price}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {p.inStock ? '🟢 In Stock' : '🔴 Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-medium">No products match the filters.</div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-5 space-y-6 max-h-[85vh] overflow-y-auto pb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-stone-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-700">Stock Status</h3>
              <div className="flex flex-wrap gap-2">
                {['All', 'In Stock', 'Out of Stock'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setStockFilter(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${stockFilter === opt ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-stone-600 border-stone-200'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-700">Category</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => setCategoryFilter('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${categoryFilter === 'All' ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-stone-600 border-stone-200'}`}
                >
                  All
                </button>
                {categories.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setCategoryFilter(c.name)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${categoryFilter === c.name ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-stone-600 border-stone-200'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowFilters(false)}
              className="w-full py-3.5 bg-[#2E7D32] text-white rounded-xl font-black text-sm"
            >
              APPLY FILTERS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
