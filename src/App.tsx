import React, { useState, useEffect, useCallback } from 'react';
import { WALLPAPERS } from './data/wallpapers';
import { NatureWallpaper, CurrentWeather, CityOption } from './types';
import { fetchLiveWeather, POPULAR_CITIES } from './services/weatherService';
import { ambientSoundEngine } from './services/ambientAudio';
import { HeaderBar } from './components/HeaderBar';
import { ClockCenterpiece } from './components/ClockCenterpiece';
import { WeatherCard } from './components/WeatherCard';
import { PrecipitationWidget } from './components/PrecipitationWidget';
import { MoonPhaseWidget } from './components/MoonPhaseWidget';
import { StarMapWidget } from './components/StarMapWidget';
import { EclipseAndCelestialWidget } from './components/EclipseAndCelestialWidget';
import { FactCard } from './components/FactCard';
import { WallpaperSwitcher } from './components/WallpaperSwitcher';
import { AmbientSoundPanel } from './components/AmbientSoundPanel';
import { MusicPlayerWidget } from './components/MusicPlayerWidget';
import { CompassWidget } from './components/CompassWidget';
import { ZenModeView } from './components/ZenModeView';
import { DraggableWidget } from './components/DraggableWidget';
import {
  InteractiveWeatherCanvas,
  NatureEffectType,
  resolveNatureEffect,
} from './components/InteractiveWeatherCanvas';
import { NatureEffectsBar } from './components/NatureEffectsBar';
import {
  Image,
  Compass,
  Volume2,
  Wind,
  CloudSun,
  CloudRain,
  Moon,
  Orbit,
  BookOpen,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Move,
  Shuffle,
  Music,
} from 'lucide-react';

export type WidgetId =
  | 'weather'
  | 'music'
  | 'compass'
  | 'precipitation'
  | 'moon'
  | 'starmap'
  | 'eclipses'
  | 'facts'
  | 'wallpapers'
  | 'sounds';

const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  'weather',
  'music',
  'compass',
  'precipitation',
  'moon',
  'starmap',
  'eclipses',
  'facts',
  'wallpapers',
  'sounds',
];

const DEFAULT_WIDE_WIDGETS: Record<WidgetId, boolean> = {
  weather: false,
  music: false,
  compass: false,
  precipitation: false,
  moon: false,
  starmap: false,
  eclipses: true,
  facts: false,
  wallpapers: false,
  sounds: true,
};

