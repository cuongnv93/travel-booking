'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface FlightBookingModalProps {
  selectedFlight: any;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingError: string;
  isSubmitting: boolean;
  onClose: () => void;
  onNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const FlightBookingModal = memo(function FlightBookingModal({
  selectedFlight,
  customerName,
  customerPhone,
  customerEmail,
  bookingError,
  isSubmitting,
  onClose,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onSubmit,
  t,
}: FlightBookingModalProps) {
  if (!selectedFlight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5 relative z-10"
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {t('bookingModalTitle')} {selectedFlight.flightNumber}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedFlight.from} &rarr; {selectedFlight.to} | {formatPrice(selectedFlight.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">{t('passengerName')}</label>
            <input
              required
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">{t('passengerPhone')}</label>
            <input
              required
              type="tel"
              placeholder="+1 234 567 890"
              value={customerPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">{t('passengerEmail')}</label>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              value={customerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-600 space-y-1">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>{t('totalPriceLabel')}</span>
              <span className="text-orange-600 font-bold text-sm">{formatPrice(selectedFlight.price)}</span>
            </div>
            <p className="text-xs text-slate-400">{t('luggageNote')}</p>
          </div>

          {/* Error Alert */}
          {bookingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {t('confirmBtn')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
});
