import React, { useState } from 'react';
import { Check, Clock, Sliders, X, Shuffle, Sparkles, Move } from 'lucide-react';
import { NatureWallpaper } from '../types';
import { WALLPAPERS } from '../data/wallpapers';

interface WallpaperSwitcherProps {
  currentWallpaper: NatureWallpaper;
  onSelectWallpaper: (wp: NatureWallpaper) => void;
  autoCycleInterval: number; // in seconds, 0 = off
  setAutoCycleInterval: (val: number) => void;
  overlayOpacity: number;
  setOverlayOpacity: (val: number) => void;
  isWallpaperMotionEnabled?: boolean;
  setIsWallpaperMotionEnabled?: (val: boolean) => void;
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
  isWallpaperMotionEnabled = true,
  setIsWallpaperMotionEnabled,
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredWallpapers =
    selectedCategory === 'all'
      ? WALLPAPERS
      : WALLPAPERS.filter((w) => w.category === selectedCategory);

  const handleRandomWallpaper = () => {
    const others = WALLPAPERS.filter((w) => w.id !== currentWallpaper.id);
    const pick = others[Math.floor(Math.random() * others.length)] || WALLPAPERS[0];
    onSelectWallpaper(pick);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-stone-900 border border-white/15 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Колекція фонів у стилі Brave ({WALLPAPERS.length} краєвидів)
            </h3>
            <p className="text-xs text-stone-400">
              Високодеталізовані панорами природи, космосу та гір із живою кінематографічною анімацією
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomWallpaper}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/35 text-xs font-medium transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Випадковий фон</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `Усі фони (${WALLPAPERS.length})` },
            { id: 'night', label: 'Космос та Північне сяйво' },
            { id: 'mountains', label: 'Гори та Дюни' },
            { id: 'water', label: 'Водоспади та Озера' },
            { id: 'forest', label: 'Сакура та Праліси' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white/20 text-white border border-white/25'
                  : 'bg-white/5 text-stone-400 hover:text-stone-200 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Wallpaper Grid (3 columns on desktop) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredWallpapers.map((wp) => {
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
                <div className="aspect-video w-full overflow-hidden relative bg-stone-950">
                  <img
                    src={wp.imageSrc}
                    alt={wp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-stone-950 p-1 rounded-full shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-2.5">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                    {wp.title}
                  </div>
                  <div className="text-[10px] text-stone-300 truncate">{wp.location}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls: Auto-Cycle, Camera Motion & Dimming */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Auto-cycle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-stone-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Автозміна (як у Brave):
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: 'Вимк', val: 0 },
                { label: '30 с', val: 30 },
                { label: '1 хв', val: 60 },
                { label: '5 хв', val: 300 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setAutoCycleInterval(opt.val)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    autoCycleInterval === opt.val
                      ? 'bg-amber-500 text-stone-950 font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion / Parallax */}
          {setIsWallpaperMotionEnabled && (
            <div className="flex flex-col gap-1.5">
              <span className="text-stone-300 font-medium flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-emerald-400" />
                Анімація фону (3D + Ken Burns):
              </span>
              <button
                type="button"
                onClick={() => setIsWallpaperMotionEnabled(!isWallpaperMotionEnabled)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer text-left flex items-center justify-between ${
                  isWallpaperMotionEnabled
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-stone-400'
                }`}
              >
                <span>{isWallpaperMotionEnabled ? 'Живий рух увімкнено' : 'Статичний фон'}</span>
                <span className="w-2 h-2 rounded-full bg-current" />
              </button>
            </div>
          )}

          {/* Dimming */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Контраст / Затемнення:
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
