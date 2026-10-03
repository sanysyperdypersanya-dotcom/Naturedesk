import React from 'react';
import { Check, Clock, Eye, Sliders, X } from 'lucide-react';
import { NatureWallpaper } from '../types';
import { WALLPAPERS } from '../data/wallpapers';

interface WallpaperSwitcherProps {
  currentWallpaper: NatureWallpaper;
  onSelectWallpaper: (wp: NatureWallpaper) => void;
  autoCycleInterval: number; // in seconds, 0 = off
  setAutoCycleInterval: (val: number) => void;
  overlayOpacity: number;
  setOverlayOpacity: (val: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const WallpaperSwitcher: React.FC<WallpaperSwitcherProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  autoCycleInterval,
  setAutoCycleInterval,
  overlayOpacity,
  setOverlayOpacity,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-stone-900 border border-white/15 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white">Фони живої природи</h3>
            <p className="text-xs text-stone-400">Оберіть краєвид для натхнення та спокою</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallpaper Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 gap-3.5">
          {WALLPAPERS.map((wp) => {
            const isSelected = wp.id === currentWallpaper.id;
            return (
              <button
                key={wp.id}
                onClick={() => onSelectWallpaper(wp)}
                className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.01]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="aspect-video w-full overflow-hidden relative">
                  <img
                    src={wp.imageSrc}
                    alt={wp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-stone-950 p-1 rounded-full shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-2.5">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                    {wp.title}
                  </div>
                  <div className="text-[10px] text-stone-300 truncate">{wp.location}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls: Auto-Cycle & Dimming */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Auto-cycle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-stone-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Автозміна фонів:
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Вимкнено', val: 0 },
                { label: '1 хв', val: 60 },
                { label: '5 хв', val: 300 },
                { label: '15 хв', val: 900 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setAutoCycleInterval(opt.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    autoCycleInterval === opt.val
                      ? 'bg-amber-500 text-stone-950 font-medium'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimming */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Затемнення фону:
              </span>
              <span className="font-data-mono text-stone-400">{Math.round(overlayOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
