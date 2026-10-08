import React from 'react';
import { Product } from '@/types';
import { ArrowLeft, Edit2 } from 'lucide-react';
import ProductImage from '@/components/storefront/ProductImage';

interface Props {
  product: Product;
  onBack: () => void;
}

export default function ProductDetailsPanel({ product, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-50 overflow-y-auto flex flex-col sm:relative sm:z-auto sm:h-full">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-800" />
        </button>
        <span className="font-black text-lg text-stone-900">Product Details</span>
        <div className="w-9" />
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4 pb-24">
        {/* Main Info */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-2xl border border-stone-100 overflow-hidden bg-white mb-4 p-2">
            <ProductImage imageUrl={product.image_url || product.imageUrl || product.image} alt={product.name} />
          </div>
          <h2 className="text-xl font-bold text-stone-900 leading-tight mb-1">{product.name}</h2>
          <p className="text-sm text-stone-500 font-medium">{product.unit} • {product.brand}</p>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Selling Price</span>
            <span className="text-2xl font-black text-[#2E7D32]">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through ml-2">₹{product.originalPrice}</span>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Stock Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-bold text-stone-900 text-lg">{product.inStock ? 'In Stock' : 'Out'}</span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <span className="text-sm font-bold text-stone-500">Category</span>
            <span className="text-sm font-bold text-stone-900">{product.category}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <span className="text-sm font-bold text-stone-500">Subcategory</span>
            <span className="text-sm font-bold text-stone-900">{product.subCategory || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-stone-500">Verification</span>
            <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
              {product.image_status || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 shadow-2xl sm:absolute sm:bottom-0 sm:mt-auto sm:border-none sm:shadow-none sm:bg-transparent sm:pt-4">
        <button
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg transition-transform"
        >
          <Edit2 className="w-4 h-4" /> EDIT PRODUCT
        </button>
      </div>
    </div>
  );
}
