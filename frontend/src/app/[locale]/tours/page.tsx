import { Suspense } from 'react';
import { prefetchTours, prefetchSettings } from '@/lib/serverApi';
import ToursClient from './ToursClient';

export default async function ToursPage() {
  const [initialTours, settings] = await Promise.all([
    prefetchTours(),
    prefetchSettings(),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const toursBanner = pageBanners?.toursBanner || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600';

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="h-72 md:h-96 rounded-3xl bg-slate-200 animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    }>
      <ToursClient initialTours={initialTours} toursBanner={toursBanner} />
    </Suspense>
  );
}
