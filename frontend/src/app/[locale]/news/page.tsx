import { Suspense } from 'react';
import { prefetchNews, prefetchSettings } from '@/lib/serverApi';
import NewsClient from './NewsClient';

export default async function NewsPage() {
  const [initialNews, settings] = await Promise.all([
    prefetchNews(),
    prefetchSettings(),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const newsBanner = pageBanners?.newsBanner || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600';

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 mt-20">
        <div className="h-64 md:h-80 rounded-3xl bg-slate-200 animate-pulse mb-10" />
        <div className="space-y-6">
          <div className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(n => <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />)}
          </div>
        </div>
      </div>
    }>
      <NewsClient initialNews={initialNews} newsBanner={newsBanner} />
    </Suspense>
  );
}