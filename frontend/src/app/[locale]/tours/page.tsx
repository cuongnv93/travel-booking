'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import TourCard from '@/components/tours/TourCard';
import { Filter, SlidersHorizontal, MapPin, Sparkles, X } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchFilteredTours = async ({ destination, category, priceRange, sort, isFeatured }: any) => {
  let queryStr = '/tours?';
  if (destination) queryStr += `destination=${encodeURIComponent(destination)}&`;
  if (category) queryStr += `category=${encodeURIComponent(category)}&`;
  if (sort) queryStr += `sort=${encodeURIComponent(sort)}&`;
  if (isFeatured) queryStr += `isFeatured=true&`;
  
  if (priceRange === 'under2m') queryStr += 'maxPrice=2000000&';
  else if (priceRange === '2m-5m') queryStr += 'minPrice=2000000&maxPrice=5000000&';
  else if (priceRange === 'above5m') queryStr += 'minPrice=5000000&';

  const res: any = await api.get(queryStr);
  return res?.data || [];
};

export default function ToursPage() {
  const locale = useParams().locale as string;
  const searchParams = useSearchParams();
  const t = useTranslations('filters');

  const initialDest = searchParams.get('destination') || '';
  const initialCat = searchParams.get('category') || '';
  const isFeaturedParam = searchParams.get('isFeatured') === 'true';

  const [destination, setDestination] = useState(initialDest);
  const [category, setCategory] = useState(initialCat);
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('');

  // Sync state when URL params change
  useEffect(() => {
    setDestination(searchParams.get('destination') || '');
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600';
  const toursBanner = pageBanners?.toursBanner || DEFAULT_BANNER;

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['tours', { destination, category, priceRange, sort, isFeatured: isFeaturedParam }],
    queryFn: () => fetchFilteredTours({ destination, category, priceRange, sort, isFeatured: isFeaturedParam }),
    placeholderData: keepPreviousData,
  });

  const bannerTitle = useMemo(() => {
    if (destination) return `Các Gói Du Lịch Tại ${destination}`;
    if (isFeaturedParam) return 'Gói Du Lịch Nổi Bật 2026';
    return 'Khám Phá Tất Cả Gói Du Lịch';
  }, [destination, isFeaturedParam]);

  const bannerSubtitle = useMemo(() => {
    if (destination) return `Danh sách các tour hấp dẫn nhất đang có sẵn tại ${destination}. Trải nghiệm trọn vẹn từng khoảnh khắc!`;
    if (isFeaturedParam) return 'Tuyển chọn những hành trình tuyệt vời nhất được đông đảo du khách đánh giá 5 sao.';
    return 'Tìm kiếm và lựa chọn những tour du lịch tuyệt vời nhất với giá hấp dẫn từ Travel.';
  }, [destination, isFeaturedParam]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Big Hero Image Banner from CMS */}
      <div className="h-72 md:h-96 rounded-3xl overflow-hidden relative mb-8 shadow-2xl bg-slate-900 group">
        <img 
          src={toursBanner} 
          alt="Tours Banner" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_BANNER;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-3 text-amber-300">
            {destination ? <MapPin className="w-3.5 h-3.5 text-amber-300" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>{destination ? `Điểm Đến: ${destination}` : 'Chuyến Đi Hấp Dẫn'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">
            {bannerTitle}
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            {bannerSubtitle}
          </p>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(destination || category || priceRange) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-blue-50/80 p-3 rounded-2xl border border-blue-100">
          <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Đang lọc theo:
          </span>

          {destination && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
              Điểm đến: {destination}
              <button onClick={() => setDestination('')} className="hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
              Danh mục: {category}
              <button onClick={() => setCategory('')} className="hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {priceRange && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
              Giá: {priceRange}
              <button onClick={() => setPriceRange('')} className="hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            onClick={() => { setDestination(''); setCategory(''); setPriceRange(''); }}
            className="text-xs font-extrabold text-red-600 hover:underline ml-auto"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>Bộ Lọc Tour</span>
              </div>
              {(destination || category || priceRange) && (
                <button 
                  onClick={() => { setDestination(''); setCategory(''); setPriceRange(''); }}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-2">{t('destinations', { fallback: 'Điểm đến' })}</label>
                <select 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
                >
                  <option value="">{t('allDests', { fallback: 'Tất cả điểm đến' })}</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Phú Quốc">Phú Quốc</option>
                  <option value="Sa Pa">Sa Pa</option>
                  <option value="Hạ Long">Hạ Long</option>
                  <option value="Cao Bằng">Cao Bằng</option>
                  <option value="Nha Trang">Nha Trang</option>
                  <option value="Huế">Huế</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">Loại hình du lịch</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
                >
                  <option value="">Tất cả danh mục</option>
                  <option value="city-tour">City Tour</option>
                  <option value="beach">Du lịch Biển</option>
                  <option value="nature">Khám phá thiên nhiên</option>
                  <option value="culture">Văn hóa & Lịch sử</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">{t('priceRange', { fallback: 'Mức giá' })}</label>
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="under2m">Dưới 2.000.000đ</option>
                  <option value="2m-5m">2.000.000đ - 5.000.000đ</option>
                  <option value="above5m">Trên 5.000.000đ</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Tour List */}
        <main className="flex-1">
          {/* Top Controls bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-sm font-medium text-slate-600">
              Hiển thị <span className="font-bold text-blue-600">{tours.length}</span> chuyến đi phù hợp
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">Sắp xếp:</span>
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tours.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <p className="text-xl font-bold text-slate-800 mb-2">Chưa có tour nào tại địa điểm này</p>
              <p className="text-slate-500 text-sm mb-6">Thử chọn địa điểm khác hoặc xóa tất cả bộ lọc để xem các hành trình độc đáo khác.</p>
              <button 
                onClick={() => { setDestination(''); setCategory(''); setPriceRange(''); setSort(''); }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
              >
                Xem tất cả các tour
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour: any) => (
                <TourCard key={tour._id || tour.id} tour={tour} locale={locale} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
