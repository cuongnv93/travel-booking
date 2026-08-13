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

export const generateMetadata = ({ params: { locale } }: { params: { locale: string } }): Metadata => {
  const isVi = locale === 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';
  const ogImageUrl = `${baseUrl}/og-image.jpg`;

  return {
    title: {
      default: isVi ? 'Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam' : 'Travel - Leading Travel & Tour Booking Platform',
      template: '%s | Travel Booking'
    },
    description: isVi 
      ? 'Khám phá và đặt tour du lịch uy tín, vé máy bay, khách sạn cao cấp với giá tốt nhất tại Travel. Đặt tour dễ dàng, thanh toán an toàn, tư vấn 24/7.' 
      : 'Book premium tours, flight tickets, and luxury hotels worldwide with Travel. Best price guarantee and 24/7 support.',
    keywords: ['du lich', 'dat tour', 'tour Ha Noi', 'tour Da Nang', 'khach san', 've may bay', 'travel booking', 'vietnam tours'],
    authors: [{ name: 'Travel Team' }],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'vi-VN': '/vi',
        'en-US': '/en',
      },
    },
    openGraph: {
      title: 'Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu Việt Nam',
      description: 'Khám phá các điểm đến hấp dẫn và trải nghiệm hành trình du lịch tuyệt vời cùng Travel.',
      url: `${baseUrl}/${locale}`,
      siteName: 'Travel Booking',
      locale: isVi ? 'vi_VN' : 'en_US',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Travel Booking - Khám phá thế giới'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Travel - Nền Tảng Đặt Tour Du Lịch Hàng Đầu',
      description: 'Đặt tour du lịch uy tín, vé máy bay, khách sạn giá tốt nhất.',
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
      },
    },
  };
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Travel Booking',
    url: `http://localhost:3000/${locale}`,
    logo: 'http://localhost:3000/logo.png',
    description: 'Nền tảng đặt tour du lịch hàng đầu Việt Nam',
    telephone: '1800-646-888',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hanoi',
      addressCountry: 'VN'
    },
    sameAs: [
      'https://facebook.com/travel',
      'https://instagram.com/travel'
    ]
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <div className="flex flex-col min-h-screen relative">
          <NavigationProgress />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <FloatingChat />
          <MobileMenu />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
