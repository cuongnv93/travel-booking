import type { Metadata } from 'next';
import { Suspense } from 'react';
import { prefetchHotels, prefetchHotelLocations, prefetchSettings } from '@/lib/serverApi';
import HotelsClient from './HotelsClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Đặt Phòng Khách Sạn & Resort Nghỉ Dưỡng Cao Cấp Giá Tốt Nhất',
    en: 'Book Luxury Hotels & Beach Resorts Worldwide | Best Rates',
    zh: '预订高端度假酒店与五星级海滨度假村特惠客房',
    ko: '베트남 럭셔리 호텔 & 프리미엄 리조트 최저가 예약',
    ja: 'おすすめ人気ホテル＆ラグジュアリーリゾート予約',
  };

  const descriptions: Record<string, string> = {
    vi: 'Tìm và đặt phòng khách sạn, resort nghỉ dưỡng 3-5 sao trên toàn quốc với giá ưu đãi. Đầy đủ tiện nghi, view biển, xác nhận tức thì, hỗ trợ 24/7.',
    en: 'Find and book 3 to 5-star hotels and luxury beach resorts at guaranteed best prices. Modern amenities, sea views, instant confirmation, 24/7 support.',
    zh: '搜寻并预订全越3-5星级高品质度假酒店与海滨胜地，设施齐备、海景客房、即时确认与贴心管家服务。',
    ko: '전국 3~5성급 프리미엄 호텔과 휴양지 리조트를 최저가로 예약하세요. 오션뷰, 풀빌라, 즉시 예약 확정 및 24시간 상담.',
    ja: '全国の厳選3〜5つ星ホテルやビーチリゾートを最安値で予約。充実した設備、オーシャンビュー、即時確約対応。',
  };

  const keywordsDict: Record<string, string[]> = {
    vi: [
      'đặt phòng khách sạn', 'khách sạn giá rẻ', 'resort nghỉ dưỡng', 'khách sạn 5 sao',
      'resort đà nẵng', 'khách sạn phú quốc', 'resort nha trang', 'khách sạn vũng tàu', 'homestay view đẹp'
    ],
    en: [
      'hotel booking vietnam', 'luxury resorts vietnam', '5 star hotels da nang', 'phu quoc beach resort',
      'nha trang ocean view hotels', 'best resorts vietnam', 'boutique hotels vietnam'
    ],
    zh: [
      '越南酒店预订', '越南五星级度假村', '岘港海景酒店', '富国岛度假酒店', '芽庄海滨酒店',
      '越南特惠酒店', '高档度假村预订'
    ],
    ko: [
      '베트남 호텔 예약', '다낭 5성급 리조트', '푸꾸옥 풀빌라 추천', '나트랑 오션뷰 호텔',
      '베트남 호캉스', '베트남 럭셔리 호텔 최저가'
    ],
    ja: [
      'ベトナムホテル予約', 'ダナン高級リゾート', 'フーコック島ヴィラ', 'ニャチャンビーチホテル',
      'ベトナム宿泊予約', '5つ星ホテル格安予約'
    ],
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;
  const keywords = keywordsDict[locale] || keywordsDict.vi;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${baseUrl}/${locale}/hotels`,
      languages: {
        vi: `${baseUrl}/vi/hotels`,
        en: `${baseUrl}/en/hotels`,
        zh: `${baseUrl}/zh/hotels`,
        ko: `${baseUrl}/ko/hotels`,
        ja: `${baseUrl}/ja/hotels`,
        'x-default': `${baseUrl}/vi/hotels`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/hotels`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop',
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
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop'],
    },
  };
}

export default async function HotelsPage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const [initialHotels, initialLocations, settings] = await Promise.all([
    prefetchHotels(),
    prefetchHotelLocations(),
    prefetchSettings(),
  ]);

  const safeHotels = Array.isArray(initialHotels) ? initialHotels : [];
  const safeLocations = Array.isArray(initialLocations) ? initialLocations : [];
  const safeSettings = Array.isArray(settings) ? settings : [];

  const pageBanners = safeSettings.find((s: any) => s.key === 'page_banners')?.value;
  const hotelsBanner = pageBanners?.hotelsBanner || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600';
  const hotelsVideo = pageBanners?.hotelsVideo || 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/glide-over-coastal-beach.mp4';

  const hotelsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Danh Sách Khách Sạn & Resort Nổi Bật',
    url: `${baseUrl}/${locale}/hotels`,
    numberOfItems: safeHotels.length,
    itemListElement: safeHotels.slice(0, 10).map((hotel: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: typeof hotel.name === 'string' ? hotel.name : (hotel.name?.[locale] || hotel.name?.vi || 'Khách Sạn & Resort'),
      url: `${baseUrl}/${locale}/hotels/${hotel.slug}`,
    })),
  };

  return (
    <main id="main-content" className="flex-grow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelsSchema) }}
      />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="h-72 md:h-96 rounded-3xl bg-slate-200 animate-pulse mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(n => <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />)}
          </div>
        </div>
      }>
        <HotelsClient initialHotels={safeHotels} initialLocations={safeLocations} hotelsBanner={hotelsBanner} hotelsVideo={hotelsVideo} />
      </Suspense>
    </main>
  );
}