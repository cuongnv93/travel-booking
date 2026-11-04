'use client';

import { memo } from 'react';
import { Tag, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface CartOrderSummaryProps {
  itemsCount: number;
  rawSubtotal: number;
  discount: number;
  finalTotal: number;
  couponCode: string;
  couponError: string;
  couponApplied: boolean;
  paymentMethod: 'vietqr' | 'office';
  loading: boolean;
  onCouponChange: (code: string) => void;
  onApplyCoupon: () => void;
  onPaymentMethodChange: (method: 'vietqr' | 'office') => void;
  onCheckout: () => void;
  t: (key: string, options?: any) => string;
}

export const CartOrderSummary = memo(function CartOrderSummary({
  itemsCount,
  rawSubtotal,
  discount,
  finalTotal,
  couponCode,
  couponError,
  couponApplied,
  paymentMethod,
  loading,
  onCouponChange,
  onApplyCoupon,
  onPaymentMethodChange,
  onCheckout,
  t,
}: CartOrderSummaryProps) {
  return (
    <div className="w-full lg:w-[400px] shrink-0 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6 sticky top-24">
        {/* 1. Total Price Summary */}
        <div>
          <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 mb-3">
            {t('orderDetailTitle', { fallback: 'Tóm Tắt Thanh Toán' })}
          </h3>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('subtotal', { fallback: 'Tạm tính' })} ({itemsCount} {t('services', { fallback: 'dịch vụ' })})</span>
              <span className="font-bold text-slate-900">{formatPrice(rawSubtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>{t('voucher_discount', { fallback: 'Giảm giá Voucher' })}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('service_tax_fee', { fallback: 'Phí dịch vụ & Thuế' })}</span>
              <span className="font-semibold text-emerald-600">{t('free', { fallback: 'Miễn phí' })}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-extrabold text-sm text-slate-900">{t('total_payment', { fallback: 'Tổng tiền thanh toán' })}</span>
              <span className="font-extrabold text-2xl text-orange-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* 2. Coupon Code Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-amber-500" />
            {t('coupon_title', { fallback: 'Mã Ưu Đãi / Voucher Giảm Giá' })}
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value)}
              placeholder={t('coupon_placeholder', { fallback: 'Nhập mã giảm giá' })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 uppercase bg-slate-50/50"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {t('apply_btn', { fallback: 'Áp Dụng' })}
            </button>
          </div>

          {couponError && <p className="text-xs text-red-500 font-semibold">{couponError}</p>}
          {couponApplied && (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('coupon_success_applied', { fallback: 'Đã áp dụng giảm giá' })} {formatPrice(discount)}.
            </p>
          )}
        </div>

        {/* 3. Payment Method Selector */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="font-extrabold text-slate-900 block text-xs">{t('payment_method_title', { fallback: 'Phương Thức Thanh Toán' })}</label>
          
          {/* Online Payment - Temporarily Disabled */}
          <div 
            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-100/90 opacity-40 cursor-not-allowed flex items-center justify-between select-none grayscale-[50%] transition-all"
            title={t('onlineDisabledTitle', { fallback: 'Cổng thanh toán online tạm thời bảo trì nâng cấp' })}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                QR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-500 line-through">
                    {t('payment_vietqr_title', { fallback: 'Chuyển Khoản VietQR Auto' })}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-800">
                    {t('maintenanceBadge', { fallback: 'Tạm bảo trì' })}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {t('onlineDisabledDesc', { fallback: 'Cổng thanh toán trực tuyến tạm thời không khả dụng' })}
                </span>
              </div>
            </div>
            <input type="radio" disabled checked={false} className="w-4 h-4 text-slate-300 cursor-not-allowed" />
          </div>

          {/* Office Payment - Active & Default */}
          <div 
            onClick={() => onPaymentMethodChange('office')}
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'office' ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/30' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🏢
              </div>
              <div>
                <span className="font-extrabold text-xs text-slate-900 block">{t('payment_office_title', { fallback: 'Thanh Toán Tại Văn Phòng' })}</span>
                <span className="text-[10px] text-slate-500">{t('payment_office_desc', { fallback: 'Giữ chỗ trước, nộp tiền mặt sau' })}</span>
              </div>
            </div>
            <input type="radio" checked={paymentMethod === 'office'} readOnly className="w-4 h-4 text-blue-600 cursor-pointer" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onCheckout}
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? t('creating_order', { fallback: 'Đang tạo đơn hàng...' }) : t('confirm_create_order', { fallback: 'Xác Nhận & Tạo Đơn Đặt Tour' })}
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Trust Guarantee Badges */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('secure_100', { fallback: 'Bảo mật 100%' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{t('instant_hold', { fallback: 'Giữ chỗ tức thì' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
