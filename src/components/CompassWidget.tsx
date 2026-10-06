import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Compass,
  Navigation,
  Wind,
  Sun,
  MapPin,
  RotateCcw,
  Smartphone,
  Crosshair,
} from 'lucide-react';
import { CurrentWeather, CityOption } from '../types';

interface CompassWidgetProps {
  weather: CurrentWeather | null;
  city: CityOption;
}

interface LandmarkTarget {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
}

const LANDMARK_TARGETS: LandmarkTarget[] = [
  {
    id: 'hoverla',
    name: 'Гора Говерла',
    subtitle: 'Чорногора · Українські Карпати',
    lat: 48.1602,
    lng: 24.5002,
  },
  {
    id: 'synevyr',
    name: 'Озеро Синевир',
    subtitle: 'Міжгір’я · Закарпаття',
    lat: 48.6168,
    lng: 23.6857,
  },
  {
    id: 'ai-petri',
    name: 'Ай-Петрі',
    subtitle: 'Кримські гори · Чорне море',
    lat: 44.4517,
    lng: 34.0581,
  },
  {
    id: 'khortytsia',
    name: 'Острів Хортиця',
    subtitle: 'Дніпровські пороги · Запоріжжя',
    lat: 47.8229,
    lng: 35.0903,
  },
  {
    id: 'north-pole',
    name: 'Географічна Північ',
    subtitle: 'Північний полюс · Арктика',
    lat: 90.0,
    lng: 0.0,
  },
];

const CARDINAL_POINTS = [
  { label: 'Пн', sub: 'N', deg: 0, major: true },
  { label: 'ПнСх', sub: 'NE', deg: 45, major: false },
  { label: 'Сх', sub: 'E', deg: 90, major: true },
  { label: 'ПдСх', sub: 'SE', deg: 135, major: false },
  { label: 'Пд', sub: 'S', deg: 180, major: true },
  { label: 'ПдЗх', sub: 'SW', deg: 225, major: false },
  { label: 'Зх', sub: 'W', deg: 270, major: true },
  { label: 'ПнЗх', sub: 'NW', deg: 315, major: false },
];

function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  const diff = ((toDeg - fromDeg + 540) % 360) - 180;
  return diff === -180 ? 180 : diff;
}

function getCardinalFullDescription(deg: number): {
  short: string;
  full: string;
  intl: string;
} {
  const norm = normalizeDegrees(deg);
  const dirs = [
    { short: 'Пн', full: 'Північ', intl: 'North' },
    { short: 'Пн-ПнСх', full: 'Північ — Північний Схід', intl: 'NNE' },
    { short: 'ПнСх', full: 'Північний Схід', intl: 'North-East' },
    { short: 'Сх-ПнСх', full: 'Схід — Північний Схід', intl: 'ENE' },
    { short: 'Сх', full: 'Схід', intl: 'East' },
    { short: 'Сх-ПдСх', full: 'Схід — Південний Схід', intl: 'ESE' },
    { short: 'ПдСх', full: 'Південний Схід', intl: 'South-East' },
    { short: 'Пд-ПдСх', full: 'Південь — Південний Схід', intl: 'SSE' },
    { short: 'Пд', full: 'Південь', intl: 'South' },
    { short: 'Пд-ПдЗх', full: 'Південь — Південний Захід', intl: 'SSW' },
    { short: 'ПдЗх', full: 'Південний Захід', intl: 'South-West' },
    { short: 'Зх-ПдЗх', full: 'Захід — Південний Захід', intl: 'WSW' },
    { short: 'Зх', full: 'Захід', intl: 'West' },
    { short: 'Зх-ПнЗх', full: 'Захід — Північний Захід', intl: 'WNW' },
    { short: 'ПнЗх', full: 'Північний Захід', intl: 'North-West' },
    { short: 'Пн-ПнЗх', full: 'Північ — Північний Захід', intl: 'NNW' },
  ];
  const idx = Math.round(norm / 22.5) % 16;
  return dirs[idx];
}

// Calculate Great-Circle Forward Azimuth (deg) and Haversine Distance (km)
function calculateBearingAndDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { bearing: number; distanceKm: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lon2 - lon1);

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const bearing = normalizeDegrees(toDeg(Math.atan2(y, x)));

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(6371 * c);

  return { bearing, distanceKm };
}

