'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Search, CheckCircle2, XCircle, Clock, AlertCircle, Ticket, User, Mail, Phone, Calendar, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice, getI18nText } from '@/lib/utils';
import api from '@/lib/api';

export default function BookingLookupPage() {
  const t = useTranslations('lookup');
  const locale = (useParams()?.locale as string) || 'vi';

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
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 md:p-12 mb-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
              <Ticket className="w-3.5 h-3.5 text-blue-400" />
              {t('heroTitle')}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-white">
              {t('heroTitle')}
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base leading-relaxed">
              {t('heroSub')}
            </p>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xl mb-8 -mt-16 relative z-20 mx-4 md:mx-8">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-5 h-5 text-blue-600" />}
                placeholder={t('placeholder')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-14 rounded-2xl text-base md:text-lg font-mono font-bold uppercase placeholder:normal-case border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>
            <Button
              type="submit"
              isLoading={loading}
              size="lg"
              className="h-14 px-8 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 shrink-0"
            >
              {t('lookupBtn')}
            </Button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-5 rounded-2xl bg-red-50/80 border border-red-200/80 text-red-700 flex items-start gap-3.5 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Booking Result Card */}
        {booking && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Status Header Bar */}
            <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1 uppercase tracking-wider">
                  {t('orderCode')}
                </span>
                <span className="text-2xl md:text-3xl font-mono font-extrabold text-blue-400 tracking-wider">
                  {booking.bookingCode}
                </span>
              </div>

              <div>
                {booking.status === 'confirmed' ? (
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {t('confirmed')}
                  </span>
                ) : booking.status === 'cancelled' ? (
                  <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    {t('cancelled')}
                  </span>
                ) : (
                  <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    {t('pending')}
                  </span>
                )}
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <User className="w-4 h-4" />
                    {t('customerInfo')}
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <p className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      {booking.customerInfo?.name || '---'}
                    </p>
                    <p className="text-slate-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {booking.customerInfo?.phone || '---'}
                    </p>
                    <p className="text-slate-600 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {booking.customerInfo?.email || '---'}
                    </p>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Ticket className="w-4 h-4" />
                    {t('tripDetails')}
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <p className="font-extrabold text-slate-900 text-base line-clamp-2">
                      {getI18nText(booking.tourId?.title, locale) || t('defaultTourTitle')}
                    </p>
                    <div className="text-slate-600 flex items-center gap-2 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('depDate')}:</span>
                      <span className="font-bold text-slate-800">
                        {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString(locale) : '---'}
                      </span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('guestsInfo')}:</span>
                      <span className="font-bold text-slate-800">
                        {booking.guests?.adults || 1} {t('adults')}
                        {booking.guests?.children > 0 && `, ${booking.guests.children} ${t('children')}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Payment Footer */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Xác thực bởi hệ thống Travel</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600">{t('totalAmt')}:</span>
                  <span className="text-2xl md:text-3xl font-extrabold text-orange-500">
                    {formatPrice(booking.totalPrice || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
