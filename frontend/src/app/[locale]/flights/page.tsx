'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plane, Calendar, Users, ShieldCheck, Clock, Headphones, Loader2, X, CheckCircle2, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import TourCard from '@/components/tours/TourCard';

const AIRPORTS = [
  { code: 'SGN', name: 'Tân Sơn Nhất', cities: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', ko: '호치민', ja: 'ホーチミン', zh: '胡志明市' } },
  { code: 'HAN', name: 'Nội Bài', cities: { vi: 'Hà Nội', en: 'Hanoi', ko: '하노이', ja: 'ハノイ', zh: '河内' } },
  { code: 'DAD', name: 'Đà Nẵng', cities: { vi: 'Đà Nẵng', en: 'Da Nang', ko: '다낭', ja: 'ダナン', zh: '岘港' } },
  { code: 'PQC', name: 'Phú Quốc', cities: { vi: 'Phú Quốc', en: 'Phu Quoc', ko: '푸꾸옥', ja: 'フーコック', zh: '富国岛' } },
  { code: 'CXR', name: 'Nha Trang', cities: { vi: 'Nha Trang', en: 'Nha Trang', ko: '나트랑', ja: 'ニャチャン', zh: '芽庄' } },
  { code: 'DLI', name: 'Đà Lạt', cities: { vi: 'Đà Lạt', en: 'Da Lat', ko: '달랏', ja: 'ダラット', zh: '大叻' } },
  { code: 'HUI', name: 'Huế', cities: { vi: 'Huế', en: 'Hue', ko: '후에', ja: 'フエ', zh: '顺化' } },
  { code: 'UIH', name: 'Quy Nhơn', cities: { vi: 'Quy Nhơn', en: 'Quy Nhon', ko: '퀴논', ja: 'クイニョン', zh: '归仁' } },
  { code: 'VCL', name: 'Quảng Nam', cities: { vi: 'Quảng Nam', en: 'Quang Nam', ko: '꽝남', ja: 'クアンナム', zh: '广南' } },
  { code: 'HPH', name: 'Hải Phòng', cities: { vi: 'Hải Phòng', en: 'Hai Phong', ko: '하이퐁', ja: 'ハイフォン', zh: '海防' } },
];

export default function FlightsPage() {
  const router = useRouter();
  const locale = (useParams()?.locale as string) || 'vi';
  const t = useTranslations('flights');

  const [tripType, setTripType] = useState('roundtrip');
  const [fromCity, setFromCity] = useState('SGN');
  const [toCity, setToCity] = useState('HAN');
  const [departDate, setDepartDate] = useState('2026-09-01');
  const [searchParams, setSearchParams] = useState({ from: 'SGN', to: 'HAN' });

  // Booking Modal State
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ from: fromCity, to: toCity });
    refetch();
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    setIsSubmitting(true);

    try {
      const payload = {
        type: 'flight',
        customerInfo: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        travelDate: new Date(departDate),
        totalPrice: selectedFlight.price,
        status: 'pending',
        notes: `Đặt vé máy bay chuyến ${selectedFlight.flightNumber} (${selectedFlight.airline}) từ ${selectedFlight.from} đến ${selectedFlight.to} lúc ${selectedFlight.departureTime}`,
      };

      const res: any = await api.post('/bookings', payload);
      const bookingCode = res.bookingCode || res.data?.bookingCode;

      if (bookingCode) {
        router.push(`/${locale}/booking-success?code=${bookingCode}`);
      } else {
        alert(t('confirmBtn') + ' successful!');
        setSelectedFlight(null);
      }
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const flightsBanner = pageBanners?.flightsBanner || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600';

  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [sortBy, setSortBy] = useState('price');

  // Filtering & Sorting
  const filteredFlights = flights.filter((f: any) => {
    if (selectedAirline !== 'ALL') {
      if (selectedAirline === 'VU' && !f.airline.includes('Vietravel')) return false;
      if (selectedAirline === 'VN' && !f.airline.includes('Vietnam')) return false;
      if (selectedAirline === 'VJ' && !f.airline.includes('Vietjet')) return false;
      if (selectedAirline === 'QH' && !f.airline.includes('Bamboo')) return false;
    }
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'time') return (a.departureTime || '').localeCompare(b.departureTime || '');
    return 0;
  });

  const getCityName = (ap: typeof AIRPORTS[0]) => {
    return (ap.cities as any)[locale] || ap.cities.vi;
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20 space-y-12">
      {/* Banner */}
      <div className="h-64 md:h-80 rounded-3xl overflow-hidden relative shadow-2xl bg-slate-900 group">
        <img
          src={flightsBanner}
          alt="Flight Banner"
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-slate-900/60 to-transparent flex flex-col justify-center px-8 md:px-12 text-white">
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
      </div>

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
              {AIRPORTS.map(ap => (
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
              {AIRPORTS.map(ap => (
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
          filteredFlights.map((flight: any) => {
            const isVietravel = flight.airline?.includes('Vietravel') || flight.logo === 'VU';
            const isVietnamAir = flight.airline?.includes('Vietnam') || flight.logo === 'VN';
            const isVietjet = flight.airline?.includes('Vietjet') || flight.logo === 'VJ';
            
            return (
              <div key={flight._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl font-bold text-sm flex flex-col items-center justify-center shrink-0 shadow-xs border ${
                    isVietravel ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-950 border-amber-300' :
                    isVietnamAir ? 'bg-gradient-to-br from-blue-900 to-teal-800 text-yellow-300 border-blue-800' :
                    isVietjet ? 'bg-gradient-to-br from-red-600 to-rose-700 text-yellow-300 border-red-500' :
                    'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500'
                  }`}>
                    <span>{flight.logo || 'VN'}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-80">{isVietravel ? 'VU' : flight.logo}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{flight.airline}</h4>
                      {isVietravel && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t('vietravelPartner')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{flight.flightNumber} | {t('directFlight')}</p>
                  </div>
                </div>

                <div className="text-center bg-slate-50 px-6 py-2 rounded-xl border border-slate-100">
                  <p className="text-lg font-bold text-slate-900 tracking-tight">{flight.departureTime} &rarr; {flight.arrivalTime}</p>
                  <p className="text-xs text-slate-500 font-medium">{t('duration')}: {flight.duration || '2h 15m'}</p>
                </div>

                <div className="text-right flex items-center gap-4 self-end md:self-auto">
                  <div>
                    <p className="text-xs text-slate-400">{t('taxIncluded')}</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPrice(flight.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFlight(flight)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t('bookFlightBtn')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
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
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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