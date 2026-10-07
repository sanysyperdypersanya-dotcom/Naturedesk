import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'uk' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  tr: (uk: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'uk',
  setLang: () => {},
  toggleLang: () => {},
  tr: (uk) => uk,
});

export const useLanguage = () => useContext(LanguageContext);

// Exact phrase dictionary (Ukrainian -> English) covering all UI labels, widgets, weather, astronomy & wallpapers
const EXACT_UK_TO_EN: Record<string, string> = {
  // Header & Navigation
  СЬОГОДНІ: 'TODAY',
  Сьогодні: 'Today',
  Головна: 'Home',
  'Погода та Небо': 'Weather & Sky',
  'Факти та Мудрість': 'Facts & Wisdom',
  Атмосфера: 'Atmosphere',
  'Перезавантажити сторінку': 'Reload page',
  'Налаштувати інтерактивний ефект погоди (дощ, сніг, туман)':
    'Customize interactive weather effect (rain, snow, mist)',
  'Змінити фон природи': 'Change nature background',
  'Вимкнути звуки': 'Mute ambient sounds',
  'Увімкнути звуки природи': 'Enable nature sounds',
  'Вийти з режиму споглядання': 'Exit Zen mode',
  'Фокус-режим (Zen)': 'Focus mode (Zen)',
  'Мова інтерфейсу: Українська / English': 'Interface language: Ukrainian / English',

  // Quick Ribbon & Footer
  '🌧️ Дощ': '🌧️ Rain',
  '❄️ Сніг': '❄️ Snow',
  '🍂 Листя': '🍂 Leaves',
  '⚡ Гроза': '⚡ Storm',
  'Усі ефекти (10+)': 'All Effects (10+)',
  'Наступний фон': 'Next Background',
  'Наступний фон ↻': 'Next Background ↻',
  'Розгорнути всі': 'Expand All',
  'Скрутити всі': 'Collapse All',
  'Скинути вікна': 'Reset Windows',
  'Анімації неба': 'Sky Animations',
  'Режим споглядання': 'Zen Contemplation',
  'За погодою': 'Auto by Weather',
  'Під фон': 'Match Wallpaper',
  Дощ: 'Rain',
  Гроза: 'Thunderstorm',
  Снігопад: 'Snowfall',
  Туман: 'Mist',
  Листопад: 'Autumn Leaves',
  Сакура: 'Sakura Blossom',
  'Північне сяйво': 'Aurora Borealis',
  Зорепад: 'Meteor Shower',
  Промені: 'Sunbeams',
  Світлячки: 'Fireflies',
  'Без ефектів': 'No Effects',
  'Живий дощ': 'Live Rain',
  'Гроза та блискавки': 'Thunderstorm & Lightning',
  'Гірський туман': 'Mountain Mist',
  'Осінній листопад': 'Autumn Leaf Fall',
  'Цвітіння сакури': 'Sakura Petals',
  'Зорепад Персеїди': 'Perseids Meteor Shower',
  'Сонячні промені': 'Golden Sunbeams',
  'Нічні світлячки': 'Night Fireflies',

  // Draggable Widget Chrome
  Розгорнути: 'Expand',
  Скрутити: 'Collapse',
  '2× клік — назад': '2× click — back',
  '↺ Повернуто на місце': '↺ Returned to slot',
  'Замінити · Сунеться': 'Replace · Shifts over',
  'Погода в реальному часі': 'Real-Time Weather',
  'Spotify · Музичний плеєр': 'Spotify · Music Player',
  'GPS Компас та Геолокація': 'GPS Compass & Geolocation',
  'Навігаційний Компас та Азимут': 'Navigation Compass & Azimuth',
  'Опади та Метео-радар': 'Precipitation & Weather Radar',
  'Вигляд Місяця та Фази': 'Moon Phase & Lunar Cycle',
  'Місячний календар': 'Lunar Calendar',
  'Інтерактивна Зоряна Карта': 'Interactive Star Map',
  'Повні Затемнення, Зорепади та Планети': 'Total Eclipses, Meteors & Planets',
  'Найближче повне: 2 серп. 2027': 'Next Total: Aug 2, 2027',
  'Факти та Мудрість дня': 'Daily Facts & Wisdom',
  'Пізнавальна картка': 'Knowledge Card',
  'Фони у стилі Brave': 'Brave Nature Wallpapers',
  'Звуковий супровід природи': 'Ambient Nature Soundscape',
  Відтворюється: 'Playing Now',
  'Дощ, ліс, багаття, океан': 'Rain, forest, campfire, ocean',

  // Clock Centerpiece
  'Добрий день': 'Good afternoon',
  'Доброго ранку': 'Good morning',
  'Доброго й теплого дня': 'Have a warm and bright day',
  'Затишного вечора': 'Have a cozy evening',
  'Тихої та спокійної ночі': 'Have a peaceful night',
  'Сьогодні твій неповторний день': 'Today is your unique day',
  'Осіння пора': 'Autumn Season',
  'Сонце вже зайшло · Нічний спокій': 'Sun has set · Night tranquility',

  // Weather Card & Conditions
  'Жива погода': 'Live Weather',
  Ясно: 'Clear',
  Мінлива: 'Partly Cloudy',
  'Мінлива хмарність': 'Partly Cloudy',
  Похмуро: 'Overcast',
  Сніг: 'Snow',
  Ніч: 'Night',
  'Чисте сонячне небо': 'Clear sunny sky',
  'Сонце крізь легкі хмари': 'Sun through light clouds',
  'Подвійний шар хмар': 'Double cloud layer',
  'Анімовані краплі дощу': 'Animated raindrops',
  'Блискавка та грозовий фронт': 'Lightning & storm front',
  'Кристалічні сніжинки': 'Crystalline snowflakes',
  'Плавні пасма туману': 'Drifting mist layers',
  'Зоряне небо та серп Місяця': 'Starry sky & crescent Moon',
  'Плавна зміна атмосферного стану': 'Gentle atmospheric transition',
  'Анімація погоди:': 'Weather Icon Preview:',
  Вологість: 'Humidity',
  Вітер: 'Wind',
  Тиск: 'Pressure',
  'УФ-індекс': 'UV Index',
  'Погодинний прогноз': 'Hourly Forecast',
  'Прогноз на 7 днів': '7-Day Forecast',
  'Швидкий вибір міста:': 'Quick City Select:',
  'Пошук будь-якого міста світу...': 'Search any city in the world...',
  Знайти: 'Search',
  'Шукаємо...': 'Searching...',
  Київ: 'Kyiv',
  Львів: 'Lviv',
  Одеса: 'Odesa',
  Харків: 'Kharkiv',
  Дніпро: 'Dnipro',
  Карпати: 'Carpathians',
  Україна: 'Ukraine',
  'Моє місцезнаходження': 'My Location',

  // Compass & Geolocation Widget
  '● Пошук GPS...': '● Locating GPS...',
  '● Геолокація мережі': '● Network Geolocation',
  '● Координати міста': '● City Coordinates',
  'Моя геолокація': 'My Geolocation',
  'Істинна Пн': 'True N',
  'Магнітна Пн': 'Mag N',
  'Поточний азимут': 'Current Azimuth',
  'Вітер тут': 'Local Wind',
  'Сонце тут': 'Local Sun',
  Пн: 'N',
  ПнСх: 'NE',
  Сх: 'E',
  ПдСх: 'SE',
  Пд: 'S',
  ПдЗх: 'SW',
  Зх: 'W',
  ПнЗх: 'NW',
  'Пн 0°': 'N 0°',
  'Сх 90°': 'E 90°',
  'Пд 180°': 'S 180°',
  'Зх 270°': 'W 270°',
  Північ: 'North',
  'Північний Схід': 'North-East',
  Схід: 'East',
  'Південний Схід': 'South-East',
  Південь: 'South',
  'Південний Захід': 'South-West',
  Захід: 'West',
  'Північний Захід': 'North-West',
  'Гора Говерла': 'Mount Hoverla',
  'Озеро Синевир': 'Lake Synevyr',
  'Київ · Софійська площа': 'Kyiv · Sophia Square',
  'Львів · Площа Ринок': 'Lviv · Rynok Square',
  'Ай-Петрі': 'Ai-Petri Peak',
  'Острів Хортиця': 'Khortytsia Island',
  'Географічна Північ': 'Geographic North Pole',

  // Spotify Music Player Widget
  'Spotify Плеєр': 'Spotify Player',
  '● Підключено': '● Connected',
  'Натисніть «Підключити Spotify» для миттєвого з’єднання':
    'Click "Connect Spotify" for instant connection',
  Посилання: 'Paste Link',
  'Підключити Spotify': 'Connect Spotify',
  Вийти: 'Disconnect',
  Грати: 'Play',
  Пауза: 'Pause',
  Відкрити: 'Open',
  Копіювати: 'Copy',
  Скопійовано: 'Copied',
  'Еквалайзер · Хвилі під такт': 'Equalizer · Beat Waves',
  'Хвилі + Спектр': 'Waves + Spectrum',
  'Біт-хвилі': 'Beat Waves',
  Спектр: 'Spectrum',
  'Добірка треків та плейлистів Spotify:': 'Curated Spotify Tracks & Playlists:',
  'Повернути стандартні': 'Restore Defaults',

  // Precipitation Widget
  'Опади в реальному часі': 'Real-Time Precipitation',
  'Увімкнути дощ': 'Trigger Rain Effect',
  'Поточна інтенсивність': 'Current Intensity',
  'Ймовірність опадів': 'Precipitation Probability',
  'Сумарно за добу': '24h Total Accumulation',
  'Прогноз опадів по годинах': 'Hourly Precipitation Forecast',
  'Рекомендовано взяти парасольку': 'Umbrella recommended today',
  'Парасолька сьогодні не обов’язкова': 'No umbrella needed today',
  'Без опадів': 'No Precipitation',
  'Слабкий дощ': 'Light Rain',
  'Помірні опади': 'Moderate Rain',
  'Сильна злива': 'Heavy Downpour',

  // Moon Phase Widget
  'Вигляд Місяця та Місячний цикл': 'Moon Appearance & Lunar Cycle',
  'Освітленість диска': 'Disc Illumination',
  'Вік Місяця': 'Lunar Age',
  'До Повні': 'Until Full Moon',
  'До Молодика': 'Until New Moon',
  Молодик: 'New Moon',
  'Молодий серп': 'Waxing Crescent',
  'Перша чверть': 'First Quarter',
  'Прибуваючий Місяць': 'Waxing Gibbous',
  Повня: 'Full Moon',
  'Спадаючий Місяць': 'Waning Gibbous',
  'Остання чверть': 'Last Quarter',
  'Старий серп': 'Waning Crescent',

  // Star Map & Eclipses
  'Зоряне небо над вами': 'Starry Sky Above You',
  Сітки: 'Grid',
  'Сузір’я': 'Constellations',
  Обертання: 'Auto-Rotate',
  'Сонячні й Місячні Затемнення': 'Solar & Lunar Eclipses',
  'Метеорні Потоки та Паради Планет': 'Meteor Showers & Planetary Alignments',
  Усі: 'All',
  Затемнення: 'Eclipses',
  Зорепади: 'Meteor Showers',
  Планети: 'Planets',

  // Daily Facts & Wisdom
  'Факт чи Мудрість дня': 'Daily Fact & Wisdom',
  Природа: 'Nature',
  Космос: 'Cosmos',
  Мудрість: 'Wisdom',
  Україна_категорія: 'Ukraine',
  'Читати детальніше': 'Read More',
  'Згорнути деталі': 'Hide Details',
  'Наступний факт': 'Next Fact',
  'Обрані факти': 'Saved Facts',

  // Wallpapers & Ambient Sounds
  Наступний: 'Next',
  Галерея: 'Gallery',
  'Звукова панель природи': 'Nature Ambient Soundboard',
  'Увімкнути атмосферу': 'Start Ambience',
  'Зупинити все': 'Stop All',
  'Літній дощ': 'Summer Rain',
  'Нічний ліс та цвіркуни': 'Night Forest & Crickets',
  'Тріскотіння багаття': 'Campfire Crackling',
  'Хвилі океану': 'Ocean Waves',
};

