'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Star, Clock, ArrowRight, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { CardSkeleton } from '@/components/ui/Skeleton';

const fetchFeaturedTours = async () => {
  const res: any = await api.get('/tours?limit=6');
  return res?.data || [];
};

export default function FeaturedTours() {
  const t = useTranslations();
  const locale = useParams().locale as string;

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: fetchFeaturedTours,
    placeholderData: keepPreviousData,
  });

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{t('featured.title')}</h2>
          <p className="text-slate-500">{t('featured.subtitle')}</p>
        </div>
        <Link 
          href={`/${locale}/tours`} 
          className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          {t('featured.viewAll')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} height="h-[420px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour: any, index: number) => {
            const hasImage = tour.images && tour.images.length > 0 && tour.images[0].startsWith('http');

            return (
              <motion.div
                key={tour._id || tour.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/${locale}/tours/${tour.slug}`}>
                  <Card className="overflow-hidden group h-full cursor-pointer hover:-translate-y-2 transition-all duration-300">
                    <div className="h-64 bg-slate-800 relative overflow-hidden">
                      {hasImage ? (
                        <img 
                          src={tour.images[0]} 
                          alt={getI18nText(tour.title, locale)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg p-4 text-center">
                          {getI18nText(tour.title, locale)}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                      
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 text-slate-700 shadow-sm">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        {tour.rating || 4.8}
                      </div>

                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                          {tour.destination}
                        </span>
                        {tour.originalPrice && tour.originalPrice > tour.price && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Khuyến mãi
                          </span>
                        )}
                      </div>

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white text-blue-900 px-6 py-2 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {getI18nText(tour.title, locale)}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {typeof tour.duration === 'number' ? `${tour.duration} ngày` : tour.duration}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">{t('common.from')}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-orange-500">{formatPrice(tour.price)}</span>
                            {tour.originalPrice && (
                              <span className="text-xs text-slate-400 line-through">{formatPrice(tour.originalPrice)}</span>
                            )}
                          </div>
                        </div>
                        <span className="bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm group-hover:shadow-md transition-all">
                          {t('common.viewDetails') || 'Xem Chi Tiết'}
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
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
