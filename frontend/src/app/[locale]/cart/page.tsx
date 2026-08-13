'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice, getI18nText } from '@/lib/utils';
import { 
  ShoppingBag, Trash2, Calendar, Users, MapPin, ShieldCheck, 
  CreditCard, Tag, ArrowRight, CheckCircle2, Phone, Mail, User,
  AlertCircle, Sparkles, Clock, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function CartPage() {
  const t = useTranslations('cart');
  const router = useRouter();
  const locale = useParams().locale as string;
  const { items, removeItem, updateItem, getTotalPrice, clearCart } = useCartStore();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'office'>('vietqr');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Coupon Code
  const handleApplyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res: any = await api.post('/coupons/validate', { code });
      if (res && res.discountAmount) {
        setDiscount(res.discountAmount);
        setCouponApplied(true);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || t('coupon_invalid'));
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  // Adjust adult/children count
  const handleGuestChange = (item: any, guestType: 'adults' | 'children', delta: number) => {
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

    const pricePerAdult = item.itemData.price || 1000000;
    const pricePerChild = Math.round(pricePerAdult * 0.75);
    const newTotalPrice = (newAdults * pricePerAdult) + (newChildren * pricePerChild);

    updateItem(itemId, item.travelDate, {
      guests: { adults: newAdults, children: newChildren },
      totalPrice: newTotalPrice
    });
  };

  const rawSubtotal = getTotalPrice();
  const finalTotal = Math.max(0, rawSubtotal - discount);

  const handleCheckout = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError(t('error_missing_fields'));
      return;
    }

    if (items.length === 0) return;

    setError('');
    setLoading(true);

    try {
      const firstItem = items[0];
      const itemId = firstItem.itemData._id || firstItem.itemData.id;

      let payload: any = {
        type: firstItem.type,
        travelDate: firstItem.travelDate,
        guests: firstItem.guests,
        totalPrice: finalTotal,
        discount: discount,
        couponCode: couponApplied ? couponCode : undefined,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: `[${t('payment_method_note')}: ${paymentMethod === 'vietqr' ? t('payment_vietqr') : t('payment_office')}] ${formData.notes || ''}`
        }
      };

      if (firstItem.type === 'tour') payload.tourId = itemId;
      if (firstItem.type === 'hotel') payload.hotelId = itemId;
      if (firstItem.type === 'flight') payload.flightId = itemId;

      const res: any = await api.post('/bookings', payload);
      const code = res?.bookingCode || 'TRV-' + Math.floor(Math.random() * 1000000);

      clearCart();
      router.push(`/${locale}/booking-success?code=${code}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || t('error_checkout_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 mt-20 text-center flex flex-col items-center max-w-xl">
        <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-blue-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
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
      </div>
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
            <span className="sm:hidden">Dịch Vụ</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Step 2 (Current Active Step) */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/20">
            <span className="w-6 h-6 rounded-full bg-white text-blue-700 flex items-center justify-center text-[11px] font-black shrink-0">
              2
            </span>
            <span className="hidden sm:inline">{t('step2', { fallback: 'Thông Tin Khách Hàng' })}</span>
            <span className="sm:hidden">Thông Tin</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Step 3 */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-slate-400 font-semibold text-xs">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-bold shrink-0">
              3
            </span>
            <span className="hidden sm:inline">{t('step3', { fallback: 'Xác Nhận & VietQR' })}</span>
            <span className="sm:hidden">Thanh Toán</span>
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

          {items.map((item, index) => {
            const itemId = item.itemData._id || item.itemData.id || item.itemData.slug || '';
            const title = getI18nText(item.itemData.title || item.itemData.name, locale);
            const itemKey = `${itemId}-${item.travelDate}-${index}`;
            const isTour = item.type === 'tour';
            const isHotel = item.type === 'hotel';

            return (
              <div key={itemKey} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Thumbnail Image */}
                  <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <img 
                      src={item.itemData.images?.[0] || 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {isTour ? t('package_tour', { fallback: 'Tour Trọn Gói' }) : isHotel ? 'Khách Sạn' : 'Vé Máy Bay'}
                    </span>
                  </div>

                  {/* Tour Info & Controls */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-0.5">
                          {t('service_code', { fallback: 'Mã Dịch Vụ:' })} {item.type.toUpperCase()}-{(itemId || '').slice(-6).toUpperCase()}
                        </span>
                        <h3 className="font-extrabold text-base md:text-lg text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                          {title}
                        </h3>
                      </div>
                      <button 
                        onClick={() => removeItem(itemId, item.travelDate)} 
                        className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                        title={t('remove_from_cart', { fallback: 'Xóa khỏi giỏ hàng' })}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{isHotel ? 'Nhận phòng:' : t('departure_date', { fallback: 'Ngày khởi hành:' })} <strong className="text-slate-900">{item.travelDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('destination', { fallback: 'Điểm đến:' })} <strong className="text-slate-900">{item.itemData.destination || item.itemData.location || t('vietnam', { fallback: 'Việt Nam' })}</strong></span>
                      </div>
                    </div>

                    {/* Guest Counter Controls */}
                    <div className="flex flex-wrap justify-between items-center pt-2 gap-3">
                      <div className="flex items-center gap-4 text-xs">
                        {/* Adults Counter */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{t('adults', { fallback: 'Người lớn:' })}</span>
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleGuestChange(item, 'adults', -1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 font-extrabold text-slate-900">{item.guests.adults || 1}</span>
                            <button
                              type="button"
                              onClick={() => handleGuestChange(item, 'adults', 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Children Counter */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{t('children', { fallback: 'Trẻ em:' })}</span>
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleGuestChange(item, 'children', -1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 font-extrabold text-slate-900">{item.guests.children || 0}</span>
                            <button
                              type="button"
                              onClick={() => handleGuestChange(item, 'children', 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('total_amount', { fallback: 'Thành tiền' })}</span>
                        <span className="font-extrabold text-lg md:text-xl text-orange-600">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Contact Information Form Card (Left Side) */}
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {t('contact_info_title', { fallback: 'Thông Tin Liên Hệ Đặt Chỗ' })}
            </h3>

            {/* Input Form */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">{t('full_name_label', { fallback: 'Họ và tên khách hàng *' })}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    required
                    type="text"
                    placeholder={t('full_name_placeholder', { fallback: 'Nguyễn Văn A' })}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">{t('phone_label', { fallback: 'Số điện thoại *' })}</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      required
                      type="tel"
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">{t('email_label', { fallback: 'Email nhận vé *' })}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      required
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">{t('address_label', { fallback: 'Địa chỉ sinh sống' })}</label>
                <input
                  type="text"
                  placeholder={t('address_placeholder', { fallback: 'Nhập địa chỉ của bạn...' })}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">{t('notes_label', { fallback: 'Ghi chú đặc biệt' })}</label>
                <textarea
                  rows={2}
                  placeholder={t('notes_placeholder', { fallback: 'Yêu cầu phòng, dị ứng thức ăn,...' })}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Total Summary, Coupon & Payment Method Selector */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6 sticky top-24">
            
            {/* 1. Total Price Summary (Top) */}
            <div>
              <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 mb-3">
                {t('orderDetailTitle', { fallback: 'Tóm Tắt Thanh Toán' })}
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{t('subtotal', { fallback: 'Tạm tính' })} ({items.length} {t('services', { fallback: 'dịch vụ' })})</span>
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

            {/* 2. Coupon Code Section (Right Sidebar - Below Total Money) */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500" />
                {t('coupon_title', { fallback: 'Mã Ưu Đãi / Voucher Giảm Giá' })}
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t('coupon_placeholder', { fallback: 'Nhập mã giảm giá' })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 uppercase bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
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

            {/* 3. Payment Method Selector (Below Coupon Section) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="font-extrabold text-slate-900 block text-xs">{t('payment_method_title', { fallback: 'Phương Thức Thanh Toán' })}</label>
              
              <div 
                onClick={() => setPaymentMethod('vietqr')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'vietqr' ? 'border-blue-600 bg-blue-50/60 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    QR
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{t('payment_vietqr_title', { fallback: 'Chuyển Khoản VietQR Auto' })}</span>
                    <span className="text-[10px] text-slate-500">{t('payment_vietqr_desc', { fallback: 'Napas 24/7 tức thì & không tốn phí' })}</span>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'vietqr'} readOnly className="w-4 h-4 text-blue-600" />
              </div>

              <div 
                onClick={() => setPaymentMethod('office')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'office' ? 'border-blue-600 bg-blue-50/60 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    🏢
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{t('payment_office_title', { fallback: 'Thanh Toán Tại Văn Phòng' })}</span>
                    <span className="text-[10px] text-slate-500">{t('payment_office_desc', { fallback: 'Giữ chỗ trước, nộp tiền mặt sau' })}</span>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'office'} readOnly className="w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCheckout}
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
      </div>
    </div>
  );
}
