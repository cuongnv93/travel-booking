'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Search, Compass, Building2, Newspaper, ArrowRight, MapPin, Star } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';
import Link from 'next/link';

const executeSearch = async (queryStr: string) => {
  if (!queryStr) return { tours: [], hotels: [], news: [] };
  try {
    const res: any = await api.get(`/search?q=${encodeURIComponent(queryStr)}`);
    return {
      tours: res?.tours || res?.data?.tours || [],
      hotels: res?.hotels || res?.data?.hotels || [],
      news: res?.news || res?.data?.news || [],
    };
  } catch {
    return { tours: [], hotels: [], news: [] };
  }
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useParams().locale as string;
  const t = useTranslations('search');

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'tours' | 'hotels' | 'news'>('all');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['global-search', initialQuery],
    queryFn: () => executeSearch(initialQuery),
    enabled: !!initialQuery,
  });

  const tours = searchResults?.tours || [];
  const hotels = searchResults?.hotels || [];
  const news = searchResults?.news || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
  };

  const totalResults = tours.length + hotels.length + news.length;

  return (
    <div className="container mx-auto px-4 py-12 mt-20 max-w-6xl">
      {/* Search Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">{t('page_title')}</h1>
        <p className="text-blue-100 text-sm mb-6">{t('page_desc')}</p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-white text-slate-900 font-bold rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-7 py-3.5 rounded-2xl transition-all shadow-md text-sm cursor-pointer shrink-0"
          >
            {t('search_btn')}
          </button>
        </form>
      </div>

      {/* Tabs Selector */}
      {initialQuery && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-200">
          {[
            { key: 'all', label: t('tab_all'), count: totalResults, icon: Search },
            { key: 'tours', label: t('tab_tours'), count: tours.length, icon: Compass },
            { key: 'hotels', label: t('tab_hotels'), count: hotels.length, icon: Building2 },
            { key: 'news', label: t('tab_news'), count: news.length, icon: Newspaper },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : !initialQuery ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 text-slate-500">
          {t('empty_state_initial')}
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <p className="text-lg font-bold text-slate-800 mb-2">{t('empty_state_no_results', { query: initialQuery })}</p>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">{t('try_shorter_keywords')}</p>
          <Link href={`/${locale}/tours`} className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm">
            {t('view_all_tours')}
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Tours Section */}
          {(activeTab === 'all' || activeTab === 'tours') && tours.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>{t('tab_tours')} ({tours.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((item: any) => {
                  const title = getI18nText(item.title, locale);
                  const thumb = item.images?.[0] || 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800';

                  return (
                    <Link key={item._id || item.slug} href={`/${locale}/tours/${item.slug}`}>
                      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:shadow-xl transition-all group h-full flex flex-col">
                        <div className="h-44 bg-slate-900 relative overflow-hidden">
                          <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                            📍 {item.destination}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{t('duration_days', { days: item.duration })}</p>
                          </div>
                          <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                            <span className="text-xs text-slate-400 font-bold">{t('from')}</span>
                            <span className="text-lg font-extrabold text-orange-600">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hotels Section */}
          {(activeTab === 'all' || activeTab === 'hotels') && hotels.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>{t('tab_hotels')} ({hotels.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((item: any) => {
                  const name = getI18nText(item.name, locale);
                  const thumb = item.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

                  return (
                    <Link key={item._id || item.slug} href={`/${locale}/hotels/${item.slug}`}>
                      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:shadow-xl transition-all group h-full flex flex-col">
                        <div className="h-44 bg-slate-900 relative overflow-hidden">
                          <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> {item.stars}★
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-xs font-bold text-slate-400 block mb-0.5">📍 {item.location}</span>
                            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">{name}</h3>
                          </div>
                          <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                            <span className="text-xs text-slate-400 font-bold">{t('per_night_from')}</span>
                            <span className="text-lg font-extrabold text-purple-600">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* News Section */}
          {(activeTab === 'all' || activeTab === 'news') && news.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-teal-600" />
                <span>{t('tab_news')} ({news.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((item: any) => {
                  const title = getI18nText(item.title, locale);
                  const thumb = item.thumbnail || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

                  return (
                    <Link key={item._id || item.id} href={`/${locale}/news`}>
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all group">
                        <div className="w-24 h-24 rounded-xl bg-slate-900 shrink-0 overflow-hidden">
                          <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                            {item.category || t('news_default_category')}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 mt-1 group-hover:text-teal-600 line-clamp-2 transition-colors">{title}</h3>
                          <p className="text-xs text-slate-400 mt-1">{t('read_more')}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
