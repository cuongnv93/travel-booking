'use client';

import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Plane,
  Hotel,
  Map,
  Flame,
  Sparkles,
  TrendingUp,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn, getI18nText, removeVietnameseTones } from '@/lib/utils';
import { useFeaturedDestinations, DEFAULT_DESTINATIONS } from '@/hooks/useSettings';

type SearchTab = 'tours' | 'hotels' | 'flights';

interface DestinationItem {
  id?: string;
  name: Record<string, string> | string;
  image?: string;
  tag?: Record<string, string> | string;
  tourQuery?: string;
  order?: number;
  isActive?: boolean;
}

const FALLBACK_DEST_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400';

const FALLBACK_POPULAR_DESTINATIONS: DestinationItem[] = [
  ...DEFAULT_DESTINATIONS,
  {
    id: 'halong',
    name: { vi: 'Hạ Long', en: 'Ha Long Bay', zh: '下龙湾', ko: '하롱베이', ja: 'ハロン湾' },
    image: FALLBACK_DEST_IMG,
    tag: { vi: 'Kỳ Quan Du Thuyền UNESCO', en: 'UNESCO World Natural Wonder', zh: '世界自然遗产游轮', ko: 'UNESCO 세계자연유산', ja: '世界遺産ハロン湾クルーズ' },
    tourQuery: 'Hạ Long',
    order: 7,
    isActive: true,
  },
  {
    id: 'caobang',
    name: { vi: 'Cao Bằng', en: 'Cao Bang', zh: '高平', ko: '까오방', ja: 'カオバン' },
    image: FALLBACK_DEST_IMG,
    tag: { vi: 'Thác Bản Giốc Hùng Vĩ', en: 'Majestic Ban Gioc Waterfall', zh: '雄伟板约瀑布', ko: '반족 폭포의 절경', ja: '雄大なバンゾック滝' },
    tourQuery: 'Cao Bằng',
    order: 8,
    isActive: true,
  },
  {
    id: 'hue',
    name: { vi: 'Huế', en: 'Hue Imperial City', zh: '顺化古都', ko: '후에 황도', ja: 'フエ古都' },
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    tag: { vi: 'Cố Đô Triều Nguyễn', en: 'Nguyen Dynasty Citadel', zh: '阮朝皇城古都', ko: '응우옌 왕조의 옛 수도', ja: '阮朝の歴史香る古都' },
    tourQuery: 'Huế',
    order: 9,
    isActive: true,
  },
];

function getLocalTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampGuestsCount(value: string): string {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return '1';
  if (parsed > 30) return '30';
  return String(parsed);
}

