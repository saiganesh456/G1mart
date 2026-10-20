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
  Info,
  Zap,
  Receipt,
} from 'lucide-react';
import type { SlipOrder, SlipItem, SlipOrderStatus } from '@/types/slipOrder';
import type { Product } from '@/types';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import { useAuth } from '@/context/AuthContext';

interface Props {
  products?: Product[];
  initialActiveSubTab?: 'slips' | 'packer';
  activeSlipId?: string | null;
  onSelectSlip?: (slip: any) => void;
  onCloseSlip?: () => void;
  onBackToDashboard?: () => void;
}

export default function SlipOrdersTab({
  products = [],
  initialActiveSubTab = 'slips',
  activeSlipId,
  onSelectSlip,
  onCloseSlip,
  onBackToDashboard,
}: Props) {
  const { user } = useAuth();
  const getAdminHeaders = (): Record<string, string> => {
    let email = user?.email;
    if (!email && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('g1mart_user_session');
        if (stored) email = JSON.parse(stored).email;
      } catch {}
    }
    return {
      'x-user-email': (email || 'lingalamahendra0@gmail.com').toLowerCase().trim(),
      'x-admin-client': 'true',
    };
  };
  const [subTab, setSubTab] = useState<'slips' | 'packer'>(initialActiveSubTab);
  const activeSlipIdRef = useRef<string | null>(null);
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
      requestedQty: number | string;
      unit: string;
      price: number | string;
      available: boolean;
      substituteNote?: string;
    }>
  >([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Billing Mode state: 'total' | 'itemized'
  const [billingMode, setBillingMode] = useState<'total' | 'itemized'>('total');
  const userBillingModeRef = useRef<'total' | 'itemized' | null>(null);
  const selectedSlipRef = useRef<SlipOrder | null>(selectedSlip);
  selectedSlipRef.current = selectedSlip;
  const [aggregateCount, setAggregateCount] = useState<number | string>('');
  const [aggregateAmount, setAggregateAmount] = useState<number | string>('');
  const [aggregateDeliveryFee, setAggregateDeliveryFee] = useState<number | string>('');

  // Catalog item search state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // Manual item addition state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState<number | string>('');
  const [manualUnit, setManualUnit] = useState('1 unit');
  const [manualPrice, setManualPrice] = useState<number | string>('');

  // Zoomable Slip Viewer state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomRotation, setZoomRotation] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Packer Checklist state
  const [packerChecked, setPackerChecked] = useState<Record<string, boolean>>({});
  const [packerPackedQty, setPackerPackedQty] = useState<Record<string, number | string>>({});
  const [packerAvailable, setPackerAvailable] = useState<Record<string, boolean>>({});
  const [packerSubstituteNotes, setPackerSubstituteNotes] = useState<Record<string, string>>({});
  const [packerSaving, setPackerSaving] = useState(false);

  // Fetch slip orders
  const fetchSlipOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/slip-orders?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
        // Refresh selected slip if currently open using active ref
        const currentSelected = selectedSlipRef.current;
        if (currentSelected) {
          const updated = data.orders.find((o: SlipOrder) => o.id === currentSelected.id);
          if (updated) {
            setSelectedSlip((prev) => {
              if (!prev || prev.id !== updated.id) return updated;
              return {
                ...updated,
                admin_notes: prev.admin_notes !== undefined ? prev.admin_notes : updated.admin_notes,
              };
            });
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

  // When selected slip changes, initialize bill builder and image viewer ONLY IF opening a different slip
  useEffect(() => {
    if (selectedSlip) {
      // Guard: Never reset user's billing mode, zoom, or typed numbers when 2-second background poll refreshes the same slip!
      if (activeSlipIdRef.current === selectedSlip.id) {
        return;
      }
      activeSlipIdRef.current = selectedSlip.id;

      setActiveImageIndex(0);
      setZoomScale(1);
      setZoomRotation(0);
      setPanOffset({ x: 0, y: 0 });
      setAdminNotes(selectedSlip.admin_notes || '');

      const isAggregate =
        (selectedSlip.items?.length === 1 &&
          (String(selectedSlip.items[0].id).startsWith('slip_item_') ||
            (selectedSlip.items[0].name || '').includes('as per customer slip') ||
            (selectedSlip.items[0].name || '').toLowerCase() === 'total bill')) ||
        Boolean(selectedSlip.total_items && selectedSlip.total_items > 0);

      if (userBillingModeRef.current) {
        setBillingMode(userBillingModeRef.current);
      } else if (isAggregate) {
        setBillingMode('total');
      } else if (selectedSlip.items && selectedSlip.items.length > 0) {
        setBillingMode('itemized');
      } else {
        setBillingMode('total');
      }

      // Realistic manual numbers: do not prefill constant numbers like 1, 50, etc.
      setAggregateCount(selectedSlip.total_items ? selectedSlip.total_items : '');
      setAggregateAmount(
        isAggregate
          ? selectedSlip.subtotal ||
            selectedSlip.final_total ||
            selectedSlip.estimated_total ||
            selectedSlip.items?.[0]?.price ||
            ''
          : ''
      );
      setAggregateDeliveryFee(selectedSlip.delivery_fee ? selectedSlip.delivery_fee : '');

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
      const initialPackedQty: Record<string, number | string> = {};
      const initialAvailable: Record<string, boolean> = {};
      const initialNotes: Record<string, string> = {};
      currentItems.forEach((it) => {
        const key = it.id || it.name;
        initialChecked[key] = it.available;
        initialPackedQty[key] = Number(it.requestedQty) || 1;
        initialAvailable[key] = it.available;
        initialNotes[key] = it.substituteNote || '';
      });
      setPackerChecked(initialChecked);
      setPackerPackedQty(initialPackedQty);
      setPackerAvailable(initialAvailable);
      setPackerSubstituteNotes(initialNotes);
    }
  }, [selectedSlip]);

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

  // Add custom manual item
  const handleAddManualItem = () => {
    if (!manualName.trim()) return;
    setBilledItems((prev) => [
      ...prev,
      {
        productId: null,
        name: manualName.trim(),
        requestedQty: Math.max(1, Number(manualQty) || 1),
        unit: manualUnit.trim() || 'unit',
        price: Math.max(0, Number(manualPrice) || 0),
        available: true,
        substituteNote: '',
      },
    ]);
    setManualName('');
    setManualQty('');
    setManualUnit('1 unit');
    setManualPrice('');
    setShowManualModal(false);
  };

  // Remove item from bill (persists immediately so background polling never brings it back)
  const handleRemoveItem = async (index: number) => {
    const updated = billedItems.filter((_, idx) => idx !== index);
    setBilledItems(updated);

    if (selectedSlip) {
      try {
        const sanitizedItems = updated.map((it) => ({
          id: it.id,
          productId: it.productId,
          name: it.name,
          requestedQty: Math.max(1, Number(it.requestedQty) || 1),
          unit: it.unit || 'unit',
          price: Math.max(0, Number(it.price) || 0),
          available: it.available !== false,
          substituteNote: it.substituteNote || '',
        }));

        const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAdminHeaders(),
          },
          body: JSON.stringify({
            items: sanitizedItems,
            adminNotes,
            billedBy: 'Store Staff',
            moveStatus: selectedSlip.status,
          }),
        });

        const data = await res.json();
        if (res.ok && data.order) {
          setSelectedSlip(data.order);
          setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
          setActionSuccess('Item removed from bill.');
          setTimeout(() => setActionSuccess(null), 2500);
        }
      } catch (err) {
        console.error('Failed to persist item deletion:', err);
      }
    }
  };

  // Update item field
  const handleUpdateItemField = (index: number, field: string, value: any) => {
    setBilledItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // Save Quick Total Bill (Action: Save Draft Total Bill)
  const handleSaveTotalBill = async (moveStatus?: 'BILLING' | 'AWAITING_CUSTOMER_CONFIRMATION') => {
    if (!selectedSlip) return;
    const count = Math.max(1, Number(aggregateCount) || 1);
    const amount = Math.max(0, Number(aggregateAmount) || 0);
    const fee = Math.max(0, Number(aggregateDeliveryFee) || 0);

    if (amount <= 0) {
      setActionError('Please enter a total grocery bill amount greater than ₹0');
      return;
    }

    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          totalItems: count,
          groceryAmount: amount,
          deliveryFee: fee,
          adminNotes,
          billedBy: 'Store Staff',
          moveStatus: moveStatus || 'BILLING',
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedSlip(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setActionSuccess(`Total bill of ₹${amount + fee} for ${count} items saved successfully.`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.error || 'Failed to save total bill');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error saving total bill');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Quick Total Bill by Call (Action: Confirm by Call)
  const handleConfirmTotalBillByCall = async () => {
    if (!selectedSlip) return;
    const count = Math.max(1, Number(aggregateCount) || 1);
    const amount = Math.max(0, Number(aggregateAmount) || 0);
    const fee = Math.max(0, Number(aggregateDeliveryFee) || 0);

    if (amount <= 0) {
      setActionError('Please enter a total grocery bill amount before confirming');
      return;
    }

    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      // 1. First save the aggregate bill
      await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          totalItems: count,
          groceryAmount: amount,
          deliveryFee: fee,
          adminNotes,
          billedBy: 'Store Staff',
          moveStatus: 'AWAITING_CUSTOMER_CONFIRMATION',
        }),
      });

      // 2. Mark confirmed by phone call
      const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}/confirm-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          staffName: 'Store Staff',
          notes: `Customer confirmed total bill of ₹${amount + fee} (${count} items) via phone call`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedSlip(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setActionSuccess(`Order #${selectedSlip.id} confirmed by call! Moved to Packer queue.`);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(data.error || 'Failed to confirm order');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error confirming total bill');
    } finally {
      setIsSaving(false);
    }
  };

  // Save bill items (Action: Save Bill)
  const handleSaveBill = async (moveStatus?: 'BILLING' | 'AWAITING_CUSTOMER_CONFIRMATION') => {
    if (!selectedSlip) return;
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const sanitizedItems = billedItems.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.name,
        requestedQty: Math.max(1, Number(it.requestedQty) || 1),
        unit: it.unit || 'unit',
        price: Math.max(0, Number(it.price) || 0),
        available: it.available !== false,
        substituteNote: it.substituteNote || '',
      }));

      const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          items: sanitizedItems,
          adminNotes,
          billedBy: 'Store Staff',
          moveStatus: moveStatus || 'BILLING',
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedSlip(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setActionSuccess('Bill saved successfully with ' + sanitizedItems.length + ' items.');
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
      const sanitizedItems = billedItems.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.name,
        requestedQty: Math.max(1, Number(it.requestedQty) || 1),
        unit: it.unit || 'unit',
        price: Math.max(0, Number(it.price) || 0),
        available: it.available !== false,
        substituteNote: it.substituteNote || '',
      }));

      // First save items if modified
      await fetch(`/api/admin/slip-orders/${selectedSlip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          items: sanitizedItems,
          adminNotes,
          billedBy: 'Store Staff',
          moveStatus: 'AWAITING_CUSTOMER_CONFIRMATION',
        }),
      });

      // Then mark confirmed
      const res = await fetch(`/api/admin/slip-orders/${selectedSlip.id}/confirm-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
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
                              activeSlipIdRef.current = null;
                              userBillingModeRef.current = null;
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
                    activeSlipIdRef.current = null;
                    userBillingModeRef.current = null;
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
                <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-4 space-y-3 relative lg:sticky lg:top-20">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#2E7D32]" />
                      <span>Slip Photo Viewer ({selectedSlip.images?.length || 0})</span>
                    </span>

                    {/* Viewer Controls */}
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
                  </div>

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
                    className="relative w-full h-[420px] bg-stone-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center border border-stone-300 select-none"
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

                  {/* Billing Mode Switcher (Quick Total Bill vs Itemized Bill) */}
                  <div className="flex items-center gap-2 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/70">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingMode('total');
                        userBillingModeRef.current = 'total';
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                        billingMode === 'total'
                          ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>⚡ Quick Total Bill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingMode('itemized');
                        userBillingModeRef.current = 'itemized';
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                        billingMode === 'itemized'
                          ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-[#2E7D32]" />
                      <span>📝 Itemized Bill</span>
                    </button>
                  </div>

                  {/* MODE A: QUICK TOTAL BILL */}
                  {billingMode === 'total' ? (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-stone-900">Store Counter / Fast Billing</p>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            Inspect customer list photo on the left. Enter the total number of items and the total bill calculated from your store counter. Customer tracking will immediately update with the verified bill.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-black text-stone-800 block mb-1.5">
                            Number of Grocery Items in Slip
                          </label>
                          <div className="relative">
                            <Package className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={aggregateCount}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, '');
                                setAggregateCount(v);
                              }}
                              placeholder="e.g. 5"
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-black text-stone-900 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                aggregateCount === ''
                                  ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                                  : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2E7D32]'
                              }`}
                            />
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1 font-medium">
                            Total count of items requested
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-black text-stone-800 block mb-1.5">
                            Total Grocery Bill Amount (₹)
                          </label>
                          <div className="relative">
                            <span className="text-xs font-black text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2">
                              ₹
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={aggregateAmount}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9.]/g, '');
                                setAggregateAmount(v);
                              }}
                              placeholder="e.g. 650"
                              className={`w-full pl-8 pr-3 py-2.5 rounded-xl text-base font-black text-stone-900 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                aggregateAmount === ''
                                  ? 'bg-rose-50/50 border border-rose-300 focus:ring-2 focus:ring-rose-500'
                                  : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2E7D32]'
                              }`}
                            />
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1 font-medium">
                            Store subtotal amount calculated for all items
                          </p>
                        </div>
                      </div>

                      <div className="max-w-xs">
                        <label className="text-xs font-black text-stone-800 block mb-1.5">
                          Delivery Fee (₹)
                        </label>
                        <div className="relative">
                          <span className="text-xs font-black text-stone-400 absolute left-3 top-1/2 -translate-y-1/2">
                            ₹
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={aggregateDeliveryFee}
                            onFocus={(e) => e.target.select()}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9.]/g, '');
                              setAggregateDeliveryFee(v);
                            }}
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
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
                          placeholder="Special customer requests or call notes..."
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                        />
                      </div>

                      {/* Zone Minimum Verification Box */}
                      {(() => {
                        const countNum = Number(aggregateCount) || 1;
                        const groceryNum = Number(aggregateAmount) || 0;
                        const feeNum = Number(aggregateDeliveryFee) || 0;
                        const grandTotal = groceryNum + feeNum;
                        const hasAggShortfall = !isPickupOrder && groceryNum < zoneMinOrder;
                        const aggShortfall = Math.max(0, zoneMinOrder - groceryNum);

                        return (
                          <div className="p-4 rounded-2xl border space-y-2 bg-stone-50 border-stone-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-stone-600">
                                Grocery Items ({countNum} {countNum === 1 ? 'item' : 'items'}):
                              </span>
                              <span className="font-black text-sm text-stone-900">₹{groceryNum}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-stone-600">Delivery Fee:</span>
                              <span className="font-black text-stone-900">
                                {feeNum > 0 ? `₹${feeNum}` : 'FREE (₹0)'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs border-t border-stone-200 pt-1.5">
                              <span className="font-black text-stone-900">Total Customer Payable:</span>
                              <span className="font-black text-base text-[#1B5E20]">₹{grandTotal}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs border-t border-stone-200/60 pt-1">
                              <span className="font-bold text-stone-500">Zone Minimum Required:</span>
                              <span className="font-black text-stone-700">₹{zoneMinOrder}</span>
                            </div>

                            {/* Shortfall Alert vs Success Pill */}
                            {hasAggShortfall ? (
                              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <span>
                                    ⚠️ Shortfall of ₹{aggShortfall} for delivery zone ({selectedSlip.distance_km || 0} km)!
                                  </span>
                                  <p className="text-[11px] text-amber-800 font-normal mt-0.5">
                                    Customer must meet ₹{zoneMinOrder} zone minimum. Suggest adding more items during confirmation call.
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
                        );
                      })()}

                      {/* Inline feedback alerts for fast mobile visibility */}
                      {actionError && (
                        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{actionError}</span>
                        </div>
                      )}
                      {actionSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                          <span>{actionSuccess}</span>
                        </div>
                      )}

                      {/* Quick Total Bill Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveTotalBill('BILLING')}
                          className="w-full sm:flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black rounded-2xl text-xs transition-colors border border-stone-300 flex items-center justify-center gap-2"
                        >
                          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-stone-600" /> : null}
                          <span>{isSaving ? 'Saving Total Bill...' : 'Save Draft Total Bill'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleConfirmTotalBillByCall}
                          className="w-full sm:flex-1 py-3 px-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-2xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                          <span>{isSaving ? 'Confirming...' : 'Confirm by Call & Move to Packer'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* MODE B: ITEMIZED BILL (SEARCH CATALOG) */
                    <div className="space-y-4 animate-in fade-in duration-150">
                      {/* Catalog Item Search & Add Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-stone-800">
                            Add Items from Supermarket Catalog
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setManualName('');
                              setManualQty('1');
                              setManualUnit('1 unit');
                              setManualPrice('');
                              setShowManualModal(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Custom Item</span>
                          </button>
                        </div>

                        <div className="relative">
                          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={catalogSearch}
                            onFocus={() => setShowCatalogDropdown(true)}
                            onChange={(e) => {
                              setCatalogSearch(e.target.value);
                              setShowCatalogDropdown(true);
                            }}
                            placeholder="Type grocery name (e.g., Aashirvaad Atta, Fortune Oil, Amul Milk)..."
                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                          />

                          {/* Dropdown Auto-suggest */}
                          {showCatalogDropdown && matchingCatalogProducts.length > 0 && (
                            <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl border border-stone-200 shadow-lg divide-y divide-stone-100 max-h-60 overflow-y-auto">
                              {matchingCatalogProducts.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleAddCatalogItem(p)}
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
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Billed Items List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-stone-800">
                          <span>Billed Line Items ({billedItems.length})</span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            Tick checkbox or toggle availability if out of stock
                          </span>
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
                                          type="text"
                                          inputMode="numeric"
                                          value={item.requestedQty}
                                          onFocus={(e) => e.target.select()}
                                          onClick={(e) => (e.target as HTMLInputElement).select()}
                                          onChange={(e) =>
                                            handleUpdateItemField(idx, 'requestedQty', e.target.value.replace(/[^0-9]/g, ''))
                                          }
                                          placeholder="1"
                                          className="w-14 px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-xs font-bold text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <input
                                          type="text"
                                          value={item.unit}
                                          onChange={(e) =>
                                            handleUpdateItemField(idx, 'unit', e.target.value)
                                          }
                                          placeholder="unit"
                                          className="w-16 px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-[11px] text-stone-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
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
                                          type="text"
                                          inputMode="decimal"
                                          value={item.price}
                                          onFocus={(e) => e.target.select()}
                                          onClick={(e) => (e.target as HTMLInputElement).select()}
                                          onChange={(e) =>
                                            handleUpdateItemField(idx, 'price', e.target.value.replace(/[^0-9.]/g, ''))
                                          }
                                          placeholder="0"
                                          className="w-20 px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-xs font-bold text-right focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                      </div>
                                      <span className="text-[11px] font-black text-stone-900 block mt-0.5">
                                        = ₹{item.available ? (Number(item.price) || 0) * (Number(item.requestedQty) || 0) : 0}
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

                      {/* Inline feedback alerts for fast mobile visibility */}
                      {actionError && (
                        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{actionError}</span>
                        </div>
                      )}
                      {actionSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                          <span>{actionSuccess}</span>
                        </div>
                      )}

                      {/* ACTION FOOTER BUTTONS */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveBill('BILLING')}
                          className="w-full sm:flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black rounded-2xl text-xs transition-colors border border-stone-300 flex items-center justify-center gap-2"
                        >
                          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-stone-600" /> : null}
                          <span>{isSaving ? 'Saving Bill...' : 'Save Draft Bill'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isSaving || billedItems.length === 0}
                          onClick={handleMarkConfirmedByCall}
                          className="w-full sm:flex-1 py-3 px-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-2xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                          <span>{isSaving ? 'Confirming...' : 'Mark Confirmed by Call'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) =>
                                      setPackerPackedQty((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    onBlur={() => {
                                      setPackerPackedQty((prev) => ({
                                        ...prev,
                                        [key]:
                                          prev[key] === '' ||
                                          Number(prev[key]) < 0 ||
                                          isNaN(Number(prev[key]))
                                            ? 0
                                            : Number(prev[key]),
                                      }));
                                    }}
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-black text-center disabled:opacity-40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    type="text"
                    inputMode="numeric"
                    value={manualQty}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => setManualQty(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    placeholder="e.g. 1 unit or 1 kg"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Price per Unit (₹)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualPrice}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onChange={(e) => setManualPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
    </div>
  );
}
