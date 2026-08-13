'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, Wallet, HeadphonesIcon, MapPin } from 'lucide-react';

export default function WhyChooseUs() {
  const t = useTranslations('whyUs');

  const features = [
    { id: 'trust', icon: Shield, bg: 'bg-blue-100', color: 'text-blue-600' },
    { id: 'price', icon: Wallet, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    { id: 'support', icon: HeadphonesIcon, bg: 'bg-orange-100', color: 'text-orange-600' },
    { id: 'safety', icon: MapPin, bg: 'bg-purple-100', color: 'text-purple-600' },
  ];

  return (
    <section className="bg-slate-50 py-20 border-y border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('title')}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-teal-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${feature.bg} group-hover:-translate-y-2 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t(`items.${feature.id}`)}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {t(`items.${feature.id}Detail`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
