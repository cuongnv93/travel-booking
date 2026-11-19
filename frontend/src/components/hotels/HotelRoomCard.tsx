'use client';

import { memo } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import { Maximize, BedDouble, User, Check, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { FALLBACK_ROOM_IMG, getAmenityIcon, getLocalizedAmenity } from './amenitiesConstants';

const ROOM_EXTRA_LABELS: Record<string, { soldOut: string; fewLeft: string }> = {
  vi: { soldOut: 'Hết phòng', fewLeft: 'Chỉ còn {count} phòng' },
  en: { soldOut: 'Sold out', fewLeft: 'Only {count} left' },
  zh: { soldOut: '已售罄', fewLeft: '仅剩 {count} 间' },
  ko: { soldOut: '매진', fewLeft: '남은 객실 {count}개' },
  ja: { soldOut: '満室', fewLeft: '残り {count} 室' },
};

export interface HotelRoomCardProps {
  room: any;
  isSelected: boolean;
  defaultImg: string;
  discountRatio?: number;
  onSelect: (room: any) => void;
  t: (key: string) => string;
}

export const HotelRoomCard = memo(function HotelRoomCard({
  room,
  isSelected,
  defaultImg,
  discountRatio = 1,
  onSelect,
  t,
}: HotelRoomCardProps) {
  const locale = useLocale();
  const extraText = ROOM_EXTRA_LABELS[locale] || ROOM_EXTRA_LABELS.vi;
  const roomImg = (Array.isArray(room.images) && room.images[0]) || defaultImg || FALLBACK_ROOM_IMG;

  const rawStock =
    typeof room.availableRooms === 'number'
      ? room.availableRooms
      : typeof room.stock === 'number'
        ? room.stock
        : typeof room.quantity === 'number'
          ? room.quantity
          : null;

  const isSoldOut = room.isAvailable === false || (rawStock !== null && rawStock <= 0);
  const isLowStock = !isSoldOut && rawStock !== null && rawStock <= 3;

  const basePrice = Number(room.price || 0);
  const effectivePrice = typeof room.flashSalePrice === 'number' && room.flashSalePrice > 0
    ? Math.min(basePrice, room.flashSalePrice)
    : discountRatio < 1
      ? Math.round(basePrice * discountRatio)
      : basePrice;
  const hasDiscount = effectivePrice < basePrice;

  const adultsCap = room.capacity?.adults ?? 2;
  const childrenCap = room.capacity?.children ?? 0;

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden shadow-sm border-2 transition-all ${
        isSoldOut
          ? 'border-slate-100 opacity-75'
          : isSelected
            ? 'border-blue-500 ring-4 ring-blue-500/10'
            : 'border-slate-100 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Room Image with SmartImage */}
        <div className="w-full aspect-[16/10] md:aspect-auto md:w-72 md:min-h-[210px] relative shrink-0 overflow-hidden bg-slate-100">
          <SmartImage
            src={roomImg}
            alt={room.name || 'Room'}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            fallbackSrc={FALLBACK_ROOM_IMG}
            className="object-cover"
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center z-10">
              <span className="bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                {extraText.soldOut}
              </span>
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {isLowStock && rawStock !== null && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {extraText.fewLeft.replace('{count}', String(rawStock))}
                  </span>
                )}
                {isSelected && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t('selected')}
                  </span>
                )}
              </div>
            </div>

            {room.description && (
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{room.description}</p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-slate-600">
              {room.size ? (
                <span className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 text-slate-400" /> {room.size} m²
                </span>
              ) : null}
              {room.bedType ? (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-slate-400" /> {room.bedType}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> {adultsCap} {t('adults')}
                {childrenCap > 0 && `, ${childrenCap} ${t('children')}`}
              </span>
            </div>

            {/* Room Amenities */}
            {Array.isArray(room.amenities) && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.filter(Boolean).map((amenity: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>{getAmenityIcon(amenity)}</span>
                    <span>{getLocalizedAmenity(amenity, locale)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price & Action */}
          <div className="flex items-end justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{t('pricePerNight')}</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-2xl font-bold text-orange-500">{formatPrice(effectivePrice)}</p>
                {hasDiscount && (
                  <p className="text-xs text-slate-400 line-through">{formatPrice(basePrice)}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => onSelect(room)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-colors shrink-0 ${
                isSoldOut
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isSelected
                    ? 'bg-blue-100 text-blue-700 cursor-pointer'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isSoldOut ? extraText.soldOut : isSelected ? t('selecting') : t('selectRoomBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
