'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { Users, Calendar, Zap, PhoneCall, ShieldCheck, CheckCircle } from 'lucide-react';
import { Tour } from '@/types';

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

interface TourBookingFormProps {
  tour: {
    id?: string;
    _id?: string;
    price: number;
    departureDates?: { date: string | Date; price?: number; availableSlots?: number }[];
    [key: string]: unknown;
  };
  selectedDateFromParent?: string;
}

export default function TourBookingForm({ tour, selectedDateFromParent }: TourBookingFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useParams().locale as string;
  const addItem = useCartStore(state => state.addItem);

  const [date, setDate] = useState(selectedDateFromParent || '');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Sync when parent updates selected date
  if (selectedDateFromParent && date !== selectedDateFromParent) {
    setDate(selectedDateFromParent);
  }

  const validDepartureDates = Array.isArray(tour?.departureDates)
    ? tour.departureDates.filter((dep: any) => dep && dep.date && safeIsoDate(dep.date))
    : [];

  const selectedDeparture = validDepartureDates.find(d => safeIsoDate(d.date) === date);

  const basePrice = selectedDeparture?.price || tour?.price || 0;
  const totalPrice = basePrice * adults + (basePrice * 0.7) * children;

  const handleAddToCart = () => {
    if (!date) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }

    addItem({
      tour: tour as unknown as Tour,
      travelDate: date,
      guests: { adults, children },
      totalPrice
    });

    router.push(`/${locale}/cart`);
  };

  return (
    <Card id="booking-form-card" className="p-6 border-slate-200 shadow-2xl rounded-3xl bg-white relative">
      {/* Header Price Section */}
      <div className="mb-5 pb-4 border-b border-slate-100 flex justify-between items-end">
        <div>
          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Giá tour 1 khách</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-orange-500">{formatPrice(basePrice)}</span>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Còn chỗ
        </span>
      </div>

      <div className="space-y-4.5 mb-5">
        {/* Departure Dates Selector */}
        {validDepartureDates.length > 0 ? (
          <div>
            <label className="text-sm font-extrabold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Chọn đợt khởi hành *</span>
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            >
              <option value="">-- Chọn ngày khởi hành --</option>
              {validDepartureDates.map((dep, idx) => {
                const dStr = safeIsoDate(dep.date);
                const formatted = safeFormatDate(dep.date);
                return (
                  <option key={idx} value={dStr}>
                    {formatted} — {formatPrice(dep.price || tour.price)} (Còn {dep.availableSlots || 15} chỗ)
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-sm font-extrabold text-slate-800 block mb-1.5">Ngày khởi hành *</label>
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
        )}

        {/* Guests count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">Người lớn (&ge;12t)</label>
            <Input
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
              icon={<Users className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">Trẻ em (70% giá)</label>
            <Input
              type="number"
              min={0}
              value={children}
              onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
              icon={<Users className="w-4 h-4 text-slate-400" />}
              className="text-sm font-bold"
            />
          </div>
        </div>
      </div>

      {/* Total Amount summary */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5 flex justify-between items-center">
        <div>
          <span className="text-xs font-extrabold text-slate-800 block">TỔNG TẠM TÍNH</span>
          <span className="text-xs text-slate-400">Đã bao gồm thuế & phí</span>
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">{formatPrice(totalPrice)}</span>
      </div>

      {/* Main High-Impact CTA Button */}
      <button
        onClick={handleAddToCart}
        className="w-full h-14 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mb-3"
      >
        <Zap className="w-5 h-5 fill-white" />
        <span>ĐẶT TOUR NGAY</span>
      </button>

      {/* Quick Consultation Call Button */}
      <a
        href="tel:1800646888"
        className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <PhoneCall className="w-4 h-4 text-emerald-600" />
        <span>Tư Vấn Trực Tiếp (1800 646 888)</span>
      </a>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
        <span className="flex items-center gap-1 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Giữ chỗ tức thì
        </span>
        <span>Thanh toán an toàn 100%</span>
      </div>
    </Card>
  );
}
