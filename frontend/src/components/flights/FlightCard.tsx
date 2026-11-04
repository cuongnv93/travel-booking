'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export interface FlightCardProps {
  flight: any;
  airlinesList?: any[];
  onSelectFlight: (flight: any) => void;
  t: (key: string) => string;
}

export const FlightCard = memo(function FlightCard({
  flight,
  airlinesList = [],
  onSelectFlight,
  t,
}: FlightCardProps) {
  const matchedAirline = airlinesList.find(
    (a: any) => a.code === flight.logo || (flight.airline && flight.airline.toLowerCase().includes(a.name.toLowerCase()))
  );

  const isPartner = matchedAirline?.isPartner ?? (flight.airline?.includes('Vietravel') || flight.logo === 'VU');
  const partnerBadge = matchedAirline?.partnerBadge || (isPartner ? t('vietravelPartner') : null);
  const badgeColor = matchedAirline?.badgeColor || (
    isPartner ? 'bg-amber-400 text-blue-950 border-amber-300' :
    flight.airline?.includes('Vietnam') || flight.logo === 'VN' ? 'bg-blue-900 text-yellow-300 border-blue-800' :
    flight.airline?.includes('Vietjet') || flight.logo === 'VJ' ? 'bg-red-600 text-white border-red-500' :
    'bg-emerald-600 text-white border-emerald-500'
  );
  const logoText = matchedAirline?.logoText || flight.logo || 'VN';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all group">
      <div className="flex items-center gap-3.5 min-w-[280px]">
        <div className={`w-12 h-12 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border ${badgeColor}`}>
          <span>{logoText}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-base leading-snug">{flight.airline}</h4>
            {isPartner && partnerBadge && (
              <span className="bg-amber-100/90 text-amber-900 border border-amber-300/80 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                {partnerBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{flight.flightNumber} • {t('directFlight')}</p>
        </div>
      </div>

      <div className="text-center bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100/80 min-w-[180px]">
        <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">{flight.departureTime} &rarr; {flight.arrivalTime}</p>
        <p className="text-xs text-slate-500 font-medium">{t('duration')}: {flight.duration || '2h 15m'}</p>
      </div>

      <div className="text-right flex items-center gap-4 self-end md:self-auto min-w-[200px] justify-end">
        <div>
          <p className="text-xs text-slate-400">{t('taxIncluded')}</p>
          <p className="text-2xl font-bold text-orange-600 leading-tight">{formatPrice(flight.price)}</p>
        </div>
        <Button
          type="button"
          onClick={() => onSelectFlight(flight)}
          className="rounded-xl px-5 py-2.5 font-bold text-sm cursor-pointer"
        >
          {t('selectFlight')}
        </Button>
      </div>
    </div>
  );
});
