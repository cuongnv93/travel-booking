'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import TourBookingForm from '@/components/tours/TourBookingForm';
import TourCard from '@/components/tours/TourCard';
import SmartImage from '@/components/ui/SmartImage';
import api from '@/lib/api';
import {
  Star, Clock, MapPin, CheckCircle2, UserCheck, ShieldCheck,
  Calendar, Sparkles, AlertCircle, Compass, Info, Flame, Zap,
  Heart, Share2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getI18nText, formatPrice, formatLocalizedDate } from '@/lib/utils';
import { useTourDefaultPolicies } from '@/hooks/useSettings';
import { toast } from '@/stores/toastStore';

const FALLBACK_TOUR_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';
const WISHLIST_EVENT = 'tour-wishlist-updated';

const DETAIL_UI_LABELS: Record<string, { save: string; saved: string; share: string; soldOut: string; flashSale: string; prevPhoto: string; nextPhoto: string }> = {
  vi: { save: 'Yêu thích', saved: 'Đã lưu', share: 'Chia sẻ', soldOut: 'Hết chỗ', flashSale: 'Flash Sale', prevPhoto: 'Ảnh trước', nextPhoto: 'Ảnh sau' },
  en: { save: 'Save', saved: 'Saved', share: 'Share', soldOut: 'Sold out', flashSale: 'Flash Sale', prevPhoto: 'Previous photo', nextPhoto: 'Next photo' },
  zh: { save: '收藏', saved: '已收藏', share: '分享', soldOut: '已满员', flashSale: '限时特惠', prevPhoto: '上一张', nextPhoto: '下一张' },
  ko: { save: '찜하기', saved: '저장됨', share: '공유', soldOut: '마감', flashSale: '플래시 세일', prevPhoto: '이전 사진', nextPhoto: '다음 사진' },
  ja: { save: 'お気に入り', saved: '保存済み', share: '共有', soldOut: '満席', flashSale: 'フラッシュセール', prevPhoto: '前の写真', nextPhoto: '次の写真' },
};

const safeIsoDate = (dateVal: any): string => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const fetchFeaturedTours = async () => {
  try {
    const res: any = await api.get('/tours?isFeatured=true&limit=8');
    const featured = Array.isArray(res) ? res : (res?.tours || res?.data || []);
    if (featured.length >= 5) return featured;

    const fallbackRes: any = await api.get('/tours?limit=8');
    const allTours = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes?.tours || fallbackRes?.data || []);
    const seen = new Set(featured.map((t: any) => t._id || t.id || t.slug));
    return [...featured, ...allTours.filter((t: any) => !seen.has(t._id || t.id || t.slug))];
  } catch {
    return [];
  }
};

