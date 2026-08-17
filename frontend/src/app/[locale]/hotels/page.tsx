import { Suspense } from 'react';
import { prefetchHotels, prefetchHotelLocations, prefetchSettings } from '@/lib/serverApi';
import HotelsClient from './HotelsClient';

export default async function HotelsPage() {
  const [initialHotels, initialLocations, settings] = await Promise.all([
    prefetchHotels(),
    prefetchHotelLocations(),
    prefetchSettings(),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const hotelsBanner = pageBanners?.hotelsBanner || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600';

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="h-72 md:h-96 rounded-3xl bg-slate-200 animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(n => <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    }>
      <HotelsClient initialHotels={initialHotels} initialLocations={initialLocations} hotelsBanner={hotelsBanner} />
    </Suspense>
  );
}