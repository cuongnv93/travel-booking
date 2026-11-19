'use client';

import { memo } from 'react';
import { Tag, CheckCircle2, ChevronRight, ShieldCheck, X, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface CartOrderSummaryProps {
  itemsCount: number;
  rawSubtotal: number;
  discount: number;
  finalTotal: number;
  couponCode: string;
  couponError: string;
  couponApplied: boolean;
  couponLoading?: boolean;
  paymentMethod: 'vietqr' | 'office';
  loading: boolean;
  bookingDisabled?: boolean;
  bookingDisabledText?: string;
  onCouponChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon?: () => void;
  onPaymentMethodChange: (method: 'vietqr' | 'office') => void;
  onCheckout: () => void;
  t: (key: string) => string;
}

export const CartOrderSummary = memo(function CartOrderSummary({
  itemsCount,
  rawSubtotal,
  discount,
  finalTotal,
  couponCode,
  couponError,
  couponApplied,
  couponLoading = false,
  paymentMethod,
  loading,
  bookingDisabled = false,
  bookingDisabledText,
  onCouponChange,
  onApplyCoupon,
  onRemoveCoupon,
  onPaymentMethodChange,
  onCheckout,
  t,
}: CartOrderSummaryProps) {
  return (
    <aside className="w-full lg:w-[400px] shrink-0 space-y-6">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xl space-y-6 lg:sticky lg:top-24">
        {/* 1. Total Price Summary */}
        <div>
          <h2 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 mb-3">
            {t('orderDetailTitle')}
          </h2>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>
                {t('subtotal')} ({itemsCount} {t('services')})
              </span>
              <span className="font-bold text-slate-900">{formatPrice(rawSubtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>{t('voucher_discount')}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('service_tax_fee')}</span>
              <span className="font-semibold text-emerald-600">{t('free')}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline gap-2">
              <span className="font-extrabold text-sm text-slate-900">{t('total_payment')}</span>
              <span className="font-extrabold text-2xl text-orange-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* 2. Coupon Code Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <label
            htmlFor="cart-coupon-input"
            className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-amber-500" />
            {t('coupon_title')}
          </label>

          <div className="flex gap-2">
            <input
              id="cart-coupon-input"
              type="text"
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onApplyCoupon();
                }
              }}
              placeholder={t('coupon_placeholder')}
              className="min-w-0 flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 uppercase bg-slate-50/50"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={couponLoading}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {couponLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('apply_btn')}</span>
            </button>
          </div>

          {couponError && (
            <p role="alert" className="text-xs text-red-600 font-semibold">
              {couponError}
            </p>
          )}
          {couponApplied && discount > 0 && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 font-bold flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t('coupon_success_applied')} {formatPrice(discount)}.
                </span>
              </span>
              {onRemoveCoupon && (
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  aria-label={t('remove')}
                  className="p-1 text-emerald-700 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Payment Method Selector */}
        <fieldset className="space-y-2.5 pt-2 border-t border-slate-100">
          <legend className="font-extrabold text-slate-900 block text-xs">
            {t('payment_method_title')}
          </legend>

          {/* Online Payment - Temporarily Disabled */}
          <div
            aria-disabled="true"
            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-100/90 opacity-50 cursor-not-allowed flex items-center justify-between gap-2 select-none grayscale-[50%] transition-all"
            title={t('onlineDisabledTitle')}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                QR
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-extrabold text-xs text-slate-600 line-through">
                    {t('payment_vietqr_title')}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                    {t('maintenanceBadge')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">{t('onlineDisabledDesc')}</span>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="vietqr"
              disabled
              checked={false}
              aria-label={t('payment_vietqr_title')}
              className="w-4 h-4 text-slate-300 cursor-not-allowed shrink-0"
            />
          </div>

          {/* Office Payment - Active & Default */}
          <label
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between gap-2 transition-all ${
              paymentMethod === 'office'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/30'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                🏢
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs text-slate-900 block">
                  {t('payment_office_title')}
                </span>
                <span className="text-[10px] text-slate-500 block">{t('payment_office_desc')}</span>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="office"
              checked={paymentMethod === 'office'}
              onChange={() => onPaymentMethodChange('office')}
              className="w-4 h-4 text-blue-600 cursor-pointer shrink-0"
            />
          </label>
        </fieldset>

        {bookingDisabled && bookingDisabledText && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
          >
            {bookingDisabledText}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || bookingDisabled}
          className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
          <span>{loading ? t('creating_order') : t('confirm_create_order')}</span>
          {!loading && <ChevronRight className="w-5 h-5 shrink-0" />}
        </button>

        {/* Trust Guarantee Badges */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('secure_100')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{t('instant_hold')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
});
