import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Gauge,
  Compass,
  Check,
  X,
} from 'lucide-react';
import { CityOption, CurrentWeather } from '../types';
import { POPULAR_CITIES, searchCities } from '../services/weatherService';

interface WeatherCardProps {
  weather: CurrentWeather | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectCity: (city: CityOption) => void;
  onDetectLocation: () => void;
}

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const renderWeatherIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-300 animate-spin-slow`} />;
      case 'moon':
        return <Moon className={`${className} text-indigo-300`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-200`} />;
      case 'cloud':
        return <Cloud className={`${className} text-stone-300`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${className} text-sky-300`} />;
      case 'cloud-rain':
      case 'cloud-rain-heavy':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'cloud-snow':
        return <CloudSnow className={`${className} text-slate-100`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-yellow-300`} />;
      default:
        return <CloudSun className={`${className} text-amber-200`} />;
    }
  };

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
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-1 font-data-mono">
                  <span className="text-5xl sm:text-6xl font-light text-white tracking-tight">
                    {weather.temp > 0 ? `+${weather.temp}` : weather.temp}
                  </span>
                  <span className="text-2xl text-amber-300 font-light">°C</span>
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  Відчувається як{' '}
                  <span className="text-stone-200 font-medium">
                    {weather.feelsLike > 0 ? `+${weather.feelsLike}` : weather.feelsLike}°C
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end text-right">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-1.5">
                  {renderWeatherIcon(weather.condition.iconName, 'w-8 h-8')}
                </div>
                <span className="text-sm font-medium text-stone-200">
                  {weather.condition.label}
                </span>
                <span className="text-[11px] text-stone-400 max-w-[140px] truncate">
                  {weather.condition.description}
                </span>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="mt-5 grid grid-cols-4 gap-2 pt-4 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center text-sky-400 mb-1">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-stone-400">Вологість</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.humidity}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center text-emerald-400 mb-1">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-stone-400">Вітер</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.windSpeed} км/г
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center text-amber-400 mb-1">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-stone-400">Тиск</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.surfacePressure} мм
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center text-orange-400 mb-1">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-stone-400">УФ-індекс</div>
                <div className="text-xs font-semibold text-stone-100 font-data-mono">
                  {weather.uvIndex}
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-xs text-stone-400 mb-2 font-medium">Прогноз на день:</div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                {weather.hourly.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center min-w-[48px] py-1.5 px-1 rounded-lg bg-white/5 border border-white/5 text-center shrink-0"
                  >
                    <span className="text-[10px] text-stone-400 font-data-mono">{h.time}</span>
                    <div className="my-1">
                      {renderWeatherIcon(
                        h.weatherCode < 3 ? 'sun' : h.weatherCode < 60 ? 'cloud' : 'cloud-rain',
                        'w-4 h-4'
                      )}
                    </div>
                    <span className="text-xs font-medium text-stone-200 font-data-mono">
                      {h.temp > 0 ? `+${h.temp}` : h.temp}°
                    </span>
                  </div>
                ))}
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
