'use client';

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { X, User as UserIcon, Calendar, ShoppingCart, Shield, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { NAV_ITEMS, LOCALES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const flagImages: Record<string, string> = {
  vi: 'https://flagcdn.com/w40/vn.png',
  en: 'https://flagcdn.com/w40/gb.png',
  zh: 'https://flagcdn.com/w40/cn.png',
  ko: 'https://flagcdn.com/w40/kr.png',
  ja: 'https://flagcdn.com/w40/jp.png',
};

const shortCodes: Record<string, string> = {
  vi: 'VI',
  en: 'EN',
  zh: 'ZH',
  ko: 'KO',
  ja: 'JA',
};

export default function MobileMenu() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isMobileMenuOpen = useUiStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const cartItemsCount = useCartStore((state) =>
    state.items.reduce(
      (total, item) => total + (item.guests?.adults || 0) + (item.guests?.children || 0),
      0
    )
  );

  // Determine if current route is the Home page
  const isHome = useMemo(() => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/$/, '');
    return cleanPath === `/${locale}` || cleanPath === '' || cleanPath === '/';
  }, [pathname, locale]);

  // Accurately check whether a nav item is active
  const checkIsActive = useCallback((itemPath: string) => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/$/, '');
    if (itemPath === '/') {
      return isHome;
    }
    const fullItemPath = `/${locale}${itemPath}`.replace(/\/$/, '');
    return cleanPath === fullItemPath || cleanPath.startsWith(`${fullItemPath}/`);
  }, [pathname, locale, isHome]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push(`/${locale}`);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-[999] xl:hidden backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[1000] xl:hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-2xs">
                  <Image
                    src="/timesgreen-logo.png"
                    alt="TimesGreen Logo"
                    fill
                    sizes="28px"
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
                  TimesGreen
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* User Profile or Login Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('nav.login')}
                  </Link>
                  <Link
                    href={`/${locale}/cart`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl relative hover:bg-slate-50 transition-colors"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <LayoutGroup id="mobile-drawer-nav">
                {NAV_ITEMS.map((item) => {
                  const isActive = checkIsActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={`/${locale}${item.path === '/' ? '' : item.path}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                      )}
                    >
                      <span className="relative z-10">{t(item.i18nKey)}</span>
                      {isActive && (
                        <motion.span
                          layoutId="mobileActiveIndicator"
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.6)] shrink-0"
                        />
                      )}
                    </Link>
                  );
                })}
              </LayoutGroup>

              {isAuthenticated && user && (
                <>
                  <div className="pt-3 pb-1 border-t border-slate-100 my-2">
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3.5">
                      {t('nav.profile')}
                    </span>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      {t('nav.admin')}
                    </Link>
                  )}

                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {t('nav.profile')}
                  </Link>

                  <Link
                    href={`/${locale}/profile/bookings`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {t('nav.myBookings')}
                  </Link>

                  <Link
                    href={`/${locale}/cart`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-slate-400" />
                      {t('nav.myCart')}
                    </div>
                    {cartItemsCount > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {/* Language Switcher in Mobile Drawer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/70">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Ngôn ngữ / Language</p>
              <div className="grid grid-cols-5 gap-1.5">
                {LOCALES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      if (l === locale) return;
                      try {
                        document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;SameSite=Lax`;
                      } catch {}
                      const segments = (pathname || '').split('/');
                      if (LOCALES.includes(segments[1] as any)) {
                        segments[1] = l;
                      } else {
                        segments.splice(1, 0, l);
                      }
                      const newPath = segments.join('/') || `/${l}`;
                      setMobileMenuOpen(false);
                      window.location.href = newPath;
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer',
                      locale === l
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    )}
                  >
                    <Image
                      src={flagImages[l]}
                      alt={l}
                      width={18}
                      height={12}
                      className="w-4.5 h-3 object-cover rounded-xs mb-1 shadow-2xs border border-black/10"
                    />
                    <span>{shortCodes[l]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout button if authenticated */}
            {isAuthenticated && user && (
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
