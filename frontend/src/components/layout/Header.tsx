'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { motion, LayoutGroup } from 'framer-motion';
import { ShoppingCart, User as UserIcon, Menu, LogOut, Shield, ChevronDown, Calendar } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { useUiStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations();
  const locale = useParams().locale as string;
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Determine if current route is the Home page
  const isHome = useMemo(() => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/$/, '');
    return cleanPath === `/${locale}` || cleanPath === '' || cleanPath === '/';
  }, [pathname, locale]);

  // Transparent header only on Home page before scrolling down
  const isTransparent = !isScrolled && isHome;

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

  // Prefetch on hover — routes are pre-fetched when user hovers nav links
  const handleNavHover = useCallback((path: string) => {
    const href = `/${locale}${path === '/' ? '' : path}`;
    router.prefetch(href);
  }, [locale, router]);

  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const activePath = useMemo(() => {
    return NAV_ITEMS.find((item) => checkIsActive(item.path))?.path || null;
  }, [checkIsActive]);

  const currentTab = hoveredPath !== null ? hoveredPath : activePath;

  const { toggleMobileMenu, toggleSearch } = useUiStore();
  const cartItems = useCartStore((state) => state.items);
  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.guests.adults + item.guests.children,
    0
  );
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  if (pathname?.startsWith('/admin') || pathname?.includes('/login') || pathname?.includes('/register')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    router.push(`/${locale}`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,box-shadow,border-color] duration-300',
        isTransparent
          ? 'bg-transparent py-4 sm:py-5'
          : 'bg-white/95 backdrop-blur-md shadow-xs py-2.5 sm:py-3 border-b border-slate-100/80'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between flex-nowrap gap-2 md:gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0 group" prefetch={true}>
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/timesgreen-logo.png"
                alt="TimesGreen Logo"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <span className={cn(
              "text-xl sm:text-2xl font-black tracking-tight transition-all duration-200",
              isTransparent
                ? "text-white drop-shadow-md"
                : "bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600"
            )}>
              TimesGreen
            </span>
          </Link>

          {/* Desktop Nav with animated sliding underline */}
          <LayoutGroup id="desktop-header-nav">
            <nav
              aria-label="Main Navigation"
              onMouseLeave={() => setHoveredPath(null)}
              className="hidden xl:flex items-center gap-1 2xl:gap-1.5 shrink-0 bg-transparent relative py-1"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = checkIsActive(item.path);
                const isCurrent = currentTab === item.path;

                return (
                  <Link
                    key={item.path}
                    href={`/${locale}${item.path === '/' ? '' : item.path}`}
                    prefetch={false}
                    onMouseEnter={() => {
                      handleNavHover(item.path);
                      setHoveredPath(item.path);
                    }}
                    onFocus={() => {
                      handleNavHover(item.path);
                      setHoveredPath(item.path);
                    }}
                    className={cn(
                      'relative px-3 2xl:px-4 py-2 text-xs 2xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap inline-flex items-center justify-center cursor-pointer select-none',
                      isTransparent
                        ? (isCurrent || isActive ? 'text-white font-bold' : 'text-white/80 hover:text-white')
                        : (isCurrent || isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600')
                    )}
                  >
                    <span className="relative z-10">{t(item.i18nKey)}</span>

                    {isCurrent && (
                      <motion.span
                        layoutId="navActiveIndicator"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 32,
                          mass: 0.8,
                        }}
                        className={cn(
                          "absolute -bottom-1 left-2.5 right-2.5 h-[3px] rounded-full z-10",
                          isTransparent
                            ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]"
                            : "bg-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.45)]"
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher isScrolled={isScrolled} isHome={isHome} />

            {/* Auth Dropdown or Login Button */}
            {isAuthenticated && user ? (
              <div ref={dropdownRef} className="relative hidden sm:block shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={cn(
                    'flex items-center gap-2 py-1.5 px-3 rounded-full text-sm font-medium transition-colors border border-transparent',
                    isTransparent
                      ? 'text-white bg-white/10 hover:bg-white/20'
                      : 'text-slate-800 bg-slate-100 hover:bg-slate-200'
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-sm text-slate-700 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        {t('nav.admin')}
                      </Link>
                    )}

                    <Link
                      href={`/${locale}/profile`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      {t('nav.profile')}
                    </Link>

                    <Link
                      href={`/${locale}/profile/bookings`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {t('nav.myBookings')}
                    </Link>

                    <Link
                      href={`/${locale}/cart`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-500" />
                      {t('nav.myCart')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                prefetch={true}
                className={cn(
                  'p-2 rounded-full transition-colors hover:bg-slate-100 hidden sm:flex shrink-0',
                  isTransparent ? 'text-white hover:bg-white/20' : 'text-slate-700'
                )}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            <Link
              href={`/${locale}/cart`}
              prefetch={true}
              className={cn(
                'p-2 rounded-full transition-colors hover:bg-slate-100 relative shrink-0',
                isTransparent ? 'text-white hover:bg-white/20' : 'text-slate-700'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className={cn(
                'p-2 rounded-full transition-colors hover:bg-slate-100 xl:hidden shrink-0',
                isTransparent ? 'text-white hover:bg-white/20' : 'text-slate-700'
              )}
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
