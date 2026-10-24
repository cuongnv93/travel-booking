'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { MapPin, ArrowRight, Compass } from 'lucide-react';
import { useMemo, memo } from 'react';
import { useFeaturedDestinations, DEFAULT_DESTINATIONS } from '@/hooks/useSettings';
import { getI18nText } from '@/lib/utils';

const FALLBACK_DEST_PHOTO = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

interface DestinationCardProps {
  destName: string;
  queryParam: string;
  photo: string;
  tag?: string;
  locale: string;
  idx: number;
}

const DestinationCard = memo(function DestinationCard({ destName, queryParam, photo, tag, locale, idx }: DestinationCardProps) {
  const imgSrc = photo || FALLBACK_DEST_PHOTO;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
    >
      <Link href={`/${locale}/tours?destination=${encodeURIComponent(queryParam || destName)}`}>
        <div className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer bg-slate-100">
          <SmartImage
            src={imgSrc}
            alt={destName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            fallbackSrc={FALLBACK_DEST_PHOTO}
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1 mb-0.5 line-clamp-1">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              {tag || destName}
            </span>
            <h3 className="font-extrabold text-sm sm:text-base leading-tight group-hover:text-amber-300 transition-colors">
              {destName}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default function DestinationsSection() {
  const t = useTranslations('destinations');
  const locale = useLocale();

  const { data: dynamicDestinations } = useFeaturedDestinations();

  const displayList = useMemo(() => {
    if (Array.isArray(dynamicDestinations) && dynamicDestinations.length > 0) {
      return dynamicDestinations.filter((d: any) => d.isActive !== false);
    }
    return DEFAULT_DESTINATIONS;

  }, [dynamicDestinations]);

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">{t('subtitle')}</p>
        </div>
        <Link 
          href={`/${locale}/tours`} 
          className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm group"
        >
          <span>{t('viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {displayList.slice(0, 6).map((item: any, idx: number) => {
          const destName = typeof item === 'string'
            ? item
            : getI18nText(item.name, locale, 'Việt Nam');

          const queryParam = (typeof item === 'object' && item.tourQuery) ? item.tourQuery : destName;

          const photo = (typeof item === 'object' && item.image) 
            ? item.image 
            : FALLBACK_DEST_PHOTO;

          const tag = typeof item === 'object' && item.tag
            ? getI18nText(item.tag, locale)
            : undefined;

          return (
            <DestinationCard
              key={item.id || destName || idx}
              destName={destName}
              queryParam={queryParam}
              photo={photo}
              tag={tag}
              locale={locale}
              idx={idx}
            />
          );
        })}
      </div>
    </section>
  );
}

