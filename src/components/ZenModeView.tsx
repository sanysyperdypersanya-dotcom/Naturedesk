import React, { useEffect, useState } from 'react';
import { Minimize2, Image, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { NatureWallpaper, CurrentWeather } from '../types';

interface ZenModeViewProps {
  wallpaper: NatureWallpaper;
  weather: CurrentWeather | null;
  onExitZen: () => void;
  onOpenWallpaperDrawer: () => void;
  isSoundPlaying: boolean;
  onToggleSound: () => void;
  onOpenEffectsDrawer: () => void;
  effectLabel: string;
}

export const ZenModeView: React.FC<ZenModeViewProps> = ({
  wallpaper,
  weather,
  onExitZen,
  onOpenWallpaperDrawer,
  isSoundPlaying,
  onToggleSound,
  onOpenEffectsDrawer,
  effectLabel,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const formattedDate = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(time);

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-8 sm:p-12 z-20 select-none animate-in fade-in duration-700">
      {/* Top minimal status */}
      <div className="flex items-center justify-between">
        <div className="glass-panel-subtle px-4 py-2 rounded-xl border border-white/10 text-xs text-stone-200 flex items-center gap-2">
          <span className="font-semibold text-white">{wallpaper.title}</span>
          <span aria-hidden="true" className="text-stone-500">·</span>
          <span className="text-stone-300">{wallpaper.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEffectsDrawer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs glass-pill text-amber-200 hover:text-white cursor-pointer"
            title="Ефекти природи"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{effectLabel}</span>
          </button>
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isSoundPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                : 'glass-pill text-stone-300 hover:text-white'
            }`}
            title="Звуки природи"
          >
            {isSoundPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>
          <button
            onClick={onOpenWallpaperDrawer}
            className="p-2.5 glass-pill rounded-xl text-stone-300 hover:text-white cursor-pointer"
            title="Змінити фон"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            onClick={onExitZen}
            className="flex items-center gap-2 px-3.5 py-2 glass-pill rounded-xl text-xs text-stone-200 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Вийти з фокусу</span>
          </button>
        </div>
      </div>

      {/* Centerpiece Minimalist Clock */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline font-data-mono text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] font-medium tracking-tight">
            {hours}:{minutes}
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl text-amber-300/80 ml-3 sm:ml-5">
            :{seconds}
          </span>
        </div>

        <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-serif-display font-medium text-stone-100 drop-shadow-md">
          {capitalizedDate}
        </h2>

        {weather && (
          <div className="mt-4 flex items-center gap-3 text-stone-300 text-sm sm:text-base font-medium glass-panel-subtle px-4 py-1.5 rounded-full border border-white/10">
            <span>{weather.city}</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-amber-300 font-data-mono">{weather.temp > 0 ? `+${weather.temp}` : weather.temp}°C</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span>{weather.condition.label}</span>
          </div>
        )}
      </div>

      {/* Bottom Inspiration */}
      <div className="text-center text-xs text-stone-400 font-serif-display italic tracking-wider">
        «Природа не поспішає, проте все встигає» · Лао-цзи
      </div>
    </div>
  );
};
