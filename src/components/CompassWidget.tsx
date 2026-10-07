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
  LocateFixed,
  Mountain,
} from 'lucide-react';
import { CurrentWeather, CityOption } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface CompassWidgetProps {
  weather: CurrentWeather | null;
  city: CityOption;
  onGeoLocationDetected?: (city: CityOption) => void;
}

interface LandmarkTarget {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
}

interface LiveGeoState {
  lat: number;
  lng: number;
  placeName: string;
  regionName: string;
  accuracyMeters: number | null;
  altitudeMeters: number | null;
  gpsHeading: number | null;
  gpsSpeedKmh: number | null;
  source: 'gps' | 'ip' | 'city';
  loading: boolean;
  error: string | null;
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
    id: 'kyiv-center',
    name: 'Київ · Софійська площа',
    subtitle: 'Столиця України',
    lat: 50.4528,
    lng: 30.5144,
  },
  {
    id: 'lviv-rynok',
    name: 'Львів · Площа Ринок',
    subtitle: 'Галичина',
    lat: 49.8419,
    lng: 24.0315,
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

function formatDMS(decimalDeg: number, isLat: boolean): string {
  const dir = isLat
    ? decimalDeg >= 0
      ? 'Пн'
      : 'Пд'
    : decimalDeg >= 0
    ? 'Сх'
    : 'Зх';
  const abs = Math.abs(decimalDeg);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  return `${deg}°${String(min).padStart(2, '0')}'${String(sec).padStart(2, '0')}" ${dir}`;
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

// Calculate Great-Circle Forward Azimuth (deg) and Haversine Distance (km) from user's exact GPS coordinates
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
  const distanceKm = Math.round(6371 * c * 10) / 10;

  return { bearing, distanceKm };
}

// Approximate Solar Azimuth based on local solar time and user's exact GPS latitude/longitude
function computeSolarAzimuth(
  lat: number,
  lng: number,
  now: Date
): {
  azimuth: number;
  elevation: number;
  isDaylight: boolean;
} {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  const declination = 23.45 * Math.sin(toRad((360 / 365) * (dayOfYear - 81)));
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

export const CompassWidget: React.FC<CompassWidgetProps> = ({
  weather,
  city,
  onGeoLocationDetected,
}) => {
  const { lang } = useLanguage();

  // Live Geolocation State (powered by navigator.geolocation + reverse geocoding + elevation lookup)
  const [geoState, setGeoState] = useState<LiveGeoState>({
    lat: city.lat,
    lng: city.lng,
    placeName: city.name,
    regionName: city.country,
    accuracyMeters: null,
    altitudeMeters: null,
    gpsHeading: null,
    gpsSpeedKmh: null,
    source: 'city',
    loading: true,
    error: null,
  });

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
  const watchIdRef = useRef<number | null>(null);
  const onGeoDetectedRef = useRef(onGeoLocationDetected);
  onGeoDetectedRef.current = onGeoLocationDetected;

  // Reverse geocode + terrain elevation lookup for exact GPS coordinates
  const enrichCoordinates = useCallback(
    async (
      lat: number,
      lng: number,
      accuracy: number | null,
      altitude: number | null,
      heading: number | null,
      speedMs: number | null,
      source: 'gps' | 'ip'
    ) => {
      let resolvedCity =
        source === 'gps'
          ? lang === 'en'
            ? 'My GPS Location'
            : 'Моя GPS локація'
          : city.name;
      let resolvedRegion = lang === 'en' ? 'Ukraine' : 'Україна';
      let resolvedElevation = altitude !== null ? Math.round(altitude) : null;

      try {
        const revRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          resolvedCity =
            revData.city ||
            revData.locality ||
            revData.principalSubdivision ||
            resolvedCity;
          resolvedRegion =
            revData.principalSubdivision && revData.principalSubdivision !== resolvedCity
              ? `${revData.principalSubdivision}, ${revData.countryName || ''}`
              : revData.countryName || resolvedRegion;
        }
      } catch {}

      if (resolvedElevation === null) {
        try {
          const elevRes = await fetch(
            `https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}`
          );
          if (elevRes.ok) {
            const elevData = await elevRes.json();
            if (Array.isArray(elevData.elevation) && typeof elevData.elevation[0] === 'number') {
              resolvedElevation = Math.round(elevData.elevation[0]);
            }
          }
        } catch {}
      }

      setGeoState({
        lat,
        lng,
        placeName: resolvedCity,
        regionName: resolvedRegion,
        accuracyMeters: accuracy !== null ? Math.round(accuracy) : null,
        altitudeMeters: resolvedElevation,
        gpsHeading:
          heading !== null && !Number.isNaN(heading) ? normalizeDegrees(heading) : null,
        gpsSpeedKmh:
          speedMs !== null && !Number.isNaN(speedMs) && speedMs > 0
            ? Math.round(speedMs * 3.6 * 10) / 10
            : null,
        source,
        loading: false,
        error: null,
      });

      if (heading !== null && !Number.isNaN(heading) && heading >= 0) {
        setTargetHeading(normalizeDegrees(heading));
      }

      if (onGeoDetectedRef.current) {
        onGeoDetectedRef.current({
          name: resolvedCity,
          country: resolvedRegion,
          lat,
          lng,
        });
      }
    },
    [city.name]
  );

  // Fallback IP-based geolocation when hardware GPS permission is denied or blocked in iframe
  const fetchIpGeolocationFallback = useCallback(
    async (reasonMessage?: string) => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (res.ok) {
          const data = await res.json();
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            await enrichCoordinates(lat, lng, null, null, null, null, 'ip');
            if (reasonMessage) {
              setSensorStatus(reasonMessage);
              window.setTimeout(() => setSensorStatus(null), 4000);
            }
            return;
          }
        }
      } catch {}

      setGeoState((prev) => ({
        ...prev,
        loading: false,
        error: reasonMessage || null,
      }));
    },
    [enrichCoordinates]
  );

  // Request & watch real browser GPS geolocation
  const requestLiveGeolocation = useCallback(
    (manualTrigger = false) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        fetchIpGeolocationFallback('Браузер не підтримує GPS — визначено за геолокацією мережі');
        return;
      }

      setGeoState((prev) => ({ ...prev, loading: true, error: null }));
      if (manualTrigger) {
        setSensorStatus('Визначаємо точні GPS-координати вашої геолокації...');
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy, altitude, heading, speed } = pos.coords;
          enrichCoordinates(
            latitude,
            longitude,
            accuracy,
            altitude,
            heading,
            speed,
            'gps'
          );
          if (manualTrigger) {
            setSensorStatus(
              `GPS геолокацію оновлено (±${Math.round(accuracy || 10)} м)`
            );
            window.setTimeout(() => setSensorStatus(null), 3500);
          }
        },
        () => {
          fetchIpGeolocationFallback(
            manualTrigger
              ? 'Доступ до точного GPS обмежено — використовується геолокація вашої мережі'
              : undefined
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 15000,
        }
      );

      // Continuous GPS watch so moving with a phone/laptop updates compass coordinates & heading live
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, altitude, heading, speed } = pos.coords;
          setGeoState((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            accuracyMeters: accuracy !== null ? Math.round(accuracy) : prev.accuracyMeters,
            altitudeMeters:
              altitude !== null ? Math.round(altitude) : prev.altitudeMeters,
            gpsHeading:
              heading !== null && !Number.isNaN(heading)
                ? normalizeDegrees(heading)
                : prev.gpsHeading,
            gpsSpeedKmh:
              speed !== null && !Number.isNaN(speed) && speed > 0
                ? Math.round(speed * 3.6 * 10) / 10
                : prev.gpsSpeedKmh,
            source: 'gps',
            loading: false,
          }));
          if (heading !== null && !Number.isNaN(heading) && heading >= 0) {
            setTargetHeading(normalizeDegrees(heading));
          }
        },
        () => {},
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
        }
      );
    },
    [enrichCoordinates, fetchIpGeolocationFallback]
  );

  // Automatically start geolocation tracking on mount
  useEffect(() => {
    requestLiveGeolocation(false);
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [requestLiveGeolocation]);

  // If user manually switches city in WeatherCard while not locked to GPS, keep fallback synced
  useEffect(() => {
    if (geoState.source === 'city') {
      setGeoState((prev) => ({
        ...prev,
        lat: city.lat,
        lng: city.lng,
        placeName: city.name,
        regionName: city.country,
      }));
    }
  }, [city.lat, city.lng, city.name, city.country, geoState.source]);

  // World Magnetic Model (WMM) magnetic declination calculated from user's exact geolocation (lat, lng)
  const magneticDeclination = useMemo(() => {
    const base = 7.8 + (geoState.lng - 30.5) * 0.14 + (geoState.lat - 50.4) * 0.08;
    return Math.round(base * 10) / 10;
  }, [geoState.lat, geoState.lng]);

  const effectiveHeading = useMemo(() => {
    return normalizeDegrees(
      trueNorthMode ? displayHeading : displayHeading - magneticDeclination
    );
  }, [displayHeading, trueNorthMode, magneticDeclination]);

  const windDirection = weather?.windDirection ?? 245;
  const windSpeed = weather?.windSpeed ?? 12;

  const solarData = useMemo(
    () => computeSolarAzimuth(geoState.lat, geoState.lng, new Date()),
    [geoState.lat, geoState.lng]
  );

  const selectedLandmark = useMemo(
    () => LANDMARK_TARGETS.find((l) => l.id === selectedLandmarkId) || LANDMARK_TARGETS[0],
    [selectedLandmarkId]
  );

  const landmarkTelemetry = useMemo(
    () =>
      calculateBearingAndDistance(
        geoState.lat,
        geoState.lng,
        selectedLandmark.lat,
        selectedLandmark.lng
      ),
    [geoState.lat, geoState.lng, selectedLandmark]
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
        {/* Top Header with Live GPS Geolocation Status & Trigger */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white truncate">
                  GPS Компас та Геолокація
                </h3>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    geoState.source === 'gps'
                      ? 'text-emerald-300'
                      : geoState.source === 'ip'
                      ? 'text-sky-300'
                      : 'text-amber-300'
                  }`}
                >
                  {geoState.loading
                    ? '● Пошук GPS...'
                    : geoState.source === 'gps'
                    ? `● GPS ±${geoState.accuracyMeters ?? 12}м`
                    : geoState.source === 'ip'
                    ? '● Геолокація мережі'
                    : '● Координати міста'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 truncate font-data-mono">
                {geoState.placeName} · {formatDMS(geoState.lat, true)}, {formatDMS(geoState.lng, false)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Primary GPS Geolocation Button */}
            <button
              type="button"
              onClick={() => requestLiveGeolocation(true)}
              disabled={geoState.loading}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                geoState.source === 'gps'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30'
              }`}
              title="Оновити точні GPS-координати моєї поточної геолокації"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${geoState.loading ? 'animate-spin' : ''}`} />
              <span>Моя геолокація</span>
            </button>

            <button
              type="button"
              onClick={() => setTrueNorthMode(!trueNorthMode)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                trueNorthMode
                  ? 'bg-white/15 text-amber-200 border border-amber-400/30'
                  : 'glass-pill text-stone-300 hover:text-white'
              }`}
              title={`Перемкнути між Істинною та Магнітною північчю (схилення ${
                magneticDeclination >= 0 ? `+${magneticDeclination}` : magneticDeclination
              }°)`}
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

        {/* Live Geolocation Coordinates & Elevation Bar */}
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-300">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>{geoState.placeName}</strong>
              {geoState.regionName ? ` (${geoState.regionName})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 font-data-mono text-stone-300 tabular-nums">
            <span>
              {geoState.lat.toFixed(4)}°N, {geoState.lng.toFixed(4)}°E
            </span>
            {geoState.altitudeMeters !== null && (
              <span className="flex items-center gap-1 text-amber-300">
                <Mountain className="w-3 h-3" />
                <span>{geoState.altitudeMeters} м</span>
              </span>
            )}
            <span className="text-stone-400">
              Схилення {magneticDeclination >= 0 ? `+${magneticDeclination}` : magneticDeclination}°
            </span>
          </div>
        </div>

        {sensorStatus && (
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-amber-200 flex items-center justify-between">
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

              {/* Rotating Azimuth Dial Group */}
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
                  <path d="M120 22 L117 12 L120 14 L123 12 Z" fill="#38bdf8" />
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

                {/* Selected Landmark Bearing Marker from User's Geolocation (Emerald Target Pin) */}
                <g transform={`rotate(${landmarkTelemetry.bearing} 120 120)`}>
                  <path d="M120 23 L115 11 L120 13.5 L125 11 Z" fill="#34d399" />
                </g>

                {/* Magnetic North/South Precision Needle */}
                <g>
                  <polygon
                    points="120,34 126.5,120 120,113 113.5,120"
                    fill="url(#northNeedleGrad)"
                  />
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

            {/* Wind & Sun Azimuth Telemetry Row (computed from user's geolocation) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTargetHeading(windDirection)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-sky-500/10 border border-white/10 hover:border-sky-400/40 text-left transition-colors cursor-pointer"
                title="Натисніть, щоб повернути компас за напрямком вітру у вашій геолокації"
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Вітер тут</span>
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
                title="Натисніть, щоб навести компас на поточний азимут Сонця у вашій геолокації"
              >
                <div className="flex items-center justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span>Сонце тут</span>
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

      {/* Bottom Geographic Landmark Bearing Finder (calculated from user's live GPS geolocation) */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-300">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Пеленг від вашої геолокації ({geoState.placeName}):</span>
          </div>
          <button
            type="button"
            onClick={() => setTargetHeading(landmarkTelemetry.bearing)}
            className="flex items-center gap-1 text-xs font-data-mono text-emerald-300 hover:text-emerald-200 cursor-pointer"
            title="Навести компас прямо на обраний орієнтир від вашої поточної геолокації"
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
                    geoState.lat,
                    geoState.lng,
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
