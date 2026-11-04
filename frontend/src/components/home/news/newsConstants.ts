export const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  experience: {
    vi: 'Kinh nghiệm',
    en: 'Experience',
    zh: '旅行经验',
    ko: '여행 팁',
    ja: '旅行体験',
  },
  food: {
    vi: 'Ẩm thực',
    en: 'Cuisine',
    zh: '美食天地',
    ko: '미식 탐방',
    ja: 'グルメ',
  },
  destination: {
    vi: 'Điểm đến',
    en: 'Destinations',
    zh: '热门目的地',
    ko: '추천 여행지',
    ja: '観光スポット',
  },
  international: {
    vi: 'Quốc tế',
    en: 'International',
    zh: '国际旅游',
    ko: '해외 여행',
    ja: '海外旅行',
  },
};

export const CATEGORY_TABS = [
  { key: 'all', labelKey: 'allCategories' },
  { key: 'experience', labelKey: 'experience' },
  { key: 'destination', labelKey: 'destination' },
  { key: 'food', labelKey: 'food' },
  { key: 'international', labelKey: 'international' },
];

export const FALLBACK_NEWS_THUMB = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';

// Calculate estimated reading time based on text length with accurate whitespace regex
export const calculateReadingTime = (text: string): number => {
  if (!text) return 3;
  const plain = text.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
};
