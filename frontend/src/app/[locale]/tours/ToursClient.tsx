'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import TourCard from '@/components/tours/TourCard';
import { Filter, SlidersHorizontal, MapPin, Sparkles, X } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTourDestinations } from '@/hooks/useTourDestinations';
import { VideoBackground } from '@/components/ui/VideoBackground';

const fetchFilteredTours = async ({ destination, category, priceRange, sort, isFeatured }: any) => {
  let queryStr = '/tours?limit=100&';
  if (destination) queryStr += `destination=${encodeURIComponent(destination)}&`;
  if (category) queryStr += `category=${encodeURIComponent(category)}&`;
  if (sort) queryStr += `sort=${encodeURIComponent(sort)}&`;
  if (isFeatured) queryStr += `isFeatured=true&`;
  if (priceRange === 'under2m') queryStr += 'maxPrice=2000000&';
  else if (priceRange === '2m-5m') queryStr += 'minPrice=2000000&maxPrice=5000000&';
  else if (priceRange === 'above5m') queryStr += 'minPrice=5000000&';
  const res: any = await api.get(queryStr);
  return res?.data || [];
};

interface Props {
  initialTours: any[];
  toursBanner: string;
  toursVideo?: string;
}

export default function ToursClient({ initialTours, toursBanner, toursVideo = 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4' }: Props) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations('filters');

  const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600';

  const { data: tourDestinations = [] } = useTourDestinations();

  const initialDest = searchParams.get('destination') || '';
  const initialCat = searchParams.get('category') || '';
  const isFeaturedParam = searchParams.get('isFeatured') === 'true';

  const [destination, setDestination] = useState(initialDest);
  const [category, setCategory] = useState(initialCat);
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    setDestination(searchParams.get('destination') || '');
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const hasFilter = Boolean(destination || category || priceRange || sort || isFeaturedParam);

  const { data: tours = initialTours, isLoading } = useQuery({
    queryKey: ['tours', { destination, category, priceRange, sort, isFeatured: isFeaturedParam }],
    queryFn: () => fetchFilteredTours({ destination, category, priceRange, sort, isFeatured: isFeaturedParam }),
    placeholderData: hasFilter ? keepPreviousData : (initialTours as any),
    enabled: hasFilter,
  });

  const displayTours = hasFilter ? tours : (tours.length ? tours : initialTours);

  const bannerTitle = useMemo(() => {
    if (destination) return t('destToursTitle', { dest: destination });
    if (isFeaturedParam) return t('featuredToursTitle');
    return t('allToursTitle');
  }, [destination, isFeaturedParam, t]);

  const bannerSubtitle = useMemo(() => {
    if (destination) return t('destToursSubtitle', { dest: destination });
    if (isFeaturedParam) return t('featuredToursSubtitle');
    return t('allToursSubtitle');
  }, [destination, isFeaturedParam, t]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Banner */}
      <VideoBackground
        videoSrc={toursVideo}
        videoSources={[
          { src: toursVideo, type: 'video/mp4' },
          { src: 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/rafting.mp4', type: 'video/mp4' }
        ]}
        posterSrc={toursBanner || DEFAULT_BANNER}
        fallbackPosterSrc={DEFAULT_BANNER}
        overlayGradient="bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/25"
        className="h-72 md:h-96 rounded-3xl mb-8 shadow-2xl flex items-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="p-8 max-w-2xl text-white"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-3 text-amber-300">
            {destination ? <MapPin className="w-3.5 h-3.5 text-amber-300" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>{destination ? t('destinationBadge', { dest: destination }) : t('hotTripBadge')}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">{bannerTitle}</h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">{bannerSubtitle}</p>
        </motion.div>
      </VideoBackground>

      {/* Active Filter Badges */}
      <AnimatePresence>
        {(destination || category || priceRange) && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-wrap items-center gap-2 mb-6 bg-blue-50/80 p-3 rounded-2xl border border-blue-100 overflow-hidden"
          >
            <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> {t('filter', { fallback: 'Đang lọc theo:' })}
            </span>
            <AnimatePresence mode="popLayout">
              {destination && (
                <motion.span
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs"
                >
                  {destination}
                  <button onClick={() => setDestination('')}><X className="w-3.5 h-3.5" /></button>
                </motion.span>
              )}
              {category && (
                <motion.span
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs"
                >
                  {category}
                  <button onClick={() => setCategory('')}><X className="w-3.5 h-3.5" /></button>
                </motion.span>
              )}
              {priceRange && (
                <motion.span
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs"
                >
                  {priceRange}
                  <button onClick={() => setPriceRange('')}><X className="w-3.5 h-3.5" /></button>
                </motion.span>
              )}
            </AnimatePresence>
            <button onClick={() => { setDestination(''); setCategory(''); setPriceRange(''); }} className="text-xs font-extrabold text-red-600 hover:underline ml-auto cursor-pointer">
              {t('clearFilters', { fallback: 'Xóa tất cả bộ lọc' })}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>{t('filter', { fallback: 'Bộ Lọc' })}</span>
              </div>
              {(destination || category || priceRange) && (
                <button onClick={() => { setDestination(''); setCategory(''); setPriceRange(''); }} className="text-xs text-red-500 hover:underline font-medium">
                  {t('clearFilters', { fallback: 'Xóa lọc' })}
                </button>
              )}
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-2">{t('destinations', { fallback: 'Điểm đến' })}</label>
                <select value={destination} onChange={(e) => setDestination(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium">
                  <option value="">{t('allDests', { fallback: 'Tất cả điểm đến' })}</option>
                  {tourDestinations.map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">{t('categories')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium">
                  <option value="">{t('allCategories')}</option>
                  <option value="city-tour">{t('catCityTour', { fallback: 'City Tour' })}</option>
                  <option value="beach">{t('catBeach', { fallback: 'Du lịch Biển' })}</option>
                  <option value="nature">{t('catNature', { fallback: 'Khám phá thiên nhiên' })}</option>
                  <option value="culture">{t('catCulture', { fallback: 'Văn hóa & Lịch sử' })}</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">{t('priceRange')}</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium">
                  <option value="">{t('priceAll')}</option>
                  <option value="under2m">{t('priceUnder1m')}</option>
                  <option value="2m-5m">{t('price1to2m')}</option>
                  <option value="above5m">{t('priceAbove4m')}</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Tour List */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-sm font-medium text-slate-600">
              <span className="font-bold text-blue-600">{displayTours.length}</span> {t('toursFound')}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">{t('sortBy')}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="">{t('sortNewest')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : displayTours.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-12 rounded-3xl border border-slate-100 text-center"
            >
              <p className="text-xl font-bold text-slate-800 mb-2">{t('noResults', { fallback: 'Chưa có tour nào tại địa điểm này' })}</p>
              <button onClick={() => { setDestination(''); setCategory(''); setPriceRange(''); setSort(''); }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md mt-4 cursor-pointer">
                {t('clearFilters', { fallback: 'Xem tất cả các tour' })}
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayTours.map((tour: any, idx: number) => (
                <motion.div
                  key={tour._id || tour.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min((idx % 3) * 0.08, 0.24),
                    ease: 'easeOut'
                  }}
                >
                  <TourCard tour={tour} locale={locale} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
