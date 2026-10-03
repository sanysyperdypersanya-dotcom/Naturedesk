export interface NatureWallpaper {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  imageSrc: string;
  palette: {
    accent: string;
    ambientGlow: string;
  };
}

export interface WeatherCondition {
  label: string;
  iconName: string;
  description: string;
}

export interface CurrentWeather {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  surfacePressure: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  hourly: {
    time: string;
    temp: number;
    weatherCode: number;
  }[];
  isDaytime: boolean;
  updatedAt: string;
}

export type FactCategory = 'fact' | 'history' | 'nature' | 'word' | 'quote';

export interface DailyFact {
  id: string;
  category: FactCategory;
  categoryLabel: string;
  title: string;
  snippet: string;
  detail: string;
  sourceOrAuthor?: string;
  tag: string;
}

export interface DailyIntention {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
  region?: string;
}
