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

// Exhaustive phrase dictionary (Ukrainian -> English) covering ALL widgets, headers, footers, modals, and data files
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
  'Мова інтерфейсу': 'Interface language',

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
  'Гроза та Блискавки': 'Thunderstorm & Lightning',
  'Гірський туман': 'Mountain Mist',
  'Осінній листопад': 'Autumn Leaf Fall',
  'Цвітіння сакури': 'Sakura Petals',
  'Пелюстки сакури': 'Sakura Petals',
  'Зорепад Персеїди': 'Perseids Meteor Shower',
  'Зорепад та Метеори': 'Meteor Shower & Shooting Stars',
  'Сонячні промені': 'Golden Sunbeams',
  'Сонячне проміння': 'Golden Sunbeams',
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

  // Weather Card & Weather Service
  'Жива погода': 'Live Weather',
  Ясно: 'Clear',
  'Ясна ніч': 'Clear Night',
  'Переважно ясно': 'Mostly Clear',
  Малохмарно: 'Few Clouds',
  Мінлива: 'Partly Cloudy',
  'Мінлива хмарність': 'Partly Cloudy',
  Похмуро: 'Overcast',
  'Дрібний дощ': 'Light Drizzle',
  'Помірний дощ': 'Moderate Rain',
  Сніг: 'Snow',
  Злива: 'Heavy Rain',
  'Помірна погода': 'Mild Weather',
  Ніч: 'Night',
  'Чисте небо без опадів': 'Clear sky with no precipitation',
  'Легкі хмари на горизонті': 'Light clouds on the horizon',
  'Чергування сонця та хмар': 'Alternating sun and clouds',
  'Суцільний шар хмар': 'Solid overcast cloud layer',
  'Атмосферний туман, видимість знижена': 'Atmospheric fog, reduced visibility',
  'Легка осіння мряка': 'Light autumn drizzle',
  'Осінній освіжаючий дощ': 'Refreshing autumn rain',
  'Снігопад або лапатий сніг': 'Snowfall or heavy snow flurries',
  'Інтенсивні опади': 'Intense rain showers',
  'Грозовий фронт із блискавками': 'Thunderstorm front with lightning',
  'Типовий атмосферний стан': 'Typical atmospheric conditions',
  'Чисте сонячне небо': 'Clear sunny sky',
  'Сонце крізь легкі хмари': 'Sun through light clouds',
  'Подвійний шар хмар': 'Double cloud layer',
  'Анімовані краплі дощу': 'Animated raindrops',
  'Блискавка та грозовий фронт': 'Lightning & storm front',
  'Кристалічні сніжинки': 'Crystalline snowflakes',
  'Плавні пасма туману': 'Drifting mist layers',
  'Зоряне небо та серп Місяця': 'Starry sky & crescent Moon',
  'Плавна зміна атмосферного стану': 'Gentle atmospheric transition',
  'Стан анімованої SVG-іконки:': 'Animated SVG Weather State:',
  'Повернути реальну погоду': 'Restore Live Weather',
  Вологість: 'Humidity',
  Вітер: 'Wind',
  Тиск: 'Pressure',
  'УФ-індекс': 'UV Index',
  'Погодинний прогноз (анімовані стани):': 'Hourly Forecast (Animated States):',
  'Завантаження даних про небо та погоду...': 'Loading live sky and weather data...',
  'Вибір міста або регіону': 'Select City or Region',
  'Введіть місто (наприклад: Чернівці, Полтава, Ялта)...':
    'Enter a city (e.g., London, Kyiv, Lviv, Tokyo)...',
  'Пошук...': 'Searching...',
  Знайти: 'Search',
  'Результати пошуку:': 'Search Results:',
  'Популярні локації:': 'Popular Locations:',
  Київ: 'Kyiv',
  Львів: 'Lviv',
  Одеса: 'Odesa',
  Яремче: 'Yaremche',
  Харків: 'Kharkiv',
  Дніпро: 'Dnipro',
  'Івано-Франківськ': 'Ivano-Frankivsk',
  'Рейк’явік': 'Reykjavik',
  Токіо: 'Tokyo',
  Україна: 'Ukraine',
  Ісландія: 'Iceland',
  Японія: 'Japan',
  Столиця: 'Capital',
  Галичина: 'Galicia',
  'Чорне море': 'Black Sea',
  Карпати: 'Carpathians',
  Слобожанщина: 'Slobozhanshchyna',
  'Подніпров’я': 'Dnipro Region',
  Прикарпаття: 'Prykarpattia',
  Канто: 'Kanto',
  'Моє місцезнаходження': 'My Location',
  'Моя GPS локація': 'My GPS Location',

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
  'Пн (N)': 'N',
  'Пд (S)': 'S',
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
  'Північ — Північний Схід': 'North-North-East',
  'Схід — Північний Схід': 'East-North-East',
  'Схід — Південний Схід': 'East-South-East',
  'Південь — Південний Схід': 'South-South-East',
  'Південь — Південний Захід': 'South-South-West',
  'Захід — Південний Захід': 'West-South-West',
  'Захід — Північний Захід': 'West-North-West',
  'Північ — Північний Захід': 'North-North-West',
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

  // Precipitation Widget (ALL strings)
  'Опади та Атмосферний фронт': 'Precipitation & Atmospheric Front',
  'Прогноз 12 год': '12h Forecast',
  'Метео-радар': 'Weather Radar',
  Інтенсивність: 'Intensity',
  'мм/год': 'mm/h',
  Ймовірність: 'Probability',
  'Сума за добу': '24h Total',
  мм: 'mm',
  'Хмарність · Роса': 'Clouds · Dew Point',
  'Ймовірність %': 'Probability %',
  'Міліметри (мм)': 'Millimeters (mm)',
  'Помірний або сильний дощ': 'Moderate or heavy rain',
  'Невеликі локальні опади': 'Light local precipitation',
  'Висока ймовірність опадів найближчим часом': 'High probability of rain soon',
  'Можлива короткочасна мряка': 'Possible brief drizzle',
  'Без істотних опадів у найближчі години': 'No significant precipitation in coming hours',
  'Легка мряка': 'Light Drizzle',
  'Дощовий фронт': 'Rain Front',
  'Рекомендовано взяти парасольку': 'Umbrella recommended today',
  'Парасолька сьогодні не обов’язкова': 'No umbrella needed today',
  'Ефект дощу': 'Rain Effect',

  // Moon Phase Widget (ALL strings)
  'Вигляд Місяця та Місячний цикл': 'Moon Appearance & Lunar Cycle',
  Освітленість: 'Illumination',
  'Вік Місяця': 'Lunar Age',
  Відстань: 'Distance',
  'Огляд фаз по днях (-15 / +15 діб)': 'Daily Phase Scrubber (-15 / +15 days)',
  'Найближчі головні фази Місяця:': 'Upcoming Major Moon Phases:',
  Молодик: 'New Moon',
  'Зростаючий серп': 'Waxing Crescent',
  'Перша чверть': 'First Quarter',
  'Зростаючий опуклий Місяць': 'Waxing Gibbous',
  Повня: 'Full Moon',
  'Спадаючий опуклий Місяць': 'Waning Gibbous',
  'Остання чверть': 'Last Quarter',
  'Спадаючий серп (Старий Місяць)': 'Waning Crescent (Old Moon)',
  'Місяць між Землею та Сонцем, нічне небо найтемніше':
    'Moon is between Earth and Sun; the night sky is at its darkest',
  'Ідеальний час для спостереження далеких зір та Чумацького Шляху':
    'Ideal time for observing deep-sky stars and the Milky Way',
  'Молодий Місяць видно на заході невдовзі після заходу Сонця':
    'Young crescent Moon visible in the west shortly after sunset',
  'Освітлена права половина диска, рельєф кратерів вздовж термінатора найчіткіший':
    'Right half of the disc is illuminated; crater relief along the terminator is sharpest',
  'Яскравий диск сходить вдень і світить майже всю ніч':
    'Bright lunar disc rises in the afternoon and shines almost all night',
  'Повністю освітлений диск сходить на заході Сонця':
    'Fully illuminated lunar disc rises at sunset',
  'Місяць сходить пізно ввечері та залишається видимим на ранковому небі':
    'Moon rises late in the evening and remains visible in the morning sky',
  'Освітлена ліва половина диска, видно у другій половині ночі та вранці':
    'Left half of the disc is illuminated; visible after midnight and in the morning',
  'Тонкий ранковий серп перед світанком на східному небосхилі':
    'Thin morning crescent visible before dawn above the eastern horizon',
  Овен: 'Aries',
  Телець: 'Taurus',
  Близнюки: 'Gemini',
  Рак: 'Cancer',
  Лев: 'Leo',
  Діва: 'Virgo',
  Терези: 'Libra',
  Скорпіон: 'Scorpio',
  Стрілець: 'Sagittarius',
  Козоріг: 'Capricorn',
  Водолій: 'Aquarius',
  Риби: 'Pisces',

  // Star Map Widget (ALL strings)
  Лінії: 'Lines',
  'Назви зір': 'Star Names',
  'Оберіть сузір’я на карті або зі списку:': 'Select a constellation on the map or list:',
  'Мала Ведмедиця': 'Ursa Minor (Little Bear)',
  'Велика Ведмедиця (Великий Віз)': 'Ursa Major (Big Dipper)',
  Кассіопея: 'Cassiopeia',
  Лебідь: 'Cygnus (The Swan)',
  Ліра: 'Lyra (The Lyre)',
  Орел: 'Aquila (The Eagle)',
  'Пегас та Андромеда': 'Pegasus & Andromeda',
  'Телець та Плеяди (Стожари)': 'Taurus & Pleiades',
  'Оріон (Косарі)': 'Orion (The Hunter)',
  'Полярна зоря (α UMi)': 'Polaris (α UMi)',
  'Аліот та Дубхе (α UMa)': 'Alioth & Dubhe (α UMa)',
  'Шедар (α Cas)': 'Schedar (α Cas)',
  'Денеб (α Cyg)': 'Deneb (α Cyg)',
  'Вега (α Lyr)': 'Vega (α Lyr)',
  'Альтаїр (α Aql)': 'Altair (α Aql)',
  'Альферац (α And)': 'Alpheratz (α And)',
  'Альдебаран (α Tau)': 'Aldebaran (α Tau)',
  'Рігель та Бетельгейзе': 'Rigel & Betelgeuse',
  Полярна: 'Polaris',
  Кохаб: 'Kochab',
  Дубхе: 'Dubhe',
  Аліот: 'Alioth',
  Міцар: 'Mizar',
  Бенетнаш: 'Alkaid',
  Шедар: 'Schedar',
  Денеб: 'Deneb',
  Альбірео: 'Albireo',
  Вега: 'Vega',
  Альтаїр: 'Altair',
  Альферац: 'Alpheratz',
  Маркаб: 'Markab',
  Мірах: 'Mirach',
  Альдебаран: 'Aldebaran',
  'Плеяди (Стожари)': 'Pleiades (M45)',
  Бетельгейзе: 'Betelgeuse',
  'Пояс Оріона': "Orion's Belt",
  Рігель: 'Rigel',
  'Зеніт / Північ': 'Zenith / North',
  'Північний Схід / Високо в небі': 'North-East / High in Sky',
  'Захід — Зеніт': 'West — Zenith',
  'Південь — Високо над горизонтом': 'South — High Above Horizon',
  'Схід — Південний Схід (вночі)': 'East — South-East (Night)',
  'Містить Полярну зорю, яка вказує майже точно на Північний полюс світу і залишається нерухомою протягом усієї ночі.':
    'Contains Polaris (the North Star), which points almost directly to the North Celestial Pole and remains stationary all night.',
  'Найвідоміший астеризм українського неба — Великий Віз. Дві крайні зорі ковша (Мерак і Дубхе) вказують прямо на Полярну зорю.':
    'Home to the famous Big Dipper asterism. Its two outer pointer stars (Merak and Dubhe) point directly toward Polaris.',
  'Яскраве сузір’я у формі літери «W» або «M» на тлі Чумацького Шляху. В Україні не заходить за горизонт цілий рік.':
    'A bright W-shaped constellation set against the Milky Way. Circumpolar at mid-northern latitudes all year round.',
  'Північний Хрест, що летить уздовж Чумацького Шляху. Його головна зоря Денеб — одна з найяскравіших надгігантів нашої Галактики.':
    'Known as the Northern Cross soaring along the Milky Way. Its alpha star Deneb is one of the most luminous supergiants in our Galaxy.',
  'Вега — друга за яскравістю зоря північної півкулі неба та еталон нульової зоряної величини в астрономії.':
    'Vega is the second-brightest star in the northern celestial hemisphere and the historical baseline for zero apparent magnitude.',
  'Разом із Вегою та Денебом Альтаїр утворює знаменитий «Літньо-осінній трикутник», який добре видно ввечері.':
    'Together with Vega and Deneb, Altair forms the famous Summer-Autumn Triangle, prominent in the evening sky.',
  'Великий Квадрат Пегаса — головний орієнтир осіннього неба. Поруч розташована Галактика Андромеди (M31), видима неозброєним оком.':
    'The Great Square of Pegasus is the key landmark of the autumn sky, right next to the Andromeda Galaxy (M31), visible to the naked eye.',
  'Окрасою сузір’я є яскраво-помаранчевий гігант Альдебаран та розсіяне зоряне скупчення Плеяди (в Україні здавна відоме як Стожари або Волосожар).':
    'Highlighted by the bright orange giant Aldebaran and the sparkling Pleiades open star cluster (the Seven Sisters).',
  'Найвеличніше сузір’я зимового й осінньо-нічного неба. Три зорі Пояса Оріона в українській народній традиції називали «Косарі».':
    "The most majestic constellation of the night sky, featuring the bright supergiants Betelgeuse and Rigel and the three stars of Orion's Belt.",

  // EclipseAndCelestialWidget (ALL strings)
  'Астрономічний календар: Повні затемнення, Зорепади та Планети':
    'Astronomical Calendar: Total Eclipses, Meteor Showers & Planets',
  'Коли затемнення': 'Eclipses',
  Зорепади: 'Meteor Showers',
  Планети: 'Planets',
  'Найближчі повні сонячні та місячні затемнення:':
    'Upcoming Total Solar and Lunar Eclipses:',
  Початок: 'Start',
  Максимум: 'Maximum',
  Кінець: 'End',
  'Дата та пік:': 'Date & Peak:',
  'Тривалість фази:': 'Phase Duration:',
  'Видимість в Україні:': 'Visibility in Europe / Ukraine:',
  'Повне сонячне затемнення «Затемнення століття»':
    'Total Solar Eclipse — "Eclipse of the Century"',
  'Повне сонячне': 'Total Solar',
  '2 серпня 2027 року': 'August 2, 2027',
  '13:07 за Києвом': '13:07 EEST',
  '6 хв 23 с': '6 min 23 s',
  'Видиме в Україні (часткова фаза до 45% на півдні та заході)':
    'Visible in Ukraine & Europe (partial phase up to 45%)',
  'Найтриваліше повне сонячне затемнення на суходолі у XXI столітті! Смуга повної темряви пройде через Гібралтар та Луксор, а в Україні вдень буде видно виразне часткове закриття Сонця.':
    'The longest total solar eclipse on land in the 21st century! The path of totality crosses Gibraltar and Luxor, with a prominent partial solar eclipse visible across Europe and Ukraine.',
  'Глибоке напівтіньове місячне затемнення': 'Deep Penumbral Lunar Eclipse',
  'Місячне (напівтіньове)': 'Lunar (Penumbral)',
  '20 лютого 2027 року': 'February 20, 2027',
  '01:13 за Києвом (ніч на 21 лютого)': '01:13 EET (Night of Feb 21)',
  '4 год 01 хв': '4 h 01 min',
  'Повністю видиме по всій території України': 'Fully visible across all of Ukraine & Europe',
  'Місяць майже повністю зануриться у земну напівтінь (92.7% диска), через що південний край Повні помітно потемнішає на нічному небі України.':
    "The Moon will immerse deeply into Earth's penumbra (92.7% of the disc), noticeably darkening the southern limb of the Full Moon.",
  'Повне місячне затемнення «Кривавий Місяць»': 'Total Lunar Eclipse — "Blood Moon"',
  'Повне місячне': 'Total Lunar',
  '31 грудня 2028 року': 'December 31, 2028',
  '18:52 за Києвом': '18:52 EET',
  '1 год 11 хв (повна фаза)': '1 h 11 min (totality)',
  'Повністю видиме в Україні (у новорічний вечір!)':
    "Fully visible in Ukraine & Europe (on New Year's Eve!)",
  'Рідкісне новорічне повне місячне затемнення! Увечері 31 грудня Місяць над Україною повністю увійде в тінь Землі й набуде глибокого мідно-багряного відтінку.':
    "A rare New Year's Eve total lunar eclipse! On the evening of December 31, the Moon will enter Earth's umbra and turn a deep copper-crimson hue.",
  'Кільцеподібне сонячне затемнення «Вогняне кільце»':
    'Annular Solar Eclipse — "Ring of Fire"',
  'Кільцеподібне сонячне': 'Annular Solar',
  '6 лютого 2027 року': 'February 6, 2027',
  '18:00 за Києвом': '18:00 EET',
  '7 хв 51 с': '7 min 51 s',
  'Не видиме в Україні (Західна півкуля)': 'Visible in South America & West Africa',
  'Місяць перебуватиме поблизу апогею, тому його видимий діаметр буде меншим за сонячний, утворюючи яскраве «вогняне кільце» навколо темного силуету Місяця.':
    'With the Moon near apogee, its apparent diameter is smaller than the Sun, creating a brilliant "Ring of Fire" around the lunar silhouette.',
  'Повне сонячне затемнення у Південній півкулі':
    'Total Solar Eclipse in the Southern Hemisphere',
  '22 липня 2028 року': 'July 22, 2028',
  '05:56 за Києвом': '05:56 EEST',
  '5 хв 10 с': '5 min 10 s',
  'Не видиме в Україні (Австралія та Нова Зеландія)': 'Visible in Australia & New Zealand',
  'Повна фаза пройде безпосередньо над Сіднеєм уперше за понад 150 років, триваючи понад 5 хвилин.':
    'Totality passes directly over Sydney for the first time in over 150 years, lasting more than 5 minutes.',
  Оріоніди: 'Orionids',
  '21–22 жовтня (активні 2 жовт. – 7 лист.)': 'Oct 21–22 (active Oct 2 – Nov 7)',
  'Комета Галлея (1P/Halley)': "Halley's Comet (1P/Halley)",
  'Сузір’я Оріона': 'Constellation Orion',
  'Швидкі білі й жовтуваті метеори (66 км/с), що залишають стійкі іонізаційні сліди в нічному небі. Найкраще спостерігати після опівночі до світанку.':
    'Fast white and yellow meteors (66 km/s) that leave persistent ionized trails in the night sky. Best viewed between midnight and dawn.',
  Леоніди: 'Leonids',
  '17–18 листопада': 'November 17–18',
  'Комета Темпеля — Туттля': 'Comet Tempel–Tuttle',
  'Сузір’я Лева': 'Constellation Leo',
  'Найшвидші метеори року (71 км/с), відомі своїми яскравими болідами з блакитним та зеленим світінням.':
    'The fastest meteors of the year (71 km/s), famous for bright fireballs with vivid blue and green afterglows.',
  Гемініди: 'Geminids',
  '13–14 грудня': 'December 13–14',
  'Астероїд 3200 Фаетон': 'Asteroid 3200 Phaethon',
  'Сузір’я Близнюків': 'Constellation Gemini',
  'Один із найрясніших метеорних потоків року — до 120 яскравих різнобарвних метеорів за годину за чистого неба.':
    'One of the richest meteor showers of the year, producing up to 120 bright, multi-colored meteors per hour under dark skies.',
  Персеїди: 'Perseids',
  '12–13 серпня': 'August 12–13',
  'Комета Свіфта — Туттля': 'Comet Swift–Tuttle',
  'Сузір’я Персея': 'Constellation Perseus',
  'Улюблений літній зорепад українців із теплими ночами та частими яскравими спалахами.':
    'Beloved summer meteor shower featuring warm nights and frequent bright shooting stars.',
  Юпітер: 'Jupiter',
  'Близнюки / Телець': 'Gemini / Taurus',
  'Пізній вечір — до світанку': 'Late evening until dawn',
  'Найяскравіший газовий гігант; у бінокль помітні 4 галілеєві супутники (Іо, Європа, Ганімед, Каллісто).':
    'Brightest gas giant; its 4 Galilean moons (Io, Europa, Ganymede, Callisto) are visible even in binoculars.',
  Сатурн: 'Saturn',
  'Водолій / Риби': 'Aquarius / Pisces',
  'З вечора до 02:30 ночі': 'Evening until 02:30 AM',
  'Спокійне золотаве світло на південному небосхилі; у невеликий телескоп видно систему кілець.':
    'Steady golden glow in the southern sky; its iconic ring system is visible through a small telescope.',
  Венера: 'Venus',
  'Вечірня / Ранкова зоря': 'Evening / Morning Star',
  'Сутінки після заходу Сонця': 'Twilight after sunset',
  'Третій за яскравістю об’єкт на небі після Сонця та Місяця.':
    'The third-brightest celestial object in the sky after the Sun and the Moon.',
  Марс: 'Mars',
  'Рак / Близнюки': 'Cancer / Gemini',
  'Друга половина ночі та ранок': 'After midnight until morning',
  'Виразний червонувато-бурштиновий диск високо у східній частині неба перед світанком.':
    'Distinctive reddish-amber disc shining high in the eastern sky before dawn.',

  // FactCard & Daily Facts (ALL strings)
  Ще: 'Next',
  Всі: 'All',
  Природа: 'Nature',
  Історія: 'History',
  'Слово дня': 'Word of Day',
  Думка: 'Quote',
  'Читати повністю →': 'Read Full Story →',
  'Джерело / Автор:': 'Source / Author:',
  Зрозуміло: 'Got It',
  'Природа та Всесвіт': 'Nature & Universe',
  'Цей день в історії': 'This Day in History',
  'Українське слово дня': 'Ukrainian Word of the Day',
  'Думка дня': 'Thought of the Day',
  'Цікавий факт': 'Fascinating Fact',
  'Лісовий інтернет: як дерева спілкуються одне з одним':
    'The Wood Wide Web: How Trees Communicate with Each Other',
  'Під нашими ногами існує гігантська мережа мікоризи (грибниць), яку вчені називають "Wood Wide Web".':
    'Beneath our feet lies a vast mycorrhizal fungal network that scientists call the "Wood Wide Web".',
  'Через цю підземну мережу дерева здатні передавати вуглець, воду та поживні речовини слабшим сусідам і навіть надсилати хімічні попередження про напад комах-шкідників за лічені години до того, як вони дістануться іншого краю лісу.':
    'Through this underground network, trees share carbon, water, and nutrients with neighboring trees and even send chemical early-warning signals about insect pests.',
  'Сюзанна Сімард, лісовий еколог': 'Suzanne Simard, Forest Ecologist',
  'Екологія лісу': 'Forest Ecology',
  'Початок космічної ери людства (жовтень)': 'Dawn of the Human Space Age (October)',
  'На початку жовтня людство вперше подолало земне тяжіння і відкрило космічну еру штучних супутників.':
    "In early October, humanity first overcame Earth's gravity and opened the space age of orbital satellites.",
  'Перший штучний супутник Землі мав діаметр усього 58 сантиметрів і важив 83 кілограми, але його простий радіосигнал "біп-біп" слухали радіоаматори по всьому світу. Це змінило технологічну історію назавжди, започаткувавши GPS, супутниковий інтернет та дослідження планет.':
    'The first artificial Earth satellite was just 58 cm in diameter and weighed 83 kg, yet its radio signal ushered in GPS navigation, global communications, and planetary exploration.',
  'Хроніка досліджень Всесвіту': 'Space Exploration Chronicles',
  Астронавтика: 'Astronautics',
  'Ле́гіт — тихий, теплий і лагідний вітерець':
    'Lehit (Ле́гіт) — A quiet, warm, and gentle breeze',
  'Одне з найкрасивіших питомих українських слів для опису ніжних природних станів.':
    'One of the most poetic native Ukrainian words describing a delicate, soothing natural breeze.',
  'Легіт — це легкий подих вітру, який ледь колише траву чи верхівки дерев. В українській класичній поезії він символізує спокій, передчуття світанку або теплої лагідної осені, коли сонце ще пестить природу перед зимою.':
    'Lehit is a soft breath of wind that barely sways the grass or treetops. In classic Ukrainian poetry, it symbolizes serenity, dawn, and golden autumn warmth.',
  'Словник живої мови': 'Living Language Dictionary',
  'Скарби мови': 'Language Gems',
  'Про споріднену працю та радість буття': 'On Kindred Work and the Joy of Being',
  '«Не той дурний, хто не знає, а той, хто знати не хоче.»':
    '"Foolish is not the one who does not know, but the one who refuses to learn."',
  'Григорій Сковорода нагадував: істинне щастя людини ховається не в накопиченні речей чи гонитві за зовнішнім схваленням, а в житті за своєю природою та щирій увазі до кожного дня, який дарує нам доля.':
    'Hryhorii Skovoroda reminded us that true happiness lies not in accumulating possessions, but in living according to your calling and appreciating each day.',
  'Григорій Сковорода': 'Hryhorii Skovoroda',
  'Філософія серця': 'Philosophy of the Heart',
  'Таємниця осіннього багрянцю листя': 'The Secret Behind Autumn Crimson Foliage',
  'Золоті та помаранчеві пігменти (каротиноїди) є в листі все літо, але ми їх не бачимо через зелений хлорофіл.':
    'Golden and orange pigments (carotenoids) are present in leaves all summer, masked by green chlorophyll.',
  'Коли восени світловий день скорочується і температура падає, дерево припиняє виробляти хлорофіл, і він руйнується. Тоді відкриваються приховані кольори: жовтий ксантофіл, помаранчевий каротин, а для захисту від сонця листя додатково синтезує рубінові антоціани.':
    'As autumn days shorten and temperatures drop, trees stop producing chlorophyll, unveiling golden xanthophylls, orange carotenes, and ruby anthocyanins.',
  'Біохімія рослин': 'Plant Biochemistry',
  'Осінній феномен': 'Autumn Phenomenon',
  'Чому свіже повітря сповільнює суб’єктивний біг часу':
    'Why Nature Slows Down Our Subjective Perception of Time',
  'Перебування на природі хоча б 20 хвилин перемикає мозок у стан "м’якої уваги" (soft fascination).':
    'Spending just 20 minutes in nature shifts the brain into a state of restorative "soft fascination".',
  'У міському ритмі мозок перебуває в режимі спрямованої уваги, що спричиняє когнітивну втому і відчуття, що день промайнув непомітно. Споглядання природних фракталів (гілок, хвиль, хмар) знижує рівень кортизолу на 21% та повертає відчуття глибини кожної миті.':
    'Observing natural fractals—branches, waves, and clouds—lowers cortisol levels by 21% and restores a deep sense of presence in every moment.',
  'Дослідження нейропсихології': 'Neuropsychology Research',
  'Ментальний баланс': 'Mental Balance',
  'Ви́рій — тепла казкова країна, куди відлітають птахи':
    'Vyrii (Ви́рій) — The mythical warm land where birds fly for winter',
  'Давній український міфологічний образ теплого краю за морем, де немає зими.':
    'An ancient Ukrainian mythological vision of a warm land beyond the sea where winter never comes.',
  'У давніх повір’ях вирій — це райська земля вічного літа та спокою, де зимують перелітні птахи та комахи. Вислів "летіти у вирій" став поетичною метафорою подорожей, оновлення та неминучого повернення додому навесні.':
    'In folklore, Vyrii is a serene land of eternal summer where migratory birds spend the winter, symbolizing renewal and the return home in spring.',
  'Українська міфологія': 'Ukrainian Mythology',
  'Краса у кожній невипадковій секунді': 'Beauty in Every Unrepeatable Second',
  '«І кожен фініш — це, по суті, старт... І наперед не треба ворожити, і за минулим плакати не варт.»':
    '"And every finish is, in essence, a start... Do not try to foretell the future, nor weep for what is past."',
  'Сьогоднішній день — це єдина реальність, яка є у наших руках. Усе, що було вчора — вже досвід; усе, що буде завтра — ще не написано. Дозвольте собі прожити цей день усвідомлено.':
    'Today is the only reality in our hands. Yesterday is already experience; tomorrow is yet unwritten. Allow yourself to live this day mindfully.',
  'Ліна Костенко': 'Lina Kostenko',
  'Поезія життя': 'Poetry of Life',

  // Ambient Sound Panel (ALL strings)
  'Зупинити всі': 'Stop All',
  'Увімкнути дощ': 'Start Rain',
  'Осінній дощ': 'Autumn Rain',
  'Лісовий легіт': 'Forest Breeze',
  'Тепле багаття': 'Warm Campfire',
  'Хвилі океану': 'Ocean Waves',
  Грає: 'Playing',
  Вимк: 'Off',

  // Wallpapers & Modals (ALL strings)
  Наступний: 'Next',
  Галерея: 'Gallery',
  'Туманні Карпати': 'Misty Carpathians',
  'Ранкова тиша гірського хребта': 'Morning silence of the mountain ridge',
  'Чорногора, Карпати, Україна': 'Chornohora, Carpathians, Ukraine',
  'Колекція Brave Nature · Україна': 'Brave Nature Collection · Ukraine',
  'Смарагдове Північне Сяйво': 'Emerald Aurora Borealis',
  'Танець Аврори над арктичним фіордом': 'Aurora dancing over an Arctic fjord',
  'Лофотенські острови, Норвегія': 'Lofoten Islands, Norway',
  'Колекція Brave Cosmos · Арктика': 'Brave Cosmos Collection · Arctic',
  'Чумацький Шлях над Альпами': 'Milky Way Over the Alps',
  'Зоряна арка Галактики у кришталевому небі': 'Galactic star arch in a crystal sky',
  'Доломітові Альпи, Італія': 'Dolomites, Italy',
  'Колекція Brave Night Sky · Альпи': 'Brave Night Sky Collection · Alps',
  'Світанок Сакури біля Фудзі': 'Sakura Dawn Near Mount Fuji',
  'Ніжні пелюстки над ранковим озером': 'Delicate petals over a morning lake',
  'Озеро Кавагутіко, Японія': 'Lake Kawaguchiko, Japan',
  'Колекція Brave Seasons · Кіото та Фудзі': 'Brave Seasons Collection · Kyoto & Fuji',
  'Ісландський Водоспад на Заході': 'Icelandic Waterfall at Sunset',
  'Базальтові скелі та золотий водяний пил': 'Basalt cliffs and golden mist',
  'Високогір’я Ісландії': 'Highlands of Iceland',
  'Колекція Brave Earth · Ісландія': 'Brave Earth Collection · Iceland',
  'Смарагдове Озеро': 'Emerald Alpine Lake',
  'Кришталеве дзеркало серед скель': 'Crystal mirror among mountain peaks',
  'Високогірне альпійське озеро': 'High-altitude Alpine lake',
  'Колекція Brave Alpine · Європа': 'Brave Alpine Collection · Europe',
  'Золотий Осінній Праліс': 'Golden Autumn Primeval Forest',
  'Теплі промені крізь багряні крони': 'Warm sunbeams through crimson canopies',
  'Букові праліси Карпат': 'Primeval Beech Forests, Carpathians',
  'Колекція Brave Forest · Спадщина ЮНЕСКО': 'Brave Forest Collection · UNESCO Heritage',
  'Оксамитові Дюни Сутінків': 'Velvet Twilight Dunes',
  'Золотий пісок під першими вечірніми зорями': 'Golden sand beneath the first evening stars',
  'Пустеля Наміб': 'Namib Desert',
  'Колекція Brave Horizons · Намібія': 'Brave Horizons Collection · Namibia',
  'Прибережний Захід Океану': 'Coastal Ocean Sunset',
  'Шепіт хвиль та оксамитові сутінки': 'Whispering waves and velvet dusk',
  'Атлантичне узбережжя': 'Atlantic Coastline',
  'Колекція Brave Ocean · Португалія': 'Brave Ocean Collection · Portugal',
  'Високодеталізовані панорами природи, космосу та гір із живою кінематографічною анімацією':
    'High-detail panoramas of nature, cosmos, and mountains with live cinematic motion',
  'Випадковий фон': 'Random Wallpaper',
  'Космос та Північне сяйво': 'Cosmos & Aurora',
  'Гори та Дюни': 'Mountains & Dunes',
  'Водоспади та Озера': 'Waterfalls & Lakes',
  'Сакура та Праліси': 'Sakura & Forests',
  'Автозміна (як у Brave):': 'Auto-Cycle (Brave style):',
  '30 с': '30 s',
  '1 хв': '1 min',
  '5 хв': '5 min',
  'Анімація фону (3D + Ken Burns):': 'Background Motion (3D + Ken Burns):',
  'Живий рух увімкнено': 'Live Motion Enabled',
  'Статичний фон': 'Static Background',
  'Контраст / Затемнення:': 'Contrast / Dimming:',
  Готово: 'Done',
  'Під стиль фону': 'Match Wallpaper Style',
  'За погодою у місті': 'Match Live City Weather',
  'Синхронізація з реальними даними метеостанції': 'Synchronized with live weather station data',
  'Смарагдові та фіолетові хвилі Аврори на зоряному небі':
    'Emerald and violet Aurora waves across the starry sky',
  'Мерехтливі зорі та яскраві падаючі метеори від руху миші':
    'Twinkling stars and bright shooting meteors reactive to cursor movement',
  'Ніжно-рожеві пелюстки, що кружляють у весняному вітрі':
    'Soft pink cherry blossom petals swirling in the spring breeze',
  'Косий дощ із розгалуженими спалахами блискавок у небі':
    'Angled rain with branching lightning flashes across the sky',
  'Краплі дощу з бризками та відхиленням від курсора':
    'Raindrops with splashes and interactive cursor deflection',
  'Плавні лапаті сніжинки, що реагують на рух повітря':
    'Gentle snowflakes reacting to air currents',
  'Рухомі об’ємні хмари та серпанок над вершинами':
    'Drifting volumetric mist and fog layers over mountain peaks',
  'Багряне й золоте листя, що кружляє у повітрі':
    'Crimson and golden autumn leaves swirling in the air',
  'Теплі промені світла та сяючі золоті порошинки':
    'Warm diagonal sunbeams and glowing golden dust motes',
  'Таємничі біолюмінесцентні вогники у сутінках':
    'Mysterious bioluminescent fireflies glowing at dusk',
  'Живі анімації атмосфери та космосу': 'Live Atmosphere & Cosmic Animations',
  'Інтерактивні ефекти полотна, які реагують на рух миші та дотики пальцем':
    'Interactive canvas effects that respond to mouse movement and touch',
  'Вимкнути ефекти': 'Disable Effects',
  'Інтенсивність:': 'Intensity:',
};

