import React, { useState, useMemo } from 'react';
import { Compass, Sparkles, Eye, Clock, RotateCcw } from 'lucide-react';

interface StarPoint {
  id: string;
  name?: string;
  x: number; // polar projection coords relative to center (-95..95)
  y: number;
  mag: number; // apparent magnitude (smaller = brighter)
  color?: string;
}

interface ConstellationData {
  id: string;
  nameUk: string;
  latinName: string;
  alphaStar: string;
  magnitude: string;
  direction: string;
  description: string;
  stars: StarPoint[];
  lines: [number, number][]; // indices into stars array
}

const CONSTELLATIONS: ConstellationData[] = [
  {
    id: 'ursa-minor',
    nameUk: 'Мала Ведмедиця',
    latinName: 'Ursa Minor',
    alphaStar: 'Полярна зоря (α UMi)',
    magnitude: '1.98m',
    direction: 'Зеніт / Північ',
    description:
      'Містить Полярну зорю, яка вказує майже точно на Північний полюс світу і залишається нерухомою протягом усієї ночі.',
    stars: [
      { id: 'polaris', name: 'Полярна', x: 0, y: 0, mag: 1.98, color: '#fef08a' },
      { id: 'umi-2', x: -8, y: -12, mag: 4.3 },
      { id: 'umi-3', x: -18, y: -20, mag: 4.2 },
      { id: 'umi-4', x: -28, y: -24, mag: 4.3 },
      { id: 'umi-5', x: -38, y: -20, mag: 3.0 },
      { id: 'kochab', name: 'Кохаб', x: -35, y: -32, mag: 2.08, color: '#fed7aa' },
      { id: 'umi-7', x: -24, y: -33, mag: 4.9 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
  {
    id: 'ursa-major',
    nameUk: 'Велика Ведмедиця (Великий Віз)',
    latinName: 'Ursa Major',
    alphaStar: 'Аліот та Дубхе (α UMa)',
    magnitude: '1.77m',
    direction: 'Північ — Північний Захід',
    description:
      'Найвідоміший астеризм українського неба — Великий Віз. Дві крайні зорі ковша (Мерак і Дубхе) вказують прямо на Полярну зорю.',
    stars: [
      { id: 'dubhe', name: 'Дубхе', x: -22, y: -52, mag: 1.79, color: '#fde68a' },
      { id: 'merak', x: -28, y: -62, mag: 2.37 },
      { id: 'phecda', x: -44, y: -60, mag: 2.44 },
      { id: 'megrez', x: -42, y: -49, mag: 3.31 },
      { id: 'alioth', name: 'Аліот', x: -55, y: -44, mag: 1.77 },
      { id: 'mizar', name: 'Міцар', x: -66, y: -38, mag: 2.23 },
      { id: 'alkaid', name: 'Бенетнаш', x: -78, y: -28, mag: 1.86, color: '#bae6fd' },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  {
    id: 'cassiopeia',
    nameUk: 'Кассіопея',
    latinName: 'Cassiopeia',
    alphaStar: 'Шедар (α Cas)',
    magnitude: '2.24m',
    direction: 'Північний Схід / Високо в небі',
    description:
      'Яскраве сузір’я у формі літери «W» або «M» на тлі Чумацького Шляху. В Україні не заходить за горизонт цілий рік.',
    stars: [
      { id: 'caph', x: 18, y: 26, mag: 2.28 },
      { id: 'schedar', name: 'Шедар', x: 28, y: 34, mag: 2.24, color: '#fed7aa' },
      { id: 'gamma-cas', x: 35, y: 24, mag: 2.15, color: '#bae6fd' },
      { id: 'ruchbah', x: 45, y: 30, mag: 2.68 },
      { id: 'segin', x: 52, y: 20, mag: 3.35 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    id: 'cygnus',
    nameUk: 'Лебідь',
    latinName: 'Cygnus',
    alphaStar: 'Денеб (α Cyg)',
    magnitude: '1.25m',
    direction: 'Захід — Зеніт',
    description:
      'Північний Хрест, що летить уздовж Чумацького Шляху. Його головна зоря Денеб — одна з найяскравіших надгігантів нашої Галактики.',
    stars: [
      { id: 'deneb', name: 'Денеб', x: -6, y: 42, mag: 1.25, color: '#e0f2fe' },
      { id: 'sadr', x: -16, y: 52, mag: 2.23 },
      { id: 'albireo', name: 'Альбірео', x: -30, y: 66, mag: 3.05, color: '#fde68a' },
      { id: 'gienah', x: -6, y: 62, mag: 2.48 },
      { id: 'delta-cyg', x: -28, y: 44, mag: 2.87 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [3, 1],
      [1, 4],
    ],
  },
  {
    id: 'lyra',
    nameUk: 'Ліра',
    latinName: 'Lyra',
    alphaStar: 'Вега (α Lyr)',
    magnitude: '0.03m',
    direction: 'Південний Захід',
    description:
      'Вега — друга за яскравістю зоря північної півкулі неба та еталон нульової зоряної величини в астрономії.',
    stars: [
      { id: 'vega', name: 'Вега', x: -42, y: 48, mag: 0.03, color: '#bae6fd' },
      { id: 'sheliak', x: -46, y: 58, mag: 3.52 },
      { id: 'sulafat', x: -40, y: 61, mag: 3.25 },
      { id: 'lyr-4', x: -48, y: 53, mag: 4.3 },
    ],
    lines: [
      [0, 3],
      [3, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    id: 'aquila',
    nameUk: 'Орел',
    latinName: 'Aquila',
    alphaStar: 'Альтаїр (α Aql)',
    magnitude: '0.76m',
    direction: 'Південь — Південний Захід',
    description:
      'Разом із Вегою та Денебом Альтаїр утворює знаменитий «Літньо-осінній трикутник», який добре видно ввечері.',
    stars: [
      { id: 'altair', name: 'Альтаїр', x: -24, y: 82, mag: 0.76, color: '#f0f9ff' },
      { id: 'tarazed', x: -20, y: 76, mag: 2.72, color: '#fed7aa' },
      { id: 'alshain', x: -28, y: 87, mag: 3.71 },
      { id: 'zeta-aql', x: -35, y: 74, mag: 2.99 },
    ],
    lines: [
      [1, 0],
      [0, 2],
      [0, 3],
    ],
  },
  {
    id: 'pegasus',
    nameUk: 'Пегас та Андромеда',
    latinName: 'Pegasus & Andromeda',
    alphaStar: 'Альферац (α And)',
    magnitude: '2.06m',
    direction: 'Південь — Високо над горизонтом',
    description:
      'Великий Квадрат Пегаса — головний орієнтир осіннього неба. Поруч розташована Галактика Андромеди (M31), видима неозброєним оком.',
    stars: [
      { id: 'alpheratz', name: 'Альферац', x: 30, y: 52, mag: 2.06, color: '#e0f2fe' },
      { id: 'scheat', x: 14, y: 62, mag: 2.44, color: '#fecdd3' },
      { id: 'markab', name: 'Маркаб', x: 16, y: 78, mag: 2.49 },
      { id: 'algenib', x: 34, y: 72, mag: 2.83 },
      { id: 'mirach', name: 'Мірах', x: 44, y: 42, mag: 2.07, color: '#fed7aa' },
      { id: 'almach', x: 56, y: 30, mag: 2.1 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 4],
      [4, 5],
    ],
  },
  {
    id: 'taurus',
    nameUk: 'Телець та Плеяди (Стожари)',
    latinName: 'Taurus',
    alphaStar: 'Альдебаран (α Tau)',
    magnitude: '0.87m',
    direction: 'Схід — Північний Схід',
    description:
      'Окрасою сузір’я є яскраво-помаранчевий гігант Альдебаран та розсіяне зоряне скупчення Плеяди (в Україні здавна відоме як Стожари або Волосожар).',
    stars: [
      { id: 'aldebaran', name: 'Альдебаран', x: 76, y: 38, mag: 0.87, color: '#fdba74' },
      { id: 'elnath', x: 78, y: 18, mag: 1.65, color: '#bae6fd' },
      { id: 'pleiades', name: 'Плеяди (Стожари)', x: 64, y: 34, mag: 1.6, color: '#93c5fd' },
      { id: 'zeta-tau', x: 86, y: 28, mag: 2.97 },
    ],
    lines: [
      [2, 0],
      [0, 1],
      [0, 3],
    ],
  },
  {
    id: 'orion',
    nameUk: 'Оріон (Косарі)',
    latinName: 'Orion',
    alphaStar: 'Рігель та Бетельгейзе',
    magnitude: '0.13m',
    direction: 'Схід — Південний Схід (вночі)',
    description:
      'Найвеличніше сузір’я зимового й осінньо-нічного неба. Три зорі Пояса Оріона в українській народній традиції називали «Косарі».',
    stars: [
      { id: 'betelgeuse', name: 'Бетельгейзе', x: 84, y: 50, mag: 0.42, color: '#fca5a5' },
      { id: 'bellatrix', x: 74, y: 54, mag: 1.64, color: '#bae6fd' },
      { id: 'alnitak', x: 82, y: 62, mag: 1.77 },
      { id: 'alnilam', name: 'Пояс Оріона', x: 79, y: 64, mag: 1.69, color: '#e0f2fe' },
      { id: 'mintaka', x: 76, y: 66, mag: 2.23 },
      { id: 'saiph', x: 86, y: 74, mag: 2.06 },
      { id: 'rigel', name: 'Рігель', x: 74, y: 76, mag: 0.13, color: '#bae6fd' },
    ],
    lines: [
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
      [0, 1],
      [5, 6],
    ],
  },
];

interface StarMapWidgetProps {
  cityName?: string;
  lat?: number;
  lng?: number;
}

export const StarMapWidget: React.FC<StarMapWidgetProps> = ({
  cityName = 'Київ',
  lat = 50.45,
  lng = 30.52,
}) => {
  const [selectedConstellationId, setSelectedConstellationId] = useState<string>('ursa-major');
  const [showLines, setShowLines] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [hourOffset, setHourOffset] = useState<number>(0);

  // Calculate rotation angle of the celestial sphere around Polaris based on date, longitude, and time offset
  const skyRotationDeg = useMemo(() => {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60 + hourOffset;
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    // Earth rotates 15 deg per hour + ~0.9856 deg per day + observer longitude offset
    return ((hours - 22) * 15 + (dayOfYear - 275) * 0.9856 + (lng - 30.5)) % 360;
  }, [hourOffset, lng]);

  const selectedConstellation =
    CONSTELLATIONS.find((c) => c.id === selectedConstellationId) || CONSTELLATIONS[0];

  const displayedTime = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + hourOffset);
    return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  }, [hourOffset]);

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-4 h-4 text-indigo-300 shrink-0" />
            <h3 className="text-sm font-semibold text-white truncate">
              Інтерактивна Зоряна Карта · {cityName}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowLines(!showLines)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                showLines
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                  : 'glass-pill text-stone-400 hover:text-stone-200'
              }`}
              title="Показати або приховати лінії сузір’їв"
            >
              Лінії
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                showLabels
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                  : 'glass-pill text-stone-400 hover:text-stone-200'
              }`}
              title="Показати або приховати підписи яскравих зір"
            >
              Назви зір
            </button>
          </div>
        </div>

        {/* Planisphere & Constellation Selector */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Interactive SVG Celestial Dome */}
          <div className="sm:col-span-7 flex flex-col items-center">
            <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center select-none">
              <svg viewBox="-115 -115 230 230" className="w-full h-full">
                <defs>
                  <radialGradient id="skyDomeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="65%" stopColor="#090d16" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                  <clipPath id="horizonClip">
                    <circle cx="0" cy="0" r="98" />
                  </clipPath>
                </defs>

                {/* Outer Celestial Horizon Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="98"
                  fill="url(#skyDomeGrad)"
                  stroke="rgba(129, 140, 248, 0.35)"
                  strokeWidth="1.2"
                />

                {/* Altitude Rings (30° and 60° above horizon) */}
                <circle
                  cx="0"
                  cy="0"
                  r="65"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="2 3"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="32"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="2 3"
                />

                {/* Rotating Star Field inside Horizon Clip */}
                <g clipPath="url(#horizonClip)">
                  <g transform={`rotate(${skyRotationDeg.toFixed(1)})`}>
                    {/* Subtle Milky Way Band */}
                    <path
                      d="M -95 -45 Q -10 25 95 35"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.08)"
                      strokeWidth="28"
                      strokeLinecap="round"
                    />

                    {/* Ecliptic Arc */}
                    <path
                      d="M -95 40 Q 0 65 95 25"
                      fill="none"
                      stroke="rgba(251, 191, 36, 0.2)"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />

                    {/* Background Faint Stars */}
                    {[
                      [-60, 12],
                      [-15, -75],
                      [25, -55],
                      [65, -20],
                      [12, -28],
                      [-75, -10],
                      [50, 75],
                      [-55, 72],
                      [5, 88],
                      [-82, 35],
                    ].map(([bx, by], i) => (
                      <circle
                        key={i}
                        cx={bx}
                        cy={by}
                        r="0.7"
                        fill="#94a3b8"
                        opacity="0.45"
                      />
                    ))}

                    {/* Constellations */}
                    {CONSTELLATIONS.map((constellation) => {
                      const isSelected = constellation.id === selectedConstellationId;
                      return (
                        <g
                          key={constellation.id}
                          onClick={() => setSelectedConstellationId(constellation.id)}
                          className="cursor-pointer"
                        >
                          {/* Constellation Lines */}
                          {showLines &&
                            constellation.lines.map(([i1, i2], lIdx) => {
                              const s1 = constellation.stars[i1];
                              const s2 = constellation.stars[i2];
                              if (!s1 || !s2) return null;
                              return (
                                <line
                                  key={lIdx}
                                  x1={s1.x}
                                  y1={s1.y}
                                  x2={s2.x}
                                  y2={s2.y}
                                  stroke={
                                    isSelected
                                      ? 'rgba(251, 191, 36, 0.85)'
                                      : 'rgba(129, 140, 248, 0.35)'
                                  }
                                  strokeWidth={isSelected ? '1.3' : '0.8'}
                                />
                              );
                            })}

                          {/* Constellation Stars */}
                          {constellation.stars.map((star) => {
                            const radius = Math.max(1.2, 3.2 - star.mag * 0.55);
                            return (
                              <g key={star.id}>
                                {/* Clickable hit area */}
                                <circle cx={star.x} cy={star.y} r="6" fill="transparent" />
                                {isSelected && (
                                  <circle
                                    cx={star.x}
                                    cy={star.y}
                                    r={radius + 2.2}
                                    fill="none"
                                    stroke="rgba(251, 191, 36, 0.45)"
                                    strokeWidth="0.8"
                                  />
                                )}
                                <circle
                                  cx={star.x}
                                  cy={star.y}
                                  r={radius}
                                  fill={star.color || '#f8fafc'}
                                />
                                {showLabels && star.name && (
                                  <text
                                    x={star.x + 3.5}
                                    y={star.y - 2.5}
                                    fill={isSelected ? '#fde68a' : '#cbd5e1'}
                                    fontSize="5.8"
                                    fontWeight={isSelected ? '600' : '400'}
                                    transform={`rotate(${-skyRotationDeg.toFixed(1)}, ${star.x}, ${star.y})`}
                                  >
                                    {star.name}
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </g>
                      );
                    })}
                  </g>
                </g>

                {/* Zenith Crosshair */}
                <line x1="-3" y1="0" x2="3" y2="0" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />

                {/* Cardinal Horizon Labels */}
                <text x="0" y="-103" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="600">
                  Пн (N)
                </text>
                <text x="0" y="110" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="500">
                  Пд (S)
                </text>
                <text x="-107" y="3" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="500">
                  Сх
                </text>
                <text x="107" y="3" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="500">
                  Зх
                </text>
              </svg>
            </div>
          </div>

          {/* Constellation Quick List & Inspector */}
          <div className="sm:col-span-5 flex flex-col justify-between space-y-2.5">
            <div className="text-[11px] text-stone-400">
              Оберіть сузір’я на карті або зі списку:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {CONSTELLATIONS.map((c) => {
                const active = c.id === selectedConstellationId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConstellationId(c.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 font-semibold'
                        : 'bg-white/5 border-white/5 text-stone-300 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{c.nameUk}</span>
                    <span className="text-[10px] font-data-mono text-stone-400 ml-1 shrink-0">
                      {c.magnitude}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Constellation Detail Panel */}
        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-amber-300">
                {selectedConstellation.nameUk}
              </span>
              <span className="text-xs text-stone-400 ml-1.5">
                ({selectedConstellation.latinName})
              </span>
            </div>
            <div className="text-[11px] text-stone-300 font-data-mono">
              Головна зоря: <strong className="text-white">{selectedConstellation.alphaStar}</strong> ·{' '}
              {selectedConstellation.direction}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-stone-300 leading-relaxed">
            {selectedConstellation.description}
          </p>
        </div>
      </div>

      {/* Time Rotation Scrubber Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-300 font-data-mono shrink-0">
          <Clock className="w-3.5 h-3.5 text-indigo-300" />
          <span>Час огляду: {displayedTime}</span>
          <span className="text-stone-500">·</span>
          <span className="text-stone-400">
            {lat.toFixed(1)}°N, {lng.toFixed(1)}°E
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="range"
            min={-6}
            max={12}
            step={1}
            value={hourOffset}
            onChange={(e) => setHourOffset(parseInt(e.target.value, 10))}
            aria-label="Часовий зсув зоряного неба"
            className="w-full sm:w-32 accent-indigo-400 cursor-pointer h-1.5"
          />
          {hourOffset !== 0 && (
            <button
              onClick={() => setHourOffset(0)}
              className="p-1 rounded-lg glass-pill text-stone-300 hover:text-white cursor-pointer"
              title="Поточний час"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
