import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Image, Sparkles, RotateCw } from 'lucide-react';

interface HeaderBarProps {
  activeTab: 'all' | 'weather' | 'facts' | 'sounds';
  setActiveTab: (tab: 'all' | 'weather' | 'facts' | 'sounds') => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  isSoundPlaying: boolean;
  onToggleMasterSound: () => void;
  onOpenWallpaperDrawer: () => void;
  wallpaperTitle: string;
  onOpenEffectsDrawer: () => void;
  effectLabel: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  setActiveTab,
  isZenMode,
  setIsZenMode,
  isSoundPlaying,
  onToggleMasterSound,
  onOpenWallpaperDrawer,
  wallpaperTitle,
  onOpenEffectsDrawer,
  effectLabel,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 glass-panel-subtle z-30 transition-all duration-300">
      {/* Zone 1: СЬОГОДНІ button reloads the page */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="group flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-wider text-white font-serif-display select-none cursor-pointer"
          title="Перезавантажити сторінку"
        >
          <span>СЬОГОДНІ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
          <RotateCw className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" />
        </button>
      </div>

      {/* Zone 2: 4 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-xs lg:text-sm font-medium tracking-wide text-stone-300">
        <button
          onClick={() => setActiveTab('all')}
          className={`transition-colors pb-0.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'text-white border-b border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          Головна
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`transition-colors pb-0.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'weather'
              ? 'text-white border-b border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          Погода та Небо
        </button>
        <button
          onClick={() => setActiveTab('facts')}
          className={`transition-colors pb-0.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'facts'
              ? 'text-white border-b border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          Факти та Мудрість
        </button>
        <button
          onClick={() => setActiveTab('sounds')}
          className={`transition-colors pb-0.5 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sounds'
              ? 'text-white border-b border-amber-400 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300/80" />
          <span>Атмосфера</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        {/* Interactive Effect Button */}
        <button
          onClick={onOpenEffectsDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-200 glass-pill rounded-lg transition-all duration-150 cursor-pointer hover:bg-amber-500/20 border-amber-400/30"
          title="Налаштувати інтерактивний ефект погоди (дощ, сніг, туман)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="max-w-[120px] truncate hidden sm:inline">{effectLabel}</span>
        </button>

        {/* Wallpaper quick trigger */}
        <button
          onClick={onOpenWallpaperDrawer}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-stone-200 hover:text-white glass-pill rounded-lg transition-all duration-150 cursor-pointer hover:bg-white/15"
          title="Змінити фон природи"
        >
          <Image className="w-3.5 h-3.5 text-stone-300" />
          <span className="max-w-[100px] truncate">{wallpaperTitle}</span>
        </button>

        {/* Ambient sound toggle */}
        <button
          onClick={onToggleMasterSound}
          className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
            isSoundPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              : 'glass-pill text-stone-300 hover:text-white'
          }`}
          title={isSoundPlaying ? 'Вимкнути звуки' : 'Увімкнути звуки природи'}
        >
          {isSoundPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
        </button>

        {/* Zen Mode / Fullscreen */}
        <button
          onClick={() => setIsZenMode(!isZenMode)}
          className="p-2 rounded-lg glass-pill text-stone-300 hover:text-white transition-colors cursor-pointer"
          title={isZenMode ? 'Вийти з режиму споглядання' : 'Фокус-режим (Zen)'}
        >
          {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
