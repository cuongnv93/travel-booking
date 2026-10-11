import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Liên Hệ & Thông Tin Hệ Thống Chi Nhánh Văn Phòng | Travel Booking',
    en: 'Contact Us & Branch Office Directory | Travel Booking',
    zh: '联系我们与各分支办事机构服务指南 | Travel Booking',
    ko: '고객센터 문의 & 전국 지점 안내 | Travel Booking',
    ja: 'お問い合わせ＆全国オフィス・支店案内 | Travel Booking',
  };

  const descriptions: Record<string, string> = {
    vi: 'Liên hệ với Travel Booking để được tư vấn lịch trình tour du lịch, đặt vé máy bay, phòng khách sạn và dịch vụ visa. Hotline hỗ trợ 24/7, mạng lưới chi nhánh toàn quốc.',
    en: 'Get in touch with Travel Booking for personalized tour itineraries, flight bookings, hotel reservations, and visa consultations. 24/7 dedicated support team.',
    zh: '欢迎联系 Travel Booking 客户团队，获取专属旅游定制、特价机票、酒店预订及签证代办咨询服务。24小时全天候响应。',
    ko: '여행 패키지 맞춤 상담, 항공권 및 호텔 예약, 비자 발급 문의 등 언제든지 Travel Booking에 문의하세요. 24시간 친절 상담.',
    ja: 'ツアー日程のご相談、航空券・ホテル予約、ビザ申請など、お気軽にお問い合わせください。24時間カスタマーサポート体制。',
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;

  return {
    title,
    description,
    keywords: [
      'lien he travel', 'tong dai travel', 'chi nhanh travel', 'tu van du lich',
      'contact travel booking', 'travel hotline'
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        vi: `${baseUrl}/vi/contact`,
        en: `${baseUrl}/en/contact`,
        zh: `${baseUrl}/zh/contact`,
        ko: `${baseUrl}/ko/contact`,
        ja: `${baseUrl}/ja/contact`,
        'x-default': `${baseUrl}/vi/contact`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/contact`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=630&fit=crop',
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
      images: ['https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=630&fit=crop'],
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}