import React, { useState, useMemo } from 'react';
import { Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const SYNODIC_MONTH = 29.530588853; // days
// Known reference New Moon: 2000-01-06 18:14 UTC
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

interface LunarData {
  phaseRatio: number; // 0..1 (0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Last Quarter)
  ageDays: number; // 0..29.53
  illuminationPct: number; // 0..100
  phaseName: string;
  phaseSubtitle: string;
  distanceKm: number;
  zodiacConstellation: string;
  moonrise: string;
  moonset: string;
}

function calculateLunarData(date: Date): LunarData {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON_MS) / (1000 * 60 * 60 * 24);
  let phaseRatio = (diffDays % SYNODIC_MONTH) / SYNODIC_MONTH;
  if (phaseRatio < 0) phaseRatio += 1;

  const ageDays = phaseRatio * SYNODIC_MONTH;
  // Illumination fraction: (1 - cos(2 * pi * phaseRatio)) / 2
  const illumination = (1 - Math.cos(2 * Math.PI * phaseRatio)) / 2;
  const illuminationPct = Math.round(illumination * 1000) / 10;

  // Anomalistic month (~27.55455 days) for Earth-Moon distance (363,300 to 405,500 km)
  const anomalisticRatio = (diffDays % 27.55455) / 27.55455;
  const distanceKm = Math.round(384400 - 21100 * Math.cos(2 * Math.PI * anomalisticRatio));

  // Sidereal month (~27.32166 days) for ecliptic constellation
  const zodiacs = [
    'Овен',
    'Телець',
    'Близнюки',
    'Рак',
    'Лев',
    'Діва',
    'Терези',
    'Скорпіон',
    'Стрілець',
    'Козоріг',
    'Водолій',
    'Риби',
  ];
  const siderealRatio = (((diffDays % 27.32166) + 27.32166) % 27.32166) / 27.32166;
  const zodiacConstellation = zodiacs[Math.floor(siderealRatio * 12) % 12];

  // Phase naming
  let phaseName = 'Молодик';
  let phaseSubtitle = 'Місяць між Землею та Сонцем, нічне небо найтемніше';
  if (phaseRatio < 0.03 || phaseRatio > 0.97) {
    phaseName = 'Молодик';
    phaseSubtitle = 'Ідеальний час для спостереження далеких зір та Чумацького Шляху';
  } else if (phaseRatio < 0.22) {
    phaseName = 'Зростаючий серп';
    phaseSubtitle = 'Молодий Місяць видно на заході невдовзі після заходу Сонця';
  } else if (phaseRatio < 0.28) {
    phaseName = 'Перша чверть';
    phaseSubtitle = 'Освітлена права половина диска, рельєф кратерів вздовж термінатора найчіткіший';
  } else if (phaseRatio < 0.47) {
    phaseName = 'Зростаючий опуклий Місяць';
    phaseSubtitle = 'Яскравий диск сходить вдень і світить майже всю ніч';
  } else if (phaseRatio <= 0.53) {
    phaseName = 'Повня';
    phaseSubtitle = 'Повністю освітлений диск сходить на заході Сонця';
  } else if (phaseRatio < 0.72) {
    phaseName = 'Спадаючий опуклий Місяць';
    phaseSubtitle = 'Місяць сходить пізно ввечері та залишається видимим на ранковому небі';
  } else if (phaseRatio < 0.78) {
    phaseName = 'Остання чверть';
    phaseSubtitle = 'Освітлена ліва половина диска, видно у другій половині ночі та вранці';
  } else {
    phaseName = 'Спадаючий серп (Старий Місяць)';
    phaseSubtitle = 'Тонкий ранковий серп перед світанком на східному небосхилі';
  }

  // Approximate moonrise & moonset based on lunar phase
  const riseHour = Math.floor((6 + phaseRatio * 24) % 24);
  const riseMin = Math.floor(((6 + phaseRatio * 24) * 60) % 60);
  const setHour = Math.floor((18 + phaseRatio * 24) % 24);
  const setMin = Math.floor(((18 + phaseRatio * 24) * 60) % 60);

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return {
    phaseRatio,
    ageDays: Math.round(ageDays * 10) / 10,
    illuminationPct,
    phaseName,
    phaseSubtitle,
    distanceKm,
    zodiacConstellation,
    moonrise: fmt(riseHour, riseMin),
    moonset: fmt(setHour, setMin),
  };
}

/**
 * Generates an SVG path for the lit portion of the Moon of radius R centered at (cx, cy).
 */
