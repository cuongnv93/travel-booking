'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Newspaper, TrendingUp } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { DEFAULT_NEWS } from '@/lib/defaultNews';
import { CATEGORY_NAMES, CATEGORY_TABS } from './news/newsConstants';
import { HeroSpotlightCard } from './news/HeroSpotlightCard';
import { TrendingRankingItem } from './news/TrendingRankingItem';
import { NewsSectionSkeleton } from './news/NewsSectionSkeleton';

const fetchLatestNews = async () => {
  try {
    const res: any = await api.get('/news?limit=20');
    const list = Array.isArray(res) ? res : (res?.data || []);
    return list.length > 0 ? list : DEFAULT_NEWS;
  } catch {
    return DEFAULT_NEWS;
  }
};

export default function NewsSection() {
  const t = useTranslations('newsSection');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<string>('all');

  const { data: rawNews = DEFAULT_NEWS, isLoading } = useQuery({
    queryKey: ['latest-news-home'],
    queryFn: fetchLatestNews,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Filter news according to the selected category tab
  const filteredNews = useMemo(() => {
    const list = Array.isArray(rawNews) && rawNews.length > 0 ? rawNews : DEFAULT_NEWS;
    if (activeTab === 'all') return list;
    return list.filter((item: any) => item.category === activeTab);
  }, [rawNews, activeTab]);

  // Spotlight article is the first item
  const spotlightArticle = useMemo(() => {
    return filteredNews[0] || (Array.isArray(rawNews) ? rawNews[0] : DEFAULT_NEWS[0]);
  }, [filteredNews, rawNews]);

  // Trending articles: take from filteredNews, and if fewer than 4, fill remaining slots with top articles from rawNews
  const trendingArticles = useMemo(() => {
    const list = filteredNews.slice(1, 5);
    if (list.length >= 4) return list;

    const existingIds = new Set([spotlightArticle?._id, ...list.map((a: any) => a._id)]);
    const fallbackPool = (Array.isArray(rawNews) && rawNews.length > 0 ? rawNews : DEFAULT_NEWS).filter(
      (a: any) => a && !existingIds.has(a._id)
    );
    return [...list, ...fallbackPool.slice(0, 4 - list.length)];
  }, [filteredNews, rawNews, spotlightArticle]);

  const getCategoryLabel = useCallback(
    (catKey: string) => {
      return (
        CATEGORY_NAMES[catKey]?.[locale] ||
        CATEGORY_NAMES[catKey]?.en ||
        CATEGORY_NAMES[catKey]?.vi ||
        catKey ||
        'Travel'
      );
    },
    [locale]
  );

  const getTabLabel = useCallback(
    (key: string) => {
      if (key === 'all') {
        try {
          return t('allCategories');
        } catch {
          return 'Tất cả';
        }
      }
      return getCategoryLabel(key);
    },
    [t, getCategoryLabel]
  );

  const featuredBadgeText = useMemo(() => {
    try {
      return t('featuredBadge');
    } catch {
      return 'Tiêu Điểm';
    }
  }, [t]);

  const trendingBadgeText = useMemo(() => {
    try {
      return t('trendingBadge');
    } catch {
      return 'Xu Hướng Đọc Nhiều';
    }
  }, [t]);

  const minReadText = useMemo(() => {
    try {
      return t('minRead');
    } catch {
      return 'phút đọc';
    }
  }, [t]);

  const readMoreText = useMemo(() => {
    try {
      return t('readMore');
    } catch {
      return tCommon('readMore') || 'Đọc tiếp';
    }
  }, [t, tCommon]);

  return (
    <section className="container mx-auto px-4 md:px-6">
      {/* Section Header with Category Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-5">
        <div>
          <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Newspaper className="w-4 h-4 text-blue-600" />
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Category Pill Filter Tabs & View All Link */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeNewsCategoryTab"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-xs"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{getTabLabel(tab.key)}</span>
                </button>
              );
            })}
          </div>

          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-1.5 text-blue-600 font-extrabold hover:text-blue-700 transition-colors text-xs sm:text-sm group ml-auto lg:ml-2 shrink-0"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <NewsSectionSkeleton />
      ) : filteredNews.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <Newspaper className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-medium">{t('emptyCategory') || 'Chưa có bài viết nào trong danh mục này.'}</p>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {t('backToAllArticles') || 'Quay lại xem tất cả bài viết'}
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Left Column: Hero Spotlight Feature (60% / lg:col-span-7) */}
            <div className="lg:col-span-7 h-full">
              {spotlightArticle && (
                <HeroSpotlightCard
                  article={spotlightArticle}
                  locale={locale}
                  categoryLabel={getCategoryLabel(spotlightArticle.category)}
                  featuredBadge={featuredBadgeText}
                  readMoreText={readMoreText}
                  minReadText={minReadText}
                />
              )}
            </div>

            {/* Right Column: Trending Ranking List (40% / lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
              <div className="flex items-center justify-between pb-1 px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  {trendingBadgeText}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {t('topWeekly') || 'Top đọc nhiều tuần này'}
                </span>
              </div>

              {trendingArticles.map((article: any, index: number) => (
                <TrendingRankingItem
                  key={article._id || article.slug || index}
                  article={article}
                  rankIndex={index}
                  locale={locale}
                  categoryLabel={getCategoryLabel(article.category)}
                  minReadText={minReadText}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