export default function App() {
  const [currentWallpaper, setCurrentWallpaper] = useState<NatureWallpaper>(WALLPAPERS[1]); // Start with Aurora Fjord or Carpathian Mist
  const [isWallpaperDrawerOpen, setIsWallpaperDrawerOpen] = useState(false);
  const [autoCycleInterval, setAutoCycleInterval] = useState(0); // 0 = off
  const [overlayOpacity, setOverlayOpacity] = useState(0.42);
  const [isWallpaperMotionEnabled, setIsWallpaperMotionEnabled] = useState(true);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'weather' | 'facts' | 'sounds'>('all');
  const [isMasterSoundActive, setIsMasterSoundActive] = useState(false);
  const [musicStatus, setMusicStatus] = useState<{ isPlaying: boolean; title: string }>({
    isPlaying: false,
    title: 'lofi beats · Спокій та фокус',
  });

  // Interactive Nature Effect State (default to rain so soaked widgets & falling droplets from widget tops are immediately visible, or switchable anytime)
  const [natureEffect, setNatureEffect] = useState<NatureEffectType>('rain');
  const [effectIntensity, setEffectIntensity] = useState<number>(1.0);
  const [isEffectsDrawerOpen, setIsEffectsDrawerOpen] = useState(false);

  // Weather State
  const [currentCity, setCurrentCity] = useState<CityOption>(POPULAR_CITIES[0]); // Kyiv default
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const { type: resolvedEffectType, label: resolvedEffectLabel } = resolveNatureEffect(
    natureEffect,
    weather,
    currentWallpaper.recommendedEffect
  );

  const handleMusicPlaybackChange = useCallback((playing: boolean, title: string) => {
    setMusicStatus((prev) =>
      prev.isPlaying === playing && prev.title === title
        ? prev
        : { isPlaying: playing, title }
    );
  }, []);

  // Subtle 3D Mouse Parallax for Brave Background
  useEffect(() => {
    if (!isWallpaperMotionEnabled) {
      setParallaxOffset({ x: 0, y: 0 });
      return;
    }
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * -18;
      const ny = (e.clientY / window.innerHeight - 0.5) * -12;
      setParallaxOffset({ x: nx, y: ny });
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isWallpaperMotionEnabled]);

  const handleNextWallpaper = useCallback(() => {
    setCurrentWallpaper((prev) => {
      const idx = WALLPAPERS.findIndex((w) => w.id === prev.id);
      return WALLPAPERS[(idx + 1) % WALLPAPERS.length];
    });
  }, []);

  // Widget Order, Collapse, Span & Free Offset State
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(() => {
    try {
      const saved = localStorage.getItem('naturedesk_widget_order_v1');
      if (saved) {
        const parsed = JSON.parse(saved) as WidgetId[];
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((id) => DEFAULT_WIDGET_ORDER.includes(id));
          const missing = DEFAULT_WIDGET_ORDER.filter((id) => !valid.includes(id));
          if (missing.length === 0 && valid.length === DEFAULT_WIDGET_ORDER.length) {
            return valid;
          }
          const merged = [...valid];
          missing.forEach((mId) => {
            const defaultIdx = DEFAULT_WIDGET_ORDER.indexOf(mId);
            merged.splice(Math.min(defaultIdx, merged.length), 0, mId);
          });
          return merged;
        }
      }
    } catch {}
    return DEFAULT_WIDGET_ORDER;
  });

  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('naturedesk_collapsed_widgets_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [wideWidgets, setWideWidgets] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('naturedesk_wide_widgets_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WIDE_WIDGETS;
  });

  const [freePositionMode] = useState<boolean>(true);

  const [widgetOffsets, setWidgetOffsets] = useState<Record<string, { x: number; y: number }>>(
    () => {
      try {
        const saved = localStorage.getItem('naturedesk_widget_offsets_v1');
        if (saved) return JSON.parse(saved);
      } catch {}
      return {};
    }
  );

  const [draggedWidgetId, setDraggedWidgetId] = useState<WidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<WidgetId | null>(null);
  const [orderHistory, setOrderHistory] = useState<WidgetId[][]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('naturedesk_widget_order_v1', JSON.stringify(widgetOrder));
    } catch {}
  }, [widgetOrder]);

  useEffect(() => {
    try {
      localStorage.setItem('naturedesk_collapsed_widgets_v1', JSON.stringify(collapsedWidgets));
    } catch {}
  }, [collapsedWidgets]);

  useEffect(() => {
    try {
      localStorage.setItem('naturedesk_wide_widgets_v1', JSON.stringify(wideWidgets));
    } catch {}
  }, [wideWidgets]);

  useEffect(() => {
    try {
      localStorage.setItem('naturedesk_free_mode_v1', String(freePositionMode));
    } catch {}
  }, [freePositionMode]);

  useEffect(() => {
    try {
      localStorage.setItem('naturedesk_widget_offsets_v1', JSON.stringify(widgetOffsets));
    } catch {}
  }, [widgetOffsets]);

  const handleToggleCollapse = (id: string) => {
    setCollapsedWidgets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleWide = (id: string) => {
    setWideWidgets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSaveOffset = useCallback((id: string, offset: { x: number; y: number }) => {
    setWidgetOffsets((prev) => ({
      ...prev,
      [id]: offset,
    }));
  }, []);

  const handleStartPointerDrag = useCallback((id: string) => {
    setDraggedWidgetId(id as WidgetId);
  }, []);

  const handleHoverTargetWidget = useCallback((targetId: string | null) => {
    setDragOverWidgetId(targetId as WidgetId | null);
  }, []);

  const handleEndPointerDrag = useCallback((sourceId: string, targetId: string | null) => {
    if (targetId && sourceId !== targetId) {
      setWidgetOrder((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(sourceId as WidgetId);
        const toIdx = next.indexOf(targetId as WidgetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        setOrderHistory((hist) => [...hist.slice(-9), prev]);
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, sourceId as WidgetId);
        return next;
      });
      setWidgetOffsets((prev) => ({
        ...prev,
        [sourceId]: { x: 0, y: 0 },
        [targetId]: { x: 0, y: 0 },
      }));
    }
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  }, []);

  const handleMoveOffset = (id: string, direction: 'up' | 'down') => {
    setWidgetOrder((prev) => {
      const idx = prev.indexOf(id as WidgetId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      setOrderHistory((hist) => [...hist.slice(-9), prev]);
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleRestorePreviousOrder = useCallback(() => {
    setOrderHistory((hist) => {
      if (hist.length === 0) {
        setWidgetOrder(DEFAULT_WIDGET_ORDER);
        return [];
      }
      const previous = hist[hist.length - 1];
      setWidgetOrder(previous);
      return hist.slice(0, -1);
    });
  }, []);

  const allCollapsed = DEFAULT_WIDGET_ORDER.every((id) => collapsedWidgets[id]);

  const handleToggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedWidgets({});
    } else {
      const next: Record<string, boolean> = {};
      DEFAULT_WIDGET_ORDER.forEach((id) => {
        next[id] = true;
      });
      setCollapsedWidgets(next);
    }
  };

  const handleResetLayout = () => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
    setCollapsedWidgets({});
    setWideWidgets(DEFAULT_WIDE_WIDGETS);
    setWidgetOffsets({});
  };

  // Load weather
  const loadWeather = useCallback(async (city: CityOption) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchLiveWeather(city.lat, city.lng, city.name, city.country);
      setWeather(data);
    } catch {
      setWeatherError('Не вдалося отримати поточні дані погоди');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(currentCity);
  }, [currentCity, loadWeather]);

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setWeatherError('Геолокація не підтримується цим браузером');
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const userCity: CityOption = {
            name: 'Моє місцезнаходження',
            country: 'Україна',
            lat: latitude,
            lng: longitude,
          };
          setCurrentCity(userCity);
        } catch {
          loadWeather(POPULAR_CITIES[0]);
        }
      },
      () => {
        setWeatherLoading(false);
      }
    );
  };

  // Wallpaper Auto-Cycle
  useEffect(() => {
    if (autoCycleInterval <= 0) return;
    const interval = setInterval(() => {
      setCurrentWallpaper((prev) => {
        const currentIndex = WALLPAPERS.findIndex((w) => w.id === prev.id);
        const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
        return WALLPAPERS[nextIndex];
      });
    }, autoCycleInterval * 1000);
    return () => clearInterval(interval);
  }, [autoCycleInterval]);

  // Master Sound toggle
  const handleToggleMasterSound = () => {
    if (isMasterSoundActive) {
      ambientSoundEngine.stopAll();
      setIsMasterSoundActive(false);
    } else {
      ambientSoundEngine.setRain(true, 0.4);
      setIsMasterSoundActive(true);
    }
  };

  const getHeaderEffectDisplay = () => {
    if (natureEffect === 'auto' || natureEffect === 'wallpaper_match') {
      return `Ефект: ${resolvedEffectLabel}`;
    }
    const map: Record<NatureEffectType, string> = {
      auto: 'За погодою',
      wallpaper_match: 'Під фон',
      rain: 'Дощ',
      thunderstorm: 'Гроза',
      snow: 'Снігопад',
      mist: 'Туман',
      leaves: 'Листопад',
      sakura: 'Сакура',
      aurora: 'Північне сяйво',
      shooting_stars: 'Зорепад',
      sunbeams: 'Промені',
      fireflies: 'Світлячки',
      none: 'Без ефектів',
    };
    return `Ефект: ${map[natureEffect]}`;
  };

  const sharedDragProps = (id: WidgetId) => ({
    id,
    gridIndex: widgetOrder.indexOf(id),
    isCollapsed: !!collapsedWidgets[id],
    onToggleCollapse: handleToggleCollapse,
    isWide: !!wideWidgets[id],
    onToggleWide: handleToggleWide,
    freePositionMode,
    savedOffset: widgetOffsets[id] || { x: 0, y: 0 },
    onSaveOffset: handleSaveOffset,
    onStartPointerDrag: handleStartPointerDrag,
    onHoverTargetWidget: handleHoverTargetWidget,
    onEndPointerDrag: handleEndPointerDrag,
    onMoveOffset: handleMoveOffset,
    onRestorePreviousOrder: handleRestorePreviousOrder,
    hasOrderChanged:
      orderHistory.length > 0 ||
      widgetOrder.indexOf(id) !== DEFAULT_WIDGET_ORDER.indexOf(id),
    weatherEffect: resolvedEffectType,
    isDragging: draggedWidgetId === id,
    isDragOver: dragOverWidgetId === id,
  });

  const renderWidgetById = (id: WidgetId) => {
    switch (id) {
      case 'weather':
        return (
          <DraggableWidget
            key="weather"
            {...sharedDragProps('weather')}
            title="Погода в реальному часі"
            summary={
              weather
                ? `${weather.temp > 0 ? `+${weather.temp}` : weather.temp}°C · ${weather.city}`
                : currentCity.name
            }
            icon={<CloudSun className="w-3.5 h-3.5 text-amber-300" />}
          >
            <WeatherCard
              weather={weather}
              loading={weatherLoading}
              onRefresh={() => loadWeather(currentCity)}
              onSelectCity={(city) => setCurrentCity(city)}
              onDetectLocation={handleDetectLocation}
            />
          </DraggableWidget>
        );

      case 'music':
        return (
          <DraggableWidget
            key="music"
            {...sharedDragProps('music')}
            title="Spotify · Музичний плеєр"
            summary={
              musicStatus.isPlaying
                ? `Грає: ${musicStatus.title}`
                : musicStatus.title
            }
            icon={<Music className="w-3.5 h-3.5 text-[#1ED760]" />}
          >
            <MusicPlayerWidget
              onPlaybackChange={handleMusicPlaybackChange}
            />
          </DraggableWidget>
        );

      case 'compass':
        return (
          <DraggableWidget
            key="compass"
            {...sharedDragProps('compass')}
            title="Навігаційний Компас та Азимут"
            summary={
              weather
                ? `${weather.city} · Вітер ${weather.windDirection}°`
                : `${currentCity.name} · 360°`
            }
            icon={<Compass className="w-3.5 h-3.5 text-amber-300" />}
          >
            <CompassWidget weather={weather} city={currentCity} />
          </DraggableWidget>
        );

      case 'precipitation':
        return (
          <DraggableWidget
            key="precipitation"
            {...sharedDragProps('precipitation')}
            title="Опади та Метео-радар"
            summary={
              weather
                ? `Ймовірність ${weather.precipitationProbability}% · ${weather.precipitation} мм`
                : 'Прогноз 12 год'
            }
            icon={<CloudRain className="w-3.5 h-3.5 text-sky-400" />}
          >
            <PrecipitationWidget
              weather={weather}
              onTriggerRainEffect={() => setNatureEffect('rain')}
            />
          </DraggableWidget>
        );

      case 'moon':
        return (
          <DraggableWidget
            key="moon"
            {...sharedDragProps('moon')}
            title="Вигляд Місяця та Фази"
            summary="Місячний календар"
            icon={<Moon className="w-3.5 h-3.5 text-amber-300" />}
          >
            <MoonPhaseWidget />
          </DraggableWidget>
        );

      case 'starmap':
        return (
          <DraggableWidget
            key="starmap"
            {...sharedDragProps('starmap')}
            title="Інтерактивна Зоряна Карта"
            summary={currentCity.name}
            icon={<Compass className="w-3.5 h-3.5 text-indigo-300" />}
          >
            <StarMapWidget
              cityName={currentCity.name}
              lat={currentCity.lat}
              lng={currentCity.lng}
            />
          </DraggableWidget>
        );

      case 'eclipses':
        return (
          <DraggableWidget
            key="eclipses"
            {...sharedDragProps('eclipses')}
            title="Повні Затемнення, Зорепади та Планети"
            summary="Найближче повне: 2 серп. 2027"
            icon={<Orbit className="w-3.5 h-3.5 text-amber-300" />}
          >
            <EclipseAndCelestialWidget />
          </DraggableWidget>
        );

      case 'facts':
        return (
          <DraggableWidget
            key="facts"
            {...sharedDragProps('facts')}
            title="Факти та Мудрість дня"
            summary="Пізнавальна картка"
            icon={<BookOpen className="w-3.5 h-3.5 text-amber-300" />}
          >
            <FactCard />
          </DraggableWidget>
        );

      case 'wallpapers':
        return (
          <DraggableWidget
            key="wallpapers"
            {...sharedDragProps('wallpapers')}
            title="Фони у стилі Brave"
            summary={currentWallpaper.title}
            icon={<Image className="w-3.5 h-3.5 text-amber-300" />}
          >
            <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-amber-300" />
                    <h3 className="text-sm font-semibold text-white">
                      Колекція фонів Brave ({WALLPAPERS.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNextWallpaper}
                      className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
                      title="Випадковий / Наступний фон"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Наступний</span>
                    </button>
                    <span className="text-stone-600">·</span>
                    <button
                      onClick={() => setIsWallpaperDrawerOpen(true)}
                      className="text-xs text-amber-300 hover:underline cursor-pointer"
                    >
                      Галерея
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => setCurrentWallpaper(wp)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        currentWallpaper.id === wp.id
                          ? 'bg-white/15 border-amber-400/50 ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={wp.imageSrc}
                        alt={wp.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-9 object-cover rounded-lg shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{wp.title}</div>
                        <div className="text-[10px] text-stone-400 truncate">{wp.location}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span>{currentWallpaper.credit || 'Колекція Brave Nature'}</span>
                <span className="text-stone-200 font-medium truncate max-w-[160px]">
                  {currentWallpaper.location}
                </span>
              </div>
            </div>
          </DraggableWidget>
        );

      case 'sounds':
        return (
          <DraggableWidget
            key="sounds"
            {...sharedDragProps('sounds')}
            title="Звуковий супровід природи"
            summary={isMasterSoundActive ? 'Відтворюється' : 'Дощ, ліс, багаття, океан'}
            icon={<Volume2 className="w-3.5 h-3.5 text-amber-300" />}
          >
            <AmbientSoundPanel
              isMasterActive={isMasterSoundActive}
              onToggleMaster={handleToggleMasterSound}
            />
          </DraggableWidget>
        );
    }
  };

  const visibleWidgetsForTab = (): WidgetId[] => {
    if (activeTab === 'all') return widgetOrder;
    if (activeTab === 'weather') {
      const weatherSet: WidgetId[] = [
        'weather',
        'compass',
        'precipitation',
        'moon',
        'starmap',
        'eclipses',
      ];
      return widgetOrder.filter((id) => weatherSet.includes(id));
    }
    if (activeTab === 'facts') return ['facts'];
    if (activeTab === 'sounds') {
      const soundSet: WidgetId[] = ['music', 'sounds'];
      return widgetOrder.filter((id) => soundSet.includes(id));
    }
    return widgetOrder;
  };

  return (
    <div className="relative min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic Nature Background with Ken Burns & 3D Mouse Parallax */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950/40" />

        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: isWallpaperMotionEnabled
              ? `translate3d(${parallaxOffset.x.toFixed(1)}px, ${parallaxOffset.y.toFixed(1)}px, 0)`
              : 'none',
          }}
        >
          <img
            key={currentWallpaper.id}
            src={currentWallpaper.imageSrc}
            alt={currentWallpaper.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out filter saturate-[1.08] ${
              isWallpaperMotionEnabled ? 'animate-ken-burns' : 'scale-105'
            }`}
          />
        </div>

        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(10, 12, 16, ${overlayOpacity})`,
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: currentWallpaper.palette.ambientGlow }}
        />
      </div>

      {/* Interactive Weather & Cosmic Canvas */}
      <InteractiveWeatherCanvas
        weather={weather}
        effectType={natureEffect}
        recommendedWallpaperEffect={currentWallpaper.recommendedEffect}
        intensity={effectIntensity}
      />

      {/* Zen Mode View */}
      {isZenMode ? (
        <ZenModeView
          wallpaper={currentWallpaper}
          weather={weather}
          onExitZen={() => setIsZenMode(false)}
          onOpenWallpaperDrawer={() => setIsWallpaperDrawerOpen(true)}
          isSoundPlaying={isMasterSoundActive}
          onToggleSound={handleToggleMasterSound}
          onOpenEffectsDrawer={() => setIsEffectsDrawerOpen(true)}
          effectLabel={getHeaderEffectDisplay()}
        />
      ) : (
        <div className="relative z-20 flex flex-col min-h-screen">
          <HeaderBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isZenMode={isZenMode}
            setIsZenMode={setIsZenMode}
            isSoundPlaying={isMasterSoundActive}
            onToggleMasterSound={handleToggleMasterSound}
            onOpenWallpaperDrawer={() => setIsWallpaperDrawerOpen(true)}
            wallpaperTitle={currentWallpaper.title}
            onOpenEffectsDrawer={() => setIsEffectsDrawerOpen(true)}
            effectLabel={getHeaderEffectDisplay()}
          />

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-between">
            {/* Centerpiece Clock & Date */}
            <ClockCenterpiece
              sunriseTime={weather?.sunrise}
              sunsetTime={weather?.sunset}
            />

            {/* Quick Interactive Nature, Brave Wallpaper & Jelly Window Control Ribbon */}
            <div className="my-2 flex items-center justify-center">
              <div className="glass-panel-subtle px-4 py-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-center gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-stone-300">
                  <Wind className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>
                    Жива анімація: <strong>{resolvedEffectLabel}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    onClick={() => setNatureEffect('rain')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resolvedEffectType === 'rain'
                        ? 'bg-sky-500/30 text-sky-200 border border-sky-400/50 font-semibold'
                        : 'glass-pill hover:bg-white/15 text-stone-200'
                    }`}
                    title="Дощ: віджети намокають і з них зверху капають краплі"
                  >
                    🌧️ Дощ
                  </button>
                  <button
                    onClick={() => setNatureEffect('snow')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resolvedEffectType === 'snow'
                        ? 'bg-sky-200/25 text-white border border-sky-200/50 font-semibold'
                        : 'glass-pill hover:bg-white/15 text-stone-200'
                    }`}
                    title="Снігопад: снігові шапки та бурульки на віджетах"
                  >
                    ❄️ Сніг
                  </button>
                  <button
                    onClick={() => setNatureEffect('leaves')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resolvedEffectType === 'leaves'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 font-semibold'
                        : 'glass-pill hover:bg-white/15 text-stone-200'
                    }`}
                    title="Листопад: осіннє листя на вікнах"
                  >
                    🍂 Листя
                  </button>
                  <button
                    onClick={() => setNatureEffect('thunderstorm')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      resolvedEffectType === 'thunderstorm'
                        ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 font-semibold'
                        : 'glass-pill hover:bg-white/15 text-stone-200'
                    }`}
                    title="Гроза: злива з краплями та спалахи блискавки на вікнах"
                  >
                    ⚡ Гроза
                  </button>
                  <button
                    onClick={() => setIsEffectsDrawerOpen(true)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Усі ефекти (10+)
                  </button>
                  <button
                    onClick={handleNextWallpaper}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Перемкнути на наступний фон у стилі Brave"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Наступний фон</span>
                  </button>
                  <button
                    onClick={() => setIsWallpaperDrawerOpen(true)}
                    className="px-2.5 py-1 glass-pill hover:bg-white/15 text-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Усі фони ({WALLPAPERS.length})
                  </button>
                  <button
                    onClick={handleToggleCollapseAll}
                    className="px-2.5 py-1 glass-pill hover:bg-white/15 text-stone-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Скрутити або розгорнути всі віджети одночасно"
                  >
                    {allCollapsed ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
                        <span>Розгорнути всі</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 text-stone-300" />
                        <span>Скрутити всі</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleResetLayout}
                    className="px-2.5 py-1 glass-pill hover:bg-white/15 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Скинути порядок та координати вікон за замовчуванням (або двічі клікніть по перетягнутому вікну)"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Скинути вікна</span>
                  </button>
                </div>
              </div>
            </div>

            {weatherError && (
              <div className="my-2 text-center text-xs text-amber-300">{weatherError}</div>
            )}

            {/* Draggable & Collapsible Jelly Widgets Grid */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {visibleWidgetsForTab().map((id) => renderWidgetById(id))}
            </div>
          </main>

          {/* Desktop Footer with Brave-style Photo Attribution */}
          <footer className="w-full mt-8 py-5 border-t border-white/10 glass-panel-subtle text-xs text-stone-400">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="font-serif-display font-medium text-stone-200 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Перезавантажити сторінку"
                >
                  СЬОГОДНІ
                </button>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300/90 font-medium">{currentWallpaper.title}</span>
                <span aria-hidden="true">·</span>
                <span>{currentWallpaper.location}</span>
              </div>
              <div className="flex items-center gap-4 text-stone-400">
                <button
                  onClick={handleNextWallpaper}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Наступний фон ↻
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setIsEffectsDrawerOpen(true)}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Анімації неба
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setIsZenMode(true)}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Режим споглядання
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Wallpaper Switcher Modal */}
      <WallpaperSwitcher
        currentWallpaper={currentWallpaper}
        onSelectWallpaper={(wp) => setCurrentWallpaper(wp)}
        autoCycleInterval={autoCycleInterval}
        setAutoCycleInterval={setAutoCycleInterval}
        overlayOpacity={overlayOpacity}
        setOverlayOpacity={setOverlayOpacity}
        isWallpaperMotionEnabled={isWallpaperMotionEnabled}
        setIsWallpaperMotionEnabled={setIsWallpaperMotionEnabled}
        isOpen={isWallpaperDrawerOpen}
        onClose={() => setIsWallpaperDrawerOpen(false)}
      />

      {/* Nature Effects Settings Modal */}
      <NatureEffectsBar
        currentEffect={natureEffect}
        onSelectEffect={(eff) => setNatureEffect(eff)}
        resolvedEffectLabel={resolvedEffectLabel}
        intensity={effectIntensity}
        setIntensity={setEffectIntensity}
        isOpen={isEffectsDrawerOpen}
        onClose={() => setIsEffectsDrawerOpen(false)}
      />
    </div>
  );
}
