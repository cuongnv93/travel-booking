'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plane,
  ShieldCheck,
  Clock,
  Headphones,
  Loader2,
  Flame,
  ChevronRight,
  Ticket,
  ArrowLeftRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VideoBackground } from '@/components/ui/VideoBackground';
import TourCard from '@/components/tours/TourCard';
import {
  useAirportsCatalog,
  useAirlinesCatalog,
  usePageBanners,
  DEFAULT_AIRPORTS,
  DEFAULT_AIRLINES,
  DEFAULT_PAGE_BANNERS,
} from '@/hooks/useSettings';
import { getLocalizedError } from '@/lib/errorUtils';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import {
  findAirportCode,
  parseFlightDuration,
  isValidEmail,
  isValidPhone,
  getFlightUiText,
} from '@/components/flights/flightUtils';
import { FlightCard } from '@/components/flights/FlightCard';
import { FlightBookingModal } from '@/components/flights/FlightBookingModal';
import { toast } from '@/stores/toastStore';

function FlightsContent() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('flights');
  const urlSearchParams = useSearchParams();

  const { data: airportsList = DEFAULT_AIRPORTS } = useAirportsCatalog();
  const { data: airlinesList = DEFAULT_AIRLINES } = useAirlinesCatalog();
  const addItem = useCartStore((state) => state.addItem);

  const rawToParam = urlSearchParams.get('destination') || urlSearchParams.get('to');
  const rawFromParam = urlSearchParams.get('from');
  const initialTo = findAirportCode(rawToParam, airportsList) || 'HAN';
  const resolvedInitialFrom = findAirportCode(rawFromParam, airportsList);
  const initialFrom =
    resolvedInitialFrom || (initialTo === 'SGN' ? 'HAN' : 'SGN');
  const initialDate = urlSearchParams.get('departDate') || urlSearchParams.get('date') || '';
  const initialPassengers = parseInt(
    urlSearchParams.get('passengers') || urlSearchParams.get('guests') || '1',
    10
  );

  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo === initialFrom ? (initialFrom === 'SGN' ? 'HAN' : 'SGN') : initialTo);
  const [todayStr, setTodayStr] = useState('');
  const [departDate, setDepartDate] = useState(initialDate);
  const [returnDate, setReturnDate] = useState('');
  const [searchParams, setSearchParams] = useState({
    from: initialFrom,
    to: initialTo === initialFrom ? (initialFrom === 'SGN' ? 'HAN' : 'SGN') : initialTo,
  });

  // SSR-safe date initialization
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
    const plusThreeDays = new Date(now.getTime() + 4 * 86400000).toISOString().split('T')[0];
    setTodayStr(today);
    setDepartDate((prev) => prev || tomorrow);
    setReturnDate((prev) => prev || plusThreeDays);
  }, []);

  // Sync URL query parameters
  useEffect(() => {
    const dest = urlSearchParams.get('destination') || urlSearchParams.get('to');
    const fromParam = urlSearchParams.get('from');
    const dateParam = urlSearchParams.get('departDate') || urlSearchParams.get('date');
    const paxParam = urlSearchParams.get('passengers') || urlSearchParams.get('guests');

    const matchedTo = findAirportCode(dest, airportsList);
    const matchedFrom = findAirportCode(fromParam, airportsList);

    if (matchedTo || matchedFrom) {
      let nextFrom = matchedFrom || fromCity;
      let nextTo = matchedTo || toCity;
      if (nextFrom === nextTo) {
        if (matchedTo && !matchedFrom) {
          nextFrom = nextTo === 'SGN' ? 'HAN' : 'SGN';
        } else if (matchedFrom && !matchedTo) {
          nextTo = nextFrom === 'HAN' ? 'SGN' : 'HAN';
        }
      }
      setFromCity(nextFrom);
      setToCity(nextTo);
      setSearchParams({ from: nextFrom, to: nextTo });
    }

    if (dateParam) {
      setDepartDate(dateParam);
    }
    if (paxParam) {
      const parsedPax = parseInt(paxParam, 10);
      if (!Number.isNaN(parsedPax) && parsedPax >= 1 && parsedPax <= 20) {
        setAdults(parsedPax);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchParams, airportsList]);

  // Booking Modal State
  const currentUser = useAuthStore((state) => state.user);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [adults, setAdults] = useState(
    !Number.isNaN(initialPassengers) && initialPassengers >= 1 && initialPassengers <= 20
      ? initialPassengers
      : 1
  );
  const [childrenCount, setChildrenCount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Modal Escape key & body scroll lock
  useEffect(() => {
    if (!selectedFlight) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setSelectedFlight(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFlight, isSubmitting]);

  // Auto-fill customer info when logged in
  useEffect(() => {
    if (currentUser) {
      setCustomerName((prev) => prev || currentUser.name || '');
      setCustomerEmail((prev) => prev || currentUser.email || '');
      setCustomerPhone((prev) => prev || currentUser.phone || '');
    }
  }, [currentUser]);

  const {
    data: flights = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-flights', searchParams],
    queryFn: async () => {
      const res: any = await api.get('/flights', {
        params: { from: searchParams.from, to: searchParams.to },
      });
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const { data: featuredTours = [] } = useQuery({
    queryKey: ['flights-featured-tours'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/tours', { params: { isFeatured: true, limit: 3 } });
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

  const handleFromChange = useCallback(
    (newFrom: string) => {
      if (newFrom === toCity) {
        setToCity(fromCity);
      }
      setFromCity(newFrom);
    },
    [fromCity, toCity]
  );

  const handleToChange = useCallback(
    (newTo: string) => {
      if (newTo === fromCity) {
        setFromCity(toCity);
      }
      setToCity(newTo);
    },
    [fromCity, toCity]
  );

  const handleSwapAirports = useCallback(() => {
    setFromCity(toCity);
    setToCity(fromCity);
    setSearchParams({ from: toCity, to: fromCity });
  }, [fromCity, toCity]);

  const handleDepartDateChange = useCallback(
    (val: string) => {
      setDepartDate(val);
      if (returnDate && val && returnDate < val) {
        setReturnDate(val);
      }
    },
    [returnDate]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (fromCity === toCity) {
        toast.warning(getFlightUiText('sameAirportError', locale));
        return;
      }
      if (searchParams.from === fromCity && searchParams.to === toCity) {
        refetch();
      } else {
        setSearchParams({ from: fromCity, to: toCity });
      }
    },
    [fromCity, toCity, searchParams.from, searchParams.to, refetch, locale]
  );

  const validateModalPassenger = useCallback((): string | null => {
    if (!selectedFlight) return null;
    if (!departDate || (todayStr && departDate < todayStr)) {
      return getFlightUiText('invalidDate', locale);
    }
    const maxSeats =
      typeof selectedFlight.availableSeats === 'number' && selectedFlight.availableSeats > 0
        ? selectedFlight.availableSeats
        : 50;
    if (adults < 1 || childrenCount < 0 || adults + childrenCount > maxSeats) {
      return getFlightUiText('seatLimitError', locale);
    }
    if (customerName.trim().length < 2) {
      return getFlightUiText('invalidName', locale);
    }
    if (!isValidPhone(customerPhone)) {
      return getFlightUiText('invalidPhone', locale);
    }
    if (!isValidEmail(customerEmail)) {
      return getFlightUiText('invalidEmail', locale);
    }
    return null;
  }, [selectedFlight, departDate, todayStr, adults, childrenCount, customerName, customerPhone, customerEmail, locale]);

  const handleAddToCart = useCallback(() => {
    if (!selectedFlight) return;
    if (!departDate || (todayStr && departDate < todayStr)) {
      const msg = getFlightUiText('invalidDate', locale);
      setBookingError(msg);
      toast.warning(msg);
      return;
    }
    const maxSeats =
      typeof selectedFlight.availableSeats === 'number' && selectedFlight.availableSeats > 0
        ? selectedFlight.availableSeats
        : 50;
    if (adults < 1 || childrenCount < 0 || adults + childrenCount > maxSeats) {
      const msg = getFlightUiText('seatLimitError', locale);
      setBookingError(msg);
      toast.warning(msg);
      return;
    }

    const unitPrice = Number(selectedFlight.price) || 0;
    const totalPrice = adults * unitPrice + childrenCount * Math.round(unitPrice * 0.75);

    addItem({
      type: 'flight',
      itemData: {
        ...selectedFlight,
        title: `${selectedFlight.airline} (${selectedFlight.flightNumber})`,
        destination: `${selectedFlight.from} → ${selectedFlight.to}`,
      },
      travelDate: departDate,
      guests: { adults, children: childrenCount },
      totalPrice,
    });
    toast.success(getFlightUiText('addedToCart', locale));
    setSelectedFlight(null);
    router.push(`/${locale}/cart`);
  }, [selectedFlight, departDate, todayStr, adults, childrenCount, addItem, locale, router]);

  const handleBookingSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFlight) return;

      const validationError = validateModalPassenger();
      if (validationError) {
        setBookingError(validationError);
        toast.warning(validationError);
        return;
      }

      setIsSubmitting(true);
      setBookingError('');

      const unitPrice = Number(selectedFlight.price) || 0;
      const totalPrice = adults * unitPrice + childrenCount * Math.round(unitPrice * 0.75);
      const tripDetail =
        tripType === 'roundtrip' && returnDate
          ? `Khứ hồi (Về: ${returnDate})`
          : 'Một chiều';

      try {
        const payload = {
          flightId: selectedFlight._id,
          type: 'flight',
          customerInfo: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            notes: `Đặt vé máy bay chuyến ${selectedFlight.flightNumber} (${selectedFlight.airline}) từ ${selectedFlight.from} đến ${selectedFlight.to} lúc ${selectedFlight.departureTime} | ${tripDetail}`,
          },
          travelDate: new Date(departDate),
          guests: { adults, children: childrenCount },
          totalPrice,
        };

        const res: any = await api.post('/bookings', payload);
        const bookingCode = res?.bookingCode || res?.data?.bookingCode;

        if (bookingCode) {
          setSelectedFlight(null);
          router.push(`/${locale}/booking-success?code=${encodeURIComponent(bookingCode)}`);
        } else {
          setSelectedFlight(null);
          toast.success(t('confirmBtn'));
        }
      } catch (err: any) {
        const errMsg = getLocalizedError(err, locale);
        setBookingError(errMsg);
        toast.error(errMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedFlight,
      validateModalPassenger,
      adults,
      childrenCount,
      tripType,
      returnDate,
      customerName,
      customerPhone,
      customerEmail,
      departDate,
      router,
      locale,
      t,
    ]
  );

  const { data: pageBanners } = usePageBanners();
  const flightsBanner = pageBanners?.flightsBanner || DEFAULT_PAGE_BANNERS.flightsBanner;
  const flightsVideo = pageBanners?.flightsVideo || DEFAULT_PAGE_BANNERS.flightsVideo;

  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'time'>('price');

  const airlineFilterOptions = useMemo(() => {
    const base = Array.isArray(airlinesList) && airlinesList.length > 0 ? airlinesList : DEFAULT_AIRLINES;
    return [
      { code: 'ALL', label: t('allAirlines'), name: '' },
      ...base.map((a: any) => ({
        code: a.code || a.logoText || a.name,
        label: a.name === 'Bamboo Airways' ? 'Bamboo' : a.name,
        name: a.name || '',
      })),
    ];
  }, [airlinesList, t]);

  // Filtering & Sorting
  const filteredFlights = useMemo(() => {
    const list = Array.isArray(flights) ? flights : [];
    const activeAirline = airlineFilterOptions.find((a) => a.code === selectedAirline);

    return list
      .filter((f: any) => {
        if (selectedAirline === 'ALL') return true;
        const logoMatch = f.logo?.toUpperCase() === selectedAirline.toUpperCase();
        const nameMatch =
          activeAirline?.name &&
          f.airline?.toLowerCase().includes(activeAirline.name.toLowerCase());
        return Boolean(logoMatch || nameMatch);
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price') return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === 'duration') {
          const diff = parseFlightDuration(a.duration) - parseFlightDuration(b.duration);
          return diff !== 0 ? diff : (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortBy === 'time') return (a.departureTime || '').localeCompare(b.departureTime || '');
        return 0;
      });
  }, [flights, selectedAirline, sortBy, airlineFilterOptions]);

  const getCityName = useCallback(
    (ap: any) => {
      const c = ap.cities || ap.city;
      if (!c) return ap.name;
      if (typeof c === 'string') return c;
      return c[locale] || c.en || c.vi || ap.name;
    },
    [locale]
  );

  return (
    <div className="container mx-auto px-4 py-8 mt-20 space-y-12">
      {/* Banner */}
      <VideoBackground
        videoSrc={flightsVideo}
        videoSources={[
          { src: flightsVideo, type: 'video/mp4' },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9b/Delta_A220_Sunset.webm/Delta_A220_Sunset.webm.720p.vp9.webm',
            type: 'video/webm',
          },
        ]}
        posterSrc={flightsBanner}
        overlayGradient="bg-gradient-to-r from-blue-950/90 via-slate-900/60 to-transparent"
        className="h-64 md:h-80 rounded-3xl shadow-2xl flex items-center"
      >
        <div className="flex flex-col justify-center h-full px-6 sm:px-8 md:px-12 text-white">
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
        <div className="flex gap-3 mb-2">
          <button
            type="button"
            onClick={() => setTripType('roundtrip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tripType === 'roundtrip'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('roundTrip')}
          </button>
          <button
            type="button"
            onClick={() => setTripType('oneway')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tripType === 'oneway'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('oneWay')}
          </button>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end">
          <div className="md:col-span-3">
            <label htmlFor="flight-from" className="font-semibold text-slate-700 block mb-1.5">
              {t('from')}
            </label>
            <select
              id="flight-from"
              value={fromCity}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {airportsList.map((ap: any) => (
                <option key={ap.code} value={ap.code}>
                  {ap.code} - {getCityName(ap)} ({ap.name})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex justify-center items-center pb-1">
            <button
              type="button"
              onClick={handleSwapAirports}
              aria-label={getFlightUiText('swapAirports', locale)}
              title={getFlightUiText('swapAirports', locale)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="flight-to" className="font-semibold text-slate-700 block mb-1.5">
              {t('to')}
            </label>
            <select
              id="flight-to"
              value={toCity}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {airportsList.map((ap: any) => (
                <option key={ap.code} value={ap.code}>
                  {ap.code} - {getCityName(ap)} ({ap.name})
                </option>
              ))}
            </select>
          </div>

          <div className={tripType === 'roundtrip' ? 'md:col-span-2' : 'md:col-span-3'}>
            <label htmlFor="flight-depart-date" className="font-semibold text-slate-700 block mb-1.5">
              {t('departDate')}
            </label>
            <input
              id="flight-depart-date"
              type="date"
              value={departDate}
              min={todayStr || undefined}
              onChange={(e) => handleDepartDateChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {tripType === 'roundtrip' && (
            <div className="md:col-span-2">
              <label htmlFor="flight-return-date" className="font-semibold text-slate-700 block mb-1.5">
                {getFlightUiText('returnDate', locale)}
              </label>
              <input
                id="flight-return-date"
                type="date"
                value={returnDate}
                min={departDate || todayStr || undefined}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className={tripType === 'roundtrip' ? 'md:col-span-12 lg:col-span-1 flex items-end' : 'md:col-span-2 flex items-end'}>
            <Button type="submit" size="lg" className="w-full h-11 rounded-xl font-bold gap-2 text-sm cursor-pointer">
              <Plane className="w-4 h-4 shrink-0" />
              <span className={tripType === 'roundtrip' ? 'lg:sr-only' : ''}>{t('searchBtn')}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{searchParams.from}</span>
              <Plane className="w-5 h-5 text-blue-600" />
              <span>{searchParams.to}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('foundCount', { count: filteredFlights.length })}</p>
          </div>

          {/* Airline Filter Pills & Sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1">
              {airlineFilterOptions.map((al) => (
                <button
                  key={al.code}
                  type="button"
                  onClick={() => setSelectedAirline(al.code)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAirline === al.code
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'duration' | 'time')}
              aria-label={t('lowestPrice')}
              className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="price">{t('lowestPrice')}</option>
              <option value="duration">{getFlightUiText('shortestDuration', locale)}</option>
              <option value="time">{t('earliestTime')}</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            {t('searching')}
          </div>
        ) : isError ? (
          <div className="p-10 text-center bg-rose-50/60 rounded-2xl border border-rose-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-800">{getFlightUiText('loadError', locale)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{getFlightUiText('retryBtn', locale)}</span>
            </button>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
            {t('noFlights')} <span className="font-bold">{searchParams.from}</span> &rarr;{' '}
            <span className="font-bold">{searchParams.to}</span>. {t('noFlightPrompt')}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlights.map((flight: any, idx: number) => (
              <motion.div
                key={flight._id || flight.flightNumber || idx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min((idx % 4) * 0.05, 0.18),
                  ease: 'easeOut',
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
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <FlightBookingModal
            selectedFlight={selectedFlight}
            locale={locale}
            departDate={departDate}
            tripType={tripType}
            returnDate={returnDate}
            adults={adults}
            childrenCount={childrenCount}
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            bookingError={bookingError}
            isSubmitting={isSubmitting}
            onClose={() => {
              if (!isSubmitting) setSelectedFlight(null);
            }}
            onAdultsChange={setAdults}
            onChildrenChange={setChildrenCount}
            onNameChange={setCustomerName}
            onPhoneChange={setCustomerPhone}
            onEmailChange={setCustomerEmail}
            onAddToCart={handleAddToCart}
            onSubmit={handleBookingSubmit}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">{t('transparentPriceTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t('transparentPriceDesc')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">{t('holdSeatTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t('holdSeatDesc')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">{t('instantTicketTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t('instantTicketDesc')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">{t('support247Title')}</h3>
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
        <div className="container mx-auto px-4 py-24 mt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <FlightsContent />
    </Suspense>
  );
}
