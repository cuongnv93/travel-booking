'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { getI18nText } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = (useParams()?.locale as string) || 'vi';

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const siteInfo = settings.find((s: any) => s.key === 'site_info')?.value || {
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    hotline: '1800 646 888',
    email: 'contact@travel.com'
  };

  const addressText = getI18nText(siteInfo.address, locale) || (typeof siteInfo.address === 'string' ? siteInfo.address : '123 Đường Nguyễn Huệ, Q.1, TP.HCM');

  const pageBanners = settings.find((s: any) => s.key === 'page_banners')?.value;
  const contactBanner = pageBanners?.contactBanner || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Banner Header */}
      <div className="h-64 md:h-80 rounded-3xl overflow-hidden relative mb-12 shadow-2xl bg-slate-900 group">
        <img
          src={contactBanner}
          alt="Contact Banner"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-900/20" />
        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl text-white">
          <span className="bg-teal-600/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            {t('heroTag', { fallback: '☎️ Hỗ Trợ 24/7' })}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">{t('heroTitle', { fallback: 'Liên Hệ & Hỗ Trợ 24/7' })}</h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            {t('heroSub', { fallback: 'Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ mọi thắc mắc của bạn.' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Side */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('infoTitle', { fallback: 'Thông Tin Liên Hệ' })}</h3>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{t('hqTitle', { fallback: 'Trụ Sở Chính' })}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{addressText}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{t('hotlineTitle', { fallback: 'Tổng Đài Khách Hàng' })}</h4>
                <p className="text-sm text-slate-600 font-bold text-blue-600">{siteInfo.hotline || '1800 646 888'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('hotlineSub', { fallback: 'Miễn phí cước gọi 24/7' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{t('emailTitle', { fallback: 'Email Tư Vấn' })}</h4>
                <p className="text-sm text-slate-600">{siteInfo.email || 'contact@travel.com'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{t('hoursTitle', { fallback: 'Giờ Làm Việc' })}</h4>
                <p className="text-sm text-slate-600">{t('hoursDesc', { fallback: 'Thứ Hai - Chủ Nhật: 08:00 - 21:00' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('formTitle', { fallback: 'Gửi Tin Nhắn Cho Chúng Tôi' })}</h3>
            <p className="text-slate-500 text-sm mb-8">{t('formSub', { fallback: 'Vui lòng điền thông tin bên dưới, chuyên viên tư vấn sẽ liên hệ lại.' })}</p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-slate-900 mb-2">{t('successTitle', { fallback: 'Gửi Thông Tin Thành Công!' })}</h4>
                <p className="text-slate-600 max-w-md mx-auto mb-6">{t('successDesc', { fallback: 'Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được tin nhắn.' })}</p>
                <Button onClick={() => setSubmitted(false)} variant="outline">{t('anotherMsgBtn', { fallback: 'Gửi tin nhắn khác' })}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('nameLabel', { fallback: 'Họ và tên *' })}</label>
                    <Input
                      required
                      placeholder={t('namePlaceholder', { fallback: 'Nguyễn Văn A' })}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('emailLabel', { fallback: 'Email *' })}</label>
                    <Input
                      required
                      type="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('phoneLabel', { fallback: 'Số điện thoại *' })}</label>
                    <Input
                      required
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('subjectLabel', { fallback: 'Chủ đề cần tư vấn' })}</label>
                    <Input
                      placeholder={t('subjectPlaceholder', { fallback: 'Tư vấn tour, đặt phòng...' })}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('msgLabel', { fallback: 'Nội dung tin nhắn *' })}</label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t('msgPlaceholder', { fallback: 'Nhập nội dung cần hỗ trợ...' })}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto px-8 h-14 rounded-2xl font-semibold gap-2">
                  <Send className="w-5 h-5" />
                  {t('submitBtn', { fallback: 'Gửi Tin Nhắn' })}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}