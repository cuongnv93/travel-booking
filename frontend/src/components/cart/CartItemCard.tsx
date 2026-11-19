'use client';

import { memo } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { formatPrice, formatLocalizedDate, getI18nText } from '@/lib/utils';
import type { CartItem, I18nText } from '@/types';

export interface CartItemDataShape {
  _id?: string;
  id?: string;
  slug?: string;
  title?: I18nText | string;
  name?: I18nText | string;
  images?: string[];
  destination?: I18nText | string;
  location?: I18nText | string;
  price?: number;
  pricePerNight?: number;
  maxGuests?: number;
  availableSeats?: number;
  roomName?: string;
  departureDates?: Array<{ date: string | Date; price?: number; availableSlots?: number }>;
}

export interface CartItemWithData extends CartItem {
  itemData: CartItemDataShape;
}

export interface CartItemCardProps {
  item: CartItemWithData;
  index?: number;
  locale: string;
  onRemove: (itemId: string, travelDate: string) => void;
  onGuestChange: (item: CartItemWithData, guestType: 'adults' | 'children', delta: number) => void;
  t: (key: string) => string;
}

const FALLBACK_TOUR_THUMB = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';
const FALLBACK_HOTEL_THUMB = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
const FALLBACK_FLIGHT_THUMB = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800';

const safeIsoDate = (dateVal: string | Date | undefined): string => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const CartItemCard = memo(function CartItemCard({
  item,
  locale,
  onRemove,
  onGuestChange,
  t,
}: CartItemCardProps) {
  const itemId = String(item.itemData._id || item.itemData.id || item.itemData.slug || '');
  const title = getI18nText(item.itemData.title || item.itemData.name, locale);
  const destinationLabel = getI18nText(
    item.itemData.destination || item.itemData.location,
    locale,
    t('vietnam')
  );
  const isTour = item.type === 'tour';
  const isHotel = item.type === 'hotel';
  const fallbackThumb = isHotel
    ? FALLBACK_HOTEL_THUMB
    : isTour
    ? FALLBACK_TOUR_THUMB
    : FALLBACK_FLIGHT_THUMB;
  const thumbSrc = item.itemData.images?.[0] || fallbackThumb;

  const adults = item.guests?.adults || 1;
  const children = item.guests?.children || 0;
  const totalGuests = adults + children;

  const matchingDep = Array.isArray(item.itemData.departureDates)
    ? item.itemData.departureDates.find((dep) => safeIsoDate(dep.date) === item.travelDate)
    : undefined;
  const maxGuestLimit = Number(
    matchingDep?.availableSlots || item.itemData.availableSeats || item.itemData.maxGuests || 0
  );
  const isAtMaxGuests = maxGuestLimit > 0 && totalGuests >= maxGuestLimit;

  const formattedDate = formatLocalizedDate(item.travelDate, locale) || item.travelDate;
  const formattedCheckOut = item.checkOut
    ? formatLocalizedDate(item.checkOut, locale) || item.checkOut
    : '';

  return (
    <article className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Thumbnail Image using SmartImage for zero CLS & responsive sizing */}
        <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
          <SmartImage
            src={thumbSrc}
            alt={title || t('package_tour')}
            fill
            sizes="(max-width: 640px) 100vw, 176px"
            fallbackSrc={fallbackThumb}
            className="object-cover"
          />
          <span className="absolute top-2 left-2 z-10 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {isTour ? t('package_tour') : isHotel ? t('hotelBadge') : t('flightBadge')}
          </span>
        </div>

        {/* Service Info & Controls */}
        <div className="flex-1 space-y-3 w-full min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-0.5">
                {t('service_code')} {item.type.toUpperCase()}-{(itemId || '').slice(-6).toUpperCase()}
              </span>
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 leading-snug break-words">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onRemove(itemId, item.travelDate)}
              aria-label={`${t('remove_from_cart')} ${title}`}
              title={t('remove_from_cart')}
              className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {isHotel ? t('checkinDate') : t('departure_date')}{' '}
                <strong className="text-slate-900">
                  {formattedDate}
                  {formattedCheckOut ? ` → ${formattedCheckOut}` : ''}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                {t('destination')} <strong className="text-slate-900">{destinationLabel}</strong>
              </span>
            </div>
          </div>

          {/* Guest Counter Controls */}
          <div className="flex flex-wrap justify-between items-center pt-2 gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              {/* Adults Counter */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{t('adults')}</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => onGuestChange(item, 'adults', -1)}
                    aria-label={`${t('adults')} -`}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-extrabold text-slate-900 tabular-nums">{adults}</span>
                  <button
                    type="button"
                    disabled={isAtMaxGuests}
                    onClick={() => onGuestChange(item, 'adults', 1)}
                    aria-label={`${t('adults')} +`}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{t('children')}</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => onGuestChange(item, 'children', -1)}
                    aria-label={`${t('children')} -`}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-extrabold text-slate-900 tabular-nums">{children}</span>
                  <button
                    type="button"
                    disabled={isAtMaxGuests}
                    onClick={() => onGuestChange(item, 'children', 1)}
                    aria-label={`${t('children')} +`}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                {t('total_amount')}
              </span>
              <span className="font-extrabold text-lg md:text-xl text-orange-600">
                {formatPrice(item.totalPrice || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});
