'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TourBookingForm from '@/components/tours/TourBookingForm';
import TourCard from '@/components/tours/TourCard';
import api from '@/lib/api';
import {
  Star, Clock, MapPin, CheckCircle2, UserCheck, ShieldCheck,
  Calendar, Sparkles, AlertCircle, FileText, Compass, Info, Flame, Zap
} from 'lucide-react';
import { getI18nText, formatPrice } from '@/lib/utils';

const safeIsoDate = (dateVal: any): string => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const safeFormatDate = (dateVal: any): string => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
};

const fetchFeaturedTours = async () => {
  try {
    const res: any = await api.get('/tours?isFeatured=true');
    const list = Array.isArray(res) ? res : (res?.tours || res?.data || []);
    return list;
  } catch {
    return [];
  }
};

export default function TourDetailClient({
  tour,
  locale
}: {
  tour: any;
  locale: string;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  const title = getI18nText(tour?.title, locale);
  const description = getI18nText(tour?.description, locale);
  const durationText = typeof tour?.duration === 'number' ? `${tour.duration} ngày` : (tour?.duration || '3 ngày');
  const destination = tour?.destination || tour?.location || 'Việt Nam';
  const images = Array.isArray(tour?.images) && tour.images.length > 0 ? tour.images : ['https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800'];

  const validDepartureDates = Array.isArray(tour?.departureDates)
    ? tour.departureDates.filter((dep: any) => dep && dep.date && safeIsoDate(dep.date))
    : [];

  const basePrice = tour?.price || 0;

  // Fetch 4 featured tours for the bottom section
  const { data: allFeatured = [] } = useQuery({
    queryKey: ['featured-tours-related'],
    queryFn: fetchFeaturedTours,
  });

  const otherTours = allFeatured
    .filter((t: any) => t.slug !== tour.slug && t._id !== tour._id)
    .slice(0, 4);

  return (
    <article className="container mx-auto px-4 py-6 mt-16 md:mt-20">
      {/* Header Title Section */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
          <span className="bg-blue-600 text-white px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            📍 {destination}
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-extrabold text-slate-900">{tour?.rating || 4.8}</span>
            <span className="text-slate-500">({tour?.reviewCount || 124} đánh giá)</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">{title}</h1>
      </header>

      {/* Main 2-Column Layout: Left 3/4 (Gallery + Detailed Sections) & Right 1/4 (Sticky Booking Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left 3/4 Column (lg:col-span-8) - Matches Photo Banner Width */}
        <div className="lg:col-span-8 space-y-10 min-w-0">
          {/* Photo Gallery Banner */}
          <div className="space-y-3">
            <div className="h-[280px] sm:h-[360px] md:h-[420px] bg-slate-950 rounded-3xl overflow-hidden shadow-lg relative">
              <img src={images[activeImg] || images[0]} alt={title} className="w-full h-full object-cover" />
              <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-xl border border-white/20">
                {activeImg + 1} / {images.length} Ảnh
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImg === idx ? 'border-blue-600 scale-105 shadow-sm opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-y border-slate-200">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Thời gian</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">{durationText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Điểm đến</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">{destination}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Quy mô đoàn</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">{tour?.maxGuests || 20} người</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Bảo hiểm</span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">Bao gồm</span>
              </div>
            </div>
          </div>

          {/* Departure Schedule Table */}
          {validDepartureDates.length > 0 && (
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Lịch Khởi Hành Gần Nhất</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="text-slate-500 font-bold border-b border-blue-200/60 pb-2.5">
                    <tr>
                      <th className="pb-3">Ngày khởi hành</th>
                      <th className="pb-3">Giá tour</th>
                      <th className="pb-3">Tình trạng</th>
                      <th className="pb-3 text-right">Lựa chọn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100 text-slate-700">
                    {validDepartureDates.map((dep: any, idx: number) => {
                      const dStr = safeIsoDate(dep.date);
                      const formatted = safeFormatDate(dep.date);
                      const isSelected = selectedDate === dStr;
                      return (
                        <tr key={idx} className="hover:bg-blue-100/40 transition-colors">
                          <td className="py-3 font-bold text-slate-900 text-sm">{formatted}</td>
                          <td className="py-3 font-extrabold text-orange-600 text-sm sm:text-base">{formatPrice(dep.price || tour.price)}</td>
                          <td className="py-3">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-md">
                              Còn {dep.availableSlots || 15} chỗ
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setSelectedDate(dStr)}
                              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isSelected ? 'Đã chọn ✓' : 'Chọn ngày'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 1: Tổng quan & Điểm Nhấn Chương Trình */}
          <section className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 fill-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Điểm Nhấn Chương Trình Nổi Bật
              </h2>
            </div>

            <p className="text-slate-700 leading-relaxed text-sm sm:text-base bg-slate-50 p-5 rounded-2xl border border-slate-100/80">
              {description}
            </p>

            {Array.isArray(tour?.highlights) && tour.highlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {tour.highlights.map((h: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 text-slate-800 font-bold text-sm border border-blue-100/80 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{getI18nText(h, locale)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Lịch Trình Chi Tiết */}
          <section className="space-y-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Lịch Trình Chi Tiết Khám Phá ({Array.isArray(tour?.itinerary) ? tour.itinerary.length : 0} ngày)
              </h2>
            </div>

            {Array.isArray(tour?.itinerary) && tour.itinerary.length > 0 ? (
              <div className="space-y-6">
                {tour.itinerary.map((day: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {i + 1}
                      </div>
                      {i !== tour.itinerary.length - 1 && <div className="w-0.5 h-full bg-blue-100 mt-2" />}
                    </div>
                    <div className="pb-4 flex-1 bg-slate-50/90 p-5 sm:p-6 rounded-2xl border border-slate-200/60">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{getI18nText(day.title, locale)}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{getI18nText(day.description, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                Vui lòng liên hệ bộ phận CSKH để nhận bản lịch trình chi tiết theo ngày.
              </p>
            )}
          </section>

          {/* Section 3: Những Thông Tin Cần Lưu Ý & Quy Định */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Những Thông Tin Cần Lưu Ý & Điều Khoản
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-slate-700">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-3 text-blue-700 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /> Giá Tour Đã Bao Gồm:
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 list-disc pl-5 text-slate-700">
                  <li>Xe ô tô du lịch chất lượng cao đưa đón toàn tuyến.</li>
                  <li>Khách sạn / Resort tiêu chuẩn 3-5 sao (2 người/phòng).</li>
                  <li>Tất cả các bữa ăn theo tiêu chuẩn chương trình.</li>
                  <li>Vé vào cổng tất cả các điểm tham quan theo lịch trình.</li>
                  <li>Hướng dẫn viên tiếng Việt chuyên nghiệp suốt tuyến.</li>
                  <li>Bảo hiểm du lịch mức bồi thường tối đa 100.000.000đ/vụ.</li>
                  <li>Nước uống khoáng chai (1 chai/người/ngày).</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <h3 className="font-extrabold text-slate-900 text-base mb-3 text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" /> Giá Tour Không Bao Gồm:
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 list-disc pl-5 text-slate-700">
                  <li>Thuế giá trị gia tăng VAT (8%).</li>
                  <li>Chi phí phụ thu phòng đơn (nếu khách đi 1 mình).</li>
                  <li>Chi phí cá nhân (giặt ủi, điện thoại, thức uống ngoài).</li>
                  <li>Tiền Tip cho Hướng dẫn viên và Tài xế (không bắt buộc).</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200/60 bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70">
                <h3 className="font-extrabold text-amber-900 text-sm mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600" /> Lưu ý Giấy Tờ Tùy Thân & Trẻ Em:
                </h3>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  • Quý khách vui lòng mang theo CCCD/Hộ chiếu bản gốc hợp lệ còn thời hạn.<br />
                  • Trẻ em dưới 14 tuổi chưa có CCCD phải mang theo Giấy khai sinh bản sao công chứng.<br />
                  • Vui lòng tập trung tại điểm hẹn trước giờ khởi hành 30 phút.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right 1/4 Column (lg:col-span-4) - STICKY FIXED on Scroll */}
        <aside className="lg:col-span-4 sticky top-24 z-20">
          <TourBookingForm tour={tour} selectedDateFromParent={selectedDate} />
        </aside>
      </div>

      {/* Section 4: Các Tour Du Lịch Nổi Bật Khác (Full-Width Bottom Grid) */}
      {otherTours.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-blue-600 uppercase tracking-widest mb-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Gợi Ý Dành Cho Bạn</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Các Tour Du Lịch Nổi Bật Khác
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">Khám phá những hành trình hấp dẫn được ưa chuộng nhất</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherTours.map((item: any) => (
              <TourCard key={item.slug || item._id} tour={item} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 flex items-center justify-between shadow-2xl md:hidden">
        <div>
          <span className="text-xs text-slate-500 block font-bold uppercase">Tổng cộng từ</span>
          <span className="text-xl font-extrabold text-orange-600">{formatPrice(basePrice)}</span>
        </div>
        <button
          onClick={() => {
            const el = document.getElementById('booking-form-card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold px-6 py-3 rounded-xl shadow-md text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" /> Đặt Ngay
        </button>
      </div>
    </article>
  );
}
