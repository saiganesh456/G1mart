'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import HomeTab from '@/components/admin/tabs/HomeTab';
import OrdersTab from '@/components/admin/tabs/OrdersTab';
import OrderDetailsPanel from '@/components/admin/tabs/OrderDetailsPanel';
import InventoryTab from '@/components/admin/tabs/InventoryTab';
import ProductDetailsPanel from '@/components/admin/tabs/ProductDetailsPanel';
import MobileBottomNav from '@/components/admin/tabs/MobileBottomNav';

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

export default function MobileAdminDashboardClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [markingOrderId, setMarkingOrderId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('Store Staff (Counter)');
  const [newSlipsCount, setNewSlipsCount] = useState(0);
  const [paymentsFilter, setPaymentsFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previousOrderCount, setPreviousOrderCount] = useState<number>(0);

  useEffect(() => {
    if (orders.length > previousOrderCount && previousOrderCount > 0) {
      if (audioEnabled) {
        try {
          const audio = new Audio('/ting.mp3');
          audio.play().catch(e => console.log('Audio play failed', e));
        } catch(e) {}
      }
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length, audioEnabled]);


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

  // Handle live stock toggle
  const toggleStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Handle inline price update
  const updatePrice = (productId: string, newP: number) => {
    if (isNaN(newP) || newP < 0) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, price: newP, originalPrice: newP } : p
      )
    );
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
    <div className="flex flex-col min-h-screen bg-stone-50">
      
      {/* Optional Alert Enabler */}
      {!audioEnabled && (
        <div className="bg-blue-50 p-2 text-center text-xs font-bold text-blue-800 cursor-pointer" onClick={() => setAudioEnabled(true)}>
          🔔 Tap to enable new order sound alerts
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-20">
        {selectedOrder ? (
          <OrderDetailsPanel 
            order={selectedOrder} 
            onBack={() => setSelectedOrder(null)} 
            onUpdateStatus={(id, status) => {
              handleUpdateOrderStatus(id, status);
              // Update selected order locally for instant UI update
              setSelectedOrder(prev => prev ? {...prev, status} : null);
            }} 
          />
        ) : selectedProduct ? (
          <ProductDetailsPanel 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)} 
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeTab 
                orders={orders} 
                onViewOrder={setSelectedOrder} 
                onNavigateToOrders={(status) => {
                  // In a real app we'd pass the initial filter to OrdersTab
                  // For now, we just switch tabs
                  setActiveTab('orders');
                }} 
              />
            )}
            
            {activeTab === 'orders' && (
              <OrdersTab 
                orders={orders} 
                onViewOrder={setSelectedOrder} 
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab 
                products={products} 
                categories={categories} 
                onViewProduct={setSelectedProduct} 
              />
            )}

            {/* Default views for legacy tabs not yet migrated to mobile-first */}
            {(activeTab === 'slips' || activeTab === 'payments' || activeTab === 'riders' || activeTab === 'more' || activeTab === 'add_product' || activeTab === 'staff') && (
              <div className="p-8 text-center text-stone-500 font-bold">
                <h2>{activeTab.toUpperCase()} (Coming Soon)</h2>
                <p className="text-sm font-normal mt-2">This section is being redesigned for mobile.</p>
              </div>
            )}
          </>
        )}
      </main>

      <MobileBottomNav 
        activeTab={activeTab === 'orders' && selectedOrder ? 'orders' : activeTab === 'inventory' && selectedProduct ? 'inventory' : activeTab} 
        onChangeTab={(t) => {
          setActiveTab(t as any);
          setSelectedOrder(null);
          setSelectedProduct(null);
        }}
        orderBadge={activeOrdersCount > 0 ? activeOrdersCount : undefined} 
      />
    </div>
  );
}
