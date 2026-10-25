'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import { CardSkeleton } from '@/components/ui/Skeleton';
import TourCard from '@/components/tours/TourCard';

const fetchFeaturedTours = async () => {
  try {
    const res: any = await api.get('/tours?isFeatured=true&limit=6');
    const featured = res?.data || [];
    if (Array.isArray(featured) && featured.length >= 6) {
      return featured.slice(0, 6);
    }
    const fallbackRes: any = await api.get('/tours?limit=12');
    const allTours = fallbackRes?.data || [];
    const existingIds = new Set((featured || []).map((t: any) => t._id || t.id || t.slug));
    const combined = [...(featured || []), ...allTours.filter((t: any) => !existingIds.has(t._id || t.id || t.slug))];
    return combined.slice(0, 6);
  } catch {
    const fallbackRes: any = await api.get('/tours?limit=6');
    return (fallbackRes?.data || []).slice(0, 6);
  }
};

export default function FeaturedTours() {
  const t = useTranslations();
  const locale = useLocale();

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: fetchFeaturedTours,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>{t('featured.badge', { fallback: 'Trải Nghiệm Đỉnh Cao' })}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('featured.title')}</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">{t('featured.subtitle')}</p>
        </div>
        <Link 
          href={`/${locale}/tours`} 
          className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm group"
        >
          <span>{t('featured.viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} height="h-[420px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {tours.map((tour: any) => (
            <TourCard key={tour._id || tour.id} tour={tour} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