// Approximate Solar Azimuth based on local solar time and latitude
function computeSolarAzimuth(lat: number, lng: number, now: Date): {
  azimuth: number;
  elevation: number;
  isDaylight: boolean;
} {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  // Solar declination
  const declination = 23.45 * Math.sin(toRad(((360 / 365) * (dayOfYear - 81))));
  const utcHours =
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const solarTime = (utcHours + lng / 15 + 24) % 24;
  const hourAngle = (solarTime - 12) * 15;

  const sinEl =
    Math.sin(toRad(lat)) * Math.sin(toRad(declination)) +
    Math.cos(toRad(lat)) * Math.cos(toRad(declination)) * Math.cos(toRad(hourAngle));
  const elevation = toDeg(Math.asin(Math.max(-1, Math.min(1, sinEl))));

  const cosAz =
    (Math.sin(toRad(declination)) - Math.sin(toRad(lat)) * sinEl) /
    (Math.cos(toRad(lat)) * Math.cos(toRad(elevation)) + 1e-6);
  let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (hourAngle > 0) {
    azimuth = 360 - azimuth;
  }

  return {
    azimuth: normalizeDegrees(azimuth),
    elevation: Math.round(elevation * 10) / 10,
    isDaylight: elevation > -2,
  };
}

export const CompassWidget: React.FC<CompassWidgetProps> = ({ weather, city }) => {
  // Heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  const [targetHeading, setTargetHeading] = useState<number>(0);
  const [displayHeading, setDisplayHeading] = useState<number>(0);
  const [trueNorthMode, setTrueNorthMode] = useState<boolean>(true);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('hoverla');
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [sensorStatus, setSensorStatus] = useState<string | null>(null);
  const [isDraggingDial, setIsDraggingDial] = useState<boolean>(false);

  const dialSvgRef = useRef<SVGSVGElement | null>(null);
  const physRef = useRef<{ angle: number; velocity: number }>({ angle: 0, velocity: 0 });
  const rafRef = useRef<number | null>(null);

  // Magnetic declination approximation for Eastern Europe / globe
  const magneticDeclination = useMemo(() => {
    const base = 7.8 + (city.lng - 30.5) * 0.14 + (city.lat - 50.4) * 0.08;
    return Math.round(base * 10) / 10;
  }, [city.lat, city.lng]);

  const effectiveHeading = useMemo(() => {
    return normalizeDegrees(
      trueNorthMode ? displayHeading : displayHeading - magneticDeclination
    );
  }, [displayHeading, trueNorthMode, magneticDeclination]);

  const windDirection = weather?.windDirection ?? 245;
  const windSpeed = weather?.windSpeed ?? 12;

  const solarData = useMemo(
    () => computeSolarAzimuth(city.lat, city.lng, new Date()),
    [city.lat, city.lng]
  );

  const selectedLandmark = useMemo(
    () => LANDMARK_TARGETS.find((l) => l.id === selectedLandmarkId) || LANDMARK_TARGETS[0],
    [selectedLandmarkId]
  );

  const landmarkTelemetry = useMemo(
    () =>
      calculateBearingAndDistance(
        city.lat,
        city.lng,
        selectedLandmark.lat,
        selectedLandmark.lng
      ),
    [city.lat, city.lng, selectedLandmark]
  );

  // Smooth spring-damped needle & dial physics loop
  useEffect(() => {
    const step = () => {
      const p = physRef.current;
      const delta = shortestAngleDelta(p.angle, targetHeading);
      const stiffness = isDraggingDial ? 0.35 : 0.14;
      const damping = isDraggingDial ? 0.65 : 0.78;

      p.velocity = (p.velocity + delta * stiffness) * damping;
      p.angle = normalizeDegrees(p.angle + p.velocity);

      setDisplayHeading(p.angle);

      if (Math.abs(delta) > 0.05 || Math.abs(p.velocity) > 0.04) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        p.angle = normalizeDegrees(targetHeading);
        p.velocity = 0;
        setDisplayHeading(p.angle);
        rafRef.current = null;
      }
    };

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetHeading, isDraggingDial]);

  // DeviceOrientation sensor listener when enabled
  useEffect(() => {
    if (!sensorActive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as any).webkitCompassHeading;
      if (typeof webkitHeading === 'number' && !Number.isNaN(webkitHeading)) {
        setTargetHeading(normalizeDegrees(webkitHeading));
      } else if (typeof e.alpha === 'number' && e.alpha !== null) {
        setTargetHeading(normalizeDegrees(360 - e.alpha));
      }
    };

    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [sensorActive]);

  const handleToggleSensor = async () => {
    if (sensorActive) {
      setSensorActive(false);
      setSensorStatus('Ручний режим калібрування');
      window.setTimeout(() => setSensorStatus(null), 2500);
      return;
    }

    try {
      const DevOrient = DeviceOrientationEvent as any;
      if (typeof DevOrient?.requestPermission === 'function') {
        const perm = await DevOrient.requestPermission();
        if (perm !== 'granted') {
          setSensorStatus('Доступ до магнітометра відхилено браузером');
          return;
        }
      }
      setSensorActive(true);
      setSensorStatus('Магнітометр активовано (обертайте пристрій або диск)');
      window.setTimeout(() => setSensorStatus(null), 3000);
    } catch {
      setSensorStatus('Датчик орієнтації недоступний на ПК — обертайте лімб мишкою');
      window.setTimeout(() => setSensorStatus(null), 3500);
    }
  };

  // Pointer drag directly on the compass dial to rotate heading interactively
  const updateHeadingFromPointer = useCallback((clientX: number, clientY: number) => {
    const svg = dialSvgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientX - cx, -(clientY - cy));
    const deg = normalizeDegrees((rad * 180) / Math.PI);
    setTargetHeading(deg);
  }, []);

  const handleDialPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingDial(true);
    updateHeadingFromPointer(e.clientX, e.clientY);
  };

  const handleDialPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingDial) return;
    e.stopPropagation();
    updateHeadingFromPointer(e.clientX, e.clientY);
  };

  const handleDialPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingDial) return;
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    setIsDraggingDial(false);
  };

  const cardinalInfo = getCardinalFullDescription(effectiveHeading);
  const roundedHeading = Math.round(effectiveHeading);

  // Generate 72 ticks around the 360° compass bezel (every 5°)
  const dialTicks = useMemo(() => {
    const ticks = [];
    for (let deg = 0; deg < 360; deg += 5) {
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      const isMedium = deg % 15 === 0;
      ticks.push({ deg, isCardinal, isMajor, isMedium });
    }
    return ticks;
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                Навігаційний Компас та Азимут
              </h3>
              <p className="text-[11px] text-stone-400 truncate">
                {city.name} · {city.lat.toFixed(2)}°N, {city.lng.toFixed(2)}°E · Схилення +{magneticDeclination}°
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setTrueNorthMode(!trueNorthMode)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                trueNorthMode
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  : 'glass-pill text-stone-300 hover:text-white'
              }`}
              title="Перемкнути між Істинною (географічною) та Магнітною північчю"
            >
              {trueNorthMode ? 'Істинна Пн' : 'Магнітна Пн'}
            </button>

            <button
              type="button"
              onClick={handleToggleSensor}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                sensorActive
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                  : 'glass-pill text-stone-300 hover:text-white'
              }`}
              title="Увімкнути живий гіроскоп / магнітометр пристрою"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setTargetHeading(0)}
              className="p-1.5 rounded-lg glass-pill text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
              title="Вирівняти строго на Північ (0°)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {sensorStatus && (
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-amber-200 flex items-center justify-between">
            <span>{sensorStatus}</span>
            <button
              type="button"
              onClick={() => setSensorStatus(null)}
              className="text-stone-400 hover:text-white cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Interactive Compass Stage + Live Telemetry Readouts */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
          {/* Interactive 360° SVG Compass Rose */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center select-none">
            {/* Ambient radial glow behind compass */}
            <div className="absolute inset-3 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

            {/* Top Fixed Lubber Line (Heading index marker) */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
            </div>

            <svg
              ref={dialSvgRef}
              viewBox="0 0 240 240"
              onPointerDown={handleDialPointerDown}
              onPointerMove={handleDialPointerMove}
              onPointerUp={handleDialPointerUp}
              onPointerCancel={handleDialPointerUp}
              style={{ touchAction: 'none' }}
              className="w-full h-full cursor-grab active:cursor-grabbing overflow-visible"
            >
              <defs>
                <radialGradient id="compassDialBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(28, 25, 23, 0.92)" />
                  <stop offset="75%" stopColor="rgba(12, 10, 9, 0.96)" />
                  <stop offset="100%" stopColor="rgba(24, 24, 27, 0.98)" />
                </radialGradient>
                <linearGradient id="northNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="southNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e7e5e4" />
                  <stop offset="100%" stopColor="#78716c" />
                </linearGradient>
              </defs>

              {/* Outer Bezel Ring */}
              <circle
                cx="120"
                cy="120"
                r="112"
                fill="url(#compassDialBg)"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1.5"
              />
              <circle
                cx="120"
                cy="120"
                r="104"
                fill="none"
                stroke="rgba(251, 191, 36, 0.22)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />

              {/* Rotating Azimuth Dial Group (rotates opposite to heading so current bearing aligns with top lubber mark) */}
              <g transform={`rotate(${(-effectiveHeading).toFixed(2)} 120 120)`}>
                {/* 72 Precision Degree Ticks */}
                {dialTicks.map(({ deg, isCardinal, isMajor, isMedium }) => {
                  const innerR = isCardinal ? 83 : isMajor ? 86 : isMedium ? 90 : 93;
                  const outerR = 98;
                  return (
                    <g key={deg} transform={`rotate(${deg} 120 120)`}>
                      <line
                        x1="120"
                        y1={120 - outerR}
                        x2="120"
                        y2={120 - innerR}
                        stroke={
                          deg === 0
                            ? '#f87171'
                            : isCardinal
                            ? '#fbbf24'
                            : isMajor
                            ? 'rgba(255,255,255,0.65)'
                            : 'rgba(255,255,255,0.25)'
                        }
                        strokeWidth={isCardinal ? '2.2' : isMajor ? '1.4' : '0.9'}
                        strokeLinecap="round"
                      />
                      {isMajor && !isCardinal && (
                        <text
                          x="120"
                          y={120 - 74}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="rgba(168, 162, 158, 0.85)"
                          fontSize="7.5"
                          fontFamily="monospace"
                        >
                          {deg}°
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 8 Cardinal & Intercardinal Labels */}
                {CARDINAL_POINTS.map((pt) => (
                  <g key={pt.label} transform={`rotate(${pt.deg} 120 120)`}>
                    <text
                      x="120"
                      y={pt.major ? 120 - 68 : 120 - 67}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={
                        pt.deg === 0
                          ? '#f87171'
                          : pt.major
                          ? '#fef3c7'
                          : 'rgba(214, 211, 209, 0.7)'
                      }
                      fontSize={pt.major ? '12' : '8.5'}
                      fontWeight={pt.major ? '700' : '600'}
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}

                {/* Compass Rose Geometric Star */}
                <polygon
                  points="120,66 126,114 174,120 126,126 120,174 114,126 66,120 114,114"
                  fill="rgba(251, 191, 36, 0.06)"
                  stroke="rgba(251, 191, 36, 0.22)"
                  strokeWidth="0.8"
                />

                {/* Live Wind Azimuth Marker on Rim (Sky Blue Vector) */}
                <g transform={`rotate(${windDirection} 120 120)`}>
                  <circle
                    cx="120"
                    cy="15"
                    r="6"
                    fill="rgba(14, 165, 233, 0.25)"
                    stroke="#38bdf8"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M120 22 L117 12 L120 14 L123 12 Z"
                    fill="#38bdf8"
                  />
                </g>

                {/* Live Solar Azimuth Marker on Rim (Golden Sun Orb) */}
                <g transform={`rotate(${solarData.azimuth} 120 120)`}>
                  <circle
                    cx="120"
                    cy="15"
                    r="6.5"
                    fill={
                      solarData.isDaylight
                        ? 'rgba(251, 191, 36, 0.3)'
                        : 'rgba(129, 140, 248, 0.25)'
                    }
                    stroke={solarData.isDaylight ? '#fbbf24' : '#818cf8'}
                    strokeWidth="1.4"
                  />
                  <circle
                    cx="120"
                    cy="15"
                    r="2.8"
                    fill={solarData.isDaylight ? '#fde047' : '#a5b4fc'}
                  />
                </g>

                {/* Selected Landmark Bearing Marker on Rim (Emerald Target Pin) */}
                <g transform={`rotate(${landmarkTelemetry.bearing} 120 120)`}>
                  <path
                    d="M120 23 L115 11 L120 13.5 L125 11 Z"
                    fill="#34d399"
                  />
                </g>

                {/* Magnetic North/South Precision Needle */}
                <g>
                  {/* North Half (Crimson Red) */}
                  <polygon
                    points="120,34 126.5,120 120,113 113.5,120"
                    fill="url(#northNeedleGrad)"
                  />
                  {/* South Half (Silver-Stone) */}
                  <polygon
                    points="120,204 126.5,120 120,127 113.5,120"
                    fill="url(#southNeedleGrad)"
                  />
                </g>
              </g>

              {/* Center Brass Pivot Cap & Digital Readout Hub */}
              <circle
                cx="120"
                cy="120"
                r="26"
                fill="rgba(12, 10, 9, 0.94)"
                stroke="rgba(251, 191, 36, 0.45)"
                strokeWidth="1.5"
              />
              <text
                x="120"
                y="117"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="700"
                fontFamily="monospace"
              >
                {String(roundedHeading).padStart(3, '0')}°
              </text>
              <text
                x="120"
                y="131"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fbbf24"
                fontSize="9.5"
                fontWeight="700"
              >
                {cardinalInfo.short}
              </text>
            </svg>
          </div>

          {/* Right Column: Telemetry Readouts & Quick Cardinal Controls */}
          <div className="flex-1 min-w-0 w-full space-y-3">
            {/* Primary Azimuth Readout */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Поточний азимут</span>
                <span className="font-data-mono text-amber-300">{cardinalInfo.intl}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <div className="text-2xl font-bold font-data-mono text-white tabular-nums">
                  {String(roundedHeading).padStart(3, '0')}°{' '}
                  <span className="text-base font-semibold text-amber-300">
                    {cardinalInfo.short}
                  </span>
                </div>
                <span className="text-xs text-stone-300 truncate">{cardinalInfo.full}</span>
              </div>

              {/* Fine Azimuth Scrubber Slider */}
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={359}
                  step={1}
                  value={roundedHeading}
                  onChange={(e) => setTargetHeading(Number(e.target.value))}
                  aria-label="Кут азимута компаса"
                  className="w-full h-1.5 rounded-lg appearance-none bg-white/15 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Cardinal Direction Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Пн 0°', deg: 0 },
                { label: 'Сх 90°', deg: 90 },
                { label: 'Пд 180°', deg: 180 },
                { label: 'Зх 270°', deg: 270 },
              ].map((btn) => {
                const isSelected = Math.abs(shortestAngleDelta(roundedHeading, btn.deg)) < 5;
                return (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => setTargetHeading(btn.deg)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium font-data-mono transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 font-semibold'
                        : 'glass-pill text-stone-300 hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Wind & Sun Azimuth Telemetry Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTargetHeading(windDirection)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-sky-500/10 border border-white/10 hover:border-sky-400/40 text-left transition-colors cursor-pointer"
                title="Натисніть, щоб повернути компас за напрямком вітру"
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Вітер</span>
                  </span>
                  <span className="font-data-mono text-sky-300 tabular-nums">
                    {windDirection}°
                  </span>
                </div>
                <div className="mt-1 font-semibold text-white font-data-mono tabular-nums">
                  {windSpeed} км/год · {getCardinalFullDescription(windDirection).short}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetHeading(solarData.azimuth)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 text-left transition-colors cursor-pointer"
                title="Натисніть, щоб навести компас на поточний азимут Сонця"
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span>Сонце</span>
                  </span>
                  <span className="font-data-mono text-amber-300 tabular-nums">
                    {Math.round(solarData.azimuth)}°
                  </span>
                </div>
                <div className="mt-1 font-semibold text-white font-data-mono tabular-nums">
                  Висота {solarData.elevation > 0 ? `+${solarData.elevation}` : solarData.elevation}°
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Geographic Landmark Bearing Finder */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-300">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Пеленг на природний орієнтир:</span>
          </div>
          <button
            type="button"
            onClick={() => setTargetHeading(landmarkTelemetry.bearing)}
            className="flex items-center gap-1 text-xs font-data-mono text-emerald-300 hover:text-emerald-200 cursor-pointer"
            title="Навести компас прямо на обраний орієнтир"
          >
            <Navigation className="w-3 h-3" />
            <span>
              Азимут {Math.round(landmarkTelemetry.bearing)}° · {landmarkTelemetry.distanceKm} км
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {LANDMARK_TARGETS.map((item) => {
            const active = item.id === selectedLandmark.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedLandmarkId(item.id);
                  const { bearing } = calculateBearingAndDistance(
                    city.lat,
                    city.lng,
                    item.lat,
                    item.lng
                  );
                  setTargetHeading(bearing);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 font-semibold'
                    : 'glass-pill text-stone-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
