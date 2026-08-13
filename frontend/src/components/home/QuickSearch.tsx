'use client';

import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Plane, Hotel, Map, Flame, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const POPULAR_DESTINATIONS = [
  { name: 'Đà Nẵng', tag: 'Biển & Resort 5★', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
  { name: 'Phú Quốc', tag: 'Đảo Ngọc Ngắm San Hô', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200' },
  { name: 'Hà Nội', tag: 'Văn Hóa Phố Cổ 36 Phường', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
  { name: 'Sa Pa', tag: 'Sương Mờ Ruộng Bậc Thang', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200' },
  { name: 'Hạ Long', tag: 'Kỳ Quan Du Thuyền UNESCO', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200' },
  { name: 'Cao Bằng', tag: 'Thác Bản Giốc Hùng Vĩ', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200' },
  { name: 'Nha Trang', tag: 'Vịnh Biển Đẹp Nhất', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
  { name: 'Huế', tag: 'Cố Đô Triều Nguyễn', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200' },
];

function QuickSearchComponent() {
  const t = useTranslations('search');
  const router = useRouter();
  const locale = useParams().locale as string;

  const [activeTab, setActiveTab] = useState<'tours' | 'hotels' | 'flights'>('tours');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs = useMemo(
    () => [
      { id: 'tours', label: t('tabs.tours'), icon: Map, color: 'text-blue-500' },
      { id: 'hotels', label: t('tabs.hotels'), icon: Hotel, color: 'text-amber-500' },
      { id: 'flights', label: t('tabs.flights'), icon: Plane, color: 'text-teal-500' },
    ],
    [t]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(
    () =>
      POPULAR_DESTINATIONS.filter(
        (item) =>
          item.name.toLowerCase().includes(destination.toLowerCase()) ||
          item.tag.toLowerCase().includes(destination.toLowerCase())
      ),
    [destination]
  );

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (activeTab === 'hotels') {
        router.push(`/${locale}/hotels?location=${encodeURIComponent(destination)}`);
      } else if (activeTab === 'flights') {
        router.push(`/${locale}/flights?destination=${encodeURIComponent(destination)}`);
      } else {
        router.push(`/${locale}/tours?destination=${encodeURIComponent(destination)}`);
      }
    },
    [activeTab, destination, locale, router]
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
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-900/20 border border-slate-200/80 relative z-40 backdrop-blur-xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
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
          <div className="md:col-span-5 relative" ref={dropdownRef}>
            <label className="text-[11px] font-extrabold text-slate-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('destination')}</span>
            </label>

            <div className="relative flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={destination}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder={activeTab === 'hotels' ? t('hotelPlaceholder') : t('destinationPlaceholder')}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Suggestions Panel */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2.5 max-h-80 overflow-y-auto animate-in fade-in duration-150">
                <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('suggestions')}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => selectDestination(item.name)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50/80 text-slate-800 hover:text-blue-700 flex items-center justify-between transition-all group cursor-pointer border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform shrink-0"
                          />
                          <div>
                            <span className="font-bold text-xs sm:text-sm block text-slate-900 group-hover:text-blue-600">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-medium">
                              {item.tag}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                          {t('choose')} <ChevronRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-xs text-slate-400 text-center">{t('noMatch')}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Picker Field */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-extrabold text-slate-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('date')}</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 text-amber-500 absolute left-3.5 pointer-events-none" />
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-3 py-3.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Guests Field */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-extrabold text-slate-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('guests')}</span>
            </label>
            <div className="relative flex items-center">
              <Users className="w-5 h-5 text-emerald-500 absolute left-3.5 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="30"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-11 pr-3 py-3.5 text-sm text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="md:col-span-2">
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
            <span className="text-xs font-extrabold text-slate-900 block leading-tight flex items-center gap-1">
              {t('hotTrend')} <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">{t('hotTrendSub')}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

        <div className="flex flex-wrap gap-2 flex-1 items-center">
          {POPULAR_DESTINATIONS.slice(0, 6).map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => selectDestination(item.name)}
              className="bg-slate-50 hover:bg-blue-600 text-slate-800 hover:text-white pl-1.5 pr-3.5 py-1 rounded-full font-bold text-xs shadow-xs border border-slate-200/90 hover:border-blue-600 transition-all cursor-pointer flex items-center gap-2 group hover:-translate-y-0.5"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-5 h-5 rounded-full object-cover ring-2 ring-white group-hover:ring-blue-400 shrink-0"
              />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(QuickSearchComponent);
