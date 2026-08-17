import { Suspense } from 'react';
import { prefetchSpecialties, prefetchSettings } from '@/lib/serverApi';
import SpecialtiesClient from './SpecialtiesClient';
import { VIETNAM_PROVINCES } from '@/lib/provinces';

export default async function SpecialtiesPage() {
  const [initialSpecialties, settings] = await Promise.all([
    prefetchSpecialties(),
    prefetchSettings(),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const specialtiesBanner = pageBanners?.specialtiesBanner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600';

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="h-64 md:h-80 rounded-3xl bg-slate-200 animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-80 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    }>
      <SpecialtiesClient
        initialSpecialties={initialSpecialties}
        initialProvinces={VIETNAM_PROVINCES}
        specialtiesBanner={specialtiesBanner}
      />
    </Suspense>
  );
}