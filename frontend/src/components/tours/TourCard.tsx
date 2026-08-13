'use client';

import Link from 'next/link';
import { Star, Clock, Tag, Heart, Users, Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { I18nText } from '@/types';

interface TourCardProps {
  tour: {
    slug: string;
    images?: string[];
    imageGradient?: string;
    rating?: number;
    destination?: string;
    location?: string;
    title: string | I18nText;
    duration: string | number;
    price: number;
    originalPrice?: number;
    availableSlots?: number;
    totalSlots?: number;
    viewCount?: number;
    [key: string]: unknown;
  };
  locale?: string;
}

// Persist wishlist in localStorage
function useWishlist(slug: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem('tour-wishlist') || '[]');
      setSaved(list.includes(slug));
    } catch { /* ignore */ }
  }, [slug]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list: string[] = JSON.parse(localStorage.getItem('tour-wishlist') || '[]');
      const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
      localStorage.setItem('tour-wishlist', JSON.stringify(next));
      setSaved(next.includes(slug));
    } catch { /* ignore */ }
  }, [slug]);

  return { saved, toggle };
}

function TourCardComponent({ tour, locale }: TourCardProps) {
  const t = useTranslations();
  const params = useParams();
  const currentLocale = locale || (params?.locale as string) || 'vi';
  const { saved, toggle } = useWishlist(tour.slug);

  const hasImage = tour.images && tour.images.length > 0 && tour.images[0].startsWith('http');
  const destName = tour.destination || tour.location || 'Việt Nam';

  // Memoized calculations
  const titleText = useMemo(() => getI18nText(tour.title, currentLocale), [tour.title, currentLocale]);
  const durationText = useMemo(
    () => (typeof tour.duration === 'number' ? `${tour.duration} ${t('common.days')}` : tour.duration),
    [tour.duration, t]
  );
  const discount = useMemo(
    () => (tour.originalPrice && tour.originalPrice > tour.price
      ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
      : 0),
    [tour.originalPrice, tour.price]
  );

  const slots = tour.availableSlots ?? null;
  const isLowStock = slots !== null && slots <= 5;

  const viewersCount = useMemo(
    () => tour.viewCount ?? (Math.abs(tour.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 15 + 3),
    [tour.viewCount, tour.slug]
  );

  const formattedPrice = useMemo(() => formatPrice(tour.price), [tour.price]);
  const formattedOriginalPrice = useMemo(
    () => (tour.originalPrice ? formatPrice(tour.originalPrice) : null),
    [tour.originalPrice]
  );

  return (
    <Link href={`/${currentLocale}/tours/${tour.slug}`}>
      <Card className="overflow-hidden group h-full cursor-pointer hover:-translate-y-2 transition-all duration-300 relative">
        {/* Image */}
        <div className="h-52 bg-slate-800 relative overflow-hidden">
          {hasImage ? (
            <img
              src={tour.images![0]}
              alt={titleText}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${tour.imageGradient || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-base p-4 text-center`}>
              {titleText}
            </div>
          )}

          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {/* Left — discount & low stock badges */}
            <div className="flex flex-col gap-1.5">
              {discount >= 5 && (
                <span className="bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  -{discount}%
                </span>
              )}
              {isLowStock && (
                <span className="bg-orange-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3" />
                  {t('tourCard.slotsLeft', { slots })}
                </span>
              )}
            </div>

            {/* Right — wishlist heart */}
            <button
              onClick={toggle}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                saved
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-white/90 text-slate-400 hover:text-red-500 hover:scale-110'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Bottom left — destination + rating */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
              {destName}
            </span>
            <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-slate-700 shadow-sm">
              <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              {tour.rating || 4.8}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {titleText}
            </h3>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {durationText}
              </div>
              {/* Viewers count */}
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{t('tourCard.viewersCount', { count: viewersCount })}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">{t('tourCard.from')}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-orange-500">{formattedPrice}</span>
                {formattedOriginalPrice && tour.originalPrice! > tour.price && (
                  <span className="text-xs text-slate-400 line-through">{formattedOriginalPrice}</span>
                )}
              </div>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-full border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {t('tourCard.viewDetails')}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default memo(TourCardComponent);
