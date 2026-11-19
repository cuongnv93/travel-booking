'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOCALES, LOCALE_FLAGS, LOCALE_NAMES, LOCALE_SHORT_CODES } from '@/lib/constants';
import { useLocale, useTranslations } from 'next-intl';

/**
 * Builds the localized target URL preserving current query parameters and hash,
 * and persists NEXT_LOCALE cookie for next-intl middleware & server components.
 */
export function switchLocaleAndNavigate(pathname: string | null, newLocale: string): void {
  try {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    // Ignore cookie storage errors in restricted environments
  }

  const cleanSegments = (pathname || '/').split('/').filter(Boolean);
  if (cleanSegments.length > 0 && (LOCALES as readonly string[]).includes(cleanSegments[0])) {
    cleanSegments[0] = newLocale;
  } else {
    cleanSegments.unshift(newLocale);
  }

  const basePath = `/${cleanSegments.join('/')}`;
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  window.location.href = `${basePath}${search}${hash}`;
}

function LanguageSwitcher({ isScrolled, isHome }: { isScrolled: boolean; isHome: boolean }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const switchLanguage = useCallback(
    (newLocale: string) => {
      if (newLocale === locale) {
        setIsOpen(false);
        return;
      }
      setIsOpen(false);
      switchLocaleAndNavigate(pathname, newLocale);
    },
    [locale, pathname]
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('language')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold shadow-sm border cursor-pointer',
          !isScrolled && isHome
            ? 'text-white bg-white/15 hover:bg-white/25 border-white/30 backdrop-blur-md'
            : 'text-slate-800 bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80'
        )}
      >
        <Image
          src={LOCALE_FLAGS[locale] || LOCALE_FLAGS.vi}
          alt={LOCALE_NAMES[locale] || locale}
          width={20}
          height={14}
          className="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0 border border-black/10"
        />
        <span className="font-extrabold uppercase tracking-wider">{LOCALE_SHORT_CODES[locale] || locale}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200 opacity-70', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
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
                role="menuitem"
                onClick={() => switchLanguage(l)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors font-bold cursor-pointer',
                  locale === l ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Image
                    src={LOCALE_FLAGS[l]}
                    alt={LOCALE_NAMES[l]}
                    width={20}
                    height={14}
                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0 border border-black/10"
                  />
                  <span className="font-semibold text-slate-800 text-xs">{LOCALE_NAMES[l]}</span>
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

export default memo(LanguageSwitcher);
