'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Utensils, MapPin, Search, X, Filter, Navigation } from 'lucide-react';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { fetchVietnamProvinces, VIETNAM_PROVINCES } from '@/lib/provinces';

const fetchSpecialties = async () => {
  const res: any = await api.get('/specialties');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function SpecialtiesPage() {
  const locale = useParams().locale as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: fetchSpecialties,
  });

  const { data: provinces = VIETNAM_PROVINCES } = useQuery({
    queryKey: ['vietnam-provinces'],
    queryFn: fetchVietnamProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const specialtiesBanner = pageBanners?.specialtiesBanner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600';

  const regions = [
    { key: '', label: 'Tất cả vùng miền' },
    { key: 'Miền Bắc', label: 'Miền Bắc' },
    { key: 'Miền Trung', label: 'Miền Trung' },
    { key: 'Miền Nam', label: 'Miền Nam' }
  ];

  // Extract unique locations from data
  const availableLocations = useMemo(() => {
    const locationsSet = new Set<string>();
    specialties.forEach((item: any) => {
      if (item.location) locationsSet.add(item.location);
    });
    return Array.from(locationsSet).sort();
  }, [specialties]);

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((s: any) => {
      const name = getI18nText(s.name, locale).toLowerCase();
      const desc = getI18nText(s.description, locale).toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const loc = (s.location || '').toLowerCase();
      const cleanFilter = selectedLocation.toLowerCase().replace(/^(tp\.|thành phố|tỉnh)\s*/gi, '').trim();
      const cleanLoc = loc.replace(/^(tp\.|thành phố|tỉnh)\s*/gi, '').trim();

      const matchesQuery = !query || name.includes(query) || desc.includes(query) || loc.includes(query);
      const matchesRegion = !selectedRegion || s.region === selectedRegion;
      const matchesLocation = !selectedLocation || cleanLoc.includes(cleanFilter) || cleanFilter.includes(cleanLoc);

      return matchesQuery && matchesRegion && matchesLocation;
    });
  }, [specialties, searchQuery, selectedRegion, selectedLocation, locale]);

  const hasActiveFilters = Boolean(searchQuery || selectedRegion || selectedLocation);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedLocation('');
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Hero Banner */}
      <div className="h-64 md:h-80 rounded-3xl overflow-hidden relative mb-8 shadow-xl bg-slate-900 group">
        <img
          src={specialtiesBanner}
          alt="Specialties Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl text-white">
          <span className="bg-orange-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-sm">
            🍜 Ẩm Thực & Món Ngon 3 Miền
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Đặc Sản Địa Phương</h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed font-medium">
            Thưởng thức và khám phá tinh hoa ẩm thực phong phú đại diện cho văn hóa từng tỉnh thành Việt Nam.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-md mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Dish Name */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm món ăn (VD: Phở, Bún chả, Mì Quảng, Bánh mì...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Select Location / Province */}
          <div className="md:col-span-4 relative">
            <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 font-medium appearance-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Tất cả {provinces.length} Tỉnh / Thành phố</option>
              {provinces.map((loc: string) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>

          {/* Clear Button */}
          <div className="md:col-span-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" /> Xóa bộ lọc
              </button>
            ) : (
              <div className="text-xs text-slate-400 font-medium text-center hidden md:block">
                {filteredSpecialties.length} món ngon
              </div>
            )}
          </div>
        </div>

        {/* Region Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Vùng miền:
          </span>
          {regions.map((reg) => (
            <button
              key={reg.key}
              type="button"
              onClick={() => setSelectedRegion(reg.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedRegion === reg.key
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specialties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredSpecialties.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
          <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy món ăn phù hợp</p>
          <p className="text-slate-500 text-sm mb-6">Hãy thử thay đổi từ khóa hoặc bộ lọc địa điểm / vùng miền.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpecialties.map((item: any) => {
            const name = getI18nText(item.name, locale);
            const description = getI18nText(item.description, locale);
            const image = item.image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800';

            return (
              <div
                key={item._id || item.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="h-56 bg-slate-800 relative overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges: Location & Region */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                    {item.location && (
                      <span className="bg-orange-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </span>
                    )}
                    {item.region && (
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                        {item.region}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {name}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4 font-normal">
                      {description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Giá tham khảo từ</p>
                      <p className="text-xl font-bold text-orange-500">{formatPrice(item.price || 50000)}</p>
                    </div>
                    {item.location && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        📍 {item.location}
                      </span>
                    )}
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