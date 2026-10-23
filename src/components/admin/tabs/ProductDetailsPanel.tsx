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
  Camera,
  X,
  Trash2,
} from 'lucide-react';
import ProductImage from '@/components/storefront/ProductImage';
import { adminFetch } from '@/lib/adminApi';
import { normalizeCategory } from '@/services/productService';
import { SUPERMARKET_CATEGORIES } from '@/data/demo-seed';

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
  onDeleteProduct?: (productId: string) => Promise<boolean>;
  categories?: Category[];
  isNew?: boolean;
}

export default function ProductDetailsPanel({
  product,
  onBack,
  onSaveProduct,
  onDeleteProduct,
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

  const currentCatConfig = SUPERMARKET_CATEGORIES.find((c) => c.id === category);
  const availableSubcategories = currentCatConfig?.subcategories || [];

  const [subCategory, setSubCategory] = useState<string>(
    product.subCategory || (product as any).sub_category || availableSubcategories[0] || 'General'
  );
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [customSubCategoryName, setCustomSubCategoryName] = useState('');
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
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [variantsList, setVariantsList] = useState<any[]>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({ ...v }));
    }
    return [
      {
        id: `${product.id || 'p'}-v1`,
        product_id: product.id || 'p',
        size_label: product.unit || '1 unit',
        price: product.price !== undefined && product.price !== null ? product.price : 0,
        mrp: product.originalPrice || product.price || 0,
        stock: product.stockCount !== undefined && product.stockCount !== null ? product.stockCount : 15,
        in_stock: product.inStock !== false,
        image_url: product.imageUrl || product.image_url || product.image || '/products/placeholder.svg',
      },
    ];
  });
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Quick Pack Size / Variant modal state
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteProduct = async () => {
    if (!product.id || isNew) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      let isSuccess = false;
      let lastError = '';

      if (onDeleteProduct) {
        const ok = await onDeleteProduct(product.id);
        if (ok) {
          isSuccess = true;
        }
      }

      if (!isSuccess) {
        const res = await adminFetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
          method: 'DELETE',
        });
        const data = await res.json().catch(() => ({}));
        if (data?.success) {
          isSuccess = true;
        } else {
          lastError = data?.error || 'Failed to delete product from server.';
        }
      }

      if (isSuccess) {
        setShowDeleteModal(false);
        onBack();
      } else {
        setDeleteError(lastError || 'Failed to delete product. Please try again.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error occurred while deleting product.');
    } finally {
      setIsDeleting(false);
    }
  };
  const [newVariantUnit, setNewVariantUnit] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantMrp, setNewVariantMrp] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('25');
  const [modalVariantError, setModalVariantError] = useState('');

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
    const initCat = normalizeCategory(product.category || (product as any).category_id || 'atta-rice-dal');
    setCategory(initCat);
    setIsCustomCategory(false);
    setCustomCategoryName('');
    const initCfg = SUPERMARKET_CATEGORIES.find((c) => c.id === initCat);
    const initSub = product.subCategory || (product as any).sub_category || initCfg?.subcategories?.[0] || 'General';
    setSubCategory(initSub);
    setIsCustomSubCategory(false);
    setCustomSubCategoryName('');
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
      setVariantsList([
        {
          id: `${product.id || 'p'}-v1`,
          product_id: product.id || 'p',
          size_label: product.unit || '1 unit',
          price: product.price !== undefined && product.price !== null ? product.price : 0,
          mrp: product.originalPrice || product.price || 0,
          stock: product.stockCount !== undefined && product.stockCount !== null ? product.stockCount : 15,
          in_stock: product.inStock !== false,
          image_url: product.imageUrl || product.image_url || product.image || '/products/placeholder.svg',
        },
      ]);
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
    if (idx === selectedVariantIdx) return;

    const currPrice = parseFloat(price) || 0;
    const currMrp = parseFloat(originalPrice) || currPrice;
    const currStock = parseInt(stockCount, 10) || 0;
    const currUnit = unit.trim() || '1 unit';

    const nextList = [...variantsList];
    if (nextList[selectedVariantIdx]) {
      nextList[selectedVariantIdx] = {
        ...nextList[selectedVariantIdx],
        size_label: currUnit,
        price: currPrice,
        mrp: currMrp,
        stock: currStock,
        in_stock: inStock && currStock > 0,
      };
    }
    setVariantsList(nextList);

    setSelectedVariantIdx(idx);
    const target = nextList[idx];
    if (target) {
      setPrice(target.price !== undefined && target.price !== null ? String(target.price) : '');
      setOriginalPrice(target.mrp !== undefined && target.mrp !== null ? String(target.mrp) : String(target.price ?? ''));
      if (target.stock !== undefined) setStockCount(String(target.stock));
      if (target.size_label) setUnit(target.size_label);
      if (target.in_stock !== undefined) setInStock(target.in_stock !== false);
    }
  };

  const handleOpenAddVariantModal = () => {
    const currPriceNum = parseFloat(price) || 0;
    const currMrpNum = parseFloat(originalPrice) || currPriceNum;
    const currStockNum = parseInt(stockCount, 10) || 0;
    const currUnitLabel = unit.trim() || '1 unit';

    setVariantsList((prev) => {
      const baseList = prev.length > 0 ? [...prev] : [
        {
          id: `${product.id || 'p'}-v1`,
          product_id: product.id || 'p',
          size_label: currUnitLabel,
          price: currPriceNum,
          mrp: currMrpNum,
          stock: currStockNum,
          in_stock: inStock && currStockNum > 0,
          image_url: imageUrl,
        },
      ];
      if (baseList[selectedVariantIdx]) {
        baseList[selectedVariantIdx] = {
          ...baseList[selectedVariantIdx],
          size_label: currUnitLabel,
          price: currPriceNum,
          mrp: currMrpNum,
          stock: currStockNum,
          in_stock: inStock && currStockNum > 0,
        };
      }
      return baseList;
    });

    setNewVariantUnit('');
    setNewVariantPrice('');
    setNewVariantMrp('');
    setNewVariantStock('25');
    setModalVariantError('');
    setShowAddVariantModal(true);
  };

  const handleConfirmAddVariant = () => {
    const trimmedUnit = newVariantUnit.trim();
    if (!trimmedUnit) {
      setModalVariantError('Please enter a pack size or unit name (e.g. 2 kg)');
      return;
    }
    const parsedPrice = parseFloat(newVariantPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setModalVariantError('Please enter a valid selling price greater than 0');
      return;
    }
    const parsedMrp = parseFloat(newVariantMrp) || parsedPrice;
    const parsedStock = parseInt(newVariantStock, 10) >= 0 ? parseInt(newVariantStock, 10) : 25;

    const currPriceNum = parseFloat(price) || 0;
    const currMrpNum = parseFloat(originalPrice) || currPriceNum;
    const currStockNum = parseInt(stockCount, 10) || 0;
    const currUnitLabel = unit.trim() || '1 unit';

    const baseList = variantsList.length > 0 ? [...variantsList] : [
      {
        id: `${product.id || 'p'}-v1`,
        product_id: product.id || 'p',
        size_label: currUnitLabel,
        price: currPriceNum,
        mrp: currMrpNum,
        stock: currStockNum,
        in_stock: inStock && currStockNum > 0,
        image_url: imageUrl,
      },
    ];

    const isDuplicate = baseList.some(
      (v) => v.size_label && v.size_label.trim().toLowerCase() === trimmedUnit.toLowerCase()
    );
    if (isDuplicate) {
      setModalVariantError(`A pack size for "${trimmedUnit}" already exists.`);
      return;
    }

    if (baseList[selectedVariantIdx]) {
      baseList[selectedVariantIdx] = {
        ...baseList[selectedVariantIdx],
        size_label: currUnitLabel,
        price: currPriceNum,
        mrp: currMrpNum,
        stock: currStockNum,
        in_stock: inStock && currStockNum > 0,
      };
    }

    const newV = {
      id: `${product.id || 'p'}-v${Date.now().toString().slice(-4)}`,
      product_id: product.id || 'p',
      size_label: trimmedUnit,
      price: parsedPrice,
      mrp: parsedMrp,
      stock: parsedStock,
      in_stock: parsedStock > 0,
      image_url: imageUrl,
    };

    const updated = [...baseList, newV];
    const newIdx = updated.length - 1;

    setVariantsList(updated);
    setSelectedVariantIdx(newIdx);

    setUnit(newV.size_label);
    setPrice(String(newV.price));
    setOriginalPrice(String(newV.mrp));
    setStockCount(String(newV.stock));
    setInStock(newV.in_stock);

    setShowAddVariantModal(false);
  };

  const handleDeleteVariant = (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (variantsList.length <= 1) return;

    const nextList = variantsList.filter((_, i) => i !== idxToDelete);
    setVariantsList(nextList);

    let nextIdx = 0;
    if (selectedVariantIdx === idxToDelete) {
      nextIdx = 0;
    } else if (selectedVariantIdx > idxToDelete) {
      nextIdx = selectedVariantIdx - 1;
    } else {
      nextIdx = selectedVariantIdx;
    }
    setSelectedVariantIdx(nextIdx);

    const target = nextList[nextIdx];
    if (target) {
      setUnit(target.size_label || '1 unit');
      setPrice(target.price !== undefined ? String(target.price) : '');
      setOriginalPrice(target.mrp !== undefined ? String(target.mrp) : String(target.price ?? ''));
      setStockCount(target.stock !== undefined ? String(target.stock) : '15');
      setInStock(target.in_stock !== false && (target.stock ?? 15) > 0);
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
                size_label: unit.trim() || v.size_label || '1 unit',
                price: priceNum,
                mrp: mrpNum,
                stock: stockNum,
                in_stock: inStock && stockNum > 0,
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
              in_stock: inStock && stockNum > 0,
            },
          ];

    const primaryVariant = finalVariants[0] || {
      size_label: unit.trim() || '1 unit',
      price: priceNum,
      mrp: mrpNum,
      stock: stockNum,
    };

    const finalSub = isCustomSubCategory
      ? customSubCategoryName.trim()
      : subCategory.trim() || availableSubcategories[0] || 'General';

    const updatedProduct: Product = {
      ...product,
      id: product.id ? String(product.id) : `g1-p${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      brand: brand.trim() || 'G1 Mart',
      unit: primaryVariant.size_label || unit.trim() || '1 unit',
      category: category.trim(),
      category_id: category.trim(),
      subCategory: finalSub,
      price: primaryVariant.price ?? priceNum,
      originalPrice: primaryVariant.mrp ?? mrpNum,
      discountPercentage:
        (primaryVariant.mrp ?? mrpNum) > (primaryVariant.price ?? priceNum) && (primaryVariant.mrp ?? mrpNum) > 0
          ? Math.round((((primaryVariant.mrp ?? mrpNum) - (primaryVariant.price ?? priceNum)) / (primaryVariant.mrp ?? mrpNum)) * 100)
          : 0,
      stockCount: primaryVariant.stock ?? stockNum,
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

  if (isNew) {
    return (
      <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto flex flex-col min-h-screen bg-[#F4F6F9] p-3 sm:p-6 pb-24 lg:pb-8 space-y-4">
        {/* Top Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-stone-900 tracking-tight">Add New Product</h1>
              <p className="text-xs text-stone-500 font-medium">Add item details to publish immediately on the customer app</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <span className="text-sm">✓ Product published successfully to customer app!</span>
              </div>
              <div className="flex items-center gap-2">
                {createdProductId && (
                  <a
                    href={`/product/${createdProductId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white text-[#1B5E20] hover:bg-emerald-50 rounded-xl text-xs font-black transition-colors"
                  >
                    View in Store ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={onBack}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Photo Upload & Visual Presentation (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              {/* 1. Photo Upload */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">
                    Product Photo
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Customer App Display
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200/80 gap-3">
                  <div className="w-36 h-36 rounded-2xl bg-white border border-stone-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <ProductImage
                      imageUrl={imageUrl || '/products/placeholder.svg'}
                      imageStatus="VERIFIED"
                      alt={name || 'Photo'}
                    />
                  </div>

                  <div className="w-full text-center space-y-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-2xs transition-all active:scale-95">
                      <Camera className="w-4 h-4" />
                      <span>{uploadingImage ? 'Compressing & Uploading...' : 'Take Photo / Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Square photos work best. Automatically optimized for 5G/4G fast mobile shopping.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Name, Category, Pricing, Inventory & Actions (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">

          {/* 2. Product Name & Details */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3.5">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                Product Name *
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
                placeholder="e.g. Aashirvaad Atta 5kg, Fortune Sunflower Oil 1L"
                className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:outline-none transition-all ${
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    const cfg = SUPERMARKET_CATEGORIES.find((c) => c.id === newCat);
                    if (cfg && cfg.subcategories && cfg.subcategories.length > 0) {
                      setSubCategory(cfg.subcategories[0]);
                    }
                  }}
                  className="w-full h-11 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                >
                  {STORE_SECTIONS_CATEGORIES.map((sec) => (
                    <optgroup key={sec.section} label={sec.section}>
                      {sec.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                  Pack Size / Unit *
                </label>
                <input
                  type="text"
                  value={unit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. 1 kg, 500 g, 1 L, 1 pc"
                  className="w-full h-11 px-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Price & Stock */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-[#1B5E20]">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onBlur={() => markTouched('price')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setPrice(val);
                      markTouched('price');
                    }}
                    placeholder="0"
                    className={`w-full h-11 pl-8 pr-3.5 rounded-xl text-sm font-black text-[#1B5E20] focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      showPriceError
                        ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20]'
                    }`}
                  />
                </div>
                {showPriceError && (
                  <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                    Price is required
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                  MRP (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={originalPrice}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setOriginalPrice(val);
                    }}
                    placeholder="Optional"
                    className="w-full h-11 pl-8 pr-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1">
                  Available Stock *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={stockCount}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onBlur={() => markTouched('stock')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setStockCount(val);
                    markTouched('stock');
                  }}
                  placeholder="25"
                  className={`w-full h-11 px-3.5 rounded-xl text-sm font-bold text-stone-900 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    showStockError
                      ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                      : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20]'
                  }`}
                />
                {showStockError && (
                  <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                    Stock is required
                  </span>
                )}
              </div>
            </div>

            {parseFloat(originalPrice) > parseFloat(price) && parseFloat(price) > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-800 flex items-center justify-between">
                <span>Customer Discount:</span>
                <span className="px-2 py-0.5 rounded-md bg-[#1B5E20] text-white font-black">
                  {Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

              {/* 4. Publish Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Product...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>＋ Publish Product to App</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto flex flex-col min-h-screen bg-[#F4F6F9] p-3 sm:p-6 pb-24 lg:pb-8">
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
            <button
              type="button"
              onClick={() => { setDeleteError(null); setShowDeleteModal(true); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Delete this product"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete</span>
            </button>
          )}
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
                Unit: {unit || '1 unit'} • Category: {category} {subCategory ? `• Shelf: ${subCategory}` : ''}
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

          {/* Pack Sizes & Quantities Section */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black text-stone-700 uppercase tracking-wider block">
                  Pack Sizes / Quantities ({variantsList.length || 1})
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  Tap a size to edit price &amp; stock, or tap + Add Size
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddVariantModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#1B5E20] bg-white hover:bg-emerald-50 active:scale-95 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {variantsList.map((v, idx) => {
                const isSel = selectedVariantIdx === idx;
                return (
                  <div
                    key={v.id || idx}
                    onClick={() => handleSelectVariant(idx)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                      isSel
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    <span>{v.size_label || `Pack ${idx + 1}`}</span>
                    <span className={`text-[11px] font-semibold ${isSel ? 'text-emerald-200' : 'text-stone-500'}`}>
                      ₹{v.price}
                    </span>
                    {variantsList.length > 1 && (
                      <button
                        type="button"
                        title="Delete this pack size"
                        onClick={(e) => handleDeleteVariant(idx, e)}
                        className={`ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                          isSel ? 'text-white/80 hover:text-white' : 'text-stone-400 hover:text-rose-600'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selling Price */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                onBlur={() => markTouched('price')}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setPrice(val);
                  markTouched('price');
                  setVariantsList((prev) => {
                    if (!prev.length) return prev;
                    const copy = [...prev];
                    if (copy[selectedVariantIdx]) {
                      copy[selectedVariantIdx] = {
                        ...copy[selectedVariantIdx],
                        price: parseFloat(val) || 0,
                      };
                    }
                    return copy;
                  });
                }}
                placeholder="Enter selling price (e.g. 65)"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold text-stone-900 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
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
                type="text"
                inputMode="decimal"
                value={originalPrice}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setOriginalPrice(val);
                  setVariantsList((prev) => {
                    if (!prev.length) return prev;
                    const copy = [...prev];
                    if (copy[selectedVariantIdx]) {
                      copy[selectedVariantIdx] = {
                        ...copy[selectedVariantIdx],
                        mrp: parseFloat(val) || 0,
                      };
                    }
                    return copy;
                  });
                }}
                placeholder="Enter MRP (e.g. 70)"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">Maximum Retail Price printed on packet</span>
            </div>

            {/* Stock Count */}
            <div>
              <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={stockCount}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                onBlur={() => markTouched('stock')}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setStockCount(val);
                  markTouched('stock');
                  const n = parseInt(val, 10);
                  const validStock = !isNaN(n) ? n : 0;
                  if (!isNaN(n) && n <= 0) {
                    setInStock(false);
                  } else if (!isNaN(n) && n > 0) {
                    setInStock(true);
                  }
                  setVariantsList((prev) => {
                    if (!prev.length) return prev;
                    const copy = [...prev];
                    if (copy[selectedVariantIdx]) {
                      copy[selectedVariantIdx] = {
                        ...copy[selectedVariantIdx],
                        stock: validStock,
                        in_stock: validStock > 0 && (n > 0 || inStock),
                      };
                    }
                    return copy;
                  });
                }}
                placeholder="Enter stock units (e.g. 50)"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold text-stone-900 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
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
                onClick={() => {
                  const nextInStock = !inStock;
                  setInStock(nextInStock);
                  setVariantsList((prev) => {
                    if (!prev.length) return prev;
                    const copy = [...prev];
                    if (copy[selectedVariantIdx]) {
                      copy[selectedVariantIdx] = {
                        ...copy[selectedVariantIdx],
                        in_stock: nextInStock,
                      };
                    }
                    return copy;
                  });
                }}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                    Unit / Pack Size
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenAddVariantModal}
                    className="text-[10px] font-bold text-[#1B5E20] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Size</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={unit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUnit(val);
                    setVariantsList((prev) => {
                      if (!prev.length) return prev;
                      const copy = [...prev];
                      if (copy[selectedVariantIdx]) {
                        copy[selectedVariantIdx] = {
                          ...copy[selectedVariantIdx],
                          size_label: val,
                        };
                      }
                      return copy;
                    });
                  }}
                  placeholder="e.g. 1 kg, 500 g, 1 L"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                    Category
                  </label>
                  {!isCustomCategory ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(true)}
                      className="text-[10px] font-bold text-[#1B5E20] hover:underline cursor-pointer"
                    >
                      + New
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="text-[10px] font-bold text-stone-500 hover:underline cursor-pointer"
                    >
                      Existing
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
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const cfg = SUPERMARKET_CATEGORIES.find((c) => c.id === newCat);
                        if (cfg && cfg.subcategories && cfg.subcategories.length > 0) {
                          setSubCategory(cfg.subcategories[0]);
                          setIsCustomSubCategory(false);
                        }
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
                      placeholder="e.g. Organic Foods"
                      className="w-full px-3 py-2 bg-white border border-[#1B5E20] rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>ID: <code className="font-mono text-emerald-800">{category}</code></span>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                    Subcategory / Shelf
                  </label>
                  {!isCustomSubCategory ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomSubCategory(true)}
                      className="text-[10px] font-bold text-[#1B5E20] hover:underline cursor-pointer"
                    >
                      + Custom
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCustomSubCategory(false)}
                      className="text-[10px] font-bold text-stone-500 hover:underline cursor-pointer"
                    >
                      Shelf List
                    </button>
                  )}
                </div>

                {!isCustomSubCategory ? (
                  <select
                    value={subCategory}
                    onChange={(e) => {
                      if (e.target.value === '__add_custom_sub__') {
                        setIsCustomSubCategory(true);
                      } else {
                        setSubCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                  >
                    {availableSubcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    {availableSubcategories.length === 0 && (
                      <option value="General">General</option>
                    )}
                    <option value="__add_custom_sub__">➕ + Add Custom Shelf...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={customSubCategoryName}
                      onChange={(e) => {
                        setCustomSubCategoryName(e.target.value);
                        setSubCategory(e.target.value);
                      }}
                      placeholder="e.g. Atta & Wheat Flour"
                      className="w-full px-3 py-2 bg-white border border-[#1B5E20] rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>Custom Subcategory</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSubCategory(false);
                          setSubCategory(availableSubcategories[0] || 'General');
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
            {!isNew && product.id && (
              <button
                type="button"
                onClick={() => { setDeleteError(null); setShowDeleteModal(true); }}
                className="py-3 px-3.5 sm:px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Delete product"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
        {/* Quick Add Pack Size / Quantity Modal */}
        {/* Delete Product Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-4 sm:p-5 space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">Delete Product?</h3>
                  <p className="text-[11px] text-stone-500 truncate">ID: {product.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-stone-900">&ldquo;{name || product.name}&rdquo;</span>? This will permanently remove it from customer search and the storefront.
              </p>

              {deleteError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddVariantModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-4 sm:p-5 space-y-3.5 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">Add Pack Size / Quantity</h3>
                  <p className="text-[11px] text-stone-500">e.g. 500 g, 1 kg, 2 kg, 5 L for this product</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Suggestions */}
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Quick Suggestions (Tap to pick)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['500 g', '1 kg', '2 kg', '3 kg', '5 kg', '10 kg', '500 ml', '1 L', '2 L', '5 L'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewVariantUnit(preset)}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-semibold border transition-all ${
                        newVariantUnit === preset
                          ? 'bg-emerald-100 text-[#1B5E20] border-emerald-400 font-bold'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pack Size / Unit Name */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Pack Size / Unit Label *
                </label>
                <input
                  type="text"
                  value={newVariantUnit}
                  onChange={(e) => {
                    setNewVariantUnit(e.target.value);
                    if (modalVariantError) setModalVariantError('');
                  }}
                  placeholder="e.g. 2 kg, 5 kg, 500 ml"
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>

              {/* Selling price and MRP */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newVariantPrice}
                    onChange={(e) => {
                      setNewVariantPrice(e.target.value.replace(/[^0-9.]/g, ''));
                      if (modalVariantError) setModalVariantError('');
                    }}
                    placeholder="e.g. 130"
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    MRP / Strike (₹)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newVariantMrp}
                    onChange={(e) => setNewVariantMrp(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="e.g. 140"
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Stock Quantity (Units) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newVariantStock}
                  onChange={(e) => setNewVariantStock(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#1B5E20] focus:outline-none"
                />
              </div>

              {modalVariantError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {modalVariantError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddVariant}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1B5E20] hover:bg-[#154a19] rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  Add Pack Size
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}