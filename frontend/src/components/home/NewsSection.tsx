'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { ArrowRight, Calendar, Newspaper } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { getI18nText } from '@/lib/utils';

const fetchLatestNews = async () => {
  try {
    const res: any = await api.get('/news?limit=4');
    return Array.isArray(res) ? res : (res?.data || []);
  } catch {
    return [];
  }
};

const FALLBACK_NEWS_THUMB = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

interface NewsCardItemProps {
  item: any;
  index: number;
  locale: string;
}

const NewsCardItem = memo(function NewsCardItem({ item, index, locale }: NewsCardItemProps) {
  const title = getI18nText(item.title, locale);
  const excerpt = getI18nText(item.excerpt || item.content, locale);
  const thumb = item.thumbnail || FALLBACK_NEWS_THUMB;
  const newsHref = item.slug ? `/${locale}/news/${item.slug}` : `/${locale}/news`;

  const formattedDate = useMemo(() => {
    if (!item.createdAt) return '';
    try {
      const d = new Date(item.createdAt);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale);
    } catch {
      return '';
    }
  }, [item.createdAt, locale]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={newsHref}>
        <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-all group sm:h-52 border border-slate-200/80 rounded-2xl">
          <div className="sm:w-2/5 h-48 sm:h-full bg-slate-100 relative overflow-hidden shrink-0">
            <SmartImage
              src={thumb}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              fallbackSrc={FALLBACK_NEWS_THUMB}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                {item.category || 'Travel'}
              </span>
            </div>
          </div>
          <div className="p-5 sm:w-3/5 flex flex-col justify-center">
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {formattedDate}
              </div>
            )}
            <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});

export default function NewsSection() {
  const t = useTranslations('newsSection');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['latest-news-home'],
    queryFn: fetchLatestNews,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });

  const displayNews = useMemo(() => news.slice(0, 4), [news]);

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Newspaper className="w-4 h-4 text-blue-600" />
            <span>{t('badge', { fallback: 'Góc Cẩm Nang' })}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm group"
        >
          <span>{t('viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:h-52 rounded-2xl bg-slate-100/80 border border-slate-200/60 overflow-hidden animate-pulse"
            >
              <div className="sm:w-2/5 h-48 sm:h-full bg-slate-200" />
              <div className="p-5 sm:w-3/5 flex flex-col justify-center space-y-3">
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
                <div className="h-5 w-4/5 bg-slate-200 rounded" />
                <div className="h-3.5 w-full bg-slate-200 rounded" />
                <div className="h-3.5 w-2/3 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : displayNews.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-sm">
          {tCommon('loading')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayNews.map((item: any, index: number) => (
            <NewsCardItem
              key={item._id || item.id || index}
              item={item}
              index={index}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}
