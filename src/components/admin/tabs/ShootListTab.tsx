'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  Search,
  X,
  ZoomIn,
  Image as ImageIcon,
  Check,
  Smartphone,
  Eye,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import type { Category, Product } from '@/types';
import ProductImage from '@/components/storefront/ProductImage';
import categoryTilesMap from '@/data/categoryTiles.json';

interface Props {
  products: Product[];
  categories: Category[];
  onProductUpdated?: (updated: Product) => void;
  onBackToDashboard?: () => void;
}

export default function ShootListTab({ products, categories, onProductUpdated, onBackToDashboard }: Props) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_shoot' | 'verified'>('all');

  // Accordion state
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [showAllProductsCats, setShowAllProductsCats] = useState<Record<string, boolean>>({});

  // Action / Upload state
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Action Sheets
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [actionSheetProduct, setActionSheetProduct] = useState<Product | null>(null);
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);
  const [pendingReview, setPendingReview] = useState<{
    product: Product;
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isProcessingReview, setIsProcessingReview] = useState(false);

  // Bulk importer state
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // Hidden File Inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // Cache buster for live collage updates
  const [collageKey, setCollageKey] = useState<number>(Date.now());

  // Storewide metrics
  const totalProducts = products.length;
  const verifiedProducts = useMemo(
    () => products.filter((p) => p.image_status === 'verified'),
    [products]
  );
  const unverifiedProducts = useMemo(
    () => products.filter((p) => p.image_status !== 'verified'),
    [products]
  );
  const verifiedCount = verifiedProducts.length;
  const unverifiedCount = unverifiedProducts.length;
  const percentVerified = totalProducts > 0 ? Math.round((verifiedCount / totalProducts) * 100) : 0;

  // Process and group category data with search & status filters
  const categoryGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return categories
      .map((cat) => {
        let catProds = products.filter(
          (p) => p.category === cat.id || p.category_id === cat.id
        );

        // Apply status filter
        if (statusFilter === 'needs_shoot') {
          catProds = catProds.filter((p) => p.image_status !== 'verified');
        } else if (statusFilter === 'verified') {
          catProds = catProds.filter((p) => p.image_status === 'verified');
        }

        // Apply search query
        if (q) {
          catProds = catProds.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.id.toLowerCase().includes(q) ||
              (p.subCategory && p.subCategory.toLowerCase().includes(q))
          );
        }

        // Hero products (sorted by popularity / verified)
        const heroCandidates = [...catProds].sort((a, b) => {
          const aVer = a.image_status === 'verified' ? 1 : 0;
          const bVer = b.image_status === 'verified' ? 1 : 0;
          if (aVer !== bVer) return bVer - aVer;
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        });

        const heroes = heroCandidates.slice(0, 4);
        const verifiedHeroes = heroes.filter((p) => p.image_status === 'verified');
        const verifiedAll = catProds.filter((p) => p.image_status === 'verified');
        const tileUrl =
          (categoryTilesMap as Record<string, string>)[cat.id] ||
          `/categories/collages/${cat.id}.webp`;

        return {
          category: cat,
          allProds: catProds,
          heroes,
          verifiedHeroesCount: verifiedHeroes.length,
          totalHeroesCount: heroes.length,
          verifiedCount: verifiedAll.length,
          totalCount: catProds.length,
          tileUrl,
        };
      })
      .filter((group) => {
        // If category filter is active, only show selected category
        if (selectedCatId !== 'all' && group.category.id !== selectedCatId) {
          return false;
        }
        // If searching or filtering, only show categories with matching products
        if ((searchQuery.trim() || statusFilter !== 'all') && group.allProds.length === 0) {
          return false;
        }
        return true;
      });
  }, [categories, products, searchQuery, statusFilter, selectedCatId]);

  // Toggle category accordion
  const toggleCat = (catId: string) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Toggle showing all products in a category
  const toggleShowAll = (catId: string) => {
    setShowAllProductsCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Open capture action sheet for a product
  const handleOpenActionSheet = (p: Product) => {
    setTargetProduct(p);
    setActionSheetProduct(p);
    setErrorMessage(null);
  };

  // Open camera directly
  const handleTriggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
    setActionSheetProduct(null);
  };

  // Open gallery picker directly
  const handleTriggerGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
    setActionSheetProduct(null);
  };

  // When photo file is captured/selected
  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetProduct) return;

    const previewUrl = URL.createObjectURL(file);
    setPendingReview({
      product: targetProduct,
      file,
      previewUrl,
    });
  };

  // Confirm and upload photo to server processor
  const handleConfirmUpload = async () => {
    if (!pendingReview) return;
    const { product, file } = pendingReview;

    setIsProcessingReview(true);
    setUploadingId(product.id);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('productId', product.id);
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/products/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process shelf packshot');

      setUploadSuccessId(product.id);
      setCollageKey(Date.now());

      if (onProductUpdated) {
        onProductUpdated({
          ...product,
          image_url: data.imageUrl,
          image_status: 'verified',
        });
      }

      setPendingReview(null);
      setTimeout(() => setUploadSuccessId(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing photo');
    } finally {
      setIsProcessingReview(false);
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

  return (
    <div className="space-y-4 pb-36">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelected}
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

      {/* 1. Compact, Professional Studio Header */}
      <div className="bg-gradient-to-br from-[#14532D] via-[#1B5E20] to-[#2E7D32] rounded-3xl p-4 sm:p-5 text-white shadow-sm transition-all space-y-3">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all shrink-0 border border-white/15 cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight whitespace-nowrap">Product Studio</h2>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                  Shelf Packshots
                </span>
              </div>
            </div>
          </div>

          {/* Live Progress Pill */}
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-black text-white">
                {verifiedCount}/{totalProducts}
              </span>
              <span className="text-[10px] text-emerald-200 font-bold">({percentVerified}%)</span>
            </div>
          </div>
        </div>

        {/* Subtitle - Full Width */}
        <p className="text-xs text-emerald-100/90 font-medium">
          Snap or upload shelf packshots · Auto-cutout onto clean white background
        </p>

        {/* Quick Utility Chips */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => bulkInputRef.current?.click()}
            disabled={bulkUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#1B5E20] hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {bulkUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderUp className="w-3.5 h-3.5" />}
            <span>Bulk Upload Photos</span>
          </button>

          <a
            href="/audit/images-needed.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </a>
        </div>

        {bulkStatus && (
          <div className="text-xs font-medium bg-black/25 px-3 py-2 rounded-xl text-emerald-100 mt-2 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{bulkStatus}</span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Sticky Search & Filter Control Bar */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md py-2.5 px-1 border-b border-stone-200/80 -mx-1 sm:-mx-2 space-y-2.5 shadow-2xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, brand, or SKU..."
            className="w-full bg-stone-100/80 focus:bg-white text-stone-900 pl-10 pr-9 py-2 rounded-2xl border border-transparent focus:border-[#2E7D32] text-xs font-medium outline-hidden transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Category Pill Strip */}
        <div className="flex items-center justify-between gap-2">
          {/* Status Segmented Control */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl shrink-0 text-[11px] font-bold text-stone-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'hover:text-stone-900'
              }`}
            >
              All ({totalProducts})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('needs_shoot')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'needs_shoot'
                  ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
                  : 'hover:text-stone-900'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Needs ({unverifiedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('verified')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'verified'
                  ? 'bg-white text-[#2E7D32] shadow-2xs font-extrabold'
                  : 'hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
              <span>Verified ({verifiedCount})</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Quick-Jump Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-1">
          <button
            type="button"
            onClick={() => setSelectedCatId('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              selectedCatId === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(isSelected ? 'all' : cat.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#1B5E20] text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Groups List */}
      {categoryGroups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">No matching products found</h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search query or switching the status filter back to &ldquo;All&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoryGroups.map((group) => {
            const isExpanded = expandedCats[group.category.id] ?? true;
            const isShowingAll = showAllProductsCats[group.category.id] || Boolean(searchQuery.trim());
            const displayProducts = isShowingAll ? group.allProds : group.heroes;
            const isComplete =
              group.verifiedCount === group.totalCount && group.totalCount > 0;

            return (
              <div
                key={group.category.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all"
              >
                {/* Category Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleCat(group.category.id)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-stone-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 shrink-0 relative shadow-2xs">
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
                            isComplete ? 'text-[#2E7D32]' : 'text-amber-700'
                          }`}
                        >
                          {group.verifiedCount}/{group.totalCount} packshots verified
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {isComplete ? '(100% complete)' : `(${group.totalCount - group.verifiedCount} need shoot)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isComplete ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#2E7D32] text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        Need {group.totalCount - group.verifiedCount}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Category Products */}
                {isExpanded && (
                  <div className="border-t border-stone-100 p-3 bg-stone-50/40 space-y-3">
                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {displayProducts.map((p) => {
                        const isVerified = p.image_status === 'verified';
                        const isUploading = uploadingId === p.id;
                        const isSuccess = uploadSuccessId === p.id;

                        return (
                          <div
                            key={p.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isVerified
                                ? 'bg-white border-emerald-100 hover:border-emerald-300'
                                : 'bg-white border-stone-200/90 hover:border-[#2E7D32]'
                            } shadow-2xs`}
                          >
                            {/* Product Info & Thumbnail */}
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => setZoomProduct(p)}
                                title="Tap to zoom packshot"
                                className="w-13 h-13 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center relative group active:scale-95 transition-transform cursor-pointer"
                              >
                                <ProductImage
                                  imageUrl={p.image_url}
                                  imageStatus={p.image_status}
                                  alt={p.name}
                                  name={p.name}
                                  brand={p.brand}
                                  subCategory={p.subCategory}
                                  category={p.category}
                                />
                                {isVerified ? (
                                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                    <Sparkles className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </button>

                              <div className="min-w-0">
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block truncate">
                                  {p.brand || 'G1 Mart'}
                                </span>
                                <h4
                                  title={p.name}
                                  className="text-xs font-bold text-stone-900 line-clamp-1 leading-snug"
                                >
                                  {p.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-500 font-medium">
                                  <span>{p.unit || '1 unit'}</span>
                                  <span>·</span>
                                  <span className="font-mono text-stone-400 text-[9px]">{p.id}</span>
                                </div>
                              </div>
                            </div>

                            {/* Shoot / Reshoot Action Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenActionSheet(p)}
                              disabled={isUploading}
                              className={`shrink-0 h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                                isSuccess
                                  ? 'bg-[#2E7D32] text-white'
                                  : isVerified
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] border border-emerald-200'
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

                    {/* Toggle All Products in Category */}
                    {group.allProds.length > 4 && !searchQuery.trim() && (
                      <div className="pt-1 text-center">
                        <button
                          type="button"
                          onClick={() => toggleShowAll(group.category.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-extrabold text-stone-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          {isShowingAll ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                              <span>Show top 4 hero products only</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                View all {group.allProds.length} products in {group.category.name} (
                                {group.allProds.length - 4} more)
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Action Sheet: Capture Method Selector */}
      {actionSheetProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200/90 p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Header / Target Product Summary */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <ProductImage
                    imageUrl={actionSheetProduct.image_url}
                    imageStatus={actionSheetProduct.image_status}
                    alt={actionSheetProduct.name}
                    name={actionSheetProduct.name}
                    brand={actionSheetProduct.brand}
                    subCategory={actionSheetProduct.subCategory}
                    category={actionSheetProduct.category}
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    {actionSheetProduct.brand}
                  </span>
                  <h3 className="text-xs font-bold text-stone-900 truncate">
                    {actionSheetProduct.name}
                  </h3>
                  <span className="text-[10px] text-stone-500">
                    {actionSheetProduct.unit} · {actionSheetProduct.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActionSheetProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shoot Mode Options */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="w-full p-3.5 rounded-2xl bg-[#1B5E20] hover:bg-[#14532D] text-white flex items-center gap-3 transition-all font-bold text-xs shadow-xs cursor-pointer active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm">Take Photo with Camera</div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    Walk the store aisle and snap live shelf packshot
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleTriggerGallery}
                className="w-full p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-3 transition-all font-bold text-xs cursor-pointer active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Upload className="w-5 h-5 text-stone-700" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm">Choose from Phone Gallery</div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    Upload an existing high-resolution photo from files
                  </div>
                </div>
              </button>

              {actionSheetProduct.image_url && (
                <button
                  type="button"
                  onClick={() => {
                    setZoomProduct(actionSheetProduct);
                    setActionSheetProduct(null);
                  }}
                  className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  <span>Inspect Current Packshot in High-Res</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Photo Review & AI Cutout Confirmation Modal */}
      {pendingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">Review Shelf Photo</h3>
                <p className="text-[11px] text-stone-500">
                  {pendingReview.product.name}
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessingReview}
                onClick={() => setPendingReview(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Preview Canvas */}
            <div className="w-full aspect-square rounded-2xl border border-stone-200 overflow-hidden bg-stone-900 flex items-center justify-center relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingReview.previewUrl}
                alt="Shelf preview"
                className="w-full h-full object-contain"
              />
              {isProcessingReview && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <p className="text-xs font-extrabold">Removing Background...</p>
                  <p className="text-[10px] text-stone-300">
                    Centering packshot on pure white canvas &amp; publishing live
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-500 leading-relaxed bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <span>
                Our AI model automatically removes shelf glare and backgrounds, saving the cutout directly to verified store catalog.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isProcessingReview}
                onClick={() => setPendingReview(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-bold text-stone-700 transition-all cursor-pointer"
              >
                Retake
              </button>
              <button
                type="button"
                disabled={isProcessingReview}
                onClick={handleConfirmUpload}
                className="flex-2 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isProcessingReview ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Process &amp; Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. High-Res Zoom & Inspection Modal */}
      {zoomProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  {zoomProduct.brand || 'G1 Mart'}
                </span>
                <h3 className="text-xs font-extrabold text-stone-900 truncate max-w-[220px]">
                  {zoomProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Res Image View */}
            <div className="w-full aspect-square rounded-2xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center p-4 shadow-inner">
              <ProductImage
                imageUrl={zoomProduct.image_url}
                imageStatus={zoomProduct.image_status}
                alt={zoomProduct.name}
                name={zoomProduct.name}
                brand={zoomProduct.brand}
                subCategory={zoomProduct.subCategory}
                category={zoomProduct.category}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Metadata */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Product SKU / ID</span>
                <span className="font-mono text-stone-800 font-bold">{zoomProduct.id}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Unit &amp; Packaging</span>
                <span className="text-stone-800 font-bold">{zoomProduct.unit || '1 unit'}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Image Status</span>
                <span className="font-bold text-[#2E7D32]">
                  {zoomProduct.image_status === 'verified'
                    ? 'Verified Store Packshot'
                    : 'AI Pouch / Placard'}
                </span>
              </div>
            </div>

            {/* Retake Action */}
            <button
              type="button"
              onClick={() => {
                const p = zoomProduct;
                setZoomProduct(null);
                handleOpenActionSheet(p);
              }}
              className="w-full py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Update / Retake This Packshot</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
