import type { Metadata } from 'next';
import { getI18nText } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import axios from 'axios';
import { Users, Target, ShieldCheck, Compass } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getPageData(slug: string) {
  try {
    const res = await axios.get(`${BACKEND_URL}/pages/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'about' });
  const page = await getPageData('about');
  if (!page) return { title: `${t('meta_title_fallback')} | Travel Booking` };
  
  const title = getI18nText(page.title, locale) || t('meta_title_fallback');
  return { title: `${title} | Travel Booking` };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('about');
  const page = await getPageData('about');
  const title = page ? getI18nText(page.title, locale) : t('title_fallback');
  const content = page ? getI18nText(page.content, locale) : `<p class="text-slate-500 text-center py-20">${t('content_fallback')}</p>`;

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-5xl">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 md:p-16 text-white mb-12 shadow-xl relative overflow-hidden text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6 inline-block">
            {t('story_tag')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
          <p className="text-blue-100 text-lg md:text-xl font-light">{t('description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('vision_title')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t('vision_desc')}</p>
        </div>
        <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100/50 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('mission_title')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t('mission_desc')}</p>
        </div>
        <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100/50 text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('explore_title')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t('explore_desc')}</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          {t('our_story')}
        </h2>
        <div 
          className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>

      <div className="text-center pb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('ready_title')}</h3>
        <p className="text-slate-500 mb-8">{t('ready_desc')}</p>
        <div className="flex justify-center gap-4">
          <Link href={`/${locale}/tours`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors">
            {t('explore_tour_btn')}
          </Link>
          <Link href={`/${locale}/contact`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors">
            {t('contact_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
