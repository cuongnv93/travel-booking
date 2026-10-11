'use client';

import { memo, useCallback, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import SmartImage from '@/components/ui/SmartImage';
import { Star, MapPin, ArrowRight, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';

const fetchHotels = async () => {
  const res: any = await api.get('/hotels');
  const list = Array.isArray(res) ? res : (res?.data || []);
  return list.slice(0, 3);
};

const DEFAULT_HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

interface HotelCardProps {
  hotel: any;
  idx: number;
  locale: string;
  fromText: string;
  perNightText: string;
  selectText: string;
  starsText: string;
}

const FeaturedHotelCard = memo(function FeaturedHotelCard({
  hotel,
  idx,
  locale,
  fromText,
  perNightText,
  selectText,
  starsText,
}: HotelCardProps) {
  const name = getI18nText(hotel.name, locale);
  const [imgSrc, setImgSrc] = useState(hotel.images?.[0] || DEFAULT_HOTEL_IMG);

  const handleImgError = useCallback(() => {
    setImgSrc(DEFAULT_HOTEL_IMG);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group h-full justify-between"
    >
      <div className="h-60 bg-slate-100 relative overflow-hidden">
        <SmartImage
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fallbackSrc={DEFAULT_HOTEL_IMG}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{hotel.stars || 5} {starsText}</span>
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
            <p className="text-xs text-slate-400">{fromText}</p>
            <p className="text-xl font-extrabold text-orange-500">
              {formatPrice(hotel.pricePerNight)}
              <span className="text-xs text-slate-500 font-normal">{perNightText}</span>
            </p>
          </div>
          <Link
            href={`/${locale}/hotels/${hotel.slug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors"
          >
            {selectText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

export default function FeaturedHotels() {
  const t = useTranslations('featuredHotels');
  const tCommon = useTranslations('common');
  const locale = useParams().locale as string;

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: fetchHotels,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });

  return (
    <section className="container mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
      >
        <div>
          <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/hotels`}
          className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors group"
        >
          <span>{t('viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-[420px] rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">{tCommon('loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {hotels.map((hotel: any, idx: number) => (
            <FeaturedHotelCard
              key={hotel._id || hotel.id}
              hotel={hotel}
              idx={idx}
              locale={locale}
              fromText={tCommon('from')}
              perNightText={tCommon('perNight')}
              selectText={tCommon('select')}
              starsText={tCommon('stars')}
            />
          ))}
        </div>
      )}
    </section>
  );
}
