'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import {
  Shield, Wallet, HeadphonesIcon, MapPin, LucideIcon,
  Users, Star, Sparkles, Award, Clock, HeartHandshake
} from 'lucide-react';
import { useWhyChooseUs, useHomeStatsCounters } from '@/hooks/useSettings';
import { getI18nText } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Wallet,
  Headphones: HeadphonesIcon,
  HeadphonesIcon,
  MapPin,
  Users,
  Star,
  Sparkles,
  Award,
  Clock,
  HeartHandshake,
};

const FeatureCard = memo(function FeatureCard({
  iconName,
  bg,
  color,
  index,
  title,
  detail,
}: {
  iconName: string;
  bg?: string;
  color?: string;
  index: number;
  title: string;
  detail: string;
}) {
  const Icon = ICON_MAP[iconName] || Shield;
  const bgClass = bg || 'bg-blue-100';
  const colorClass = color || 'text-blue-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group border border-slate-100"
    >
      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${bgClass} group-hover:-translate-y-2 transition-transform duration-300`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">
        {detail}
      </p>
    </motion.div>
  );
});

function WhyChooseUsComponent() {
  const t = useTranslations('whyUs');
  const locale = useLocale();

  const { data: dynamicWhyUs } = useWhyChooseUs();
  const { data: dynamicStats } = useHomeStatsCounters();

  const featuresList = useMemo(() => {
    if (Array.isArray(dynamicWhyUs) && dynamicWhyUs.length > 0) {
      return dynamicWhyUs;
    }
    return [
      { id: 'trust', icon: 'Shield', bg: 'bg-blue-100', color: 'text-blue-600' },
      { id: 'price', icon: 'Wallet', bg: 'bg-emerald-100', color: 'text-emerald-600' },
      { id: 'support', icon: 'Headphones', bg: 'bg-orange-100', color: 'text-orange-600' },
      { id: 'safety', icon: 'MapPin', bg: 'bg-purple-100', color: 'text-purple-600' },
    ];
  }, [dynamicWhyUs]);

  return (
    <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1.5">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">{t('title')}</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {featuresList.map((feature: any, index: number) => {
            const title = getI18nText(feature.title, locale, t(`items.${feature.id}`));
            const detail = getI18nText(feature.detail, locale, t(`items.${feature.id}Detail`));

            return (
              <FeatureCard
                key={feature.id || index}
                iconName={feature.icon || 'Shield'}
                bg={feature.bg}
                color={feature.color}
                index={index}
                title={title}
                detail={detail}
              />
            );
          })}
        </div>

        {/* Brand Statistics Counters Bar from CMS */}
        {Array.isArray(dynamicStats) && dynamicStats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            {dynamicStats.map((st: any, i: number) => {
              const Icon = ICON_MAP[st.icon] || Award;
              const label = getI18nText(st.label, locale, '');
              const sub = st.sub ? getI18nText(st.sub, locale, '') : '';

              return (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 ${st.color || 'text-blue-600'}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{st.value}</div>
                    <div className="text-xs font-bold text-slate-700">{label}</div>
                    {sub && <div className="text-[11px] text-slate-400 font-medium">{sub}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(WhyChooseUsComponent);
