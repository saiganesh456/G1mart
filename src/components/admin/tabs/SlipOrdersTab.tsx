'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  User,
  ShoppingBag,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Maximize2,
  MapPin,
  Truck,
  Package,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ListPlus,
  Info,
} from 'lucide-react';
import type { SlipOrder, SlipItem, SlipOrderStatus } from '@/types/slipOrder';
import type { Product } from '@/types';
import { formatIndianPhoneDisplay } from '@/lib/phone';

interface Props {
  products?: Product[];
  initialActiveSubTab?: 'slips' | 'packer';
}

export default function SlipOrdersTab({ products = [], initialActiveSubTab = 'slips' }: Props) {
  const [subTab, setSubTab] = useState<'slips' | 'packer'>(initialActiveSubTab);
  const [orders, setOrders] = useState<SlipOrder[]>([]);
  const ordersRef = useRef<SlipOrder[]>(orders);
  ordersRef.current = orders;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlip, setSelectedSlip] = useState<SlipOrder | null>(null);

  // Bill Builder state
  const [billedItems, setBilledItems] = useState<
    Array<{
      id?: string;
      productId?: string | null;
      name: string;
      requestedQty: number;
      unit: string;
      price: number;
      available: boolean;
      substituteNote?: string;
    }>
  >([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Catalog item search state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // Manual item addition state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualUnit, setManualUnit] = useState('1 unit');
  const [manualPrice, setManualPrice] = useState(50);

  // Bulk add grocery list state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Inline quick add state
  const [inlineName, setInlineName] = useState('');
  const [inlineQty, setInlineQty] = useState(1);
  const [inlineUnit, setInlineUnit] = useState('1 unit');
  const [inlinePrice, setInlinePrice] = useState(50);

  // Mobile photo collapse & Floating preview modal state
  const [isPhotoCollapsed, setIsPhotoCollapsed] = useState(false);
  const [showFloatingPreviewModal, setShowFloatingPreviewModal] = useState(false);

  // Zoomable Slip Viewer state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomRotation, setZoomRotation] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Packer Checklist state
  const [packerChecked, setPackerChecked] = useState<Record<string, boolean>>({});
  const [packerPackedQty, setPackerPackedQty] = useState<Record<string, number>>({});
  const [packerAvailable, setPackerAvailable] = useState<Record<string, boolean>>({});
  const [packerSubstituteNotes, setPackerSubstituteNotes] = useState<Record<string, string>>({});
  const [packerSaving, setPackerSaving] = useState(false);

  // Fetch slip orders
  const fetchSlipOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/slip-orders');
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
        // Refresh selected slip metadata if currently open, without wiping draft bill items
        if (selectedSlip) {
          const updated = data.orders.find((o: SlipOrder) => o.id === selectedSlip.id);
          if (updated) {
            setSelectedSlip((prev) => (prev ? { ...prev, ...updated, items: prev.items } : updated));
          }
        } else if (typeof window !== 'undefined') {
          // Check for deep-linked slip from notification click or URL
          const urlParams = new URLSearchParams(window.location.search);
          const initialSlipId = urlParams.get('slipId') || urlParams.get('slip_id');
          if (initialSlipId) {
            const match = data.orders.find(
              (o: SlipOrder) => String(o.id).toLowerCase() === String(initialSlipId).toLowerCase()
            );
            if (match) setSelectedSlip(match);
          }
        }
      }
    } catch (err) {
      console.error('[SlipOrdersTab] Fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlipOrders(false);
    const interval = setInterval(() => {
      fetchSlipOrders(true);
    }, 2000);

    const onPopState = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const slipId = params.get('slipId') || params.get('slip_id');
      if (!slipId) {
        setSelectedSlip(null);
      } else {
        const match = ordersRef.current.find(
          (o) => String(o.id).toLowerCase() === String(slipId).toLowerCase()
        );
        if (match) setSelectedSlip(match);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onPopState);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', onPopState);
      }
    };
  }, []);

  // When selected slip changes (by ID), initialize bill builder and image viewer
  useEffect(() => {
    if (selectedSlip) {
      setActiveImageIndex(0);
      setZoomScale(1);
      setZoomRotation(0);
      setPanOffset({ x: 0, y: 0 });
      setAdminNotes(selectedSlip.admin_notes || '');

      const currentItems = (selectedSlip.items || []).map((it) => ({
        id: it.id,
        productId: it.product_id,
        name: it.name,
        requestedQty: it.requested_qty || 1,
        unit: it.unit || 'unit',
        price: it.price || 0,
        available: it.available !== false,
        substituteNote: it.substitute_note || '',
      }));
      setBilledItems(currentItems);

      // Initialize packer checklist
      const initialChecked: Record<string, boolean> = {};
      const initialPackedQty: Record<string, number> = {};
      const initialAvailable: Record<string, boolean> = {};
      const initialNotes: Record<string, string> = {};
      currentItems.forEach((it) => {
        const key = it.id || it.name;
        initialChecked[key] = it.available;
        initialPackedQty[key] = it.requestedQty;
        initialAvailable[key] = it.available;
        initialNotes[key] = it.substituteNote || '';
      });
      setPackerChecked(initialChecked);
      setPackerPackedQty(initialPackedQty);
      setPackerAvailable(initialAvailable);
      setPackerSubstituteNotes(initialNotes);
    }
  }, [selectedSlip?.id]);

  // Live estimated total
  const estimatedTotal = useMemo(() => {
    return billedItems.reduce((sum, item) => {
      if (item.available) {
        return sum + (Number(item.price) || 0) * (Number(item.requestedQty) || 0);
      }
      return sum;
    }, 0);
  }, [billedItems]);

  // Zone minimum shortfall check
  const zoneMinOrder = selectedSlip?.zone_min_order || 500;
  const isPickupOrder = selectedSlip?.order_type === 'pickup';
  const hasShortfall = !isPickupOrder && estimatedTotal < zoneMinOrder;
  const shortfallAmount = Math.max(0, zoneMinOrder - estimatedTotal);

  // Filter catalog products for auto-suggest
  const matchingCatalogProducts = useMemo(() => {
    if (!catalogSearch.trim()) return [];
    const query = catalogSearch.toLowerCase().trim();
    return products
      .filter((p) => p.name.toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query))
      .slice(0, 8);
  }, [catalogSearch, products]);

  // Add catalog product to bill
  const handleAddCatalogItem = (product: Product) => {
    const newItem = {
      productId: product.id,
      name: product.name,
      requestedQty: 1,
      unit: product.unit || '1 unit',
      price: product.price || 0,
      available: true,
      substituteNote: '',
    };
    setBilledItems((prev) => [...prev, newItem]);
    setCatalogSearch('');
    setShowCatalogDropdown(false);
  };

  // Add custom item directly from search input or inline form
  const handleQuickAddCustom = (name: string, qty = 1, unit = '1 unit', price = 0) => {
    if (!name.trim()) return;
    setBilledItems((prev) => [
      ...prev,
      {
        productId: null,
        name: name.trim(),
        requestedQty: qty,
        unit,
        price,
        available: true,
        substituteNote: '',
      },
    ]);
    setCatalogSearch('');
    setShowCatalogDropdown(false);
  };

  // Inline Quick Add row
  const handleInlineAdd = () => {
    if (!inlineName.trim()) return;
    setBilledItems((prev) => [
      ...prev,
      {
        productId: null,
        name: inlineName.trim(),
        requestedQty: Number(inlineQty) || 1,
        unit: inlineUnit.trim() || '1 unit',
        price: Number(inlinePrice) || 0,
        available: true,
        substituteNote: '',
      },
    ]);
    setInlineName('');
    setInlineQty(1);
    setInlineUnit('1 unit');
    setInlinePrice(50);
  };

  // Bulk add list items (paste handwritten lines or WhatsApp list)
  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const newItems: typeof billedItems = [];

    lines.forEach((line) => {
      let name = line;
      let price = 0;
      let qty = 1;
      let unit = '1 unit';

      // Price e.g. " - 45" or " ₹50"
      const priceMatch = name.match(/[-–—₹]\s*(\d+(\.\d+)?)\s*$/);
      if (priceMatch) {
        price = Number(priceMatch[1]) || 0;
        name = name.replace(/[-–—₹]\s*(\d+(\.\d+)?)\s*$/, '').trim();
      }

      // Quantity prefix e.g. "2x " or "3 "
      const qtyMatch = name.match(/^(\d+)\s*[xX*]\s*/);
      if (qtyMatch) {
        qty = Number(qtyMatch[1]) || 1;
        name = name.replace(/^(\d+)\s*[xX*]\s*/, '').trim();
      }

      // Unit detection
      const unitMatch = name.match(/\b(\d+(\.\d+)?\s*(kg|g|gm|gms|ml|l|ltr|litre|packet|pkt|pc|pcs|box|bottle))\b/i);
      if (unitMatch) {
        unit = unitMatch[0];
      }

      newItems.push({
        productId: null,
        name: name || line,
        requestedQty: qty,
        unit,
        price,
        available: true,
        substituteNote: '',
      });
    });

    if (newItems.length > 0) {
      setBilledItems((prev) => [...prev, ...newItems]);
      setBulkText('');
      setShowBulkModal(false);
      setActionSuccess(`Added ${newItems.length} items from bulk list!`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Add custom manual item
  const handleAddManualItem = () => {
    if (!manualName.trim()) return;
    setBilledItems((prev) => [
      ...prev,
      {
        productId: null,
        name: manualName.trim(),
        requestedQty: Number(manualQty) || 1,
        unit: manualUnit.trim() || 'unit',
        price: Number(manualPrice) || 0,
        available: true,
        substituteNote: '',
      },
    ]);
    setManualName('');
    setManualQty(1);
    setManualUnit('1 unit');
    setManualPrice(50);
    setShowManualModal(false);
  };

  // Remove item from bill
  const handleRemoveItem = (index: number) => {
    setBilledItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update item field
  const handleUpdateItemField = (index: number, field: string, value: any) => {
    setBilledItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // Save bill items (Action: Save Bill)
  const handleSaveBill = async (moveStatus?: 'BILLING' | 'AWAITING_CUSTOMER_CONFIRMATION') => {
    if (!selectedSlip) return;
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: billedItems,
          adminNotes,
          billedBy: 'Store Staff',
          moveStatus: moveStatus || 'BILLING',
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedSlip(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setActionSuccess('Bill saved successfully with ' + billedItems.length + ' items.');
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.error || 'Failed to save bill');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error saving bill');
    } finally {
      setIsSaving(false);
    }
  };

  // Mark confirmed by call (Action: Mark Confirmed by Call)
  const handleMarkConfirmedByCall = async () => {
    if (!selectedSlip) return;
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      // First save items if modified
      await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: billedItems,
          adminNotes,
          billedBy: 'Store Staff',
          moveStatus: 'AWAITING_CUSTOMER_CONFIRMATION',
        }),
      });

      // Then mark confirmed
      const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}/confirm-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffName: 'Store Staff',
          notes: 'Customer confirmed all items & bill via call',
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedSlip(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setActionSuccess('Order confirmed by call! Moved to Packer queue.');
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(data.error || 'Failed to confirm order');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error confirming order');
    } finally {
      setIsSaving(false);
    }
  };

  // Packer "Mark Packed"
  const handleMarkPacked = async (slipOrder: SlipOrder) => {
    setPackerSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const packedItemsPayload = (slipOrder.items || []).map((it) => {
        const key = it.id || it.name;
        return {
          id: it.id,
          packedQty: Number(packerPackedQty[key] ?? it.requested_qty ?? 1),
          available: packerAvailable[key] !== false && packerChecked[key] !== false,
          substituteNote: packerSubstituteNotes[key] || it.substitute_note || null,
        };
      });

      const res = await fetch(`/api/admin/slip-orders/${slipOrder.id}/pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: packedItemsPayload,
          staffName: 'Store Packer',
          action: 'mark_packed',
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        if (selectedSlip?.id === slipOrder.id) {
          setSelectedSlip(data.order);
        }
        setActionSuccess(`Order #${slipOrder.id} marked PACKED! Customer notified to review bill & pay.`);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(data.error || 'Failed to update packing status');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error submitting packing checklist');
    } finally {
      setPackerSaving(false);
    }
  };

  // Viewer image zoom handlers
  const handleZoomIn = () => setZoomScale((s) => Math.min(s + 0.35, 4));
  const handleZoomOut = () => setZoomScale((s) => Math.max(s - 0.35, 0.7));
  const handleRotate = () => setZoomRotation((r) => (r + 90) % 360);
  const handleResetZoom = () => {
    setZoomScale(1);
    setZoomRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Counts for badges
  const newSlipsCount = orders.filter((o) => o.status === 'SLIP_RECEIVED').length;
  const confirmedForPacker = orders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'PACKING'
  ).length;

  // Filtered orders list for slips view
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_phone.includes(searchQuery) ||
        (o.address || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === 'all') return matchSearch;
      if (statusFilter === 'new') return matchSearch && o.status === 'SLIP_RECEIVED';
      if (statusFilter === 'confirmed') return matchSearch && o.status === 'CONFIRMED';
      if (statusFilter === 'packing') return matchSearch && o.status === 'PACKING';
      if (statusFilter === 'packed') return matchSearch && (o.status === 'PACKED' || o.status === 'AWAITING_PAYMENT');
      if (statusFilter === 'paid') return matchSearch && (o.status === 'PAID' || o.status === 'COD_PENDING');
      return matchSearch && o.status === statusFilter;
    });
  }, [orders, searchQuery, statusFilter]);

  // Orders for packer view (only CONFIRMED or PACKING)
  const packerOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PACKING');
  }, [orders]);

  const getStatusBadge = (status: SlipOrderStatus | string) => {
    switch (status) {
      case 'SLIP_RECEIVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>NEW SLIP</span>
          </span>
        );
      case 'BILLING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Billing in Progress</span>
          </span>
        );
      case 'AWAITING_CUSTOMER_CONFIRMATION':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-purple-600" />
            <span>Awaiting Call Confirm</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Confirmed (Ready to Pack)</span>
          </span>
        );
      case 'PACKING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-amber-600" />
            <span>Packing in Progress</span>
          </span>
        );
      case 'PACKED':
      case 'AWAITING_PAYMENT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1.5">
            <Package className="w-3 h-3 text-teal-600" />
            <span>Packed (Awaiting Pay)</span>
          </span>
        );
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-2xs">
            <Check className="w-3 h-3" />
            <span>Paid Online (Ready for Rider)</span>
          </span>
        );
      case 'COD_PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-orange-100 text-orange-900 border border-orange-300 flex items-center gap-1.5">
            <span>COD Pending (Ready for Rider)</span>
          </span>
        );
      case 'RIDER_ASSIGNED':
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-indigo-600" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            ✓ Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200/90 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2E7D32]" />
            <span>Slip Orders &amp; Smart Bill Builder</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Review customer list photos, build verified bills, enforce zone minimums, and manage packing
          </p>
        </div>

        {/* Subtab Pills */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setSubTab('slips');
              if (selectedSlip) {
                setSelectedSlip(null);
                try {
                  window.history.pushState({ tab: 'slips', adminBack: true }, '', '/admin?tab=slips');
                } catch {}
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              subTab === 'slips'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Slips &amp; Billing</span>
            {newSlipsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-stone-900 font-black animate-pulse">
                {newSlipsCount} NEW
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('packer');
              if (selectedSlip) {
                setSelectedSlip(null);
                try {
                  window.history.pushState({ tab: 'packer', adminBack: true }, '', '/admin?tab=packer');
                } catch {}
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              subTab === 'packer'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Packer Checklist</span>
            {confirmedForPacker > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-black">
                {confirmedForPacker}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Action alerts */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* VIEW 1: ALL SLIPS & BILLING BUILDER */}
      {subTab === 'slips' && (
        <>
          {!selectedSlip ? (
            /* Slips List */
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Slip ID, customer name, mobile or area..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'new', label: 'New Slips', count: newSlipsCount },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'packing', label: 'Packing' },
                    { id: 'packed', label: 'Packed' },
                    { id: 'paid', label: 'Paid/COD' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === filter.id
                          ? 'bg-[#1B5E20] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {filter.label}
                      {filter.count !== undefined && filter.count > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-stone-900 font-black">
                          {filter.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slips Cards Grid */}
              {loading && orders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80">
                  <div className="w-8 h-8 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-bold">Loading slip orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80">
                  <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <h3 className="text-sm font-black text-stone-800">No slip orders found</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {searchQuery ? 'Try matching a different keyword' : 'Customer grocery lists will appear here live'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredOrders.map((slip) => {
                    const isNew = slip.status === 'SLIP_RECEIVED';
                    return (
                      <div
                        key={slip.id}
                        className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col justify-between space-y-3.5 transition-all hover:shadow-xs ${
                          isNew ? 'border-amber-300 ring-2 ring-amber-100' : 'border-stone-200/80'
                        }`}
                      >
                        {/* Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-black text-stone-900 tracking-tight">
                              #{slip.id}
                            </span>
                            {getStatusBadge(slip.status)}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-stone-900 flex items-center justify-between">
                              <span>{slip.customer_name}</span>
                              <a
                                href={`tel:${slip.customer_phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-black text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{formatIndianPhoneDisplay(slip.customer_phone)}</span>
                              </a>
                            </h4>
                            <p className="text-xs text-stone-600 line-clamp-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="truncate">{slip.address}</span>
                            </p>
                          </div>
                        </div>

                        {/* Order Metadata Pills */}
                        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-[11px]">
                          <div>
                            <span className="text-stone-400 font-bold block text-[10px]">DISTANCE</span>
                            <span className="font-black text-stone-800">{slip.distance_km || 0} km</span>
                          </div>
                          <div>
                            <span className="text-stone-400 font-bold block text-[10px]">ZONE MIN</span>
                            <span className="font-black text-stone-800">₹{slip.zone_min_order || 500}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 font-bold block text-[10px]">EST. TOTAL</span>
                            <span className="font-black text-[#2E7D32]">
                              ₹{slip.final_total || slip.estimated_total || 0}
                            </span>
                          </div>
                        </div>

                        {/* Images preview thumbnails */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {(slip.images || []).slice(0, 3).map((img, idx) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={idx}
                                src={img.image_url}
                                alt="slip thumbnail"
                                className="w-10 h-10 object-cover rounded-lg border border-stone-200 bg-stone-100"
                              />
                            ))}
                            {(slip.images || []).length > 3 && (
                              <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-black text-stone-600">
                                +{(slip.images || []).length - 3}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlip(slip);
                              try {
                                window.history.pushState(
                                  { view: 'slip', slipId: slip.id, tab: 'slips', adminBack: true },
                                  '',
                                  `/admin?tab=slips&slipId=${encodeURIComponent(slip.id)}`
                                );
                              } catch {}
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-black rounded-xl transition-all shadow-2xs"
                          >
                            <span>Open Bill Builder</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* DETAIL SCREEN: ZOOMABLE SLIP VIEWER + BILL BUILDER */
            <div className="space-y-4">
              {/* Back to list button */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlip(null);
                    if (typeof window !== 'undefined') {
                      if (window.history.state?.adminBack) {
                        window.history.back();
                      } else {
                        window.history.pushState({ tab: 'slips' }, '', '/admin?tab=slips');
                      }
                    }
                  }}
                  className="inline-flex items-center gap-2 text-xs font-black text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Slips List</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-stone-900">Slip #{selectedSlip.id}</span>
                  {getStatusBadge(selectedSlip.status)}
                </div>
              </div>

              {/* Two Column Layout: Left Viewer | Right Bill Builder */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 1. LEFT COLUMN: ZOOMABLE SLIP VIEWER (5 cols on lg) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-4 space-y-3 lg:sticky lg:top-20">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#2E7D32]" />
                      <span>Slip Photo Viewer ({selectedSlip.images?.length || 0})</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Collapse / Expand toggle button for mobile and desktop */}
                      <button
                        type="button"
                        onClick={() => setIsPhotoCollapsed(!isPhotoCollapsed)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-lg transition-colors"
                        title={isPhotoCollapsed ? 'Expand photo' : 'Minimize photo'}
                      >
                        {isPhotoCollapsed ? (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Expand</span>
                          </>
                        ) : (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Minimize</span>
                          </>
                        )}
                      </button>

                      {/* Viewer Controls (visible when expanded) */}
                      {!isPhotoCollapsed && (
                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={handleZoomIn}
                            title="Zoom In"
                            className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                            className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleRotate}
                            title="Rotate 90°"
                            className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleResetZoom}
                            title="Reset Zoom"
                            className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isPhotoCollapsed ? (
                    <div
                      onClick={() => setIsPhotoCollapsed(false)}
                      className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-dashed border-stone-300 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {selectedSlip.images?.[activeImageIndex]?.image_url && (
                          <img
                            src={selectedSlip.images[activeImageIndex].image_url}
                            alt="Slip thumbnail"
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-stone-800">Slip Photo Minimized</p>
                          <p className="text-[10px] text-stone-500">Tap to expand and zoom handwritten slip</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#2E7D32] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Tap to View
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Multiple image tabs/strip */}
                      {selectedSlip.images && selectedSlip.images.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {selectedSlip.images.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setActiveImageIndex(idx);
                                handleResetZoom();
                              }}
                              className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                                activeImageIndex === idx
                                  ? 'border-[#2E7D32] ring-2 ring-emerald-100'
                                  : 'border-stone-200 opacity-60 hover:opacity-100'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.image_url}
                                alt={`Slip page ${idx + 1}`}
                                className="w-14 h-14 object-cover"
                              />
                              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1 font-bold rounded-tl">
                                {idx + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Interactive Zoomable Viewport */}
                      <div
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="relative w-full h-[260px] sm:h-[340px] lg:h-[420px] bg-stone-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center border border-stone-300 select-none touch-none"
                      >
                        {selectedSlip.images && selectedSlip.images[activeImageIndex] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedSlip.images[activeImageIndex].image_url}
                            alt="Customer slip"
                            className="max-h-full max-w-full object-contain transition-transform duration-75 ease-out"
                            style={{
                              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) rotate(${zoomRotation}deg)`,
                            }}
                            draggable={false}
                          />
                        ) : (
                          <div className="text-center text-stone-400 text-xs">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <span>No image available</span>
                          </div>
                        )}

                        {/* Zoom indicator overlay */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-mono">
                          {Math.round(zoomScale * 100)}% {zoomRotation > 0 ? `· ${zoomRotation}°` : ''}
                        </div>

                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-medium">
                          Drag to Pan • Click +/- to Zoom
                        </div>
                      </div>
                    </>
                  )}

                  {/* Customer Note */}
                  {selectedSlip.customer_note && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <span className="font-black block text-[10px] uppercase text-amber-800">
                        CUSTOMER SPECIAL NOTE:
                      </span>
                      <p className="mt-0.5 italic">&quot;{selectedSlip.customer_note}&quot;</p>
                    </div>
                  )}
                </div>

                {/* 2. RIGHT COLUMN: SMART BILL BUILDER (7 cols on lg) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-5 space-y-4">
                  {/* Customer Info Card & Telephone Link */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                          Customer
                        </span>
                        <h3 className="text-sm font-black text-stone-900">{selectedSlip.customer_name}</h3>
                      </div>
                      <a
                        href={`tel:${selectedSlip.customer_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-xl text-xs shadow-2xs transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer ({formatIndianPhoneDisplay(selectedSlip.customer_phone)})</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-stone-400 font-bold block text-[10px]">ADDRESS</span>
                        <span className="font-semibold text-stone-800 truncate block">
                          {selectedSlip.address}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 font-bold block text-[10px]">ROAD DISTANCE</span>
                        <span className="font-black text-stone-800">{selectedSlip.distance_km || 0} km</span>
                      </div>
                      <div>
                        <span className="text-stone-400 font-bold block text-[10px]">EST. ETA</span>
                        <span className="font-black text-stone-800">{selectedSlip.eta_min || 25} min</span>
                      </div>
                      <div>
                        <span className="text-stone-400 font-bold block text-[10px]">ZONE MINIMUM</span>
                        <span className="font-black text-[#2E7D32]">₹{selectedSlip.zone_min_order || 500}</span>
                      </div>
                    </div>
                  </div>

                  {/* Catalog Item Search & Add Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-stone-800">
                        Add Items from Supermarket Catalog
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBulkModal(true)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-xl transition-colors"
                        >
                          <ListPlus className="w-3.5 h-3.5 text-[#2E7D32]" />
                          <span>📋 Bulk Add List</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (catalogSearch.trim()) {
                              setManualName(catalogSearch.trim());
                            }
                            setShowManualModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Custom Item</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={catalogSearch}
                        onFocus={() => setShowCatalogDropdown(true)}
                        onChange={(e) => {
                          setCatalogSearch(e.target.value);
                          setShowCatalogDropdown(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (matchingCatalogProducts.length > 0) {
                              handleAddCatalogItem(matchingCatalogProducts[0]);
                              searchInputRef.current?.focus();
                            } else if (catalogSearch.trim()) {
                              handleQuickAddCustom(catalogSearch.trim());
                              searchInputRef.current?.focus();
                            }
                          }
                        }}
                        placeholder="Type grocery name & press Enter (e.g., Aashirvaad Atta, Fortune Oil, Amul Milk)..."
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      />

                      {/* Dropdown Auto-suggest */}
                      {showCatalogDropdown && catalogSearch.trim() && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl border border-stone-200 shadow-xl divide-y divide-stone-100 max-h-64 overflow-y-auto">
                          {matchingCatalogProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handleAddCatalogItem(p);
                                searchInputRef.current?.focus();
                              }}
                              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={p.image || '/products/placeholder.svg'}
                                  alt={p.name}
                                  className="w-8 h-8 object-contain rounded-md border border-stone-200"
                                />
                                <div>
                                  <p className="text-xs font-bold text-stone-900 line-clamp-1">{p.name}</p>
                                  <p className="text-[10px] text-stone-500">
                                    {p.unit || '1 unit'} · {p.category}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-[#2E7D32]">₹{p.price}</span>
                            </button>
                          ))}

                          {/* Quick add custom item option directly in dropdown */}
                          <button
                            type="button"
                            onClick={() => {
                              handleQuickAddCustom(catalogSearch.trim());
                              searchInputRef.current?.focus();
                            }}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2 text-left bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] font-black text-xs transition-colors"
                          >
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>
                              {matchingCatalogProducts.length === 0 ? 'No exact catalog match · ' : ''}
                              Add &quot;{catalogSearch.trim()}&quot; as Custom Line Item
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Billed Items List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-black text-stone-800">
                      <span>Billed Line Items ({billedItems.length})</span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Tick checkbox or toggle availability if out of stock
                      </span>
                    </div>

                    {/* Inline Quick Add Row */}
                    <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Quick item name (e.g. Sugar 1kg)..."
                        value={inlineName}
                        onChange={(e) => setInlineName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInlineAdd();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                      />
                      <div className="flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          min={1}
                          value={inlineQty}
                          onChange={(e) => setInlineQty(Math.max(1, Number(e.target.value)))}
                          title="Quantity"
                          placeholder="Qty"
                          className="w-12 px-2 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-center focus:outline-none"
                        />
                        <input
                          type="text"
                          value={inlineUnit}
                          onChange={(e) => setInlineUnit(e.target.value)}
                          title="Unit"
                          placeholder="unit"
                          className="w-16 px-2 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-600 focus:outline-none"
                        />
                        <div className="flex items-center gap-0.5 bg-white border border-stone-200 rounded-xl px-2 py-1.5">
                          <span className="text-xs text-stone-400 font-bold">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={inlinePrice}
                            onChange={(e) => setInlinePrice(Math.max(0, Number(e.target.value)))}
                            title="Price"
                            placeholder="Price"
                            className="w-14 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleInlineAdd}
                          disabled={!inlineName.trim()}
                          className="px-3.5 py-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-xl text-xs flex items-center gap-1 transition-colors disabled:opacity-50 shrink-0 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {billedItems.length === 0 ? (
                      <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
                        <p className="text-xs text-stone-500 font-bold">No items added to bill yet</p>
                        <p className="text-[11px] text-stone-400">
                          Search catalog above or click &quot;+ Custom Item&quot; to transcribe customer list
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {billedItems.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border transition-all ${
                              item.available
                                ? 'bg-white border-stone-200'
                                : 'bg-stone-50 border-stone-200/60 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Left: availability check + item name */}
                              <div className="flex items-start gap-2 flex-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateItemField(idx, 'available', !item.available)
                                  }
                                  className="mt-0.5 text-stone-400 hover:text-stone-700"
                                >
                                  {item.available ? (
                                    <CheckSquare className="w-4 h-4 text-[#2E7D32]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-400" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) =>
                                      handleUpdateItemField(idx, 'name', e.target.value)
                                    }
                                    className={`text-xs font-bold text-stone-900 bg-transparent w-full focus:outline-none border-b border-transparent focus:border-[#2E7D32] ${
                                      !item.available ? 'line-through text-stone-400' : ''
                                    }`}
                                  />
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-stone-400 font-medium">Qty:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.requestedQty}
                                      onChange={(e) =>
                                        handleUpdateItemField(
                                          idx,
                                          'requestedQty',
                                          Math.max(1, Number(e.target.value))
                                        )
                                      }
                                      className="w-12 px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-xs font-bold text-center"
                                    />
                                    <input
                                      type="text"
                                      value={item.unit}
                                      onChange={(e) =>
                                        handleUpdateItemField(idx, 'unit', e.target.value)
                                      }
                                      placeholder="unit"
                                      className="w-16 px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-[11px] text-stone-600"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Right: Line Price & Total */}
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-stone-400 font-bold">₹</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={item.price}
                                      onChange={(e) =>
                                        handleUpdateItemField(
                                          idx,
                                          'price',
                                          Math.max(0, Number(e.target.value))
                                        )
                                      }
                                      className="w-16 px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-xs font-bold text-right"
                                    />
                                  </div>
                                  <span className="text-[11px] font-black text-stone-900 block mt-0.5">
                                    = ₹{item.available ? item.price * item.requestedQty : 0}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Substitute Note / Unavailable toggle */}
                            {!item.available && (
                              <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center gap-2 text-xs">
                                <span className="text-rose-600 font-bold text-[10px] shrink-0">
                                  OUT OF STOCK:
                                </span>
                                <input
                                  type="text"
                                  value={item.substituteNote || ''}
                                  onChange={(e) =>
                                    handleUpdateItemField(idx, 'substituteNote', e.target.value)
                                  }
                                  placeholder="Substitute note (e.g. Offered alternate brand/size to customer)..."
                                  className="w-full px-2 py-0.5 bg-rose-50/50 border border-rose-200 rounded text-[11px] text-rose-900 focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Staff Notes */}
                  <div>
                    <label className="text-xs font-black text-stone-700 block mb-1">
                      Staff / Store Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      placeholder="Notes from customer call or special packing instructions..."
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>

                  {/* LIVE ESTIMATED TOTAL & ZONE MINIMUM VERIFICATION BANNER */}
                  <div className="p-4 rounded-2xl border space-y-2 bg-stone-50 border-stone-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-600">Items Subtotal (Available):</span>
                      <span className="font-black text-sm text-stone-900">₹{estimatedTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-600">Delivery Fee:</span>
                      <span className="font-black text-emerald-700">FREE (₹0)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-stone-200 pt-1.5">
                      <span className="font-black text-stone-800">Zone Minimum Required:</span>
                      <span className="font-black text-stone-800">₹{zoneMinOrder}</span>
                    </div>

                    {/* Shortfall Alert vs Success Pill */}
                    {hasShortfall ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span>
                            ⚠️ Shortfall of ₹{shortfallAmount} for delivery zone ({selectedSlip.distance_km} km)!
                          </span>
                          <p className="text-[11px] text-amber-800 font-normal mt-0.5">
                            Customer must meet ₹{zoneMinOrder} zone minimum. Call the customer to suggest adding items.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>✓ Meets or exceeds zone minimum of ₹{zoneMinOrder}!</span>
                      </div>
                    )}
                  </div>

                  {/* ACTION FOOTER BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveBill('BILLING')}
                      className="w-full sm:flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black rounded-2xl text-xs transition-colors border border-stone-300"
                    >
                      {isSaving ? 'Saving...' : 'Save Draft Bill'}
                    </button>

                    <button
                      type="button"
                      disabled={isSaving || billedItems.length === 0}
                      onClick={handleMarkConfirmedByCall}
                      className="w-full sm:flex-1 py-3 px-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-2xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Mark Confirmed by Call</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Floating Action Button: Quick Slip Photo Preview */}
              {selectedSlip.images && selectedSlip.images.length > 0 && (
                <div className="lg:hidden fixed bottom-20 right-4 z-40">
                  <button
                    type="button"
                    onClick={() => setShowFloatingPreviewModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-xs rounded-full shadow-xl border border-emerald-400 active:scale-95 transition-all"
                  >
                    <FileText className="w-4 h-4 text-emerald-300" />
                    <span>View Slip ({selectedSlip.images.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: PACKER CHECKLIST QUEUE */}
      {subTab === 'packer' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2E7D32]" />
                <span>Packer Fulfillment Queue</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Only customer-confirmed orders appear here. Tick items, enter actual weighed quantities, and mark packed.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              {packerOrders.length} Order(s) Ready
            </span>
          </div>

          {packerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-black text-stone-800">All caught up!</h3>
              <p className="text-xs text-stone-500 mt-1">
                No confirmed orders currently waiting for packing. Confirmed slips will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {packerOrders.map((slip) => {
                const totalItems = slip.items?.length || 0;
                return (
                  <div
                    key={slip.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-5 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-900">Slip #{slip.id}</span>
                          {getStatusBadge(slip.status)}
                          <span className="text-xs font-bold text-stone-500">
                            • {slip.order_type === 'pickup' ? 'Store Pickup' : 'Express Delivery'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          <span className="font-bold text-stone-800">{slip.customer_name}</span> ({slip.customer_phone}) · {slip.address}
                        </p>
                      </div>

                      <a
                        href={`tel:${slip.customer_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition-colors self-start sm:self-auto"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>Call Customer</span>
                      </a>
                    </div>

                    {/* Interactive Checklist Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                        Packer Checklist ({totalItems} items)
                      </span>

                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                        {(slip.items || []).map((it) => {
                          const key = it.id || it.name;
                          const isTicked = packerChecked[key] !== false;
                          const isAvail = packerAvailable[key] !== false;
                          const packedQty = packerPackedQty[key] ?? it.requested_qty ?? 1;
                          const note = packerSubstituteNotes[key] || it.substitute_note || '';

                          return (
                            <div
                              key={it.id}
                              className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                                !isAvail ? 'bg-rose-50/40 text-stone-400' : isTicked ? 'bg-emerald-50/30' : 'bg-white'
                              }`}
                            >
                              {/* Left: Tickbox + Name + Requested */}
                              <div className="flex items-start gap-2.5 flex-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPackerChecked((prev) => ({
                                      ...prev,
                                      [key]: !isTicked,
                                    }))
                                  }
                                  className="mt-0.5"
                                >
                                  {isTicked && isAvail ? (
                                    <CheckSquare className="w-4 h-4 text-[#2E7D32]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-400" />
                                  )}
                                </button>

                                <div>
                                  <span
                                    className={`font-black ${
                                      !isAvail ? 'line-through text-stone-400' : 'text-stone-900'
                                    }`}
                                  >
                                    {it.name}
                                  </span>
                                  <p className="text-[11px] text-stone-500">
                                    Requested: <strong className="text-stone-800">{it.requested_qty}</strong> · {it.unit} @ ₹{it.price}/unit
                                  </p>
                                </div>
                              </div>

                              {/* Right: Packed Qty input + Out of Stock toggle */}
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-stone-500">Actual Packed:</span>
                                  <input
                                    type="number"
                                    min={0}
                                    step="any"
                                    disabled={!isAvail}
                                    value={packedQty}
                                    onChange={(e) =>
                                      setPackerPackedQty((prev) => ({
                                        ...prev,
                                        [key]: Math.max(0, Number(e.target.value)),
                                      }))
                                    }
                                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-black text-center disabled:opacity-40"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPackerAvailable((prev) => ({ ...prev, [key]: !isAvail }));
                                    setPackerChecked((prev) => ({ ...prev, [key]: !isAvail ? true : false }));
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors ${
                                    isAvail
                                      ? 'bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-700'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isAvail ? 'Mark Out of Stock' : 'Out of Stock (Excluded)'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mark Packed CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="text-xs">
                        <span className="text-stone-500 font-bold">Zone Minimum:</span>{' '}
                        <strong className="text-stone-900">₹{slip.zone_min_order}</strong>
                      </div>

                      <button
                        type="button"
                        disabled={packerSaving}
                        onClick={() => handleMarkPacked(slip)}
                        className="py-2.5 px-5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{packerSaving ? 'Calculating...' : 'Mark Packed & Notify Customer to Pay'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOM MANUAL ITEM */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-sm font-black text-stone-900">Add Custom Item</h4>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Loose Brown Sugar"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={manualQty}
                    onChange={(e) => setManualQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    placeholder="kg / packet"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Price per Unit (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddManualItem}
                disabled={!manualName.trim()}
                className="flex-1 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-xl text-xs disabled:opacity-50"
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK ADD GROCERY LIST */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-[#2E7D32]" />
                <h4 className="text-sm font-black text-stone-900">Bulk Add Grocery List</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Paste or type customer list line-by-line. Price and quantity are optional (e.g. &quot;Aashirvaad Atta 5kg - 260&quot; or &quot;Sugar 2kg&quot;).
            </p>

            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={7}
              placeholder={`Aashirvaad Atta 5kg - 260\nSugar 1kg - 45\nFortune Sunflower Oil 1L - 130\nAmul Milk 500ml\nTata Salt 1kg`}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={!bulkText.trim()}
                className="flex-1 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-xl text-xs disabled:opacity-50"
              >
                Add All Line Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FLOATING FULLSCREEN SLIP PHOTO PREVIEW */}
      {showFloatingPreviewModal && selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs">
          <div className="bg-stone-900 text-white rounded-3xl p-4 max-w-lg w-full space-y-3 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Customer Slip Photo ({activeImageIndex + 1}/{selectedSlip.images?.length || 1})</span>
              </span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 rounded hover:bg-stone-700 text-stone-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 rounded hover:bg-stone-700 text-stone-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1 rounded hover:bg-stone-700 text-stone-300"
                    title="Rotate"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1 rounded hover:bg-stone-700 text-stone-300"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFloatingPreviewModal(false)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multiple images strip if > 1 */}
            {selectedSlip.images && selectedSlip.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {selectedSlip.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      handleResetZoom();
                    }}
                    className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-emerald-500' : 'border-stone-700 opacity-60'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-12 h-12 object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Zoomable Image Area */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-full flex-1 min-h-[320px] bg-black rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center select-none touch-none"
            >
              {selectedSlip.images && selectedSlip.images[activeImageIndex] ? (
                <img
                  src={selectedSlip.images[activeImageIndex].image_url}
                  alt="Customer Slip Preview"
                  className="max-h-full max-w-full object-contain transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) rotate(${zoomRotation}deg)`,
                  }}
                  draggable={false}
                />
              ) : (
                <div className="text-stone-400 text-xs">No image available</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFloatingPreviewModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-colors"
            >
              Close &amp; Continue Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
