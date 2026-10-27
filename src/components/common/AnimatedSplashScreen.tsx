'use client';

import React, { useEffect, useState } from 'react';

/**
 * G1mart App Launch Splash Screen
 *
 * A lightweight, zero-dependency SVG + CSS animation that plays once per
 * browser/PWA session when the customer opens the app.
 *
 * 3-scene story (2.4 seconds total):
 *   Scene 1 (0.0–0.85s)  : G1mart bag fills with fresh groceries
 *   Scene 2 (0.85–1.75s) : Express delivery scooter zooms on road
 *   Scene 3 (1.75–2.4s)  : Doorstep handover → brand wordmark appears
 *
 * Rules:
 *   - Plays only once per session (sessionStorage flag)
 *   - ONLY touches this component; zero changes to any other file
 *   - No external libraries / images needed
 */

const SESSION_KEY = 'g1mart_splash_shown';

export default function AnimatedSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [scene, setScene] = useState<1 | 2 | 3>(1);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only show once per tab session
    if (typeof window === 'undefined') return;
    const already = sessionStorage.getItem(SESSION_KEY);
    if (already) return;

    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(true);

    const t1 = setTimeout(() => setScene(2), 900);
    const t2 = setTimeout(() => setScene(3), 1800);
    const t3 = setTimeout(() => setFadeOut(true), 2600);
    const t4 = setTimeout(() => setVisible(false), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      <style>{`
        /* ─── Scene 1: Bag + Groceries ─────────────────── */
        @keyframes g1BagIn {
          0%   { transform: scale(0.6) translateY(24px); opacity: 0; }
          65%  { transform: scale(1.06) translateY(-4px); opacity: 1; }
          82%  { transform: scale(0.97) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes g1DropMilk {
          0%   { transform: translateY(-60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes g1DropApple {
          0%   { transform: translateY(-50px) rotate(-20deg); opacity: 0; }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        @keyframes g1DropGreens {
          0%   { transform: translateY(-55px) rotate(18deg); opacity: 0; }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        @keyframes g1SealPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* ─── Scene 2: Scooter Transit ─────────────────── */
        @keyframes g1RoadScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }
        @keyframes g1SkyScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-320px); }
        }
        @keyframes g1WheelSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes g1BikeFloat {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-4px); }
        }
        @keyframes g1WindDash {
          0%   { transform: translateX(0); opacity: 0.7; }
          100% { transform: translateX(-36px); opacity: 0; }
        }

        /* ─── Scene 3: Doorstep ─────────────────────────── */
        @keyframes g1DoorSlide {
          0%   { transform: translateX(80px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes g1HandoverBag {
          0%   { transform: translateX(40px) scale(0.5); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes g1WordmarkIn {
          0%   { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes g1TaglineIn {
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes g1ConfettiPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .g1-bag-in    { animation: g1BagIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .g1-drop-milk { animation: g1DropMilk  0.42s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
        .g1-drop-apple{ animation: g1DropApple 0.42s 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        .g1-drop-green{ animation: g1DropGreens 0.42s 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .g1-seal-pop  { animation: g1SealPop 0.35s 0.58s cubic-bezier(0.175,0.885,0.32,1.275) both; }

        .g1-road-scroll{ animation: g1RoadScroll 0.38s linear infinite; }
        .g1-sky-scroll { animation: g1SkyScroll 2.2s linear infinite; }
        .g1-wheel-spin { transform-origin: 50% 50%; animation: g1WheelSpin 0.28s linear infinite; }
        .g1-bike-float { animation: g1BikeFloat 0.22s ease-in-out infinite alternate; }
        .g1-wind-dash  { animation: g1WindDash 0.32s linear infinite; }

        .g1-door-slide  { animation: g1DoorSlide   0.5s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
        .g1-bag-handover{ animation: g1HandoverBag  0.4s 0.35s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        .g1-wordmark-in { animation: g1WordmarkIn   0.45s 0.2s  cubic-bezier(0.22,1,0.36,1) both; }
        .g1-tagline-in  { animation: g1TaglineIn    0.4s  0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .g1-confetti-pop{ animation: g1ConfettiPop  0.4s  0.55s cubic-bezier(0.175,0.885,0.32,1.275) both; }
      `}</style>

      {/* ── SCENE 1: Packing ── */}
      {scene === 1 && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 24 }}>
          <svg
            viewBox="0 0 200 210"
            style={{ width: 200, height: 210, overflow: 'visible' }}
          >
            {/* Drop shadow */}
            <ellipse cx="100" cy="202" rx="55" ry="7" fill="#E8EAED" />

            {/* ── Bag back ── */}
            <g className="g1-bag-in">
              <path d="M 55 78 L 68 44 L 132 44 L 145 78 Z" fill="#145220" />
              {/* Handles */}
              <path d="M 82 44 C 82 26, 118 26, 118 44" fill="none" stroke="#0D3A16" strokeWidth="5.5" strokeLinecap="round" />
            </g>

            {/* ── Grocery items (sit between back & front layers) ── */}
            {/* Milk carton */}
            <g className="g1-drop-milk" style={{ transform:'translateY(-60px)', opacity:0 }}>
              <rect x="76" y="95" width="20" height="30" rx="3" fill="#2563EB" />
              <path d="M76 103 L96 103" stroke="#fff" strokeWidth="3" />
              <text x="86" y="120" fill="#fff" fontSize="7" fontWeight="800" textAnchor="middle" fontFamily="system-ui,sans-serif">MILK</text>
            </g>

            {/* Apple */}
            <g className="g1-drop-apple" style={{ transform:'translateY(-50px)', opacity:0 }}>
              <circle cx="105" cy="112" r="13" fill="#EF4444" />
              <ellipse cx="100" cy="105" rx="4" ry="6" fill="#F87171" opacity="0.5" />
              <path d="M105 99 C108 93, 116 95, 114 100 C111 104, 106 101, 105 99" fill="#16A34A" />
            </g>

            {/* Greens bundle */}
            <g className="g1-drop-green" style={{ transform:'translateY(-55px)', opacity:0 }}>
              <circle cx="128" cy="108" r="11" fill="#16A34A" />
              <circle cx="121" cy="112" r="9"  fill="#22C55E" />
              <circle cx="134" cy="112" r="8"  fill="#4ADE80" />
              <rect   x="126"  y="120" width="4" height="10" rx="2" fill="#92400E" />
            </g>

            {/* ── Bag front (occludes bottom half of groceries) ── */}
            <g className="g1-bag-in">
              {/* Body */}
              <path
                d="M 50 75 L 62 188 C 62 193, 65 196, 70 196 L 130 196 C 135 196, 138 193, 138 188 L 150 75 Z"
                fill="#1E6B2E"
              />
              {/* Subtle vertical fold lines */}
              <path d="M 62 188 L 74 75" stroke="#155223" strokeWidth="1.5" strokeOpacity="0.45" />
              <path d="M 138 188 L 126 75" stroke="#155223" strokeWidth="1.5" strokeOpacity="0.45" />
              {/* White label */}
              <rect x="82" y="136" width="36" height="18" rx="5" fill="#FFFFFF" />
              <text x="100" y="149" fill="#1E6B2E" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="0.5" fontFamily="system-ui,sans-serif">G1mart</text>
              {/* Gold verified seal */}
              <g className="g1-seal-pop" style={{ transform:'scale(0)', opacity:0, transformOrigin:'100px 174px' }}>
                <circle cx="100" cy="174" r="11" fill="#F59E0B" />
                <path d="M95.5 174 L99 177.5 L105.5 170.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          </svg>

          {/* Small caption */}
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#1A1A1A', letterSpacing:0.2 }}>
              Packing Fresh Groceries...
            </p>
          </div>
        </div>
      )}

      {/* ── SCENE 2: Scooter Express ── */}
      {scene === 2 && (
        <div style={{ width:'100%', maxWidth:360, position:'relative', overflow:'hidden' }}>
          {/* Minimal skyline parallax */}
          <div style={{ width:'100%', height:52, overflow:'hidden', position:'relative', opacity:0.18 }}>
            <svg
              viewBox="0 0 640 50"
              className="g1-sky-scroll"
              style={{ width:'200%', height:'100%', position:'absolute', top:0, left:0 }}
              fill="#1E6B2E"
            >
              <rect x="0"   y="24" width="18" height="26" />
              <rect x="24"  y="12" width="22" height="38" />
              <rect x="54"  y="32" width="16" height="18" />
              <rect x="78"  y="8"  width="26" height="42" />
              <rect x="114" y="20" width="18" height="30" />
              <rect x="142" y="34" width="14" height="16" />
              <rect x="168" y="14" width="20" height="36" />
              <rect x="200" y="28" width="16" height="22" />
              <rect x="230" y="6"  width="28" height="44" />
              <rect x="270" y="24" width="18" height="26" />
              <rect x="294" y="12" width="22" height="38" />
              <rect x="324" y="32" width="16" height="18" />
              <rect x="348" y="8"  width="26" height="42" />
              <rect x="384" y="20" width="18" height="30" />
              <rect x="412" y="34" width="14" height="16" />
              <rect x="438" y="14" width="20" height="36" />
              <rect x="470" y="28" width="16" height="22" />
              <rect x="500" y="6"  width="28" height="44" />
              <rect x="540" y="22" width="18" height="28" />
              <rect x="566" y="10" width="24" height="40" />
              <rect x="600" y="30" width="16" height="20" />
            </svg>
          </div>

          {/* Scooter stage */}
          <div style={{ position:'relative', width:'100%', height:130, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            {/* Speed lines */}
            <svg className="g1-wind-dash" style={{ position:'absolute', top:36, left:16, opacity:0 }} width="44" height="30">
              <line x1="0"  y1="8"  x2="40" y2="8"  stroke="#BBF7D0" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="6"  y1="16" x2="44" y2="16" stroke="#BBF7D0" strokeWidth="2" strokeLinecap="round" />
              <line x1="2"  y1="24" x2="38" y2="24" stroke="#BBF7D0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Scooter + Rider SVG */}
            <svg
              viewBox="0 0 220 120"
              className="g1-bike-float"
              style={{ width:220, height:120, overflow:'visible', position:'relative', zIndex:2 }}
            >
              {/* Rear wheel */}
              <g transform="translate(45,98)">
                <circle cx="0" cy="0" r="18" fill="#1F2937" />
                <circle cx="0" cy="0" r="11" fill="#6B7280" />
                <circle cx="0" cy="0" r="4"  fill="#374151" />
                <g className="g1-wheel-spin">
                  <line x1="-9" y1="0" x2="9" y2="0" stroke="#4B5563" strokeWidth="2.2" />
                  <line x1="0" y1="-9" x2="0" y2="9" stroke="#4B5563" strokeWidth="2.2" />
                </g>
              </g>

              {/* Front wheel */}
              <g transform="translate(168,98)">
                <circle cx="0" cy="0" r="18" fill="#1F2937" />
                <circle cx="0" cy="0" r="11" fill="#6B7280" />
                <circle cx="0" cy="0" r="4"  fill="#374151" />
                <g className="g1-wheel-spin">
                  <line x1="-9" y1="0" x2="9" y2="0" stroke="#4B5563" strokeWidth="2.2" />
                  <line x1="0" y1="-9" x2="0" y2="9" stroke="#4B5563" strokeWidth="2.2" />
                </g>
              </g>

              {/* Scooter chassis — G1 green */}
              <path d="M 45 98 L 78 96 L 100 84 L 130 78 L 168 98" fill="none" stroke="#1E6B2E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              {/* Fork / handlebar stem */}
              <path d="M 130 78 L 118 48 L 108 48" fill="none" stroke="#111827" strokeWidth="4.5" strokeLinecap="round" />
              {/* Seat platform */}
              <path d="M 78 96 L 92 68" fill="none" stroke="#155223" strokeWidth="6" strokeLinecap="round" />

              {/* G1 Delivery thermal backpack on luggage rack */}
              <rect x="36" y="56" width="28" height="36" rx="4" fill="#155223" />
              <rect x="39" y="59" width="22" height="11" rx="2" fill="#FFFFFF" />
              <text x="50" y="68" fill="#1E6B2E" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="system-ui,sans-serif">G1</text>

              {/* Headlight cone */}
              <polygon points="154,80 206,68 206,94 154,86" fill="rgba(253,224,71,0.3)" />

              {/* Rider jacket */}
              <path d="M 88 76 L 106 56 L 124 60" stroke="#10B981" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              {/* Rider arm */}
              <path d="M 106 56 L 126 50" stroke="#047857" strokeWidth="5" strokeLinecap="round" />
              {/* Helmet */}
              <circle cx="102" cy="40" r="13" fill="#1E6B2E" />
              {/* Visor strip */}
              <path d="M 105 38 L 116 40" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          {/* Animated road */}
          <div style={{ width:'100%', height:14, background:'#334155', overflow:'hidden', position:'relative' }}>
            <div
              className="g1-road-scroll"
              style={{
                position:'absolute', top:4, left:0,
                width:'200%', height:6,
                background:'repeating-linear-gradient(90deg,#FBBF24 0,#FBBF24 32px,transparent 32px,transparent 72px)',
              }}
            />
          </div>

          {/* Caption */}
          <div style={{ textAlign:'center', paddingTop:18 }}>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#1A1A1A', letterSpacing:0.2 }}>
              Express Rider on the Way 🛵
            </p>
          </div>
        </div>
      )}

      {/* ── SCENE 3: Doorstep + Wordmark ── */}
      {scene === 3 && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          {/* Confetti accents */}
          <div className="g1-confetti-pop" style={{ fontSize:22, letterSpacing:8, opacity:0 }}>
            ✨🎉✨
          </div>

          {/* Doorstep SVG */}
          <svg viewBox="0 0 260 140" style={{ width:260, height:140, overflow:'visible' }}>
            {/* Ground */}
            <rect x="0" y="125" width="260" height="15" fill="#F1F5F9" />

            {/* DOOR (slides in from right) */}
            <g className="g1-door-slide" style={{ transform:'translateX(80px)', opacity:0 }}>
              {/* Frame */}
              <rect x="172" y="22" width="72" height="104" rx="5" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2.5" />
              {/* Door panel */}
              <rect x="179" y="30" width="58" height="96" rx="3" fill="#475569" />
              {/* Knob */}
              <circle cx="186" cy="80" r="4" fill="#FBBF24" />
              {/* Welcome mat */}
              <rect x="160" y="118" width="80" height="10" rx="3" fill="#92400E" />
              <text x="200" y="126" fill="#FEF3C7" fontSize="6" fontWeight="700" textAnchor="middle" fontFamily="system-ui,sans-serif">WELCOME</text>
              {/* Plant */}
              <polygon points="246,124 256,124 254,108 248,108" fill="#B45309" />
              <circle cx="251" cy="102" r="9"  fill="#22C55E" />
              <circle cx="246" cy="97"  r="7"  fill="#16A34A" />
            </g>

            {/* LADY receiving (slides in from right) */}
            <g className="g1-door-slide" style={{ transform:'translateX(80px)', opacity:0 }}>
              {/* Hair */}
              <circle cx="192" cy="52" r="12" fill="#1E1B4B" />
              {/* Face */}
              <circle cx="192" cy="55" r="9"  fill="#FCD34D" />
              {/* Bindi */}
              <circle cx="190" cy="53" r="1.5" fill="#DC2626" />
              {/* Smile */}
              <path d="M188 58 Q192 62 196 58" fill="none" stroke="#78350F" strokeWidth="1.3" strokeLinecap="round" />
              {/* Kurti / dress */}
              <path d="M184 64 L200 64 L206 124 L178 124 Z" fill="#F43F5E" />
              {/* Welcome arm */}
              <path d="M184 72 L168 84" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* DELIVERY RIDER (left side, static) */}
            {/* Pants */}
            <rect x="72" y="82" width="7" height="42" rx="2.5" fill="#1E293B" />
            <rect x="82" y="82" width="7" height="42" rx="2.5" fill="#1E293B" />
            {/* Jacket */}
            <rect x="70" y="56" width="22" height="30" rx="3.5" fill="#16A34A" />
            {/* Head/helmet */}
            <circle cx="81" cy="44" r="11" fill="#1B5E20" />
            <path d="M83 42 L92 43" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
            {/* Arm handing bag */}
            <path d="M87 66 L130 78" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" />

            {/* HANDOVER BAG */}
            <g className="g1-bag-handover" style={{ transform:'translateX(40px) scale(0.5)', opacity:0 }}>
              <rect x="118" y="66" width="24" height="28" rx="3" fill="#1B5E20" />
              <path d="M124 66 C124 59, 136 59, 136 66" fill="none" stroke="#0D3A16" strokeWidth="2.2" />
              <text x="130" y="83" fill="#fff" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="system-ui,sans-serif">G1</text>
              <circle cx="130" cy="89" r="3" fill="#FBBF24" />
            </g>
          </svg>

          {/* G1mart Wordmark */}
          <div className="g1-wordmark-in" style={{ textAlign:'center', opacity:0 }}>
            <p style={{ margin:0, fontSize:28, fontWeight:900, color:'#1E6B2E', letterSpacing:1, fontFamily:'system-ui,sans-serif' }}>
              G1mart
            </p>
          </div>

          {/* Tagline */}
          <div className="g1-tagline-in" style={{ textAlign:'center', opacity:0 }}>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#5F6368', letterSpacing:0.3, fontFamily:'system-ui,sans-serif' }}>
              Fresh groceries, at your doorstep
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
