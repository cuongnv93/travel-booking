import type { Metadata } from 'next';
import { Suspense } from 'react';
import { prefetchNews, prefetchSettings } from '@/lib/serverApi';
import NewsClient from './NewsClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Tin Tức Du Lịch & Cẩm Nang Khám Phá Mới Nhất | Kinh Nghiệm Du Lịch',
    en: 'Travel News, Insider Destination Guides & Travel Tips',
    zh: '最新旅游新闻资讯、目的地深度攻略与出行指南',
    ko: '베트남 여행 뉴스, 최신 여행 가이드 및 꿀팁 모음',
    ja: '最新旅行ニュース＆ベトナム観光ガイド・おすすめ情報',
  };

  const descriptions: Record<string, string> = {
    vi: 'Cập nhật tin tức du lịch trong nước và quốc tế, cẩm nang du lịch từ A-Z, chia sẻ kinh nghiệm khám phá điểm đến, ẩm thực và văn hóa đặc sắc.',
    en: 'Stay informed with the latest travel news, comprehensive guides, destination reviews, and authentic cultural & culinary highlights.',
    zh: '实时更新国内外最新旅游资讯、深度游玩攻略、景点评测以及独具特色的美食与地域文化分享。',
    ko: '국내외 최신 여행 트렌드, 알찬 여행 팁, 현지 맛집과 문화 가이드를 실시간으로 전해드립니다.',
    ja: '国内外の最新トラベルニュース、旅のお役立ちガイド、人気観光地レビューやご当地グルメ情報を発信。',
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;

  return {
    title,
    description,
    keywords: [
      'tin tuc du lich', 'cam nang du lich', 'kinh nghiem du lich', 'travel tips',
      'vietnam travel guide', 'du lich viet nam'
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}/news`,
      languages: {
        vi: `${baseUrl}/vi/news`,
        en: `${baseUrl}/en/news`,
        zh: `${baseUrl}/zh/news`,
        ko: `${baseUrl}/ko/news`,
        ja: `${baseUrl}/ja/news`,
        'x-default': `${baseUrl}/vi/news`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/news`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop',
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
      images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop'],
    },
  };
}

export default async function NewsPage() {
  const [initialNews, settings] = await Promise.all([
    prefetchNews(),
    prefetchSettings(),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const newsBanner = pageBanners?.newsBanner || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600';
  const newsVideo = pageBanners?.newsVideo || 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/forest_bike.mp4';

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
      <NewsClient initialNews={initialNews} newsBanner={newsBanner} newsVideo={newsVideo} />
    </Suspense>
  );
}