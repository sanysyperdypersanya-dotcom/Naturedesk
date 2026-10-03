import { NatureWallpaper } from '../types';

// Імпортуємо файли зображень
import carpathianMistImg from '../assets/images/nature_carpathian_mist_1791017301227.jpg';
import emeraldLakeImg from '../assets/images/nature_emerald_lake_1791017364059.jpg';
import autumnWoodlandImg from '../assets/images/nature_autumn_woodland_1791017375226.jpg';
import oceanCoastlineImg from '../assets/images/nature_ocean_coastline_1791017386994.jpg';

export const WALLPAPERS: NatureWallpaper[] = [
  {
    id: 'carpathian-mist',
    title: 'Туманні Карпати',
    subtitle: 'Ранкова тиша гірського хребта',
    location: 'Карпати, Україна',
    imageSrc: carpathianMistImg,
    palette: {
      accent: '#E0A96D',
      ambientGlow: 'rgba(224, 169, 109, 0.15)',
    },
  },
  {
    id: 'emerald-lake',
    title: 'Смарагдове Озеро',
    subtitle: 'Кришталеве дзеркало серед скель',
    location: 'Високогірне озеро',
    imageSrc: emeraldLakeImg,
    palette: {
      accent: '#5EEAD4',
      ambientGlow: 'rgba(94, 234, 212, 0.15)',
    },
  },
  {
    id: 'autumn-woodland',
    title: 'Золотий Осінній Ліс',
    subtitle: 'Теплі промені крізь багряні крони',
    location: 'Букові праліси',
    imageSrc: autumnWoodlandImg,
    palette: {
      accent: '#F59E0B',
      ambientGlow: 'rgba(245, 158, 11, 0.15)',
    },
  },
  {
    id: 'ocean-coastline',
    title: 'Прибережний Захід',
    subtitle: 'Шепіт хвиль та оксамитові сутінки',
    location: 'Океанічне узбережжя',
    imageSrc: oceanCoastlineImg,
    palette: {
      accent: '#FB7185',
      ambientGlow: 'rgba(251, 113, 133, 0.15)',
    },
  },
];
