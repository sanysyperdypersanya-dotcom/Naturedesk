import React, { useEffect, useState } from 'react';
import { Sunset, Sunrise, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ClockCenterpieceProps {
  sunriseTime?: string;
  sunsetTime?: string;
}

export const ClockCenterpiece: React.FC<ClockCenterpieceProps> = ({
  sunriseTime = '07:05',
  sunsetTime = '18:35',
}) => {
  const { lang, tr } = useLanguage();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  // Greeting logic
  const currentHour = time.getHours();
  let greeting = tr('Добрий день', 'Good afternoon');
  if (currentHour >= 5 && currentHour < 12) {
    greeting = tr('Доброго ранку', 'Good morning');
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = tr('Доброго й теплого дня', 'Have a warm and bright day');
  } else if (currentHour >= 18 && currentHour < 23) {
    greeting = tr('Затишного вечора', 'Have a cozy evening');
  } else {
    greeting = tr('Тихої та спокійної ночі', 'Have a peaceful night');
  }

  // Locale-aware date formatting (Ukrainian or English)
  const formattedDate = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(time);

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Calculate day of the year
  const startOfYear = new Date(time.getFullYear(), 0, 1);
  const diff = time.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;
  const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap(time.getFullYear()) ? 366 : 365;

  // Calculate week number
  const weekNumber = Math.ceil(dayOfYear / 7);

  // Daylight progress calculation
  const parseTimeToMinutes = (tStr: string) => {
    const [h, m] = tStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const currentMinutes = currentHour * 60 + time.getMinutes();
  const sunriseMinutes = parseTimeToMinutes(sunriseTime);
  const sunsetMinutes = parseTimeToMinutes(sunsetTime);

  let daylightPercent = 0;
  let daylightStatus = '';
  if (currentMinutes < sunriseMinutes) {
    daylightPercent = 0;
    const diffMin = sunriseMinutes - currentMinutes;
    const diffH = Math.floor(diffMin / 60);
    const diffM = diffMin % 60;
    daylightStatus =
      lang === 'en'
        ? `${diffH > 0 ? `${diffH}h ` : ''}${diffM}m until sunrise`
        : `До сходу сонця ще ${diffH > 0 ? `${diffH} год ` : ''}${diffM} хв`;
  } else if (currentMinutes > sunsetMinutes) {
    daylightPercent = 100;
    daylightStatus = tr(
      'Сонце вже зайшло · Нічний спокій',
      'Sun has set · Night tranquility'
    );
  } else {
    const totalDaylight = sunsetMinutes - sunriseMinutes;
    const elapsed = currentMinutes - sunriseMinutes;
    daylightPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDaylight) * 100)));
    const remainingMin = sunsetMinutes - currentMinutes;
    const remH = Math.floor(remainingMin / 60);
    const remM = remainingMin % 60;
    daylightStatus =
      lang === 'en'
        ? `${remH > 0 ? `${remH}h ` : ''}${remM}m of daylight remaining`
        : `Залишилось ${remH > 0 ? `${remH} год ` : ''}${remM} хв світлового дня`;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center my-4 md:my-8 px-4">
      {/* Quiet top kicker */}
      <div className="flex items-center gap-2 text-stone-300 text-xs md:text-sm font-medium tracking-wide mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>{greeting}</span>
        <span aria-hidden="true" className="text-stone-500">
          ·
        </span>
        <span className="text-amber-200/90">
          {tr('Сьогодні твій неповторний день', 'Today is your unique day')}
        </span>
      </div>

      {/* Hero Display Clock */}
      <div className="flex items-baseline justify-center select-none font-data-mono text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tighter">
          {hours}:{minutes}
        </span>
        <span className="text-2xl sm:text-3xl md:text-4xl text-amber-300/80 font-normal ml-2 sm:ml-3 tabular-nums">
          :{seconds}
        </span>
      </div>

      {/* Date in Ukrainian or English */}
      <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl font-serif-display font-medium text-stone-100 tracking-wide">
        {capitalizedDate}
      </h1>

      {/* Editorial metadata - Zero Pill Rule */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-300/90 font-medium">
        <span>
          {lang === 'en' ? `Day ${dayOfYear} of ${totalDays}` : `День ${dayOfYear} із ${totalDays}`}
        </span>
        <span aria-hidden="true" className="text-stone-500">
          ·
        </span>
        <span>
          {lang === 'en' ? `Week ${weekNumber} of Year` : `${weekNumber}-й тиждень року`}
        </span>
        <span aria-hidden="true" className="text-stone-500">
          ·
        </span>
        <span className="text-amber-200">{tr('Осіння пора', 'Autumn Season')}</span>
      </div>

      {/* Daylight progression ribbon */}
      <div className="mt-5 w-full max-w-md glass-panel-subtle rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-between text-xs text-stone-300 mb-1.5 font-data-mono">
          <span className="flex items-center gap-1">
            <Sunrise className="w-3.5 h-3.5 text-amber-300" />
            <span>{sunriseTime}</span>
          </span>
          <span className="text-stone-300 text-[11px] font-sans">{daylightStatus}</span>
          <span className="flex items-center gap-1">
            <Sunset className="w-3.5 h-3.5 text-orange-400" />
            <span>{sunsetTime}</span>
          </span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 rounded-full transition-all duration-1000"
            style={{ width: `${daylightPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
