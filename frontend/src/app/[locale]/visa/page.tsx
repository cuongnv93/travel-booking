import type { Metadata } from 'next';
import { getI18nText } from '@/lib/utils';
import axios from 'axios';
import {
  ShieldCheck, HelpCircle, CheckCircle2, Clock, Globe,
  FileCheck, UserCheck, Send, Sparkles, Award, ArrowRight, Flame,
  PhoneCall, Mail, ChevronRight
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
      name: t('countries.japan.name', { fallback: 'Visa Nhật Bản' }) || 'Visa Nhật Bản',
      time: t('countries.japan.time', { fallback: '5 - 7 ngày làm việc' }) || '5 - 7 ngày làm việc',
      desc: t('countries.japan.desc', { fallback: 'Tỷ lệ đậu rất cao. Hỗ trợ trọn gói hồ sơ chứng minh tài chính & công việc.' }) || 'Tỷ lệ đậu rất cao. Hỗ trợ trọn gói hồ sơ chứng minh tài chính & công việc.',
      tag: t('countries.japan.tag', { fallback: 'Du lịch & Công tác' }) || 'Du lịch & Công tác',
      passBadge: t('countries.japan.passBadge', { fallback: 'Đậu ~99.5%' }) || 'Đậu ~99.5%',
      bg: 'from-rose-50/80 to-amber-50/50',
      border: 'border-rose-100'
    },
    {
      flag: '🇰🇷',
      name: t('countries.korea.name', { fallback: 'Visa Hàn Quốc' }) || 'Visa Hàn Quốc',
      time: t('countries.korea.time', { fallback: '3 - 5 ngày làm việc' }) || '3 - 5 ngày làm việc',
      desc: t('countries.korea.desc', { fallback: 'Nhiều loại linh hoạt (du lịch cá nhân, du lịch nhóm, thăm thân, 5 năm đại đô thị).' }) || 'Nhiều loại linh hoạt (du lịch cá nhân, du lịch nhóm, thăm thân, 5 năm đại đô thị).',
      tag: t('countries.korea.tag', { fallback: 'Cấp nhanh 3-5 ngày' }) || 'Cấp nhanh 3-5 ngày',
      passBadge: t('countries.korea.passBadge', { fallback: 'Đậu ~99.2%' }) || 'Đậu ~99.2%',
      bg: 'from-blue-50/80 to-indigo-50/50',
      border: 'border-blue-100'
    },
    {
      flag: '🇪🇺',
      name: t('countries.europe.name', { fallback: 'Visa Schengen (Châu Âu)' }) || 'Visa Schengen (Châu Âu)',
      time: t('countries.europe.time', { fallback: '10 - 15 ngày làm việc' }) || '10 - 15 ngày làm việc',
      desc: t('countries.europe.desc', { fallback: 'Yêu cầu hồ sơ kỹ lưỡng. Tự do di chuyển 27 quốc gia Châu Âu.' }) || 'Yêu cầu hồ sơ kỹ lưỡng. Tự do di chuyển 27 quốc gia Châu Âu.',
      tag: t('countries.europe.tag', { fallback: 'Châu Âu 27 Quốc Gia' }) || 'Châu Âu 27 Quốc Gia',
      passBadge: t('countries.europe.passBadge', { fallback: 'Đậu ~98.8%' }) || 'Đậu ~98.8%',
      bg: 'from-sky-50/80 to-blue-50/50',
      border: 'border-sky-100'
    },
    {
      flag: '🇺🇸',
      name: t('countries.usa.name', { fallback: 'Visa Mỹ (Mỹ - Hoa Kỳ)' }) || 'Visa Mỹ (Mỹ - Hoa Kỳ)',
      time: t('countries.usa.time', { fallback: '1 - 2 tháng (Hẹn phỏng vấn)' }) || '1 - 2 tháng (Hẹn phỏng vấn)',
      desc: t('countries.usa.desc', { fallback: 'Phỏng vấn Lãnh sự quán. Chuyên viên tư vấn & luyện phỏng vấn 1-1.' }) || 'Phỏng vấn Lãnh sự quán. Chuyên viên tư vấn & luyện phỏng vấn 1-1.',
      tag: t('countries.usa.tag', { fallback: 'Tư vấn phỏng vấn 1-1' }) || 'Tư vấn phỏng vấn 1-1',
      passBadge: t('countries.usa.passBadge', { fallback: 'Đậu ~97.5%' }) || 'Đậu ~97.5%',
      bg: 'from-purple-50/80 to-indigo-50/50',
      border: 'border-purple-100'
    },
  ];

  const PROCESS_STEPS = [
    {
      step: '01',
      title: t('step1Title', { fallback: 'Tư Vấn & Đánh Giá Hồ Sơ' }),
      desc: t('step1Desc', { fallback: 'Chuyên viên kiểm tra hồ sơ tỉ mỉ, đánh giá tỷ lệ đậu và tư vấn phương án tối ưu nhất cho bạn.' }),
      icon: HelpCircle,
      color: 'bg-blue-600 text-white',
    },
    {
      step: '02',
      title: t('step2Title', { fallback: 'Dịch Thuật & Soạn Thảo' }),
      desc: t('step2Desc', { fallback: 'Hoàn thiện toàn bộ tờ khai, dịch thuật công chứng giấy tờ chuẩn quy định Đại Sứ Quán.' }),
      icon: FileCheck,
      color: 'bg-indigo-600 text-white',
    },
    {
      step: '03',
      title: t('step3Title', { fallback: 'Nộp Hồ Sơ & Sinh Trắc' }),
      desc: t('step3Desc', { fallback: 'Đặt lịch hẹn ưu tiên, hướng dẫn chi tiết quy trình lấy dấu vân tay và phỏng vấn 1-1.' }),
      icon: UserCheck,
      color: 'bg-purple-600 text-white',
    },
    {
      step: '04',
      title: t('step4Title', { fallback: 'Nhận Kết Quả & Giao Tận Nơi' }),
      desc: t('step4Desc', { fallback: 'Theo dõi tiến độ liên tục và giao kết quả Visa tận tay hoặc gửi chuyển phát nhanh an toàn.' }),
      icon: Award,
      color: 'bg-emerald-600 text-white',
    },
  ];

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const visaBanner = pageBanners?.visaBanner || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1600';

  const title = page ? getI18nText(page.title, locale) : t('heroTitle');
  const content = page ? getI18nText(page.content, locale) : '';

  return (
    <div className="container mx-auto px-4 py-8 mt-20 space-y-12">
      {/* ─── Hero Image Banner ───────────────────────────────────────────── */}
      <div className="h-72 md:h-96 rounded-3xl overflow-hidden relative shadow-2xl bg-slate-900 group">
        <img
          src={visaBanner}
          alt="Visa Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/30 backdrop-blur-md border border-purple-400/40 text-xs font-bold mb-3 text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{t('reason1Title', { fallback: 'Tỷ Lệ Đậu Visa Lên Đến 99.2%' })}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-purple-100/90 text-sm md:text-base leading-relaxed max-w-2xl">
            {t('heroSub', { fallback: 'Travel cung cấp dịch vụ tư vấn và hỗ trợ làm Visa cho hơn 50 quốc gia & vùng lãnh thổ. Đội ngũ chuyên gia giàu kinh nghiệm luôn đồng hành cùng bạn trong suốt quá trình.' })}
          </p>
        </div>
      </div>

      {/* ─── Highlights Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hỗ trợ quốc gia', value: '50+', sub: 'Châu Á, Châu Âu, Mỹ, Úc', icon: Globe, color: 'text-purple-600 bg-purple-50' },
          { label: 'Tỷ lệ đậu hồ sơ', value: '99.2%', sub: 'Hơn 15,000+ hồ sơ thành công', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Thời gian xử lý', value: '24h', sub: 'Thẩm định hồ sơ cực nhanh', icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Cam kết chất lượng', value: '100%', sub: 'Đồng hành trọn gói từ A-Z', icon: Award, color: 'text-amber-600 bg-amber-50' },
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
              <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Main Grid Layout (Left Content + Right Consultation Sidebar) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Visa Types Showcase & Process */}
        <div className="lg:col-span-2 space-y-10">
          {/* Service Overview Card */}
          <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-purple-50/50 p-7 sm:p-8 rounded-3xl border border-blue-100 shadow-xs relative overflow-hidden">
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-3 inline-block">
              Dịch Vụ Hỗ Trợ Visa Du Lịch
            </span>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              Tư Vấn & Nộp Hồ Sơ Visa Hơn 50 Quốc Gia
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Travel cung cấp dịch vụ tư vấn và hỗ trợ làm visa chuyên nghiệp cho hơn <strong>50 quốc gia và vùng lãnh thổ</strong>. Đội ngũ chuyên gia giàu kinh nghiệm sẽ trực tiếp thẩm định, tối ưu hồ sơ và đồng hành cùng bạn trong suốt toàn bộ quá trình xin Visa.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tỷ lệ đậu hồ sơ cao
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Thẩm định sơ bộ 24h
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> Bảo mật thông tin tuyệt đối
              </span>
            </div>
          </div>

          {/* Popular Visa Categories (Card Grid) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold text-purple-600 uppercase tracking-widest block mb-1">
                  Thị Trường Nổi Bật
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('countriesTitle', { fallback: 'Các Loại Visa Phổ Biến Nhất' })}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VISA_COUNTRIES.map((country, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${country.bg} border ${country.border} p-6 rounded-3xl shadow-xs hover:shadow-md transition-all group relative flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl leading-none">{country.flag}</span>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                            {country.name}
                          </h3>
                          <span className="inline-block text-[10px] font-bold bg-white/90 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100 mt-1">
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
                    <span className="font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full text-[11px]">
                      {country.passBadge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Step Process Section (Light Theme) */}
          <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 border border-slate-200/90 rounded-3xl p-7 sm:p-9 text-slate-900 shadow-sm">
            <div className="mb-8">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1">Quy Trình Chuyên Nghiệp</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t('processTitle', { fallback: '4 Bước Xin Visa Nhanh Chóng & Dễ Dàng' })}</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Đồng hành cùng bạn từ lúc chuẩn bị hồ sơ cho đến khi nhận Visa tận tay</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PROCESS_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="bg-white border border-slate-200/80 p-6 rounded-2xl relative flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-md font-bold text-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-black text-slate-300 font-mono">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 mb-1.5">{step.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Premium Redesigned Contact Specialist Section ───────────────── */}
          <div className="bg-gradient-to-r from-blue-50 via-sky-50/60 to-indigo-50/40 border border-blue-100/90 rounded-3xl p-7 sm:p-9 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Decorative soft blurred circles */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="space-y-4 text-center lg:text-left z-10 max-w-xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 shadow-xs text-xs font-bold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('contactSpec', { fallback: 'Đội Ngũ Chuyên Gia Visa Đang Online (24/7)' })}</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {t('consultationTitle', { fallback: 'Cần Tư Vấn Hồ Sơ & Thẩm Định Tỷ Lệ Đậu?' })}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2.5 font-medium">
                  Chuyên viên hơn 10 năm kinh nghiệm của Travel sẽ kiểm tra hồ sơ miễn phí, tư vấn giải pháp tối ưu và đồng hành cùng bạn trong suốt quá trình.
                </p>
              </div>

              {/* Trust Points */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Thẩm định hồ sơ miễn phí
                </span>
                <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Bảo mật thông tin tuyệt đối
                </span>
              </div>
            </div>

            {/* Right Action Cards */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto lg:w-80 shrink-0 z-10">
              {/* Phone Hotline Card */}
              <a
                href="tel:1800646888"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-2xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Tổng đài miễn cước</div>
                  <div className="text-lg font-black text-white tracking-wide">1800 646 888</div>
                </div>
              </a>

              {/* Email Consultation Card */}
              <a
                href="mailto:visa@travel.com"
                className="group bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gửi Email Tư Vấn</div>
                  <div className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">visa@travel.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Form Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <VisaConsultationForm />
        </div>
      </div>

      {/* ─── Bottom Section: Recommended Hot Tours ────────────────────────── */}
      {featuredTours.length > 0 && (
        <div className="pt-10 border-t border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest block mb-1 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-orange-500" /> Tour HOT Gợi Ý Khi Có Visa
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Khám Phá Các Gói Du Lịch Hấp Dẫn Nhất
              </h2>
            </div>
            <Link
              href="/vi/tours"
              className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 hover:translate-x-1 transition-all group"
            >
              <span>Xem tất cả tour</span>
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