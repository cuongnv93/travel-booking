'use client';

import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice, formatLocalizedDate } from '@/lib/utils';
import {
  Users, Calendar, Zap, PhoneCall, ShieldCheck, CheckCircle,
  AlertCircle, ShoppingCart, Minus, Plus
} from 'lucide-react';
import { Tour } from '@/types';
import { toast } from '@/stores/toastStore';

const BOOKING_EXTRA_LABELS: Record<string, {
  addToCartBtn: string;
  errPastDate: string;
  errSoldOut: string;
  errMaxGuests: string;
  soldOutTag: string;
  maxHint: string;
}> = {
  vi: {
    addToCartBtn: 'Thêm vào giỏ hàng',
    errPastDate: 'Ngày khởi hành không được ở trong quá khứ.',
    errSoldOut: 'Đợt khởi hành này đã hết chỗ, vui lòng chọn ngày khác.',
    errMaxGuests: 'Tổng số khách vượt quá số chỗ còn lại ({max} khách).',
    soldOutTag: '(Hết chỗ)',
    maxHint: 'Tối đa {max} khách',
  },
  en: {
    addToCartBtn: 'Add to Cart',
    errPastDate: 'Departure date cannot be in the past.',
    errSoldOut: 'This departure date is sold out, please pick another date.',
    errMaxGuests: 'Total guests exceed remaining capacity ({max} guests).',
    soldOutTag: '(Sold out)',
    maxHint: 'Max {max} guests',
  },
  zh: {
    addToCartBtn: '加入购物车',
    errPastDate: '出发日期不能早于今天。',
    errSoldOut: '该出发日期已满员，请选择其他日期。',
    errMaxGuests: '总人数超过剩余名额（最多 {max} 人）。',
    soldOutTag: '（已满）',
    maxHint: '最多 {max} 人',
  },
  ko: {
    addToCartBtn: '장바구니에 담기',
    errPastDate: '출발일은 과거 날짜일 수 없습니다.',
    errSoldOut: '해당 출발일은 마감되었습니다. 다른 날짜를 선택해주세요.',
    errMaxGuests: '총 인원이 잔여 좌석({max}명)을 초과합니다.',
    soldOutTag: '(마감)',
    maxHint: '최대 {max}명',
  },
  ja: {
    addToCartBtn: 'カートに追加',
    errPastDate: '出発日に過去の日付は指定できません。',
    errSoldOut: 'この出発日は満席です。別の日付をお選びください。',
    errMaxGuests: '合計人数が残り枠（最大 {max} 名）を超えています。',
    soldOutTag: '（満席）',
    maxHint: '最大 {max} 名',
  },
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

const getLocalTodayStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface TourBookingFormProps {
  tour: {
    id?: string;
    _id?: string;
    price: number;
    originalPrice?: number;
    maxGuests?: number;
    isFlashSale?: boolean;
    flashSalePrice?: number;
    flashSaleEnd?: string | Date;
    departureDates?: { date: string | Date; price?: number; availableSlots?: number }[];
    [key: string]: unknown;
  };
  selectedDateFromParent?: string;
  initialGuests?: number;
}

function TourBookingFormComponent({
  tour,
  selectedDateFromParent,
  initialGuests,
}: TourBookingFormProps) {
  const t = useTranslations('tourBooking');
  const router = useRouter();
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const extraLabels = BOOKING_EXTRA_LABELS[locale] || BOOKING_EXTRA_LABELS.vi;

  const [todayStr, setTodayStr] = useState('');
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const [date, setDate] = useState(selectedDateFromParent || '');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setTodayStr(getLocalTodayStr());
    if (tour?.isFlashSale && tour?.flashSalePrice) {
      const endMs = tour.flashSaleEnd ? new Date(tour.flashSaleEnd).getTime() : null;
      setIsFlashSaleActive(!endMs || (!Number.isNaN(endMs) && endMs > Date.now()));
    } else {
      setIsFlashSaleActive(false);
    }
  }, [tour?.isFlashSale, tour?.flashSalePrice, tour?.flashSaleEnd]);

  // Sync external date picker selection via useEffect
  useEffect(() => {
    if (selectedDateFromParent) {
      setDate(selectedDateFromParent);
      setFormError('');
    }
  }, [selectedDateFromParent]);

  const validDepartureDates = useMemo(() => {
    return Array.isArray(tour?.departureDates)
      ? tour.departureDates.filter((dep: any) => dep && dep.date && safeIsoDate(dep.date))
      : [];
  }, [tour?.departureDates]);

  const selectedDeparture = useMemo(() => {
    return validDepartureDates.find((d) => safeIsoDate(d.date) === date);
  }, [validDepartureDates, date]);

  const maxSlots = useMemo(() => {
    const depSlots = typeof selectedDeparture?.availableSlots === 'number'
      ? selectedDeparture.availableSlots
      : undefined;
    const tourMax = typeof tour?.maxGuests === 'number' && tour.maxGuests > 0
      ? tour.maxGuests
      : 30;
    if (depSlots !== undefined) return Math.max(0, depSlots);
    return tourMax;
  }, [selectedDeparture?.availableSlots, tour?.maxGuests]);

  // Apply initialGuests hint clamped to maxSlots
  useEffect(() => {
    if (typeof initialGuests === 'number' && initialGuests >= 1) {
      const clamped = maxSlots > 0 ? Math.min(initialGuests, maxSlots) : 1;
      setAdults(clamped);
      setChildren(0);
    }
  }, [initialGuests, maxSlots]);

  // Clamp guest counts if selected departure has fewer available slots
  useEffect(() => {
    if (maxSlots <= 0) return;
    setChildren((prevC) => {
      const maxAllowedChildren = Math.max(0, maxSlots - adults);
      return prevC > maxAllowedChildren ? maxAllowedChildren : prevC;
    });
    setAdults((prevA) => (prevA > maxSlots ? Math.max(1, maxSlots) : prevA));
  }, [maxSlots, adults]);

  const basePrice = useMemo(() => {
    const rawPrice = selectedDeparture?.price ?? tour?.price ?? 0;
    if (isFlashSaleActive && tour?.flashSalePrice) {
      return Math.min(Number(rawPrice), Number(tour.flashSalePrice));
    }
    return Number(rawPrice);
  }, [selectedDeparture?.price, tour?.price, isFlashSaleActive, tour?.flashSalePrice]);

  const strikeBasePrice = useMemo(() => {
    const orig = Number(tour?.originalPrice || 0);
    const raw = Number(selectedDeparture?.price ?? tour?.price ?? 0);
    const candidate = Math.max(orig, raw);
    return candidate > basePrice ? candidate : 0;
  }, [tour?.originalPrice, tour?.price, selectedDeparture?.price, basePrice]);

  // Child pricing matches CartClient.tsx (0.75) for strict price consistency
  const totalPrice = useMemo(() => {
    return basePrice * adults + Math.round(basePrice * 0.75) * children;
  }, [basePrice, adults, children]);

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    if (newDate) setFormError('');
  }, []);

  const handleAdultsChange = useCallback(
    (nextVal: number) => {
      const upper = maxSlots > 0 ? Math.max(1, maxSlots - children) : 1;
      const clamped = Math.min(Math.max(1, Math.floor(nextVal) || 1), upper);
      setAdults(clamped);
      setFormError('');
    },
    [maxSlots, children]
  );

  const handleChildrenChange = useCallback(
    (nextVal: number) => {
      const upper = maxSlots > 0 ? Math.max(0, maxSlots - adults) : 0;
      const clamped = Math.min(Math.max(0, Math.floor(nextVal) || 0), upper);
      setChildren(clamped);
      setFormError('');
    },
    [maxSlots, adults]
  );

  const validateAndBuildCartItem = useCallback(() => {
    if (!date) {
      setFormError(t('errSelectDate'));
      toast.warning(t('errSelectDate'));
      const card = document.getElementById('booking-form-card');
      if (card) card.scrollIntoView({ behavior: 'smooth' });
      return null;
    }

    if (validDepartureDates.length === 0 && todayStr && date < todayStr) {
      setFormError(extraLabels.errPastDate);
      toast.warning(extraLabels.errPastDate);
      return null;
    }

    if (selectedDeparture && typeof selectedDeparture.availableSlots === 'number' && selectedDeparture.availableSlots <= 0) {
      setFormError(extraLabels.errSoldOut);
      toast.warning(extraLabels.errSoldOut);
      return null;
    }

    if (maxSlots > 0 && adults + children > maxSlots) {
      const msg = extraLabels.errMaxGuests.replace('{max}', String(maxSlots));
      setFormError(msg);
      toast.warning(msg);
      return null;
    }

    setFormError('');
    return {
      type: 'tour' as const,
      // Keep itemData.price synced with the selected departure / flash-sale unit price for Cart guest +/- recalculation
      itemData: { ...tour, price: basePrice } as unknown as Tour,
      travelDate: date,
      guests: { adults, children },
      totalPrice,
    };
  }, [date, validDepartureDates.length, todayStr, selectedDeparture, maxSlots, adults, children, tour, basePrice, totalPrice, t, extraLabels]);

  const handleAddToCartOnly = useCallback(() => {
    const cartItem = validateAndBuildCartItem();
    if (!cartItem) return;
    addItem(cartItem);
    toast.success(t('addedToCart'));
  }, [validateAndBuildCartItem, addItem, t]);

  const handleBookNow = useCallback(() => {
    const cartItem = validateAndBuildCartItem();
    if (!cartItem) return;
    addItem(cartItem);
    toast.success(t('addedToCart'));
    router.push(`/${locale}/cart`);
  }, [validateAndBuildCartItem, addItem, t, router, locale]);

  return (
    <Card id="booking-form-card" className="p-6 border-slate-200 shadow-2xl rounded-3xl bg-white relative">
      {/* Header Price Section */}
      <div className="mb-5 pb-4 border-b border-slate-100 flex justify-between items-end gap-2">
        <div>
          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
            {t('pricePerGuest')}
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold text-orange-500">{formatPrice(basePrice)}</span>
            {strikeBasePrice > 0 && (
              <span className="text-sm text-slate-400 line-through">{formatPrice(strikeBasePrice)}</span>
            )}
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {t('slotsAvailable')}
        </span>
      </div>

      <div className="space-y-4 mb-5">
        {/* Departure Dates Selector */}
        {validDepartureDates.length > 0 ? (
          <div>
            <label htmlFor="tour-departure-select" className="text-sm font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t('selectDeparture')}</span>
            </label>
            <select
              id="tour-departure-select"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner cursor-pointer"
            >
              <option value="">{t('selectDeparturePlaceholder')}</option>
              {validDepartureDates.map((dep, idx) => {
                const dStr = safeIsoDate(dep.date);
                const formatted = formatLocalizedDate(dep.date, locale);
                const slots = typeof dep.availableSlots === 'number' ? dep.availableSlots : 15;
                const isSoldOut = slots <= 0;
                const rawDepPrice = dep.price ?? tour.price ?? 0;
                const depPrice = isFlashSaleActive && tour?.flashSalePrice
                  ? Math.min(Number(rawDepPrice), Number(tour.flashSalePrice))
                  : Number(rawDepPrice);
                const slotsNote = isSoldOut
                  ? extraLabels.soldOutTag
                  : t('slotsRemaining', { slots });

                return (
                  <option key={idx} value={dStr} disabled={isSoldOut}>
                    {formatted} — {formatPrice(depPrice)} {slotsNote}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="tour-departure-date" className="text-sm font-extrabold text-slate-800 block mb-1.5">
              {t('departureDate')}
            </label>
            <Input
              id="tour-departure-date"
              type="date"
              value={date}
              min={todayStr || undefined}
              onChange={(e) => handleDateChange(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
        )}

        {/* Guests count with stepper controls & strict clamping */}
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tour-adults-input" className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                {t('adultsLabel')}
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden h-11">
                <button
                  type="button"
                  onClick={() => handleAdultsChange(adults - 1)}
                  disabled={adults <= 1}
                  aria-label="Decrease adults"
                  className="px-3 h-full text-slate-600 hover:bg-slate-200/70 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  id="tour-adults-input"
                  type="number"
                  min={1}
                  max={Math.max(1, maxSlots - children)}
                  value={adults}
                  onChange={(e) => handleAdultsChange(parseInt(e.target.value, 10))}
                  className="w-full text-center bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAdultsChange(adults + 1)}
                  disabled={maxSlots > 0 && adults + children >= maxSlots}
                  aria-label="Increase adults"
                  className="px-3 h-full text-slate-600 hover:bg-slate-200/70 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="tour-children-input" className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                {t('childrenLabel')}
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden h-11">
                <button
                  type="button"
                  onClick={() => handleChildrenChange(children - 1)}
                  disabled={children <= 0}
                  aria-label="Decrease children"
                  className="px-3 h-full text-slate-600 hover:bg-slate-200/70 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  id="tour-children-input"
                  type="number"
                  min={0}
                  max={Math.max(0, maxSlots - adults)}
                  value={children}
                  onChange={(e) => handleChildrenChange(parseInt(e.target.value, 10))}
                  className="w-full text-center bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleChildrenChange(children + 1)}
                  disabled={maxSlots > 0 && adults + children >= maxSlots}
                  aria-label="Increase children"
                  className="px-3 h-full text-slate-600 hover:bg-slate-200/70 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {maxSlots > 0 && (
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{extraLabels.maxHint.replace('{max}', String(maxSlots))}</span>
            </p>
          )}
        </div>
      </div>

      {/* Total Amount summary */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5 flex justify-between items-center gap-2">
        <div>
          <span className="text-xs font-extrabold text-slate-800 block">{t('subtotalLabel')}</span>
          <span className="text-xs text-slate-400">{t('taxFeeIncluded')}</span>
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">{formatPrice(totalPrice)}</span>
      </div>

      {/* Error Alert */}
      {formError && (
        <div role="alert" className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Primary Book Now CTA */}
      <button
        type="button"
        onClick={handleBookNow}
        className="w-full h-14 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mb-2.5"
      >
        <Zap className="w-5 h-5 fill-white" />
        <span>{t('bookNowBtn')}</span>
      </button>

      {/* Secondary Add to Cart CTA */}
      <button
        type="button"
        onClick={handleAddToCartOnly}
        className="w-full h-11 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-colors cursor-pointer mb-2.5"
      >
        <ShoppingCart className="w-4 h-4" />
        <span>{extraLabels.addToCartBtn}</span>
      </button>

      {/* Quick Consultation Call Button */}
      <a
        href="tel:1800646888"
        className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <PhoneCall className="w-4 h-4 text-emerald-600" />
        <span>{t('directConsult')}</span>
      </a>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
        <span className="flex items-center gap-1 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> {t('instantHold')}
        </span>
        <span>{t('securePayment')}</span>
      </div>
    </Card>
  );
}

export default memo(TourBookingFormComponent);
