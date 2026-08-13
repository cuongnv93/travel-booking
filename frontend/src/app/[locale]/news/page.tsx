'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, User, ArrowRight, Tag, Clock } from 'lucide-react';
import { getI18nText } from '@/lib/utils';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

const fetchNews = async (selectedCategory?: string) => {
  const query = selectedCategory ? `/news?category=${selectedCategory}&limit=20` : '/news?limit=20';
  const res: any = await api.get(query);
  return res?.data || (Array.isArray(res) ? res : []);
};

const CATEGORIES = [
  { key: '', label: 'Tất cả bài viết' },
  { key: 'experience', label: '✈️ Kinh nghiệm' },
  { key: 'food', label: '🍜 Ẩm thực' },
  { key: 'destination', label: '🗺️ Điểm đến' },
  { key: 'international', label: '🌍 Quốc tế' },
];

export default function NewsPage() {
  const locale = useParams().locale as string;
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: newsList = [], isLoading } = useQuery({
    queryKey: ['news', selectedCategory],
    queryFn: () => fetchNews(selectedCategory),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const newsBanner = pageBanners?.newsBanner || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600';

  const featured = newsList[0];
  const rest = newsList.slice(1);

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      {/* Hero Banner */}
      <div className="h-64 md:h-80 rounded-3xl overflow-hidden relative mb-10 shadow-2xl bg-slate-900 group">
        <img
          src={newsBanner}
          alt="News Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl text-white">
          <span className="bg-emerald-600/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            📰 Cẩm Nang & Kinh Nghiệm
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Tin Tức & Cẩm Nang Du Lịch</h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Cập nhật kinh nghiệm, địa điểm và xu hướng du lịch mới nhất.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-slate-100">
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setSelectedCategory(cat.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === cat.key ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(n => <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />)}
          </div>
        </div>
      ) : newsList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <p className="text-xl font-semibold text-slate-700 mb-2">Chưa có bài viết nào</p>
          <p className="text-slate-500 text-sm">Thử chọn danh mục khác.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured Article */}
          {featured && (
            <Link href={`/${locale}/news/${featured.slug}`}
              className="group block bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 h-64 md:h-[420px] bg-slate-800 relative overflow-hidden shrink-0">
                  <img src={featured.thumbnail || 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800'}
                    alt={getI18nText(featured.title, locale)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Nổi bật
                  </div>
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="bg-teal-50 text-teal-700 font-semibold px-2.5 py-1 rounded-full">
                      {CATEGORIES.find(c => c.key === featured.category)?.label || featured.category}
                    </span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                      {new Date(featured.publishedAt || featured.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                    {getI18nText(featured.title, locale)}
                  </h2>
                  <p className="text-slate-500 leading-relaxed line-clamp-3 mb-6">
                    {getI18nText(featured.excerpt, locale)}
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                    <span>Đọc bài viết</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Rest Articles Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((article: any) => {
                const title = getI18nText(article.title, locale);
                const excerpt = getI18nText(article.excerpt, locale);
                const thumbnail = article.thumbnail || 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800';

                return (
                  <Link key={article._id} href={`/${locale}/news/${article.slug}`}
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="h-52 bg-slate-800 overflow-hidden relative">
                      <img src={thumbnail} alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {CATEGORIES.find(c => c.key === article.category)?.label || article.category}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                            {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{article.author || 'Biên tập viên'}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6">{excerpt}</p>
                      </div>

                      <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        <span>Đọc tiếp</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}