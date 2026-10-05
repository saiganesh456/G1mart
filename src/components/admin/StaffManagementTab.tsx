'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  PlusCircle,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Phone,
  Bike,
  RefreshCw,
  KeyRound,
  Shield,
  Info,
} from 'lucide-react';
import type { StaffMember } from '@/types';

export default function StaffManagementTab() {
  const [admins, setAdmins] = useState<StaffMember[]>([]);
  const [riders, setRiders] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');

  // Rider form state
  const [riderEmail, setRiderEmail] = useState('');
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderVehicle, setRiderVehicle] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
        setRiders(data.riders || []);
      }
    } catch (err: any) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin',
          email: adminEmail.trim(),
          name: adminName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Admin access granted to ${adminEmail}. They will automatically open the Admin Console when logging in.`,
        });
        setAdminEmail('');
        setAdminName('');
        if (data.staffDirectory) {
          setAdmins(data.staffDirectory.admins || []);
          setRiders(data.staffDirectory.riders || []);
        } else {
          fetchStaff();
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to grant admin access' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'g1mart@gmail.com' || cleanEmail === 'lingalamahendra0@gmail.com') {
      alert(`The root store admin (${email}) cannot be removed.`);
      return;
    }
    if (!confirm(`Are you sure you want to revoke admin access for ${email}?`)) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin', email }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Revoked admin privileges for ${email}` });
        if (data.staffDirectory) {
          setAdmins(data.staffDirectory.admins || []);
        } else {
          fetchStaff();
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to revoke admin' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderEmail.trim() || !riderName.trim()) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rider',
          email: riderEmail.trim(),
          name: riderName.trim(),
          phone: riderPhone.trim(),
          vehicleNumber: riderVehicle.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Delivery Rider ${riderName} registered. When logging in with ${riderEmail}, they will automatically enter the Rider Console.`,
        });
        setRiderEmail('');
        setRiderName('');
        setRiderPhone('');
        setRiderVehicle('');
        if (data.staffDirectory) {
          setAdmins(data.staffDirectory.admins || []);
          setRiders(data.staffDirectory.riders || []);
        } else {
          fetchStaff();
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to add rider' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRider = async (email: string) => {
    if (!confirm(`Are you sure you want to remove rider access for ${email}?`)) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rider', email }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Removed rider access for ${email}` });
        if (data.staffDirectory) {
          setRiders(data.staffDirectory.riders || []);
        } else {
          fetchStaff();
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to remove rider' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Instructions */}
      <div className="bg-gradient-to-r from-[#1A2E1C] to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black tracking-tight">Staff &amp; Role Management</h2>
            </div>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Authorize staff emails as <b>Admins</b> or <b>Delivery Riders</b>. When authorized staff sign in with their designated email, G1 Mart automatically assigns their role and routes them directly to their dedicated console.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchStaff}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Staff</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 text-sm font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Two Column Grid: Admins & Riders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================================= */}
        {/* COLUMN 1: ADMINISTRATORS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">Store Administrators</h3>
                <p className="text-[11px] text-stone-500">Full access to catalog, inventory, and orders</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {admins.length} Active
            </span>
          </div>

          {/* Add Admin Form */}
          <form onSubmit={handleAddAdmin} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Grant New Admin Access</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Admin Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="manager@gmail.com"
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-white border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Admin Name / Role Title (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Co-Manager / Warehouse Lead"
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-white border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !adminEmail.trim()}
              className="w-full h-10 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Grant Administrator Access</span>
            </button>
          </form>

          {/* Current Admins List */}
          <div className="space-y-2 pt-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Authorized Admin Accounts
            </h4>
            <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
              {admins.map((admin) => {
                const isRoot =
                  admin.email.toLowerCase() === 'g1mart@gmail.com' ||
                  admin.email.toLowerCase() === 'lingalamahendra0@gmail.com';
                return (
                  <div key={admin.id || admin.email} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {admin.email}
                        </span>
                        {isRoot && (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            Root Superadmin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {admin.name || 'Store Administrator'} · Active
                      </div>
                    </div>

                    {!isRoot ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(admin.email)}
                        disabled={actionLoading}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Revoke Admin Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 pr-1">Protected</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: DELIVERY RIDERS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">Delivery Fleet &amp; Riders</h3>
                <p className="text-[11px] text-stone-500">Express delivery dispatch &amp; turn-by-turn navigation</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {riders.length} Active
            </span>
          </div>

          {/* Add Rider Form */}
          <form onSubmit={handleAddRider} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>Register New Delivery Rider</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Rider Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={riderEmail}
                    onChange={(e) => setRiderEmail(e.target.value)}
                    placeholder="rider@gmail.com"
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-white border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Rider Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    placeholder="e.g. S. Mahesh"
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-white border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-white border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Vehicle Reg Number
                </label>
                <div className="relative">
                  <Bike className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={riderVehicle}
                    onChange={(e) => setRiderVehicle(e.target.value)}
                    placeholder="AP 26 EQ 4589"
                    className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-white border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !riderEmail.trim() || !riderName.trim()}
              className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Delivery Rider</span>
            </button>
          </form>

          {/* Current Riders List */}
          <div className="space-y-2 pt-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Registered Delivery Partners
            </h4>
            <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
              {riders.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-400">
                  No delivery riders added yet. Add a rider above to authorize their email.
                </div>
              ) : (
                riders.map((rider) => (
                  <div key={rider.id || rider.email} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {rider.name}
                        </span>
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {rider.vehicleNumber || 'Bike Delivery'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {rider.email} {rider.phone ? `· ${rider.phone}` : ''}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRider(rider.email)}
                      disabled={actionLoading}
                      className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove Rider"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
