'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Star, MapPin, ArrowRight, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';

const fetchHotels = async () => {
  const res: any = await api.get('/hotels');
  const list = Array.isArray(res) ? res : (res?.data || []);
  return list.slice(0, 3); // Take top 3 for homepage
};

export default function FeaturedHotels() {
  const t = useTranslations('featuredHotels');
  const tCommon = useTranslations('common');
  const locale = useParams().locale as string;

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: fetchHotels,
    placeholderData: keepPreviousData,
  });

  return (
    <section className="container mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
      >
        <div>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-3 inline-block">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('title')}
          </h2>
        </div>
        <Link
          href={`/${locale}/hotels`}
          className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 hover:translate-x-1 transition-all group"
        >
          <span>{t('viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">{tCommon('loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hotels.map((hotel: any, idx: number) => {
            const name = getI18nText(hotel.name, locale);
            const image = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

            return (
              <motion.div
                key={hotel._id || hotel.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="h-60 bg-slate-900 relative overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{hotel.stars || 5} {tCommon('stars')}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{hotel.location}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{hotel.address}</span>
                    </p>

                    {hotel.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {hotel.amenities.slice(0, 3).map((item: string, i: number) => (
                          <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">{tCommon('from')}</p>
                      <p className="text-xl font-extrabold text-orange-500">
                        {formatPrice(hotel.pricePerNight)}
                        <span className="text-xs text-slate-500 font-normal">{tCommon('perNight')}</span>
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/hotels/${hotel.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors"
                    >
                      {tCommon('select')}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
