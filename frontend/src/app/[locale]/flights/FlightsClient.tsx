'use client';

import { useState, useEffect, useMemo, useCallback, memo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plane, Calendar, Users, ShieldCheck, Clock, Headphones, Loader2, X, CheckCircle2, Flame, ChevronRight, Ticket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { formatPrice } from '@/lib/utils';
import TourCard from '@/components/tours/TourCard';
import { useAirportsCatalog, useAirlinesCatalog, usePageBanners, DEFAULT_AIRPORTS, DEFAULT_AIRLINES, DEFAULT_PAGE_BANNERS } from '@/hooks/useSettings';
import { getLocalizedError } from '@/lib/errorUtils';
import { useAuthStore } from '@/stores/authStore';

const AIRPORTS = DEFAULT_AIRPORTS;

function findAirportCode(query: string | null, customAirports = AIRPORTS): string | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  const directMatch = customAirports.find((a: any) => a.code.toLowerCase() === q);
  if (directMatch) return directMatch.code;
  const nameMatch = customAirports.find((a: any) => {
    const cityObj = a.cities || a.city || {};
    const cityValues = typeof cityObj === 'object' ? Object.values(cityObj) : [cityObj];
    return (
      a.name.toLowerCase().includes(q) ||
      cityValues.some((cityName: any) => typeof cityName === 'string' && (cityName.toLowerCase().includes(q) || q.includes(cityName.toLowerCase())))
    );
  });
  return nameMatch ? nameMatch.code : null;
}

interface FlightCardProps {
  flight: any;
  airlinesList?: any[];
  onSelectFlight: (flight: any) => void;
  t: (key: string) => string;
}

