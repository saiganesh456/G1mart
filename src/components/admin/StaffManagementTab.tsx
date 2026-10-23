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
  X,
  PhoneCall,
  Users,
  ArrowLeft,
} from 'lucide-react';
import type { StaffMember } from '@/types';
import { soundAlerts } from '@/lib/soundAlerts';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onBackToDashboard?: () => void;
}

export default function StaffManagementTab({ onBackToDashboard }: Props = {}) {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<StaffMember[]>([]);
  const [riders, setRiders] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Active role tab: 'admins' | 'riders'
  const [activeRoleTab, setActiveRoleTab] = useState<'admins' | 'riders'>('admins');
  // Collapsible add form toggle
  const [showAddForm, setShowAddForm] = useState(false);

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
      const headers: Record<string, string> = {
        'x-admin-client': 'true',
        'x-user-email': user?.email || 'sureshdega466@gmail.com',
      };
      const res = await fetch('/api/admin/staff', { headers });
      const data = await res.json();
      let serverAdmins: StaffMember[] = [];
      let serverRiders: StaffMember[] = [];

      if (data.success) {
        serverAdmins = data.admins || [];
        serverRiders = data.riders || [];
      }

      // 1. Fallback to local storage backup if available
      try {
        const localRaw = localStorage.getItem('g1mart_staff_directory');
        if (localRaw) {
          const local = JSON.parse(localRaw);
          if (serverAdmins.length === 0 && Array.isArray(local.admins)) {
            serverAdmins = local.admins;
          }
          if (serverRiders.length === 0 && Array.isArray(local.riders)) {
            serverRiders = local.riders;
          }
        }
      } catch {}

      // 2. Guaranteed fallback to default super admins
      if (serverAdmins.length === 0) {
        serverAdmins = [
          {
            id: 'root-admin-00',
            email: 'sureshdega466@gmail.com',
            role: 'admin',
            name: 'Suresh Dega (Super Admin)',
            createdAt: '2026-10-19T00:00:00Z',
            status: 'active',
          },
          {
            id: 'root-admin-01',
            email: 'g1mart@gmail.com',
            role: 'admin',
            name: 'Primary Store Admin',
            createdAt: '2026-10-01T00:00:00Z',
            status: 'active',
          },
          {
            id: 'root-admin-02',
            email: 'lingalamahendra0@gmail.com',
            role: 'admin',
            name: 'Mahendra Lingala (Store Admin)',
            createdAt: '2026-10-01T00:00:00Z',
            status: 'active',
          },
        ];
      }

      // 3. Display current admin if verified as admin
      if (user?.email && user.role === 'admin') {
        const currentCleanEmail = user.email.toLowerCase().trim();
        const exists = serverAdmins.some(
          (a) => (a.email || '').toLowerCase().trim() === currentCleanEmail
        );
        if (!exists) {
          serverAdmins.unshift({
            id: `current-admin-${user.id || 'me'}`,
            email: currentCleanEmail,
            role: 'admin',
            name: user.name || 'Store Administrator',
            createdAt: new Date().toISOString(),
            status: 'active',
          });
        }
      }

      // 4. Default delivery fleet fallback if empty
      if (serverRiders.length === 0) {
        serverRiders = [
          {
            id: 'rider-sai-ganesh',
            email: 'gummasaiganesh57@gmail.com',
            role: 'rider',
            name: 'Sai Ganesh',
            phone: '9876543210',
            vehicleNumber: 'AP 26 EQ 4589',
            createdAt: '2026-10-01T00:00:00Z',
            status: 'active',
          },
          {
            id: 'default-rider',
            email: 'rider@g1mart.com',
            role: 'rider',
            name: 'Express Delivery Rider',
            phone: '9876543212',
            vehicleNumber: 'AP 26 EQ 4591',
            createdAt: '2026-10-01T00:00:00Z',
            status: 'active',
          },
        ];
      }

      setAdmins(serverAdmins);
      setRiders(serverRiders);

      try {
        localStorage.setItem(
          'g1mart_staff_directory',
          JSON.stringify({ admins: serverAdmins, riders: serverRiders })
        );
      } catch {}
    } catch (err: any) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [user]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'sureshdega466@gmail.com',
          'x-admin-client': 'true',
        },
        body: JSON.stringify({
          type: 'admin',
          email: adminEmail.trim(),
          name: adminName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundAlerts.playRoleGrantedChime();
        setFeedback({
          type: 'success',
          message: `Admin access granted to ${adminEmail}. They can now log in to the Admin Console.`,
        });
        setAdminEmail('');
        setAdminName('');
        setShowAddForm(false);
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
    const currentLoggedEmail = (user?.email || '').toLowerCase().trim();

    // 1. Permanent protection: Suresh Dega cannot be removed
    if (cleanEmail === 'sureshdega466@gmail.com') {
      setFeedback({
        type: 'error',
        message: `Suresh Dega (${email}) is the protected master administrator and cannot be removed.`,
      });
      return;
    }

    const isSuresh =
      currentLoggedEmail === 'sureshdega466@gmail.com' ||
      !currentLoggedEmail;
    const isOwner =
      isSuresh ||
      currentLoggedEmail === 'lingalamahendra0@gmail.com' ||
      currentLoggedEmail === 'g1mart@gmail.com';
    const isSelf = currentLoggedEmail === cleanEmail;

    // Disallow non-owners from removing root accounts
    if (!isOwner && (cleanEmail === 'g1mart@gmail.com' || cleanEmail === 'lingalamahendra0@gmail.com')) {
      setFeedback({
        type: 'error',
        message: `Only authorized superadmins can remove primary store accounts.`,
      });
      return;
    }

    // If deleting your own logged-in account, prompt confirmation
    if (isSelf) {
      if (
        !confirm(
          `Are you sure you want to revoke admin access for yourself (${email})?\n\nYou will be logged out of the Admin Console immediately.`
        )
      ) {
        return;
      }
    }

    // 1. Optimistically remove from UI state immediately for responsive instant feedback
    const prevAdmins = [...admins];
    const remainingAdmins = admins.filter(
      (a) => (a.email || '').toLowerCase().trim() !== cleanEmail
    );
    setAdmins(remainingAdmins);
    try {
      localStorage.setItem(
        'g1mart_staff_directory',
        JSON.stringify({ admins: remainingAdmins, riders })
      );
    } catch {}

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'sureshdega466@gmail.com',
          'x-admin-client': 'true',
        },
        body: JSON.stringify({ type: 'admin', email: cleanEmail }),
      });
      const data = await res.json();
      if (data.success) {
        soundAlerts.playRoleGrantedChime();
        setFeedback({ type: 'success', message: `Revoked admin privileges for ${email}` });

        if (isSelf) {
          try {
            localStorage.removeItem('g1mart_user_session');
          } catch {}
          window.location.href = '/';
          return;
        }

        if (data.staffDirectory?.admins) {
          setAdmins(data.staffDirectory.admins);
          try {
            localStorage.setItem(
              'g1mart_staff_directory',
              JSON.stringify(data.staffDirectory)
            );
          } catch {}
        }
      } else {
        // Rollback on error
        setAdmins(prevAdmins);
        setFeedback({ type: 'error', message: data.error || 'Failed to revoke admin' });
      }
    } catch (err: any) {
      setAdmins(prevAdmins);
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
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'sureshdega466@gmail.com',
          'x-admin-client': 'true',
        },
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
        soundAlerts.playRoleGrantedChime();
        setFeedback({
          type: 'success',
          message: `Delivery Rider ${riderName} registered. When logging in with ${riderEmail}, they will enter the Rider Console.`,
        });
        setRiderEmail('');
        setRiderName('');
        setRiderPhone('');
        setRiderVehicle('');
        setShowAddForm(false);
        if (data.staffDirectory) {
          setAdmins(data.staffDirectory.admins || []);
          setRiders(data.staffDirectory.riders || []);
          try {
            localStorage.setItem('g1mart_staff_directory', JSON.stringify(data.staffDirectory));
          } catch {}
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
    const cleanEmail = email.toLowerCase().trim();

    // 1. Optimistically remove from UI state immediately
    const prevRiders = [...riders];
    const remainingRiders = riders.filter((r) => (r.email || '').toLowerCase().trim() !== cleanEmail);
    setRiders(remainingRiders);
    try {
      localStorage.setItem(
        'g1mart_staff_directory',
        JSON.stringify({ admins, riders: remainingRiders })
      );
    } catch {}

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'sureshdega466@gmail.com',
          'x-admin-client': 'true',
        },
        body: JSON.stringify({ type: 'rider', email: cleanEmail }),
      });
      const data = await res.json();
      if (data.success) {
        soundAlerts.playRoleGrantedChime();
        setFeedback({ type: 'success', message: `Removed rider access for ${email}` });

        if (data.staffDirectory?.riders) {
          setRiders(data.staffDirectory.riders);
          try {
            localStorage.setItem(
              'g1mart_staff_directory',
              JSON.stringify(data.staffDirectory)
            );
          } catch {}
        }
      } else {
        setRiders(prevRiders);
        setFeedback({ type: 'error', message: data.error || 'Failed to remove rider' });
      }
    } catch (err: any) {
      setRiders(prevRiders);
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 lg:pb-8">
      {/* 1. Compact Brand Header (Mobile Optimized) */}
      <div className="bg-gradient-to-r from-[#1A2E1C] via-[#1B5E20] to-[#2E7D32] text-white rounded-3xl p-4 sm:p-5 border border-emerald-800/40 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center shrink-0 border border-white/20 transition-all cursor-pointer"
              title="Back to Admin Dashboard Home"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-emerald-200 bg-emerald-500/25 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Role Management
              </span>
              <span className="text-xs text-emerald-100/70 font-semibold hidden sm:inline">
                Access Security
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black tracking-tight truncate mt-0.5">
              Staff &amp; Role Access
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStaff}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Refresh staff directory"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      {/* 2. Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="truncate">{feedback.message}</span>
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

      {/* 3. Segmented Role Switcher Tabs (Admins vs Riders) */}
      <div className="p-1.5 bg-stone-100 rounded-2xl border border-stone-200/80 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveRoleTab('admins');
            setShowAddForm(false);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeRoleTab === 'admins'
              ? 'bg-[#1B5E20] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Store Administrators</span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeRoleTab === 'admins'
                ? 'bg-white/20 text-white'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {admins.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRoleTab('riders');
            setShowAddForm(false);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeRoleTab === 'riders'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery Fleet</span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeRoleTab === 'riders'
                ? 'bg-white/20 text-white'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {riders.length}
          </span>
        </button>
      </div>

      {/* 4. TAB CONTENT AREA */}
      {activeRoleTab === 'admins' ? (
        /* ======================== TAB 1: STORE ADMINISTRATORS ======================== */
        <div className="space-y-4">
          {/* Header & Toggle Button */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                Store Administrators ({admins.length})
              </h3>
              <p className="text-[11px] text-stone-500">
                Full console access to inventory, orders &amp; supermarket management
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                showAddForm
                  ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                  : 'bg-[#1B5E20] hover:bg-[#154a19] text-white active:scale-95'
              }`}
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{showAddForm ? 'Cancel' : '+ Add Admin'}</span>
            </button>
          </div>

          {/* Informative Security Banner explaining the Protected badge */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-950">
            <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <span className="font-bold text-emerald-900">What does the &quot;Protected&quot; badge mean?</span>
              <p className="text-emerald-800/80">
                The master administrator account (<code className="bg-emerald-100/70 text-emerald-900 font-mono px-1 py-0.5 rounded text-[10px]">sureshdega466@gmail.com</code>) is permanently <strong>Protected</strong> and cannot be removed. Previous admin registrations, new admin staff, and delivery riders can be removed at any time using the delete button.
              </p>
            </div>
          </div>

          {/* Collapsible Add Admin Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddAdmin}
              className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-emerald-500/40 shadow-md space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Grant New Admin Access
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-semibold">Immediate access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none"
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
                      className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !adminEmail.trim()}
                  className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{actionLoading ? 'Granting...' : 'Grant Admin Access'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Admin Directory List */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100 overflow-hidden">
            {admins.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">No Administrators Configured</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Grant admin privileges to team members above.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Add Administrator
                </button>
              </div>
            ) : (
              admins.map((admin) => {
                const cleanEmail = (admin.email || '').toLowerCase().trim();
                const currentLoggedEmail = (user?.email || '').toLowerCase().trim();
                const isSuresh = cleanEmail === 'sureshdega466@gmail.com';
                const isCurrentLoggedInUser =
                  Boolean(user?.email && currentLoggedEmail === cleanEmail);

                // Suresh Dega is permanently protected from deletion.
                // All other accounts (including previous registrations) can be removed with the delete button.
                const isProtected = isSuresh;
                const initials = (admin.name || admin.email || 'Admin')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={admin.id || admin.email}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentLoggedInUser ? 'bg-emerald-50/40' : 'hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          isSuresh
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-emerald-200'
                            : isCurrentLoggedInUser
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-stone-900 truncate">
                            {admin.name || (isSuresh ? 'Suresh Dega' : 'Store Administrator')}
                          </span>
                          {isCurrentLoggedInUser && (
                            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                              You (Active Session)
                            </span>
                          )}
                          {isSuresh ? (
                            <span className="text-[10px] font-black bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-2.5 py-0.5 rounded-full border border-emerald-500 shadow-2xs">
                              👑 Master Superadmin
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                              Store Admin
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate font-mono mt-0.5">
                          {admin.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      {!isProtected ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmin(admin.email)}
                          disabled={actionLoading}
                          className="w-8 h-8 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                          title={`Revoke Admin Access for ${admin.email}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span
                          className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs"
                          title="Protected Master Administrator (Cannot be removed)"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                          Protected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ======================== TAB 2: DELIVERY FLEET & RIDERS ======================== */
        <div className="space-y-4">
          {/* Header & Toggle Button */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                Delivery Fleet &amp; Riders ({riders.length})
              </h3>
              <p className="text-[11px] text-stone-500">
                Express delivery dispatch &amp; mobile delivery partner console
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                showAddForm
                  ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
              }`}
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
              <span>{showAddForm ? 'Cancel' : '+ Register Rider'}</span>
            </button>
          </div>

          {/* Collapsible Register Rider Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddRider}
              className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-amber-500/40 shadow-md space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Register New Delivery Partner
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-semibold">Instant fleet login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Rider Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={riderEmail}
                      onChange={(e) => setRiderEmail(e.target.value)}
                      placeholder="rider@gmail.com"
                      className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Mobile Number (For dispatch &amp; calls)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Vehicle Reg Number (Bike / Scooter)
                  </label>
                  <div className="relative">
                    <Bike className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={riderVehicle}
                      onChange={(e) => setRiderVehicle(e.target.value)}
                      placeholder="AP 26 EQ 4589"
                      className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !riderEmail.trim() || !riderName.trim()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{actionLoading ? 'Registering...' : 'Register Rider Partner'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Riders Directory List */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100 overflow-hidden">
            {riders.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">No Delivery Partners Added Yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Register delivery riders above to grant them access to the live delivery console.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Add First Rider
                </button>
              </div>
            ) : (
              riders.map((rider) => {
                const initials = (rider.name || 'Rider')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={rider.id || rider.email}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-stone-900 truncate">
                            {rider.name}
                          </span>
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Bike className="w-3 h-3 text-amber-600" />
                            <span>{rider.vehicleNumber || 'Bike Partner'}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ready for Dispatch
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5 font-mono">
                          {rider.email} {rider.phone ? `• ${rider.phone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {rider.phone && (
                        <a
                          href={`tel:${rider.phone.replace(/\D/g, '')}`}
                          className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors shadow-2xs"
                          title={`Call ${rider.name}`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveRider(rider.email)}
                        disabled={actionLoading}
                        className="w-8 h-8 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove Rider Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
