'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import { Mail, MapPin, Phone, Search, Building2, Clock } from 'lucide-react';
import {
  useCompanyBranches,
  useSocialLinks,
  useWorkingHours,
} from '@/hooks/useSettings';
import {
  FacebookIcon,
  ZaloIcon,
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
} from '@/components/ui/SocialIcons';

export default function Footer() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const locale = (useParams()?.locale as string) || 'vi';
  const pathname = usePathname();

  const { data: branches = [] } = useCompanyBranches();
  const { data: socialLinks } = useSocialLinks();
  const { data: workingHours } = useWorkingHours();

  if (pathname?.startsWith('/admin') || pathname?.includes('/login') || pathname?.includes('/register')) {
    return null;
  }

  const mainBranch = branches.find((b: any) => b.isMain) || branches[0];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: About & Booking Lookup */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-md">
                <Image
                  src="/timesgreen-logo.png"
                  alt="TimesGreen Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
                TimesGreen
              </h3>
            </div>
            <p className="mb-6 leading-relaxed text-sm text-slate-400">
              {t('aboutDesc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/booking-lookup`}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                {t('lookupBooking')}
              </Link>
            </div>

            {/* Social links */}
            {socialLinks && (
              <div className="flex items-center gap-2.5 mt-6">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:border-transparent hover:bg-[#1877F2] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(24,119,242,0.35)]"
                    title="Facebook"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.zalo && (
                  <a
                    href={socialLinks.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:border-transparent hover:bg-[#0068FF] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,104,255,0.35)] px-1"
                    title="Zalo"
                    aria-label="Zalo"
                  >
                    <ZaloIcon className="w-5 h-auto" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:border-transparent hover:bg-[#FF0000] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,0,0,0.35)]"
                    title="YouTube"
                    aria-label="YouTube"
                  >
                    <YouTubeIcon className="w-4.5 h-4.5" />
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:border-transparent hover:bg-black text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                    title="TikTok"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:border-transparent hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(228,64,95,0.35)]"
                    title="Instagram"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Services */}
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

          {/* Col 3: Useful Info */}
          <div>
            <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">{t('infoTitle')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/${locale}/news`} className="hover:text-blue-400 transition-colors">{t('guideNews')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-blue-400 transition-colors">{t('consultContact')}</Link></li>
              <li><Link href={`/${locale}/booking-lookup`} className="hover:text-blue-400 transition-colors">{t('lookupBooking')}</Link></li>
            </ul>

            {workingHours?.weekdays && (
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{tCommon('workingHours')}</span>
                </div>
                <div>{(workingHours.weekdays as Record<string, string>)[locale] || workingHours.weekdays.vi}</div>
                {workingHours.weekend && <div>{(workingHours.weekend as Record<string, string>)[locale] || workingHours.weekend.vi}</div>}
              </div>
            )}
          </div>

          {/* Col 4: Dynamic Branches & Contacts */}
          <div>
            <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">{t('contactTitle')}</h4>
            <div className="space-y-4 text-xs text-slate-400">
              {branches.slice(0, 3).map((branch: any, i: number) => {
                const branchName = typeof branch.name === 'object' ? (branch.name[locale] || branch.name.vi || branch.name.en) : branch.name;
                const branchAddr = typeof branch.address === 'object' ? (branch.address[locale] || branch.address.vi || branch.address.en) : branch.address;

                return (
                  <div key={branch.id || i} className="border-b border-slate-800/60 pb-3 last:border-b-0">
                    <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{branchName}</span>
                    </div>
                    <div className="flex items-start gap-1.5 mb-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                      <span>{branchAddr}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-blue-400">
                      {branch.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {branch.phone}
                        </span>
                      )}
                      {branch.email && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Mail className="w-2.5 h-2.5" /> {branch.email}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

