'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Upload, CheckCircle2, AlertCircle, Sparkles, Filter, Search, Loader2 } from 'lucide-react';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';
import ProductImage from '@/components/storefront/ProductImage';
import type { Product } from '@/types';

export default function PhotoQueuePage() {
  const [products, setProducts] = useState<Product[]>(MIGRATED_PRODUCT_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Stats
  const totalCount = products.length;
  const verifiedCount = useMemo(() => products.filter((p) => p.image_url && p.image_status === 'verified').length, [products]);
  const missingCount = totalCount - verifiedCount;
  const percentage = Math.round((verifiedCount / totalCount) * 100);

  // Compute Priorities: top 3 products of every sub-category get Priority 1
  const priorityMap = useMemo(() => {
    const map = new Map<string, number>();
    const subCatCounts = new Map<string, number>();

    // Sort products logically to assign top 3
    products.forEach((p) => {
      const sub = p.subCategory || 'General';
      const current = subCatCounts.get(sub) || 0;
      if (current < 3) {
        map.set(p.id, 1);
        subCatCounts.set(sub, current + 1);
      } else {
        map.set(p.id, 2);
      }
    });
    return map;
  }, [products]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  // Filtered queue items
  const queueItems = useMemo(() => {
    let list = products.filter((p) => !p.image_url || p.image_status !== 'verified');

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }

    // Sort Priority 1 first, then by name
    return list.sort((a, b) => {
      const pA = priorityMap.get(a.id) || 2;
      const pB = priorityMap.get(b.id) || 2;
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }, [products, selectedCategory, searchQuery, priorityMap]);

  const handleTriggerUpload = (p: Product) => {
    setTargetProduct(p);
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetProduct) return;

    setUploadingId(targetProduct.id);
    setUploadError(null);

    const formData = new FormData();
    formData.append('productId', targetProduct.id);
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/products/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Update state locally
      setProducts((prev) =>
        prev.map((p) =>
          p.id === targetProduct.id
            ? { ...p, image_url: data.imageUrl, imageUrl: data.imageUrl, image_status: 'verified', imageStatus: 'verified' }
            : p
        )
      );

      setUploadSuccessId(targetProduct.id);
      setTimeout(() => setUploadSuccessId(null), 3500);
    } catch (err: any) {
      setUploadError(`Failed to process ${targetProduct.name}: ${err.message}`);
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-2 sm:pt-4 px-2 sm:px-0">
      {/* Hidden file input for camera & gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-stone-900 leading-tight">Photo Queue</h1>
            <p className="text-[11px] text-stone-500 font-medium">Capture &amp; Publish Storefront Photos</p>
          </div>
        </div>

        {/* Live Counter Badge */}
        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
          <div className="text-xs font-black text-[#2E7D32] tabular-nums">
            {verifiedCount} / {totalCount} Done
          </div>
          <div className="text-[9px] font-bold text-stone-400">{missingCount} Photos Needed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700">
          <span>Catalog Photography Progress</span>
          <span className="text-[#2E7D32] tabular-nums">{percentage}% Complete</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#2E7D32] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-[10px] text-stone-400 font-medium pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Priority 1: Top 3 items per subcategory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-300" />
            <span>Priority 2: Long-tail catalog</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="search"
            placeholder="Search by product or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#2E7D32]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#2E7D32] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories ({queueItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                selectedCategory === c
                  ? 'bg-[#2E7D32] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Messages */}
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Queue Product List */}
      <div className="space-y-2">
        {queueItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-extrabold text-stone-800">All Photos Captured!</h3>
            <p className="text-xs text-stone-500">Every product in this category has a verified packshot.</p>
          </div>
        ) : (
          queueItems.map((p) => {
            const isP1 = priorityMap.get(p.id) === 1;
            const isUploading = uploadingId === p.id;
            const isSuccess = uploadSuccessId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-stone-200/90 p-3 shadow-2xs flex items-center justify-between gap-3 hover:border-stone-300 transition-colors"
              >
                {/* Left Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <ProductImage
                    imageUrl={p.image_url || p.imageUrl}
                    imageStatus={p.image_status || p.imageStatus}
                    alt={p.name}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">
                      {p.brand}
                    </span>
                    {isP1 ? (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight shrink-0">
                        Priority 1
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-500 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tight shrink-0">
                        Priority 2
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-extrabold text-stone-900 truncate leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-[10px] text-stone-400 truncate mt-0.5">
                    {p.subCategory || p.category} · {p.unit}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="shrink-0">
                  {isUploading ? (
                    <button
                      type="button"
                      disabled
                      className="h-9 px-3 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-wait"
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E7D32]" />
                      <span>Processing...</span>
                    </button>
                  ) : isSuccess ? (
                    <div className="h-9 px-3 bg-emerald-50 text-[#2E7D32] border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      <span>Published!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTriggerUpload(p)}
                      className="h-9 px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Take Photo</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
