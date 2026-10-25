'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { ArrowRight, Calendar, Clock, Newspaper, Sparkles, TrendingUp, User } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { DEFAULT_NEWS } from '@/lib/defaultNews';
import { getI18nText, formatLocalizedDate } from '@/lib/utils';

const fetchLatestNews = async () => {
  try {
    const res: any = await api.get('/news?limit=12');
    const list = Array.isArray(res) ? res : (res?.data || []);
    return list.length > 0 ? list : DEFAULT_NEWS;
  } catch {
    return DEFAULT_NEWS;
  }
};

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
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

const CATEGORY_TABS = [
  { key: 'all', labelKey: 'allCategories' },
  { key: 'experience', labelKey: 'experience' },
  { key: 'destination', labelKey: 'destination' },
  { key: 'food', labelKey: 'food' },
  { key: 'international', labelKey: 'international' },
];

const FALLBACK_NEWS_THUMB = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';

// Calculate estimated reading time based on text length
const calculateReadingTime = (text: string): number => {
  if (!text) return 3;
  const plain = text.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
};

// 1. Hero Spotlight Card (Left 60% on desktop)
interface HeroSpotlightProps {
  article: any;
  locale: string;
  categoryLabel: string;
  featuredBadge: string;
  readMoreText: string;
  minReadText: string;
}

const HeroSpotlightCard = memo(function HeroSpotlightCard({
  article,
  locale,
  categoryLabel,
  featuredBadge,
  readMoreText,
  minReadText,
}: HeroSpotlightProps) {
  const title = getI18nText(article.title, locale);
  const rawExcerpt = getI18nText(article.excerpt || article.content, locale);
  const plainExcerpt = rawExcerpt ? rawExcerpt.replace(/<[^>]*>/g, '').trim() : '';
  const thumb = article.thumbnail || FALLBACK_NEWS_THUMB;
  const href = article.slug ? `/${locale}/news/${article.slug}` : `/${locale}/news`;

  const formattedDate = useMemo(() => {
    return formatLocalizedDate(article.publishedAt || article.createdAt, locale);
  }, [article.publishedAt, article.createdAt, locale]);

  const readingTime = useMemo(() => {
    const rawContent = getI18nText(article.content || article.excerpt, locale);
    return calculateReadingTime(rawContent);
  }, [article.content, article.excerpt, locale]);

  const authorName = article.author || 'Travel Editor';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Link href={href} className="group block relative w-full h-full min-h-[440px] sm:min-h-[480px] lg:min-h-[540px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-200/80">
      {/* Background Image with Ken Burns Zoom */}
      <SmartImage
        src={thumb}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        fallbackSrc={FALLBACK_NEWS_THUMB}
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        priority
      />

      {/* Multi-layered cinematic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />

      {/* Top Floating Badges */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600/90 hover:bg-blue-600 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors">
            {categoryLabel}
          </span>
          <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {featuredBadge}
          </span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 z-10 text-white space-y-3.5">
        {/* Meta Row: Date & Reading Time */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {formattedDate}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {readingTime} {minReadText}
          </span>
        </div>

        {/* Big Catchy Title */}
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight group-hover:text-blue-300 transition-colors line-clamp-2 sm:line-clamp-3">
          {title}
        </h3>

        {/* Excerpt Lead */}
        {plainExcerpt && (
          <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 leading-relaxed opacity-90">
            {plainExcerpt}
          </p>
        )}

        {/* Author Footer & CTA Button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {authorInitial}
            </div>
            <span className="text-xs font-bold text-slate-200">{authorName}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-300 group-hover:text-white transition-colors">
            <span>{readMoreText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
});

// 2. Trending Ranking Item (Right 40% on desktop)
interface TrendingRankingProps {
  article: any;
  rankIndex: number;
  locale: string;
  categoryLabel: string;
  minReadText: string;
}

const TrendingRankingItem = memo(function TrendingRankingItem({
  article,
  rankIndex,
  locale,
  categoryLabel,
  minReadText,
}: TrendingRankingProps) {
  const title = getI18nText(article.title, locale);
  const thumb = article.thumbnail || FALLBACK_NEWS_THUMB;
  const href = article.slug ? `/${locale}/news/${article.slug}` : `/${locale}/news`;

  const formattedDate = useMemo(() => {
    return formatLocalizedDate(article.publishedAt || article.createdAt, locale);
  }, [article.publishedAt, article.createdAt, locale]);

  const readingTime = useMemo(() => {
    const rawContent = getI18nText(article.content || article.excerpt, locale);
    return calculateReadingTime(rawContent);
  }, [article.content, article.excerpt, locale]);

  const rankNumber = `#0${rankIndex + 1}`;

  return (
    <Link
      href={href}
      className="group flex items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all duration-300 shadow-2xs hover:shadow-md"
    >
      {/* Ranking Stylized Typography */}
      <span className="text-xl sm:text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 w-8 sm:w-10 pt-1 font-mono">
        {rankNumber}
      </span>

      {/* Square Thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200/60 shadow-2xs">
        <SmartImage
          src={thumb}
          alt={title}
          fill
          sizes="(max-width: 640px) 80px, 96px"
          fallbackSrc={FALLBACK_NEWS_THUMB}
          className="object-cover group-hover:scale-108 transition-transform duration-500"
        />
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {categoryLabel}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </h4>
        </div>

        {/* Footer info: Date & Min read */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
          {formattedDate && <span>{formattedDate}</span>}
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3 text-amber-500" />
            {readingTime} {minReadText}
          </span>
        </div>
      </div>
    </Link>
  );
});

// 3. High-fidelity Bento Skeleton Loader
const NewsSectionSkeleton = memo(function NewsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      {/* Left Spotlight Skeleton */}
      <div className="lg:col-span-7 h-[440px] sm:h-[480px] lg:h-[540px] rounded-3xl bg-slate-200/80 p-8 flex flex-col justify-end space-y-4">
        <div className="h-6 w-28 bg-slate-300 rounded-full" />
        <div className="h-8 w-4/5 bg-slate-300 rounded-lg" />
        <div className="h-4 w-2/3 bg-slate-300 rounded-md" />
        <div className="h-10 w-full bg-slate-300/60 rounded-xl" />
      </div>

      {/* Right List Skeletons */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
            <div className="w-8 h-8 rounded bg-slate-200" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-16 bg-slate-200 rounded-full" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

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

  // Spotlight article is the first item; the next 3-4 items are the trending list
  const spotlightArticle = useMemo(() => filteredNews[0] || DEFAULT_NEWS[0], [filteredNews]);
  const trendingArticles = useMemo(() => filteredNews.slice(1, 5), [filteredNews]);

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
    (key: string, labelKey: string) => {
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
                  <span className="relative z-10">{getTabLabel(tab.key, tab.labelKey)}</span>
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
          <p className="text-sm font-medium">Chưa có bài viết nào trong danh mục này.</p>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Quay lại xem tất cả bài viết
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
                  Top đọc nhiều tuần này
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
