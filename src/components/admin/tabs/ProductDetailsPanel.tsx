import React, { useState } from 'react';
import { Product, Category } from '@/types';
import {
  ArrowLeft,
  Check,
  RefreshCw,
  AlertCircle,
  Tag,
  Package,
  Layers,
  Sparkles,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import ProductImage from '@/components/storefront/ProductImage';

interface Props {
  product: Product;
  onBack: () => void;
  onSaveProduct?: (updatedProduct: Product) => Promise<boolean>;
  categories?: Category[];
}

export default function ProductDetailsPanel({
  product,
  onBack,
  onSaveProduct,
  categories = [],
}: Props) {
  const [name, setName] = useState(product.name || '');
  const [brand, setBrand] = useState(product.brand || '');
  const [unit, setUnit] = useState(product.unit || '1 unit');
  const [category, setCategory] = useState(product.category || 'grocery-staples');
  const [price, setPrice] = useState(String(product.price || 0));
  const [originalPrice, setOriginalPrice] = useState(String(product.originalPrice || product.price || 0));
  const [stockCount, setStockCount] = useState(String(product.stockCount || 15));
  const [inStock, setInStock] = useState(Boolean(product.inStock));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    const priceNum = parseFloat(price) || 0;
    const mrpNum = parseFloat(originalPrice) || priceNum;
    const stockNum = parseInt(stockCount, 10) || 0;

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      brand: brand.trim(),
      unit: unit.trim(),
      category: category.trim(),
      price: priceNum,
      originalPrice: mrpNum,
      discountPercentage: mrpNum > priceNum && mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
      stockCount: stockNum,
      inStock: inStock && stockNum > 0,
      priceConfirmed: priceNum > 0,
    };

    try {
      if (onSaveProduct) {
        const ok = await onSaveProduct(updatedProduct);
        if (ok) {
          setSaveSuccess(true);
          setTimeout(() => {
            onBack();
          }, 1000);
          return;
        }
      }

      // Fallback direct PATCH if onSaveProduct is not provided
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          unit: updatedProduct.unit,
          category: updatedProduct.category,
          price: updatedProduct.price,
          originalPrice: updatedProduct.originalPrice,
          inStock: updatedProduct.inStock,
          stockCount: updatedProduct.stockCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          onBack();
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Failed to update product');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-screen bg-[#F4F6F9] p-3 sm:p-6 pb-28">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center justify-between mb-4 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
              Edit Product Details
            </h1>
            <p className="text-xs text-stone-500">ID: {product.id}</p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {inStock ? '🟢 In Stock' : '🔴 Out of Stock'}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Product Photo & Identification Preview */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-stone-50 border border-stone-200 p-2 overflow-hidden shrink-0">
            <ProductImage
              imageUrl={product.image_url || product.imageUrl || product.image}
              imageStatus={product.imageStatus || product.image_status || 'VERIFIED'}
              alt={product.name}
            />
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
              {product.brand || 'G1 MART Brand'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-2">
              {product.name}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Unit: {product.unit} • Category: {product.category}
            </p>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
            Pricing &amp; Inventory Quantities
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Product updated successfully! Returning...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selling Price */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">The price customer pays at checkout</span>
            </div>

            {/* MRP / Original Price */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                MRP / Strikethrough Price (₹)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">Maximum Retail Price on packet</span>
            </div>

            {/* Stock Count */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockCount}
                onChange={(e) => {
                  setStockCount(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (n <= 0) setInStock(false);
                  else setInStock(true);
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">Available quantity in store rack</span>
            </div>

            {/* In Stock Toggle */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Availability Status
              </label>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all ${
                  inStock
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                <span>{inStock ? '✓ Mark as Available (In Stock)' : '✗ Mark as Out of Stock'}</span>
              </button>
            </div>
          </div>

          {/* Product Name & Details */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Product Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                  Unit / Pack Size
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-75 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Product Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
