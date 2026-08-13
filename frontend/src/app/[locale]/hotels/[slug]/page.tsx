'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice, getI18nText } from '@/lib/utils';
import {
  Star, MapPin, Wifi, ChevronLeft, CheckCircle2,
  CalendarDays, Users, BedDouble, Phone, Mail, ArrowRight,
  Loader2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const AMENITY_ICONS: Record<string, string> = {
  'WiFi miễn phí': '📶', 'Hồ bơi': '🏊', 'Buffet sáng': '🍳', 'Spa & Massage': '💆',
  'Phòng gym': '🏋️', 'Bar': '🍹', 'Nhà hàng': '🍽️', 'Bãi biển riêng': '🏖️',
  'Đưa đón sân bay': '🚗', 'Kids club': '🧒', 'Yoga': '🧘', 'Tắm ngâm thảo mộc': '🛁',
  'Lò sưởi': '🔥', 'Bar roof-top': '🌆',
};

export default function HotelDetailPage() {
  const { locale, slug } = useParams() as { locale: string; slug: string };
  const [activeImg, setActiveImg] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    checkIn: '', checkOut: '',
    rooms: 1, adults: 2, children: 0,
    notes: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: hotel, isLoading, isError } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: async () => {
      const res: any = await api.get(`/hotels/${slug}`);
      return res;
    },
    enabled: !!slug,
  });

  const nights = (() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const d1 = new Date(formData.checkIn), d2 = new Date(formData.checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  })();

  const totalPrice = hotel ? hotel.pricePerNight * nights * formData.rooms : 0;

  const bookingMutation = useMutation({
    mutationFn: async () => {
      return api.post('/bookings', {
        type: 'hotel',
        hotelId: hotel._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: { adults: formData.adults, children: formData.children },
        rooms: formData.rooms,
        totalPrice,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
        },
      });
    },
    onSuccess: () => { setSuccess(true); setError(''); },
    onError: (err: any) => setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại.');
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      setError('Vui lòng chọn ngày nhận phòng và trả phòng.');
      return;
    }
    if (nights <= 0) {
      setError('Ngày trả phòng phải sau ngày nhận phòng.');
      return;
    }
    setError('');
    bookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 mt-20 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500">Đang tải thông tin khách sạn...</p>
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="container mx-auto px-4 py-20 mt-20 text-center">
        <p className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy khách sạn</p>
        <Link href={`/${locale}/hotels`} className="text-blue-600 hover:underline text-sm">← Quay lại danh sách</Link>
      </div>
    );
  }

  const name = getI18nText(hotel.name, locale);
  const description = getI18nText(hotel.description, locale);
  const images = hotel.images?.length ? hotel.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];

  return (
    <div className="mt-20 pb-20">
      {/* Image Gallery */}
      <div className="relative bg-slate-900">
        <div className="container mx-auto px-4 pt-6">
          <Link href={`/${locale}/hotels`}
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>

        {/* Main image */}
        <div className="w-full h-72 md:h-[480px] overflow-hidden">
          <img src={images[activeImg]} alt={name}
            className="w-full h-full object-cover" />
        </div>

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="container mx-auto px-4">
            <div className="flex gap-2 mt-3 pb-4 overflow-x-auto">
              {images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImg(idx)}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImg === idx ? 'border-blue-400 scale-105' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Hotel Info */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{hotel.stars} Sao</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{name}</h1>
              <p className="text-slate-500 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                {hotel.address} — {hotel.location}
              </p>
            </div>

            {/* Price highlight */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 mb-6 inline-flex items-center gap-3">
              <div>
                <p className="text-xs text-slate-500">Giá từ</p>
                <p className="text-2xl font-bold text-orange-500">{formatPrice(hotel.pricePerNight)}<span className="text-sm font-normal text-slate-500">/đêm</span></p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Giới thiệu</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
            </div>

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Tiện nghi nổi bật</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hotel.amenities.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                      <span className="text-lg">{AMENITY_ICONS[item] || '✓'}</span>
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">📋 Chính sách & Lưu ý</h2>
              <ul className="text-sm text-slate-600 space-y-1.5">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Check-in từ 14:00 | Check-out trước 12:00</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Hủy miễn phí trước 3 ngày nhận phòng</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Không hút thuốc trong phòng</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Thú cưng không được phép mang vào</li>
              </ul>
            </div>
          </div>

          {/* Right: Booking Form — Sticky Sidebar */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sticky top-24">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Đặt Phòng Thành Công!</h3>
                  <p className="text-sm text-slate-500 mb-4">Chúng tôi sẽ liên hệ xác nhận qua email và điện thoại của bạn trong vòng 2 giờ.</p>
                  <button onClick={() => setSuccess(false)}
                    className="text-sm text-blue-600 font-semibold hover:underline">Đặt phòng khác</button>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Đặt Phòng Ngay</h3>
                  <p className="text-xs text-slate-400 mb-5">Điền thông tin bên dưới để xác nhận phòng</p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Nhận phòng *</label>
                        <div className="relative">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input type="date" value={formData.checkIn} min={new Date().toISOString().split('T')[0]}
                            onChange={e => setFormData(p => ({ ...p, checkIn: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Trả phòng *</label>
                        <div className="relative">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input type="date" value={formData.checkOut} min={formData.checkIn || new Date().toISOString().split('T')[0]}
                            onChange={e => setFormData(p => ({ ...p, checkOut: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Rooms & Guests */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Phòng</label>
                        <div className="relative">
                          <BedDouble className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input type="number" min={1} max={10} value={formData.rooms}
                            onChange={e => setFormData(p => ({ ...p, rooms: Number(e.target.value) }))}
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Người lớn</label>
                        <input type="number" min={1} max={20} value={formData.adults}
                          onChange={e => setFormData(p => ({ ...p, adults: Number(e.target.value) }))}
                          className="w-full border border-slate-200 rounded-lg px-2 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Trẻ em</label>
                        <input type="number" min={0} max={10} value={formData.children}
                          onChange={e => setFormData(p => ({ ...p, children: Number(e.target.value) }))}
                          className="w-full border border-slate-200 rounded-lg px-2 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <label className="font-semibold text-slate-700 block mb-1">Họ và tên *</label>
                      <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Số điện thoại *</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          placeholder="0912 345 678"
                          className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Ghi chú</label>
                      <textarea rows={2} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Yêu cầu đặc biệt, giờ nhận phòng..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 resize-none" />
                    </div>

                    {/* Price Summary */}
                    {nights > 0 && (
                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                          <span>{formatPrice(hotel.pricePerNight)} × {nights} đêm × {formData.rooms} phòng</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-1.5">
                          <span>Tổng cộng</span>
                          <span className="text-orange-500 text-base">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={bookingMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                      {bookingMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Đang xử lý...</>
                      ) : (
                        <>Xác Nhận Đặt Phòng <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