const FlightCard = memo(function FlightCard({ flight, airlinesList = [], onSelectFlight, t }: FlightCardProps) {
  const matchedAirline = airlinesList.find(
    (a: any) => a.code === flight.logo || (flight.airline && flight.airline.toLowerCase().includes(a.name.toLowerCase()))
  );

  const isPartner = matchedAirline?.isPartner ?? (flight.airline?.includes('Vietravel') || flight.logo === 'VU');
  const partnerBadge = matchedAirline?.partnerBadge || (isPartner ? t('vietravelPartner') : null);
  const badgeColor = matchedAirline?.badgeColor || (
    isPartner ? 'bg-amber-400 text-blue-950 border-amber-300' :
    flight.airline?.includes('Vietnam') || flight.logo === 'VN' ? 'bg-blue-900 text-yellow-300 border-blue-800' :
    flight.airline?.includes('Vietjet') || flight.logo === 'VJ' ? 'bg-red-600 text-white border-red-500' :
    'bg-emerald-600 text-white border-emerald-500'
  );
  const logoText = matchedAirline?.logoText || flight.logo || 'VN';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all group">
      <div className="flex items-center gap-3.5 min-w-[280px]">
        <div className={`w-12 h-12 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border ${badgeColor}`}>
          <span>{logoText}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-base leading-snug">{flight.airline}</h4>
            {isPartner && partnerBadge && (
              <span className="bg-amber-100/90 text-amber-900 border border-amber-300/80 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                {partnerBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{flight.flightNumber} • {t('directFlight')}</p>
        </div>
      </div>

      <div className="text-center bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100/80 min-w-[180px]">
        <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">{flight.departureTime} &rarr; {flight.arrivalTime}</p>
        <p className="text-xs text-slate-500 font-medium">{t('duration')}: {flight.duration || '2h 15m'}</p>
      </div>

      <div className="text-right flex items-center gap-4 self-end md:self-auto min-w-[200px] justify-end">
        <div>
          <p className="text-xs text-slate-400">{t('taxIncluded')}</p>
          <p className="text-2xl font-bold text-orange-600 leading-tight">{formatPrice(flight.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelectFlight(flight)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
        >
          {t('bookFlightBtn')}
        </button>
      </div>
    </div>
  );
});


function FlightsContent() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('flights');
  const urlSearchParams = useSearchParams();

  const { data: airportsList = DEFAULT_AIRPORTS } = useAirportsCatalog();
  const { data: airlinesList = DEFAULT_AIRLINES } = useAirlinesCatalog();

  const initialTo = findAirportCode(urlSearchParams.get('destination') || urlSearchParams.get('to'), airportsList) || 'HAN';
  const initialFrom = findAirportCode(urlSearchParams.get('from'), airportsList) || 'SGN';

  const [tripType, setTripType] = useState('roundtrip');
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [departDate, setDepartDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [searchParams, setSearchParams] = useState({ from: initialFrom, to: initialTo });

  useEffect(() => {
    const dest = urlSearchParams.get('destination') || urlSearchParams.get('to');
    const fromParam = urlSearchParams.get('from');
    const matchedTo = findAirportCode(dest, airportsList);
    const matchedFrom = findAirportCode(fromParam, airportsList);
    if (matchedTo) {
      setToCity(matchedTo);
      setSearchParams((prev) => ({ ...prev, to: matchedTo }));
    }
    if (matchedFrom) {
      setFromCity(matchedFrom);
      setSearchParams((prev) => ({ ...prev, from: matchedFrom }));
    }
  }, [urlSearchParams, airportsList]);

  // Booking Modal State
  const currentUser = useAuthStore((state) => state.user);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Auto-fill customer info when logged in
  useEffect(() => {
    if (currentUser) {
      setCustomerName((prev) => prev || currentUser.name || '');
      setCustomerEmail((prev) => prev || currentUser.email || '');
      setCustomerPhone((prev) => prev || currentUser.phone || '');
    }
  }, [currentUser]);

  const { data: flights = [], isLoading, refetch } = useQuery({
    queryKey: ['public-flights', searchParams],
    queryFn: async () => {
      const res: any = await api.get('/flights', {
        params: { from: searchParams.from, to: searchParams.to }
      });
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const { data: featuredTours = [] } = useQuery({
    queryKey: ['flights-featured-tours'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/tours');
        const list = Array.isArray(res) ? res : (res?.data || []);
        return list.slice(0, 3);
      } catch {
        return [];
      }
    },
  });

  const handleSelectFlight = useCallback((flight: any) => {
    setSelectedFlight(flight);
    setBookingError('');
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ from: fromCity, to: toCity });
    refetch();
  }, [fromCity, toCity, refetch]);

  const handleBookingSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    setIsSubmitting(true);
    setBookingError('');

    try {
      const payload = {
        flightId: selectedFlight._id,
        type: 'flight',
        customerInfo: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          notes: `Đặt vé máy bay chuyến ${selectedFlight.flightNumber} (${selectedFlight.airline}) từ ${selectedFlight.from} đến ${selectedFlight.to} lúc ${selectedFlight.departureTime}`,
        },
        travelDate: new Date(departDate),
        guests: { adults: 1, children: 0 },
        totalPrice: selectedFlight.price,
        status: 'pending',
      };

      const res: any = await api.post('/bookings', payload);
      const bookingCode = res.bookingCode || res.data?.bookingCode;

      if (bookingCode) {
        router.push(`/${locale}/booking-success?code=${bookingCode}`);
      } else {
        setSelectedFlight(null);
      }
    } catch (err: any) {
      setBookingError(getLocalizedError(err, locale));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFlight, customerName, customerPhone, customerEmail, departDate, router, locale]);

  const { data: pageBanners } = usePageBanners();
  const flightsBanner = pageBanners?.flightsBanner || DEFAULT_PAGE_BANNERS.flightsBanner;
  const flightsVideo = pageBanners?.flightsVideo || DEFAULT_PAGE_BANNERS.flightsVideo;

  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [sortBy, setSortBy] = useState('price');

  // Filtering & Sorting
  const filteredFlights = useMemo(() => {
    return flights.filter((f: any) => {
      if (selectedAirline !== 'ALL') {
        if (selectedAirline === 'VU' && !f.airline?.includes('Vietravel')) return false;
        if (selectedAirline === 'VN' && !f.airline?.includes('Vietnam')) return false;
        if (selectedAirline === 'VJ' && !f.airline?.includes('Vietjet')) return false;
        if (selectedAirline === 'QH' && !f.airline?.includes('Bamboo')) return false;
      }
      return true;
    }).sort((a: any, b: any) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'time') return (a.departureTime || '').localeCompare(b.departureTime || '');
      return 0;
    });
  }, [flights, selectedAirline, sortBy]);

  const getCityName = useCallback((ap: any) => {
    const c = ap.cities || ap.city;
    if (!c) return ap.name;
    if (typeof c === 'string') return c;
    return c[locale] || c.vi || c.en || ap.name;
  }, [locale]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20 space-y-12">
      {/* Banner */}
      <VideoBackground
        videoSrc={flightsVideo}
        videoSources={[
          { src: flightsVideo, type: 'video/mp4' },
          { src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9b/Delta_A220_Sunset.webm/Delta_A220_Sunset.webm.720p.vp9.webm', type: 'video/webm' }
        ]}
        posterSrc={flightsBanner}
        overlayGradient="bg-gradient-to-r from-blue-950/90 via-slate-900/60 to-transparent"
        className="h-64 md:h-80 rounded-3xl shadow-2xl flex items-center"
      >
        <div className="flex flex-col justify-center h-full px-8 md:px-12 text-white">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-extrabold px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider backdrop-blur-md">
            <Plane className="w-3.5 h-3.5" /> {t('partnerBadge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-slate-200 text-sm md:text-base max-w-xl font-medium">
            {t('heroSub')}
          </p>
        </div>
      </VideoBackground>

      {/* Flight Search Form Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex gap-4 mb-2">
          <button
            type="button"
            onClick={() => setTripType('roundtrip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tripType === 'roundtrip' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('roundTrip')}
          </button>
          <button
            type="button"
            onClick={() => setTripType('oneway')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tripType === 'oneway' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('oneWay')}
          </button>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">{t('from')}</label>
            <select
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {airportsList.map((ap: any) => (
                <option key={ap.code} value={ap.code}>{ap.code} - {getCityName(ap)} ({ap.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">{t('to')}</label>
            <select
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {airportsList.map((ap: any) => (
                <option key={ap.code} value={ap.code}>{ap.code} - {getCityName(ap)} ({ap.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">{t('departDate')}</label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-bold gap-2 text-sm cursor-pointer">
              <Plane className="w-4 h-4" />
              {t('searchBtn')}
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{searchParams.from}</span>
              <Plane className="w-5 h-5 text-blue-600" />
              <span>{searchParams.to}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('foundCount', { count: filteredFlights.length })}</p>
          </div>

          {/* Airline Filter Pills & Sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              {[
                { code: 'ALL', label: t('allAirlines') },
                { code: 'VU', label: 'Vietravel Airlines' },
                { code: 'VN', label: 'Vietnam Airlines' },
                { code: 'VJ', label: 'Vietjet Air' },
                { code: 'QH', label: 'Bamboo' },
              ].map(al => (
                <button
                  key={al.code}
                  type="button"
                  onClick={() => setSelectedAirline(al.code)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAirline === al.code ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="price">{t('lowestPrice')}</option>
              <option value="time">{t('earliestTime')}</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            {t('searching')}
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
            {t('noFlights')} <span className="font-bold">{searchParams.from}</span> &rarr; <span className="font-bold">{searchParams.to}</span>. {t('noFlightPrompt')}
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            {filteredFlights.map((flight: any, idx: number) => (
              <motion.div
                key={flight._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.38,
                  delay: Math.min((idx % 4) * 0.06, 0.2),
                  ease: 'easeOut'
                }}
              >
                <FlightCard
                  flight={flight}
                  airlinesList={airlinesList}
                  onSelectFlight={handleSelectFlight}
                  t={t}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFlight(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
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
                <h3 className="font-bold text-slate-900 text-base">{t('bookingModalTitle')} {selectedFlight.flightNumber}</h3>
                <p className="text-xs text-slate-500">{selectedFlight.from} &rarr; {selectedFlight.to} | {formatPrice(selectedFlight.price)}</p>
              </div>
              <button onClick={() => setSelectedFlight(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('passengerName')}</label>
                <input
                  required
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('passengerPhone')}</label>
                <input
                  required
                  placeholder="+1 234 567 890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
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
                  onChange={(e) => setCustomerEmail(e.target.value)}
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
                  onClick={() => setSelectedFlight(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {t('confirmBtn')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">{t('transparentPriceTitle')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('transparentPriceDesc')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">{t('holdSeatTitle')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('holdSeatDesc')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">{t('instantTicketTitle')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('instantTicketDesc')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">{t('support247Title')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('support247Desc')}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recommended Hot Tours */}
      {featuredTours.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{t('hotSuggestions')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {t('tourCombo')}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {t('hotComboSub')}
              </p>
            </div>
            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <span>{t('viewAllTours')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTours.map((tour: any) => (
              <TourCard key={tour._id || tour.id} tour={tour} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightsClient() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 mt-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-500 font-medium">Đang tải thông tin chuyến bay...</p>
        </div>
      }
    >
      <FlightsContent />
    </Suspense>
  );
}