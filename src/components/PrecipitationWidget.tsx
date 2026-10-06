import React, { useState } from 'react';
import { CloudRain, Droplets, Cloud, Umbrella, Radio, Sparkles } from 'lucide-react';
import { CurrentWeather } from '../types';

interface PrecipitationWidgetProps {
  weather: CurrentWeather | null;
  onTriggerRainEffect?: () => void;
}

export const PrecipitationWidget: React.FC<PrecipitationWidgetProps> = ({
  weather,
  onTriggerRainEffect,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'radar'>('chart');
  const [chartMetric, setChartMetric] = useState<'probability' | 'amount'>('probability');
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(0);

  const hourly = weather?.hourly && weather.hourly.length > 0
    ? weather.hourly
    : Array.from({ length: 12 }, (_, i) => ({
        time: `${String((new Date().getHours() + i) % 24).padStart(2, '0')}:00`,
        temp: 14 - Math.floor(i / 3),
        weatherCode: i % 4 === 0 ? 61 : 2,
        precipitationProbability: [20, 35, 65, 80, 55, 30, 15, 10, 10, 25, 40, 30][i],
        precipitation: [0, 0.2, 1.4, 2.1, 0.8, 0.1, 0, 0, 0, 0.1, 0.4, 0.2][i],
      }));

  const currentPrecip = weather?.precipitation ?? 0;
  const currentProb = weather?.precipitationProbability ?? hourly[0]?.precipitationProbability ?? 20;
  const dailySum = weather?.dailyPrecipitationSum ?? 1.8;
  const cloudCover = weather?.cloudCover ?? 45;
  const humidity = weather?.humidity ?? 68;
  const temp = weather?.temp ?? 14;

  // Approximate dew point (Magnus formula approximation)
  const dewPoint = Math.round(temp - (100 - humidity) / 5);

  const selectedSlot = hourly[selectedHourIdx] || hourly[0];

  const getPrecipitationStatus = () => {
    if (currentPrecip >= 2.5) return 'Помірний або сильний дощ';
    if (currentPrecip > 0) return 'Невеликі локальні опади';
    if (currentProb >= 60) return 'Висока ймовірність опадів найближчим часом';
    if (currentProb >= 30) return 'Можлива короткочасна мряка';
    return 'Без істотних опадів у найближчі години';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
            <h3 className="text-sm font-semibold text-white truncate">
              Опади та Атмосферний фронт
            </h3>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'chart'
                  ? 'bg-sky-500/25 text-sky-200 border border-sky-400/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Прогноз 12 год
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                viewMode === 'radar'
                  ? 'bg-sky-500/25 text-sky-200 border border-sky-400/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Метео-радар</span>
            </button>
          </div>
        </div>

        {/* Summary Telemetry Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-stone-400">Інтенсивність</div>
            <div className="mt-0.5 flex items-baseline gap-1 font-data-mono">
              <span className="text-lg font-semibold text-white">{currentPrecip.toFixed(1)}</span>
              <span className="text-[11px] text-sky-300">мм/год</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-stone-400">Ймовірність</div>
            <div className="mt-0.5 flex items-baseline gap-1 font-data-mono">
              <span className="text-lg font-semibold text-white">{currentProb}</span>
              <span className="text-[11px] text-sky-300">%</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-stone-400">Сума за добу</div>
            <div className="mt-0.5 flex items-baseline gap-1 font-data-mono">
              <span className="text-lg font-semibold text-white">{dailySum.toFixed(1)}</span>
              <span className="text-[11px] text-stone-400">мм</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-stone-400">Хмарність · Роса</div>
            <div className="mt-0.5 flex items-baseline gap-1 font-data-mono">
              <span className="text-lg font-semibold text-white">{cloudCover}%</span>
              <span className="text-[11px] text-stone-400">· {dewPoint}°C</span>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        {viewMode === 'chart' ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-300 font-medium">{getPrecipitationStatus()}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartMetric('probability')}
                  className={`text-[11px] transition-colors cursor-pointer ${
                    chartMetric === 'probability'
                      ? 'text-sky-300 font-semibold underline underline-offset-4'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Ймовірність %
                </button>
                <span className="text-stone-600" aria-hidden="true">·</span>
                <button
                  onClick={() => setChartMetric('amount')}
                  className={`text-[11px] transition-colors cursor-pointer ${
                    chartMetric === 'amount'
                      ? 'text-sky-300 font-semibold underline underline-offset-4'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Міліметри (мм)
                </button>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="pt-3 pb-2 px-3 rounded-xl bg-white/5 border border-white/5">
              <div className="grid grid-cols-12 gap-1.5 items-end h-28">
                {hourly.slice(0, 12).map((slot, idx) => {
                  const isSelected = idx === selectedHourIdx;
                  const val =
                    chartMetric === 'probability'
                      ? slot.precipitationProbability
                      : slot.precipitation;
                  const heightPct =
                    chartMetric === 'probability'
                      ? Math.max(8, slot.precipitationProbability)
                      : Math.max(8, Math.min(100, (slot.precipitation / 5) * 100));

                  const barColor =
                    slot.precipitationProbability >= 60 || slot.precipitation >= 1.0
                      ? 'bg-sky-400'
                      : slot.precipitationProbability >= 30 || slot.precipitation > 0
                      ? 'bg-sky-400/60'
                      : 'bg-stone-500/40';

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedHourIdx(idx)}
                      className="group flex flex-col items-center justify-end h-full cursor-pointer focus:outline-none"
                      title={`${slot.time}: ${slot.precipitationProbability}% (${slot.precipitation} мм)`}
                    >
                      <span className="text-[10px] font-data-mono text-stone-400 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-white">
                        {chartMetric === 'probability' ? `${val}%` : val > 0 ? val : '0'}
                      </span>
                      <div className="w-full h-20 flex items-end justify-center bg-white/5 rounded-md overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-sm transition-all duration-300 ${barColor} ${
                            isSelected ? 'ring-1 ring-amber-300 brightness-125' : 'group-hover:brightness-110'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] font-data-mono ${
                          isSelected ? 'text-amber-300 font-semibold' : 'text-stone-400'
                        }`}
                      >
                        {slot.time.slice(0, 2)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hour Readout */}
              {selectedSlot && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-300 font-data-mono">
                  <span>
                    Година: <strong className="text-white">{selectedSlot.time}</strong> · Темп:{' '}
                    <strong className="text-white">
                      {selectedSlot.temp > 0 ? `+${selectedSlot.temp}` : selectedSlot.temp}°C
                    </strong>
                  </span>
                  <span>
                    Опади: <strong className="text-sky-300">{selectedSlot.precipitationProbability}%</strong> ·{' '}
                    <strong className="text-sky-300">{selectedSlot.precipitation.toFixed(1)} мм</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Interactive Local Radar Simulation View */
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <defs>
                  <radialGradient id="precipCell1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
                    <stop offset="60%" stopColor="#0284c7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="precipCell2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
                    <stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Radar background */}
                <circle cx="80" cy="80" r="74" fill="rgba(8, 15, 26, 0.85)" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
                <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="2 3" />
                <circle cx="80" cy="80" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="2 3" />
                <line x1="6" y1="80" x2="154" y2="80" stroke="rgba(255,255,255,0.08)" />
                <line x1="80" y1="6" x2="80" y2="154" stroke="rgba(255,255,255,0.08)" />

                {/* Simulated Atmospheric Front Cells scaled to cloudCover / prob */}
                <ellipse
                  cx={65 + (cloudCover % 20)}
                  cy={58}
                  rx={18 + (currentProb / 100) * 24}
                  ry={12 + (cloudCover / 100) * 16}
                  fill="url(#precipCell1)"
                  transform="rotate(-22 65 58)"
                />
                <ellipse
                  cx={98}
                  cy={96}
                  rx={14 + (cloudCover / 100) * 20}
                  ry={10 + (currentProb / 100) * 14}
                  fill="url(#precipCell2)"
                  transform="rotate(15 98 96)"
                />

                {/* Center city marker */}
                <circle cx="80" cy="80" r="3" fill="#fbbf24" />
                <circle cx="80" cy="80" r="7" fill="none" stroke="#fbbf24" strokeOpacity="0.5" />

                {/* Cardinal labels */}
                <text x="80" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Пн</text>
                <text x="80" y="150" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Пд</text>
                <text x="146" y="83" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Сх</text>
                <text x="14" y="83" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Зх</text>
              </svg>
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Радіус огляду: 100 км · {weather?.city || 'Київ'}</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Напрямок руху повітряних мас визначається поточним вітром (
                <span className="font-data-mono text-white">{weather?.windSpeed ?? 12} км/год</span>).
                Щільність хмарного покриву становить{' '}
                <span className="font-data-mono text-sky-300">{cloudCover}%</span>.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Легка мряка
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Дощовий фронт
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer status & interactive desktop rain trigger */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs text-stone-400">
        <div className="flex items-center gap-1.5 truncate">
          <Umbrella className="w-3.5 h-3.5 text-sky-300 shrink-0" />
          <span className="truncate">
            {currentProb >= 50 ? 'Рекомендовано взяти парасольку' : 'Парасолька сьогодні не обов’язкова'}
          </span>
        </div>

        {onTriggerRainEffect && (
          <button
            onClick={onTriggerRainEffect}
            className="text-xs text-sky-300 hover:text-sky-200 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            title="Увімкнути візуальний ефект дощу на екрані"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ефект дощу</span>
          </button>
        )}
      </div>
    </div>
  );
};
