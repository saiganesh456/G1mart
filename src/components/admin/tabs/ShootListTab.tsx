'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  FolderUp,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import type { Category, Product } from '@/types';
import ProductImage from '@/components/storefront/ProductImage';
import categoryTilesMap from '@/data/categoryTiles.json';

interface Props {
  products: Product[];
  categories: Category[];
  onProductUpdated?: (updated: Product) => void;
}

interface HeroItem {
  category: string;
  subCategory: string;
  brand: string;
  productId: string;
  name: string;
  size: string;
  done: boolean;
}

export default function ShootListTab({ products, categories, onProductUpdated }: Props) {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bulk importer state
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // Camera capture target
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Collages cache buster to force live refresh
  const [collageKey, setCollageKey] = useState<number>(Date.now());

  // Products map
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Group hero products by category
  // Hero shots guide items + top items
  const categoryGroups = useMemo(() => {
    return categories.map((cat) => {
      const catProds = products.filter(
        (p) => p.category === cat.id || p.category_id === cat.id
      );

      // Hero products: verified first, then popular, up to 4
      const heroCandidates = [...catProds].sort((a, b) => {
        const aVer = a.image_status === 'verified' ? 1 : 0;
        const bVer = b.image_status === 'verified' ? 1 : 0;
        if (aVer !== bVer) return bVer - aVer;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });

      const heroes = heroCandidates.slice(0, 4);
      const verifiedHeroes = heroes.filter((p) => p.image_status === 'verified');

      // Top brands in this category
      const brandCounts = new Map<string, { count: number; bestProd: Product }>();
      catProds.forEach((p) => {
        const b = p.brand;
        if (b && b !== 'G1 Mart' && b !== 'Local / Unbranded') {
          const existing = brandCounts.get(b);
          if (!existing) {
            brandCounts.set(b, { count: 1, bestProd: p });
          } else {
            existing.count += 1;
            if (p.image_status === 'verified' && existing.bestProd.image_status !== 'verified') {
              existing.bestProd = p;
            }
          }
        }
      });

      const topBrands = Array.from(brandCounts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8);

      const tileUrl = (categoryTilesMap as Record<string, string>)[cat.id] || `/categories/collages/${cat.id}.webp`;

      return {
        category: cat,
        heroes,
        verifiedHeroesCount: verifiedHeroes.length,
        totalHeroesCount: heroes.length,
        topBrands,
        allProds: catProds,
        tileUrl,
      };
    });
  }, [categories, products]);

  // Toggle category accordion
  const toggleCat = (catId: string) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Open native camera for product
  const handleOpenShoot = (p: Product) => {
    setTargetProduct(p);
    setErrorMessage(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  // Handle camera photo capture
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetProduct) return;

    setUploadingId(targetProduct.id);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('productId', targetProduct.id);
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/products/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process shot');

      setUploadSuccessId(targetProduct.id);
      setCollageKey(Date.now());

      if (onProductUpdated) {
        onProductUpdated({
          ...targetProduct,
          image_url: data.imageUrl,
          image_status: 'verified',
        });
      }

      setTimeout(() => setUploadSuccessId(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing photo');
    } finally {
      setUploadingId(null);
    }
  };

  // Handle bulk file importer
  const handleBulkFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBulkUploading(true);
    setBulkStatus(`Uploading & processing ${files.length} photos...`);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk upload failed');

      setBulkStatus(`Processed ${data.processed} photos (${data.successCount} verified & published).`);
      setCollageKey(Date.now());
      setTimeout(() => setBulkStatus(null), 5000);
    } catch (err: any) {
      setBulkStatus(`Error: ${err.message}`);
    } finally {
      setBulkUploading(false);
      if (bulkInputRef.current) bulkInputRef.current.value = '';
    }
  };

  // Download images needed CSV
  const handleDownloadImagesNeeded = () => {
    window.open('/audit/images-needed.csv', '_blank');
  };

  const totalHeroes = categoryGroups.reduce((acc, c) => acc + c.totalHeroesCount, 0);
  const totalVerifiedHeroes = categoryGroups.reduce((acc, c) => acc + c.verifiedHeroesCount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
      <input
        ref={bulkInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleBulkFiles}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <h2 className="text-base font-extrabold tracking-tight">Product Shoot List</h2>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
            {totalVerifiedHeroes}/{totalHeroes} Hero Shots
          </span>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          Tap any product to open your phone camera. Photos are automatically cut out onto an 800x800 transparent canvas and published live to store collages.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => bulkInputRef.current?.click()}
            disabled={bulkUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#1B5E20] hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs"
          >
            {bulkUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderUp className="w-3.5 h-3.5" />}
            <span>Bulk Import (&lt;id&gt;.jpg)</span>
          </button>

          <a
            href="/api/admin/products"
            onClick={(e) => {
              e.preventDefault();
              handleDownloadImagesNeeded();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Images Needed CSV</span>
          </a>
        </div>

        {bulkStatus && (
          <div className="text-xs font-medium bg-black/20 px-3 py-1.5 rounded-lg text-emerald-100">
            {bulkStatus}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Category Accordion List */}
      <div className="space-y-3">
        {categoryGroups.map((group) => {
          const isExpanded = expandedCats[group.category.id] ?? true;
          const isComplete = group.verifiedHeroesCount === group.totalHeroesCount && group.totalHeroesCount > 0;

          return (
            <div
              key={group.category.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all"
            >
              {/* Category Header Row */}
              <button
                type="button"
                onClick={() => toggleCat(group.category.id)}
                className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category Collage Preview Thumbnail */}
                  <div className="w-12 h-12 rounded-xl border border-stone-200 overflow-hidden bg-stone-50 shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${group.tileUrl}?k=${collageKey}`}
                      alt={group.category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-stone-900 truncate">
                      {group.category.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs font-black ${
                          isComplete ? 'text-[#2E7D32]' : 'text-stone-600'
                        }`}
                      >
                        {group.verifiedHeroesCount}/{group.totalHeroesCount}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        ({group.allProds.length} items total)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isComplete ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#2E7D32] text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                      Need {group.totalHeroesCount - group.verifiedHeroesCount}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </button>

              {/* Expanded Category Content */}
              {isExpanded && (
                <div className="border-t border-stone-100 p-3 bg-stone-50/40 space-y-3">
                  {/* Live Preview Bar: Category Tile Collage & Brand Rail Icons */}
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <div className="shrink-0 text-center">
                      <div className="w-14 h-14 rounded-xl border border-stone-200 overflow-hidden bg-stone-50 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${group.tileUrl}?k=${collageKey}`}
                          alt="Collage Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-stone-500 block mt-1">Tile Preview</span>
                    </div>

                    {/* Brand Rail Thumbnails */}
                    {group.topBrands.length > 0 && (
                      <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                        {group.topBrands.map(([brandName, { bestProd }]) => {
                          const isVerified = bestProd.image_status === 'verified';
                          return (
                            <div key={brandName} className="shrink-0 text-center w-12">
                              <div
                                className={`w-11 h-11 mx-auto rounded-full border p-0.5 flex items-center justify-center overflow-hidden bg-white shadow-2xs ${
                                  isVerified ? 'border-[#2E7D32] ring-1 ring-[#2E7D32]/30' : 'border-stone-200'
                                }`}
                              >
                                {isVerified && bestProd.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={bestProd.image_url}
                                    alt={brandName}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-xs font-black text-stone-400">
                                    {brandName[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-semibold text-stone-600 block truncate mt-0.5">
                                {brandName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hero Products List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block px-1">
                      Hero Products (Top 4)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.heroes.map((hero) => {
                        const isVerified = hero.image_status === 'verified';
                        const isUploading = uploadingId === hero.id;
                        const isSuccess = uploadSuccessId === hero.id;

                        return (
                          <div
                            key={hero.id}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isVerified
                                ? 'bg-white border-emerald-200'
                                : 'bg-white border-stone-200 hover:border-[#2E7D32]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                                <ProductImage
                                  imageUrl={hero.image_url}
                                  imageStatus={hero.image_status}
                                  alt={hero.name}
                                  name={hero.name}
                                  brand={hero.brand}
                                  subCategory={hero.subCategory}
                                  category={hero.category}
                                />
                              </div>

                              <div className="min-w-0">
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block truncate">
                                  {hero.brand}
                                </span>
                                <h4 className="text-xs font-bold text-stone-900 truncate">
                                  {hero.name}
                                </h4>
                                <span className="text-[10px] text-stone-500">
                                  {hero.unit || '1 unit'} · {hero.id}
                                </span>
                              </div>
                            </div>

                            {/* Camera Action Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenShoot(hero)}
                              disabled={isUploading}
                              className={`shrink-0 h-8 px-2.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                                isSuccess
                                  ? 'bg-[#2E7D32] text-white'
                                  : isVerified
                                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                  : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-xs'
                              }`}
                            >
                              {isUploading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isSuccess ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Camera className="w-3.5 h-3.5" />
                              )}
                              <span>{isVerified ? 'Reshoot' : 'Shoot'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
