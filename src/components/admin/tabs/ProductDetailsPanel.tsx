import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '@/types';
import {
  ArrowLeft,
  Check,
  RefreshCw,
  AlertCircle,
  Tag,
  Package,
  Layers,
  Edit2,
  CheckCircle2,
  Upload,
  Plus,
  ExternalLink,
} from 'lucide-react';
import ProductImage from '@/components/storefront/ProductImage';
import { adminFetch } from '@/lib/adminApi';
import { normalizeCategory } from '@/services/productService';

export const STORE_SECTIONS_CATEGORIES = [
  {
    section: '🛒 Grocery & Kitchen',
    categories: [
      { id: 'atta-rice-dal', name: 'Rice, Atta & Flours' },
      { id: 'local-dals', name: 'Dals & Pulses' },
      { id: 'oil-ghee-masala', name: 'Oils & Ghee' },
      { id: 'spices-masalas', name: 'Spices & Masalas' },
      { id: 'sugar-salt-staples', name: 'Salt, Sugar & Jaggery' },
      { id: 'dry-fruits-cereals', name: 'Dry Fruits & Nuts' },
      { id: 'vegetables-fruits', name: 'Fresh Vegetables & Produce' },
      { id: 'local-millets', name: 'Millets & Grains' },
    ],
  },
  {
    section: '🥛 Dairy, Breakfast & Instant Food',
    categories: [
      { id: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs' },
      { id: 'instant-food', name: 'Noodles & Instant Food' },
      { id: 'biscuits-bakery', name: 'Biscuits & Bakery' },
      { id: 'sauces-spreads', name: 'Sauces & Spreads' },
      { id: 'pickles', name: 'Pickles & Chutneys' },
      { id: 'ice-creams', name: 'Ice Creams & More' },
    ],
  },
  {
    section: '🍿 Snacks & Drinks',
    categories: [
      { id: 'chips-namkeen', name: 'Chips & Namkeen' },
      { id: 'sweets-chocolates', name: 'Sweets & Chocolates' },
      { id: 'tea-coffee-milk-drinks', name: 'Tea, Coffee & Health Drinks' },
      { id: 'drinks-juices', name: 'Cold Drinks & Juices' },
    ],
  },
  {
    section: '🧹 Household & Pooja',
    categories: [
      { id: 'laundry-detergents', name: 'Detergents & Fabric Care' },
      { id: 'dishwash', name: 'Dishwash Bars & Liquids' },
      { id: 'floor-surface-cleaners', name: 'Cleaners & Pest Control' },
      { id: 'pooja-needs', name: 'Pooja Essentials' },
      { id: 'kitchenware', name: 'Kitchen Utility & Hardware' },
    ],
  },
  {
    section: '🧴 Personal Care & Hygiene',
    categories: [
      { id: 'soaps-bath', name: 'Soaps & Body Wash' },
      { id: 'hair-care', name: 'Hair Care & Shampoos' },
      { id: 'oral-care', name: 'Toothpaste & Oral Care' },
      { id: 'skin-care', name: 'Skin Care & Lotions' },
      { id: 'baby-care', name: 'Baby Care' },
      { id: 'hygiene', name: 'Feminine & Personal Hygiene' },
    ],
  },
];

interface Props {
  product: Product;
  onBack: () => void;
  onSaveProduct?: (updatedProduct: Product) => Promise<boolean>;
  categories?: Category[];
  isNew?: boolean;
}

export default function ProductDetailsPanel({
  product,
  onBack,
  onSaveProduct,
  categories = [],
  isNew = false,
}: Props) {
  const [name, setName] = useState(product.name || '');
  const [brand, setBrand] = useState(product.brand || 'G1 Mart');
  const [unit, setUnit] = useState(product.unit || '1 unit');
  const [category, setCategory] = useState(
    normalizeCategory(product.category || (product as any).category_id || 'atta-rice-dal')
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [price, setPrice] = useState(
    product.price !== undefined && product.price !== null && (isNew ? product.price > 0 : true)
      ? String(product.price)
      : ''
  );
  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice !== undefined && product.originalPrice !== null && (isNew ? product.originalPrice > 0 : true)
      ? String(product.originalPrice)
      : product.price !== undefined && (isNew ? product.price > 0 : true)
      ? String(product.price)
      : ''
  );
  const [stockCount, setStockCount] = useState(
    product.stockCount !== undefined && product.stockCount !== null ? String(product.stockCount) : '15'
  );
  const [inStock, setInStock] = useState(product.inStock !== false);
  const [imageUrl, setImageUrl] = useState(
    product.imageUrl || product.image_url || product.image || '/products/placeholder.svg'
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [variantsList, setVariantsList] = useState<any[]>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({ ...v }));
    }
    return [];
  });
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Key tracking to prevent wiping user edits on background re-renders
  const productKey = isNew ? 'new-product-creation' : `product-${product.id}`;
  const initializedKeyRef = useRef<string | null>(null);

  // Synchronize internal state ONLY when switching to a different product or mode
  useEffect(() => {
    if (initializedKeyRef.current === productKey) {
      return; // Already initialized for this product - NEVER overwrite user's in-progress typing!
    }
    initializedKeyRef.current = productKey;

    setName(product.name || '');
    setBrand(product.brand || 'G1 Mart');
    setUnit(product.unit || '1 unit');
    setCategory(normalizeCategory(product.category || (product as any).category_id || 'atta-rice-dal'));
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setPrice(
      product.price !== undefined && product.price !== null && (isNew ? product.price > 0 : true)
        ? String(product.price)
        : ''
    );
    setOriginalPrice(
      product.originalPrice !== undefined && product.originalPrice !== null && (isNew ? product.originalPrice > 0 : true)
        ? String(product.originalPrice)
        : product.price !== undefined && (isNew ? product.price > 0 : true)
        ? String(product.price)
        : ''
    );
    setStockCount(
      product.stockCount !== undefined && product.stockCount !== null ? String(product.stockCount) : '15'
    );
    setInStock(product.inStock !== false);
    setImageUrl(product.imageUrl || product.image_url || product.image || '/products/placeholder.svg');
    if (product.variants && product.variants.length > 0) {
      setVariantsList(product.variants.map((v) => ({ ...v })));
    } else {
      setVariantsList([]);
    }
    setSelectedVariantIdx(0);
    setErrorMsg('');
    setSaveSuccess(false);
    setSubmitted(false);
    setTouchedFields({});
  }, [productKey, product.id, isNew]);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleSelectVariant = (idx: number) => {
    const currPrice = parseFloat(price) || 0;
    const currMrp = parseFloat(originalPrice) || currPrice;
    const currStock = parseInt(stockCount, 10) || 0;

    const nextList = [...variantsList];
    if (nextList[selectedVariantIdx]) {
      nextList[selectedVariantIdx] = {
        ...nextList[selectedVariantIdx],
        price: currPrice,
        mrp: currMrp,
        stock: currStock,
      };
    }
    setVariantsList(nextList);

    setSelectedVariantIdx(idx);
    const target = nextList[idx];
    if (target) {
      setPrice(target.price !== undefined ? String(target.price) : '');
      setOriginalPrice(target.mrp !== undefined ? String(target.mrp) : String(target.price ?? ''));
      if (target.stock !== undefined) setStockCount(String(target.stock));
      if (target.size_label) setUnit(target.size_label);
    }
  };

  // Client-side image compression: converts 5MB-10MB camera pictures to ~50KB WebP in 50ms
  const compressImageFile = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      if (file.type.includes('svg') || file.size < 80 * 1024) {
        return resolve(file);
      }
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 800; // Optimal 800x800 for high-res e-commerce catalog
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/webp',
          0.82
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');

    try {
      // 1. Immediately compress client-side (reduces phone photos to ~50KB with zero user lag)
      const compressedBlob = await compressImageFile(file);

      // 2. Set instant local preview URL so photo displays immediately with 0 delay
      const previewUrl = URL.createObjectURL(compressedBlob);
      setImageUrl(previewUrl);

      // 3. Upload the compressed lightweight image to cloud
      const formData = new FormData();
      const uploadFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
      formData.append('file', compressedBlob, uploadFileName);
      formData.append('productId', product.id || `new_${Date.now()}`);

      const res = await adminFetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setErrorMsg(data.error || 'Failed to upload image to cloud');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMsg('');
    setSaveSuccess(false);

    // Validation
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMsg('Please enter a valid selling price (e.g. 50).');
      return;
    }

    const priceNum = parseFloat(price) || 0;
    const mrpNum = originalPrice !== '' && !isNaN(Number(originalPrice)) ? parseFloat(originalPrice) : priceNum;
    const stockNum = stockCount !== '' && !isNaN(parseInt(stockCount, 10)) ? parseInt(stockCount, 10) : 0;

    setIsSaving(true);

    const cleanImg = imageUrl.trim() || product.imageUrl || product.image_url || product.image || '/products/placeholder.svg';

    const finalVariants =
      variantsList.length > 0
        ? variantsList.map((v, i) => {
            if (i === selectedVariantIdx || (v.size_label && unit && v.size_label.toLowerCase() === unit.trim().toLowerCase())) {
              return {
                ...v,
                price: priceNum,
                mrp: mrpNum,
                stock: stockNum,
              };
            }
            return v;
          })
        : [
            {
              id: `${product.id || 'p'}-v1`,
              product_id: product.id || 'p',
              size_label: unit.trim() || '1 unit',
              price: priceNum,
              mrp: mrpNum,
              stock: stockNum,
              image_url: cleanImg,
            },
          ];

    const updatedProduct: Product = {
      ...product,
      id: product.id || `g1-p${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      brand: brand.trim() || 'G1 Mart',
      unit: unit.trim() || '1 unit',
      category: category.trim(),
      category_id: category.trim(),
      price: priceNum,
      originalPrice: mrpNum,
      discountPercentage: mrpNum > priceNum && mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
      stockCount: stockNum,
      inStock: inStock && stockNum > 0,
      priceConfirmed: priceNum > 0,
      imageUrl: cleanImg,
      image_url: cleanImg,
      image: cleanImg,
      imageStatus: 'VERIFIED',
      image_status: 'VERIFIED',
      variants: finalVariants,
    };

    try {
      if (isNew) {
        // Create new product via POST
        const res = await adminFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        });
        const data = await res.json();
        if (data.success && data.product) {
          if (onSaveProduct) {
            await onSaveProduct(data.product);
          }
          setSaveSuccess(true);
          setTimeout(() => {
            onBack();
          }, 800);
        } else {
          setErrorMsg(data.error || 'Failed to create new product');
        }
      } else {
        // Edit existing product
        if (onSaveProduct) {
          const ok = await onSaveProduct(updatedProduct);
          if (ok) {
            setSaveSuccess(true);
            setTimeout(() => {
              onBack();
            }, 800);
            return;
          }
        }

        // Direct fallback PATCH
        const res = await adminFetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updatedProduct.id,
            name: updatedProduct.name,
            brand: updatedProduct.brand,
            unit: updatedProduct.unit,
            category: updatedProduct.category,
            price: updatedProduct.price,
            originalPrice: updatedProduct.originalPrice,
            inStock: updatedProduct.inStock,
            stockCount: updatedProduct.stockCount,
            imageUrl: cleanImg,
            imageStatus: 'VERIFIED',
            variants: finalVariants,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSaveSuccess(true);
          setTimeout(() => {
            onBack();
          }, 800);
        } else {
          setErrorMsg(data.error || 'Failed to update product');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  const isPriceEmpty = price === '';
  const isStockEmpty = stockCount === '';
  const isNameEmpty = name.trim() === '';

  const showPriceError = (submitted || touchedFields.price) && isPriceEmpty;
  const showNameError = (submitted || touchedFields.name) && isNameEmpty;
  const showStockError = (submitted || touchedFields.stock) && isStockEmpty;

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-screen bg-[#F4F6F9] p-3 sm:p-6 pb-28">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center justify-between mb-4 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
              {isNew ? 'Add New Product' : 'Edit Product Details'}
            </h1>
            <p className="text-xs text-stone-500">
              {isNew ? 'Create a brand new item in supermarket catalog' : `ID: ${product.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && product.id && (
            <a
              href={`/product/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>View in Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <span
            className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
              inStock && (parseInt(stockCount, 10) > 0 || stockCount === '')
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {inStock && (parseInt(stockCount, 10) > 0 || stockCount === '') ? '🟢 In Stock' : '🔴 Out of Stock'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Product Photo & Identification Preview */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-stone-50 border border-stone-200 p-2 overflow-hidden shrink-0 flex items-center justify-center">
              <ProductImage
                imageUrl={imageUrl || product.image_url || product.imageUrl || product.image}
                imageStatus="VERIFIED"
                alt={name || 'Product'}
              />
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                {brand || 'G1 Mart'}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-2">
                {name || 'New Product Name'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Unit: {unit || '1 unit'} • Category: {category}
              </p>
              {!isNew && product.id && (
                <div className="mt-2">
                  <a
                    href={`/product/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-[#1B5E20] rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <span>View customer product page</span>
                    <ExternalLink className="w-3 h-3 text-[#1B5E20]" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Photo URL / Upload row */}
          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                Product Image URL or Path
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/products/packshots/... or https://..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
              />
            </div>
            <div className="sm:self-end">
              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 transition-colors w-full sm:w-auto">
                <Upload className="w-3.5 h-3.5 text-[#1B5E20]" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
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
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0" />
                <span>
                  {isNew
                    ? 'New product published to customer storefront!'
                    : 'Product updated successfully in customer store!'}
                </span>
              </div>
              {product.id && (
                <a
                  href={`/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#1B5E20] border border-emerald-300 rounded-lg text-xs font-black transition-colors"
                >
                  <span>Open in Store ↗</span>
                </a>
              )}
            </div>
          )}

          {/* Pack / Variant Selector if product has multiple variants */}
          {variantsList.length > 1 && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-1.5">
              <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider block">
                Pack Sizes / Variants (Tap pack size to edit its price &amp; stock)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {variantsList.map((v, idx) => {
                  const isSel = selectedVariantIdx === idx;
                  return (
                    <button
                      key={v.id || idx}
                      type="button"
                      onClick={() => handleSelectVariant(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSel
                          ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span>{v.size_label || `Pack ${idx + 1}`}</span>
                      <span className="ml-1.5 opacity-80">₹{v.price}</span>
                    </button>
                  );
                })}
              </div>
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
                step="any"
                min="0"
                value={price}
                onFocus={(e) => e.target.select()}
                onBlur={() => markTouched('price')}
                onChange={(e) => {
                  setPrice(e.target.value);
                  markTouched('price');
                }}
                placeholder="e.g. 65"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold text-stone-900 focus:outline-none transition-all ${
                  showPriceError
                    ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                    : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20]'
                }`}
              />
              {showPriceError ? (
                <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                  Price cannot be empty — enter customer price
                </span>
              ) : (
                <span className="text-[10px] text-stone-500 mt-1 block">The price customer pays at checkout</span>
              )}
            </div>

            {/* MRP / Original Price */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                MRP / Strikethrough Price (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={originalPrice}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g. 70"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">Maximum Retail Price printed on packet</span>
            </div>

            {/* Stock Count */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                value={stockCount}
                onFocus={(e) => e.target.select()}
                onBlur={() => markTouched('stock')}
                onChange={(e) => {
                  setStockCount(e.target.value);
                  markTouched('stock');
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n) && n <= 0) {
                    setInStock(false);
                  } else if (!isNaN(n) && n > 0) {
                    setInStock(true);
                  }
                }}
                placeholder="e.g. 50"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold text-stone-900 focus:outline-none transition-all ${
                  showStockError
                    ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                    : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20]'
                }`}
              />
              {showStockError ? (
                <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                  Quantity cannot be empty — enter available stock (or 0 for out of stock)
                </span>
              ) : (
                <span className="text-[10px] text-stone-500 mt-1 block">Available quantity in store rack</span>
              )}
            </div>

            {/* In Stock Toggle */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Availability Status
              </label>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all cursor-pointer ${
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
                Product Display Name *
              </label>
              <input
                type="text"
                value={name}
                onFocus={(e) => e.target.select()}
                onBlur={() => markTouched('name')}
                onChange={(e) => {
                  setName(e.target.value);
                  markTouched('name');
                }}
                placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none transition-all ${
                  showNameError
                    ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                    : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20]'
                }`}
              />
              {showNameError && (
                <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                  Product name is required
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Aashirvaad"
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
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. 1 kg, 500 g, 1 L"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                    Store Category
                  </label>
                  {!isCustomCategory ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(true)}
                      className="text-[10px] font-bold text-[#1B5E20] hover:underline cursor-pointer"
                    >
                      + New Category
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="text-[10px] font-bold text-stone-500 hover:underline cursor-pointer"
                    >
                      Choose Existing
                    </button>
                  )}
                </div>

                {!isCustomCategory ? (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                  >
                    {STORE_SECTIONS_CATEGORIES.map((sec) => (
                      <optgroup key={sec.section} label={sec.section}>
                        {sec.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="✨ Custom / Other">
                      <option value="__add_new__">➕ + Add New Custom Category...</option>
                    </optgroup>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={customCategoryName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCategoryName(val);
                        const slug = val
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        setCategory(slug || 'atta-rice-dal');
                      }}
                      placeholder="e.g. Organic & Healthy Foods"
                      className="w-full px-3 py-2 bg-white border border-[#1B5E20] rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>Category ID: <code className="font-mono text-emerald-800">{category}</code></span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory('atta-rice-dal');
                        }}
                        className="text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isNew ? 'Creating Product...' : 'Saving Updates...'}</span>
                </>
              ) : (
                <>
                  {isNew ? <Plus className="w-4 h-4 stroke-[3]" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  <span>{isNew ? 'Create & Publish Product' : 'Save Product Changes'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
