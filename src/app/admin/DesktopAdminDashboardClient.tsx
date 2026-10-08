'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  TrendingUp,
  Tag,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
  CreditCard,
  RefreshCw,
  UserCheck,
  Clock,
  Upload,
  X,
  MapPin,
  Navigation,
  Truck,
  Phone,
  Share2,
  Users,
  FileText,
} from 'lucide-react';
import type { Category, Product, Order } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import ProductImage from '@/components/storefront/ProductImage';
import StaffManagementTab from '@/components/admin/StaffManagementTab';
import SlipsManagementTab from '@/components/admin/SlipsManagementTab';

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function DesktopAdminDashboardClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'slips' | 'payments' | 'riders' | 'inventory' | 'add_product' | 'staff'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [markingOrderId, setMarkingOrderId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('Store Staff (Counter)');
  const [newSlipsCount, setNewSlipsCount] = useState(0);
  const [paymentsFilter, setPaymentsFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    try {
      // 1. Gather local orders from device storage
      let localOrders: any[] = [];
      try {
        const rawAcc = localStorage.getItem('g1mart_account_orders');
        const rawRecent = localStorage.getItem('g1mart_recent_order');
        const rawList = sessionStorage.getItem('g1mart_orders_list');
        const listA = rawAcc ? JSON.parse(rawAcc) : [];
        const listB = rawList ? JSON.parse(rawList) : [];
        const single = rawRecent ? [JSON.parse(rawRecent)] : [];
        const combined = [...listA, ...listB, ...single];
        const uniqueMap = new Map<string, any>();
        combined.forEach((o) => {
          if (o && o.id) uniqueMap.set(o.id, o);
        });
        localOrders = Array.from(uniqueMap.values());
      } catch {}

      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      const serverList = (data.success && Array.isArray(data.orders)) ? data.orders : [];

      // Only upload local orders that do not exist on the server yet (NEVER overwrite existing orders with stale local status)
      for (const lo of localOrders) {
        if (!serverList.some((s: any) => s.id === lo.id)) {
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lo),
          }).catch(() => {});
        }
      }

      // Merge: Server orders are authoritative for status and payment confirmation
      const mergedMap = new Map<string, any>();
      localOrders.forEach((o) => mergedMap.set(o.id, o));
      serverList.forEach((s: any) => {
        const local = mergedMap.get(s.id);
        mergedMap.set(s.id, { ...local, ...s });
      });

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
      setOrders(merged);
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  const fetchSlipsCount = async () => {
    try {
      const res = await fetch('/api/admin/slips');
      const data = await res.json();
      if (res.ok && Array.isArray(data.slips)) {
        const count = data.slips.filter((s: any) => s.status === 'new').length;
        setNewSlipsCount(count);
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders(false);
    fetchSlipsCount();

    // Instant real-time cross-tab synchronization
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('g1mart_order_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data.order) {
          setOrders((prev) => {
            if (prev.some((o) => o.id === event.data.order.id)) return prev;
            return [event.data.order, ...prev];
          });
        } else if (event.data?.type === 'ORDER_UPDATED' && event.data.order) {
          setOrders((prev) =>
            prev.map((o) => (o.id === event.data.order.id ? { ...o, ...event.data.order } : o))
          );
        }
      };
    } catch {}

    const interval = setInterval(() => {
      fetchOrders(true);
      fetchSlipsCount();
    }, 2000); // 2-second fast sync

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  const handleMarkPaid = async (orderId: string) => {
    const enteredStaff = prompt('Enter staff member name or cashier ID for payment audit trail:', staffName) || staffName;
    if (!enteredStaff) return;
    setStaffName(enteredStaff);
    setMarkingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIdentifier: enteredStaff }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );

        // Update local storage
        try {
          const rawAcc = localStorage.getItem('g1mart_account_orders');
          if (rawAcc) {
            const list = JSON.parse(rawAcc);
            const nextList = list.map((item: any) =>
              item.id === orderId ? { ...item, ...data.order, isPaid: true, paymentStatus: 'manual_verified' } : item
            );
            localStorage.setItem('g1mart_account_orders', JSON.stringify(nextList));
          }
          const rawRecent = localStorage.getItem('g1mart_recent_order');
          if (rawRecent) {
            const recent = JSON.parse(rawRecent);
            if (recent.id === orderId) {
              localStorage.setItem('g1mart_recent_order', JSON.stringify({ ...recent, ...data.order, isPaid: true, paymentStatus: 'manual_verified' }));
            }
          }
        } catch {}

        // Broadcast real-time payment update to customer tracking tab
        try {
          const bc = new BroadcastChannel('g1mart_order_channel');
          bc.postMessage({ type: 'ORDER_UPDATED', orderId, order: data.order });
          bc.close();
        } catch {}
      } else {
        alert('Failed: ' + (data.error || 'Could not mark order paid'));
      }
    } catch (err: any) {
      alert('Error marking order paid: ' + err.message);
    } finally {
      setMarkingOrderId(null);
    }
  };

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    setUpdatingOrderId(orderId);

    // Immediate optimistic update in admin UI
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
    );

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          staffIdentifier: staffName,
          orderFallback: targetOrder,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );

        // Sync browser storage so subsequent loads don't revert to old status
        try {
          const rawAcc = localStorage.getItem('g1mart_account_orders');
          if (rawAcc) {
            const list = JSON.parse(rawAcc);
            const nextList = list.map((item: any) =>
              item.id === orderId ? { ...item, ...data.order, status: nextStatus } : item
            );
            localStorage.setItem('g1mart_account_orders', JSON.stringify(nextList));
          }
          const rawRecent = localStorage.getItem('g1mart_recent_order');
          if (rawRecent) {
            const recent = JSON.parse(rawRecent);
            if (recent.id === orderId) {
              localStorage.setItem('g1mart_recent_order', JSON.stringify({ ...recent, ...data.order, status: nextStatus }));
            }
          }
          const rawList = sessionStorage.getItem('g1mart_orders_list');
          if (rawList) {
            const list = JSON.parse(rawList);
            const nextList = list.map((item: any) =>
              item.id === orderId ? { ...item, ...data.order, status: nextStatus } : item
            );
            sessionStorage.setItem('g1mart_orders_list', JSON.stringify(nextList));
          }
        } catch {}

        // Broadcast real-time status update to customer tracking tab in 0ms
        try {
          const bc = new BroadcastChannel('g1mart_order_channel');
          bc.postMessage({ type: 'ORDER_UPDATED', orderId, order: data.order, status: nextStatus });
          bc.close();
        } catch {}
      } else {
        alert('Failed: ' + (data.error || 'Could not update status'));
        if (targetOrder) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? targetOrder : o))
          );
        }
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
      if (targetOrder) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? targetOrder : o))
        );
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Image editing & upload state (Admin change product image)
  const [editingImageProduct, setEditingImageProduct] = useState<Product | null>(null);
  const [candidateImageUrl, setCandidateImageUrl] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUploadPreview, setImageUploadPreview] = useState<string | null>(null);
  const [imageSaveSuccess, setImageSaveSuccess] = useState<string | null>(null);
  const [imageSaveError, setImageSaveError] = useState<string | null>(null);
  const [savingImage, setSavingImage] = useState(false);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageUploadPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProductImage = async () => {
    if (!editingImageProduct) return;
    if (!selectedImageFile && !candidateImageUrl) return;

    setSavingImage(true);
    setImageSaveError(null);

    try {
      let finalImageUrl = candidateImageUrl;

      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('file', selectedImageFile);
        formData.append('productId', editingImageProduct.id);

        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to upload image file');
        }
        finalImageUrl = data.imageUrl;
      } else {
        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: editingImageProduct.id,
            imageUrl: candidateImageUrl,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to update image URL');
        }
        finalImageUrl = data.imageUrl;
      }

      // Persisted to Supabase successfully! Now update local state
      const targetId = editingImageProduct.id;
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === targetId) {
            return {
              ...p,
              image: finalImageUrl,
              image_url: finalImageUrl,
              imageUrl: finalImageUrl,
              image_path: finalImageUrl,
              image_status: 'VERIFIED',
              image_source: 'own_photo',
              image_license: 'Store Owner Approved Asset',
              image_match_note: `Photo updated and verified on ${new Date().toLocaleDateString('en-IN')}`,
            };
          }
          return p;
        })
      );
      setImageSaveSuccess(`Product photo uploaded & verified for "${editingImageProduct.name}"!`);
      setTimeout(() => {
        setImageSaveSuccess(null);
        setEditingImageProduct(null);
        setCandidateImageUrl('');
        setImageUploadPreview(null);
        setSelectedImageFile(null);
        setSavingImage(false);
      }, 1500);
    } catch (err: any) {
      console.error('[Admin] Image upload error:', err);
      setImageSaveError(err.message || 'Image upload failed');
      setSavingImage(false);
    }
  };

  // New product form state
  const [newProductName, setNewProductName] = useState('');
  const [newBrand, setNewBrand] = useState('G1 Mart');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'rice-dal-atta');
  const [newSubCategory, setNewSubCategory] = useState(categories[0]?.subcategories[0] || 'Atta & Flours');
  const [newUnit, setNewUnit] = useState('1 kg');
  const [newPrice, setNewPrice] = useState('65');
  const [newMRP, setNewMRP] = useState('65');
  const [newStock, setNewStock] = useState('50');
  const [newImage, setNewImage] = useState('/products/prod-2.jpg');
  const [newDesc, setNewDesc] = useState('Authentic, hygienically packed product sourced directly for G1 Mart Supermarket.');
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // Quick photo presets for adding items easily
  const PHOTO_PRESETS = [
    { label: 'Atta / Wheat', url: '/products/prod-2.jpg' },
    { label: 'Tata Salt', url: '/products/prod-1.jpg' },
    { label: 'Sunflower Oil', url: '/products/prod-3.jpg' },
    { label: 'Fresh Milk', url: '/products/prod-4.jpg' },
    { label: 'Brown Bread', url: '/products/prod-5.jpg' },
    { label: 'Basmati Rice', url: '/products/prod-6.jpg' },
    { label: 'Potato Chips', url: '/products/prod-7.jpg' },
    { label: 'Coca Cola', url: '/products/prod-8.jpg' },
    { label: 'Surf Excel', url: '/products/prod-9.jpg' },
    { label: 'Colgate Dental', url: '/products/prod-10.jpg' },
    { label: 'Toor Dal', url: '/products/photos/toor-dal.jpg' },
    { label: 'Urad Dal', url: '/products/photos/urad-dal.jpg' },
    { label: 'Moong Dal', url: '/products/photos/moong-dal.jpg' },
    { label: 'Chana Dal', url: '/products/photos/chana-dal.jpg' },
    { label: 'Cashews / Kaju', url: '/products/photos/cashews.jpg' },
    { label: 'Almonds / Badam', url: '/products/photos/almonds.jpg' },
    { label: 'Red Chilli Powder', url: '/products/photos/chilli-powder.jpg' },
    { label: 'Turmeric Powder', url: '/products/photos/turmeric.jpg' },
    { label: 'Crystal Salt', url: '/products/photos/crystal-salt.jpg' },
    { label: 'Suji Rava', url: '/products/photos/suji-rava.jpg' },
    { label: 'Pure Cow Ghee', url: '/products/photos/ghee.jpg' },
    { label: 'Pooja Camphor', url: '/products/photos/pooja-camphor.jpg' },
  ];

  // Selected category object
  const currentCategoryObj = categories.find((c) => c.id === newCategory);

  // Metrics
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;

  // Filtered products list for inventory table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.rawName && p.rawName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;

      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && p.inStock) ||
        (stockFilter === 'out_of_stock' && !p.inStock);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // State for complete product edit modal
  const [editingProductModal, setEditingProductModal] = useState<Product | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormBrand, setEditFormBrand] = useState('');
  const [editFormPrice, setEditFormPrice] = useState('');
  const [editFormMRP, setEditFormMRP] = useState('');
  const [editFormUnit, setEditFormUnit] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('');
  const [editFormSubCategory, setEditFormSubCategory] = useState('');
  const [editFormInStock, setEditFormInStock] = useState(true);
  const [editFormImageUrl, setEditFormImageUrl] = useState('');
  const [isSavingProductDetails, setIsSavingProductDetails] = useState(false);
  const [saveProductError, setSaveProductError] = useState<string | null>(null);
  const [saveProductSuccess, setSaveProductSuccess] = useState(false);

  const openEditProductModal = (p: Product) => {
    setEditingProductModal(p);
    setEditFormName(p.name);
    setEditFormBrand(p.brand || '');
    setEditFormPrice(p.price > 0 ? String(p.price) : '');
    setEditFormMRP(p.originalPrice > 0 ? String(p.originalPrice) : String(p.price || ''));
    setEditFormUnit(p.unit || '');
    setEditFormCategory(p.category || 'personal-care');
    setEditFormSubCategory(p.subCategory || '');
    setEditFormInStock(p.inStock ?? true);
    setEditFormImageUrl(p.imageUrl || p.image || '');
    setSaveProductError(null);
    setSaveProductSuccess(false);
  };

  const handleSaveProductDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductModal) return;
    setIsSavingProductDetails(true);
    setSaveProductError(null);
    try {
      const priceNum = parseFloat(editFormPrice) || 0;
      const mrpNum = parseFloat(editFormMRP) || priceNum;
      const updatedPayload = {
        id: editingProductModal.id,
        name: editFormName,
        brand: editFormBrand,
        price: priceNum,
        originalPrice: mrpNum,
        unit: editFormUnit,
        category: editFormCategory,
        subCategory: editFormSubCategory,
        inStock: editFormInStock,
        imageUrl: editFormImageUrl,
        imageStatus: editFormImageUrl && !editFormImageUrl.includes('placeholder.svg') ? 'VERIFIED' : 'NEEDS_REVIEW',
      };

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProductModal.id ? { ...item, ...data.product } : item))
        );
        setSaveProductSuccess(true);
        setTimeout(() => {
          setEditingProductModal(null);
          setSaveProductSuccess(false);
        }, 1200);
      } else {
        setSaveProductError(data.error || 'Failed to update product');
      }
    } catch (err: any) {
      setSaveProductError(err.message || 'Failed to update product');
    } finally {
      setIsSavingProductDetails(false);
    }
  };

  // Handle live stock toggle with backend persistence
  const toggleStock = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const nextVal = !target.inStock;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: nextVal } : p))
    );
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, inStock: nextVal }),
      });
    } catch (e) {
      console.error('Failed to update stock', e);
    }
  };

  // Handle inline price update with backend persistence
  const updatePrice = async (productId: string, newP: number) => {
    if (isNaN(newP) || newP < 0) return;
    const target = products.find((p) => p.id === productId);
    const mrp = target?.originalPrice && target.originalPrice >= newP ? target.originalPrice : newP;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, price: newP, originalPrice: mrp, priceConfirmed: newP > 0 } : p
      )
    );
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, price: newP, originalPrice: mrp }),
      });
    } catch (e) {
      console.error('Failed to update price', e);
    }
  };

  // Handle Add Product submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice) || 0;
    const mrpNum = parseFloat(newMRP) || priceNum;
    const stockNum = parseInt(newStock, 10) || 10;

    const newProd: Product = {
      id: `g1-${Date.now()}`,
      itemNumber: products.length + 1,
      name: `${newProductName} (${newUnit})`,
      brand: newBrand || 'G1 Mart',
      category: newCategory,
      subCategory: newSubCategory,
      unit: newUnit,
      price: priceNum,
      priceConfirmed: false,
      originalPrice: mrpNum,
      discountPercentage: mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
      inStock: stockNum > 0,
      stockCount: stockNum,
      image: '/products/placeholder.svg',
      image_path: newImage,
      image_source: 'own_photo',
      image_license: 'Proprietary Store Asset',
      image_status: 'pending',
      image_match_note: 'Awaiting store owner review and approval before publishing to storefront.',
      description: newDesc,
      rating: 4.9,
      reviewsCount: 1,
      isPopular: true,
      isBestDeal: false,
    };

    setProducts((prev) => [newProd, ...prev]);
    setAddSuccessMsg(`"${newProd.name}" successfully added to G1 Mart store!`);

    // Reset form
    setNewProductName('');
    setTimeout(() => {
      setAddSuccessMsg(null);
      setActiveTab('inventory');
    }, 2000);
  };

  // Simulated live customer preview item
  const previewProduct: Product = {
    id: 'preview-item',
    name: newProductName ? `${newProductName} (${newUnit})` : `Sample Product (${newUnit})`,
    brand: newBrand || 'G1 Mart',
    category: newCategory,
    subCategory: newSubCategory,
    unit: newUnit,
    price: parseFloat(newPrice) || 50,
    priceConfirmed: true,
    originalPrice: parseFloat(newMRP) || 50,
    discountPercentage: 0,
    inStock: true,
    stockCount: parseInt(newStock, 10) || 20,
    image: newImage || '/products/placeholder.svg',
    image_url: newImage || null,
    image_path: newImage,
    image_source: 'own_photo',
    image_status: 'VERIFIED', // Show in preview card so admin can see candidate layout
    description: newDesc,
    rating: 4.8,
    reviewsCount: 12,
    isPopular: true,
  };

  // Computed live operational metrics
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled'),
    [orders]
  );
  const activeOrdersCount = activeOrders.length;
  const pendingCodOrders = useMemo(
    () => orders.filter((o) => !o.isPaid && o.paymentStatus !== 'completed' && o.paymentStatus !== 'manual_verified'),
    [orders]
  );
  const pendingCodCount = pendingCodOrders.length;
  const pendingCodTotal = useMemo(
    () => pendingCodOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0),
    [pendingCodOrders]
  );
  const totalRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0),
    [orders]
  );
  const totalPaidRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.isPaid || o.paymentStatus === 'completed' || o.paymentStatus === 'manual_verified')
        .reduce((acc, o) => acc + (o.grandTotal || 0), 0),
    [orders]
  );
  const dispatchedOrders = useMemo(
    () => orders.filter((o) => o.status === 'Order Dispatched' || o.status === 'Out for Delivery'),
    [orders]
  );
  const packedOrders = useMemo(
    () => orders.filter((o) => o.status === 'Packed'),
    [orders]
  );

  const filteredPaymentOrders = useMemo(() => {
    return orders.filter((o) => {
      const isPaid =
        o.isPaid ||
        o.paymentStatus === 'completed' ||
        o.paymentStatus === 'manual_verified';
      if (paymentsFilter === 'pending' && isPaid) return false;
      if (paymentsFilter === 'paid' && !isPaid) return false;
      if (paymentsSearch) {
        const query = paymentsSearch.toLowerCase();
        const matchesName = (o.address?.fullName || '').toLowerCase().includes(query);
        const matchesPhone = (o.address?.mobileNumber || o.address?.phone || '').includes(query);
        const matchesId = (o.id || '').toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesId;
      }
      return true;
    });
  }, [orders, paymentsFilter, paymentsSearch]);

  const navItems = [
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: Package,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeClass: 'bg-[#1B5E20] text-white',
    },
    {
      id: 'slips' as const,
      label: 'Customer Slips',
      icon: FileText,
      badge: newSlipsCount > 0 ? newSlipsCount : undefined,
      badgeClass: 'bg-amber-500 text-white animate-pulse',
    },
    {
      id: 'payments' as const,
      label: 'Payments & Cash',
      icon: CreditCard,
      badge: pendingCodCount > 0 ? pendingCodCount : undefined,
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      id: 'riders' as const,
      label: 'Riders & Dispatch',
      icon: Truck,
      badge: dispatchedOrders.length > 0 ? dispatchedOrders.length : undefined,
      badgeClass: 'bg-purple-100 text-purple-900',
    },
    {
      id: 'inventory' as const,
      label: 'Inventory Catalog',
      icon: Layers,
      badge: totalProducts,
      badgeClass: 'bg-stone-100 text-stone-600',
    },
    {
      id: 'add_product' as const,
      label: 'Add New Product',
      icon: PlusCircle,
    },
    {
      id: 'staff' as const,
      label: 'Staff & Roles',
      icon: Users,
    },
  ];

  const mobileNavItems = [
    { id: 'orders' as const, label: 'Orders', icon: Package, badge: activeOrdersCount },
    { id: 'slips' as const, label: 'Slips', icon: FileText, badge: newSlipsCount },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard, badge: pendingCodCount },
    { id: 'riders' as const, label: 'Riders', icon: Truck, badge: dispatchedOrders.length },
    { id: 'inventory' as const, label: 'Catalog', icon: Layers },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start pb-24 lg:pb-10 min-h-screen">
      {/* ── DESKTOP APP SIDEBAR NAVIGATION ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-4 space-y-5 sticky top-20">
        {/* Hub Status Card */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Store Operations</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
              Live Hub
            </span>
          </div>
          <p className="text-xs font-black text-stone-900 truncate">G1 Mart Supermarket</p>
          <p className="text-[10px] text-stone-500 truncate">Nellore · Magunta Layout</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 flex-1">
          <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider px-2 block mb-2">
            Operations App
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'orders') fetchOrders(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1B5E20] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : item.badgeClass || 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick App Actions Footer */}
        <div className="pt-3 border-t border-stone-100 space-y-2">
          <Link
            href="/rider"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-purple-700" />
              <span>🛵 Rider App</span>
            </div>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>View Storefront</span>
            </div>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>
        </div>
      </aside>

      {/* ── MOBILE PINNED BOTTOM NAVIGATION BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-2 py-2 flex items-center justify-around shadow-xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'orders') fetchOrders(false);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#1B5E20]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Options / Drawer Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'add_product' || activeTab === 'staff' ? 'text-[#1B5E20]' : 'text-stone-500'
          }`}
        >
          <Users className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] mt-0.5 font-semibold">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer / Modal */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 space-y-3 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="font-bold text-xs text-stone-900">More Operations</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('add_product');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-bold ${
                  activeTab === 'add_product' ? 'bg-[#1B5E20] text-white' : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add New Product</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-bold ${
                  activeTab === 'staff' ? 'bg-[#1B5E20] text-white' : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff &amp; Cashier Roles</span>
              </button>
              <Link
                href="/rider"
                target="_blank"
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold bg-purple-50 text-purple-900"
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4" />
                  <span>🛵 Open Rider Dispatch App</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN APPLICATION WORKSPACE ── */}
      <main className="flex-1 min-w-0 space-y-5 w-full">
        {/* Top Operations Header Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {activeTab === 'orders' && 'Live Order Fulfillment & Dispatch'}
                {activeTab === 'slips' && 'Handwritten Customer Slips'}
                {activeTab === 'payments' && 'Cash Collection & UPI Payments Audit'}
                {activeTab === 'riders' && 'Rider Fleet & GPS Express Dispatch'}
                {activeTab === 'inventory' && 'Inventory Catalog & Price Control'}
                {activeTab === 'add_product' && 'Add New Product to Store'}
                {activeTab === 'staff' && 'Store Staff & Counter Cashiers'}
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Nellore Hub · Magunta Layout · Staff: <span className="font-bold text-stone-700">{staffName}</span>
            </p>
          </div>

          {/* Real-time KPI Chips & Manual Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
              <span>Active Orders:</span>
              <span className="font-black text-[#1B5E20]">{activeOrdersCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
              <span>Cash to Collect:</span>
              <span className="font-black text-amber-900">₹{pendingCodTotal}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                fetchOrders(false);
                fetchSlipsCount();
              }}
              disabled={loadingOrders}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh all store data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INVENTORY MANAGER */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Catalog KPI Cards (Only in Inventory tab) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center font-black">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-stone-900">{totalProducts}</div>
                  <div className="text-[10px] font-semibold text-stone-500">Total Products</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-green-700">{inStockCount}</div>
                  <div className="text-[10px] font-semibold text-stone-500">Live In-Stock</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-red-600">{outOfStockCount}</div>
                  <div className="text-[10px] font-semibold text-stone-500">Out of Stock</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-stone-900">{categories.length}</div>
                  <div className="text-[10px] font-semibold text-stone-500">Store Aisles</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="p-3 sm:p-4 border-b border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-bold bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="all">All Aisles ({totalProducts})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-xs font-bold bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>
            </div>
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Name &amp; Ambiguity Flag</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Price (₹)</th>
                  <th className="py-2.5 px-3">Section 9.2 Image Gate</th>
                  <th className="py-2.5 px-3">Stock Status</th>
                  <th className="py-2.5 px-3 text-right">Customer View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredProducts.slice(0, 100).map((p, index) => {
                  const effectiveUrl = p.image_url || p.imageUrl || p.image;
                  const currentStatus = p.image_status || (p as any).imageStatus || 'MISSING';
                  const isVerified = currentStatus === 'VERIFIED' || currentStatus === 'approved';

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-stone-400 text-[11px]">
                        {p.itemNumber || index + 1}
                      </td>

                      {/* Product Name & Details */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative group shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-white border border-stone-200/80 overflow-hidden flex items-center justify-center p-0.5">
                              <ProductImage
                                imageUrl={effectiveUrl}
                                imageStatus={currentStatus}
                                alt={p.name}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingImageProduct(p);
                                setCandidateImageUrl(isVerified ? (effectiveUrl || '') : '');
                                setImageUploadPreview(null);
                                setSelectedImageFile(null);
                                setImageSaveError(null);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
                              title="Click pencil to change or upload product image"
                            >
                              <Edit2 className="w-2.5 h-2.5 stroke-[2.5]" />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 truncate max-w-xs flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.is_ambiguous && (
                                <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                                  ⚠️ Ambiguous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 font-medium">
                              POS: <code className="bg-stone-100 px-1 rounded">{p.rawName || p.name}</code> · Brand: <span className="font-semibold text-stone-700">{p.brand}</span>
                            </div>
                            {p.ambiguity_note && (
                              <div className="text-[10px] text-red-600 font-medium mt-0.5">
                                {p.ambiguity_note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-stone-700 block truncate">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-stone-400 block truncate">
                          {p.subCategory || 'General'}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-3 font-semibold text-stone-600">
                        {p.unit}
                      </td>

                      {/* Price with inline quick edit */}
                      <td className="py-2.5 px-3">
                        {p.priceConfirmed && p.price > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="font-black text-stone-900">₹</span>
                            <input
                              type="number"
                              defaultValue={p.price}
                              onBlur={(e) => updatePrice(p.id, parseFloat(e.target.value))}
                              className="w-16 px-1.5 py-0.5 border border-stone-200 rounded text-xs font-black text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                            />
                          </div>
                        ) : p.originalPrice && p.originalPrice > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-stone-900 text-xs tabular-nums">
                              MRP ₹{p.originalPrice}
                            </span>
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded w-fit">
                              Price TBA
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded tracking-tight">
                            Price TBA
                          </span>
                        )}
                      </td>

                      {/* Section 9.2 Image Gate Status */}
                      <td className="py-2.5 px-3">
                        <div className="space-y-1">
                          {isVerified ? (
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                              ✓ Verified Authentic
                            </span>
                          ) : currentStatus === 'NEEDS_REVIEW' ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                              🔍 Needs Review
                            </span>
                          ) : currentStatus === 'PENDING' ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                              ⏳ Pending Review
                            </span>
                          ) : (
                            <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                              📦 Missing / Unverified
                            </span>
                          )}
                          <div className="text-[9px] text-stone-400 font-mono">
                            status: {currentStatus}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingImageProduct(p);
                              setCandidateImageUrl(isVerified ? (effectiveUrl || '') : '');
                              setImageUploadPreview(null);
                              setSelectedImageFile(null);
                              setImageSaveError(null);
                            }}
                            className="mt-1 text-[10px] font-bold text-[#2E7D32] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Change Image</span>
                          </button>
                        </div>
                      </td>

                    {/* Live Stock Toggle Switch */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleStock(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                          p.inStock
                            ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                            : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                        }`}
                        title="Click to toggle stock status"
                      >
                        {p.inStock ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-700" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit & View on Store */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Edit product name, price, MRP, and stock"
                        >
                          <Edit2 className="w-3 h-3 text-[#2E7D32]" />
                          <span>Edit</span>
                        </button>
                        <Link
                          href={`/category/${p.category}`}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#2E7D32] hover:text-[#1B5E20] hover:underline px-1.5 py-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-stone-500 text-xs">
              No products match your search or filter.
            </div>
          )}

          {filteredProducts.length > 100 && (
            <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-xs font-semibold text-stone-500">
              Showing first 100 of {filteredProducts.length} filtered items. Use search to find specific items.
            </div>
          )}
        </div>
      </div>
    )}

      {/* TAB 2: ADD NEW PRODUCT WITH LIVE CUSTOMER PREVIEW */}
      {activeTab === 'add_product' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (8 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-base font-extrabold text-stone-900">
                Add New Product to G1 Mart
              </h2>
              <p className="text-xs text-stone-500">
                Newly added products become instantly discoverable on the storefront and Blinkit category dashboard.
              </p>
            </div>

            {addSuccessMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{addSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Aashirvaad Superior MP Atta"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                />
              </div>

              {/* Brand & Net Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="G1 Mart / ITC / Tata"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Net Quantity / Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. 1 kg, 500 g, 1 pack"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Store Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      const cat = categories.find((c) => c.id === e.target.value);
                      if (cat && cat.subcategories.length > 0) {
                        setNewSubCategory(cat.subcategories[0]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Blinkit Subcategory
                  </label>
                  <select
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  >
                    {currentCategoryObj?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, MRP, Stock Count */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    MRP / Orig Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMRP}
                    onChange={(e) => setNewMRP(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>
              </div>

              {/* Product Photo Selector / URL */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Image (Photo Pack)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="URL or /products/..."
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                {/* Preset quick buttons */}
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block mb-1">
                    Or select from high-resolution FMCG presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-100">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setNewImage(p.url)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition-all ${
                          newImage === p.url
                            ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-extrabold text-sm tracking-wide shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save &amp; Publish to G1 Mart Store</span>
              </button>
            </form>
          </div>

          {/* Right: Live Customer Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#E8F5E9]/50 border border-[#2E7D32]/20 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="text-xs font-black text-[#1B5E20] uppercase tracking-wider">
                  Live Customer Preview
                </h3>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                This shows exactly what shoppers will see in the app and on the Blinkit-style Category Dashboard.
              </p>
            </div>

            {/* Render realistic customer product card */}
            <div className="max-w-[240px] mx-auto sm:mx-0">
              <ProductCard product={previewProduct} />
            </div>

            <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500 font-medium space-y-1">
              <div>✓ Category: <strong>{newCategory}</strong></div>
              <div>✓ Subcategory: <strong>{newSubCategory}</strong></div>
              <div>✓ Instant addition to client-side catalog state</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & PAYMENTS (PHASE 5) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2E7D32]" />
                <span>Customer Orders &amp; Payment Audit</span>
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Review UPI transactions, manage Cash on Delivery, and audit staff manual payment confirmations (SPEC Section 11 &amp; 15).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loadingOrders}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-xs font-bold text-stone-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-bold text-stone-700">No customer orders recorded yet.</p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Orders placed via UPI checkout, PhonePe, or Cash on Delivery will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* MOBILE CARDS VIEW (NO HORIZONTAL SCROLL ON PHONES) */}
              <div className="lg:hidden space-y-3.5">
                {orders.map((o) => {
                  const isFullyPaid = o.paymentStatus === 'completed' || o.paymentStatus === 'manual_verified';
                  const currentStatus = o.status || 'Order Placed';
                  const destQuery = (o.address?.latitude && o.address?.longitude)
                    ? `${o.address.latitude},${o.address.longitude}`
                    : encodeURIComponent(`${o.address?.houseFlat || ''} ${o.address?.streetArea || ''} ${o.address?.city || 'Nellore'} ${o.address?.pincode || ''}`);
                  const riderMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;
                  const riderAppUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}/rider?orderId=${o.id}`
                    : `https://g1mart.vercel.app/rider?orderId=${o.id}`;

                  const whatsappShareText = encodeURIComponent(
                    `*🛵 G1 MART DELIVERY DISPATCH*\n` +
                    `Order ID: #${o.id}\n` +
                    `Status: ${currentStatus}\n` +
                    `Customer: ${o.address?.fullName || 'Customer'} (${o.address?.mobileNumber || o.address?.phone || ''})\n` +
                    `Address: ${o.address?.houseFlat ? o.address.houseFlat + ', ' : ''}${o.address?.streetArea || ''}, ${o.address?.city || 'Nellore'}\n` +
                    `Landmark: ${o.address?.landmark || 'N/A'}\n` +
                    `Items to Deliver: ${o.items?.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}\n` +
                    `Collect Amount: ${isFullyPaid ? 'ALREADY PAID (₹0 to collect)' : `₹${o.grandTotal} CASH ON DELIVERY`}\n\n` +
                    `👉 Open in Rider App: ${riderAppUrl}\n` +
                    `📍 Turn-by-Turn GPS: ${riderMapsUrl}`
                  );

                  return (
                    <div key={o.id} className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
                        <div>
                          <span className="font-mono font-black text-sm text-stone-900">#{o.id}</span>
                          <span className="text-[10px] text-stone-500 block mt-0.5">{o.date} · Slot: {o.slot}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-stone-900 block">₹{o.grandTotal}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFullyPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isFullyPaid ? '✓ Paid' : 'Cash on Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Address */}
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-stone-900">{o.address?.fullName || 'Customer'}</span>
                            {o.userEmail && (
                              <span className="text-[10px] text-stone-400 block truncate">{o.userEmail}</span>
                            )}
                          </div>
                          {(o.address?.mobileNumber || o.address?.phone) && (
                            <a
                              href={`tel:${o.address?.mobileNumber || o.address?.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1B5E20] text-white font-bold rounded-lg text-[10px] shadow-2xs hover:bg-[#144718]"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call {o.address?.mobileNumber || o.address?.phone}</span>
                            </a>
                          )}
                        </div>
                        <p className="text-stone-600 text-[11px]">
                          {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}{o.address?.streetArea}, {o.address?.city || 'Nellore'}
                        </p>
                        {o.address?.landmark && (
                          <p className="text-[10px] text-stone-500 italic">Near {o.address.landmark}</p>
                        )}
                        {o.address?.deliveryInstructions && (
                          <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[10px]">
                            ⚠️ Note: {o.address.deliveryInstructions}
                          </div>
                        )}
                      </div>

                      {/* Complete Itemized Picking & Packing Checklist */}
                      <div className="bg-stone-50/80 rounded-xl border border-stone-200 p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-200/80 pb-1.5">
                          <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-[#1B5E20]" />
                            <span>Items in Order ({o.items?.length || 0})</span>
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">Total: ₹{o.grandTotal}</span>
                        </div>
                        <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto space-y-1">
                          {o.items?.map((item: any, idx: number) => (
                            <div key={idx} className="pt-1.5 pb-1 flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.image || '/products/placeholder.svg'}
                                  alt={item.productName}
                                  className="w-9 h-9 object-contain rounded-lg border border-stone-200 bg-white p-0.5 shrink-0"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-stone-900 leading-snug break-words">{item.productName}</p>
                                  <p className="text-[10px] text-stone-500">{item.unit || '1 pc'}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="inline-block bg-[#1B5E20]/10 text-[#1B5E20] font-black px-2 py-0.5 rounded-md text-xs">
                                  x{item.quantity}
                                </span>
                                <span className="block text-[11px] font-extrabold text-stone-800 mt-0.5">
                                  {item.price > 0 ? `₹${item.price * item.quantity}` : '₹--'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unified Single-Color Progressive Fulfillment Pipeline */}
                      <div className="space-y-2 pt-1 border-t border-stone-100">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Order Progression Flow
                        </span>
                        <div className="flex flex-col gap-2">
                          {/* Step 1: Pack Order */}
                          {currentStatus === 'Order Placed' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o.id, 'Packed')}
                              disabled={updatingOrderId === o.id}
                              className="w-full py-2.5 px-3 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Package className="w-4 h-4" />
                              <span>1. Mark Packed (Ready for Rider)</span>
                            </button>
                          ) : (
                            <div className="w-full py-2 px-3 bg-stone-900 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Step 1: Packed &amp; Bagged</span>
                              </span>
                              <span className="text-[10px] text-stone-400">Completed</span>
                            </div>
                          )}

                          {/* Step 2: Handover to Rider / Mark Dispatched */}
                          {currentStatus === 'Packed' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o.id, 'Order Dispatched')}
                              disabled={updatingOrderId === o.id}
                              className="w-full py-2.5 px-3 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Truck className="w-4 h-4" />
                              <span>2. Handover to Rider (Mark Dispatched)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' || currentStatus === 'Delivered' ? (
                            <div className="w-full py-2 px-3 bg-stone-900 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Step 2: Dispatched with Rider</span>
                              </span>
                              <span className="text-[10px] text-stone-400">On Road</span>
                            </div>
                          ) : (
                            <div className="w-full py-2 px-3 bg-stone-100 text-stone-400 rounded-xl text-xs font-medium flex items-center justify-between">
                              <span>Step 2: Dispatch to Rider</span>
                              <span className="text-[10px]">Awaiting Step 1</span>
                            </div>
                          )}

                          {/* Step 3: Mark Delivered */}
                          {currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                              disabled={updatingOrderId === o.id}
                              className="w-full py-2.5 px-3 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>3. Confirm Customer Delivery</span>
                            </button>
                          ) : currentStatus === 'Delivered' ? (
                            <div className="w-full py-2 px-3 bg-stone-900 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Step 3: Delivered at Doorstep 🎉</span>
                              </span>
                              <span className="text-[10px] text-stone-400">Completed</span>
                            </div>
                          ) : (
                            <div className="w-full py-2 px-3 bg-stone-100 text-stone-400 rounded-xl text-xs font-medium flex items-center justify-between">
                              <span>Step 3: Confirm Customer Delivery</span>
                              <span className="text-[10px]">Awaiting Dispatch</span>
                            </div>
                          )}

                          {/* Step 4: Cash Collection & Payment Audit */}
                          {isFullyPaid ? (
                            <div className="w-full py-2 px-3 bg-stone-900 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Step 4: Paid (₹{o.grandTotal} Verified)</span>
                              </span>
                              <span className="text-[10px] text-stone-400">Audit Done</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(o.id)}
                              disabled={markingOrderId === o.id}
                              className="w-full py-2.5 px-3 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>{markingOrderId === o.id ? 'Verifying...' : `4. Collect Cash & Mark Paid (₹${o.grandTotal})`}</span>
                            </button>
                          )}
                        </div>

                        {/* Rider GPS Route & WhatsApp Dispatch */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={riderMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2 bg-stone-900 hover:bg-black text-white rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                            <span>Rider GPS Route</span>
                          </a>
                          <a
                            href={`https://wa.me/?text=${whatsappShareText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp Rider</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE VIEW (FULL COLUMNS ON LARGE SCREENS) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Order ID &amp; Time</th>
                    <th className="py-2.5 px-3">Customer &amp; Delivery</th>
                    <th className="py-2.5 px-3">Items &amp; Amount</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Fulfillment Status</th>
                    <th className="py-2.5 px-3">Rider Dispatch &amp; Route</th>
                    <th className="py-2.5 px-3 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {orders.map((o) => {
                    const isFullyPaid = o.paymentStatus === 'completed' || o.paymentStatus === 'manual_verified';
                    const currentStatus = o.status || 'Order Placed';
                    const hasGpsPin = Boolean(o.address?.latitude && o.address?.longitude);
                    const destQuery = hasGpsPin
                      ? `${o.address!.latitude},${o.address!.longitude}`
                      : encodeURIComponent(`${o.address?.houseFlat || ''} ${o.address?.streetArea || ''} ${o.address?.city || 'Nellore'} ${o.address?.pincode || ''}`);
                    const riderMapsUrl = hasGpsPin
                      ? `https://www.google.com/maps/dir/?api=1&destination=${destQuery}&travelmode=two_wheeler`
                      : `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;
                    const whatsappShareText = encodeURIComponent(
                      `*🛵 G1 MART DELIVERY DISPATCH*\n` +
                      `Order ID: #${o.id}\n` +
                      `Customer: ${o.address?.fullName || 'Customer'} (${o.address?.mobileNumber || o.address?.phone || ''})\n` +
                      `Address: ${o.address?.houseFlat ? o.address.houseFlat + ', ' : ''}${o.address?.streetArea || ''}, ${o.address?.city || 'Nellore'}\n` +
                      `Landmark: ${o.address?.landmark || 'N/A'}\n` +
                      `Items: ${o.items?.map((it) => `${it.productName} x${it.quantity}`).join(', ')}\n` +
                      `Amount to Collect: ${o.isPaid ? 'PAID ONLINE (₹0 to collect)' : `₹${o.grandTotal} CASH ON DELIVERY`}\n` +
                      (hasGpsPin
                        ? `📍 Doorstep GPS Pin: (${Number(o.address!.latitude).toFixed(6)}, ${Number(o.address!.longitude).toFixed(6)})${o.address?.accuracy ? ` [±${o.address.accuracy}m accuracy]` : ''}\n`
                        : '') +
                      `🗺️ Turn-by-Turn GPS Navigation: ${riderMapsUrl}`
                    );

                    return (
                      <tr key={o.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 align-top font-mono">
                          <div className="font-bold text-stone-900">#{o.id}</div>
                          <div className="text-[10px] text-stone-400 font-sans mt-0.5">
                            {new Date(o.date).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top">
                          <div className="font-bold text-stone-900">{o.address?.fullName || 'Customer'}</div>
                          <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{o.address?.mobileNumber || o.address?.phone}</span>
                            {(o.address?.mobileNumber || o.address?.phone) && (
                              <a
                                href={`tel:${o.address?.mobileNumber || o.address?.phone}`}
                                title="Call customer"
                                className="text-emerald-700 hover:text-emerald-800"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate max-w-[180px] mt-0.5">
                            {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}{o.address?.streetArea}
                          </div>
                          {o.address?.landmark && (
                            <div className="text-[10px] text-stone-500 italic">
                              Near {o.address.landmark}
                            </div>
                          )}
                          <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                            Slot: {o.slot}
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top min-w-[220px]">
                          <div className="font-black text-stone-900 text-sm mb-1">₹{o.grandTotal}</div>
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {o.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs bg-stone-50 p-1 rounded-lg border border-stone-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.image || '/products/placeholder.svg'}
                                  alt={item.productName}
                                  className="w-7 h-7 object-contain rounded bg-white border border-stone-200 shrink-0"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-stone-800 line-clamp-1 text-[11px]">{item.productName}</span>
                                  <span className="text-[10px] text-stone-500 font-semibold">{item.unit || '1 pc'}</span>
                                </div>
                                <span className="bg-[#1B5E20]/10 text-[#1B5E20] font-black px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-bold text-[10px] uppercase mb-1">
                            {o.paymentMethod === 'upi'
                              ? 'UPI (PhonePe)'
                              : o.paymentMethod === 'cod'
                              ? 'Cash on Delivery'
                              : o.paymentMethod === 'store'
                              ? 'Pay at Store'
                              : o.paymentMethod}
                          </span>

                          {isFullyPaid ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-900 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Paid (₹{o.grandTotal})</span>
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Cash to Collect</span>
                            </span>
                          )}
                        </td>

                        {/* Unified Single-Color Fulfillment Progression Pipeline */}
                        <td className="py-3 px-3 align-top min-w-[190px]">
                          <div className="space-y-1.5">
                            {/* Current Status Pill */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              currentStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-900'
                                : currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : currentStatus === 'Packed'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}>
                              <Truck className="w-3 h-3" />
                              <span>{currentStatus}</span>
                            </span>

                            {/* Step Progression Buttons */}
                            <div className="flex flex-col gap-1">
                              {currentStatus === 'Order Placed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Packed')}
                                  disabled={updatingOrderId === o.id}
                                  className="w-full px-2.5 py-1.5 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-lg text-[10px] font-black text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
                                >
                                  <span>1. 📦 Mark Packed</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              {currentStatus === 'Packed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Order Dispatched')}
                                  disabled={updatingOrderId === o.id}
                                  className="w-full px-2.5 py-1.5 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-lg text-[10px] font-black text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
                                >
                                  <span>2. 🛵 Handover to Rider</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              {(currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery') && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                                  disabled={updatingOrderId === o.id}
                                  className="w-full px-2.5 py-1.5 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-lg text-[10px] font-black text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
                                >
                                  <span>3. ✅ Confirm Delivery</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              )}

                              {currentStatus === 'Delivered' && (
                                <div className="px-2 py-1 bg-stone-900 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Delivered at Doorstep</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rider Dispatch & Route */}
                        <td className="py-3 px-3 align-top min-w-[150px]">
                          <div className="space-y-1.5">
                            <a
                              href={riderMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-black text-white rounded-lg text-[10px] font-bold shadow-2xs transition-all"
                            >
                              <Navigation className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                              <span>Open Rider Route</span>
                            </a>

                            {hasGpsPin && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <Navigation className="w-2.5 h-2.5 fill-emerald-700 text-emerald-700" />
                                <span>Doorstep Pin {o.address?.accuracy ? `(±${o.address.accuracy}m)` : ''}</span>
                              </div>
                            )}

                            <div>
                              <a
                                href={`https://wa.me/?text=${whatsappShareText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-[10px] font-bold shadow-2xs transition-all"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>WhatsApp to Rider</span>
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top text-right min-w-[140px]">
                          {!isFullyPaid ? (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(o.id)}
                              disabled={markingOrderId === o.id}
                              className="px-2.5 py-1.5 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-lg text-[10px] font-black shadow-2xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>{markingOrderId === o.id ? 'Verifying...' : `Collect ₹${o.grandTotal}`}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded-full inline-block">
                              ✓ Audit Complete
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      )}

      {/* TAB 4: STAFF & ROLES MANAGEMENT */}
      {activeTab === 'staff' && <StaffManagementTab />}

      {/* TAB 5: CUSTOMER HANDWRITTEN SLIPS */}
      {activeTab === 'slips' && <SlipsManagementTab />}

      {/* TAB 6: PAYMENTS & CASH AUDIT */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2E7D32]" />
                <span>Cash Collection &amp; Payment Audit</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Audit Cash on Delivery collections, verify online UPI transactions, and reconcile register revenue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchOrders(false)}
              disabled={loadingOrders}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Payments</span>
            </button>
          </div>

          {/* Payment KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total Sales</span>
              <span className="text-xl font-black text-stone-900 tabular-nums">₹{totalRevenue}</span>
              <span className="text-[10px] text-emerald-700 block">{orders.length} Total Store Orders</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-100/50 border border-emerald-300 space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Collected &amp; Verified</span>
              <span className="text-xl font-black text-[#1B5E20] tabular-nums">₹{totalPaidRevenue}</span>
              <span className="text-[10px] text-emerald-800 block">UPI + Confirmed Cash In-Hand</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Pending Cash to Collect</span>
              <span className="text-xl font-black text-amber-900 tabular-nums">₹{pendingCodTotal}</span>
              <span className="text-[10px] text-amber-700 font-bold block">{pendingCodCount} COD Orders Awaiting Payment</span>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={paymentsSearch}
                onChange={(e) => setPaymentsSearch(e.target.value)}
                placeholder="Search by customer name, phone, or order ID…"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#2E7D32]"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: `All (${orders.length})` },
                { id: 'pending', label: `Pending Cash (${pendingCodCount})` },
                { id: 'paid', label: `Paid & Verified (${orders.length - pendingCodCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaymentsFilter(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    paymentsFilter === tab.id
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Payment List */}
          {filteredPaymentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
              No payment records match the current filter.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
              {filteredPaymentOrders.map((o) => {
                const isPaid = o.isPaid || o.paymentStatus === 'completed' || o.paymentStatus === 'manual_verified';
                return (
                  <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-stone-900">#{o.id}</span>
                        <span className="text-[10px] text-stone-400">{o.date}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isPaid ? '✓ Paid' : 'Cash on Delivery'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-700 font-bold flex items-center gap-2">
                        <span>{o.address?.fullName || 'Customer'}</span>
                        {(o.address?.mobileNumber || o.address?.phone) && (
                          <a href={`tel:${o.address?.mobileNumber || o.address?.phone}`} className="text-[#2E7D32] text-[11px] font-semibold hover:underline flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{o.address?.mobileNumber || o.address?.phone}</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}{o.address?.streetArea || o.address?.city || 'Nellore'}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-base font-black text-stone-900 tabular-nums">₹{o.grandTotal}</span>
                      {!isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(o.id)}
                          disabled={markingOrderId === o.id}
                          className="px-3.5 py-1.5 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{markingOrderId === o.id ? 'Saving...' : 'Mark as Paid'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {o.markedPaidBy ? `Verified by ${o.markedPaidBy}` : 'Online Verified'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: RIDERS & DISPATCH */}
      {activeTab === 'riders' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2E7D32]" />
                <span>Rider Fleet &amp; Live Express Dispatch</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage order handovers to delivery partners, track active delivery trips, and share route links.
              </p>
            </div>
            <Link
              href="/rider"
              target="_blank"
              className="px-4 py-2 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 transition-all self-start sm:self-center cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Launch Rider App</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </Link>
          </div>

          {/* Fleet Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Ready for Pickup</span>
              <span className="text-xl font-black text-stone-900 tabular-nums">{packedOrders.length}</span>
              <span className="text-[10px] text-stone-500 block">Orders packed at Nellore Hub</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">Out on Road</span>
              <span className="text-xl font-black text-purple-900 tabular-nums">{dispatchedOrders.length}</span>
              <span className="text-[10px] text-purple-700 block">Active Rider Express Trips</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Delivered Today</span>
              <span className="text-xl font-black text-[#1B5E20] tabular-nums">
                {orders.filter((o) => o.status === 'Delivered').length}
              </span>
              <span className="text-[10px] text-emerald-700 block">Completed Express Deliveries</span>
            </div>
          </div>

          {/* Active Dispatch List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              Active Dispatch Queue ({packedOrders.length + dispatchedOrders.length})
            </h3>
            {packedOrders.length + dispatchedOrders.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                All packed orders have been delivered! No active riders on the road currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...packedOrders, ...dispatchedOrders].map((o) => {
                  const isFullyPaid = o.paymentStatus === 'completed' || o.paymentStatus === 'manual_verified';
                  const destQuery = (o.address?.latitude && o.address?.longitude)
                    ? `${o.address.latitude},${o.address.longitude}`
                    : encodeURIComponent(`${o.address?.houseFlat || ''} ${o.address?.streetArea || ''} ${o.address?.city || 'Nellore'} ${o.address?.pincode || ''}`);
                  const riderMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;
                  const riderAppUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}/rider?orderId=${o.id}`
                    : `https://g1mart.vercel.app/rider?orderId=${o.id}`;

                  const whatsappShareText = encodeURIComponent(
                    `*🛵 G1 MART DELIVERY DISPATCH*\n` +
                    `Order ID: #${o.id}\n` +
                    `Status: ${o.status}\n` +
                    `Customer: ${o.address?.fullName || 'Customer'} (${o.address?.mobileNumber || o.address?.phone || ''})\n` +
                    `Address: ${o.address?.houseFlat ? o.address.houseFlat + ', ' : ''}${o.address?.streetArea || ''}, ${o.address?.city || 'Nellore'}\n` +
                    `Landmark: ${o.address?.landmark || 'N/A'}\n` +
                    `Items: ${o.items?.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}\n` +
                    `Collect Amount: ${isFullyPaid ? 'ALREADY PAID (₹0 to collect)' : `₹${o.grandTotal} CASH ON DELIVERY`}\n\n` +
                    `👉 Open in Rider App: ${riderAppUrl}\n` +
                    `📍 Turn-by-Turn GPS: ${riderMapsUrl}`
                  );

                  return (
                    <div key={o.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <div>
                          <span className="font-mono font-black text-sm text-stone-900">#{o.id}</span>
                          <span className="text-[10px] text-stone-400 block">{o.slot || 'Express'}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          o.status === 'Packed'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-purple-100 text-purple-900 border border-purple-200 animate-pulse'
                        }`}>
                          {o.status === 'Packed' ? 'Ready for Rider' : 'Out for Delivery'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-stone-900">
                          <span>{o.address?.fullName || 'Customer'}</span>
                          <span>₹{o.grandTotal} ({isFullyPaid ? 'Paid' : 'COD'})</span>
                        </div>
                        <p className="text-stone-500 text-[11px]">
                          {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}{o.address?.streetArea}, {o.address?.city || 'Nellore'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                        <a
                          href={riderMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>GPS Map</span>
                        </a>
                        <a
                          href={`https://wa.me/?text=${whatsappShareText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Rider</span>
                        </a>
                      </div>

                      {o.status === 'Packed' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(o.id, 'Order Dispatched')}
                          className="w-full py-2 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Handover to Rider (Dispatch)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                          className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Confirm Customer Delivered</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </main>

      {/* EDIT / UPLOAD PRODUCT IMAGE MODAL DIALOG */}
      {editingImageProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Update Product Image</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  #{editingImageProduct.itemNumber} · {editingImageProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingImageProduct(null);
                  setImageUploadPreview(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {imageSaveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{imageSaveSuccess}</span>
              </div>
            )}

            {/* Visual Comparison: Current vs New */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Current Store Image
                </span>
                <div className="w-24 h-24 mx-auto bg-white rounded-xl border border-stone-200 p-1 flex items-center justify-center overflow-hidden">
                  <ProductImage
                    imageUrl={editingImageProduct.image_url || editingImageProduct.image}
                    imageStatus={editingImageProduct.image_status}
                    alt={editingImageProduct.name}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-medium block">
                  Status: <strong>{editingImageProduct.image_status || 'MISSING'}</strong>
                </span>
              </div>

              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider block">
                  New Candidate Preview
                </span>
                <div className="w-24 h-24 mx-auto bg-white rounded-xl border-2 border-[#2E7D32] p-1 flex items-center justify-center overflow-hidden shadow-xs">
                  {imageUploadPreview || candidateImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUploadPreview || candidateImageUrl}
                      alt="New Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                      }}
                    />
                  ) : (
                    <span className="text-[10px] text-stone-400 font-semibold">No Image</span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-700 font-extrabold block">
                  Will mark as ✓ VERIFIED
                </span>
              </div>
            </div>

            {/* Error Message Display if Upload Fails */}
            {imageSaveError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{imageSaveError}</span>
              </div>
            )}

            {/* 1. Upload Local File */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                1. Upload Photo from your Device (Mobile / PC)
              </label>
              <label className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100/80 border-2 border-dashed border-[#2E7D32]/40 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-[#1B5E20] font-bold text-xs">
                <Upload className="w-4 h-4 text-[#2E7D32]" />
                <span>{selectedImageFile ? `Selected: ${selectedImageFile.name}` : 'Choose Image File (PNG, JPG, WEBP)'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 2. Or Paste Image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                2. Or Paste Image URL
              </label>
              <input
                type="text"
                value={candidateImageUrl}
                onChange={(e) => {
                  setCandidateImageUrl(e.target.value);
                  setSelectedImageFile(null);
                }}
                placeholder="https://... or /products/photos/..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
              />
            </div>

            {/* 3. FMCG Verified Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-500">
                3. Or pick from verified grocery catalogue presets:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-stone-50 rounded-xl border border-stone-200/80">
                {PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setCandidateImageUrl(p.url);
                      setImageUploadPreview(null);
                      setSelectedImageFile(null);
                    }}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                      candidateImageUrl === p.url
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setEditingImageProduct(null);
                  setImageUploadPreview(null);
                  setSelectedImageFile(null);
                  setImageSaveError(null);
                }}
                disabled={savingImage}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProductImage}
                disabled={savingImage || (!candidateImageUrl && !selectedImageFile)}
                className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#2E7D32]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {savingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading &amp; Persisting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save &amp; Verify Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Product Details Edit Modal */}
      {editingProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Edit Product #{editingProductModal.itemNumber}</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  POS: <code className="bg-stone-100 px-1 rounded">{editingProductModal.rawName || editingProductModal.name}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProductModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveProductSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-bold text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 stroke-[3]" />
                <span>Product updated and persisted successfully!</span>
              </div>
            )}

            {saveProductError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{saveProductError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProductDetails} className="space-y-3.5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              {/* Brand & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormBrand}
                    onChange={(e) => setEditFormBrand(e.target.value)}
                    placeholder="e.g. Santoor, Mysore Sandal"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Pack Size / Unit
                  </label>
                  <input
                    type="text"
                    value={editFormUnit}
                    onChange={(e) => setEditFormUnit(e.target.value)}
                    placeholder="e.g. 100g, 1kg, 4+1 Pack"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {/* Pricing: MRP & Selling Rate */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50/80 p-3 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    MRP (Printed ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormMRP}
                    onChange={(e) => setEditFormMRP(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Selling Rate (Our Price ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormPrice}
                    onChange={(e) => setEditFormPrice(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-black text-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Department
                  </label>
                  <select
                    value={editFormCategory}
                    onChange={(e) => setEditFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={editFormSubCategory}
                    onChange={(e) => setEditFormSubCategory(e.target.value)}
                    placeholder="e.g. Bath Soaps, Atta"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {/* Stock Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <div className="text-xs font-bold text-stone-800">In Stock Availability</div>
                  <div className="text-[10px] text-stone-500">Enable to show product available for customer order</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFormInStock(!editFormInStock)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    editFormInStock
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {editFormInStock ? '✓ IN STOCK' : '✗ OUT OF STOCK'}
                </button>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Image URL / Path
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editFormImageUrl}
                    onChange={(e) => setEditFormImageUrl(e.target.value)}
                    placeholder="/products/packshots/... or https://..."
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editFormImageUrl || '/products/placeholder.svg'}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProductModal(null)}
                  disabled={isSavingProductDetails}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProductDetails}
                  className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#2E7D32]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingProductDetails ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Save Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
