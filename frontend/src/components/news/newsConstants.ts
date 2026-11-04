export const CATEGORY_ITEMS = [
  { key: '', label: 'Tất cả bài viết', labelEn: 'All Articles', labelZh: '全部文章', labelKo: '전체 글', labelJa: 'すべての記事' },
  { key: 'experience', label: 'Kinh nghiệm', labelEn: 'Experience', labelZh: '旅行经验', labelKo: '여행 팁', labelJa: '旅行体験' },
  { key: 'destination', label: 'Điểm đến', labelEn: 'Destinations', labelZh: '热门目的地', labelKo: '추천 여행지', labelJa: '観光スポット' },
  { key: 'food', label: 'Ẩm thực', labelEn: 'Cuisine', labelZh: '美食天地', labelKo: '미식 탐방', labelJa: 'グルメ' },
  { key: 'international', label: 'Quốc tế', labelEn: 'International', labelZh: '国际旅游', labelKo: '해외 여행', labelJa: '海外旅行' },
];

export const HOT_DESTINATIONS = [
  {
    key: '',
    label: 'Tất cả điểm đến',
    labelEn: 'All Destinations',
    labelZh: '全部目的地',
    labelKo: '전체 여행지',
    labelJa: 'すべての目的地',
    image: '',
    keywords: [] as string[],
  },
  {
    key: 'da-lat',
    label: 'Đà Lạt',
    labelEn: 'Da Lat',
    labelZh: '大叻',
    labelKo: '달랏',
    labelJa: 'ダラット',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200',
    keywords: ['đà lạt', 'da lat', 'dalat'],
  },
  {
    key: 'phu-quoc',
    label: 'Phú Quốc',
    labelEn: 'Phu Quoc',
    labelZh: '富国岛',
    labelKo: '푸꾸옥',
    labelJa: 'フーコック',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200',
    keywords: ['phú quốc', 'phu quoc', 'phuquoc'],
  },
  {
    key: 'da-nang',
    label: 'Đà Nẵng',
    labelEn: 'Da Nang',
    labelZh: '岘港',
    labelKo: '다낭',
    labelJa: 'ダナン',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200',
    keywords: ['đà nẵng', 'da nang', 'danang', 'bà nà', 'sơn trà'],
  },
  {
    key: 'ha-noi',
    label: 'Hà Nội',
    labelEn: 'Hanoi',
    labelZh: '河内',
    labelKo: '하노이',
    labelJa: 'ハノイ',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200',
    keywords: ['hà nội', 'ha noi', 'hanoi'],
  },
  {
    key: 'sapa',
    label: 'Sa Pa',
    labelEn: 'Sapa',
    labelZh: '沙坝',
    labelKo: '사파',
    labelJa: 'サパ',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200',
    keywords: ['sa pa', 'sapa', 'fansipan'],
  },
  {
    key: 'ha-long',
    label: 'Hạ Long',
    labelEn: 'Halong Bay',
    labelZh: '下龙湾',
    labelKo: '하롱베이',
    labelJa: 'ハロン湾',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200',
    keywords: ['hạ long', 'ha long', 'halong'],
  },
];

export const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200';

// Fixed reading time calculation: uses \s+ to accurately count words instead of splitting on literal 's'
export const calculateReadingTime = (text: string): number => {
  if (!text) return 3;
  const plain = text.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
};
