'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice, formatLocalizedDate } from '@/lib/utils';
import { Users, Calendar, Zap, PhoneCall, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Tour } from '@/types';

const safeIsoDate = (dateVal: any): string => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

interface TourBookingFormProps {
  tour: {
    id?: string;
    _id?: string;
    price: number;
    departureDates?: { date: string | Date; price?: number; availableSlots?: number }[];
    [key: string]: unknown;
  };
  selectedDateFromParent?: string;
}

function TourBookingFormComponent({ tour, selectedDateFromParent }: TourBookingFormProps) {
  const t = useTranslations('tourBooking');
  const router = useRouter();
  const locale = useParams().locale as string;
  const addItem = useCartStore((state) => state.addItem);

  const [date, setDate] = useState(selectedDateFromParent || '');
  const [prevSelectedParent, setPrevSelectedParent] = useState(selectedDateFromParent);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [formError, setFormError] = useState('');

  // Sync when parent updates selected date cleanly
  if (selectedDateFromParent !== prevSelectedParent) {
    setPrevSelectedParent(selectedDateFromParent);
    if (selectedDateFromParent) {
      setDate(selectedDateFromParent);
      setFormError('');
    }
  }

  const validDepartureDates = useMemo(() => {
    return Array.isArray(tour?.departureDates)
      ? tour.departureDates.filter((dep: any) => dep && dep.date && safeIsoDate(dep.date))
      : [];
  }, [tour?.departureDates]);

  const selectedDeparture = useMemo(() => {
    return validDepartureDates.find((d) => safeIsoDate(d.date) === date);
  }, [validDepartureDates, date]);

  const basePrice = useMemo(() => {
    return selectedDeparture?.price || tour?.price || 0;
  }, [selectedDeparture?.price, tour?.price]);

  const totalPrice = useMemo(() => {
    return basePrice * adults + (basePrice * 0.7) * children;
  }, [basePrice, adults, children]);

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    if (newDate) setFormError('');
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!date) {
      setFormError(t('errSelectDate'));
      const card = document.getElementById('booking-form-card');
      if (card) card.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setFormError('');
    addItem({
      type: 'tour',
      itemData: tour as unknown as Tour,
      travelDate: date,
      guests: { adults, children },
      totalPrice,
    });

    router.push(`/${locale}/cart`);
  }, [date, addItem, tour, adults, children, totalPrice, router, locale, t]);

  return (
    <Card id="booking-form-card" className="p-6 border-slate-200 shadow-2xl rounded-3xl bg-white relative">
      {/* Header Price Section */}
      <div className="mb-5 pb-4 border-b border-slate-100 flex justify-between items-end">
        <div>
          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
            {t('pricePerGuest')}
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold text-orange-500">{formatPrice(basePrice)}</span>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {t('slotsAvailable')}
        </span>
      </div>

      <div className="space-y-4.5 mb-5">
        {/* Departure Dates Selector */}
        {validDepartureDates.length > 0 ? (
          <div>
            <label className="text-sm font-extrabold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t('selectDeparture')}</span>
            </label>
            <select
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            >
              <option value="">{t('selectDeparturePlaceholder')}</option>
              {validDepartureDates.map((dep, idx) => {
                const dStr = safeIsoDate(dep.date);
                const formatted = formatLocalizedDate(dep.date, locale);
                const slotsNote = t('slotsRemaining', { slots: dep.availableSlots || 15 });
                return (
                  <option key={idx} value={dStr}>
                    {formatted} — {formatPrice(dep.price || tour.price)} {slotsNote}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-sm font-extrabold text-slate-800 block mb-1.5">{t('departureDate')}</label>
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
        )}

        {/* Guests count */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">{t('adultsLabel')}</label>
            <Input
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value, 10) || 1))}
              icon={<Users className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">{t('childrenLabel')}</label>
            <Input
              type="number"
              min={0}
              value={children}
              onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value, 10) || 0))}
              icon={<Users className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
        </div>
      </div>

      {/* Total Amount summary */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5 flex justify-between items-center">
        <div>
          <span className="text-xs font-extrabold text-slate-800 block">{t('subtotalLabel')}</span>
          <span className="text-xs text-slate-400">{t('taxFeeIncluded')}</span>
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">{formatPrice(totalPrice)}</span>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main High-Impact CTA Button */}
      <button
        onClick={handleAddToCart}
        className="w-full h-14 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mb-3"
      >
        <Zap className="w-5 h-5 fill-white" />
        <span>{t('bookNowBtn')}</span>
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
