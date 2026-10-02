import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Bell,
  ShoppingCart,
  ArrowLeft,
  Store,
  Check,
  Search,
  Heart,
  Package,
  Users,
  ShieldCheck,
  Bike,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NELLORE_AREAS } from '../../services/deliveryZoneService';
import { INITIAL_CATEGORIES } from '../../data/mockData';

export const Header: React.FC = () => {
  const {
    screen,
    goBack,
    canGoBack,
    navigate,
    currentLocation,
    setCurrentLocation,
    cartItemCount,
    cartGrandTotal,
    unreadNotificationCount,
    addresses,
    selectedAddress,
    selectAddress,
    wishlistIds,
    role,
    setRole,
    selectedCategoryId,
    setSelectedCategoryId,
    isMobileFrame,
    currentDeliveryZone,
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Shorten location for mobile top bar
  const displayLocation = selectedAddress
    ? `${selectedAddress.houseFlat}, ${selectedAddress.streetArea}`
    : currentLocation.split(',')[0];

  const isSpecialFullScreen =
    screen === 'splash' || screen === 'onboarding' || screen === 'login' || screen === 'otp';

  if (isSpecialFullScreen) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate('search');
    }
  };

  const handleCategoryNav = (catId: string) => {
    setSelectedCategoryId(catId);
    navigate('category', { categoryId: catId });
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP & LAPTOP HEADER (shown on lg+ viewports >= 1024px)                */}
      {/* ========================================================================= */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-stone-200/90 shadow-2xs select-none">
        {/* Top Tier: Utility Bar for Role Switcher and Delivery Guarantee */}
          <div className="bg-stone-900 text-stone-300 text-[11px] px-6 py-1.5 flex items-center justify-between">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Fast {currentDeliveryZone?.estimatedDeliveryTimeText || '30-60 Min'} Delivery across {currentDeliveryZone?.name || 'Nellore'}</span>
                </span>
                <span className="text-stone-600">|</span>
                <span className="text-stone-300">Free delivery on orders above ₹{currentDeliveryZone?.freeDeliveryThreshold || 499}</span>
              </div>

              {/* Role Switcher in Desktop Top Bar */}
              <div className="flex items-center gap-2">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">
                  Viewing Mode:
                </span>
                <div className="flex items-center bg-stone-800 rounded-md p-0.5 border border-stone-700">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      role === 'customer'
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      role === 'admin'
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('delivery_partner')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      role === 'delivery_partner'
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-3 h-3" />
                    <span>Rider</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Header Tier */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
            {/* Zone 1: G1 Mart Logo & Nellore Delivery Location */}
            <div className="flex items-center gap-5 shrink-0">
              {/* Logo */}
              <button
                type="button"
                onClick={() => navigate('home')}
                className="flex items-center shrink-0 group transition-transform active:scale-98"
                aria-label="G1 Mart Home"
              >
                <img
                  src="/logo.png"
                  alt="G1 Mart"
                  className="h-8 xl:h-9 w-auto object-contain transition-all"
                />
              </button>

              {/* Deliver to Selector Button */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#2E7D32] hover:bg-stone-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none flex items-center gap-1">
                    Deliver to Nellore
                    <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-[#2E7D32] transition-colors" />
                  </span>
                  <span className="text-xs font-bold text-[#212121] truncate max-w-[150px] xl:max-w-[200px] mt-0.5">
                    {displayLocation}
                  </span>
                </div>
              </button>
            </div>

          {/* Zone 2: Wide Desktop Search Bar */}
          <div className="flex-1 max-w-2xl min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search fresh vegetables, dairy, atta, snacks, and 2,000+ groceries..."
                className="w-full h-11 pl-11 pr-20 bg-stone-50 hover:bg-white focus:bg-white rounded-xl border border-stone-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 text-xs text-stone-800 placeholder-stone-400 transition-all outline-hidden font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchInput ? (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Zone 3: Desktop Account Shortcuts & Cart Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Orders shortcut */}
            <button
              type="button"
              onClick={() => navigate('my_orders')}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                screen === 'my_orders'
                  ? 'text-[#2E7D32] bg-[#2E7D32]/5'
                  : 'text-stone-700 hover:text-[#2E7D32] hover:bg-stone-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </button>

            {/* Wishlist shortcut */}
            <button
              type="button"
              onClick={() => navigate('wishlist')}
              className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                screen === 'wishlist'
                  ? 'text-[#2E7D32] bg-[#2E7D32]/5'
                  : 'text-stone-700 hover:text-[#2E7D32] hover:bg-stone-50'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
              {wishlistIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Notifications shortcut */}
            <button
              type="button"
              onClick={() => navigate('notifications')}
              className="relative p-2 rounded-xl text-stone-700 hover:text-[#2E7D32] hover:bg-stone-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF9800] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Desktop Cart CTA Button */}
            <button
              type="button"
              onClick={() => navigate('cart')}
              className="flex items-center gap-2.5 h-11 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-xs hover:shadow-md transition-all active:scale-98"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF9800] text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/80 font-semibold leading-none">
                  {cartItemCount > 0 ? `${cartItemCount} items` : 'My Cart'}
                </span>
                <span className="text-xs font-black tabular-nums mt-0.5">
                  ₹{cartGrandTotal}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="border-t border-stone-100 bg-white/95 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => navigate('category', { categoryId: INITIAL_CATEGORIES[0].id })}
                className="px-2.5 py-1 rounded-lg font-bold text-stone-800 hover:text-[#2E7D32] hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              >
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
              <div className="w-px h-4 bg-stone-200 mx-1" />

              {INITIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryId === cat.id && screen === 'category';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryNav(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2E7D32] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-[#2E7D32] hover:bg-stone-50'
                    }`}
                  >
                    <span>
                      {cat.id === 'fruits-vegetables' && '🥦'}
                      {cat.id === 'dairy-bakery' && '🥛'}
                      {cat.id === 'rice-dal-atta' && '🌾'}
                      {cat.id === 'snacks' && '🍪'}
                      {cat.id === 'beverages' && '☕'}
                      {cat.id === 'personal-care' && '✨'}
                      {cat.id === 'household' && '🏠'}
                      {cat.id === 'baby-care' && '👶'}
                    </span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center gap-4 text-stone-500 font-medium shrink-0 ml-4">
              <span className="flex items-center gap-1 text-[#2E7D32] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Best Price Guarantee</span>
              </span>
              <span>·</span>
              <span>100% Contactless COD</span>
            </div>
            </div>
          </div>
        </header>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET QUICK-COMMERCE HEADER (Blinkit-style, < lg)               */}
      {/* ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200/90 shadow-2xs transition-all select-none">
        {/* Top Bar: Brand, Express Delivery Tag & Cart */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 pb-2 flex items-center justify-between gap-2">
          {/* Left: Back button or G1 Mart Brand Logo */}
          <div className="flex items-center gap-2 min-w-0">
            {canGoBack ? (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go back"
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 active:scale-95 transition-all shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}

            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center shrink-0 group text-left transition-transform active:scale-98"
              aria-label="G1 Mart Home"
            >
              <img
                src="/logo.png"
                alt="G1 Mart"
                className="h-7 w-auto object-contain"
              />
            </button>

            {/* Delivery Address Pill */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex flex-col text-left min-w-0 pl-1 py-0.5 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] font-black text-[#137333] uppercase tracking-tight flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  15-30 MINS
                </span>
              </div>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-xs font-bold text-stone-800 truncate max-w-[125px] sm:max-w-[200px] leading-none">
                  {displayLocation}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
              </div>
            </button>
          </div>

          {/* Right: Role Switcher, Notifications & Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Role Switcher Pill for Mobile / Tablet */}
            <button
              type="button"
              onClick={() => setRole(role === 'customer' ? 'admin' : role === 'admin' ? 'delivery_partner' : 'customer')}
              className="flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[10px] font-bold transition-all active:scale-95 border border-stone-200/60"
              title={`Viewing Mode: ${role}. Tap to switch.`}
            >
              {role === 'customer' && <Users className="w-3.5 h-3.5 text-[#2E7D32]" />}
              {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />}
              {role === 'delivery_partner' && <Bike className="w-3.5 h-3.5 text-[#2E7D32]" />}
              <span className="hidden sm:inline capitalize">{role === 'delivery_partner' ? 'Rider' : role}</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => navigate('notifications')}
              className="relative w-8 h-8 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#FF9800] text-black text-[8px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              aria-label="View Cart"
              onClick={() => navigate('cart')}
              className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-xs transition-all active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {cartItemCount > 0 ? (
                <span className="text-xs font-extrabold tabular-nums">
                  {cartItemCount}
                </span>
              ) : (
                <span className="text-[11px] font-bold">Cart</span>
              )}
            </button>
          </div>
        </div>

        {/* Quick-Commerce Search Trigger Row (Always Accessible) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-2.5 pt-0.5">
          <button
            type="button"
            onClick={() => navigate('search')}
            className="w-full h-10 px-3 bg-stone-100/90 hover:bg-stone-100 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs transition-all text-left group shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-stone-500 font-medium truncate">
                Search &quot;milk, bread, vegetables, atta...&quot;
              </span>
            </div>
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs shrink-0">
              FIND
            </span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Location Selector Modal (Centered on desktop, Sheet on mobile)             */}
      {/* ========================================================================= */}
      {showLocationModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for Mobile */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#212121]">
                  Choose Delivery Location
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Serving Nellore City (30-60m) &amp; villages up to 30 km (~2 hrs)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLocationModal(false);
                  navigate('address_list');
                }}
                className="text-xs font-semibold text-[#2E7D32] hover:underline"
              >
                Manage All
              </button>
            </div>

            {/* Saved Addresses List */}
            {addresses.length > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Saved Addresses
                </span>
                <div className="space-y-2">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          selectAddress(addr.id);
                          setShowLocationModal(false);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#2E7D32] bg-[#2E7D32]/5'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                              isSelected
                                ? 'bg-[#2E7D32] text-white'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#212121]">
                                {addr.type}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] text-stone-500">· Default</span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                              {addr.houseFlat}, {addr.streetArea}
                            </p>
                            <p className="text-[11px] text-stone-400">
                              {addr.city} - {addr.pincode}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Nellore Areas */}
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Quick Select Nellore Hubs &amp; Areas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {NELLORE_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      setCurrentLocation(area);
                      setShowLocationModal(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-stone-100 text-xs font-medium text-stone-700 flex items-center gap-2 transition-colors border border-transparent hover:border-stone-200"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span className="truncate">{area}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Address CTA */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowLocationModal(false);
                  navigate('add_address');
                }}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5 text-xs font-bold transition-colors text-center"
              >
                + Add New Address
              </button>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
