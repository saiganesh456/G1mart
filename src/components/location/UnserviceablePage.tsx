'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  LifeBuoy,
  Info,
  Instagram,
  User,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onChangeLocation: () => void;
}

/**
 * Full-screen Unserviceable Area Screen
 * Modelled on reference layout (unserviceable-page.png) using G1 Mart original artwork & green palette.
 */
export default function UnserviceablePage({ onChangeLocation }: Props) {
  const { currentLocation } = useLocation();
  const { isLoggedIn, user } = useAuth();

  const detectedAddress =
    currentLocation.formattedAddress ||
    `${currentLocation.area || 'Current Area'}, ${currentLocation.pincode || 'Andhra Pradesh'}`;

  return (
    <div className="min-h-screen bg-[#FBFDFB] flex flex-col justify-between text-stone-900 px-4 sm:px-6 pt-5 pb-8 max-w-lg mx-auto select-none">
      {/* ── Top Header Bar ── */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-stone-500 tracking-tight">
            We&apos;re not in your area yet
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
            Unserviceable area
          </h1>
          <button
            type="button"
            onClick={onChangeLocation}
            className="flex items-center gap-1 text-xs text-stone-600 font-bold hover:text-[#1B5E20] transition-colors mt-0.5 group cursor-pointer text-left"
          >
            <MapPin className="w-3 h-3 text-[#1B5E20] shrink-0" />
            <span className="truncate max-w-[240px] sm:max-w-xs">{detectedAddress}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1B5E20] transition-colors shrink-0" />
          </button>
        </div>

        {/* Profile Avatar / Link */}
        <Link
          href={isLoggedIn ? '/account' : '/login'}
          className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shrink-0 border border-stone-200/60"
          aria-label="Profile"
        >
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt="Profile"
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-stone-600" />
          )}
        </Link>
      </header>

      {/* ── Center Content: Illustration & Apology Message ── */}
      <div className="my-auto py-6 flex flex-col items-center text-center space-y-5">
        {/* ORIGINAL Closed Store Illustration (G1 Mart Green Palette) */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] mx-auto">
          <svg
            viewBox="0 0 320 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-sm"
          >
            {/* Soft background glow */}
            <circle cx="160" cy="110" r="90" fill="#E8F5E9" fillOpacity="0.7" />
            <circle cx="210" cy="80" r="25" fill="#FFF9C4" fillOpacity="0.5" />

            {/* Distant Trees/Foliage */}
            <path
              d="M40 180 Q60 140 80 180 Z"
              fill="#A5D6A7"
              fillOpacity="0.6"
            />
            <path
              d="M240 180 Q260 135 280 180 Z"
              fill="#A5D6A7"
              fillOpacity="0.6"
            />

            {/* Ground shadow/platform */}
            <ellipse cx="160" cy="190" rx="130" ry="12" fill="#E0E0E0" />

            {/* Store Main Structure */}
            <rect x="70" y="100" width="180" height="90" rx="8" fill="#F1F8E9" stroke="#81C784" strokeWidth="2.5" />

            {/* Brick pattern lines */}
            <line x1="70" y1="130" x2="250" y2="130" stroke="#C8E6C9" strokeWidth="1.5" />
            <line x1="70" y1="160" x2="250" y2="160" stroke="#C8E6C9" strokeWidth="1.5" />

            {/* Store Windows (Shutters Down) */}
            <rect x="85" y="115" width="40" height="45" rx="4" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="2" />
            <line x1="85" y1="130" x2="125" y2="130" stroke="#90A4AE" strokeWidth="1" />
            <line x1="85" y1="145" x2="125" y2="145" stroke="#90A4AE" strokeWidth="1" />

            <rect x="195" y="115" width="40" height="45" rx="4" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="2" />
            <line x1="195" y1="130" x2="235" y2="130" stroke="#90A4AE" strokeWidth="1" />
            <line x1="195" y1="145" x2="235" y2="145" stroke="#90A4AE" strokeWidth="1" />

            {/* Store Door (Closed Roll-down Gate) */}
            <rect x="138" y="125" width="44" height="65" rx="3" fill="#B0BEC5" stroke="#78909C" strokeWidth="2" />
            <line x1="138" y1="138" x2="182" y2="138" stroke="#78909C" strokeWidth="1" />
            <line x1="138" y1="151" x2="182" y2="151" stroke="#78909C" strokeWidth="1" />
            <line x1="138" y1="164" x2="182" y2="164" stroke="#78909C" strokeWidth="1" />
            <line x1="138" y1="177" x2="182" y2="177" stroke="#78909C" strokeWidth="1" />

            {/* Padlock on door */}
            <rect x="156" y="172" width="8" height="7" rx="1.5" fill="#F57C00" />
            <path d="M158 172 V169 A2 2 0 0 1 162 169 V172" stroke="#F57C00" strokeWidth="1.5" fill="none" />

            {/* Green & White Striped Canopy / Awning */}
            <path
              d="M55 102 L65 78 H255 L265 102 Z"
              fill="#1B5E20"
              stroke="#0D3B11"
              strokeWidth="2"
            />
            {/* White stripes */}
            <path d="M85 78 L78 102 H102 L106 78 Z" fill="#FFFFFF" />
            <path d="M136 78 L131 102 H155 L157 78 Z" fill="#FFFFFF" />
            <path d="M187 78 L185 102 H209 L208 78 Z" fill="#FFFFFF" />
            <path d="M238 78 L238 102 H262 L254 78 Z" fill="#FFFFFF" />

            {/* Awning Scallops */}
            <path
              d="M55 102 Q65 110 75 102 Q85 110 95 102 Q105 110 115 102 Q125 110 135 102 Q145 110 155 102 Q165 110 175 102 Q185 110 195 102 Q205 110 215 102 Q225 110 235 102 Q245 110 255 102 Q265 110 265 102"
              fill="#1B5E20"
            />

            {/* Store Closed Signboard */}
            <rect x="110" y="46" width="100" height="26" rx="6" fill="#EF5350" stroke="#C62828" strokeWidth="2" />
            <text x="160" y="63" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Store closed
            </text>

            {/* Little potted plants on sides */}
            <path d="M50 188 H62 L59 176 H53 Z" fill="#8D6E63" />
            <circle cx="56" cy="172" r="7" fill="#4CAF50" />

            <path d="M258 188 H270 L267 176 H261 Z" fill="#8D6E63" />
            <circle cx="264" cy="172" r="7" fill="#4CAF50" />
          </svg>
        </div>

        {/* Text Copy matching reference screenshot */}
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Hello!
          </h2>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#1B5E20] tracking-tight">
            It&apos;s not you, it&apos;s us.
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-stone-700 leading-snug pt-1">
            We are not serving this area at the moment.
          </p>
          <p className="text-xs sm:text-sm font-bold text-stone-600">
            Sorry for the inconvenience 🥺
          </p>
        </div>
      </div>

      {/* ── Bottom Section: Action Rows & Change Location Button ── */}
      <div className="space-y-3 shrink-0 pt-2">
        {/* Navigation Rows */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100 overflow-hidden">
          {/* Row 1: Need help with previous orders */}
          <Link
            href="/orders"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-emerald-50/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-[#1B5E20] flex items-center justify-center transition-colors">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                Need help with your previous orders?
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
          </Link>

          {/* Row 2: About us */}
          <Link
            href="/help"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-emerald-50/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-[#1B5E20] flex items-center justify-center transition-colors">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                About us
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
          </Link>

          {/* Row 3: Follow us on Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-emerald-50/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-[#1B5E20] flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                Follow us on Instagram for updates
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
          </a>
        </div>

        {/* Change Location Button */}
        <button
          type="button"
          onClick={onChangeLocation}
          className="w-full py-4 px-4 rounded-2xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <MapPin className="w-4 h-4 fill-white" />
          <span>Change location</span>
        </button>
      </div>
    </div>
  );
}