export default function TourDetailClient({
  tour,
  locale,
}: {
  tour: any;
  locale: string;
}) {
  const t = useTranslations('tourDetail');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const uiText = DETAIL_UI_LABELS[locale] || DETAIL_UI_LABELS.vi;

  const [activeImg, setActiveImg] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [initialGuests, setInitialGuests] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  const { data: defaultPolicies } = useTourDefaultPolicies();

  // Hydrate wishlist, flash sale window, and URL query hints safely on client
  useEffect(() => {
    if (tour?.slug) {
      const syncWishlist = () => {
        try {
          const raw = JSON.parse(localStorage.getItem('tour-wishlist') || '[]');
          setSaved(Array.isArray(raw) && raw.includes(tour.slug));
        } catch {
          setSaved(false);
        }
      };
      syncWishlist();
      window.addEventListener(WISHLIST_EVENT, syncWishlist);
      window.addEventListener('storage', syncWishlist);

      if (tour.isFlashSale && tour.flashSalePrice) {
        const endMs = tour.flashSaleEnd ? new Date(tour.flashSaleEnd).getTime() : null;
        setIsFlashSaleActive(!endMs || (!Number.isNaN(endMs) && endMs > Date.now()));
      }

      try {
        const sp = new URLSearchParams(window.location.search);
        const qDate = sp.get('date');
        if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
          setSelectedDate(qDate);
        }
        const qGuests = Number(sp.get('guests'));
        if (Number.isFinite(qGuests) && qGuests >= 1) {
          setInitialGuests(Math.floor(qGuests));
        }
      } catch { /* ignore */ }

      return () => {
        window.removeEventListener(WISHLIST_EVENT, syncWishlist);
        window.removeEventListener('storage', syncWishlist);
      };
    }
  }, [tour?.slug, tour?.isFlashSale, tour?.flashSalePrice, tour?.flashSaleEnd]);

  const toggleWishlist = useCallback(() => {
    if (!tour?.slug) return;
    try {
      const raw = JSON.parse(localStorage.getItem('tour-wishlist') || '[]');
      const list: string[] = Array.isArray(raw) ? raw : [];
      const isAdding = !list.includes(tour.slug);
      const next = isAdding ? [...list, tour.slug] : list.filter((s) => s !== tour.slug);
      localStorage.setItem('tour-wishlist', JSON.stringify(next));
      setSaved(isAdding);
      window.dispatchEvent(new Event(WISHLIST_EVENT));
      if (isAdding) {
        toast.success(tCommon('wishlistAdded'));
      } else {
        toast.info(tCommon('wishlistRemoved'));
      }
    } catch { /* ignore */ }
  }, [tour?.slug, tCommon]);

  const title = useMemo(() => getI18nText(tour?.title, locale), [tour?.title, locale]);
  const description = useMemo(() => getI18nText(tour?.description, locale), [tour?.description, locale]);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success(tCommon('copied'));
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(tCommon('copied'));
      } catch { /* user cancelled share */ }
    }
  }, [title, tCommon]);

  const inclusionsList = useMemo(() => {
    const src = Array.isArray(tour?.inclusions) && tour.inclusions.length > 0
      ? tour.inclusions
      : (defaultPolicies?.inclusions || []);
    return src.filter(Boolean);
  }, [tour?.inclusions, defaultPolicies?.inclusions]);

  const exclusionsList = useMemo(() => {
    const src = Array.isArray(tour?.exclusions) && tour.exclusions.length > 0
      ? tour.exclusions
      : (defaultPolicies?.exclusions || []);
    return src.filter(Boolean);
  }, [tour?.exclusions, defaultPolicies?.exclusions]);

  const importantNotesList = useMemo(() => {
    const src = Array.isArray(tour?.importantNotes) && tour.importantNotes.length > 0
      ? tour.importantNotes
      : (defaultPolicies?.importantNotes || []);
    return src.filter(Boolean);
  }, [tour?.importantNotes, defaultPolicies?.importantNotes]);

  const durationText = useMemo(
    () => (typeof tour?.duration === 'number' ? `${tour.duration} ${tCommon('days')}` : (tour?.duration || `3 ${tCommon('days')}`)),
    [tour?.duration, tCommon]
  );
  const destination = useMemo(() => tour?.destination || tour?.location || 'Việt Nam', [tour?.destination, tour?.location]);
  const images = useMemo(
    () => (Array.isArray(tour?.images) && tour.images.length > 0 ? tour.images.filter(Boolean) : [FALLBACK_TOUR_IMG]),
    [tour?.images]
  );

  const validDepartureDates = useMemo(
    () => (Array.isArray(tour?.departureDates)
      ? tour.departureDates.filter((dep: any) => dep && dep.date && safeIsoDate(dep.date))
      : []),
    [tour?.departureDates]
  );

  const effectiveBasePrice = useMemo(() => {
    const base = Number(tour?.price || 0);
    if (isFlashSaleActive && tour?.flashSalePrice) {
      return Math.min(base, Number(tour.flashSalePrice));
    }
    return base;
  }, [tour?.price, isFlashSaleActive, tour?.flashSalePrice]);

  const { data: allFeatured = [] } = useQuery({
    queryKey: ['featured-tours-related'],
    queryFn: fetchFeaturedTours,
    staleTime: 60000,
  });

  const otherTours = useMemo(
    () => allFeatured
      .filter((tItem: any) => tItem.slug !== tour.slug && tItem._id !== tour._id)
      .slice(0, 4),
    [allFeatured, tour.slug, tour._id]
  );

  const safeActiveImg = activeImg < images.length ? activeImg : 0;

  return (
    <article className="container mx-auto px-4 pt-6 pb-24 md:pb-8 mt-16 md:mt-20">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap">
        <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">{tNav('home')}</Link>
        <span>/</span>
        <Link href={`/${locale}/tours`} className="hover:text-blue-600 transition-colors">{tNav('tours')}</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[240px] sm:max-w-md">{title}</span>
      </nav>

      {/* Header Title Section */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-blue-600 text-white px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              📍 {destination}
            </span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-extrabold text-slate-900">{tour?.rating || 4.8}</span>
              <span className="text-slate-500">({t('reviewsCount', { count: tour?.reviewCount ?? 124 })})</span>
            </div>
            {isFlashSaleActive && (
              <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-white" /> {uiText.flashSale}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleWishlist}
              aria-pressed={saved}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                saved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{saved ? uiText.saved : uiText.save}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{uiText.share}</span>
            </button>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">{title}</h1>
      </header>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-10 min-w-0">
          {/* Photo Gallery Banner */}
          <div className="space-y-3">
            <div className="h-[260px] sm:h-[360px] md:h-[420px] bg-slate-100 rounded-3xl overflow-hidden shadow-lg relative group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeActiveImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full relative"
                >
                  <SmartImage
                    src={images[safeActiveImg] || FALLBACK_TOUR_IMG}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                    fallbackSrc={FALLBACK_TOUR_IMG}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImg((prev) => (prev - 1 + images.length) % images.length)}
                    aria-label={uiText.prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImg((prev) => (prev + 1) % images.length)}
                    aria-label={uiText.nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-xl border border-white/20 z-10 pointer-events-none">
                {t('photosCount', { current: safeActiveImg + 1, total: images.length })}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImg(idx)}
                    aria-label={`${title} ${idx + 1}`}
                    className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      safeActiveImg === idx ? 'border-blue-600 scale-105 shadow-sm opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <SmartImage
                      src={img}
                      alt={`${title} - ${idx + 1}`}
                      fill
                      sizes="96px"
                      fallbackSrc={FALLBACK_TOUR_IMG}
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-y border-slate-200">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">{t('duration')}</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate block">{durationText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">{t('destination')}</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate block">{destination}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">{t('groupSize')}</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate block">{tour?.maxGuests ?? 20} {t('peopleUnit')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">{t('insurance')}</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate block">{t('included')}</span>
              </div>
            </div>
          </div>

          {/* Departure Schedule Table */}
          {validDepartureDates.length > 0 && (
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{t('recentSchedule')}</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[480px]">
                  <thead className="text-slate-500 font-bold border-b border-blue-200/60 pb-2.5">
                    <tr>
                      <th className="pb-3">{t('colDate')}</th>
                      <th className="pb-3">{t('colPrice')}</th>
                      <th className="pb-3">{t('colStatus')}</th>
                      <th className="pb-3 text-right">{t('colAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100 text-slate-700">
                    {validDepartureDates.map((dep: any, idx: number) => {
                      const dStr = safeIsoDate(dep.date);
                      const formatted = formatLocalizedDate(dep.date, locale);
                      const isSelected = selectedDate === dStr;
                      const slots = typeof dep.availableSlots === 'number' ? dep.availableSlots : 15;
                      const isSoldOut = slots <= 0;
                      const rawDepPrice = dep.price ?? tour.price ?? 0;
                      const depEffectivePrice = isFlashSaleActive && tour?.flashSalePrice
                        ? Math.min(Number(rawDepPrice), Number(tour.flashSalePrice))
                        : Number(rawDepPrice);

                      return (
                        <tr key={idx} className="hover:bg-blue-100/40 transition-colors">
                          <td className="py-3 font-bold text-slate-900 text-sm">{formatted}</td>
                          <td className="py-3 font-extrabold text-orange-600 text-sm sm:text-base">{formatPrice(depEffectivePrice)}</td>
                          <td className="py-3">
                            {isSoldOut ? (
                              <span className="bg-slate-200 text-slate-600 text-xs font-extrabold px-3 py-1 rounded-md">
                                {uiText.soldOut}
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-md">
                                {t('slotsLeft', { slots })}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              disabled={isSoldOut}
                              onClick={() => setSelectedDate(dStr)}
                              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                isSoldOut
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-emerald-600 text-white shadow-xs cursor-pointer'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                              }`}
                            >
                              {isSelected ? t('selectedBtn') : t('selectDateBtn')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 1: Highlights */}
          <section className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 fill-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('highlightsTitle')}
              </h2>
            </div>

            <p className="text-slate-700 leading-relaxed text-sm sm:text-base bg-slate-50 p-5 rounded-2xl border border-slate-100/80">
              {description}
            </p>

            {Array.isArray(tour?.highlights) && tour.highlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {tour.highlights.filter(Boolean).map((h: any, i: number) => {
                  const text = getI18nText(h, locale);
                  if (!text) return null;
                  return (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 text-slate-800 font-bold text-sm border border-blue-100/80 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Itinerary */}
          <section className="space-y-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('itineraryTitle', { days: Array.isArray(tour?.itinerary) ? tour.itinerary.length : 0 })}
              </h2>
            </div>

            {Array.isArray(tour?.itinerary) && tour.itinerary.length > 0 ? (
              <div className="space-y-6">
                {tour.itinerary.filter(Boolean).map((day: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {i + 1}
                      </div>
                      {i !== tour.itinerary.length - 1 && <div className="w-0.5 flex-1 min-h-4 bg-blue-100 mt-2" />}
                    </div>
                    <div className="pb-4 flex-1 bg-slate-50/90 p-5 sm:p-6 rounded-2xl border border-slate-200/60 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{getI18nText(day?.title, locale)}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{getI18nText(day?.description, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                {t('itineraryContactNote')}
              </p>
            )}
          </section>

          {/* Section 3: Notes & Inclusions */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('importantNotesTitle')}
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-slate-700">
              {inclusionsList.length > 0 && (
                <div>
                  <h3 className="font-extrabold text-blue-700 text-base mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" /> {t('inclusionsTitle')}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 list-disc pl-5 text-slate-700">
                    {inclusionsList.map((item: any, i: number) => (
                      <li key={i}>{typeof item === 'object' ? getI18nText(item, locale) : String(item)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {exclusionsList.length > 0 && (
                <div className="pt-4 border-t border-slate-200/60">
                  <h3 className="font-extrabold text-red-600 text-base mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" /> {t('exclusionsTitle')}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 list-disc pl-5 text-slate-700">
                    {exclusionsList.map((item: any, i: number) => (
                      <li key={i}>{typeof item === 'object' ? getI18nText(item, locale) : String(item)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importantNotesList.length > 0 && (
                <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70">
                  <h3 className="font-extrabold text-amber-900 text-sm mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600" /> {t('importantNotesTitle')}
                  </h3>
                  <div className="text-slate-700 leading-relaxed text-xs sm:text-sm space-y-1">
                    {importantNotesList.map((note: any, i: number) => (
                      <div key={i}>• {typeof note === 'object' ? getI18nText(note, locale) : String(note)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky on desktop only */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 z-20">
          <TourBookingForm
            tour={tour}
            selectedDateFromParent={selectedDate}
            initialGuests={initialGuests}
          />
        </aside>
      </div>

      {/* Section 4: Related Tours */}
      {otherTours.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-blue-600 uppercase tracking-widest mb-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{t('relatedTours')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('relatedTours')}
              </h2>
            </div>
            <Link href={`/${locale}/tours`} className="text-xs sm:text-sm text-blue-600 font-bold hover:underline">
              {t('viewAllTours')} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherTours.map((item: any, idx: number) => (
              <motion.div
                key={item.slug || item._id || idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.35,
                  delay: Math.min((idx % 4) * 0.06, 0.18),
                  ease: 'easeOut',
                }}
              >
                <TourCard tour={item} locale={locale} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Booking Bar (z-40 & pr-20 so FloatingChat at z-50 bottom-right never covers CTA) */}
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 pl-4 pr-20 flex items-center justify-between shadow-2xl md:hidden"
      >
        <div>
          <span className="text-xs text-slate-500 block font-bold uppercase">{tCommon('from')}</span>
          <span className="text-xl font-extrabold text-orange-600">{formatPrice(effectiveBasePrice)}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('booking-form-card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" /> {t('bookNowBtn')}
        </button>
      </motion.div>
    </article>
  );
}
