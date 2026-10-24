'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Clock, AlertCircle, Ticket, User, Mail, Phone, Calendar, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { formatPrice, getI18nText, formatLocalizedDate } from '@/lib/utils';
import api from '@/lib/api';
import { usePageBanners, DEFAULT_PAGE_BANNERS } from '@/hooks/useSettings';
import { useBookingLookup } from '@/hooks/useBookingLookup';
import { getLocalizedError } from '@/lib/errorUtils';

export default function BookingLookupClient() {
  const t = useTranslations('lookup');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const urlCode = (searchParams.get('code') || '').trim().toUpperCase();

  const [inputCode, setInputCode] = useState(urlCode);
  const [activeCode, setActiveCode] = useState(urlCode);

  useEffect(() => {
    if (urlCode && urlCode !== activeCode) {
      setInputCode(urlCode);
      setActiveCode(urlCode);
    }
  }, [urlCode, activeCode]);

  const { data: booking, isLoading, isError, error: queryError } = useBookingLookup(activeCode);
  const { data: pageBanners } = usePageBanners();
  const lookupBanner = pageBanners?.lookupBanner || pageBanners?.toursBanner || DEFAULT_PAGE_BANNERS.lookupBanner;
  const lookupVideo = pageBanners?.lookupVideo || DEFAULT_PAGE_BANNERS.lookupVideo;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setActiveCode(inputCode.trim().toUpperCase());
  };

  const errorMessage = isError
    ? getLocalizedError(queryError, locale, t('notFoundError'))
    : '';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-28">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <VideoBackground
          videoSrc={lookupVideo}
          videoSources={[
            { src: lookupVideo, type: 'video/mp4' },
            { src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9b/Delta_A220_Sunset.webm/Delta_A220_Sunset.webm.720p.vp9.webm', type: 'video/webm' }
          ]}
          posterSrc={lookupBanner}
          overlayGradient="bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30"
          className="rounded-3xl text-white p-8 md:p-12 mb-10 shadow-2xl flex items-center justify-center text-center"
        >
          <div className="relative z-10 text-center max-w-2xl mx-auto py-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
              <Ticket className="w-3.5 h-3.5 text-blue-400" />
              {t('badge')}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-white">
              {t('heroTitle')}
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base leading-relaxed">
              {t('heroSub')}
            </p>
          </div>
        </VideoBackground>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xl mb-8 -mt-16 relative z-20 mx-4 md:mx-8"
        >
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-5 h-5 text-blue-600" />}
                placeholder={t('placeholder')}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="h-14 rounded-2xl text-base md:text-lg font-mono font-bold uppercase placeholder:normal-case border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="h-14 px-8 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 shrink-0"
            >
              {t('lookupBtn')}
            </Button>
          </form>
        </motion.div>

        {/* Results & Errors */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl bg-red-50/80 border border-red-200/80 text-red-700 flex items-start gap-3.5 mb-8"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-relaxed">{errorMessage}</div>
            </motion.div>
          )}

          {/* Booking Result Card */}
          {booking && (
            <motion.div
              key={booking.bookingCode}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden"
            >
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
                  ) : booking.status === 'completed' ? (
                    <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      {t('completed')}
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
                        {booking.type === 'hotel'
                          ? `${getI18nText(booking.hotelId?.name, locale) || tCommon('hotelType')}${booking.roomName ? ` - ${booking.roomName}` : ''}`
                          : booking.type === 'flight'
                          ? (`${tCommon('flightType')} ${booking.flightId?.flightNumber || ''} (${booking.flightId?.from || ''} - ${booking.flightId?.to || ''})`.trim() || tCommon('flightType'))
                          : (getI18nText(booking.tourId?.title, locale) || t('defaultTourTitle'))}
                      </p>
                      <div className="text-slate-600 flex items-center gap-2 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{booking.type === 'hotel' ? tCommon('checkInDate') : t('depDate')}:</span>
                        <span className="font-bold text-slate-800">
                          {(booking.travelDate || booking.checkIn) ? formatLocalizedDate(booking.travelDate || booking.checkIn, locale) : '---'}
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
                    <span>{tCommon('verifiedSystem')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">{t('totalAmt')}:</span>
                    <span className="text-2xl md:text-3xl font-extrabold text-orange-500">
                      {formatPrice(booking.totalPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
