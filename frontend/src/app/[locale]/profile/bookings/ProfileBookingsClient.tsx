'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock, CheckCircle2, XCircle, ShoppingBag, X,
  ArrowLeft
} from 'lucide-react';
import { formatPrice, getI18nText, formatLocalizedDate } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { getLocalizedError } from '@/lib/errorUtils';

const fetchUserBookings = async () => {
  try {
    const res: any = await api.get('/bookings/my');
    return Array.isArray(res) ? res : (res?.data || []);
  } catch {
    return [];
  }
};

export default function ProfileBookingsClient() {
  const router = useRouter();
  const locale = useLocale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const t = useTranslations('userBookings');
  const tBooking = useTranslations('booking');
  const tCommon = useTranslations('common');
  const tLookup = useTranslations('lookup');
  const tAuth = useTranslations('auth');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?expired=true`);
    }
  }, [isAuthenticated, router, locale]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBooking) {
        setSelectedBooking(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBooking]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: fetchUserBookings,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      alert(t('cancelSuccess'));
      setSelectedBooking(null);
    },
    onError: (err: any) => {
      alert(`${t('cancelError')}: ${getLocalizedError(err, locale)}`);
    }
  });

  const handleCancelBooking = (id: string) => {
    if (!confirm(t('cancelConfirm'))) return;
    cancelMutation.mutate(id);
  };

  const filteredBookings = bookings.filter((b: any) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="container mx-auto px-4 py-12 mt-20 max-w-4xl">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link href={`/${locale}/profile`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToProfile')}
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/tours`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md shrink-0"
        >
          {t('exploreMore')}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
        {[
          { key: 'all', label: t('tabAll'), count: bookings.length },
          { key: 'pending', label: t('tabPending'), count: bookings.filter((b: any) => b.status === 'pending').length },
          { key: 'confirmed', label: t('tabConfirmed'), count: bookings.filter((b: any) => b.status === 'confirmed').length },
          { key: 'completed', label: t('tabCompleted'), count: bookings.filter((b: any) => b.status === 'completed').length },
          { key: 'cancelled', label: t('tabCancelled'), count: bookings.filter((b: any) => b.status === 'cancelled').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              statusFilter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-slate-800 mb-2">{t('emptyTitle')}</h3>
          <p className="text-slate-500 text-sm mb-6">{t('emptyDesc')}</p>
          <Link
            href={`/${locale}/tours`}
            className="inline-block bg-blue-600 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm"
          >
            {t('viewToursBtn')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b: any) => {
            const isHotel = b.type === 'hotel';
            const isFlight = b.type === 'flight';
            const title = isHotel
              ? `${getI18nText(b.hotelId?.name, locale) || t('defaultHotel')}${b.roomName ? ` (${b.roomName})` : ''}`
              : isFlight
              ? (b.flightId?.flightNumber ? t('flightNumber', { code: b.flightId.flightNumber }) : t('defaultFlight'))
              : (getI18nText(b.tourId?.title, locale) || t('defaultTour'));

            const thumb = isHotel
              ? (b.hotelId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')
              : isFlight
              ? 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'
              : (b.tourId?.images?.[0] || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800');

            const travelDate = b.travelDate || b.checkIn;
            const formattedDate = formatLocalizedDate(travelDate, locale) || 'N/A';

            return (
              <div
                key={b._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex gap-4 items-center min-w-0 flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 shrink-0 overflow-hidden relative">
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {isHotel ? 'Hotel' : isFlight ? 'Flight' : 'Tour'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs text-slate-400">| {formattedDate}</span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">{title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-600">
                        {b.guests?.adults || 1} {tLookup('adults')}{b.guests?.children > 0 && `, ${b.guests.children} ${tLookup('children')}`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('totalAmount')}</span>
                    <span className="text-xl font-extrabold text-orange-600">{formatPrice(b.totalPrice)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'confirmed' ? (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {tBooking('confirmed')}
                      </span>
                    ) : b.status === 'completed' ? (
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        {tBooking('completed')}
                      </span>
                    ) : b.status === 'cancelled' ? (
                      <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        {tBooking('cancelled')}
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {tBooking('pending')}
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                    >
                      {t('viewDetail')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Booking Detail Modal */}
      {selectedBooking && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-blue-600">{t('orderCode')}: {selectedBooking.bookingCode}</span>
                <h2 className="text-lg font-bold text-slate-900">{t('title')}</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Service Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="text-[11px] font-extrabold uppercase text-blue-600 tracking-wider">{t('viewDetail')}</p>
                <p className="font-extrabold text-base text-slate-900">
                  {selectedBooking.type === 'hotel'
                    ? `${getI18nText(selectedBooking.hotelId?.name, locale) || t('defaultHotel')}${selectedBooking.roomName ? ` (${selectedBooking.roomName})` : ''}`
                    : selectedBooking.type === 'flight'
                    ? (selectedBooking.flightId?.flightNumber ? t('flightNumber', { code: selectedBooking.flightId.flightNumber }) : t('defaultFlight'))
                    : (getI18nText(selectedBooking.tourId?.title, locale) || t('defaultTour'))}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <p>
                    <span className="text-slate-500 font-semibold">{selectedBooking.type === 'hotel' ? tCommon('checkInDate') : tLookup('depDate')}:</span>{' '}
                    {formatLocalizedDate(selectedBooking.travelDate || selectedBooking.checkIn, locale) || 'N/A'}
                  </p>
                  <p>
                    <span className="text-slate-500 font-semibold">{tLookup('guestsInfo')}:</span>{' '}
                    {selectedBooking.guests?.adults || 1} {tLookup('adults')} {selectedBooking.guests?.children > 0 && `• ${selectedBooking.guests.children} ${tLookup('children')}`}
                  </p>
                  <p className="col-span-2">
                    <span className="text-slate-500 font-semibold">{tLookup('totalAmt')}:</span>{' '}
                    <span className="text-base font-extrabold text-orange-600">{formatPrice(selectedBooking.totalPrice)}</span>
                  </p>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-4 border border-slate-200 rounded-2xl space-y-1.5 text-slate-700">
                <p className="font-bold text-slate-900 mb-1">{tLookup('customerInfo')}</p>
                <p><span className="text-slate-500">{tAuth('name')}:</span> {selectedBooking.customerInfo?.name}</p>
                <p><span className="text-slate-500">{tAuth('phone')}:</span> {selectedBooking.customerInfo?.phone}</p>
                <p><span className="text-slate-500">{tAuth('email')}:</span> {selectedBooking.customerInfo?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedBooking.status === 'pending' ? (
                <button
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  {t('cancelOrder')}
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                {tCommon('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
