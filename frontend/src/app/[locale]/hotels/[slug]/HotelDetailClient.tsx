'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';
import {
  Star, MapPin, ChevronLeft, CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { useHotelAmenitiesMaster } from '@/hooks/useSettings';
import { getLocalizedError } from '@/lib/errorUtils';
import { useAuthStore } from '@/stores/authStore';
import { AMENITY_ICONS, FALLBACK_ROOM_IMG } from '@/components/hotels/amenitiesConstants';
import { HotelRoomCard } from '@/components/hotels/HotelRoomCard';
import { HotelBookingSidebar, HotelBookingFormData } from '@/components/hotels/HotelBookingSidebar';

export default function HotelDetailClient({ initialHotel }: { initialHotel?: any }) {
  const t = useTranslations('hotelDetail');
  const locale = useLocale();
  const { slug } = useParams() as { slug: string };
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);
  
  // Booking State
  const currentUser = useAuthStore((state) => state.user);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [formData, setFormData] = useState<HotelBookingFormData>({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomsCount: 1,
    adults: 2,
    children: 0,
    notes: '',
  });
  const [bookedCode, setBookedCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill customer info if user is authenticated
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const handleFormChange = useCallback((field: keyof HotelBookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const { data: hotel = initialHotel, isLoading: isQueryLoading } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: async () => {
      const res: any = await api.get(`/hotels/${slug}`);
      return res;
    },
    initialData: initialHotel || undefined,
    enabled: !!slug,
  });

  const isLoading = isQueryLoading && !hotel;

  const { data: defaultAmenities = [] } = useHotelAmenitiesMaster();

  const effectiveAmenities = useMemo(() => {
    if (Array.isArray(hotel?.amenities) && hotel.amenities.length > 0) return hotel.amenities;
    return defaultAmenities;
  }, [hotel?.amenities, defaultAmenities]);

  const nights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const d1 = new Date(formData.checkIn);
    const d2 = new Date(formData.checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  }, [formData.checkIn, formData.checkOut]);

  const totalPrice = useMemo(() => {
    return selectedRoom && nights > 0 
      ? selectedRoom.price * nights * formData.roomsCount 
      : 0;
  }, [selectedRoom, nights, formData.roomsCount]);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      return api.post('/bookings', {
        type: 'hotel',
        hotelId: hotel._id,
        roomId: selectedRoom?._id,
        roomName: selectedRoom?.name,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: { adults: formData.adults, children: formData.children },
        rooms: formData.roomsCount,
        totalPrice,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
        },
      });
    },
    onSuccess: (res: any) => { 
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      const code = res?.bookingCode || res?.data?.bookingCode || '';
      setBookedCode(code);
      setSuccess(true); 
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err: any) => setError(getLocalizedError(err, locale, t('error'))),
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      setError(t('errSelectRoom'));
      const roomSection = document.getElementById('rooms-section');
      if (roomSection) roomSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
      setError(t('errFillInfo'));
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError(locale === 'vi' ? 'Định dạng email không hợp lệ.' : 'Invalid email format.');
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      setError(t('errSelectDates'));
      return;
    }
    if (nights <= 0) {
      setError(t('errInvalidDates'));
      return;
    }
    setError('');
    bookingMutation.mutate();
  }, [selectedRoom, formData, nights, bookingMutation, t, locale]);

  const handleSelectRoom = useCallback((room: any) => {
    setSelectedRoom(room);
    setError('');
    const formSection = document.getElementById('booking-form-section');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-[400px] bg-slate-200 rounded-2xl"></div>
        <div className="h-20 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-20 mt-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('notFound')}</h2>
        <Link href={`/${locale}/hotels`} className="text-blue-600 hover:underline">{t('backToHotels')}</Link>
      </div>
    );
  }

  const name = getI18nText(hotel.name, locale);
  const description = getI18nText(hotel.description, locale);
  const images = hotel.images?.length > 0 ? hotel.images : [FALLBACK_ROOM_IMG];

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href={`/${locale}/hotels`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t('backToHotels')}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate">{name}</span>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-start gap-4 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">{t('bookingSuccess')}</h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                {t('bookingSuccessDesc')}{' '}
                {bookedCode && (
                  <span>
                    {t('bookingCodeLabel')}: <strong className="text-emerald-950 font-mono text-base">{bookedCode}</strong>
                  </span>
                )}
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/${locale}/booking-lookup`}
                  className="inline-block bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  {t('lookupBookingBtn')}
                </Link>
                <Link
                  href={`/${locale}/hotels`}
                  className="inline-block bg-white text-emerald-700 border border-emerald-300 font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  {t('continueExploring')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {t('hotelBadge')}
              </span>
              <div className="flex items-center text-amber-500 gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">{hotel.stars} {t('stars')}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-2">{name}</h1>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{hotel.address || hotel.location}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-1">{t('priceFrom')}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-orange-600">{formatPrice(hotel.pricePerNight)}</span>
              <span className="text-xs text-slate-500 font-medium">/{t('night')}</span>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-10 space-y-3">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden relative shadow-md bg-slate-100">
            <SmartImage
              src={images[activeImg] || FALLBACK_ROOM_IMG}
              alt={name}
              fill
              sizes="(max-width: 1200px) 100vw, 1152px"
              priority
              fallbackSrc={FALLBACK_ROOM_IMG}
              className="object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImg(idx)}
                  className={`w-24 h-16 rounded-xl overflow-hidden relative shrink-0 border-2 transition-all cursor-pointer ${
                    activeImg === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <SmartImage
                    src={img}
                    alt=""
                    fill
                    sizes="96px"
                    fallbackSrc={FALLBACK_ROOM_IMG}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Details & Rooms */}
          <div className="flex-1 space-y-10 w-full">
            {/* Description Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{t('overview')}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{t('amenities')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {effectiveAmenities.map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-700 text-xs font-medium">
                    <span className="text-base shrink-0">{AMENITY_ICONS[amenity] || '✓'}</span>
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms Section */}
            <div id="rooms-section" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t('availableRooms')}</h2>
                  <p className="text-xs text-slate-500 mt-1">{t('selectRoomTip')}</p>
                </div>
              </div>

              {hotel.rooms && hotel.rooms.length > 0 ? (
                <div className="space-y-4">
                  {hotel.rooms.map((room: any) => (
                    <HotelRoomCard
                      key={room._id || room.name}
                      room={room}
                      isSelected={selectedRoom?._id === room._id}
                      defaultImg={images[0]}
                      onSelect={handleSelectRoom}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100">
                  <p>{t('noRoomsAvailable')}</p>
                </div>
              )}
            </div>

            {/* Hotel Policies Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">{t('hotelPolicies')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('checkInFrom')}</span>
                    <span>{hotel.checkInTime || '14:00'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('checkOutBefore')}</span>
                    <span>{hotel.checkOutTime || '12:00'}</span>
                  </div>
                </div>
              </div>

              {hotel.policies && hotel.policies.length > 0 ? (
                <ul className="space-y-3 pt-1">
                  {hotel.policies.map((policy: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{policy}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">{t('noPolicies')}</p>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Form */}
          <HotelBookingSidebar
            selectedRoom={selectedRoom}
            formData={formData}
            error={error}
            nights={nights}
            totalPrice={totalPrice}
            isPending={bookingMutation.isPending}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
