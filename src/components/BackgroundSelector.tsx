import React, { useState } from 'react';
import { Palette, Check, Sparkles, Sliders, X, Eye } from 'lucide-react';
import { BackgroundThemeId, BackgroundContrast, BACKGROUND_THEMES } from '../types/theme';

interface BackgroundSelectorProps {
  currentTheme: BackgroundThemeId;
  currentContrast: BackgroundContrast;
  onSelectTheme: (themeId: BackgroundThemeId) => void;
  onSelectContrast: (contrast: BackgroundContrast) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  currentTheme,
  currentContrast,
  onSelectTheme,
  onSelectContrast,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };

  const activeThemeMeta = BACKGROUND_THEMES.find((t) => t.id === currentTheme) || BACKGROUND_THEMES[0];

  return (
    <>
      {/* Floating Background Design Control Trigger */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => handleOpen(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-white/95 hover:bg-white text-slate-800 border border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer backdrop-blur-md"
          title="Customize Portal Background Design"
          aria-label="Change Background Design"
        >
          <div className="w-5 h-5 rounded-md bg-[#002147] text-[#c5a059] flex items-center justify-center text-[10px] font-serif font-bold">
            <Palette className="w-3 h-3 text-[#c5a059]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-semibold text-slate-800 leading-tight">
              {activeThemeMeta.name}
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">
              Atmosphere & Background
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono sm:inline hidden">
            Change
          </span>
        </button>
      </div>

      {/* Modal Backdrop & Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => handleOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-[#002147] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-[#c5a059] flex items-center justify-center text-[#c5a059]">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white tracking-wide">
                    SRM IST Campus Atmosphere & Background Designs
                  </h3>
                  <p className="text-xs text-slate-300">
                    Select your preferred institutional theme for the portal experience
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Theme Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Atmospheric Theme ({BACKGROUND_THEMES.length} Designs)
                  </span>
                  <span className="text-xs text-slate-500">
                    Saved automatically to your device
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BACKGROUND_THEMES.map((theme) => {
                    const isSelected = theme.id === currentTheme;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => onSelectTheme(theme.id)}
                        className={`group relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#002147] bg-blue-50/50 ring-2 ring-[#002147]/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Visual Preview Box */}
                        <div className="w-full h-24 rounded-lg overflow-hidden relative mb-2.5 border border-slate-200/80 bg-slate-100">
                          {theme.thumbnailUrl ? (
                            <img
                              src={theme.thumbnailUrl}
                              alt={theme.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${theme.previewGradient} flex items-center justify-center relative overflow-hidden`}>
                              {theme.id === 'red-noir' && (
                                <div className="text-center relative z-10">
                                  <div className="w-4 h-4 bg-[#ef233c] rounded-xs rotate-45 mx-auto mb-1.5 shadow-[0_0_15px_rgba(239,35,60,0.8)] animate-pulse"></div>
                                  <div className="font-manrope text-white font-bold text-xs tracking-wider">
                                    RED NOIR
                                  </div>
                                </div>
                              )}
                              {theme.id === 'oxford-navy' && (
                                <div className="text-[#c5a059] font-serif text-lg tracking-wider font-bold opacity-80">
                                  SRM IST
                                </div>
                              )}
                              {theme.id === 'architectural-blueprint' && (
                                <div className="font-mono text-sky-400 text-xs tracking-widest opacity-80">
                                  SYS // GRID
                                </div>
                              )}
                              {theme.id === 'pearl-slate' && (
                                <div className="font-serif text-[#002147] text-xs font-semibold">
                                  CLASSIC SLATE
                                </div>
                              )}
                            </div>
                          )}

                          {/* Category Badge & Active Check */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                            {theme.category}
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#002147] text-[#c5a059] border border-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Title and Tagline */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-serif font-bold text-slate-900 group-hover:text-[#002147] transition-colors">
                              {theme.name}
                            </span>
                            {isSelected && (
                              <span className="text-[11px] font-semibold text-[#002147]">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {theme.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrim Contrast Tuning */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Text Legibility & Contrast Scrim
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Adjust background overlay depth to optimize card contrast and readability.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(['subtle', 'balanced', 'high'] as BackgroundContrast[]).map((c) => {
                    const isActive = currentContrast === c;
                    const labels = {
                      subtle: 'Subtle (More Photo)',
                      balanced: 'Balanced (Standard)',
                      high: 'High Focus (Maximum)',
                    };
                    return (
                      <button
                        key={c}
                        onClick={() => onSelectContrast(c)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#002147] bg-[#002147] text-white shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                        }`}
                      >
                        {labels[c]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">
                SRM Institute of Science and Technology · Tiruchirappalli
              </span>
              <button
                onClick={() => handleOpen(false)}
                className="px-4 py-2 font-semibold text-white bg-[#002147] hover:bg-[#002147]/90 rounded-lg transition-colors cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
