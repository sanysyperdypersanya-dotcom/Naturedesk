import React, { useState } from 'react';
import { MapPin, RefreshCw, Search, Compass, X } from 'lucide-react';
import { CityOption, CurrentWeather } from '../types';
import { POPULAR_CITIES, searchCities, mapWmoCode } from '../services/weatherService';
import { AnimatedWeatherIcon, AnimatedMetricIcon } from './AnimatedWeatherIcon';

interface WeatherCardProps {
  weather: CurrentWeather | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectCity: (city: CityOption) => void;
  onDetectLocation: () => void;
}

const WEATHER_PREVIEW_MODES: { id: string; label: string; iconName: string; desc: string }[] = [
  { id: 'auto', label: 'Жива погода', iconName: '', desc: '' },
  { id: 'sun', label: 'Ясно', iconName: 'sun', desc: 'Чисте сонячне небо' },
  { id: 'cloud-sun', label: 'Мінлива', iconName: 'cloud-sun', desc: 'Сонце крізь легкі хмари' },
  { id: 'cloud', label: 'Похмуро', iconName: 'cloud', desc: 'Подвійний шар хмар' },
  { id: 'cloud-rain', label: 'Дощ', iconName: 'cloud-rain', desc: 'Анімовані краплі дощу' },
  { id: 'cloud-lightning', label: 'Гроза', iconName: 'cloud-lightning', desc: 'Блискавка та грозовий фронт' },
  { id: 'cloud-snow', label: 'Сніг', iconName: 'cloud-snow', desc: 'Кристалічні сніжинки' },
  { id: 'cloud-fog', label: 'Туман', iconName: 'cloud-fog', desc: 'Плавні пасма туману' },
  { id: 'moon', label: 'Ніч', iconName: 'moon', desc: 'Зоряне небо та серп Місяця' },
];

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  loading,
  onRefresh,
  onSelectCity,
  onDetectLocation,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewIconMode, setPreviewIconMode] = useState<string>('auto');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const activePreview = WEATHER_PREVIEW_MODES.find((m) => m.id === previewIconMode);
  const displayedIconName =
    previewIconMode === 'auto' || !activePreview?.iconName
      ? weather?.condition.iconName || 'cloud-sun'
      : activePreview.iconName;

  const displayedLabel =
    previewIconMode === 'auto' || !activePreview?.iconName
      ? weather?.condition.label || 'Мінлива хмарність'
      : activePreview.label;

  const displayedDescription =
    previewIconMode === 'auto' || !activePreview?.iconName
      ? weather?.condition.description || 'Плавна зміна атмосферного стану'
      : activePreview.desc;

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top Location Bar */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 text-stone-200 hover:text-amber-300 transition-colors cursor-pointer group"
              title="Змінити місто"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm sm:text-base truncate">
                {weather?.city || 'Київ'}
              </span>
              <span className="text-xs text-stone-400">· {weather?.country || 'Україна'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onDetectLocation}
              className="p-1.5 glass-pill rounded-lg text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Визначити моє місцезнаходження"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 glass-pill rounded-lg text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50"
              title="Оновити дані погоди"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Current Weather Main View */}
        {weather ? (
          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1 font-data-mono">
                  <span className="text-5xl sm:text-6xl font-light text-white tracking-tight">
                    {weather.temp > 0 ? `+${weather.temp}` : weather.temp}
                  </span>
                  <span className="text-2xl text-amber-300 font-light">°C</span>
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  Відчувається як{' '}
                  <span className="text-stone-200 font-medium font-data-mono">
                    {weather.feelsLike > 0 ? `+${weather.feelsLike}` : weather.feelsLike}°C
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 font-data-mono">
                  Анімація реагує на вітер ({weather.windSpeed} км/г) та темп.
                </div>
              </div>

              {/* Animated SVG Weather Scene Box */}
              <div className="flex flex-col items-end text-right">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 mb-1.5 shadow-inner flex items-center justify-center">
                  <AnimatedWeatherIcon
                    iconName={displayedIconName}
                    size="lg"
                    windSpeed={weather.windSpeed}
                    temp={weather.temp}
                  />
                </div>
                <span className="text-sm font-medium text-stone-100">{displayedLabel}</span>
                <span className="text-[11px] text-stone-400 max-w-[165px] truncate">
                  {displayedDescription}
                </span>
              </div>
            </div>

            {/* Interactive SVG Weather Reaction Switcher */}
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                <span>Стан анімованої SVG-іконки:</span>
                {previewIconMode !== 'auto' && (
                  <button
                    type="button"
                    onClick={() => setPreviewIconMode('auto')}
                    className="text-amber-300 hover:underline cursor-pointer"
                  >
                    Повернути реальну погоду
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {WEATHER_PREVIEW_MODES.map((mode) => {
                  const active = previewIconMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPreviewIconMode(mode.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        active
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                          : 'bg-white/5 text-stone-400 hover:text-stone-200 border border-white/5'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weather Metrics Grid with Reactive Animated SVG Micro-Icons */}
            <div className="mt-3.5 grid grid-cols-4 gap-2 pt-3.5 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center mb-1">
                  <AnimatedMetricIcon type="humidity" value={weather.humidity} />
                </div>
                <div className="text-[10px] text-stone-400">Вологість</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.humidity}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center mb-1">
                  <AnimatedMetricIcon type="wind" value={weather.windSpeed} />
                </div>
                <div className="text-[10px] text-stone-400">Вітер</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.windSpeed} км/г
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center mb-1">
                  <AnimatedMetricIcon type="pressure" value={weather.surfacePressure} />
                </div>
                <div className="text-[10px] text-stone-400">Тиск</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.surfacePressure} мм
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center mb-1">
                  <AnimatedMetricIcon type="uv" value={weather.uvIndex} />
                </div>
                <div className="text-[10px] text-stone-400">УФ-індекс</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.uvIndex}
                </div>
              </div>
            </div>

            {/* Hourly Forecast with Animated SVG Weather Icons */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-xs text-stone-400 mb-2 font-medium">
                Погодинний прогноз (анімовані стани):
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {weather.hourly.map((h, idx) => {
                  const hourNum = parseInt(h.time.slice(0, 2), 10);
                  const isHourDay = hourNum >= 6 && hourNum <= 19;
                  const mapped = mapWmoCode(h.weatherCode, isHourDay);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center min-w-[54px] py-2 px-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-center shrink-0 transition-colors"
                      title={`${h.time}: ${mapped.label}`}
                    >
                      <span className="text-[10px] text-stone-400 font-data-mono">{h.time}</span>
                      <div className="my-1">
                        <AnimatedWeatherIcon
                          iconName={mapped.iconName}
                          size="sm"
                          windSpeed={weather.windSpeed}
                          temp={h.temp}
                        />
                      </div>
                      <span className="text-xs font-medium text-stone-200 font-data-mono">
                        {h.temp > 0 ? `+${h.temp}` : h.temp}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-stone-400 text-sm">
            Завантаження даних про небо та погоду...
          </div>
        )}
      </div>

      {/* City Switcher Modal / Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-white/15 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Вибір міста або регіону
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введіть місто (наприклад: Чернівці, Полтава, Ялта)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearching ? 'Пошук...' : 'Знайти'}
              </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                <div className="text-xs text-stone-400 mb-1">Результати пошуку:</div>
                {searchResults.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectCity(city);
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/15 text-left text-sm text-stone-200 transition-colors cursor-pointer"
                  >
                    <span>
                      {city.name} {city.region ? `(${city.region})` : ''}
                    </span>
                    <span className="text-xs text-stone-400">{city.country}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Ukrainian Cities */}
            <div className="mt-5">
              <div className="text-xs text-stone-400 mb-2 font-medium">Популярні локації:</div>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_CITIES.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectCity(city);
                      setIsSearchOpen(false);
                    }}
                    className="flex flex-col items-start p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/40 border border-white/10 transition-colors text-left cursor-pointer group"
                  >
                    <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300">
                      {city.name}
                    </span>
                    <span className="text-[10px] text-stone-400">{city.region}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
