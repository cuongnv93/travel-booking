import type { Metadata } from 'next';
import { getI18nText } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import axios from 'axios';
import { Users, Target, ShieldCheck, Compass } from 'lucide-react';
import Link from 'next/link';
import { VideoBackground } from '@/components/ui/VideoBackground';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getPageData(slug: string) {
  try {
    const res = await axios.get(`${BACKEND_URL}/pages/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const locale = resolved?.locale || 'vi';
  const t = await getTranslations({ locale, namespace: 'about' });
  const page = await getPageData('about');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travel-booking-ruby.vercel.app';

  const descriptions: Record<string, string> = {
    vi: 'Tìm hiểu về Travel Booking - Nền tảng du lịch hàng đầu với sứ mệnh mang đến những hành trình trải nghiệm tuyệt vời, dịch vụ chuyên nghiệp và giá trị đích thực.',
    en: 'Learn more about Travel Booking - A premier travel platform committed to delivering memorable journeys, professional services, and authentic experiences.',
    zh: '了解 Travel Booking 品牌历程与核心理念——致力于为全球旅客提供值得信赖的高品质旅游体验与管家式服务。',
    ko: 'Travel Booking 소개 - 믿을 수 있는 고품격 여행 서비스와 잊지 못할 여정을 선사하는 베트남 최고의 여행 플랫폼입니다.',
    ja: 'Travel Booking について - 最高の旅行体験と信頼のプロフェッショナルサービスをお届けするベトナム屈指のトラベルプラットフォーム。',
  };

  const title = page ? (getI18nText(page.title, locale) || t('metaTitleFallback')) : t('metaTitleFallback');
  const description = page ? (getI18nText(page.description, locale) || descriptions[locale] || descriptions.vi) : (descriptions[locale] || descriptions.vi);

  return {
    title,
    description,
    keywords: [
      'gioi thieu travel booking', 've chung toi', 'cong ty du lich uy tin',
      'about travel booking', 'vietnam tour operator'
    ],
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        vi: `${baseUrl}/vi/about`,
        en: `${baseUrl}/en/about`,
        zh: `${baseUrl}/zh/about`,
        ko: `${baseUrl}/ko/about`,
        ja: `${baseUrl}/ja/about`,
        'x-default': `${baseUrl}/vi/about`,
      },
    },
    openGraph: {
      title: `${title} | Travel Booking`,
      description,
      url: `${baseUrl}/${locale}/about`,
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
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
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop'],
    },
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('about');
  const page = await getPageData('about');
  const title = page ? getI18nText(page.title, locale) : t('titleFallback');
  const content = page ? getI18nText(page.content, locale) : `<p class="text-slate-500 text-center py-20">${t('contentFallback')}</p>`;

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-5xl">
      {/* Banner */}
      <VideoBackground
        videoSrc="https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4"
        posterSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600"
        overlayGradient="bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-slate-950/90"
        className="rounded-3xl p-8 md:p-16 text-white mb-12 shadow-xl text-center flex items-center justify-center"
      >
        <div className="relative z-10 max-w-3xl mx-auto py-4">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6 inline-block backdrop-blur-md">
            {t('storyTag')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
          <p className="text-blue-100 text-lg md:text-xl font-light">{t('description')}</p>
        </div>
      </VideoBackground>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('visionTitle')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t('visionDesc')}</p>
        </div>
        <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100/50 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('missionTitle')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t('missionDesc')}</p>
        </div>
        <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100/50 text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('exploreTitle')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t('exploreDesc')}</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          {t('ourStory')}
        </h2>
        <div 
          className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>

      <div className="text-center pb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('readyTitle')}</h3>
        <p className="text-slate-500 mb-8">{t('readySub')}</p>
        <div className="flex justify-center gap-4">
          <Link href={`/${locale}/tours`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors">
            {t('exploreToursBtn')}
          </Link>
          <Link href={`/${locale}/contact`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors">
            {t('contactBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
