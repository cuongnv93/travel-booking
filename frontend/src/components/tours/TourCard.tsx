'use client';

import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { Star, Clock, Tag, Heart, Users, Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { I18nText } from '@/types';
import { toast } from '@/stores/toastStore';

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
    isFlashSale?: boolean;
    flashSalePrice?: number;
    flashSaleEnd?: string | Date;
    availableSlots?: number;
    totalSlots?: number;
    viewCount?: number;
    [key: string]: unknown;
  };
  locale?: string;
  queryString?: string;
}

const WISHLIST_EVENT = 'tour-wishlist-updated';
const FALLBACK_TOUR_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

// Persist wishlist in localStorage with cross-card synchronization
function useWishlist(slug: string, addedText?: string, removedText?: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const syncSaved = () => {
      try {
        const list: string[] = JSON.parse(localStorage.getItem('tour-wishlist') || '[]');
        setSaved(Array.isArray(list) && list.includes(slug));
      } catch {
        setSaved(false);
      }
    };
    syncSaved();
    window.addEventListener(WISHLIST_EVENT, syncSaved);
    window.addEventListener('storage', syncSaved);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, syncSaved);
      window.removeEventListener('storage', syncSaved);
    };
  }, [slug]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!slug) return;
    try {
      const raw = JSON.parse(localStorage.getItem('tour-wishlist') || '[]');
      const list: string[] = Array.isArray(raw) ? raw : [];
      const isAdding = !list.includes(slug);
      const next = isAdding ? [...list, slug] : list.filter((s) => s !== slug);
      localStorage.setItem('tour-wishlist', JSON.stringify(next));
      setSaved(isAdding);
      window.dispatchEvent(new Event(WISHLIST_EVENT));
      if (isAdding) {
        toast.success(addedText || 'Added to wishlist!');
      } else {
        toast.info(removedText || 'Removed from wishlist.');
      }
    } catch { /* ignore */ }
  }, [slug, addedText, removedText]);

  return { saved, toggle };
}

function TourCardComponent({ tour, locale, queryString }: TourCardProps) {
  const t = useTranslations();
  const activeLocale = useLocale();
  const currentLocale = locale || activeLocale || 'vi';
  const { saved, toggle } = useWishlist(tour.slug, t('common.wishlistAdded'), t('common.wishlistRemoved'));
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  useEffect(() => {
    if (!tour.isFlashSale || !tour.flashSalePrice) {
      setIsFlashSaleActive(false);
      return;
    }
    const endMs = tour.flashSaleEnd ? new Date(tour.flashSaleEnd).getTime() : null;
    setIsFlashSaleActive(!endMs || (!Number.isNaN(endMs) && endMs > Date.now()));
  }, [tour.isFlashSale, tour.flashSalePrice, tour.flashSaleEnd]);

  const imageSource = tour.images && tour.images.length > 0 ? tour.images[0] : '';
  const hasHttpImage = Boolean(imageSource && imageSource.startsWith('http'));
  const destName = tour.destination || tour.location || 'Việt Nam';
  const targetHref = `/${currentLocale}/tours/${tour.slug}${queryString ? `?${queryString}` : ''}`;

  const titleText = useMemo(() => getI18nText(tour.title, currentLocale), [tour.title, currentLocale]);
  const durationText = useMemo(
    () => (typeof tour.duration === 'number' ? `${tour.duration} ${t('common.days')}` : (tour.duration || '')),
    [tour.duration, t]
  );

  const effectivePrice = useMemo(() => {
    const base = Number(tour.price || 0);
    if (isFlashSaleActive && tour.flashSalePrice) {
      return Math.min(base, Number(tour.flashSalePrice));
    }
    return base;
  }, [tour.price, isFlashSaleActive, tour.flashSalePrice]);

  const strikePrice = useMemo(() => {
    const orig = Number(tour.originalPrice || 0);
    const base = Number(tour.price || 0);
    if (isFlashSaleActive && effectivePrice < Math.max(orig, base)) {
      return Math.max(orig, base);
    }
    return orig > effectivePrice ? orig : 0;
  }, [tour.originalPrice, tour.price, isFlashSaleActive, effectivePrice]);

  const discount = useMemo(
    () => (strikePrice > effectivePrice && strikePrice > 0
      ? Math.round(((strikePrice - effectivePrice) / strikePrice) * 100)
      : 0),
    [strikePrice, effectivePrice]
  );

  const slots = tour.availableSlots ?? null;
  const isLowStock = slots !== null && slots <= 5 && slots > 0;

  const viewersCount = useMemo(
    () => tour.viewCount ?? (Math.abs((tour.slug || 'tour').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 15 + 3),
    [tour.viewCount, tour.slug]
  );

  const formattedPrice = useMemo(() => formatPrice(effectivePrice), [effectivePrice]);
  const formattedOriginalPrice = useMemo(
    () => (strikePrice > 0 ? formatPrice(strikePrice) : null),
    [strikePrice]
  );

  return (
    <Card className="overflow-hidden group h-full hover:-translate-y-2 transition-all duration-300 relative flex flex-col justify-between">
      {/* Image Container (Link is separate from wishlist button so interactive elements are not nested) */}
      <div className="w-full aspect-[16/10] bg-slate-100 relative overflow-hidden shrink-0">
        <Link href={targetHref} className="block w-full h-full">
          {hasHttpImage || imageSource ? (
            <SmartImage
              src={imageSource || FALLBACK_TOUR_IMG}
              alt={titleText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              fallbackSrc={FALLBACK_TOUR_IMG}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${tour.imageGradient || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-base p-4 text-center`}>
              {titleText}
            </div>
          )}
        </Link>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discount >= 5 && (
            <span className="bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 w-fit">
              <Tag className="w-3 h-3" />
              -{discount}%
            </span>
          )}
          {isLowStock && (
            <span className="bg-orange-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse w-fit">
              <Flame className="w-3 h-3" />
              {t('tourCard.slotsLeft', { slots })}
            </span>
          )}
        </div>

        {/* Wishlist Heart (Sibling of Link, not nested inside <a>) */}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={saved}
          aria-label="Wishlist"
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
            saved
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-slate-400 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
        </button>

        {/* Bottom left — destination + rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10 pointer-events-none">
          <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider truncate max-w-[65%]">
            {destName}
          </span>
          <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-slate-700 shadow-sm shrink-0">
            <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            {tour.rating || 4.8}
          </div>
        </div>
      </div>

      {/* Content */}
      <Link href={targetHref} className="p-4 sm:p-5 flex-1 flex flex-col justify-between cursor-pointer">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {titleText}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 gap-2">
            <div className="flex items-center gap-1 truncate">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{durationText}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <Users className="w-3.5 h-3.5" />
              <span>{t('tourCard.viewersCount', { count: viewersCount })}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 mb-0.5">{t('tourCard.from')}</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg font-bold text-orange-500">{formattedPrice}</span>
              {formattedOriginalPrice && (
                <span className="text-xs text-slate-400 line-through">{formattedOriginalPrice}</span>
              )}
            </div>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-full border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            {t('tourCard.viewDetails')}
          </span>
        </div>
      </Link>
    </Card>
  );
}

export default memo(TourCardComponent);