const PATTERN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/^Ефект:\s*(.+)$/i, 'Effect: $1'],
  [/^Жива анімація:\s*$/i, 'Live Animation: '],
  [/^Усі фони \((\d+)\)$/i, 'All Wallpapers ($1)'],
  [/^Колекція фонів Brave \((\d+)\)$/i, 'Brave Wallpaper Collection ($1)'],
  [/^Грає:\s*(.+)$/i, 'Playing: $1'],
  [/^Ймовірність (\d+)% · ([\d.]+) мм$/i, 'Probability $1% · $2 mm'],
  [/^Прогноз (\d+) год$/i, '$1h Forecast'],
  [/^День (\d+) із (\d+)$/i, 'Day $1 of $2'],
  [/^(\d+)-й тиждень року$/i, 'Week $1 of Year'],
  [/^Залишилось (.+) світлового дня$/i, '$1 of daylight remaining'],
  [/^До сходу сонця ще (.+)$/i, '$1 until sunrise'],
  [/^Відчувається як\s*$/i, 'Feels like '],
  [/^Макс:\s*([+\-\d]+°)\s*·\s*Мін:\s*([+\-\d]+°)\s*·\s*Оновлено о\s*(.+)$/i, 'High: $1 · Low: $2 · Updated at $3'],
  [/^(\d+)\s*км\/год(.*)$/i, '$1 km/h$2'],
  [/^(\d+)\s*гПа$/i, '$1 hPa'],
  [/^Висота\s*([+\-\d.]+°)$/i, 'Elevation $1'],
  [/^Азимут\s*(\d+°)\s*·\s*([\d.]+)\s*км$/i, 'Azimuth $1 · $2 km'],
  [/^Пеленг від вашої геолокації \((.+)\):$/i, 'Bearing from your geolocation ($1):'],
  [/^● GPS ±(\d+)м$/i, '● GPS ±$1m'],
  [/^Схилення\s*([+\-\d.]+°)$/i, 'Declination $1'],
  [/^(\d+)\s*м$/i, '$1 m'],
  [/^(\d+)\s*BPM · LIVE$/i, '$1 BPM · LIVE'],
  [/^(\d+)\s*BPM · Очікування$/i, '$1 BPM · Idle'],
];

