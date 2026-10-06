import { CityOption, CurrentWeather, WeatherCondition } from '../types';

export const POPULAR_CITIES: CityOption[] = [
  { name: 'Київ', country: 'Україна', lat: 50.4501, lng: 30.5234, region: 'Столиця' },
  { name: 'Львів', country: 'Україна', lat: 49.8397, lng: 24.0297, region: 'Галичина' },
  { name: 'Одеса', country: 'Україна', lat: 46.4825, lng: 30.7233, region: 'Чорне море' },
  { name: 'Яремче', country: 'Україна', lat: 48.4593, lng: 24.5566, region: 'Карпати' },
  { name: 'Харків', country: 'Україна', lat: 49.9935, lng: 36.2304, region: 'Слобожанщина' },
  { name: 'Дніпро', country: 'Україна', lat: 48.4647, lng: 35.0462, region: 'Подніпров’я' },
  { name: 'Івано-Франківськ', country: 'Україна', lat: 48.9226, lng: 24.7111, region: 'Прикарпаття' },
  { name: 'Рейк’явік', country: 'Ісландія', lat: 64.1466, lng: -21.9426, region: 'Північ' },
  { name: 'Токіо', country: 'Японія', lat: 35.6762, lng: 139.6503, region: 'Канто' },
];

export function mapWmoCode(code: number, isDay: boolean = true): WeatherCondition {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Ясно' : 'Ясна ніч',
        iconName: isDay ? 'sun' : 'moon',
        description: 'Чисте небо без опадів',
      };
    case 1:
      return {
        label: isDay ? 'Переважно ясно' : 'Малохмарно',
        iconName: isDay ? 'sun' : 'moon',
        description: 'Легкі хмари на горизонті',
      };
    case 2:
      return {
        label: 'Мінлива хмарність',
        iconName: 'cloud-sun',
        description: 'Чергування сонця та хмар',
      };
    case 3:
      return {
        label: 'Похмуро',
        iconName: 'cloud',
        description: 'Суцільний шар хмар',
      };
    case 45:
    case 48:
      return {
        label: 'Туман',
        iconName: 'cloud-fog',
        description: 'Атмосферний туман, видимість знижена',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Дрібний дощ',
        iconName: 'cloud-drizzle',
        description: 'Легка осіння мряка',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: 'Помірний дощ',
        iconName: 'cloud-rain',
        description: 'Осінній освіжаючий дощ',
      };
    case 71:
    case 73:
    case 75:
      return {
        label: 'Сніг',
        iconName: 'cloud-snow',
        description: 'Снігопад або лапатий сніг',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Злива',
        iconName: 'cloud-rain-heavy',
        description: 'Інтенсивні опади',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Гроза',
        iconName: 'cloud-lightning',
        description: 'Грозовий фронт із блискавками',
      };
    default:
      return {
        label: 'Помірна погода',
        iconName: 'cloud-sun',
        description: 'Типовий атмосферний стан',
      };
  }
}

export async function fetchLiveWeather(
  lat: number,
  lng: number,
  cityName: string,
  countryName: string
): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,cloud_cover,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability,precipitation&daily=sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Не вдалося завантажити дані погоди');
  }

  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  const isDay = current.is_day === 1;

  // Format sunrise / sunset
  const formatTimeStr = (isoString?: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  };

  const currentHour = new Date().getHours();
  // Build hourly array for next 12 hours
  const hourly = [];
  let currentPrecipProb = 0;

  if (data.hourly && data.hourly.time) {
    const times: string[] = data.hourly.time;
    const temps: number[] = data.hourly.temperature_2m;
    const codes: number[] = data.hourly.weather_code;
    const probs: number[] = data.hourly.precipitation_probability || [];
    const precips: number[] = data.hourly.precipitation || [];

    // Find current time index
    const nowIsoPrefix = new Date().toISOString().slice(0, 13);
    let startIndex = times.findIndex((t) => t.startsWith(nowIsoPrefix));
    if (startIndex === -1) startIndex = currentHour;

    currentPrecipProb = Math.round(probs[startIndex] ?? daily?.precipitation_probability_max?.[0] ?? 15);

    for (let i = startIndex; i < Math.min(startIndex + 12, times.length); i++) {
      const d = new Date(times[i]);
      hourly.push({
        time: d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(temps[i]),
        weatherCode: codes[i],
        precipitationProbability: Math.round(probs[i] ?? 0),
        precipitation: Math.round((precips[i] ?? 0) * 10) / 10,
      });
    }
  }

  return {
    city: cityName,
    country: countryName,
    lat,
    lng,
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    condition: mapWmoCode(current.weather_code, isDay),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    surfacePressure: Math.round(current.surface_pressure * 0.75006), // Convert hPa to mmHg
    uvIndex: Math.round((daily?.uv_index_max?.[0] ?? 2) * 10) / 10,
    precipitation: Math.round((current.precipitation ?? 0) * 10) / 10,
    precipitationProbability: currentPrecipProb,
    dailyPrecipitationSum: Math.round((daily?.precipitation_sum?.[0] ?? 0) * 10) / 10,
    cloudCover: Math.round(current.cloud_cover ?? 40),
    sunrise: formatTimeStr(daily?.sunrise?.[0]),
    sunset: formatTimeStr(daily?.sunset?.[0]),
    hourly,
    isDaytime: isDay,
    updatedAt: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function searchCities(query: string): Promise<CityOption[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=uk&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => ({
      name: item.name,
      country: item.country || '',
      region: item.admin1 || '',
      lat: item.latitude,
      lng: item.longitude,
    }));
  } catch {
    return [];
  }
}
