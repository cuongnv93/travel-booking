'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { getI18nText, formatLocalizedDate } from '@/lib/utils';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { VideoBackground } from '@/components/ui/VideoBackground';

const fetchNews = async (selectedCategory?: string) => {
  const query = selectedCategory ? `/news?category=${selectedCategory}&limit=20` : '/news?limit=20';
  const res: any = await api.get(query);
  return res?.data || (Array.isArray(res) ? res : []);
};

const CATEGORY_ITEMS = [
  { key: '', label: 'Tất cả bài viết', labelEn: 'All Articles', labelZh: '全部文章', labelKo: '전체 글', labelJa: 'すべての記事' },
  { key: 'experience', label: '✈️ Kinh nghiệm', labelEn: '✈️ Experience', labelZh: '✈️ 旅行经验', labelKo: '✈️ 여행 팁', labelJa: '✈️ 旅行体験' },
  { key: 'food', label: '🍜 Ẩm thực', labelEn: '🍜 Cuisine', labelZh: '🍜 美食天地', labelKo: '🍜 미식 탐방', labelJa: '🍜 グルメ' },
  { key: 'destination', label: '🗺️ Điểm đến', labelEn: '🗺️ Destinations', labelZh: '🗺️ 热门目的地', labelKo: '🗺️ 추천 여행지', labelJa: '🗺️ 観光スポット' },
  { key: 'international', label: '🌍 Quốc tế', labelEn: '🌍 International', labelZh: '🌍 国际旅游', labelKo: '🌍 해외 여행', labelJa: '🌍 海外旅行' },
];

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

interface Props {
  initialNews: any[];
  newsBanner: string;
  newsVideo?: string;
}

const NewsGridCard = memo(function NewsGridCard({
  article,
  locale,
  categoryLabel,
  readMoreText,
  editorText,
}: {
  article: any;
  locale: string;
  categoryLabel: string;
  readMoreText: string;
  editorText: string;
}) {
  const title = getI18nText(article.title, locale);
  const excerpt = getI18nText(article.excerpt, locale);
  const [thumbnail, setThumbnail] = useState(article.thumbnail || FALLBACK_NEWS_IMG);

  const handleImgError = useCallback(() => {
    setThumbnail(FALLBACK_NEWS_IMG);
  }, []);

  const formattedDate = useMemo(() => {
    const rawDate = article.publishedAt || article.createdAt;
    return formatLocalizedDate(rawDate, locale);
  }, [article.publishedAt, article.createdAt, locale]);

  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="h-52 bg-slate-100 overflow-hidden relative">
        <SmartImage
          src={thumbnail}
          alt={title}
          fill
          fallbackSrc={FALLBACK_NEWS_IMG}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {categoryLabel}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {article.author || editorText}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6">
            {excerpt}
          </p>
        </div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
          <span>{readMoreText}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
});

function NewsClientComponent({
  initialNews,
  newsBanner,
  newsVideo = 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/forest_bike.mp4',
}: Props) {
  const locale = useParams().locale as string;
  const t = useTranslations('newsSection');
  const tCommon = useTranslations('common');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: newsList = initialNews } = useQuery({
    queryKey: ['news', selectedCategory],
    queryFn: () => fetchNews(selectedCategory),
    placeholderData: selectedCategory ? keepPreviousData : (initialNews as any),
    enabled: selectedCategory !== '',
    staleTime: 5 * 60 * 1000,
  });

  const displayNews = useMemo(() => {
    return selectedCategory ? newsList : (newsList.length ? newsList : initialNews);
  }, [selectedCategory, newsList, initialNews]);

  const featured = displayNews[0];
  const rest = useMemo(() => displayNews.slice(1), [displayNews]);

  const getCatLabel = useCallback((key: string) => {
    const item = CATEGORY_ITEMS.find((c) => c.key === key);
    if (!item) return key || 'News';
    if (locale === 'en') return item.labelEn;
    if (locale === 'zh') return item.labelZh;
    if (locale === 'ko') return item.labelKo;
    if (locale === 'ja') return item.labelJa;
    return item.label;
  }, [locale]);

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      {/* Hero Banner */}
      <VideoBackground
        videoSrc={newsVideo}
        videoSources={[
          { src: newsVideo, type: 'video/mp4' },
          { src: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4', type: 'video/mp4' }
        ]}
        posterSrc={newsBanner}
        fallbackPosterSrc={FALLBACK_NEWS_IMG}
        overlayGradient="bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/25"
        className="h-64 md:h-80 rounded-3xl mb-10 shadow-2xl flex items-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-8 max-w-2xl text-white"
        >
          <span className="bg-emerald-600/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            📰 Travel Insights
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('title')}</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>
      </VideoBackground>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-slate-100">
        {CATEGORY_ITEMS.map((cat) => (
          <motion.button
            key={cat.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              selectedCategory === cat.key ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {getCatLabel(cat.key)}
          </motion.button>
        ))}
      </div>

      {/* Featured Big Card */}
      {featured && (
        <motion.div
          key={featured._id || featured.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-12"
        >
          <Link
            href={`/${locale}/news/${featured.slug}`}
            className="group block bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-72 lg:h-[380px] bg-slate-800 overflow-hidden relative">
                <img
                  src={featured.thumbnail || FALLBACK_NEWS_IMG}
                  alt={getI18nText(featured.title, locale)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {getCatLabel(featured.category)}
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    {featured.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatLocalizedDate(featured.publishedAt, locale)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {featured.author || tCommon('editor')}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                    {getI18nText(featured.title, locale)}
                  </h2>
                  <p className="text-slate-500 text-sm lg:text-base line-clamp-3 leading-relaxed mb-6 font-normal">
                    {getI18nText(featured.excerpt, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                  <span>{tCommon('readMore')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Grid of Remaining Articles */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {rest.map((article: any, idx: number) => (
          <motion.div
            key={article._id || article.slug}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: Math.min(idx * 0.05, 0.25),
              ease: 'easeOut'
            }}
          >
            <NewsGridCard
              article={article}
              locale={locale}
              categoryLabel={getCatLabel(article.category)}
              readMoreText={tCommon('readMore')}
              editorText={tCommon('editor')}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default memo(NewsClientComponent);
