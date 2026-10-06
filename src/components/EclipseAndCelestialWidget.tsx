import React, { useState, useMemo } from 'react';
import { Sun, Moon, Sparkles, Calendar, Eye, Globe, Orbit } from 'lucide-react';

interface EclipseEvent {
  id: string;
  title: string;
  type: 'total-solar' | 'annular-solar' | 'total-lunar' | 'penumbral-lunar';
  typeLabel: string;
  isoDate: string;
  displayDate: string;
  peakTimeKyiv: string;
  maxDuration: string;
  ukraineVisibility: string;
  visibilityRegion: string;
  magnitude: string;
  description: string;
}

const ECLIPSE_EVENTS: EclipseEvent[] = [
  {
    id: 'total-solar-2027',
    title: 'Повне сонячне затемнення «Затемнення століття»',
    type: 'total-solar',
    typeLabel: 'Повне сонячне',
    isoDate: '2027-08-02T10:07:00Z',
    displayDate: '2 серпня 2027 року',
    peakTimeKyiv: '13:07 за Києвом',
    maxDuration: '6 хв 23 с',
    ukraineVisibility: 'Видиме в Україні (часткова фаза до 45% на півдні та заході)',
    visibilityRegion: 'Іспанія, Середземномор’я, Єгипет (Луксор), Саудівська Аравія; часткове — вся Україна та Європа',
    magnitude: '1.079',
    description:
      'Найтриваліше повне сонячне затемнення на суходолі у XXI столітті! Смуга повної темряви пройде через Гібралтар та Луксор, а в Україні вдень буде видно виразне часткове закриття Сонця.',
  },
  {
    id: 'lunar-feb-2027',
    title: 'Глибоке напівтіньове місячне затемнення',
    type: 'penumbral-lunar',
    typeLabel: 'Місячне (напівтіньове)',
    isoDate: '2027-02-20T23:13:00Z',
    displayDate: '20 лютого 2027 року',
    peakTimeKyiv: '01:13 за Києвом (ніч на 21 лютого)',
    maxDuration: '4 год 01 хв',
    ukraineVisibility: 'Повністю видиме по всій території України',
    visibilityRegion: 'Україна, вся Європа, Африка, Азія',
    magnitude: '0.927',
    description:
      'Місяць майже повністю зануриться у земну напівтінь (92.7% диска), через що південний край Повні помітно потемнішає на нічному небі України.',
  },
  {
    id: 'total-lunar-2028',
    title: 'Повне місячне затемнення «Кривавий Місяць»',
    type: 'total-lunar',
    typeLabel: 'Повне місячне',
    isoDate: '2028-12-31T16:52:00Z',
    displayDate: '31 грудня 2028 року',
    peakTimeKyiv: '18:52 за Києвом',
    maxDuration: '1 год 11 хв (повна фаза)',
    ukraineVisibility: 'Повністю видиме в Україні (у новорічний вечір!)',
    visibilityRegion: 'Україна, Європа, Азія, Австралія',
    magnitude: '1.248',
    description:
      'Рідкісне новорічне повне місячне затемнення! Увечері 31 грудня Місяць над Україною повністю увійде в тінь Землі й набуде глибокого мідно-багряного відтінку.',
  },
  {
    id: 'annular-solar-2027',
    title: 'Кільцеподібне сонячне затемнення «Вогняне кільце»',
    type: 'annular-solar',
    typeLabel: 'Кільцеподібне сонячне',
    isoDate: '2027-02-06T16:00:00Z',
    displayDate: '6 лютого 2027 року',
    peakTimeKyiv: '18:00 за Києвом',
    maxDuration: '7 хв 51 с',
    ukraineVisibility: 'Не видиме в Україні (Західна півкуля)',
    visibilityRegion: 'Чилі, Аргентина, Уругвай, Атлантичний океан, Західна Африка',
    magnitude: '0.928',
    description:
      'Місяць перебуватиме поблизу апогею, тому його видимий діаметр буде меншим за сонячний, утворюючи яскраве «вогняне кільце» навколо темного силуету Місяця.',
  },
  {
    id: 'total-solar-2028',
    title: 'Повне сонячне затемнення у Південній півкулі',
    type: 'total-solar',
    typeLabel: 'Повне сонячне',
    isoDate: '2028-07-22T02:56:00Z',
    displayDate: '22 липня 2028 року',
    peakTimeKyiv: '05:56 за Києвом',
    maxDuration: '5 хв 10 с',
    ukraineVisibility: 'Не видиме в Україні (Австралія та Нова Зеландія)',
    visibilityRegion: 'Австралія (зокрема Сідней), Нова Зеландія, Південно-Східна Азія',
    magnitude: '1.056',
    description:
      'Повна фаза пройде безпосередньо над Сіднеєм уперше за понад 150 років, триваючи понад 5 хвилин.',
  },
];

