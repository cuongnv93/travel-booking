'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOCALES } from '@/lib/constants';

// High-resolution real national flag PNG images from FlagCDN
const flagImages: Record<string, string> = {
  vi: 'https://flagcdn.com/w40/vn.png',
  en: 'https://flagcdn.com/w40/gb.png',
  zh: 'https://flagcdn.com/w40/cn.png',
  ko: 'https://flagcdn.com/w40/kr.png',
  ja: 'https://flagcdn.com/w40/jp.png',
};

const names: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
};

const shortCodes: Record<string, string> = {
  vi: 'VI',
  en: 'EN',
  zh: 'ZH',
  ko: 'KO',
  ja: 'JA',
};

export default function LanguageSwitcher({ isScrolled, isHome }: { isScrolled: boolean; isHome: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'vi';
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    const currentPath = pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);

    router.push(newPath || `/${newLocale}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold shadow-2xs border cursor-pointer',
          !isScrolled && isHome
            ? 'text-white bg-white/15 hover:bg-white/25 border-white/30 backdrop-blur-md'
            : 'text-slate-800 bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80'
        )}
      >
        <img
          src={flagImages[locale] || flagImages.vi}
          alt={locale}
          className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0 border border-black/10"
        />
        <span className="font-extrabold uppercase tracking-wider">{shortCodes[locale] || locale}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200 opacity-70', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 overflow-hidden"
          >
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLanguage(l)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors font-bold cursor-pointer',
                  locale === l ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={flagImages[l]}
                    alt={l}
                    className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0 border border-black/10"
                  />
                  <span className="font-semibold text-slate-800 text-xs">{names[l]}</span>
                </div>
                {locale === l && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
