'use client';

import { memo } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import { Maximize, BedDouble, User, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AMENITY_ICONS, FALLBACK_ROOM_IMG } from './amenitiesConstants';

export interface HotelRoomCardProps {
  room: any;
  isSelected: boolean;
  defaultImg: string;
  onSelect: (room: any) => void;
  t: (key: string) => string;
}

export const HotelRoomCard = memo(function HotelRoomCard({
  room,
  isSelected,
  defaultImg,
  onSelect,
  t,
}: HotelRoomCardProps) {
  const roomImg = room.images?.[0] || defaultImg || FALLBACK_ROOM_IMG;

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden shadow-sm border-2 transition-all ${
        isSelected ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Room Image with SmartImage */}
        <div className="md:w-72 h-48 md:h-auto relative shrink-0 overflow-hidden bg-slate-100">
          <SmartImage
            src={roomImg}
            alt={room.name}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            fallbackSrc={FALLBACK_ROOM_IMG}
            className="object-cover"
          />
        </div>

        {/* Room Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
              {isSelected && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> {t('selected')}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{room.description}</p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-slate-400" /> {room.size} m²
              </span>
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-slate-400" /> {room.bedType}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> {room.capacity?.adults} {t('adults')}{' '}
                {room.capacity?.children > 0 && `, ${room.capacity?.children} ${t('children')}`}
              </span>
            </div>

            {/* Room Amenities */}
            {room.amenities && (
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.map((amenity: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    {AMENITY_ICONS[amenity] || '✓'} {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price & Action */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{t('pricePerNight')}</p>
              <p className="text-2xl font-bold text-orange-500">{formatPrice(room.price)}</p>
            </div>
            <button
              type="button"
              onClick={() => onSelect(room)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSelected ? t('selecting') : t('selectRoomBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