interface MeteorShower {
  id: string;
  name: string;
  peakDates: string;
  zhr: number; // meteors per hour
  parentBody: string;
  radiant: string;
  status: string;
  description: string;
}

const METEOR_SHOWERS: MeteorShower[] = [
  {
    id: 'orionids',
    name: 'Оріоніди',
    peakDates: '21–22 жовтня (активні 2 жовт. – 7 лист.)',
    zhr: 20,
    parentBody: 'Комета Галлея (1P/Halley)',
    radiant: 'Сузір’я Оріона',
    status: 'Активний у жовтні',
    description:
      'Швидкі білі й жовтуваті метеори (66 км/с), що залишають стійкі іонізаційні сліди в нічному небі. Найкраще спостерігати після опівночі до світанку.',
  },
  {
    id: 'leonids',
    name: 'Леоніди',
    peakDates: '17–18 листопада',
    zhr: 15,
    parentBody: 'Комета Темпеля — Туттля',
    radiant: 'Сузір’я Лева',
    status: 'Наступний місяць',
    description:
      'Найшвидші метеори року (71 км/с), відомі своїми яскравими болідами з блакитним та зеленим світінням.',
  },
  {
    id: 'geminids',
    name: 'Гемініди',
    peakDates: '13–14 грудня',
    zhr: 120,
    parentBody: 'Астероїд 3200 Фаетон',
    radiant: 'Сузір’я Близнюків',
    status: 'Найпотужніший потік зими',
    description:
      'Один із найрясніших метеорних потоків року — до 120 яскравих різнобарвних метеорів за годину за чистого неба.',
  },
  {
    id: 'perseids',
    name: 'Персеїди',
    peakDates: '12–13 серпня',
    zhr: 100,
    parentBody: 'Комета Свіфта — Туттля',
    radiant: 'Сузір’я Персея',
    status: 'Літній пік',
    description:
      'Улюблений літній зорепад українців із теплими ночами та частими яскравими спалахами.',
  },
];

interface PlanetVisibility {
  name: string;
  constellation: string;
  magnitude: string;
  timeWindow: string;
  color: string;
  note: string;
}

const PLANETS: PlanetVisibility[] = [
  {
    name: 'Юпітер',
    constellation: 'Близнюки / Телець',
    magnitude: '-2.6m',
    timeWindow: 'Пізній вечір — до світанку',
    color: '#fde68a',
    note: 'Найяскравіший газовий гігант; у бінокль помітні 4 галілеєві супутники (Іо, Європа, Ганімед, Каллісто).',
  },
  {
    name: 'Сатурн',
    constellation: 'Водолій / Риби',
    magnitude: '+0.7m',
    timeWindow: 'З вечора до 02:30 ночі',
    color: '#fcd34d',
    note: 'Спокійне золотаве світло на південному небосхилі; у невеликий телескоп видно систему кілець.',
  },
  {
    name: 'Венера',
    constellation: 'Вечірня / Ранкова зоря',
    magnitude: '-4.0m',
    timeWindow: 'Сутінки після заходу Сонця',
    color: '#f8fafc',
    note: 'Третій за яскравістю об’єкт на небі після Сонця та Місяця.',
  },
  {
    name: 'Марс',
    constellation: 'Рак / Близнюки',
    magnitude: '+0.4m',
    timeWindow: 'Друга половина ночі та ранок',
    color: '#fca5a5',
    note: 'Виразний червонувато-бурштиновий диск високо у східній частині неба перед світанком.',
  },
];

