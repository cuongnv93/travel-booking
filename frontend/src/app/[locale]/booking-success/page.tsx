'use client';

import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, MapPin, Calendar, User, Phone, Mail, ArrowRight, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';

export default function BookingSuccessPage() {
  const t = useTranslations('success');
  const searchParams = useSearchParams();
  const locale = useParams().locale as string;
  const code = searchParams.get('code') || '';

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking-success', code],
    queryFn: async () => {
      if (!code) return null;
      const res: any = await api.get(`/bookings/lookup?code=${encodeURIComponent(code)}`);
      return res;
    },
    enabled: !!code,
  });

  return (
    <div className="min-h-screen py-16 px-4 mt-16 flex items-center justify-center bg-slate-50">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
          <p className="text-slate-500 text-sm">
            {t('subtitle')}
          </p>
        </div>

        {/* Booking Code Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('bookingCodeLabel')}</p>
          <p className="text-3xl font-mono font-extrabold text-blue-600 tracking-wider">{code || 'N/A'}</p>
          <p className="text-[11px] text-slate-400 mt-1">{t('saveCodeNote')}</p>
        </div>

        {/* Dynamic Booking Details */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>{t('loadingDetails')}</span>
          </div>
        ) : booking ? (
          <div className="border-t border-slate-100 pt-5 space-y-4 text-xs">
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-400 block mb-0.5">{t('bookedService')}</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {booking.type === 'hotel'
                      ? getI18nText(booking.hotelId?.name, locale) || t('hotel')
                      : getI18nText(booking.tourId?.title, locale) || t('tour')}
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {t('pendingStatus')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600 border-t border-slate-200/60 pt-3">
                <div>
                  <span className="text-slate-400 block">{t('time')}</span>
                  <span className="font-semibold text-slate-800">
                    {booking.type === 'hotel'
                      ? `${new Date(booking.checkIn).toLocaleDateString('vi-VN')} → ${new Date(booking.checkOut).toLocaleDateString('vi-VN')}`
                      : new Date(booking.travelDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('quantity')}</span>
                  <span className="font-semibold text-slate-800">
                    {booking.type === 'hotel'
                      ? `${booking.rooms || 1} ${t('rooms')} (${booking.guests?.adults || 1} ${t('guests')})`
                      : `${booking.guests?.adults || 1} ${t('adults')}, ${booking.guests?.children || 0} ${t('children')}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200/60 pt-3">
                <span className="font-bold text-slate-700 text-sm">{t('totalPayment')}:</span>
                <span className="text-xl font-extrabold text-orange-500">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="px-2 space-y-1 text-slate-500">
              <p><span className="font-semibold text-slate-700">{t('booker')}:</span> {booking.customerInfo?.name}</p>
              <p><span className="font-semibold text-slate-700">{t('phone')}:</span> {booking.customerInfo?.phone}</p>
              <p><span className="font-semibold text-slate-700">{t('email')}:</span> {booking.customerInfo?.email}</p>
            </div>

            {/* VietQR Payment Generator Box */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">{t('vietqrTitle')}</h4>
                  <p className="text-[11px] text-emerald-700">{t('vietqrSubtitle')}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold uppercase">
                  {t('autoFill')}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="w-36 h-36 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                  <img
                    src={`https://img.vietqr.io/image/MB-${(booking.paymentInfo?.bankAccount || '999988887777')}-compact2.png?amount=${booking.totalPrice}&addInfo=${booking.bookingCode}&accountName=TRAVEL%20BOOKING`}
                    alt={t('vietqrAlt')}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 w-full">
                  <p><span className="text-slate-400">{t('bank')}:</span> <strong className="text-slate-900">{t('mbBank')}</strong></p>
                  <p><span className="text-slate-400">{t('accountNumber')}:</span> <strong className="text-blue-600 font-mono text-sm">999988887777</strong></p>
                  <p><span className="text-slate-400">{t('accountOwner')}:</span> <strong className="text-slate-900 uppercase">{t('companyName')}</strong></p>
                  <p><span className="text-slate-400">{t('amount')}:</span> <strong className="text-orange-600 font-bold">{formatPrice(booking.totalPrice)}</strong></p>
                  <p><span className="text-slate-400">{t('transferContent')}:</span> <strong className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{booking.bookingCode}</strong></p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href={`/${locale}`} className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold">{t('homeButton')}</Button>
          </Link>
          <Link href={`/${locale}/booking-lookup`} className="flex-1">
            <Button className="w-full h-12 rounded-xl text-sm font-semibold gap-1.5">
              {t('lookupButton')} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
