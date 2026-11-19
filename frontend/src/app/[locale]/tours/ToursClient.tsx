'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import TourCard from '@/components/tours/TourCard';
import { Filter, SlidersHorizontal, MapPin, Sparkles, X, Search, RotateCcw, ChevronLeft, ChevronRight, Zap, Users, Calendar } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTourDestinations } from '@/hooks/useTourDestinations';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { getI18nText, removeVietnameseTones } from '@/lib/utils';

const PAGE_SIZE = 9;
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600';

const PRICE_RANGE_OPTIONS = [
  { key: 'under1m', labelKey: 'priceUnder1m', min: '', max: '1000000' },
  { key: '1to2m', labelKey: 'price1to2m', min: '1000000', max: '2000000' },
  { key: '2to4m', labelKey: 'price2to4m', min: '2000000', max: '4000000' },
  { key: 'above4m', labelKey: 'priceAbove4m', min: '4000000', max: '' },
] as const;

const LEGACY_PRICE_ALIASES: Record<string, string> = {
  under2m: '1to2m',
  '2m-5m': '2to4m',
  above5m: 'above4m',
};

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  'city-tour': 'catCityTour',
  beach: 'catBeach',
  nature: 'catNature',
  culture: 'catCulture',
};

const PAGINATION_LABELS: Record<string, { prev: string; next: string; pageOf: string; flashSale: string; guestsMin: string }> = {
  vi: { prev: 'Trang trước', next: 'Trang sau', pageOf: 'Trang {current} / {total}', flashSale: 'Flash Sale', guestsMin: 'Tối thiểu {count} khách' },
  en: { prev: 'Previous', next: 'Next', pageOf: 'Page {current} / {total}', flashSale: 'Flash Sale', guestsMin: 'Min {count} guests' },
  zh: { prev: '上一页', next: '下一页', pageOf: '第 {current} / {total} 页', flashSale: '限时特惠', guestsMin: '至少 {count} 位客人' },
  ko: { prev: '이전', next: '다음', pageOf: '{current} / {total} 페이지', flashSale: '플래시 세일', guestsMin: '최소 {count}명' },
  ja: { prev: '前へ', next: '次へ', pageOf: '{current} / {total} ページ', flashSale: 'フラッシュセール', guestsMin: '最低 {count} 名' },
};

const normalizePriceRange = (raw: string | null): string => {
  if (!raw) return '';
  if (PRICE_RANGE_OPTIONS.some((o) => o.key === raw)) return raw;
  return LEGACY_PRICE_ALIASES[raw] || '';
};

const parsePriceFromParams = (params: URLSearchParams): string => {
  const direct = normalizePriceRange(params.get('priceRange') || params.get('price'));
  if (direct) return direct;
  const minP = params.get('minPrice');
  const maxP = params.get('maxPrice');
  if (!minP && maxP === '1000000') return 'under1m';
  if (minP === '1000000' && maxP === '2000000') return '1to2m';
  if (minP === '2000000' && maxP === '4000000') return '2to4m';
  if (minP === '4000000' && !maxP) return 'above4m';
  return '';
};

const fetchFilteredTours = async ({
  destination,
  category,
  priceRange,
  sort,
  isFeatured,
}: {
  destination: string;
  category: string;
  priceRange: string;
  sort: string;
  isFeatured: boolean;
}) => {
  const qs = new URLSearchParams({ limit: '100' });
  if (destination) qs.set('destination', destination);
  if (category) qs.set('category', category);
  if (sort) qs.set('sort', sort);
  if (isFeatured) qs.set('isFeatured', 'true');

  const priceCfg = PRICE_RANGE_OPTIONS.find((p) => p.key === priceRange);
  if (priceCfg?.min) qs.set('minPrice', priceCfg.min);
  if (priceCfg?.max) qs.set('maxPrice', priceCfg.max);

  const res: any = await api.get(`/tours?${qs.toString()}`);
  return Array.isArray(res) ? res : (res?.data || []);
};

interface Props {
  initialTours: any[];
  toursBanner: string;
  toursVideo?: string;
}

