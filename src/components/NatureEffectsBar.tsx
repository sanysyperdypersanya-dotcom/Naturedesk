import React from 'react';
import {
  Sparkles,
  CloudRain,
  Snowflake,
  CloudFog,
  Leaf,
  Sun,
  Flame,
  EyeOff,
  Sliders,
  Wind,
} from 'lucide-react';
import { NatureEffectType } from './InteractiveWeatherCanvas';

interface NatureEffectsBarProps {
  currentEffect: NatureEffectType;
  onSelectEffect: (eff: NatureEffectType) => void;
  resolvedEffectLabel: string;
  intensity: number;
  setIntensity: (val: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NatureEffectsBar: React.FC<NatureEffectsBarProps> = ({
  currentEffect,
  onSelectEffect,
  resolvedEffectLabel,
  intensity,
  setIntensity,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const effectsList: { id: NatureEffectType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'auto',
      label: 'За погодою',
      icon: <Wind className="w-4 h-4 text-sky-300" />,
      desc: `Автоматично: зараз ${resolvedEffectLabel}`,
    },
    {
      id: 'rain',
      label: 'Живий дощ',
      icon: <CloudRain className="w-4 h-4 text-sky-400" />,
      desc: 'Краплі дощу з бризками та відхиленням вітру',
    },
    {
      id: 'snow',
      label: 'Снігопад',
      icon: <Snowflake className="w-4 h-4 text-slate-100" />,
      desc: 'Плавні лапаті сніжинки, що кружляють',
    },
    {
      id: 'mist',
      label: 'Гірський туман',
      icon: <CloudFog className="w-4 h-4 text-indigo-200" />,
      desc: 'Рухомі об’ємні хмари та серпанок над горами',
    },
    {
      id: 'leaves',
      label: 'Осінній листопад',
      icon: <Leaf className="w-4 h-4 text-amber-400" />,
      desc: 'Багряне й золоте листя, що спадає з дерев',
    },
    {
      id: 'sunbeams',
      label: 'Сонячне проміння',
      icon: <Sun className="w-4 h-4 text-yellow-300" />,
      desc: 'Теплі промені світла та сяючі порошинки',
    },
    {
      id: 'fireflies',
      label: 'Нічні світлячки',
      icon: <Sparkles className="w-4 h-4 text-emerald-300" />,
      desc: 'Таємничі сяючі вогники літніх сутінків',
    },
    {
      id: 'none',
      label: 'Без ефектів',
      icon: <EyeOff className="w-4 h-4 text-stone-400" />,
      desc: 'Чистий статичний краєвид',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-stone-900 border border-white/15 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Інтерактивні погодні ефекти
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Жива анімація атмосфери, яка взаємодіє з рухами вашої миші
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Effects Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {effectsList.map((eff) => {
            const isSelected = currentEffect === eff.id;
            return (
              <button
                key={eff.id}
                onClick={() => onSelectEffect(eff.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {eff.icon}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-amber-200' : 'text-stone-200'
                    }`}
                  >
                    {eff.label}
                  </div>
                </div>
                <div className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                  {eff.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Tip & Intensity Slider */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/10">💡</span>
            <span className="leading-snug">
              <strong>Порада:</strong> Проведіть курсором миші по екрану, щоб керувати потоками вітру,
              рухом сніжинок чи листям!
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <span className="text-stone-400 whitespace-nowrap flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Інтенсивність:
            </span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.25"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              disabled={currentEffect === 'none'}
              className="w-28 accent-amber-400 cursor-pointer disabled:opacity-30"
            />
            <span className="font-data-mono text-stone-300 w-8 text-right">
              {Math.round(intensity * 100)}%
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Застосувати
          </button>
        </div>
      </div>
    </div>
  );
};
