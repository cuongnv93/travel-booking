'use client';

import { memo } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { formatPrice, getI18nText } from '@/lib/utils';

export interface CartItemCardProps {
  item: any;
  index: number;
  locale: string;
  onRemove: (itemId: string, travelDate: string) => void;
  onGuestChange: (item: any, guestType: 'adults' | 'children', delta: number) => void;
  t: (key: string, options?: any) => string;
}

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

export const CartItemCard = memo(function CartItemCard({
  item,
  index,
  locale,
  onRemove,
  onGuestChange,
  t,
}: CartItemCardProps) {
  const itemId = item.itemData._id || item.itemData.id || item.itemData.slug || '';
  const title = getI18nText(item.itemData.title || item.itemData.name, locale);
  const itemKey = `${itemId}-${item.travelDate}-${index}`;
  const isTour = item.type === 'tour';
  const isHotel = item.type === 'hotel';
  const thumbSrc = item.itemData.images?.[0] || FALLBACK_THUMB;

  return (
    <div key={itemKey} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Thumbnail Image using SmartImage for zero CLS & responsive sizing */}
        <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
          <SmartImage
            src={thumbSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 176px"
            fallbackSrc={FALLBACK_THUMB}
            className="object-cover"
          />
          <span className="absolute top-2 left-2 z-10 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {isTour ? t('package_tour', { fallback: 'Tour Trọn Gói' }) : isHotel ? t('hotelBadge', { fallback: 'Khách Sạn' }) : t('flightBadge', { fallback: 'Vé Máy Bay' })}
          </span>
        </div>

        {/* Tour Info & Controls */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-0.5">
                {t('service_code', { fallback: 'Mã Dịch Vụ:' })} {item.type.toUpperCase()}-{(itemId || '').slice(-6).toUpperCase()}
              </span>
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                {title}
              </h3>
            </div>
            <button 
              type="button"
              onClick={() => onRemove(itemId, item.travelDate)} 
              className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0 cursor-pointer"
              title={t('remove_from_cart', { fallback: 'Xóa khỏi giỏ hàng' })}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isHotel ? t('checkinDate', { fallback: 'Nhận phòng:' }) : t('departure_date', { fallback: 'Ngày khởi hành:' })} <strong className="text-slate-900">{item.travelDate}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('destination', { fallback: 'Điểm đến:' })} <strong className="text-slate-900">{item.itemData.destination || item.itemData.location || t('vietnam', { fallback: 'Việt Nam' })}</strong></span>
            </div>
          </div>

          {/* Guest Counter Controls */}
          <div className="flex flex-wrap justify-between items-center pt-2 gap-3">
            <div className="flex items-center gap-4 text-xs">
              {/* Adults Counter */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{t('adults', { fallback: 'Người lớn:' })}</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onGuestChange(item, 'adults', -1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 font-extrabold text-slate-900">{item.guests.adults || 1}</span>
                  <button
                    type="button"
                    onClick={() => onGuestChange(item, 'adults', 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{t('children', { fallback: 'Trẻ em:' })}</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onGuestChange(item, 'children', -1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 font-extrabold text-slate-900">{item.guests.children || 0}</span>
                  <button
                    type="button"
                    onClick={() => onGuestChange(item, 'children', 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('total_amount', { fallback: 'Thành tiền' })}</span>
              <span className="font-extrabold text-lg md:text-xl text-orange-600">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