export default function ToursClient({
  initialTours,
  toursBanner,
  toursVideo = 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4',
}: Props) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('filters');
  const tCommon = useTranslations('common');
  const uiText = PAGINATION_LABELS[locale] || PAGINATION_LABELS.vi;

  const { data: tourDestinations = [] } = useTourDestinations();

  const resolveDestinationMatch = useCallback(
    (rawDest: string) => {
      if (!rawDest) return '';
      const clean = removeVietnameseTones(rawDest);
      const found = (tourDestinations as string[]).find(
        (d) => removeVietnameseTones(d) === clean
      );
      return found || rawDest;
    },
    [tourDestinations]
  );

  const [destination, setDestination] = useState(() =>
    resolveDestinationMatch(searchParams.get('destination') || '')
  );
  const [searchText, setSearchText] = useState(
    () => searchParams.get('search') || searchParams.get('q') || ''
  );
  const [category, setCategory] = useState(() => searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(() => parsePriceFromParams(searchParams));
  const [sort, setSort] = useState(() => searchParams.get('sort') || '');
  const [isFeatured, setIsFeatured] = useState(() => searchParams.get('isFeatured') === 'true');
  const [flashSaleOnly, setFlashSaleOnly] = useState(() => searchParams.get('flashSale') === 'true');
  const [guests, setGuests] = useState(() => {
    const g = Number(searchParams.get('guests'));
    return Number.isFinite(g) && g > 0 ? Math.min(Math.floor(g), 50) : 0;
  });
  const [travelDate, setTravelDate] = useState(
    () => searchParams.get('date') || searchParams.get('checkin') || searchParams.get('checkIn') || ''
  );
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1;
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL query params into state on external navigation / back-forward
  useEffect(() => {
    const nextDest = resolveDestinationMatch(searchParams.get('destination') || '');
    const nextSearch = searchParams.get('search') || searchParams.get('q') || '';
    const nextCat = searchParams.get('category') || '';
    const nextPrice = parsePriceFromParams(searchParams);
    const nextSort = searchParams.get('sort') || '';
    const nextFeatured = searchParams.get('isFeatured') === 'true';
    const nextFlash = searchParams.get('flashSale') === 'true';
    const gRaw = Number(searchParams.get('guests'));
    const nextGuests = Number.isFinite(gRaw) && gRaw > 0 ? Math.min(Math.floor(gRaw), 50) : 0;
    const nextDate = searchParams.get('date') || searchParams.get('checkin') || searchParams.get('checkIn') || '';
    const pRaw = Number(searchParams.get('page'));
    const nextPage = Number.isFinite(pRaw) && pRaw >= 1 ? Math.floor(pRaw) : 1;

    setDestination(nextDest);
    setSearchText(nextSearch);
    setCategory(nextCat);
    setPriceRange(nextPrice);
    setSort(nextSort);
    setIsFeatured(nextFeatured);
    setFlashSaleOnly(nextFlash);
    setGuests(nextGuests);
    setTravelDate(nextDate);
    setPage(nextPage);
  }, [searchParams, resolveDestinationMatch]);

  const syncUrl = useCallback(
    (overrides: Partial<{
      destination: string;
      searchText: string;
      category: string;
      priceRange: string;
      sort: string;
      isFeatured: boolean;
      flashSaleOnly: boolean;
      guests: number;
      travelDate: string;
      page: number;
    }>) => {
      const next = {
        destination,
        searchText,
        category,
        priceRange,
        sort,
        isFeatured,
        flashSaleOnly,
        guests,
        travelDate,
        page,
        ...overrides,
      };
      const params = new URLSearchParams();
      if (next.destination) params.set('destination', next.destination);
      if (next.searchText.trim()) params.set('q', next.searchText.trim());
      if (next.category) params.set('category', next.category);
      if (next.priceRange) params.set('priceRange', next.priceRange);
      if (next.sort) params.set('sort', next.sort);
      if (next.isFeatured) params.set('isFeatured', 'true');
      if (next.flashSaleOnly) params.set('flashSale', 'true');
      if (next.guests > 0) params.set('guests', String(next.guests));
      if (next.travelDate) params.set('date', next.travelDate);
      if (next.page > 1) params.set('page', String(next.page));

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [destination, searchText, category, priceRange, sort, isFeatured, flashSaleOnly, guests, travelDate, page, pathname, router]
  );

  const hasApiFilter = Boolean(destination || category || priceRange || sort || isFeatured);

  const {
    data: tours = initialTours,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tours', { destination, category, priceRange, sort, isFeatured }],
    queryFn: () => fetchFilteredTours({ destination, category, priceRange, sort, isFeatured }),
    initialData: !hasApiFilter && initialTours.length > 0 ? initialTours : undefined,
    placeholderData: hasApiFilter ? keepPreviousData : undefined,
    staleTime: 60000,
  });

  // Client-side filtering for keyword search, flashSale, and guest capacity
  const filteredTours = useMemo(() => {
    const list = Array.isArray(tours) ? tours : [];
    const now = Date.now();
    const cleanQuery = removeVietnameseTones(searchText);

    const matched = list.filter((tour: any) => {
      if (flashSaleOnly) {
        const endMs = tour.flashSaleEnd ? new Date(tour.flashSaleEnd).getTime() : null;
        const activeFlash = Boolean(tour.isFlashSale && (!endMs || (!Number.isNaN(endMs) && endMs > now)));
        if (!activeFlash) return false;
      }

      if (guests > 0 && typeof tour.maxGuests === 'number' && tour.maxGuests < guests) {
        return false;
      }

      if (cleanQuery) {
        const title = removeVietnameseTones(getI18nText(tour.title, locale));
        const dest = removeVietnameseTones(tour.destination || tour.location || '');
        const desc = removeVietnameseTones(getI18nText(tour.description, locale));
        if (!title.includes(cleanQuery) && !dest.includes(cleanQuery) && !desc.includes(cleanQuery)) {
          return false;
        }
      }

      return true;
    });

    // Ensure sorting stays consistent even with flash sale prices or initialData
    if (sort === 'price_asc' || sort === 'price_desc') {
      const getEffective = (item: any) => {
        const base = Number(item.price || 0);
        const endMs = item.flashSaleEnd ? new Date(item.flashSaleEnd).getTime() : null;
        const activeFlash = Boolean(item.isFlashSale && item.flashSalePrice && (!endMs || (!Number.isNaN(endMs) && endMs > now)));
        return activeFlash ? Math.min(base, Number(item.flashSalePrice)) : base;
      };
      return [...matched].sort((a, b) =>
        sort === 'price_asc' ? getEffective(a) - getEffective(b) : getEffective(b) - getEffective(a)
      );
    }

    return matched;
  }, [tours, flashSaleOnly, guests, searchText, sort, locale]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  const paginatedTours = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return filteredTours.slice(start, start + PAGE_SIZE);
  }, [filteredTours, clampedPage]);

  const activeFilterCount = useMemo(() => {
    return [
      Boolean(destination),
      Boolean(searchText.trim()),
      Boolean(category),
      Boolean(priceRange),
      isFeatured,
      flashSaleOnly,
      guests > 0,
      Boolean(travelDate),
    ].filter(Boolean).length;
  }, [destination, searchText, category, priceRange, isFeatured, flashSaleOnly, guests, travelDate]);

  const clearAllFilters = useCallback(() => {
    setDestination('');
    setSearchText('');
    setCategory('');
    setPriceRange('');
    setSort('');
    setIsFeatured(false);
    setFlashSaleOnly(false);
    setGuests(0);
    setTravelDate('');
    setPage(1);
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const safePage = Math.min(Math.max(1, nextPage), totalPages);
      setPage(safePage);
      syncUrl({ page: safePage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages, syncUrl]
  );

  const forwardQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (travelDate) params.set('date', travelDate);
    if (guests > 0) params.set('guests', String(guests));
    return params.toString();
  }, [travelDate, guests]);

  const destinationOptions = useMemo(() => {
    const list = Array.isArray(tourDestinations) ? [...(tourDestinations as string[])] : [];
    if (destination && !list.includes(destination)) {
      list.unshift(destination);
    }
    return list;
  }, [tourDestinations, destination]);

  const categoryBadgeLabel = category
    ? (CATEGORY_LABEL_KEYS[category] ? t(CATEGORY_LABEL_KEYS[category] as any) : category)
    : '';
  const priceBadgeLabel = priceRange
    ? (() => {
        const cfg = PRICE_RANGE_OPTIONS.find((o) => o.key === priceRange);
        return cfg ? t(cfg.labelKey as any) : priceRange;
      })()
    : '';

  const bannerTitle = useMemo(() => {
    if (destination) return t('destToursTitle', { dest: destination });
    if (isFeatured) return t('featuredToursTitle');
    return t('allToursTitle');
  }, [destination, isFeatured, t]);

  const bannerSubtitle = useMemo(() => {
    if (destination) return t('destToursSubtitle', { dest: destination });
    if (isFeatured) return t('featuredToursSubtitle');
    return t('allToursSubtitle');
  }, [destination, isFeatured, t]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Banner */}
      <VideoBackground
        videoSrc={toursVideo}
        videoSources={[
          { src: toursVideo, type: 'video/mp4' },
          { src: 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/rafting.mp4', type: 'video/mp4' },
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
          className="p-6 sm:p-8 max-w-2xl text-white"
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
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-2 mb-6 bg-blue-50/80 p-3 rounded-2xl border border-blue-100 overflow-hidden"
          >
            <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> {t('filter')}:
            </span>

            {destination && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <MapPin className="w-3 h-3" /> {destination}
                <button
                  type="button"
                  onClick={() => {
                    setDestination('');
                    setPage(1);
                    syncUrl({ destination: '', page: 1 });
                  }}
                  aria-label={`${t('clearFilters')} ${destination}`}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {searchText.trim() && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Search className="w-3 h-3" /> &quot;{searchText.trim()}&quot;
                <button
                  type="button"
                  onClick={() => {
                    setSearchText('');
                    setPage(1);
                    syncUrl({ searchText: '', page: 1 });
                  }}
                  aria-label={t('clearFilters')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                {categoryBadgeLabel}
                <button
                  type="button"
                  onClick={() => {
                    setCategory('');
                    setPage(1);
                    syncUrl({ category: '', page: 1 });
                  }}
                  aria-label={`${t('clearFilters')} ${categoryBadgeLabel}`}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {priceRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                {priceBadgeLabel}
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange('');
                    setPage(1);
                    syncUrl({ priceRange: '', page: 1 });
                  }}
                  aria-label={`${t('clearFilters')} ${priceBadgeLabel}`}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {isFeatured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" /> {t('featuredToursTitle')}
                <button
                  type="button"
                  onClick={() => {
                    setIsFeatured(false);
                    setPage(1);
                    syncUrl({ isFeatured: false, page: 1 });
                  }}
                  aria-label={t('clearFilters')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {flashSaleOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
                <Zap className="w-3 h-3 fill-rose-500 text-rose-500" /> {uiText.flashSale}
                <button
                  type="button"
                  onClick={() => {
                    setFlashSaleOnly(false);
                    setPage(1);
                    syncUrl({ flashSaleOnly: false, page: 1 });
                  }}
                  aria-label={t('clearFilters')}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {guests > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Users className="w-3 h-3" /> {uiText.guestsMin.replace('{count}', String(guests))}
                <button
                  type="button"
                  onClick={() => {
                    setGuests(0);
                    setPage(1);
                    syncUrl({ guests: 0, page: 1 });
                  }}
                  aria-label={t('clearFilters')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {travelDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Calendar className="w-3 h-3" /> {travelDate}
                <button
                  type="button"
                  onClick={() => {
                    setTravelDate('');
                    syncUrl({ travelDate: '' });
                  }}
                  aria-label={t('clearFilters')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-extrabold text-red-600 hover:underline ml-auto cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          aria-expanded={mobileFiltersOpen}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-sm font-bold text-slate-800 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            {t('filter')}
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filter */}
        <aside className={`w-full lg:w-72 shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>{t('filter')}</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>

            <div className="space-y-5 text-sm">
              {/* Keyword search */}
              <div>
                <label htmlFor="tour-search-input" className="font-semibold text-slate-700 block mb-2">
                  {t('searchPlaceholder')}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    id="tour-search-input"
                    type="text"
                    value={searchText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchText(val);
                      setPage(1);
                      syncUrl({ searchText: val, page: 1 });
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-900"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchText('');
                        setPage(1);
                        syncUrl({ searchText: '', page: 1 });
                      }}
                      aria-label={t('clearFilters')}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="tour-destination-select" className="font-semibold text-slate-700 block mb-2">
                  {t('destinations')}
                </label>
                <select
                  id="tour-destination-select"
                  value={destination}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDestination(val);
                    setPage(1);
                    syncUrl({ destination: val, page: 1 });
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-900 cursor-pointer"
                >
                  <option value="">{t('allDests')}</option>
                  {destinationOptions.map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tour-category-select" className="font-semibold text-slate-700 block mb-2">
                  {t('categories')}
                </label>
                <select
                  id="tour-category-select"
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    setPage(1);
                    syncUrl({ category: val, page: 1 });
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-900 cursor-pointer"
                >
                  <option value="">{t('allCategories')}</option>
                  <option value="city-tour">{t('catCityTour')}</option>
                  <option value="beach">{t('catBeach')}</option>
                  <option value="nature">{t('catNature')}</option>
                  <option value="culture">{t('catCulture')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="tour-price-select" className="font-semibold text-slate-700 block mb-2">
                  {t('priceRange')}
                </label>
                <select
                  id="tour-price-select"
                  value={priceRange}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPriceRange(val);
                    setPage(1);
                    syncUrl({ priceRange: val, page: 1 });
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-900 cursor-pointer"
                >
                  <option value="">{t('priceAll')}</option>
                  {PRICE_RANGE_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {t(opt.labelKey as any)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Flash Sale toggle */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !flashSaleOnly;
                    setFlashSaleOnly(nextVal);
                    setPage(1);
                    syncUrl({ flashSaleOnly: nextVal, page: 1 });
                  }}
                  aria-pressed={flashSaleOnly}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    flashSaleOnly
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className={`w-4 h-4 ${flashSaleOnly ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                    {uiText.flashSale}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${flashSaleOnly ? 'bg-rose-500' : 'bg-slate-300'}`} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Tour List */}
        <section aria-label="Tour list" className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-sm font-medium text-slate-600">
              <span className="font-bold text-blue-600">{filteredTours.length}</span> {t('toursFound')}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <label htmlFor="tour-sort-select" className="text-sm text-slate-500">{t('sortBy')}</label>
              <select
                id="tour-sort-select"
                value={sort}
                onChange={(e) => {
                  const val = e.target.value;
                  setSort(val);
                  setPage(1);
                  syncUrl({ sort: val, page: 1 });
                }}
                className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 cursor-pointer"
              >
                <option value="">{t('sortNewest')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : isError && filteredTours.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-rose-100 text-center space-y-4">
              <p className="text-lg font-bold text-slate-800">{tCommon('error')}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {tCommon('retry')}
              </button>
            </div>
          ) : filteredTours.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-12 rounded-3xl border border-slate-100 text-center"
            >
              <p className="text-xl font-bold text-slate-800 mb-2">{t('noResults')}</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md mt-4 cursor-pointer"
              >
                {t('clearFilters')}
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTours.map((tour: any, idx: number) => (
                  <motion.div
                    key={tour._id || tour.id || tour.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min((idx % 3) * 0.05, 0.15),
                      ease: 'easeOut',
                    }}
                  >
                    <TourCard tour={tour} locale={locale} queryString={forwardQueryString} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handlePageChange(clampedPage - 1)}
                    disabled={clampedPage <= 1}
                    aria-label={uiText.prev}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{uiText.prev}</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      aria-current={pNum === clampedPage ? 'page' : undefined}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                        pNum === clampedPage
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handlePageChange(clampedPage + 1)}
                    disabled={clampedPage >= totalPages}
                    aria-label={uiText.next}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <span className="hidden sm:inline">{uiText.next}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
