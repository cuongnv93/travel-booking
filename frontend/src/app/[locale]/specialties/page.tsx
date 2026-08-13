'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Utensils, MapPin } from 'lucide-react';
import { formatPrice, getI18nText } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchSpecialties = async () => {
  const res: any = await api.get('/specialties');
  return Array.isArray(res) ? res : (res?.data || []);
};

export default function SpecialtiesPage() {
  const locale = useParams().locale as string;
  const [selectedRegion, setSelectedRegion] = useState('');

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: fetchSpecialties,
  });

  const regions = [
    { key: '', label: 'Tất cả vùng miền' },
    { key: 'Miền Bắc', label: 'Ẩm thực Miền Bắc' },
    { key: 'Miền Trung', label: 'Ẩm thực Miền Trung' },
    { key: 'Miền Nam', label: 'Ẩm thực Miền Nam' }
  ];

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const specialtiesBanner = pageBanners?.specialtiesBanner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600';

  const filteredSpecialties = specialties.filter((s: any) => {
    return !selectedRegion || s.region === selectedRegion;
  });

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Hero Banner */}
      <div className="h-64 md:h-80 rounded-3xl overflow-hidden relative mb-10 shadow-2xl bg-slate-900 group">
        <img
          src={specialtiesBanner}
          alt="Specialties Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl text-white">
          <span className="bg-orange-600/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            🍜 Ẩm Thực & Món Ngon
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">Đặc Sản Địa Phương</h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed">
            Thưởng thức và khám phá tinh hoa ẩm thực phong phú trên khắp 3 miền Việt Nam.
          </p>
        </div>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-3 mb-10 pb-4 border-b border-slate-100">
        {regions.map((reg) => (
          <button
            key={reg.key}
            onClick={() => setSelectedRegion(reg.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              selectedRegion === reg.key
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {reg.label}
          </button>
        ))}
      </div>

      {/* Specialties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredSpecialties.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">Chưa có đặc sản trong mục này</p>
          <p className="text-slate-500 text-sm">Vui lòng chọn vùng miền khác để khám phá.</p>
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
                  <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.region || 'Đặc sản'}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {name}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
                      {description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Tham khảo khoảng</p>
                      <p className="text-xl font-bold text-orange-500">{formatPrice(item.price || 50000)}</p>
                    </div>
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