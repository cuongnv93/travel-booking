'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import { Mail, MapPin, Phone, Search } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useParams().locale as string || 'vi';
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.includes('/login') || pathname?.includes('/register')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 mb-6">
              {t('about')}
            </h3>
            <p className="mb-6 leading-relaxed text-sm text-slate-400">
              {t('aboutDesc')}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/booking-lookup`}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                {t('lookupBooking')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">{t('servicesTitle')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/${locale}/tours`} className="hover:text-blue-400 transition-colors">{t('tourService')}</Link></li>
              <li><Link href={`/${locale}/hotels`} className="hover:text-blue-400 transition-colors">{t('hotelService')}</Link></li>
              <li><Link href={`/${locale}/flights`} className="hover:text-blue-400 transition-colors">{t('flightService')}</Link></li>
              <li><Link href={`/${locale}/visa`} className="hover:text-blue-400 transition-colors">{t('visaService')}</Link></li>
              <li><Link href={`/${locale}/specialties`} className="hover:text-blue-400 transition-colors">{t('specialtyService')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">{t('infoTitle')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/${locale}/news`} className="hover:text-blue-400 transition-colors">{t('guideNews')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-blue-400 transition-colors">{t('consultContact')}</Link></li>
              <li><Link href={`/${locale}/booking-lookup`} className="hover:text-blue-400 transition-colors">{t('lookupBooking')}</Link></li>
              <li><Link href="/admin" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">{t('adminLink')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">{t('contactTitle')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{t('address')}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{t('hotline')}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{t('email')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{t('copyright')}</p>
          <div className="flex gap-6">
            <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
