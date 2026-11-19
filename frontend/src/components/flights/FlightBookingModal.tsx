'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, AlertCircle, CheckCircle2, ShoppingBag, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getFlightUiText } from './flightUtils';

export interface FlightBookingModalProps {
  selectedFlight: any;
  locale: string;
  departDate: string;
  tripType?: string;
  returnDate?: string;
  adults: number;
  childrenCount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingError: string;
  isSubmitting: boolean;
  onClose: () => void;
  onAdultsChange: (val: number) => void;
  onChildrenChange: (val: number) => void;
  onNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onAddToCart: () => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const FlightBookingModal = memo(function FlightBookingModal({
  selectedFlight,
  locale,
  departDate,
  tripType,
  returnDate,
  adults,
  childrenCount,
  customerName,
  customerPhone,
  customerEmail,
  bookingError,
  isSubmitting,
  onClose,
  onAdultsChange,
  onChildrenChange,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onAddToCart,
  onSubmit,
  t,
}: FlightBookingModalProps) {
  if (!selectedFlight) return null;

  const basePrice = Number(selectedFlight.price) || 0;
  const childPrice = Math.round(basePrice * 0.75);
  const totalPrice = adults * basePrice + childrenCount * childPrice;
  const maxSeats = typeof selectedFlight.availableSeats === 'number' && selectedFlight.availableSeats > 0
    ? selectedFlight.availableSeats
    : 20;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flight-booking-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-100 space-y-5 relative z-10"
      >
        <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 id="flight-booking-modal-title" className="font-bold text-slate-900 text-base">
              {t('bookingModalTitle')} {selectedFlight.flightNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedFlight.airline} • {selectedFlight.from} &rarr; {selectedFlight.to} | {departDate}
              {tripType === 'roundtrip' && returnDate ? ` ↔ ${returnDate}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={getFlightUiText('closeModal', locale)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4 text-xs">
          {/* Passengers Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="flight-adults" className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{getFlightUiText('adults', locale)}</span>
              </label>
              <input
                id="flight-adults"
                type="number"
                min={1}
                max={maxSeats}
                value={adults}
                onChange={(e) => onAdultsChange(Math.max(1, Math.min(maxSeats, parseInt(e.target.value, 10) || 1)))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="flight-children" className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>{getFlightUiText('children', locale)}</span>
              </label>
              <input
                id="flight-children"
                type="number"
                min={0}
                max={Math.max(0, maxSeats - adults)}
                value={childrenCount}
                onChange={(e) =>
                  onChildrenChange(
                    Math.max(0, Math.min(Math.max(0, maxSeats - adults), parseInt(e.target.value, 10) || 0))
                  )
                }
                className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="flight-customer-name" className="font-semibold text-slate-700 block mb-1">
              {t('passengerName')}
            </label>
            <input
              id="flight-customer-name"
              required
              placeholder="Nguyen Van A"
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="flight-customer-phone" className="font-semibold text-slate-700 block mb-1">
              {t('passengerPhone')}
            </label>
            <input
              id="flight-customer-phone"
              required
              type="tel"
              placeholder="0912 345 678"
              value={customerPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="flight-customer-email" className="font-semibold text-slate-700 block mb-1">
              {t('passengerEmail')}
            </label>
            <input
              id="flight-customer-email"
              type="email"
              required
              placeholder="example@gmail.com"
              value={customerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-600 space-y-1">
            <div className="flex justify-between font-semibold text-slate-800 items-center">
              <span>{t('totalPriceLabel')}</span>
              <span className="text-orange-600 font-bold text-base">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-slate-400">{t('luggageNote')}</p>
          </div>

          {/* Error Alert */}
          {bookingError && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>{getFlightUiText('addToCartBtn', locale)}</span>
            </button>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {t('cancelBtn')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{t('confirmBtn')}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
});
