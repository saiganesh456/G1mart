'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  MessageCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  ShoppingBag,
} from 'lucide-react';
import type { SlipRecord } from '@/lib/serverSlipStore';

export default function SlipsManagementTab() {
  const [slips, setSlips] = useState<SlipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'converted_to_order' | 'rejected'>('all');
  const [selectedSlip, setSelectedSlip] = useState<SlipRecord | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSlips = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/slips');
      const data = await res.json();
      if (res.ok && data.slips) {
        setSlips(data.slips);
      }
    } catch (err) {
      console.error('[SlipsManagementTab] Failed to fetch slips:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips(false);
    const interval = setInterval(() => {
      fetchSlips(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update status or notes
  const handleUpdateStatus = async (
    id: string,
    newStatus: 'new' | 'reviewed' | 'converted_to_order' | 'rejected',
    notes?: string
  ) => {
    setIsUpdating(true);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/slips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notes !== undefined ? notes : notesInput,
          handled_by: 'Staff Admin',
        }),
      });

      const data = await res.json();
      if (res.ok && data.slip) {
        setSlips((prev) => prev.map((s) => (s.id === id ? data.slip : s)));
        if (selectedSlip && selectedSlip.id === id) {
          setSelectedSlip(data.slip);
          setNotesInput(data.slip.admin_notes || '');
        }
        setActionSuccess(`Slip marked as ${newStatus.replace(/_/g, ' ')}.`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[SlipsManagementTab] Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDetail = (slip: SlipRecord) => {
    setSelectedSlip(slip);
    setNotesInput(slip.admin_notes || '');
    setActionSuccess(null);
  };

  const filteredSlips = slips.filter((s) => {
    const matchesSearch =
      (s.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customer_phone || '').includes(searchQuery) ||
      (s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: SlipRecord['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>New Slip</span>
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Check className="w-3 h-3 text-blue-600" />
            <span>Reviewed</span>
          </span>
        );
      case 'converted_to_order':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-emerald-600" />
            <span>Converted to Order</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <X className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              Customer Handwritten Slips
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Paper lists uploaded by shoppers via the camera scanner. Review items and call or WhatsApp to confirm.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSlips}
          disabled={loading}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, or slip ID…"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: `All (${slips.length})` },
            { id: 'new', label: `New (${slips.filter((s) => s.status === 'new').length})` },
            { id: 'reviewed', label: `Reviewed (${slips.filter((s) => s.status === 'reviewed').length})` },
            { id: 'converted_to_order', label: `Converted (${slips.filter((s) => s.status === 'converted_to_order').length})` },
            { id: 'rejected', label: `Rejected (${slips.filter((s) => s.status === 'rejected').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#2E7D32] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-[#2E7D32] hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slips Grid / List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2E7D32] mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-500">Loading customer slips…</p>
        </div>
      ) : filteredSlips.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <FileText className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-700">No slips found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `There are no slips currently marked as "${statusFilter.replace(/_/g, ' ')}".`
              : 'Customer uploaded slips will appear here immediately after submission.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlips.map((slip) => (
            <div
              key={slip.id}
              className="bg-white rounded-2xl border border-stone-200/80 hover:border-[#2E7D32]/50 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail & Status Row */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden border-b border-stone-100">
                  {slip.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={slip.image_url}
                      alt={`Slip by ${slip.customer_name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5">
                    {getStatusBadge(slip.status)}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-stone-900 leading-tight">
                        {slip.customer_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <a href={`tel:${slip.customer_phone}`} className="hover:underline">
                          {slip.customer_phone}
                        </a>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-stone-400">
                        {new Date(slip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className="text-[10px] text-stone-400">
                        {new Date(slip.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {slip.admin_notes && (
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-600 font-medium line-clamp-2">
                      <span className="font-bold text-stone-800">Note: </span>
                      {slip.admin_notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-stone-100 mt-1 gap-2">
                <a
                  href={`https://wa.me/91${slip.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello ${slip.customer_name}, we received your grocery slip at G1 Mart. We are checking the items for you now.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenDetail(slip)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Slip</span>
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DETAIL INSPECTION MODAL ── */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#2E7D32]" />
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Slip from {selectedSlip.customer_name}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Received: {new Date(selectedSlip.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedSlip.status)}
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Image & Staff Actions */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Slip High-Res Image View (Supports Multi-Page Slips) */}
              <div className="lg:col-span-7 bg-stone-950 rounded-2xl overflow-hidden flex flex-col items-center justify-between min-h-[350px] max-h-[550px] p-2 border border-stone-800">
                <div className="flex-1 w-full flex items-center justify-center min-h-0">
                  {selectedSlip.image_urls && selectedSlip.image_urls.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedSlip.image_urls[0]}
                      alt="Customer Slip Preview"
                      className="max-w-full max-h-[460px] object-contain rounded-xl"
                    />
                  ) : selectedSlip.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedSlip.image_url}
                      alt="Customer Slip Preview"
                      className="max-w-full max-h-[460px] object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-stone-400 text-xs">No image available</div>
                  )}
                </div>

                {/* Multiple Page Strip in Admin if customer uploaded multiple photos */}
                {selectedSlip.image_urls && selectedSlip.image_urls.length > 1 && (
                  <div className="w-full py-2 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar border-t border-stone-800">
                    {selectedSlip.image_urls.map((imgUrl, pIdx) => (
                      <a
                        key={pIdx}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="relative w-12 h-16 rounded-md overflow-hidden border border-stone-700 hover:border-emerald-400 shrink-0"
                        title={`Page ${pIdx + 1} - click to view full size`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Page ${pIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white text-center">
                          p.{pIdx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff Actions & Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Customer Card */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      Customer Details
                    </span>
                    <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                      <User className="w-4 h-4 text-stone-500" />
                      <span>{selectedSlip.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-xs text-[#2E7D32]">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedSlip.customer_phone}`} className="hover:underline">
                        {selectedSlip.customer_phone}
                      </a>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      Set Status
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedSlip.id, 'reviewed')}
                        disabled={isUpdating}
                        className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedSlip.id, 'converted_to_order')}
                        disabled={isUpdating}
                        className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Convert to Order
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedSlip.id, 'rejected')}
                        disabled={isUpdating}
                        className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject Slip
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedSlip.id, 'new')}
                        disabled={isUpdating}
                        className="p-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reset to New
                      </button>
                    </div>
                  </div>

                  {/* Staff Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                      Staff Notes (Internal)
                    </label>
                    <textarea
                      rows={3}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="e.g. Items verified: 1kg Minapappu, 1 Wagh Bakri Tea. Called customer for brand confirmation."
                      className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#2E7D32]"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedSlip.id, selectedSlip.status, notesInput)}
                      disabled={isUpdating}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>

                  {actionSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}
                </div>

                {/* Contact CTA */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/91${selectedSlip.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedSlip.customer_name}, we are preparing your grocery items from your slip at G1 Mart.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Customer</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
