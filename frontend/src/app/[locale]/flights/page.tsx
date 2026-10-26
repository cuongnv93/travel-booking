import type { Metadata } from 'next';
import FlightsClient from './FlightsClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Đặt Vé Máy Bay Giá Rẻ Trong Nước & Quốc Tế Trực Tuyến',
    en: 'Book Cheap Domestic & International Flight Tickets Online',
    zh: '在线查询与预订越南国内及国际特价机票',
    ko: '베트남 국내선 및 국제선 특가 항공권 실시간 검색 & 예약',
    ja: '国内線・国際線 格安航空券の比較＆オンライン即時予約',
  };

  const descriptions: Record<string, string> = {
    vi: 'Tra cứu giá vé máy bay tốt nhất từ Vietnam Airlines, Vietjet Air, Bamboo Airways và hơn 100 hãng hàng không quốc tế. Đặt vé trực tuyến nhanh chóng, thanh toán an toàn, tư vấn 24/7.',
    en: 'Find and book the cheapest flight tickets from Vietnam Airlines, Vietjet Air, Bamboo Airways and 100+ global airlines. Fast online booking, secure payment, 24/7 support.',
    zh: '实时对比越南航空、越捷航空、越竹航空及全球逾百家航空公司的超值特惠机票，极速出票、安全便捷。',
    ko: '베트남항공, 비엣젯항공, 뱀부항공 등 100여 개 국내외 주요 항공사의 최저가 항공권을 실시간 비교 예약하세요. 24시간 맞춤 지원.',
    ja: 'ベトナム航空、ベトジェット、バンブー・エアウェイズなど主要航空会社の最安値フライトを一括検索。安心のサポート体制。',
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;

  return {
    title,
    description,
    keywords: [
      've may bay', 'dat ve may bay', 've may bay gia re', 'san ve may bay',
      'cheap flights', 'flight tickets', 'vietnam airlines', 'vietjet air'
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}/flights`,
      languages: {
        vi: `${baseUrl}/vi/flights`,
        en: `${baseUrl}/en/flights`,
        zh: `${baseUrl}/zh/flights`,
        ko: `${baseUrl}/ko/flights`,
        ja: `${baseUrl}/ja/flights`,
        'x-default': `${baseUrl}/vi/flights`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/flights`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=630&fit=crop',
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
      images: ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=630&fit=crop'],
    },
  };
}

export default function FlightsPage() {
  return (
    <main id="main-content" className="flex-grow">
      <FlightsClient />
    </main>
  );
}