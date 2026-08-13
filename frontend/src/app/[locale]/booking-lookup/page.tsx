'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';

export default function BookingLookupPage() {
  const t = useTranslations('lookup');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const res: any = await api.get(`/bookings/lookup?code=${encodeURIComponent(code.trim())}`);
      setBooking(res);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(msg || t('notFoundError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-20 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t('title')}</h1>
        <p className="text-slate-500">{t('subtitle')}</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg mb-10">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={<Search className="w-5 h-5 text-slate-400" />}
              placeholder={t('inputPlaceholder')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-14 rounded-2xl text-lg font-mono font-bold"
              required
            />
          </div>
          <Button type="submit" isLoading={loading} size="lg" className="h-14 px-8 rounded-2xl font-bold">
            {t('searchButton')}
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {booking && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs text-slate-400 block mb-1">{t('orderCode')}</span>
              <span className="text-2xl font-mono font-extrabold text-blue-600">{booking.bookingCode}</span>
            </div>
            <div>
              {booking.status === 'confirmed' ? (
                <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {t('statusConfirmed')}
                </span>
              ) : booking.status === 'cancelled' ? (
                <span className="bg-red-50 text-red-700 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 border border-red-200">
                  <XCircle className="w-5 h-5 text-red-500" />
                  {t('statusCancelled')}
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-500" />
                  {t('statusPending')}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-slate-400 text-xs block mb-1">{t('customerInfo')}</span>
              <p className="font-bold text-slate-900 text-base">{booking.customerInfo?.name}</p>
              <p className="text-slate-600">{booking.customerInfo?.phone}</p>
              <p className="text-slate-600">{booking.customerInfo?.email}</p>
            </div>

            <div>
              <span className="text-slate-400 text-xs block mb-1">{t('tripDetails')}</span>
              <p className="font-bold text-slate-900 text-base">
                {typeof booking.tourId?.title === 'string' ? booking.tourId.title : (booking.tourId?.title?.vi || t('defaultTourTitle'))}
              </p>
              <p className="text-slate-600">{t('departureDate')}: <span className="font-semibold">{new Date(booking.travelDate).toLocaleDateString('vi-VN')}</span></p>
              <p className="text-slate-600">{t('guests')}: {booking.guests?.adults || 1} {t('adults')}, {booking.guests?.children || 0} {t('children')}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-700">{t('totalPayment')}:</span>
            <span className="text-2xl font-bold text-orange-500">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
