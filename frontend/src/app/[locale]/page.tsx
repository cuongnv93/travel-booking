import type { Metadata } from 'next';
import HeroBanner from '@/components/home/HeroBanner';
import QuickSearch from '@/components/home/QuickSearch';
import FeaturedTours from '@/components/home/FeaturedTours';
import DestinationsSection from '@/components/home/DestinationsSection';
import FeaturedHotels from '@/components/home/FeaturedHotels';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import NewsSection from '@/components/home/NewsSection';
import Testimonials from '@/components/home/Testimonials';

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> | { locale: string } }): Promise<Metadata> => {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Đặt Tour Du Lịch, Vé Máy Bay & Khách Sạn Giá Tốt Nhất | Travel Booking',
    en: 'Book Tours, Flights & Luxury Hotels Worldwide | Travel Booking',
    zh: '预订高品质越南旅游路线、特价机票与度假酒店 | Travel Booking',
    ko: '베트남 여행 패키지, 특가 항공권 및 호텔 예약 | Travel Booking',
    ja: 'ベトナムツアー、格安航空券＆ホテル予約 | Travel Booking',
  };

  const descriptions: Record<string, string> = {
    vi: 'Khám phá thế giới cùng Travel Booking. Đặt tour du lịch trong nước & quốc tế, vé máy bay, phòng khách sạn 5 sao với giá ưu đãi tốt nhất. Hỗ trợ tư vấn 24/7.',
    en: 'Discover the world with Travel Booking. Book domestic & international tours, cheap flights, and 5-star hotels at the best rates. 24/7 dedicated support.',
    zh: '与 Travel Booking 一同探索世界。预订越南国内及出境旅游线路、特价机票与五星级海滨度假村，享受最优惠价格与24小时多语种贴心支持。',
    ko: 'Travel Booking과 함께 특별한 여행을 떠나보세요. 국내외 여행 투어, 항공권, 5성급 호텔을 최저가에 예약하세요. 24시간 상담 지원.',
    ja: 'Travel Booking で最高の旅を体験。国内外のツアー、お得な航空券、5つ星ホテルを最安値で予約。24時間カスタマーサポート。',
  };

  const keywordsDict: Record<string, string[]> = {
    vi: [
      'du lịch', 'đặt tour du lịch', 'tour du lịch giá rẻ', 'tour hạ long',
      'tour đà nẵng', 'tour phú quốc', 'tour sapa', 'vé máy bay giá rẻ',
      'đặt phòng khách sạn', 'resort nghỉ dưỡng 5 sao', 'du lịch việt nam',
      'combo du lịch', 'travel booking'
    ],
    en: [
      'vietnam travel', 'vietnam tours', 'book vietnam tours', 'halong bay cruise tours',
      'da nang travel packages', 'phu quoc resorts', 'cheap flights vietnam',
      'luxury hotels vietnam', 'vietnam tour operator', 'travel booking'
    ],
    zh: [
      '越南旅游', '越南旅游预订', '下龙湾游轮', '岘港旅游', '富国岛度假村',
      '越南特价机票', '五星级海滨度假酒店', '越南旅行社', 'travel booking'
    ],
    ko: [
      '베트남 여행', '베트남 투어 패키지', '다낭 여행', '하롱베이 크루즈',
      '푸꾸옥 리조트', '베트남 특가 항공권', '베트남 호텔 예약', 'travel booking'
    ],
    ja: [
      'ベトナム旅行', 'ベトナムツアー予約', 'ハロン湾クルーズ', 'ダナンリゾート',
      'フーコック島ツアー', 'ベトナム格安航空券', 'ベトナムホテル予約', 'travel booking'
    ],
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;
  const ogImageUrl = `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    keywords: keywordsDict[locale] || keywordsDict.vi,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'vi': `${baseUrl}/vi`,
        'en': `${baseUrl}/en`,
        'zh': `${baseUrl}/zh`,
        'ko': `${baseUrl}/ko`,
        'ja': `${baseUrl}/ja`,
        'x-default': `${baseUrl}/vi`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Travel Booking',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
};

export default async function HomePage({
  params,
}: {
  params?: Promise<{ locale?: string }> | { locale?: string };
}) {
  const resolvedParams = params ? await Promise.resolve(params) : null;
  const locale = resolvedParams?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Travel Booking - Đặt Tour Du Lịch & Khách Sạn Việt Nam',
        alternateName: ['Travel Booking VN', 'Du Lịch Việt Nam Travel Booking'],
        description:
          'Nền tảng đặt tour du lịch Việt Nam chất lượng cao, combo du lịch giá rẻ, vé máy bay và khách sạn resort 5 sao uy tín hàng đầu.',
        inLanguage: locale,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/${locale}/tours?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'TravelAgency',
        '@id': `${baseUrl}/#organization`,
        name: 'Travel Booking Vietnam',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        image: `${baseUrl}/og-image.jpg`,
        description:
          'Đại lý du lịch hàng đầu cung cấp tour du lịch Việt Nam trọn gói: tour Hạ Long, tour Đà Nẵng, Phú Quốc, Sapa, Ninh Bình, Miền Tây sông nước, Quy Nhơn - Phú Yên giá tốt nhất.',
        telephone: '+84 1900 6868',
        email: 'support@travelbooking.vn',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '72 Lê Thánh Tôn, Bến Nghé, Quận 1',
          addressLocality: 'Hồ Chí Minh',
          addressRegion: 'Thành phố Hồ Chí Minh',
          postalCode: '70000',
          addressCountry: 'VN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '10.7781',
          longitude: '106.7018',
        },
        priceRange: '$$ - $$$$',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '22:00',
          },
        ],
        sameAs: [
          'https://facebook.com/travelbooking',
          'https://instagram.com/travelbooking',
          'https://youtube.com/travelbooking',
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroBanner />
      
      {/* Search box seamlessly overlapping the Hero section */}
      <div className="container mx-auto px-4 md:px-6 relative z-30 -mt-14 sm:-mt-20 md:-mt-28 lg:-mt-36 mb-12 sm:mb-16 max-w-5xl">
        <QuickSearch />
      </div>

      <main className="flex-1 space-y-16 sm:space-y-20 md:space-y-24 pb-16 sm:pb-24">
        <FeaturedTours />
        <DestinationsSection />
        <FeaturedHotels />
        <FlashSaleSection />
        <WhyChooseUs />
        <Testimonials />
        <NewsSection />
      </main>
    </div>
  );
}