function buildMoonLitPath(cx: number, cy: number, r: number, phaseRatio: number): string {
  // Normalize phaseRatio: 0 = New, 0.5 = Full, 1 = New
  if (phaseRatio <= 0.01 || phaseRatio >= 0.99) {
    return '';
  }
  if (Math.abs(phaseRatio - 0.5) < 0.015) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }

  const isWaxing = phaseRatio < 0.5;
  // Terminator horizontal semi-axis rx ranges from +r to -r
  const cosAngle = Math.cos(2 * Math.PI * phaseRatio);
  const rx = Math.abs(cosAngle) * r;

  // Outer limb arc: right side for waxing (sweep = 1), left side for waning (sweep = 0)
  const outerSweep = isWaxing ? 1 : 0;

  // Inner terminator ellipse sweep depends on crescent vs gibbous
  let terminatorSweep: number;
  if (isWaxing) {
    // Waxing crescent (phase < 0.25) vs waxing gibbous (0.25..0.5)
    terminatorSweep = phaseRatio < 0.25 ? 0 : 1;
  } else {
    // Waning gibbous (0.5..0.75) vs waning crescent (0.75..1.0)
    terminatorSweep = phaseRatio < 0.75 ? 0 : 1;
  }

  return [
    `M ${cx} ${cy - r}`,
    `A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r}`,
    `A ${rx.toFixed(2)} ${r} 0 0 ${terminatorSweep} ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

export const MoonPhaseWidget: React.FC = () => {
  const { lang } = useLanguage();
  const [dayOffset, setDayOffset] = useState<number>(0);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const lunar = useMemo(() => calculateLunarData(targetDate), [targetDate]);

  // Compute upcoming 4 major phases from today
  const upcomingPhases = useMemo(() => {
    const now = new Date();
    const diffDays = (now.getTime() - KNOWN_NEW_MOON_MS) / (1000 * 60 * 60 * 24);
    let currentCyclePos = (diffDays % SYNODIC_MONTH) / SYNODIC_MONTH;
    if (currentCyclePos < 0) currentCyclePos += 1;

    const targets = [
      { label: 'Молодик', targetRatio: 0 },
      { label: 'Перша чверть', targetRatio: 0.25 },
      { label: 'Повня', targetRatio: 0.5 },
      { label: 'Остання чверть', targetRatio: 0.75 },
    ];

    return targets
      .map((t) => {
        let deltaRatio = t.targetRatio - currentCyclePos;
        if (deltaRatio <= 0.005) deltaRatio += 1;
        const daysUntil = deltaRatio * SYNODIC_MONTH;
        const phaseDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
        return {
          label: t.label,
          daysUntil: Math.round(daysUntil),
          dateStr: phaseDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'uk-UA', {
            day: 'numeric',
            month: 'short',
          }),
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [lang]);

  const formattedSelectedDate = targetDate.toLocaleDateString(
    lang === 'en' ? 'en-US' : 'uk-UA',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const litPath = buildMoonLitPath(75, 75, 58, lunar.phaseRatio);

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Moon className="w-4 h-4 text-amber-300 shrink-0" />
            <h3 className="text-sm font-semibold text-white truncate">
              Вигляд Місяця та Місячний цикл
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setDayOffset((d) => d - 1)}
              className="p-1 rounded-lg glass-pill text-stone-300 hover:text-white cursor-pointer"
              title="Попередня доба"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (dayOffset === 0) {
                  window.location.reload();
                } else {
                  setDayOffset(0);
                }
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                dayOffset === 0
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500/30'
                  : 'glass-pill text-stone-300 hover:text-white'
              }`}
              title="Перезавантажити сторінку / сьогоднішня дата"
            >
              {dayOffset === 0 ? 'Сьогодні' : `${dayOffset > 0 ? `+${dayOffset}` : dayOffset} дн.`}
            </button>
            <button
              onClick={() => setDayOffset((d) => d + 1)}
              className="p-1 rounded-lg glass-pill text-stone-300 hover:text-white cursor-pointer"
              title="Наступна доба"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Visual: Realistic SVG Moon + Phase Telemetry */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
          {/* Interactive Lunar Disc */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 150 150" className="w-full h-full overflow-visible">
              <defs>
                <radialGradient id="lunarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="55%" stopColor="#fde68a" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="lunarSurfaceLit" cx="38%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="55%" stopColor="#e7e5e4" />
                  <stop offset="100%" stopColor="#a8a29e" />
                </radialGradient>
                <clipPath id="moonDiscClip">
                  <circle cx="75" cy="75" r="58" />
                </clipPath>
                <clipPath id="moonLitClip">
                  <path d={litPath} />
                </clipPath>
              </defs>

              {/* Ambient outer halo */}
              <circle cx="75" cy="75" r="72" fill="url(#lunarGlow)" />

              {/* Dark hemisphere (Earthshine base) */}
              <circle
                cx="75"
                cy="75"
                r="58"
                fill="#18181b"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />

              {/* Subtle Lunar Maria on dark side (earthshine) */}
              <g clipPath="url(#moonDiscClip)" opacity="0.14" fill="#57534e">
                <ellipse cx="56" cy="58" rx="16" ry="12" transform="rotate(-15 56 58)" />
                <ellipse cx="74" cy="48" rx="12" ry="10" />
                <ellipse cx="92" cy="64" rx="14" ry="11" transform="rotate(20 92 64)" />
                <ellipse cx="52" cy="84" rx="18" ry="14" transform="rotate(10 52 84)" />
                <circle cx="84" cy="96" r="9" />
              </g>

              {/* Sunlit hemisphere */}
              {litPath && (
                <g clipPath="url(#moonLitClip)">
                  <circle cx="75" cy="75" r="58" fill="url(#lunarSurfaceLit)" />
                  {/* Lunar Maria & Crater Details on sunlit surface */}
                  <g fill="#78716c" opacity="0.28">
                    {/* Mare Imbrium & Oceanus Procellarum */}
                    <ellipse cx="55" cy="56" rx="17" ry="13" transform="rotate(-18 55 56)" />
                    <ellipse cx="48" cy="82" rx="19" ry="14" transform="rotate(12 48 82)" />
                    {/* Mare Serenitatis & Tranquillitatis */}
                    <ellipse cx="75" cy="50" rx="12" ry="10" />
                    <ellipse cx="89" cy="65" rx="13" ry="11" transform="rotate(18 89 65)" />
                    {/* Mare Crisium */}
                    <ellipse cx="108" cy="58" rx="6" ry="8" transform="rotate(-10 108 58)" />
                    {/* Tycho & Copernicus craters */}
                    <circle cx="68" cy="108" r="4.5" fill="#d6d3d1" opacity="0.7" />
                    <circle cx="58" cy="70" r="3.5" fill="#d6d3d1" opacity="0.6" />
                  </g>
                </g>
              )}

              {/* Subtle Rim Ring */}
              <circle
                cx="75"
                cy="75"
                r="58"
                fill="none"
                stroke="rgba(254, 243, 199, 0.25)"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Right Info Column */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="text-xs text-stone-400">{formattedSelectedDate}</div>
            <div className="text-lg font-semibold text-white mt-0.5 font-serif-display tracking-wide">
              {lunar.phaseName}
            </div>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">{lunar.phaseSubtitle}</p>

            {/* Primary Numeric Readouts */}
            <div className="mt-3 grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10">
              <div>
                <div className="text-[10px] text-stone-400">Освітленість</div>
                <div className="text-sm font-semibold text-amber-300 font-data-mono">
                  {lunar.illuminationPct}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400">Вік Місяця</div>
                <div className="text-sm font-semibold text-white font-data-mono">
                  {lunar.ageDays} дн.
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400">Відстань</div>
                <div className="text-sm font-semibold text-stone-200 font-data-mono">
                  {(lunar.distanceKm / 1000).toFixed(1)} тис. км
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Day Scrubber Slider */}
        <div className="mt-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
            <span>Огляд фаз по днях (-15 / +15 діб)</span>
            <span className="font-data-mono text-stone-300">
              Схід: {lunar.moonrise} · Захід: {lunar.moonset} · Сузір’я: {lunar.zodiacConstellation}
            </span>
          </div>
          <input
            type="range"
            min={-15}
            max={15}
            step={1}
            value={dayOffset}
            onChange={(e) => setDayOffset(parseInt(e.target.value, 10))}
            aria-label="Зсув дати для перегляду фази Місяця"
            className="w-full accent-amber-400 cursor-pointer h-1.5"
          />
        </div>
      </div>

      {/* Upcoming Major Phases Footer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-[11px] text-stone-400 mb-2">Найближчі головні фази Місяця:</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {upcomingPhases.map((p, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center"
            >
              <span className="text-[10px] text-stone-300 font-medium truncate w-full">
                {p.label}
              </span>
              <span className="text-xs font-semibold text-amber-300 font-data-mono mt-0.5">
                {p.dateStr}
              </span>
              <span className="text-[10px] text-stone-400 font-data-mono">
                через {p.daysUntil} дн.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
