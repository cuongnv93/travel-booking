'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Flame, ArrowRight, Zap, Star } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

interface FlashSaleItem {
  _id?: string;
  id?: string;
  slug?: string;
  itemType?: 'tour' | 'hotel';
  title?: Record<string, string> | string;
  name?: Record<string, string> | string;
  images?: string[];
  destination?: string;
  location?: string;
  rating?: number;
  originalPrice?: number;
  price?: number;
  pricePerNight?: number;
  flashSalePrice?: number;
  salePrice?: number;
  isFlashSale?: boolean;
  flashSaleEnd?: string | Date;
}

const fetchFlashSaleItems = async (): Promise<FlashSaleItem[]> => {
  try {
    const res = await api.get<FlashSaleItem[] | { data?: FlashSaleItem[] }>('/flash-sale');
    const raw = res as unknown as FlashSaleItem[] | { data?: FlashSaleItem[] };
    return Array.isArray(raw) ? raw : raw?.data || [];
  } catch {
    return [];
  }
};

const DEFAULT_FLASH_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

const CountdownTimer = memo(function CountdownTimer({ targetDate }: { targetDate: string | Date }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(
    null
  );

  useEffect(() => {
    const targetMs = new Date(targetDate).getTime();
    if (Number.isNaN(targetMs)) {
      setTimeLeft(null);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const calculateTime = () => {
      const difference = targetMs - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (intervalId) clearInterval(intervalId);
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    intervalId = setInterval(calculateTime, 1000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1 text-xs font-mono font-bold" aria-hidden="true">
        <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
          --
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
          --
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
          --
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs font-mono font-bold">
      {timeLeft.days > 0 && (
        <>
          <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md text-center border border-amber-500/30">
            {timeLeft.days}d
          </span>
          <span className="text-white font-bold">:</span>
        </>
      )}
      <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
        {String(timeLeft.hours).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
        {String(timeLeft.minutes).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
});

interface FlashSaleCardProps {
  item: FlashSaleItem;
  idx: number;
  locale: string;
  itemTimerLabel: string;
  buyBtnLabel: string;
  hotTourLabel: string;
  hotelTypeLabel: string;
}

const FlashSaleCard = memo(function FlashSaleCard({
  item,
  idx,
  locale,
  itemTimerLabel,
  buyBtnLabel,
  hotTourLabel,
  hotelTypeLabel,
}: FlashSaleCardProps) {
  const isTour = item.itemType ? item.itemType === 'tour' : Boolean(item.destination);
  const identifier = item.slug || item._id || item.id;
  const targetLink = identifier
    ? isTour
      ? `/${locale}/tours/${identifier}`
      : `/${locale}/hotels/${identifier}`
    : isTour
    ? `/${locale}/tours`
    : `/${locale}/hotels`;
  const imgSrc = item.images && item.images.length > 0 ? item.images[0] : DEFAULT_FLASH_IMG;

  const title = getI18nText(item.title || item.name, locale) || (isTour ? hotTourLabel : hotelTypeLabel);
  const origPrice = Number(item.originalPrice || item.price || item.pricePerNight) || 0;
  const rawSalePrice = Number(item.flashSalePrice || item.salePrice);
  const salePrice = rawSalePrice > 0 ? rawSalePrice : Math.round(origPrice * 0.7);
  const discountPct =
    origPrice > salePrice && origPrice > 0 ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: idx * 0.1 }}
      className="group h-full"
    >
      <Link href={targetLink} className="block h-full">
        <div className="bg-slate-900/90 border border-rose-500/20 hover:border-rose-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-600/20 transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1">
          {/* Image Header */}
          <div className="w-full aspect-[16/10] bg-slate-800/40 relative overflow-hidden shrink-0">
            <SmartImage
              src={imgSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fallbackSrc={DEFAULT_FLASH_IMG}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {discountPct > 0 && (
                <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1 uppercase">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  -{discountPct}%
                </span>
              )}
              <span className="bg-slate-900/80 backdrop-blur text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                {isTour ? item.destination || hotTourLabel : item.location || hotelTypeLabel}
              </span>
            </div>

            {/* Rating */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {item.rating || 4.9}
            </div>

            {/* Item Countdown Pill */}
            {item.flashSaleEnd && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur p-2 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> {itemTimerLabel}
                </span>
                <CountdownTimer targetDate={item.flashSaleEnd} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                {title}
              </h3>
            </div>

            {/* Pricing & CTA */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div>
                {origPrice > salePrice && (
                  <span className="text-[11px] text-slate-400 block line-through">
                    {formatPrice(origPrice)}
                  </span>
                )}
                <span className="text-xl font-extrabold text-amber-400 drop-shadow-sm">
                  {formatPrice(salePrice)}
                </span>
              </div>

              <span className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all group-hover:scale-105 shrink-0">
                {buyBtnLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default function FlashSaleSection() {
  const locale = useLocale();
  const t = useTranslations('flashSale');
  const tCommon = useTranslations('common');
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['flash-sale-items'],
    queryFn: fetchFlashSaleItems,
    staleTime: 60000,
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });

  // Filter out any items whose sale has expired client-side
  const activeItems = useMemo(() => {
    if (now === null) return [];
    return items.filter((item) => {
      if (!item.isFlashSale || !item.flashSaleEnd) return false;
      const endTime = new Date(item.flashSaleEnd).getTime();
      return !Number.isNaN(endTime) && endTime > now;
    });
  }, [items, now]);

  if (isLoading || now === null) {
    return (
      <section className="container mx-auto px-4 md:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 p-6 md:p-10 border border-rose-500/30 shadow-2xl shadow-rose-950/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-rose-500/20 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-900/60 animate-pulse" />
              <div className="space-y-2">
                <div className="h-7 w-48 sm:w-64 bg-rose-900/40 rounded-lg animate-pulse" />
                <div className="h-4 w-36 sm:w-72 bg-rose-900/20 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[380px] bg-slate-800/40 rounded-2xl border border-rose-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeItems.length === 0) {
    return null;
  }

  const itemTimerLabel = t('itemTimerLabel');
  const buyBtnLabel = t('buyBtn');
  const hotTourLabel = tCommon('hotTour');
  const hotelTypeLabel = tCommon('hotelType');

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 p-6 md:p-10 border border-rose-500/30 shadow-2xl shadow-rose-950/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10 border-b border-rose-500/20 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 animate-pulse shrink-0">
              <Flame className="w-7 h-7 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">
                  {t('title')}
                </h2>
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {t('hotBadge')}
                </span>
              </div>
              <p className="text-rose-200/80 text-xs md:text-sm mt-1 font-medium">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {activeItems.map((item, idx) => (
            <FlashSaleCard
              key={item._id || item.id || item.slug || idx}
              item={item}
              idx={idx}
              locale={locale}
              itemTimerLabel={itemTimerLabel}
              buyBtnLabel={buyBtnLabel}
              hotTourLabel={hotTourLabel}
              hotelTypeLabel={hotelTypeLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
