'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Flame, Clock, Tag, ArrowRight, Zap, Star } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const fetchFlashSaleItems = async () => {
  try {
    const res: any = await api.get('/flash-sale');
    return Array.isArray(res) ? res : (res?.data || []);
  } catch (err) {
    return [];
  }
};

function CountdownTimer({ targetDate }: { targetDate: string | Date }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1 text-xs font-mono font-bold">
      <span className="bg-slate-900 text-amber-400 px-2 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
        {String(timeLeft.hours).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-slate-900 text-amber-400 px-2 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
        {String(timeLeft.minutes).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-slate-900 text-amber-400 px-2 py-1 rounded-md min-w-[24px] text-center border border-amber-500/30">
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function FlashSaleSection() {
  const locale = (useParams()?.locale as string) || 'vi';
  const t = useTranslations('flashSale');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['flash-sale-items'],
    queryFn: fetchFlashSaleItems,
    refetchInterval: 10000,
  });

  // Filter out any items whose sale has expired client-side as safety check
  const activeItems = items.filter((item: any) => {
    if (!item.isFlashSale || !item.flashSaleEnd) return false;
    return new Date(item.flashSaleEnd).getTime() > Date.now();
  });

  // HIDE SECTION COMPLETELY IF NO ACTIVE FLASH SALE ITEMS
  if (isLoading || activeItems.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 p-6 md:p-10 border border-rose-500/30 shadow-2xl shadow-rose-950/40">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10 border-b border-rose-500/20 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 animate-pulse">
              <Flame className="w-7 h-7 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">
                  {t('title', { fallback: '🔥 FLASH SALE GIỜ VÀNG' })}
                </h2>
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-bounce">
                  {t('hotBadge', { fallback: 'GIẢM ĐẾN 50%' })}
                </span>
              </div>
              <p className="text-rose-200/80 text-xs md:text-sm mt-1 font-medium">
                {t('subtitle', { fallback: 'Cơ hội săn vé & phòng ưu đãi cực sốc. Số lượng giới hạn!' })}
              </p>
            </div>
          </div>
        </div>

        {/* Flash Sale Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {activeItems.map((item: any, idx: number) => {
            const isTour = item.itemType === 'tour' || !!item.destination;
            const targetLink = isTour ? `/${locale}/tours/${item.slug}` : `/${locale}/hotels/${item.slug}`;
            const image = item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800';
            const title = getI18nText(item.title || item.name, locale);
            
            const origPrice = item.originalPrice || item.price || item.pricePerNight;
            const salePrice = item.flashSalePrice || item.salePrice || Math.round(origPrice * 0.7);
            const discountPct = origPrice > salePrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 30;

            return (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group"
              >
                <Link href={targetLink}>
                  <div className="bg-slate-900/90 border border-rose-500/20 hover:border-rose-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-600/20 transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1">
                    {/* Image Header */}
                    <div className="h-48 bg-slate-800 relative overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1 uppercase">
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          -{discountPct}%
                        </span>
                        <span className="bg-slate-900/80 backdrop-blur text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                          {isTour ? (item.destination || 'Tour Hot') : (item.location || 'Khách Sạn')}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {item.rating || 4.9}
                      </div>

                      {/* Item Countdown Pill */}
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur p-2 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs">
                        <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-500" /> {t('itemTimerLabel', { fallback: 'Hết hạn:' })}
                        </span>
                        <CountdownTimer targetDate={item.flashSaleEnd} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h3>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 block line-through">
                            {formatPrice(origPrice)}
                          </span>
                          <span className="text-xl font-extrabold text-amber-400 drop-shadow-sm">
                            {formatPrice(salePrice)}
                          </span>
                        </div>

                        <span className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all group-hover:scale-105">
                          {t('buyBtn', { fallback: 'Săn Deal' })}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
