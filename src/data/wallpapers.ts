import { NatureWallpaper } from '../types';

// Імпортуємо файли зображень
import carpathianMistImg from '../assets/images/nature_carpathian_mist_1791017301227.jpg';
import emeraldLakeImg from '../assets/images/nature_emerald_lake_1791017364059.jpg';
import autumnWoodlandImg from '../assets/images/nature_autumn_woodland_1791017375226.jpg';
import oceanCoastlineImg from '../assets/images/nature_ocean_coastline_1791017386994.jpg';
import auroraFjordImg from '../assets/images/nature_aurora_fjord_1791286012564.jpg';
import milkywayDolomitesImg from '../assets/images/nature_milkyway_dolomites_1791286025182.jpg';
import icelandWaterfallImg from '../assets/images/nature_iceland_waterfall_1791286036707.jpg';
import sakuraFujiImg from '../assets/images/nature_sakura_fuji_1791286048687.jpg';
import desertDunesImg from '../assets/images/nature_desert_dunes_1791286058588.jpg';

export const WALLPAPERS: NatureWallpaper[] = [
  {
    id: 'carpathian-mist',
    title: 'Туманні Карпати',
    subtitle: 'Ранкова тиша гірського хребта',
    location: 'Чорногора, Карпати, Україна',
    imageSrc: carpathianMistImg,
    category: 'mountains',
    credit: 'Колекція Brave Nature · Україна',
    recommendedEffect: 'mist',
    palette: {
      accent: '#E0A96D',
      ambientGlow: 'rgba(224, 169, 109, 0.16)',
    },
  },
  {
    id: 'aurora-fjord',
    title: 'Смарагдове Північне Сяйво',
    subtitle: 'Танець Аврори над арктичним фіордом',
    location: 'Лофотенські острови, Норвегія',
    imageSrc: auroraFjordImg,
    category: 'night',
    credit: 'Колекція Brave Cosmos · Арктика',
    recommendedEffect: 'aurora',
    palette: {
      accent: '#34D399',
      ambientGlow: 'rgba(52, 211, 153, 0.18)',
    },
  },
  {
    id: 'milkyway-dolomites',
    title: 'Чумацький Шлях над Альпами',
    subtitle: 'Зоряна арка Галактики у кришталевому небі',
    location: 'Доломітові Альпи, Італія',
    imageSrc: milkywayDolomitesImg,
    category: 'night',
    credit: 'Колекція Brave Night Sky · Альпи',
    recommendedEffect: 'shooting_stars',
    palette: {
      accent: '#818CF8',
      ambientGlow: 'rgba(129, 140, 248, 0.18)',
    },
  },
  {
    id: 'sakura-fuji',
    title: 'Світанок Сакури біля Фудзі',
    subtitle: 'Ніжні пелюстки над ранковим озером',
    location: 'Озеро Кавагутіко, Японія',
    imageSrc: sakuraFujiImg,
    category: 'forest',
    credit: 'Колекція Brave Seasons · Кіото та Фудзі',
    recommendedEffect: 'sakura',
    palette: {
      accent: '#F472B6',
      ambientGlow: 'rgba(244, 114, 182, 0.16)',
    },
  },
  {
    id: 'iceland-waterfall',
    title: 'Ісландський Водоспад на Заході',
    subtitle: 'Базальтові скелі та золотий водяний пил',
    location: 'Високогір’я Ісландії',
    imageSrc: icelandWaterfallImg,
    category: 'water',
    credit: 'Колекція Brave Earth · Ісландія',
    recommendedEffect: 'rain',
    palette: {
      accent: '#38BDF8',
      ambientGlow: 'rgba(56, 189, 248, 0.16)',
    },
  },
  {
    id: 'emerald-lake',
    title: 'Смарагдове Озеро',
    subtitle: 'Кришталеве дзеркало серед скель',
    location: 'Високогірне альпійське озеро',
    imageSrc: emeraldLakeImg,
    category: 'water',
    credit: 'Колекція Brave Alpine · Європа',
    recommendedEffect: 'sunbeams',
    palette: {
      accent: '#5EEAD4',
      ambientGlow: 'rgba(94, 234, 212, 0.15)',
    },
  },
  {
    id: 'autumn-woodland',
    title: 'Золотий Осінній Праліс',
    subtitle: 'Теплі промені крізь багряні крони',
    location: 'Букові праліси Карпат',
    imageSrc: autumnWoodlandImg,
    category: 'forest',
    credit: 'Колекція Brave Forest · Спадщина ЮНЕСКО',
    recommendedEffect: 'leaves',
    palette: {
      accent: '#F59E0B',
      ambientGlow: 'rgba(245, 158, 11, 0.16)',
    },
  },
  {
    id: 'desert-dunes',
    title: 'Оксамитові Дюни Сутінків',
    subtitle: 'Золотий пісок під першими вечірніми зорями',
    location: 'Пустеля Наміб',
    imageSrc: desertDunesImg,
    category: 'mountains',
    credit: 'Колекція Brave Horizons · Намібія',
    recommendedEffect: 'fireflies',
    palette: {
      accent: '#FB923C',
      ambientGlow: 'rgba(251, 146, 60, 0.16)',
    },
  },
  {
    id: 'ocean-coastline',
    title: 'Прибережний Захід Океану',
    subtitle: 'Шепіт хвиль та оксамитові сутінки',
    location: 'Атлантичне узбережжя',
    imageSrc: oceanCoastlineImg,
    category: 'water',
    credit: 'Колекція Brave Ocean · Португалія',
    recommendedEffect: 'sunbeams',
    palette: {
      accent: '#FB7185',
      ambientGlow: 'rgba(251, 113, 133, 0.15)',
    },
  },
];