export const EclipseAndCelestialWidget: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'eclipses' | 'meteors' | 'planets'>('eclipses');
  const [selectedEclipseId, setSelectedEclipseId] = useState<string>('total-solar-2027');
  // Simulator slider: 0..100 (50 = maximum eclipse totality)
  const [eclipseSimProgress, setEclipseSimProgress] = useState<number>(50);

  const selectedEclipse =
    ECLIPSE_EVENTS.find((e) => e.id === selectedEclipseId) || ECLIPSE_EVENTS[0];

  const countdown = useMemo(() => {
    const now = new Date();
    const target = new Date(selectedEclipse.isoDate);
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      return { days: 0, hours: 0, isPast: true };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isPast: false };
  }, [selectedEclipse]);

  // Compute offset of the occulting body in the simulator (-48 to +48 px, 0 at 50% slider)
  const simOffsetX = ((eclipseSimProgress - 50) / 50) * 46;
  const isNearTotality = Math.abs(eclipseSimProgress - 50) <= 6;

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header & Section Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-amber-300 shrink-0" />
            <h3 className="text-sm font-semibold text-white">
              Астрономічний календар: Повні затемнення, Зорепади та Планети
            </h3>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('eclipses')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'eclipses'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Коли затемнення
            </button>
            <button
              onClick={() => setActiveSubTab('meteors')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'meteors'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Зорепади
            </button>
            <button
              onClick={() => setActiveSubTab('planets')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'planets'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Планети
            </button>
          </div>
        </div>

        {/* TAB 1: ECLIPSES */}
        {activeSubTab === 'eclipses' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left: Eclipse List Selector */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
              <div className="text-xs text-stone-400 mb-0.5">
                Найближчі повні сонячні та місячні затемнення:
              </div>
              {ECLIPSE_EVENTS.map((ev) => {
                const isSelected = ev.id === selectedEclipseId;
                const isSolar = ev.type.includes('solar');
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      setSelectedEclipseId(ev.id);
                      setEclipseSimProgress(50);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/45 shadow-sm'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        {isSolar ? (
                          <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                        )}
                        <span className="truncate">{ev.displayDate}</span>
                      </div>
                      <div className="text-[11px] text-stone-300 mt-0.5 truncate">{ev.title}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {ev.typeLabel} · Тривалість: {ev.maxDuration}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Interactive Visual Simulator & Countdown Details */}
            <div className="lg:col-span-7 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Interactive Eclipse SVG Visualizer */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-36 h-36 flex items-center justify-center rounded-2xl bg-stone-950/90 border border-white/10 overflow-hidden">
                    <svg viewBox="0 0 150 150" className="w-full h-full">
                      <defs>
                        <radialGradient id="solarCorona" cx="50%" cy="50%" r="50%">
                          <stop offset="35%" stopColor="#fef08a" stopOpacity="0.95" />
                          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.45" />
                          <stop offset="85%" stopColor="#fbbf24" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="bloodMoonGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                          <stop offset="70%" stopColor="#991b1b" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#450a0a" stopOpacity="0.95" />
                        </radialGradient>
                      </defs>

                      {selectedEclipse.type.includes('solar') ? (
                        <>
                          {/* Solar Corona Glow */}
                          <circle
                            cx="75"
                            cy="75"
                            r={isNearTotality ? '68' : '54'}
                            fill="url(#solarCorona)"
                          />
                          {/* Sun Disc */}
                          <circle cx="75" cy="75" r="34" fill="#fde047" />
                          {/* Diamond Ring flare when near totality */}
                          {isNearTotality && selectedEclipse.type === 'total-solar' && (
                            <circle cx="42" cy="64" r="4.5" fill="#ffffff" />
                          )}
                          {/* Occulting Moon Silhouette */}
                          <circle
                            cx={75 + simOffsetX}
                            cy="75"
                            r={selectedEclipse.type === 'total-solar' ? '34.8' : '31.2'}
                            fill="#090a0f"
                            stroke="rgba(254, 240, 138, 0.3)"
                            strokeWidth="0.8"
                          />
                        </>
                      ) : (
                        <>
                          {/* Full Moon Disc */}
                          <circle cx="75" cy="75" r="34" fill="#e7e5e4" />
                          {/* Earth Umbra / Penumbra Shadow */}
                          <circle
                            cx={75 + simOffsetX}
                            cy="75"
                            r="38"
                            fill={
                              selectedEclipse.type === 'total-lunar'
                                ? 'url(#bloodMoonGrad)'
                                : 'rgba(24, 24, 27, 0.65)'
                            }
                          />
                        </>
                      )}
                    </svg>
                  </div>

                  {/* Phase Scrubber */}
                  <div className="mt-2 w-36">
                    <div className="flex justify-between text-[10px] text-stone-400 font-data-mono mb-0.5">
                      <span>Початок</span>
                      <span className="text-amber-300">Максимум</span>
                      <span>Кінець</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={eclipseSimProgress}
                      onChange={(e) => setEclipseSimProgress(parseInt(e.target.value, 10))}
                      aria-label="Симуляція фази затемнення"
                      className="w-full accent-amber-400 cursor-pointer h-1"
                    />
                  </div>
                </div>

                {/* Selected Eclipse Details & Countdown */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-amber-300 font-medium">
                      {selectedEclipse.typeLabel} · Магнітуда {selectedEclipse.magnitude}
                    </span>
                    <span className="text-xs font-semibold font-data-mono text-white bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-lg">
                      Через {countdown.days} дн. {countdown.hours} год
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-white mt-1.5 font-serif-display">
                    {selectedEclipse.title}
                  </h4>

                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                    {selectedEclipse.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400">Дата та пік: </span>
                      <strong className="text-white font-data-mono">
                        {selectedEclipse.displayDate} ({selectedEclipse.peakTimeKyiv})
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400">Тривалість фази: </span>
                      <strong className="text-amber-300 font-data-mono">
                        {selectedEclipse.maxDuration}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-stone-400">Видимість в Україні: </span>
                      <strong className="text-emerald-300">
                        {selectedEclipse.ukraineVisibility}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: METEOR SHOWERS */}
        {activeSubTab === 'meteors' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {METEOR_SHOWERS.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                    <span className="text-xs font-semibold text-amber-300 font-data-mono">
                      ~{m.zhr} мет./год
                    </span>
                  </div>
                  <div className="text-[11px] text-sky-300 mt-0.5 font-data-mono">
                    Пік: {m.peakDates}
                  </div>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">{m.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-stone-400 space-y-0.5">
                  <div>
                    Радіант: <span className="text-stone-200">{m.radiant}</span>
                  </div>
                  <div>
                    Джерело: <span className="text-stone-300">{m.parentBody}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PLANETS */}
        {activeSubTab === 'planets' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PLANETS.map((planet) => (
              <div
                key={planet.name}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: planet.color }}
                      />
                      <h4 className="text-sm font-semibold text-white">{planet.name}</h4>
                    </div>
                    <span className="text-xs font-data-mono text-amber-300">
                      Блиск {planet.magnitude}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Сузір’я: <span className="text-stone-200">{planet.constellation}</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">{planet.note}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-data-mono">
                  Час: {planet.timeWindow}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
