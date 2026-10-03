import React, { useState } from 'react';
import { CloudRain, Wind, Flame, Waves, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { ambientSoundEngine } from '../services/ambientAudio';

interface AmbientSoundPanelProps {
  isMasterActive: boolean;
  onToggleMaster: () => void;
}

export const AmbientSoundPanel: React.FC<AmbientSoundPanelProps> = ({
  isMasterActive,
  onToggleMaster,
}) => {
  const [rainActive, setRainActive] = useState(false);
  const [rainVol, setRainVol] = useState(0.5);

  const [windActive, setWindActive] = useState(false);
  const [windVol, setWindVol] = useState(0.5);

  const [fireActive, setFireActive] = useState(false);
  const [fireVol, setFireVol] = useState(0.5);

  const [oceanActive, setOceanActive] = useState(false);
  const [oceanVol, setOceanVol] = useState(0.5);

  const toggleRain = () => {
    const next = !rainActive;
    setRainActive(next);
    ambientSoundEngine.setRain(next, rainVol);
  };

  const changeRainVol = (v: number) => {
    setRainVol(v);
    if (rainActive) ambientSoundEngine.setRain(true, v);
  };

  const toggleWind = () => {
    const next = !windActive;
    setWindActive(next);
    ambientSoundEngine.setWind(next, windVol);
  };

  const changeWindVol = (v: number) => {
    setWindVol(v);
    if (windActive) ambientSoundEngine.setWind(true, v);
  };

  const toggleFire = () => {
    const next = !fireActive;
    setFireActive(next);
    ambientSoundEngine.setCampfire(next, fireVol);
  };

  const changeFireVol = (v: number) => {
    setFireVol(v);
    if (fireActive) ambientSoundEngine.setCampfire(true, v);
  };

  const toggleOcean = () => {
    const next = !oceanActive;
    setOceanActive(next);
    ambientSoundEngine.setOcean(next, oceanVol);
  };

  const changeOceanVol = (v: number) => {
    setOceanVol(v);
    if (oceanActive) ambientSoundEngine.setOcean(true, v);
  };

  const hasAnyActive = rainActive || windActive || fireActive || oceanActive;

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <h3 className="text-sm font-semibold text-white">Звуковий супровід природи</h3>
        </div>

        <button
          onClick={() => {
            if (hasAnyActive) {
              setRainActive(false);
              setWindActive(false);
              setFireActive(false);
              setOceanActive(false);
              ambientSoundEngine.stopAll();
            } else {
              setRainActive(true);
              ambientSoundEngine.setRain(true, rainVol);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            hasAnyActive
              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
              : 'glass-pill text-stone-300 hover:text-white'
          }`}
        >
          {hasAnyActive ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Зупинити всі</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Увімкнути дощ</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rain */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            rainActive
              ? 'bg-sky-500/15 border-sky-400/40 shadow-sm'
              : 'bg-white/5 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={toggleRain}
              className="flex items-center gap-2 text-xs font-medium text-stone-200 hover:text-sky-300 cursor-pointer"
            >
              <CloudRain className={`w-4 h-4 ${rainActive ? 'text-sky-300' : 'text-stone-400'}`} />
              <span>Осінній дощ</span>
            </button>
            <span
              className={`text-[10px] uppercase font-semibold ${
                rainActive ? 'text-sky-300' : 'text-stone-500'
              }`}
            >
              {rainActive ? 'Грає' : 'Вимк'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={rainVol}
              onChange={(e) => changeRainVol(parseFloat(e.target.value))}
              disabled={!rainActive}
              className="w-full accent-sky-400 cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>

        {/* Forest Wind */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            windActive
              ? 'bg-emerald-500/15 border-emerald-400/40 shadow-sm'
              : 'bg-white/5 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={toggleWind}
              className="flex items-center gap-2 text-xs font-medium text-stone-200 hover:text-emerald-300 cursor-pointer"
            >
              <Wind className={`w-4 h-4 ${windActive ? 'text-emerald-300' : 'text-stone-400'}`} />
              <span>Лісовий легіт</span>
            </button>
            <span
              className={`text-[10px] uppercase font-semibold ${
                windActive ? 'text-emerald-300' : 'text-stone-500'
              }`}
            >
              {windActive ? 'Грає' : 'Вимк'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={windVol}
              onChange={(e) => changeWindVol(parseFloat(e.target.value))}
              disabled={!windActive}
              className="w-full accent-emerald-400 cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>

        {/* Campfire */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            fireActive
              ? 'bg-amber-500/15 border-amber-400/40 shadow-sm'
              : 'bg-white/5 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={toggleFire}
              className="flex items-center gap-2 text-xs font-medium text-stone-200 hover:text-amber-300 cursor-pointer"
            >
              <Flame className={`w-4 h-4 ${fireActive ? 'text-amber-400' : 'text-stone-400'}`} />
              <span>Тепле багаття</span>
            </button>
            <span
              className={`text-[10px] uppercase font-semibold ${
                fireActive ? 'text-amber-400' : 'text-stone-500'
              }`}
            >
              {fireActive ? 'Грає' : 'Вимк'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={fireVol}
              onChange={(e) => changeFireVol(parseFloat(e.target.value))}
              disabled={!fireActive}
              className="w-full accent-amber-400 cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>

        {/* Ocean Waves */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            oceanActive
              ? 'bg-rose-500/15 border-rose-400/40 shadow-sm'
              : 'bg-white/5 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={toggleOcean}
              className="flex items-center gap-2 text-xs font-medium text-stone-200 hover:text-rose-300 cursor-pointer"
            >
              <Waves className={`w-4 h-4 ${oceanActive ? 'text-rose-300' : 'text-stone-400'}`} />
              <span>Хвилі океану</span>
            </button>
            <span
              className={`text-[10px] uppercase font-semibold ${
                oceanActive ? 'text-rose-300' : 'text-stone-500'
              }`}
            >
              {oceanActive ? 'Грає' : 'Вимк'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={oceanVol}
              onChange={(e) => changeOceanVol(parseFloat(e.target.value))}
              disabled={!oceanActive}
              className="w-full accent-rose-400 cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
