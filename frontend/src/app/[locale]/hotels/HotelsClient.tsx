'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Star, MapPin, Search, Building2, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { formatPrice, getI18nText, removeVietnameseTones } from '@/lib/utils';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { useLocale, useTranslations } from 'next-intl';
import { useHotelLocations } from '@/hooks/useHotelLocations';

const fetchHotels = async (params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  const res: any = await api.get(`/hotels?${query}`);
  return Array.isArray(res) ? res : (res?.data || []);
};

const PRICE_RANGE_CONFIGS = [
  { key: 'all', labelKey: 'priceAll', min: '', max: '' },
  { key: 'under1m', labelKey: 'priceUnder1m', min: '', max: '1000000' },
  { key: '1to2m', labelKey: 'price1to2m', min: '1000000', max: '2000000' },
  { key: '2to4m', labelKey: 'price2to4m', min: '2000000', max: '4000000' },
  { key: 'above4m', labelKey: 'priceAbove4m', min: '4000000', max: '' },
];

const FALLBACK_HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

interface Props {
  initialHotels: any[];
  initialLocations: string[];
  hotelsBanner: string;
  hotelsVideo?: string;
}

const HotelListingCard = memo(function HotelListingCard({
  hotel,
  locale,
  starsText,
  fromText,
  perNightText,
  viewAndBookText,
}: {
  hotel: any;
  locale: string;
  starsText: string;
  fromText: string;
  perNightText: string;
  viewAndBookText: string;
}) {
  const name = getI18nText(hotel.name, locale);
  const description = getI18nText(hotel.description, locale);
  const image = hotel.images?.[0] || FALLBACK_HOTEL_IMG;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="h-60 bg-slate-100 relative overflow-hidden">
        <SmartImage
          src={image}
          alt={name}
          fill
          fallbackSrc={FALLBACK_HOTEL_IMG}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{hotel.stars} {starsText}</span>
        </div>
        <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{hotel.location}</span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{name}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{hotel.address}</span>
          </p>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-3">{description}</p>
          {hotel.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {hotel.amenities.slice(0, 4).map((item: string, i: number) => (
                <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{item}</span>
              ))}
              {hotel.amenities.length > 4 && (
                <span className="text-[11px] font-medium bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">+{hotel.amenities.length - 4}</span>
              )}
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{fromText}</p>
            <p className="text-xl font-bold text-orange-500">
              {formatPrice(hotel.pricePerNight)}
              <span className="text-xs text-slate-500 font-normal"> {perNightText}</span>
            </p>
          </div>
          <Link href={`/${locale}/hotels/${hotel.slug}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors">
            {viewAndBookText}
          </Link>
        </div>
      </div>
    </div>
  );
});

function HotelsClientComponent({
  initialHotels,
  initialLocations,
  hotelsBanner,
  hotelsVideo = 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/glide-over-coastal-beach.mp4',
}: Props) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations('filters');
  const tCommon = useTranslations('common');

  const { data: locations = initialLocations } = useHotelLocations(initialLocations);

  const initialLocation = searchParams.get('location') || searchParams.get('destination') || searchParams.get('search') || searchParams.get('q') || '';
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<number>(0);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(Boolean(initialLocation));

  useEffect(() => {
    const loc = searchParams.get('location') || searchParams.get('destination') || searchParams.get('search') || searchParams.get('q');
    if (loc !== null && loc !== undefined) {
      setLocationFilter(loc);
      if (loc) setShowFilters(true);
    }
  }, [searchParams]);

  const selectedRange = PRICE_RANGE_CONFIGS[priceRangeIndex] || PRICE_RANGE_CONFIGS[0];

  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (locationFilter) params.location = locationFilter;
    if (starFilter > 0) params.stars = String(starFilter);
    if (selectedRange.min) params.priceMin = selectedRange.min;
    if (selectedRange.max) params.priceMax = selectedRange.max;
    return params;
  }, [locationFilter, starFilter, selectedRange]);

  const hasFilter = locationFilter !== '' || starFilter > 0 || selectedRange.min !== '' || selectedRange.max !== '';

  const { data: hotels = initialHotels, isLoading } = useQuery({
    queryKey: ['hotels', apiParams],
    queryFn: () => fetchHotels(apiParams),
    placeholderData: hasFilter ? keepPreviousData : (initialHotels as any),
    enabled: hasFilter,
  });

  const displayHotels = hasFilter ? hotels : (hotels.length ? hotels : initialHotels);

  const filteredHotels = useMemo(() => {
    return displayHotels.filter((h: any) => {
      if (!search.trim()) return true;
      const qClean = removeVietnameseTones(search);
      const name = removeVietnameseTones(getI18nText(h.name, locale));
      const loc = removeVietnameseTones(h.location || '');
      const addr = removeVietnameseTones(h.address || '');
      return name.includes(qClean) || loc.includes(qClean) || addr.includes(qClean);
    });
  }, [displayHotels, search, locale]);

  const activeFilterCount = useMemo(() => {
    return [starFilter > 0, locationFilter !== '', selectedRange.min !== '' || selectedRange.max !== ''].filter(Boolean).length;
  }, [starFilter, locationFilter, selectedRange]);

  const clearFilters = useCallback(() => {
    setStarFilter(0);
    setLocationFilter('');
    setPriceRangeIndex(0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Banner */}
      <VideoBackground
        videoSrc={hotelsVideo}
        videoSources={[
          { src: hotelsVideo, type: 'video/mp4' },
          { src: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/hotel.mp4', type: 'video/mp4' }
        ]}
        posterSrc={hotelsBanner}
        fallbackPosterSrc={FALLBACK_HOTEL_IMG}
        overlayGradient="bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/25"
        className="h-72 md:h-96 rounded-3xl mb-10 shadow-2xl flex items-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="p-8 max-w-2xl text-white"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-3 text-amber-300">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>5★ Resort & Hotel</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">
            {t('destToursTitle', { dest: locationFilter || 'Vietnam' }).replace('Tour Packages in', 'Hotels & Resorts in').replace('Các Gói Du Lịch Tại', 'Khách Sạn & Resort Tại')}
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            {t('allToursSubtitle')}
          </p>
        </motion.div>
      </VideoBackground>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative min-w-[160px]">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">{t('allDests')}</option>
              {locations.map((loc: string) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              activeFilterCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('filter')} {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{t('starRating')}</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 5, 4, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStarFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
                      starFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {s === 0 ? t('allStars') : <><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{s} {tCommon('stars')}</>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{t('priceRange')}</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGE_CONFIGS.map((range, idx) => (
                  <button
                    key={range.key}
                    onClick={() => setPriceRangeIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      priceRangeIndex === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {t(range.labelKey as any)}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="md:col-span-2 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" /> {t('clearFilters')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isLoading && (
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-bold text-slate-900">{filteredHotels.length}</span> {tCommon('hotelType')}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : filteredHotels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-12 rounded-3xl border border-slate-100 text-center"
        >
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">{t('noResults')}</p>
          <button onClick={clearFilters} className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer">
            {t('clearFilters')}
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredHotels.map((hotel: any, idx: number) => (
            <motion.div
              key={hotel._id || hotel.slug}
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
              <HotelListingCard
                hotel={hotel}
                locale={locale}
                starsText={tCommon('stars')}
                fromText={tCommon('from')}
                perNightText={tCommon('perNight')}
                viewAndBookText={tCommon('viewAndBook')}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default memo(HotelsClientComponent);
