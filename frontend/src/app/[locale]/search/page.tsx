import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from './SearchClient';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Tìm Kiếm Tour Du Lịch, Khách Sạn & Cẩm Nang Khám Phá',
    en: 'Search Tours, Luxury Hotels & Destination Guides',
    zh: '全站搜索热门旅游线路、度假酒店与旅行攻略',
    ko: '투어, 호텔 및 여행 정보 통합 검색',
    ja: 'ツアー・ホテル・観光ガイド 横断検索',
  };

  const descriptions: Record<string, string> = {
    vi: 'Tìm kiếm nhanh chóng các tour du lịch hấp dẫn, khách sạn nghỉ dưỡng cao cấp và bài viết cẩm nang du lịch hữu ích trên hệ thống Travel Booking.',
    en: 'Search and find exciting travel tours, luxury resorts, and helpful travel guides instantly on Travel Booking.',
    zh: '在 Travel Booking 轻松快速搜寻理想旅游行程、五星级度假酒店及最新出行实用指南。',
    ko: '원하는 베트남 및 글로벌 여행 패키지, 호텔, 유용한 여행 가이드를 빠르게 검색해 보세요.',
    ja: '人気の旅行プラン、厳選ホテル、役立つ旅のガイド記事をスピーディーにお探しいただけます。',
  };

  const title = titles[locale] || titles.vi;
  const description = descriptions[locale] || descriptions.vi;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/search`,
      languages: {
        vi: `${baseUrl}/vi/search`,
        en: `${baseUrl}/en/search`,
        zh: `${baseUrl}/zh/search`,
        ko: `${baseUrl}/ko/search`,
        ja: `${baseUrl}/ja/search`,
        'x-default': `${baseUrl}/vi/search`,
      },
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 mt-20 text-center">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse mb-8" />
        <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    }>
      <SearchClient />
    </Suspense>
  );
}