export function translateStringToEnglish(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return input;

  if (EXACT_UK_TO_EN[trimmed]) {
    return input.replace(trimmed, EXACT_UK_TO_EN[trimmed]);
  }

  for (const [regex, replacement] of PATTERN_REPLACEMENTS) {
    if (regex.test(trimmed)) {
      const converted = trimmed.replace(regex, replacement);
      return input.replace(trimmed, converted);
    }
  }

  // Substring replacements for compound strings
  let out = input;
  const compoundMap: Array<[string, string]> = [
    ['lofi beats · Спокій та фокус', 'lofi beats · Calm & Focus'],
    ['Peaceful Piano · Тихе фортепіано', 'Peaceful Piano · Gentle Keys'],
    ['Deep Focus · Глибока концентрація', 'Deep Focus · Flow State'],
    ['Nature Sounds · Звуки дикої природи', 'Nature Sounds · Wild Ambience'],
    ['Chill Tracks · Вечірній чіл', 'Chill Tracks · Evening Relax'],
    ['год', 'h'],
    ['хв', 'm'],
    ['км/год', 'km/h'],
    ['мм', 'mm'],
  ];
  for (const [ukSub, enSub] of compoundMap) {
    if (out.includes(ukSub)) {
      out = out.split(ukSub).join(enSub);
    }
  }
  return out;
}

