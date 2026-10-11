export const LOCALES = ['vi', 'en', 'zh', 'ko', 'ja'] as const;
export const DEFAULT_LOCALE = 'vi';

export const NAV_ITEMS = [
  { path: '/', i18nKey: 'nav.home' },
  { path: '/tours', i18nKey: 'nav.tours' },
  { path: '/hotels', i18nKey: 'nav.hotels' },
  { path: '/flights', i18nKey: 'nav.flights' },
  { path: '/visa', i18nKey: 'nav.visa' },
  { path: '/specialties', i18nKey: 'nav.specialties' },
  { path: '/news', i18nKey: 'nav.news' },
  { path: '/contact', i18nKey: 'nav.contact' },
];

export const DEFAULT_PAGE_BANNERS = {
  toursBanner: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600',
  toursVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4',
  hotelsBanner: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600',
  hotelsVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/glide-over-coastal-beach.mp4',
  flightsBanner: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600',
  flightsVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/airplane.mp4',
  visaBanner: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600',
  visaVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4',
  newsBanner: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600',
  newsVideo: 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/forest_bike.mp4',
  specialtiesBanner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600',
  specialtiesVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/walking.mp4',
  contactBanner: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600',
  contactVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4',
  lookupBanner: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600',
  lookupVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/airplane.mp4',
};
