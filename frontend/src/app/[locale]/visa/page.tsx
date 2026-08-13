import type { Metadata } from 'next';
import { getI18nText } from '@/lib/utils';
import axios from 'axios';
import {
  ShieldCheck, HelpCircle, CheckCircle2, Clock, Globe,
  FileCheck, UserCheck, Sparkles, Award, ArrowRight, Flame,
  PhoneCall, Mail
} from 'lucide-react';
import Link from 'next/link';
import TourCard from '@/components/tours/TourCard';
import VisaConsultationForm from '@/components/visa/VisaConsultationForm';
import { getTranslations } from 'next-intl/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getPageData(slug: string) {
  try {
    const res = await axios.get(`${BACKEND_URL}/pages/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

async function getSettingsData() {
  try {
    const res = await axios.get(`${BACKEND_URL}/settings`);
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  } catch (error) {
    return [];
  }
}

async function getFeaturedTours() {
  try {
    const res = await axios.get(`${BACKEND_URL}/tours?isFeatured=true`);
    const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return list.slice(0, 3);
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const page = await getPageData('visa');
  if (!page) return { title: 'Dịch Vụ Visa | Travel Booking' };

  const title = getI18nText(page.title, locale) || 'Dịch Vụ Hỗ Trợ Visa Du Lịch Trọn Gói';
  return { title: `${title} | Travel Booking` };
}

export default async function VisaPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('visa');
  const page = await getPageData('visa');
  const settings = await getSettingsData();
  const featuredTours = await getFeaturedTours();

  const VISA_COUNTRIES = [
    {
      flag: '🇯🇵',
      name: t('japanName'),
      time: t('japanTime'),
      desc: t('japanDesc'),
      tag: t('japanTag'),
      passBadge: t('japanPassBadge'),
      bg: 'from-rose-50/80 to-amber-50/50',
      border: 'border-rose-100'
    },
    {
      flag: '🇰🇷',
      name: t('koreaName'),
      time: t('koreaTime'),
      desc: t('koreaDesc'),
      tag: t('koreaTag'),
      passBadge: t('koreaPassBadge'),
      bg: 'from-blue-50/80 to-indigo-50/50',
      border: 'border-blue-100'
    },
    {
      flag: '🇪🇺',
      name: t('europeName'),
      time: t('europeTime'),
      desc: t('europeDesc'),
      tag: t('europeTag'),
      passBadge: t('europePassBadge'),
      bg: 'from-sky-50/80 to-blue-50/50',
      border: 'border-sky-100'
    },
    {
      flag: '🇺🇸',
      name: t('usaName'),
      time: t('usaTime'),
      desc: t('usaDesc'),
      tag: t('usaTag'),
      passBadge: t('usaPassBadge'),
      bg: 'from-purple-50/80 to-indigo-50/50',
      border: 'border-purple-100'
    },
  ];

  const PROCESS_STEPS = [
    {
      step: '01',
      title: t('step1Title'),
      desc: t('step1Desc'),
      icon: HelpCircle,
      color: 'bg-blue-600 text-white',
    },
    {
      step: '02',
      title: t('step2Title'),
      desc: t('step2Desc'),
      icon: FileCheck,
      color: 'bg-indigo-600 text-white',
    },
    {
      step: '03',
      title: t('step3Title'),
      desc: t('step3Desc'),
      icon: UserCheck,
      color: 'bg-purple-600 text-white',
    },
    {
      step: '04',
      title: t('step4Title'),
      desc: t('step4Desc'),
      icon: Award,
      color: 'bg-emerald-600 text-white',
    },
  ];

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const visaBanner = pageBanners?.visaBanner || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1600';

  const title = page ? getI18nText(page.title, locale) : t('heroTitle');

  return (
    <div className="container mx-auto px-4 py-8 mt-20 space-y-12">
      {/* Hero Banner */}
      <div className="h-72 md:h-96 rounded-3xl overflow-hidden relative shadow-xl bg-slate-900 group">
        <img
          src={visaBanner}
          alt="Visa Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/30 backdrop-blur-md border border-purple-400/40 text-xs font-bold mb-3 text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{t('reason1Title')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-purple-100/90 text-sm md:text-base leading-relaxed max-w-2xl">
            {t('heroSub')}
          </p>
        </div>
      </div>

      {/* Highlights Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('statCountryLabel'), value: '50+', sub: t('statCountrySub'), icon: Globe, color: 'text-purple-600 bg-purple-50' },
          { label: t('statPassLabel'), value: '99.2%', sub: t('statPassSub'), icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('statTimeLabel'), value: '24h', sub: t('statTimeSub'), icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: t('statQualityLabel'), value: '100%', sub: t('statQualitySub'), icon: Award, color: 'text-amber-600 bg-amber-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Service Overview Card */}
          <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-purple-50/50 p-7 sm:p-8 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
            <span className="bg-blue-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider mb-3 inline-block">
              {t('serviceBadge')}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              {t('serviceTitle')}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {t('serviceDesc')}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('highPass')}
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> {t('fastReview')}
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> {t('highSec')}
              </span>
            </div>
          </div>

          {/* Popular Visa Categories */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-1">
                  {t('featuredMarkets')}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {t('countriesTitle')}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VISA_COUNTRIES.map((country, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${country.bg} border ${country.border} p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl leading-none">{country.flag}</span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                            {country.name}
                          </h3>
                          <span className="inline-block text-xs font-semibold bg-white/90 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100 mt-1">
                            {country.tag}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {country.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {country.time}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full text-xs">
                      {country.passBadge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Step Process Section */}
          <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 border border-slate-200 rounded-3xl p-7 sm:p-9 text-slate-900 shadow-sm">
            <div className="mb-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">{t('proProcess')}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t('processTitle')}</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">{t('processSub')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PROCESS_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="bg-white border border-slate-200 p-6 rounded-2xl relative flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-md font-bold text-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-bold text-slate-300 font-sans">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 mb-1.5">{step.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Specialist Section */}
          <div className="bg-gradient-to-r from-blue-50 via-sky-50/60 to-indigo-50/40 border border-blue-100 rounded-3xl p-7 sm:p-9 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left z-10 max-w-xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm text-xs font-bold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('contactSpec')}</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {t('consultationTitle')}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  {t('consultationSub')}
                </p>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t('freeReview')}
                </span>
                <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t('secPoint')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto lg:w-80 shrink-0 z-10">
              <a
                href="tel:1800646888"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-2xl shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-blue-100 font-bold uppercase tracking-wider">{t('hotlineLabel')}</div>
                  <div className="text-lg font-bold text-white tracking-wide">1800 646 888</div>
                </div>
              </a>

              <a
                href="mailto:visa@travel.com"
                className="group bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('emailLabel')}</div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">visa@travel.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <VisaConsultationForm />
        </div>
      </div>

      {/* Recommended Hot Tours */}
      {featuredTours.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-1 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-orange-500" /> {t('suggestedToursTag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {t('suggestedToursTitle')}
              </h2>
            </div>
            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 hover:translate-x-1 transition-all group"
            >
              <span>{t('viewAllTours')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTours.map((tour: any) => (
              <TourCard key={tour._id || tour.slug} tour={tour} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}