const PATTERN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/^Ефект:\s*(.+)$/i, 'Effect: $1'],
  [/^Жива анімація:\s*$/i, 'Live Animation: '],
  [/^Усі фони \((\d+)\)$/i, 'All Wallpapers ($1)'],
  [/^Колекція фонів Brave \((\d+)\)$/i, 'Brave Wallpaper Collection ($1)'],
  [/^Колекція фонів у стилі Brave \((\d+) краєвидів\)$/i, 'Brave Wallpaper Collection ($1 Landscapes)'],
  [/^Автоматично під обрані шпалери \((.+)\)$/i, 'Automatically matched to wallpaper ($1)'],
  [/^Інтерактивна Зоряна Карта · (.+)$/i, 'Interactive Star Map · $1'],
  [/^Радіус огляду: 100 км · (.+)$/i, 'Radar Range: 100 km · $1'],
  [/^Час огляду: (.+)$/i, 'Observation Time: $1'],
  [/^Головна зоря:\s*$/i, 'Alpha Star: '],
  [/^Схід: (.+) · Захід: (.+) · Сузір’я: (.+)$/i, 'Rise: $1 · Set: $2 · Zodiac: $3'],
  [/^через (\d+) дн\.$/i, 'in $1 d'],
  [/^Через (\d+) дн\. (\d+) год$/i, 'In $1 d $2 h'],
  [/^([+\-]?\d+) дн\.$/i, '$1 d'],
  [/^([\d.]+) тис\. км$/i, '$1k km'],
  [/^~(\d+) мет\.\/год$/i, '~$1 meteors/h'],
  [/^Пік: (.+)$/i, 'Peak: $1'],
  [/^Радіант:\s*$/i, 'Radiant: '],
  [/^Джерело:\s*$/i, 'Parent Body: '],
  [/^Блиск (.+)$/i, 'Mag $1'],
  [/^Сузір’я:\s*$/i, 'Constellation: '],
  [/^Час: (.+)$/i, 'Time: $1'],
  [/^(.+) · Магнітуда (.+)$/i, '$1 · Magnitude $2'],
  [/^(.+) · Тривалість: (.+)$/i, '$1 · Duration: $2'],
  [/^Анімація реагує на вітер \((.+) км\/г\) та темп\.$/i, 'Animation reacts to wind ($1 km/h) & temp.'],
  [/^Грає:\s*(.+)$/i, 'Playing: $1'],
  [/^Ймовірність (\d+)% · ([\d.]+) мм$/i, 'Probability $1% · $2 mm'],
  [/^Прогноз (\d+) год$/i, '$1h Forecast'],
  [/^День (\d+) із (\d+)$/i, 'Day $1 of $2'],
  [/^(\d+)-й тиждень року$/i, 'Week $1 of Year'],
  [/^Залишилось (.+) світлового дня$/i, '$1 of daylight remaining'],
  [/^До сходу сонця ще (.+)$/i, '$1 until sunrise'],
  [/^Відчувається як\s*$/i, 'Feels like '],
  [/^(\d+)\s*км\/год(.*)$/i, '$1 km/h$2'],
  [/^(\d+)\s*км\/г(.*)$/i, '$1 km/h$2'],
  [/^(\d+)\s*гПа$/i, '$1 hPa'],
  [/^(\d+)\s*мм$/i, '$1 mm'],
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

  // Handle strings wrapped in quotes like "{activeFact.detail}"
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith('«') && trimmed.endsWith('»'))
  ) {
    const inner = trimmed.slice(1, -1).trim();
    if (EXACT_UK_TO_EN[inner]) {
      return input.replace(inner, EXACT_UK_TO_EN[inner]);
    }
  }

  if (EXACT_UK_TO_EN[trimmed]) {
    return input.replace(trimmed, EXACT_UK_TO_EN[trimmed]);
  }

  for (const [regex, replacement] of PATTERN_REPLACEMENTS) {
    if (regex.test(trimmed)) {
      const converted = trimmed.replace(regex, replacement);
      // Also translate any Ukrainian sub-phrases inside the captured groups
      let refined = converted;
      for (const [ukKey, enVal] of Object.entries(EXACT_UK_TO_EN)) {
        if (ukKey.length > 2 && refined.includes(ukKey)) {
          refined = refined.split(ukKey).join(enVal);
        }
      }
      return input.replace(trimmed, refined);
    }
  }

  // Substring replacements for compound strings & mixed nodes
  let out = input;
  const compoundMap: Array<[string, string]> = [
    ['lofi beats · Спокій та фокус', 'lofi beats · Calm & Focus'],
    ['Peaceful Piano · Тихе фортепіано', 'Peaceful Piano · Gentle Keys'],
    ['Deep Focus · Глибока концентрація', 'Deep Focus · Flow State'],
    ['Nature Sounds · Звуки дикої природи', 'Nature Sounds · Wild Ambience'],
    ['Chill Tracks · Вечірній чіл', 'Chill Tracks · Evening Relax'],
    ['Напрямок руху повітряних мас визначається поточним вітром (', 'Air mass movement is driven by current wind ('],
    ['Щільність хмарного покриву становить', 'Cloud cover density is'],
    ['Година:', 'Hour:'],
    ['Темп:', 'Temp:'],
    ['Опади:', 'Precip:'],
    ['Головна зоря:', 'Alpha Star:'],
    ['Схід:', 'Rise:'],
    ['Захід:', 'Set:'],
    ['Сузір’я:', 'Zodiac:'],
    ['Вітер', 'Wind'],
    ['Київ', 'Kyiv'],
    ['Україна', 'Ukraine'],
    ['год', 'h'],
    ['хв', 'm'],
    ['км/год', 'km/h'],
    ['км/г', 'km/h'],
    ['тис. км', 'k km'],
    ['км', 'km'],
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
        const prevOrig = originalTextMap.get(node);
        // If React updated the text node with a new Ukrainian string, update originalTextMap
        if (prevOrig === undefined || (currentVal !== translateStringToEnglish(prevOrig) && /[а-яіїєґА-ЯІЇЄҐ]/.test(currentVal))) {
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
        if (!(attr in savedAttrs) || (val !== translateStringToEnglish(savedAttrs[attr]) && /[а-яіїєґА-ЯІЇЄҐ]/.test(val))) {
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
