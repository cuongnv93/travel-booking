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

  const keywordsDict: Record<string, string[]> = {
    vi: [
      'tour du lịch', 'đặt tour du lịch', 'tour hạ long', 'tour đà nẵng', 'tour phú quốc',
      'tour sapa', 'tour hà giang', 'tour miền tây', 'tour du lịch giá rẻ', 'tour du lịch trọn gói'
    ],
    en: [
      'vietnam tours', 'book travel tour', 'ha long bay cruise tour', 'da nang package tour',
      'phu quoc island tours', 'sapa trekking tour', 'best vietnam travel packages', 'vietnam vacation deals'
    ],
    zh: [
      '越南旅游路线', '下龙湾游船预订', '岘港度假旅游', '富国岛自由行', '沙坝徒步游',
      '越南跟团游特惠', '高品质越南旅游', '越南全景游'
    ],
    ko: [
      '베트남 여행 패키지', '하롱베이 크루즈 예약', '다낭 패키지 여행', '푸꾸옥 섬 투어',
      '사파 트레킹 투어', '베트남 자유여행 추천', '베트남 가족 여행'
    ],
    ja: [
      'ベトナムツアー予約', 'ハロン湾クルーズツアー', 'ダナン格安ツアー', 'フーコック島ツアー',
      'サパトレッキング', 'ベトナムパッケージ旅行', 'ベトナム観光おすすめ'
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

export default async function ToursPage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const [initialTours, settings] = await Promise.all([
    prefetchTours(),
    prefetchSettings(),
  ]);

  const safeTours = Array.isArray(initialTours) ? initialTours : [];
  const safeSettings = Array.isArray(settings) ? settings : [];

  const pageBanners = safeSettings.find((s: any) => s.key === 'page_banners')?.value;
  const toursBanner = pageBanners?.toursBanner || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600';
  const toursVideo = pageBanners?.toursVideo || 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4';

  const toursSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Danh Sách Tour Du Lịch Nổi Bật',
    url: `${baseUrl}/${locale}/tours`,
    numberOfItems: safeTours.length,
    itemListElement: safeTours.slice(0, 10).map((tour: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: typeof tour.title === 'string' ? tour.title : (tour.title?.[locale] || tour.title?.vi || 'Tour Du Lịch'),
      url: `${baseUrl}/${locale}/tours/${tour.slug}`,
    })),
  };

  return (
    <main id="main-content" className="flex-grow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toursSchema) }}
      />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="h-72 md:h-96 rounded-3xl bg-slate-200 animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        </div>
      }>
        <ToursClient initialTours={safeTours} toursBanner={toursBanner} toursVideo={toursVideo} />
      </Suspense>
    </main>
  );
}
