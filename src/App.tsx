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
import { DailyIntentions } from './components/DailyIntentions';
import { ZenModeView } from './components/ZenModeView';
import {
  InteractiveWeatherCanvas,
  NatureEffectType,
} from './components/InteractiveWeatherCanvas';
import { NatureEffectsBar } from './components/NatureEffectsBar';
import { Sparkles, Image, Compass, Info, Heart, Volume2, Wind } from 'lucide-react';

export default function App() {
  const [currentWallpaper, setCurrentWallpaper] = useState<NatureWallpaper>(WALLPAPERS[0]);
  const [isWallpaperDrawerOpen, setIsWallpaperDrawerOpen] = useState(false);
  const [autoCycleInterval, setAutoCycleInterval] = useState(0); // 0 = off
  const [overlayOpacity, setOverlayOpacity] = useState(0.45);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'weather' | 'facts' | 'intentions' | 'sounds'>('all');
  const [isMasterSoundActive, setIsMasterSoundActive] = useState(false);

  // Interactive Nature Effect State
  const [natureEffect, setNatureEffect] = useState<NatureEffectType>('auto');
  const [effectIntensity, setEffectIntensity] = useState<number>(1.0);
  const [resolvedEffectLabel, setResolvedEffectLabel] = useState<string>('Сонячне проміння');
  const [isEffectsDrawerOpen, setIsEffectsDrawerOpen] = useState(false);

  // Weather State
  const [currentCity, setCurrentCity] = useState<CityOption>(POPULAR_CITIES[0]); // Kyiv default
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Load weather
  const loadWeather = useCallback(async (city: CityOption) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchLiveWeather(city.lat, city.lng, city.name, city.country);
      setWeather(data);
    } catch (err: any) {
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
        // Fallback to default
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
    if (natureEffect === 'auto') {
      return `Ефект: ${resolvedEffectLabel}`;
    }
    const map: Record<NatureEffectType, string> = {
      auto: 'За погодою',
      rain: 'Дощ',
      snow: 'Снігопад',
      mist: 'Туман',
      leaves: 'Листопад',
      sunbeams: 'Промені',
      fireflies: 'Світлячки',
      none: 'Без ефектів',
    };
    return `Ефект: ${map[natureEffect]}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic Nature Background with Fallback & Measured Contrast */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Styled CSS Fallback Container */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950/40" />

        {/* Real Generated High-Fidelity Nature Wallpaper */}
        <img
          src={currentWallpaper.imageSrc}
          alt={currentWallpaper.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out scale-105 filter saturate-[1.05]"
          style={{ opacity: 1 }}
        />

        {/* Dynamic Dark Gradient Dimmer for Readability */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(10, 12, 16, ${overlayOpacity})`,
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Ambient Subtle Accent Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: currentWallpaper.palette.ambientGlow }}
        />
      </div>

      {/* Interactive Weather & Nature Canvas (Rain, Snow, Mist, Leaves, Wind) */}
      <InteractiveWeatherCanvas
        weather={weather}
        effectType={natureEffect}
        intensity={effectIntensity}
        onAutoEffectResolved={(label) => setResolvedEffectLabel(label)}
      />

      {/* Zen Mode View (Fullscreen Minimalist Experience) */}
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
          {/* Top Bar Contract compliant navigation */}
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

          {/* Main Desktop Container (max-w-7xl 1440px wide baseline) */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-between">
            {/* Centerpiece Clock & Date */}
            <ClockCenterpiece
              sunriseTime={weather?.sunrise}
              sunsetTime={weather?.sunset}
            />

            {/* Quick Interactive Nature Control Ribbon */}
            <div className="my-2 flex items-center justify-center">
              <div className="glass-panel-subtle px-4 py-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-2 text-stone-300">
                  <Wind className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>
                    Живий ефект фону: <strong>{resolvedEffectLabel}</strong>
                    {natureEffect === 'auto' && (
                      <span className="text-stone-400 font-normal"> (синхронізовано з погодою)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEffectsDrawerOpen(true)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Змінити ефект атмосфери
                  </button>
                  <button
                    onClick={() => setIsWallpaperDrawerOpen(true)}
                    className="px-2.5 py-1 glass-pill hover:bg-white/15 text-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Змінити фото природи
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic View Sections */}
            {activeTab === 'all' && (
              <div className="mt-4 space-y-6">
                {/* Row 1: 2-Column Desktop Grid for Weather & Precipitation Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <div className="h-full">
                    <WeatherCard
                      weather={weather}
                      loading={weatherLoading}
                      onRefresh={() => loadWeather(currentCity)}
                      onSelectCity={(city) => setCurrentCity(city)}
                      onDetectLocation={handleDetectLocation}
                    />
                  </div>

                  <div className="h-full">
                    <PrecipitationWidget
                      weather={weather}
                      onTriggerRainEffect={() => setNatureEffect('rain')}
                    />
                  </div>
                </div>

                {/* Row 2: Moon Phase & Interactive Star Map */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <div className="h-full">
                    <MoonPhaseWidget />
                  </div>

                  <div className="h-full">
                    <StarMapWidget
                      cityName={currentCity.name}
                      lat={currentCity.lat}
                      lng={currentCity.lng}
                    />
                  </div>
                </div>

                {/* Row 3: Total Eclipses, Meteor Showers & Planets */}
                <div>
                  <EclipseAndCelestialWidget />
                </div>

                {/* Row 4: Facts, Intentions & Quick Nature Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  <div className="h-full">
                    <FactCard />
                  </div>
                  <div className="h-full">
                    <DailyIntentions />
                  </div>
                  <div className="h-full">
                    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-amber-300" />
                            <h3 className="text-sm font-semibold text-white">Шпалери природи</h3>
                          </div>
                          <button
                            onClick={() => setIsWallpaperDrawerOpen(true)}
                            className="text-xs text-amber-300 hover:underline cursor-pointer"
                          >
                            Всі фони ({WALLPAPERS.length})
                          </button>
                        </div>

                        <div className="mt-4 space-y-2">
                          {WALLPAPERS.slice(0, 3).map((wp) => (
                            <button
                              key={wp.id}
                              onClick={() => setCurrentWallpaper(wp)}
                              className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                currentWallpaper.id === wp.id
                                  ? 'bg-white/15 border-amber-400/50 ring-1 ring-amber-400/30'
                                  : 'bg-white/5 border-white/5 hover:border-white/20'
                              }`}
                            >
                              <img
                                src={wp.imageSrc}
                                alt={wp.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-10 object-cover rounded-lg shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-white truncate">
                                  {wp.title}
                                </div>
                                <div className="text-[10px] text-stone-400 truncate">
                                  {wp.location}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                        <span>Поточний краєвид:</span>
                        <span className="text-stone-200 font-medium truncate max-w-[130px]">
                          {currentWallpaper.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambient Sound Bar */}
                <div className="mt-6">
                  <AmbientSoundPanel
                    isMasterActive={isMasterSoundActive}
                    onToggleMaster={handleToggleMasterSound}
                  />
                </div>
              </div>
            )}

            {/* Weather & Sky Tab */}
            {activeTab === 'weather' && (
              <div className="mt-4 w-full space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <WeatherCard
                    weather={weather}
                    loading={weatherLoading}
                    onRefresh={() => loadWeather(currentCity)}
                    onSelectCity={(city) => setCurrentCity(city)}
                    onDetectLocation={handleDetectLocation}
                  />
                  <PrecipitationWidget
                    weather={weather}
                    onTriggerRainEffect={() => setNatureEffect('rain')}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <MoonPhaseWidget />
                  <StarMapWidget
                    cityName={currentCity.name}
                    lat={currentCity.lat}
                    lng={currentCity.lng}
                  />
                </div>

                <EclipseAndCelestialWidget />
              </div>
            )}

            {/* Facts Tab */}
            {activeTab === 'facts' && (
              <div className="mt-4 max-w-4xl mx-auto w-full space-y-6">
                <FactCard />
              </div>
            )}

            {/* Daily Intentions / Rhythm Tab */}
            {activeTab === 'intentions' && (
              <div className="mt-4 max-w-4xl mx-auto w-full space-y-6">
                <DailyIntentions />
              </div>
            )}

            {/* Ambient Sounds Tab */}
            {activeTab === 'sounds' && (
              <div className="mt-4 max-w-4xl mx-auto w-full space-y-6">
                <AmbientSoundPanel
                  isMasterActive={isMasterSoundActive}
                  onToggleMaster={handleToggleMasterSound}
                />
              </div>
            )}
          </main>

          {/* Desktop Footer */}
          <footer className="w-full mt-8 py-5 border-t border-white/10 glass-panel-subtle text-xs text-stone-400">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="font-serif-display font-medium text-stone-300">СЬОГОДНІ</span>
                <span aria-hidden="true">·</span>
                <span>Твій затишний щоденний простір для життя та натхнення</span>
              </div>
              <div className="flex items-center gap-4 text-stone-400">
                <button
                  onClick={() => setIsEffectsDrawerOpen(true)}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Ефекти природи
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setIsWallpaperDrawerOpen(true)}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Колекція краєвидів
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