const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

function applyDomLanguage(root: HTMLElement, lang: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  while (node) {
    const parentTag = node.parentElement?.tagName;
    if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE') {
      const currentVal = node.nodeValue || '';
      if (lang === 'en') {
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, currentVal);
        }
        const sourceUk = originalTextMap.get(node) || currentVal;
        const translated = translateStringToEnglish(sourceUk);
        if (translated !== currentVal) {
          node.nodeValue = translated;
        }
      } else {
        const orig = originalTextMap.get(node);
        if (orig !== undefined && orig !== currentVal) {
          node.nodeValue = orig;
        }
      }
    }
    node = walker.nextNode();
  }

  const elements = root.querySelectorAll('[title], [placeholder], [aria-label]');
  elements.forEach((el) => {
    let savedAttrs = originalAttrMap.get(el);
    if (!savedAttrs) {
      savedAttrs = {};
      originalAttrMap.set(el, savedAttrs);
    }
    for (const attr of ['title', 'placeholder', 'aria-label']) {
      const val = el.getAttribute(attr);
      if (!val) continue;
      if (lang === 'en') {
        if (!(attr in savedAttrs)) {
          savedAttrs[attr] = val;
        }
        const translated = translateStringToEnglish(savedAttrs[attr]);
        if (translated !== val) {
          el.setAttribute(attr, translated);
        }
      } else if (attr in savedAttrs) {
        if (el.getAttribute(attr) !== savedAttrs[attr]) {
          el.setAttribute(attr, savedAttrs[attr]);
        }
      }
    }
  });
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('naturedesk_lang_v1');
      if (saved === 'en' || saved === 'uk') return saved;
    } catch {}
    return 'uk';
  });

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem('naturedesk_lang_v1', nextLang);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'uk' ? 'en' : 'uk';
      try {
        localStorage.setItem('naturedesk_lang_v1', next);
      } catch {}
      return next;
    });
  }, []);

  const tr = useCallback(
    (uk: string, en: string) => (lang === 'en' ? en : uk),
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    applyDomLanguage(document.body, lang);

    if (lang !== 'en') return;

    let isApplying = false;
    const observer = new MutationObserver(() => {
      if (isApplying) return;
      isApplying = true;
      applyDomLanguage(document.body, lang);
      isApplying = false;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};
