'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useParams } from 'next/navigation';
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

export default function NewsSection() {
  const t = useTranslations('newsSection');
  const tCommon = useTranslations('common');
  const locale = useParams().locale as string;

  const { data: news = [] } = useQuery({
    queryKey: ['latest-news-home'],
    queryFn: fetchLatestNews,
    placeholderData: keepPreviousData,
  });

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/news`}
          className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm"
        >
          {t('viewAll')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-sm">
          {tCommon('loading')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.slice(0, 4).map((item: any, index: number) => {
            const title = getI18nText(item.title, locale);
            const excerpt = getI18nText(item.excerpt || item.content, locale);
            const thumb = item.thumbnail || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';

            return (
              <motion.div
                key={item._id || item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/${locale}/news`}>
                  <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-all group sm:h-52 border border-slate-200/80 rounded-2xl">
                    <div className="sm:w-2/5 h-48 sm:h-full bg-slate-900 relative overflow-hidden shrink-0">
                      <img src={thumb} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                          {item.category || 'Travel'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 sm:w-3/5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {new Date(item.createdAt || Date.now()).toLocaleDateString(locale)}
                      </div>
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
          })}
        </div>
      )}
    </section>
  );
}
