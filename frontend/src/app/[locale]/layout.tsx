import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';
import '../globals.css';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingChat from '@/components/layout/FloatingChat';
import MobileMenu from '@/components/layout/MobileMenu';
import NavigationProgress from '@/components/layout/NavigationProgress';

const SEO_DICTIONARY: Record<string, { title: string; description: string; ogLocale: string; keywords: string[] }> = {
  vi: {
    title: 'Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam',
    description: 'Khám phá và đặt tour du lịch uy tín, vé máy bay, khách sạn cao cấp với giá tốt nhất tại Travel. Đặt tour dễ dàng, thanh toán an toàn, tư vấn 24/7.',
    ogLocale: 'vi_VN',
    keywords: ['du lịch', 'đặt tour du lịch', 'tour Hạ Long', 'tour Đà Nẵng', 'khách sạn 5 sao', 'vé máy bay', 'du lịch việt nam', 'travel booking'],
  },
  en: {
    title: 'Travel - Leading Travel & Tour Booking Platform in Vietnam',
    description: 'Discover and book premium travel tours, flight tickets, and luxury hotels with Travel. Best price guarantee, secure payment, and 24/7 customer support.',
    ogLocale: 'en_US',
    keywords: ['vietnam travel', 'book tours vietnam', 'halong bay cruise', 'da nang resorts', 'flights to vietnam', 'vietnam travel booking'],
  },
  zh: {
    title: 'Travel - 越南领先旅游行程与度假酒店预订平台',
    description: '探索并预订高品质越南旅游线路、特价机票与五星级海滨度假酒店。价格透明、支付安全、24/7多语种客户服务。',
    ogLocale: 'zh_CN',
    keywords: ['越南旅游', '预订越南旅游', '下龙湾游轮', '岘港度假村', '富国岛旅游', '越南特价机票', 'travel booking'],
  },
  ko: {
    title: 'Travel - 베트남 최고의 프리미엄 여행 & 투어 예약 플랫폼',
    description: '베트남 인기 여행 패키지, 항공권, 5성급 럭셔리 리조트를 최저가로 예약하세요. 간편한 예약, 안전한 결제, 24시간 고객 상담.',
    ogLocale: 'ko_KR',
    keywords: ['베트남 여행', '다낭 여행', '하롱베이 크루즈', '푸꾸옥 리조트', '베트남 투어 예약', '베트남 항공권', 'travel booking'],
  },
  ja: {
    title: 'Travel - ベトナム屈指の厳選ツアー＆ホテル予約プラットフォーム',
    description: 'ベトナム各地の絶景ツアー、航空券、極上ラグジュアリーホテルをお得に予約。透明な価格設定、安心の決済、24時間日本語対応サポート。',
    ogLocale: 'ja_JP',
    keywords: ['ベトナム旅行', 'ハロン湾クルーズ', 'ダナンリゾート', 'フーコック島', 'ベトナムツアー予約', '格安航空券', 'travel booking'],
  },
};

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> | { locale: string } }): Promise<Metadata> => {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale || 'vi';
  const seoData = SEO_DICTIONARY[locale] || SEO_DICTIONARY.vi;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';
  const ogImageUrl = `${baseUrl}/og-image.jpg`;

  return {
    title: {
      default: seoData.title,
      template: '%s | Travel Booking'
    },
    description: seoData.description,
    keywords: seoData.keywords,
    authors: [{ name: 'Travel Team' }],
    metadataBase: new URL(baseUrl),
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
      title: seoData.title,
      description: seoData.description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Travel Booking',
      locale: seoData.ogLocale,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seoData.title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  };
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';
  const seoData = SEO_DICTIONARY[locale] || SEO_DICTIONARY.vi;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Travel Booking',
    alternateName: ['Travel', 'Travel Vietnam'],
    url: `${baseUrl}/${locale}`,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    description: seoData.description,
    telephone: '1800-646-888',
    email: 'support@travelbooking.vn',
    priceRange: '$$',
    currenciesAccepted: 'VND, USD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '99 Pham Hung, Nam Tu Liem',
      addressLocality: 'Hanoi',
      addressRegion: 'Hanoi',
      addressCountry: 'VN'
    },
    sameAs: [
      'https://facebook.com/travel',
      'https://instagram.com/travel',
      'https://youtube.com/@travel'
    ]
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Travel Booking',
    url: `${baseUrl}/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'vi' ? 'Trang chủ' : locale === 'zh' ? '首页' : locale === 'ko' ? '홈' : locale === 'ja' ? 'ホーム' : 'Home',
        item: `${baseUrl}/${locale}`
      }
    ]
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <div className="flex flex-col min-h-screen relative overflow-x-hidden w-full">
          <NavigationProgress />
          <Header />
          <main className="flex-grow w-full">{children}</main>
          <Footer />
          <FloatingChat />
          <MobileMenu />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
