import React from 'react';
import { BackgroundThemeId, BackgroundContrast } from '../types/theme';

interface CampusBackgroundProps {
  themeId: BackgroundThemeId;
  contrast: BackgroundContrast;
}

export const CampusBackground: React.FC<CampusBackgroundProps> = ({
  themeId,
  contrast,
}) => {
  // Scrim opacity mapping based on contrast preference
  const contrastOverlay = {
    subtle: 'bg-slate-900/40 backdrop-blur-[1px]',
    balanced: 'bg-slate-950/60 backdrop-blur-[2px]',
    high: 'bg-slate-950/80 backdrop-blur-[4px]',
  }[contrast];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700 select-none"
      aria-hidden="true"
    >
      {/* 0. RED NOIR REFERENCE DESIGN - ENHANCED BRIGHT & RADIANT ILLUMINATION */}
      {themeId === 'red-noir' && (
        <div className="absolute inset-0 bg-[#0c0205]">
          {/* Luminous Crimson & Deep Ruby Radiant Gradient (Significantly Brighter) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#3b0914] via-[#1d050a] to-[#0a0204]" />

          {/* Top Crown Volumetric Ambient Floodlight */}
          <div className="absolute -top-40 inset-x-0 h-[550px] bg-gradient-to-b from-[#ef233c]/35 via-rose-600/20 to-transparent blur-[90px] pointer-events-none" />

          {/* Primary Center Radiant Ruby Energy Sphere */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[850px] bg-gradient-to-tr from-red-600/30 via-[#ef233c]/25 to-amber-500/15 rounded-full blur-[130px] pointer-events-none" />

          {/* Left Upper Radiant Aura */}
          <div className="absolute top-1/6 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-rose-500/30 via-[#ef233c]/20 to-transparent rounded-full blur-[110px] pointer-events-none" />

          {/* Right Floating Ambient Halo */}
          <div className="absolute top-1/2 -right-32 w-[700px] h-[700px] bg-gradient-to-bl from-red-500/30 via-rose-600/20 to-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Bottom Horizon Ambient Warmth */}
          <div className="absolute -bottom-32 inset-x-0 h-[450px] bg-gradient-to-t from-[#ef233c]/25 via-red-950/40 to-transparent blur-[100px] pointer-events-none" />

          {/* Sparkling Stardust Nebula */}
          <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_45s_linear_infinite]" />
          <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_70s_linear_infinite]" />

          {/* Crisp, Clearly Visible Cyber-Collegiate Precision 40px Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_60%,transparent_95%)]" />

          {/* Secondary 200px Accent Grid with Crimson Glow Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(239,35,60,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(239,35,60,0.12)_1px,transparent_1px)] bg-[size:200px_200px] [mask-image:radial-gradient(circle_at_center,black_50%,transparent_90%)]" />

          {/* Floating Luminous Optical Flares */}
          <div className="absolute top-28 left-1/4 w-3 h-3 bg-white rounded-full shadow-[0_0_20px_#ef233c,0_0_40px_#fff] animate-pulse" />
          <div className="absolute top-72 right-1/4 w-2.5 h-2.5 bg-rose-300 rounded-full shadow-[0_0_16px_#ef233c,0_0_30px_#ff4d6d] animate-pulse delay-700" />
          <div className="absolute bottom-48 left-1/3 w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_14px_#fbbf24] animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/6 w-3 h-3 bg-sky-200 rounded-full shadow-[0_0_16px_#38bdf8] animate-pulse delay-500" />
        </div>
      )}

      {/* 1. CAMPUS EXTERIOR (BRIGHTENED PHOTOGRAPHIC) */}
      {themeId === 'campus-exterior' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-100 transition-transform duration-1000 ease-out"
            style={{ backgroundImage: `url('/assets/srm_campus_bg.jpg')` }}
          />
          {/* Lighter scrim for brilliant architectural brightness */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/35 to-slate-900/50" />
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#c5a059]/25 via-transparent to-transparent" />
        </div>
      )}

      {/* 2. GRAND ATRIUM (INTERIOR) */}
      {themeId === 'campus-atrium' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-102 transition-transform duration-1000 ease-out"
            style={{ backgroundImage: `url('/assets/srm_hall_bg.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001733]/85 via-slate-950/70 to-slate-950/90" />
          <div className={`absolute inset-0 ${contrastOverlay} transition-colors duration-500`} />
          <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-[#000d1e] to-transparent" />
        </div>
      )}

      {/* 3. OXFORD NAVY & GOLD (HERITAGE) */}
      {themeId === 'oxford-navy' && (
        <div className="absolute inset-0 bg-[#00142e]">
          {/* Academic radial illumination */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,160,89,0.18),rgba(0,33,71,0.95)_60%,rgba(0,15,35,1)_100%)]" />
          
          {/* Golden ambient accent glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#c5a059]/10 blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] rounded-full bg-[#002147]/80 blur-3xl" />

          {/* SVG Collegiate Crest & Watermark Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.035]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="srm-crest-grid"
                width="160"
                height="160"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="80" cy="80" r="42" fill="none" stroke="#c5a059" strokeWidth="1" strokeDasharray="3 3" />
                <polygon points="80,48 108,96 52,96" fill="none" stroke="#c5a059" strokeWidth="0.8" />
                <polygon points="80,112 52,64 108,64" fill="none" stroke="#c5a059" strokeWidth="0.8" />
                <circle cx="80" cy="80" r="12" fill="none" stroke="#ffffff" strokeWidth="0.75" />
                <circle cx="80" cy="80" r="2" fill="#c5a059" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#srm-crest-grid)" />
          </svg>
        </div>
      )}

      {/* 4. ARCHITECTURAL BLUEPRINT (ENGINEERING & TECH) */}
      {themeId === 'architectural-blueprint' && (
        <div className="absolute inset-0 bg-[#021329]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,46,84,0.7)_0%,rgba(2,19,41,0.98)_85%)]" />

          {/* Precision technical drafting grid */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="blueprint-small-grid"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
              <pattern
                id="blueprint-large-grid"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <rect width="120" height="120" fill="url(#blueprint-small-grid)" />
                <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#0284c7" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="2" fill="#38bdf8" />
                <circle cx="120" cy="0" r="2" fill="#38bdf8" />
                <circle cx="0" cy="120" r="2" fill="#38bdf8" />
                <circle cx="120" cy="120" r="2" fill="#38bdf8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint-large-grid)" />
          </svg>

          {/* STEM Coordinates watermark decoration */}
          <div className="absolute bottom-6 right-6 font-mono text-[11px] text-sky-400/30 tracking-widest text-right hidden sm:block">
            SRM-IST-TRCH // LAT 10.8271° N · LON 78.6890° E
            <br />
            INSTITUTIONAL GATEWAY SYS.VER 4.2 // BLUEPRINT MODE
          </div>
        </div>
      )}

      {/* 5. PEARL SLATE (MINIMAL DAYLIGHT) */}
      {themeId === 'pearl-slate' && (
        <div className="absolute inset-0 bg-slate-50">
          {/* Subtle daylight gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100" />
          
          {/* Micro dot grid */}
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="pearl-dots"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="1" fill="#94a3b8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pearl-dots)" />
          </svg>
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-100/30 to-transparent" />
        </div>
      )}
    </div>
  );
};
