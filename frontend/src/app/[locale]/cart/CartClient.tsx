'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ShoppingBag, ArrowRight, AlertCircle, Clock, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { getLocalizedError } from '@/lib/errorUtils';
import { toast } from '@/stores/toastStore';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { CartContactForm, CartContactFormData } from '@/components/cart/CartContactForm';
import { CartOrderSummary } from '@/components/cart/CartOrderSummary';

export default function CartClient() {
  const t = useTranslations('cart');
  const router = useRouter();
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [formData, setFormData] = useState<CartContactFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'office'>('office');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill customer info if user is authenticated
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        address: prev.address || currentUser.address || '',
      }));
    }
  }, [currentUser]);

  const handleFormFieldChange = useCallback((field: keyof CartContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle Coupon Code
  const handleApplyCoupon = useCallback(async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res: any = await api.post('/coupons/validate', { code });
      if (res && res.discountAmount) {
        setDiscount(res.discountAmount);
        setCouponApplied(true);
        toast.success(t('coupon_applied_success') || 'Áp dụng mã giảm giá thành công!');
      }
    } catch (err: any) {
      const errText = getLocalizedError(err, locale, t('coupon_invalid'));
      setCouponError(errText);
      toast.error(errText);
      setDiscount(0);
      setCouponApplied(false);
    }
  }, [couponCode, locale, t]);

  // Adjust adult/children count
  const handleGuestChange = useCallback((item: any, guestType: 'adults' | 'children', delta: number) => {
    const itemId = item.itemData._id || item.itemData.id;
    const currentAdults = item.guests.adults || 1;
    const currentChildren = item.guests.children || 0;

    let newAdults = currentAdults;
    let newChildren = currentChildren;

    if (guestType === 'adults') {
      newAdults = Math.max(1, currentAdults + delta);
    } else {
      newChildren = Math.max(0, currentChildren + delta);
    }

    const pricePerAdult = item.itemData.price || item.itemData.pricePerNight || 1000000;
    const pricePerChild = Math.round(pricePerAdult * 0.75);
    const newTotalPrice = (newAdults * pricePerAdult) + (newChildren * pricePerChild);

    updateItem(itemId, item.travelDate, {
      guests: { adults: newAdults, children: newChildren },
      totalPrice: newTotalPrice
    });
  }, [updateItem]);

  const handleRemoveItem = useCallback((itemId: string, travelDate: string) => {
    removeItem(itemId, travelDate);
    toast.info(t('item_removed') || 'Đã xóa dịch vụ khỏi giỏ hàng.');
  }, [removeItem, t]);

  const rawSubtotal = getTotalPrice();
  const finalTotal = useMemo(() => Math.max(0, rawSubtotal - discount), [rawSubtotal, discount]);

  const handleCheckout = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError(t('error_missing_fields'));
      toast.warning(t('error_missing_fields'));
      return;
    }

    // Require authentication before placing any booking
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent('/' + locale + '/cart');
      router.push('/' + locale + '/login?returnUrl=' + returnUrl);
      return;
    }

    if (items.length === 0) return;

    setError('');
    setLoading(true);

    try {
      const codes: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = item.itemData._id || item.itemData.id;
        const itemDiscount = i === 0 ? discount : 0;
        const itemTotal = Math.max(0, item.totalPrice - itemDiscount);

        const payload: any = {
          type: item.type,
          travelDate: item.travelDate,
          guests: item.guests,
          totalPrice: itemTotal,
          discount: itemDiscount,
          couponCode: (i === 0 && couponApplied) ? couponCode : undefined,
          customerInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            notes: `[${t('payment_method_note')}: ${paymentMethod === 'vietqr' ? t('payment_vietqr') : t('payment_office')}] ${formData.notes || ''}`
          }
        };

        if (item.type === 'tour') payload.tourId = itemId;
        if (item.type === 'hotel') payload.hotelId = itemId;
        if (item.type === 'flight') payload.flightId = itemId;

        const res: any = await api.post('/bookings', payload);
        const code = res?.bookingCode || res?.data?.bookingCode;
        if (code) codes.push(code);
      }

      const primaryCode = codes[0] || 'TRV-' + Math.floor(Math.random() * 1000000);
      clearCart();
      router.push(`/${locale}/booking-success?code=${primaryCode}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      const errMsg = getLocalizedError(err, locale, t('error_checkout_failed'));
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, items, discount, couponApplied, couponCode, paymentMethod, clearCart, locale, router, t, isAuthenticated]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="container mx-auto px-4 py-20 mt-20 text-center flex flex-col items-center max-w-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
          className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-blue-600"
        >
          <ShoppingBag className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          {t('emptyTitle', { fallback: 'Giỏ Hàng Đặt Tour Trống' })}
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {t('emptyDesc', { fallback: 'Bạn chưa chọn gói tour hoặc dịch vụ du lịch nào.' })}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/tours`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            {t('exploreBtn', { fallback: 'Khám Phá Tours Du Lịch' })} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/hotels`}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-6 py-3 rounded-2xl transition-colors"
          >
            {t('bookHotelBtn', { fallback: 'Đặt Khách Sạn' })}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 mt-20">
      {/* Travel Stepper Bar - Modern Segmented Pills */}
      <div className="mb-10 max-w-3xl mx-auto">
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-1 sm:gap-2 shadow-inner">
          {/* Step 1 */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white text-blue-600 font-extrabold text-xs shadow-xs border border-slate-200/60">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-black shrink-0">
              ✓
            </span>
            <span className="hidden sm:inline">{t('step1', { fallback: 'Giỏ Hàng & Dịch Vụ' })}</span>
            <span className="sm:hidden">{t('stepServices', { fallback: 'Dịch Vụ' })}</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Step 2 (Current Active Step) */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/20">
            <span className="w-6 h-6 rounded-full bg-white text-blue-700 flex items-center justify-center text-[11px] font-black shrink-0">
              2
            </span>
            <span className="hidden sm:inline">{t('step2', { fallback: 'Thông Tin Khách Hàng' })}</span>
            <span className="sm:hidden">{t('stepInfo', { fallback: 'Thông Tin' })}</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Step 3 */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-slate-400 font-semibold text-xs">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-bold shrink-0">
              3
            </span>
            <span className="hidden sm:inline">{t('step3', { fallback: 'Xác Nhận & VietQR' })}</span>
            <span className="sm:hidden">{t('stepPayment', { fallback: 'Thanh Toán' })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content: Cart Items */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('orderDetailTitle', { fallback: 'Chi Tiết Đơn Hàng' })} ({items.length})
            </h1>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> {t('autoHold', { fallback: 'Giữ chỗ tự động 24h' })}
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <AnimatePresence>
            {items.map((item, index) => {
              const itemId = item.itemData._id || item.itemData.id || item.itemData.slug || '';
              const itemKey = `${itemId}-${item.travelDate}-${index}`;
              return (
                <motion.div
                  key={itemKey}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                >
                  <CartItemCard
                    item={item}
                    index={index}
                    locale={locale}
                    onRemove={handleRemoveItem}
                    onGuestChange={handleGuestChange}
                    t={t}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Contact Information Form Card (Left Side) */}
          <CartContactForm
            formData={formData}
            onChange={handleFormFieldChange}
            t={t}
          />
        </div>

        {/* Sidebar: Total Summary, Coupon & Payment Method Selector */}
        <CartOrderSummary
          itemsCount={items.length}
          rawSubtotal={rawSubtotal}
          discount={discount}
          finalTotal={finalTotal}
          couponCode={couponCode}
          couponError={couponError}
          couponApplied={couponApplied}
          paymentMethod={paymentMethod}
          loading={loading}
          onCouponChange={setCouponCode}
          onApplyCoupon={handleApplyCoupon}
          onPaymentMethodChange={setPaymentMethod}
          onCheckout={handleCheckout}
          t={t}
        />
      </div>
    </div>
  );
}
