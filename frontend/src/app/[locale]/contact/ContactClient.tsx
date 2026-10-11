'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompanyBranches, useWorkingHours, usePageBanners, DEFAULT_PAGE_BANNERS } from '@/hooks/useSettings';
import { useParams } from 'next/navigation';
import { enqueueConsultationLead, flushPendingConsultations } from '@/lib/consultationQueue';

export default function ContactClient() {
  const t = useTranslations('contact');
  const locale = (useParams()?.locale as string) || 'vi';

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Auto-sync any queued offline contact messages on mount
  useEffect(() => {
    flushPendingConsultations();
  }, []);

  const { data: branches = [] } = useCompanyBranches();
  const { data: workingHours } = useWorkingHours();
  const { data: pageBanners } = usePageBanners();
  const contactBanner = pageBanners?.contactBanner || DEFAULT_PAGE_BANNERS.contactBanner;
  const contactVideo = pageBanners?.contactVideo || DEFAULT_PAGE_BANNERS.contactVideo;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email ? formData.email.trim() : undefined,
      notes: `[Chủ đề: ${formData.subject || 'Liên hệ chung'}] ${formData.message || ''}`,
      type: 'general' as const,
    };

    try {
      await api.post('/consultations', payload);
      setSubmitting(false);
      setSubmitted(true);
    } catch (err: any) {
      console.warn('Network issue submitting contact, storing locally for guaranteed capture:', err);
      enqueueConsultationLead(payload);
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Banner Header */}
      <VideoBackground
        videoSrc={contactVideo}
        videoSources={[
          { src: contactVideo, type: 'video/mp4' },
          { src: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4', type: 'video/mp4' }
        ]}
        posterSrc={contactBanner}
        overlayGradient="bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/25"
        className="h-64 md:h-80 rounded-3xl mb-12 shadow-2xl flex items-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-8 max-w-2xl text-white"
        >
          <span className="bg-teal-600/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            {t('heroTag', { fallback: '☎️ Hỗ Trợ 24/7' })}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">{t('heroTitle', { fallback: 'Liên Hệ & Hỗ Trợ 24/7' })}</h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            {t('heroSub', { fallback: 'Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ mọi thắc mắc của bạn.' })}
          </p>
        </motion.div>
      </VideoBackground>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Side - Dynamic Branches & Working Hours */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>{t('infoTitle')}</span>
            </h3>

            <div className="space-y-5">
              {branches.map((b: any, idx: number) => {
                const bName = typeof b.name === 'object' ? (b.name[locale] || b.name.vi || b.name.en) : b.name;
                const bAddr = typeof b.address === 'object' ? (b.address[locale] || b.address.vi || b.address.en) : b.address;

                return (
                  <motion.div
                    key={b.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{bName}</h4>
                      {b.isMain && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {t('mainBranch')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{bAddr}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-1 border-t border-slate-200/60">
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{b.phone}</span>
                        </a>
                      )}
                      {b.email && (
                        <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 text-purple-600 hover:underline">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{b.email}</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dynamic Working Hours */}
            {workingHours && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{t('hoursTitle')}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>{(workingHours.weekdays as any)?.[locale] || workingHours.weekdays?.vi}</div>
                  {workingHours.weekend && (
                    <div>{(workingHours.weekend as any)?.[locale] || workingHours.weekend?.vi}</div>
                  )}
                  {workingHours.hotlineNote && (
                    <div className="text-[11px] text-blue-600 font-medium pt-1">
                      {(workingHours.hotlineNote as any)?.[locale] || workingHours.hotlineNote?.vi}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Side */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('formTitle')}</h3>
            <p className="text-slate-500 text-sm mb-8">{t('formSub')}</p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, type: 'spring' }}
                  className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  </motion.div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">{t('successTitle')}</h4>
                  <p className="text-slate-600 max-w-md mx-auto mb-6">{t('successDesc')}</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">{t('anotherMsgBtn')}</Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('nameLabel')}</label>
                      <Input
                        required
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('emailLabel')}</label>
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
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('phoneLabel')}</label>
                      <Input
                        required
                        placeholder="0912345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('subjectLabel')}</label>
                      <Input
                        placeholder={t('subjectPlaceholder')}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('msgLabel')}</label>
                    <textarea
                      required
                      rows={5}
                      placeholder={t('msgPlaceholder')}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto px-8 h-14 rounded-2xl font-semibold gap-2 disabled:opacity-50">
                    <Send className="w-5 h-5" />
                    {submitting ? 'Đang gửi...' : t('submitBtn')}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}