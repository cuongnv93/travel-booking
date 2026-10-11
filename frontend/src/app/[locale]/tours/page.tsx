import type { Metadata } from 'next';
import { Suspense } from 'react';
import { prefetchTours, prefetchSettings } from '@/lib/serverApi';
import ToursClient from './ToursClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Danh Sách Tour Du Lịch Trong Nước & Quốc Tế Giá Tốt Nhất',
    en: 'Domestic & International Travel Tours | Best Price Guarantee',
    zh: '精选越南国内游与出境游精品旅游线路预订',
    ko: '베트남 국내 및 해외 프리미엄 투어 패키지 예약',
    ja: 'ベトナム国内外の人気ツアー＆パッケージ旅行予約',
  };

  const descriptions: Record<string, string> = {
    vi: 'Khám phá hàng trăm tour du lịch hấp dẫn từ Bắc vào Nam và tour quốc tế. Lịch trình linh hoạt, khách sạn tiêu chuẩn, hướng dẫn viên tận tâm, giá ưu đãi.',
    en: 'Explore hundreds of top-rated domestic and international travel tours. Flexible itineraries, premium hotels, professional guides, and great discounts.',
    zh: '探索数百条高品质越南与出境旅游线路，行程丰富灵活、全包式尊享服务，尽享超值优惠与专属客服保障。',
    ko: '북부에서 남부까지 다채로운 베트남 여행 패키지와 해외 투어를 만나보세요. 알찬 일정과 합리적인 가격, 전문 가이드 동행.',
    ja: 'ベトナム各地から世界各国の人気ツアーまで豊富にご用意。充実のツアープランと安心サポートを特別価格でご案内。',
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;

  return {
    title,
    description,
    keywords: [
      'tour du lich', 'dat tour', 'tour ha long', 'tour da nang', 'tour phu quoc',
      'tour sapa', 'travel tours', 'book vietnam tour'
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}/tours`,
      languages: {
        vi: `${baseUrl}/vi/tours`,
        en: `${baseUrl}/en/tours`,
        zh: `${baseUrl}/zh/tours`,
        ko: `${baseUrl}/ko/tours`,
        ja: `${baseUrl}/ja/tours`,
        'x-default': `${baseUrl}/vi/tours`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/tours`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=630&fit=crop',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=630&fit=crop'],
    },
  };
}

export default async function ToursPage() {
  const [initialTours, settings] = await Promise.all([
    prefetchTours(),
    prefetchSettings(),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const toursBanner = pageBanners?.toursBanner || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600';
  const toursVideo = pageBanners?.toursVideo || 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4';

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="h-72 md:h-96 rounded-3xl bg-slate-200 animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    }>
      <ToursClient initialTours={initialTours} toursBanner={toursBanner} toursVideo={toursVideo} />
    </Suspense>
  );
}