function QuickSearchComponent() {
  const t = useTranslations('search');
  const router = useRouter();
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<SearchTab>('tours');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [guests, setGuests] = useState('2');
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: remoteDestinations } = useFeaturedDestinations();

  // Compute today's local date on mount to avoid SSR hydration mismatch & UTC date offset
  useEffect(() => {
    setMinDate(getLocalTodayIso());
  }, []);

  const destinationsList: DestinationItem[] = useMemo(() => {
    const raw =
      Array.isArray(remoteDestinations) && remoteDestinations.length > 0
        ? (remoteDestinations as DestinationItem[])
        : FALLBACK_POPULAR_DESTINATIONS;
    const active = raw.filter((item) => item.isActive !== false);
    const list = active.length > 0 ? active : FALLBACK_POPULAR_DESTINATIONS;
    return [...list].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [remoteDestinations]);

  const tabs: Array<{ id: SearchTab; label: string; icon: LucideIcon; color: string }> = useMemo(
    () => [
      { id: 'tours', label: t('tabs.tours'), icon: Map, color: 'text-blue-500' },
      { id: 'hotels', label: t('tabs.hotels'), icon: Hotel, color: 'text-amber-500' },
      { id: 'flights', label: t('tabs.flights'), icon: Plane, color: 'text-teal-500' },
    ],
    [t]
  );

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);

  const filteredSuggestions = useMemo(() => {
    const queryClean = removeVietnameseTones(destination);
    if (!queryClean) return destinationsList;

    return destinationsList.filter((item) => {
      const nameCurrent = getI18nText(item.name, locale, '');
      const nameVi = typeof item.name === 'object' ? item.name?.vi || '' : String(item.name || '');
      const nameEn = typeof item.name === 'object' ? item.name?.en || '' : '';
      const tagCurrent = getI18nText(item.tag, locale, '');
      const tagVi = typeof item.tag === 'object' ? item.tag?.vi || '' : String(item.tag || '');
      const tourQuery = item.tourQuery || '';
      const idStr = item.id || '';

      return (
        removeVietnameseTones(nameCurrent).includes(queryClean) ||
        removeVietnameseTones(nameVi).includes(queryClean) ||
        removeVietnameseTones(nameEn).includes(queryClean) ||
        removeVietnameseTones(tagCurrent).includes(queryClean) ||
        removeVietnameseTones(tagVi).includes(queryClean) ||
        removeVietnameseTones(tourQuery).includes(queryClean) ||
        idStr.toLowerCase().includes(queryClean)
      );
    });
  }, [destinationsList, destination, locale]);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setShowDropdown(false);
      const params = new URLSearchParams();
      const trimmedDest = destination.trim();
      const safeGuests = clampGuestsCount(guests);

      if (activeTab === 'hotels') {
        if (trimmedDest) params.set('location', trimmedDest);
        if (date) params.set('checkIn', date);
        if (safeGuests !== '2') params.set('guests', safeGuests);
        const query = params.toString();
        router.push(`/${locale}/hotels${query ? `?${query}` : ''}`);
      } else if (activeTab === 'flights') {
        if (trimmedDest) params.set('destination', trimmedDest);
        if (date) params.set('departDate', date);
        if (safeGuests !== '1') params.set('passengers', safeGuests);
        const query = params.toString();
        router.push(`/${locale}/flights${query ? `?${query}` : ''}`);
      } else {
        if (trimmedDest) params.set('destination', trimmedDest);
        if (date) params.set('date', date);
        if (safeGuests !== '2') params.set('guests', safeGuests);
        const query = params.toString();
        router.push(`/${locale}/tours${query ? `?${query}` : ''}`);
      }
    },
    [activeTab, destination, date, guests, locale, router]
  );

  const selectDestination = useCallback((name: string) => {
    setDestination(name);
    setShowDropdown(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full relative z-40"
    >
      {/* Main Search Card Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-2xl shadow-slate-900/20 border border-slate-200/80 relative z-40 backdrop-blur-xl">
        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Search type" className="flex flex-wrap gap-2 mb-5 sm:mb-6 border-b border-slate-100 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02] sm:scale-105'
                    : 'text-slate-600 bg-slate-100/80 hover:bg-slate-200/70 hover:text-slate-900'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : tab.color)} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Controls Grid */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative z-30">
          {/* Destination Field */}
          <div className="md:col-span-5 min-w-0 relative" ref={dropdownRef}>
            <label
              htmlFor="quick-search-destination"
              className="text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('destination')}</span>
            </label>

            <div className="relative flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 absolute left-3.5 pointer-events-none" />
              <input
                id="quick-search-destination"
                type="text"
                value={destination}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder={activeTab === 'hotels' ? t('hotelPlaceholder') : t('destinationPlaceholder')}
                className="w-full min-w-0 bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Suggestions Panel */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2.5 max-h-80 overflow-y-auto animate-fade-in">
                <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('suggestions')}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => {
                      const displayName = getI18nText(
                        item.name,
                        locale,
                        typeof item.name === 'string' ? item.name : item.name?.vi || ''
                      );
                      const displayTag = getI18nText(
                        item.tag,
                        locale,
                        typeof item.tag === 'string' ? item.tag : item.tag?.vi || ''
                      );
                      const selectValue = item.tourQuery || displayName;

                      return (
                        <button
                          key={item.id || displayName}
                          type="button"
                          onClick={() => selectDestination(selectValue)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50/80 text-slate-800 hover:text-blue-700 flex items-center justify-between transition-all group cursor-pointer border border-transparent hover:border-blue-100"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Image
                              src={item.image || FALLBACK_DEST_IMG}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-xs sm:text-sm block text-slate-900 group-hover:text-blue-600 truncate">
                                {displayName}
                              </span>
                              {displayTag && (
                                <span className="text-[11px] text-slate-500 block font-medium truncate">
                                  {displayTag}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-bold bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1 shrink-0 ml-2">
                            {t('choose')} <ChevronRight className="w-3 h-3" />
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-4 py-3 text-xs text-slate-500 text-center">{t('noMatch')}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Picker Field */}
          <div className="md:col-span-3 min-w-0">
            <label
              htmlFor="quick-search-date"
              className="text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('date')}</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 text-amber-500 absolute left-3.5 pointer-events-none" />
              <input
                id="quick-search-date"
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-w-0 bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-3 py-3.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Guests Field */}
          <div className="md:col-span-2 min-w-0">
            <label
              htmlFor="quick-search-guests"
              className="text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('guests')}</span>
            </label>
            <div className="relative flex items-center">
              <Users className="w-5 h-5 text-emerald-500 absolute left-3.5 pointer-events-none" />
              <input
                id="quick-search-guests"
                type="number"
                min={1}
                max={30}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                onBlur={(e) => setGuests(clampGuestsCount(e.target.value))}
                className="w-full min-w-0 bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-3 py-3.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="md:col-span-2 min-w-0">
            <button
              type="submit"
              className="w-full h-[50px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
              <span>{t('searchBtn')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Hot Trend Section */}
      <div className="mt-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-md flex flex-col sm:flex-row sm:items-center gap-3 relative z-10">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 leading-tight flex items-center gap-1">
              {t('hotTrend')} <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </span>
            <span className="text-[10px] text-slate-500 block font-medium">{t('hotTrendSub')}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

        <div className="flex flex-wrap gap-2 flex-1 items-center">
          {destinationsList.slice(0, 7).map((item) => {
            const displayName = getI18nText(
              item.name,
              locale,
              typeof item.name === 'string' ? item.name : item.name?.vi || ''
            );
            const selectValue = item.tourQuery || displayName;

            return (
              <button
                key={item.id || displayName}
                type="button"
                onClick={() => selectDestination(selectValue)}
                className="bg-slate-50 hover:bg-blue-600 text-slate-800 hover:text-white pl-1.5 pr-3.5 py-1 rounded-full font-bold text-xs shadow-sm border border-slate-200/90 hover:border-blue-600 transition-all cursor-pointer flex items-center gap-2 group hover:-translate-y-0.5"
              >
                <Image
                  src={item.image || FALLBACK_DEST_IMG}
                  alt={displayName}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover ring-2 ring-white group-hover:ring-blue-400 shrink-0"
                />
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(QuickSearchComponent);
