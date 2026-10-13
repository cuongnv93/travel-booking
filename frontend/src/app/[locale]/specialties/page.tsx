import type { Metadata } from 'next';
import { Suspense } from 'react';
import { prefetchSpecialties, prefetchSettings, prefetchTours } from '@/lib/serverApi';
import SpecialtiesClient from './SpecialtiesClient';
import { VIETNAM_PROVINCES } from '@/lib/provinces';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const titles: Record<string, string> = {
    vi: 'Đặc Sản Ẩm Thực Vùng Miền Việt Nam Độc Đáo | Món Ngon 63 Tỉnh Thành',
    en: 'Vietnamese Regional Specialties & Culinary Heritage | 63 Provinces',
    zh: '越南地道特色美食与63省传统特产伴手礼指南',
    ko: '베트남 63개 성 지역별 대표 특산물 & 전통 음식 가이드',
    ja: 'ベトナム63省の名物料理・ご当地特産品＆お土産ガイド',
  };

  const descriptions: Record<string, string> = {
    vi: 'Khám phá tinh hoa ẩm thực ba miền Bắc - Trung - Nam, danh sách các món ăn đặc sản nổi tiếng 63 tỉnh thành Việt Nam làm quà và thưởng thức khi du lịch.',
    en: 'Discover the rich culinary heritage of Vietnam across Northern, Central, and Southern regions. Famous local dishes, authentic souvenirs, and specialty foods.',
    zh: '探寻越南北、中、南三大区域的丰富饮食文化，精选63省著名风味特产与旅行伴手礼推荐。',
    ko: '베트남 북부, 중부, 남부의 풍미 가득한 향토 음식과 63개 성의 대표 특산품, 추천 선물 리스트를 확인하세요.',
    ja: 'ベトナム北部・中部・南部の伝統料理と63省の代表的な名産品・お土産を分かりやすくご紹介。',
  };

  const keywordsDict: Record<string, string[]> = {
    vi: [
      'đặc sản việt nam', 'ẩm thực vùng miền', 'món ngon 63 tỉnh thành', 'đặc sản làm quà',
      'ẩm thực ba miền', 'du lịch ẩm thực việt nam', 'tour ẩm thực', 'món ngon hà nội', 'đặc sản đà nẵng'
    ],
    en: [
      'vietnamese food', 'vietnamese specialties', 'vietnam culinary tour', 'street food vietnam',
      'regional vietnamese dishes', '63 provinces specialties', 'vietnam food guide'
    ],
    zh: [
      '越南地道特产', '越南美食指南', '越南特色小吃', '越南63省传统风味',
      '越南美食之旅', '越南伴手礼推荐'
    ],
    ko: [
      '베트남 특산물', '베트남 음식 여행', '베트남 63개 성 명물 요리', '베트남 길거리 음식',
      '베트남 기념품 선물', '베트남 미식 투어'
    ],
    ja: [
      'ベトナム名物料理', 'ベトナム郷土料理', 'ベトナムグルメツアー', 'ベトナム63省特産品',
      'ベトナムお土産', 'ベトナムローカルフード'
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
      canonical: `${baseUrl}/${locale}/specialties`,
      languages: {
        vi: `${baseUrl}/vi/specialties`,
        en: `${baseUrl}/en/specialties`,
        zh: `${baseUrl}/zh/specialties`,
        ko: `${baseUrl}/ko/specialties`,
        ja: `${baseUrl}/ja/specialties`,
        'x-default': `${baseUrl}/vi/specialties`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/specialties`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630&fit=crop',
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
      images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630&fit=crop'],
    },
  };
}

export default async function SpecialtiesPage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const [initialSpecialties, settings, initialTours] = await Promise.all([
    prefetchSpecialties(),
    prefetchSettings(),
    prefetchTours({ limit: '12' }),
  ]);

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const specialtiesBanner = pageBanners?.specialtiesBanner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600';
  const specialtiesVideo = pageBanners?.specialtiesVideo || 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/walking.mp4';

  const specialtiesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Danh Sách Đặc Sản Ẩm Thực Vùng Miền Việt Nam',
    url: `${baseUrl}/${locale}/specialties`,
    numberOfItems: initialSpecialties.length,
    itemListElement: initialSpecialties.slice(0, 10).map((item: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: typeof item.name === 'string' ? item.name : (item.name?.[locale] || item.name?.vi || 'Món Ăn Đặc Sản'),
      description: typeof item.description === 'string' ? item.description : (item.description?.[locale] || item.description?.vi || ''),
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(specialtiesSchema) }}
      />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="h-64 md:h-80 rounded-3xl bg-slate-200 animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(n => <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        </div>
      }>
        <SpecialtiesClient
          initialSpecialties={initialSpecialties}
          initialProvinces={VIETNAM_PROVINCES}
          specialtiesBanner={specialtiesBanner}
          specialtiesVideo={specialtiesVideo}
          initialTours={initialTours}
        />
      </Suspense>
    </main>
  );
}