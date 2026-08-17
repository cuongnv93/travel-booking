'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Search, Building2, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const fetchHotels = async (params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  const res: any = await api.get(`/hotels?${query}`);
  return Array.isArray(res) ? res : (res?.data || []);
};

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 1 triệu', min: '', max: '1000000' },
  { label: '1 – 2 triệu', min: '1000000', max: '2000000' },
  { label: '2 – 4 triệu', min: '2000000', max: '4000000' },
  { label: 'Trên 4 triệu', min: '4000000', max: '' },
];

interface Props {
  initialHotels: any[];
  initialLocations: string[];
  hotelsBanner: string;
}

export default function HotelsClient({ initialHotels, initialLocations, hotelsBanner }: Props) {
  const locale = useParams().locale as string;
  const t = useTranslations('filters');

  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<number>(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [showFilters, setShowFilters] = useState(false);

  const apiParams: Record<string, string> = {};
  if (locationFilter) apiParams.location = locationFilter;
  if (starFilter > 0) apiParams.stars = String(starFilter);
  if (priceRange.min) apiParams.priceMin = priceRange.min;
  if (priceRange.max) apiParams.priceMax = priceRange.max;

  const hasFilter = locationFilter !== '' || starFilter > 0 || priceRange.min !== '' || priceRange.max !== '';

  const { data: hotels = initialHotels, isLoading } = useQuery({
    queryKey: ['hotels', apiParams],
    queryFn: () => fetchHotels(apiParams),
    placeholderData: hasFilter ? keepPreviousData : initialHotels as any,
    enabled: hasFilter,
  });

  const displayHotels = hasFilter ? hotels : (hotels.length ? hotels : initialHotels);

  const filteredHotels = displayHotels.filter((h: any) => {
    if (!search.trim()) return true;
    const name = getI18nText(h.name, locale).toLowerCase();
    const loc = (h.location || '').toLowerCase();
    return name.includes(search.toLowerCase()) || loc.includes(search.toLowerCase());
  });

  const activeFilterCount = [starFilter > 0, locationFilter !== '', priceRange.min !== '' || priceRange.max !== ''].filter(Boolean).length;

  const clearFilters = () => {
    setStarFilter(0);
    setLocationFilter('');
    setPriceRange(PRICE_RANGES[0]);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Banner */}
      <div className="h-72 md:h-96 rounded-3xl overflow-hidden relative mb-10 shadow-2xl bg-slate-900 group">
        <img src={hotelsBanner} alt="Hotels Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-3 text-amber-300">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Nghỉ Dưỡng 5★</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">Khách Sạn & Resort Đẳng Cấp</h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">Đặt phòng nghỉ dưỡng cao cấp, đầy đủ tiện nghi với mức giá tốt nhất từ Travel.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
            <input type="text" placeholder="Tìm theo tên hoặc thành phố..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
          </div>

          <div className="relative min-w-[160px]">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer">
              <option value="">{t('allDests', { fallback: 'Tất cả địa điểm' })}</option>
              {initialLocations.map((loc: string) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              activeFilterCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{t('starRating', { fallback: 'Hạng sao' })}</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 5, 4, 3].map(s => (
                  <button key={s} onClick={() => setStarFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
                      starFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}>
                    {s === 0 ? t('allStars', { fallback: 'Tất cả' }) : <><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{s} Sao</>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{t('priceRange', { fallback: 'Mức giá / đêm' })}</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(range => (
                  <button key={range.label} onClick={() => setPriceRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      priceRange.label === range.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}>
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="md:col-span-2 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isLoading && (
        <p className="text-sm text-slate-500 mb-6">
          Tìm thấy <span className="font-bold text-slate-900">{filteredHotels.length}</span> khách sạn phù hợp
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(n => <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">Không tìm thấy khách sạn phù hợp</p>
          <p className="text-slate-500 text-sm mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          <button onClick={clearFilters} className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2">
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map((hotel: any) => {
            const name = getI18nText(hotel.name, locale);
            const description = getI18nText(hotel.description, locale);
            const image = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
            return (
              <div key={hotel._id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="h-60 bg-slate-800 relative overflow-hidden">
                  <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{hotel.stars} Sao
                  </div>
                  <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{hotel.location}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{hotel.address}</span>
                    </p>
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-3">{description}</p>
                    {hotel.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hotel.amenities.slice(0, 4).map((item: string, i: number) => (
                          <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{item}</span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-[11px] font-medium bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">+{hotel.amenities.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Giá phòng từ</p>
                      <p className="text-xl font-bold text-orange-500">{formatPrice(hotel.pricePerNight)}<span className="text-xs text-slate-500 font-normal">/đêm</span></p>
                    </div>
                    <Link href={`/${locale}/hotels/${hotel.slug}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors">
                      Xem & Đặt
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
